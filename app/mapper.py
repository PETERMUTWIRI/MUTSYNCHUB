import os, json, duckdb, pandas as pd
from datetime import datetime
from app.db import get_conn, ensure_raw_table
from app.utils.detect_industry import _ALIAS


# ----------------------  Canonical schema base  ---------------------- #
CANONICAL = {
    "timestamp":  ["timestamp", "date", "sale_date", "created_at"],
    "product_id": ["sku", "barcode", "plu", "product_id", "item_code"],
    "qty":        ["qty", "quantity", "units", "pieces"],
    "total":      ["total", "amount", "line_total", "sales_amount"],
    "store_id":   ["store_id", "branch", "location", "outlet_id"],
    "category":   ["category", "department", "cat", "family"],
    "promo_flag": ["promo", "promotion", "is_promo", "discount_code"],
    "expiry_date":["expiry_date", "best_before", "use_by", "expiration"],
}

ALIAS_FILE = "./db/alias_memory.json"


# ----------------------  Alias memory helpers  ---------------------- #
def load_dynamic_aliases() -> None:
    """Load learned aliases and merge into CANONICAL."""
    if os.path.exists(ALIAS_FILE):
        try:
            with open(ALIAS_FILE) as f:
                dynamic_aliases = json.load(f)
            for k, v in dynamic_aliases.items():
                if k in CANONICAL:
                    for alias in v:
                        if alias not in CANONICAL[k]:
                            CANONICAL[k].append(alias)
                else:
                    CANONICAL[k] = v
        except Exception as e:
            print(f"[mapper] ⚠️ failed to load alias memory: {e}")


def save_dynamic_aliases() -> None:
    """Persist learned aliases for next runs."""
    os.makedirs(os.path.dirname(ALIAS_FILE), exist_ok=True)
    with open(ALIAS_FILE, "w") as f:
        json.dump(CANONICAL, f, indent=2)


# ----------------------  Schema versioning helpers  ---------------------- #
def ensure_schema_version(duck, df: pd.DataFrame) -> str:
    """
    Ensure schema versioning and track evolution.
    Returns the active canonical table name (e.g., main.canonical_v2).
    """
    duck.execute("CREATE SCHEMA IF NOT EXISTS main")
    duck.execute("""
        CREATE TABLE IF NOT EXISTS main.schema_versions (
            version INTEGER PRIMARY KEY,
            columns JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    latest = duck.execute("SELECT * FROM main.schema_versions ORDER BY version DESC LIMIT 1").fetchone()
    new_signature = sorted(df.columns.tolist())

    if latest:
        latest_cols = sorted(json.loads(latest[1]))
        if latest_cols == new_signature:
            return f"main.canonical_v{latest[0]}"
        else:
            new_version = latest[0] + 1
            duck.execute("INSERT INTO main.schema_versions (version, columns) VALUES (?, ?)",
                         (new_version, json.dumps(new_signature)))
            print(f"[schema] → new version detected: canonical_v{new_version}")
            return f"main.canonical_v{new_version}"
    else:
        duck.execute("INSERT INTO main.schema_versions (version, columns) VALUES (?, ?)",
                     (1, json.dumps(new_signature)))
        print("[schema] → initialized canonical_v1")
        return "main.canonical_v1"


def reconcile_latest_schema(duck):
    """
    Merge all canonical_v* tables into main.canonical_latest
    preserving new columns and filling missing values with NULL.
    """
    tables = [r[0] for r in duck.execute("""
        SELECT table_name FROM information_schema.tables
        WHERE table_name LIKE 'canonical_v%'
    """).fetchall()]
    if not tables:
        return

    union_query = " UNION ALL ".join([f"SELECT * FROM {t}" for t in tables])
    duck.execute("CREATE OR REPLACE TABLE main.canonical_latest AS " + union_query)
    print(f"[schema] ✅ reconciled {len(tables)} schema versions → canonical_latest")


# ----------------------  Canonify core logic  ---------------------- #
def canonify_df(org_id: str, hours_window: int = 24) -> pd.DataFrame:
    """
    Normalize, version, and persist canonical data snapshot for org_id.
    """
    load_dynamic_aliases()
    conn = get_conn(org_id)
    ensure_raw_table(conn)

    # ⏱ Load recent rows (or fallback to all if none recent)
    rows = conn.execute(
        "SELECT row_data FROM raw_rows WHERE datetime(json_extract(row_data, '$.timestamp')) >= datetime('now', ?)",
        (f"-{hours_window} hours",)
    ).fetchall() or conn.execute("SELECT row_data FROM raw_rows").fetchall()

    if not rows:
        print("[canonify] no rows to process")
        return pd.DataFrame()

    raw = pd.DataFrame([json.loads(r[0]) for r in rows])
    raw.columns = raw.columns.str.lower().str.strip()

    # 🧩 Flexible alias mapping
    mapping = {}
    for canon, aliases in CANONICAL.items():
        for col in raw.columns:
            if any(a in col for a in aliases):
                mapping[col] = canon
                break

    # 🧠 Learn new aliases dynamically
    for col in raw.columns:
        if col not in sum(CANONICAL.values(), []):
            for canon in CANONICAL.keys():
                if canon in col and col not in CANONICAL[canon]:
                    CANONICAL[canon].append(col)
    save_dynamic_aliases()

    renamed = raw.rename(columns=mapping)
    cols = [c for c in CANONICAL.keys() if c in renamed.columns]
    df = renamed[cols].copy()

    # 🔢 Normalize datatypes
    if "timestamp" in df:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    if "expiry_date" in df:
        df["expiry_date"] = pd.to_datetime(df["expiry_date"], errors="coerce").dt.date
    if "promo_flag" in df:
        df["promo_flag"] = df["promo_flag"].astype(str).isin({"1", "true", "t", "yes"})
    for col in ("qty", "total"):
        if col in df:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # 🪣 Schema versioning + storage
    os.makedirs("./db", exist_ok=True)
    duck = duckdb.connect(f"./db/{org_id}.duckdb")

    table_name = ensure_schema_version(duck, df)
    duck.execute(f"CREATE TABLE IF NOT EXISTS {table_name} AS SELECT * FROM df LIMIT 0")
    duck.execute(f"INSERT INTO {table_name} SELECT * FROM df")

    # 🧩 Always refresh canonical_latest for unified analytics
    reconcile_latest_schema(duck)
    duck.close()

    return df
