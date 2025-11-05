import os, json, duckdb, pandas as pd
from datetime import datetime, timedelta
from app.db import get_conn, ensure_raw_table
from app.utils.detect_industry import _ALIAS

# Base canonical fields and known aliases
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

# Memory file to store learned aliases
ALIAS_FILE = "./db/alias_memory.json"


def load_dynamic_aliases() -> None:
    """Merge saved dynamic aliases into CANONICAL."""
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
    """Persist learned aliases for future sessions."""
    os.makedirs(os.path.dirname(ALIAS_FILE), exist_ok=True)
    with open(ALIAS_FILE, "w") as f:
        json.dump(CANONICAL, f, indent=2)


def canonify_df(org_id: str, hours_window: int = 24) -> pd.DataFrame:
    """
    Normalizes raw_rows for a given org_id.
    - Loads only recent data (default last 24h)
    - Learns new aliases dynamically
    - Writes incremental DuckDB snapshot
    """
    load_dynamic_aliases()

    conn = get_conn(org_id)
    ensure_raw_table(conn)

    # ⏱ Load rows incrementally (last N hours)
    rows = conn.execute(
        "SELECT row_data FROM raw_rows WHERE datetime(json_extract(row_data, '$.timestamp')) >= datetime('now', ?)",
        (f"-{hours_window} hours",)
    ).fetchall() or conn.execute("SELECT row_data FROM raw_rows").fetchall()

    if not rows:
        return pd.DataFrame()

    raw = pd.DataFrame([json.loads(r[0]) for r in rows])
    raw.columns = raw.columns.str.lower().str.strip()

    # 🧩 Create flexible mapping using known + learned aliases
    mapping = {}
    for canon, aliases in CANONICAL.items():
        for col in raw.columns:
            if any(a in col for a in aliases):
                mapping[col] = canon
                break

    # Learn new alias names automatically
    for col in raw.columns:
        if col not in sum(CANONICAL.values(), []) and "_" in col:
            for canon in CANONICAL.keys():
                if canon in col and col not in CANONICAL[canon]:
                    CANONICAL[canon].append(col)
    save_dynamic_aliases()

    # ⚙️ Normalize only available columns (avoid KeyError)
    renamed = raw.rename(columns=mapping)
    cols = [c for c in CANONICAL.keys() if c in renamed.columns]
    df = renamed[cols].copy()

    # 🔢 Type coercions
    if "timestamp" in df:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    if "expiry_date" in df:
        df["expiry_date"] = pd.to_datetime(df["expiry_date"], errors="coerce").dt.date
    if "promo_flag" in df:
        df["promo_flag"] = df["promo_flag"].astype(str).isin({"1", "true", "t", "yes"})
    for col in ("qty", "total"):
        if col in df:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # 🪣 Write incremental snapshot to DuckDB
    os.makedirs("./db", exist_ok=True)
    duck = duckdb.connect(f"./db/{org_id}.duckdb")
    duck.execute("CREATE SCHEMA IF NOT EXISTS main")
    duck.execute("""
        CREATE TABLE IF NOT EXISTS main.canonical AS SELECT * FROM df LIMIT 0
    """)
    duck.execute("INSERT INTO main.canonical SELECT * FROM df")
    duck.close()

    return df
