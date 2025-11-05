import duckdb, os, pathlib, json
from datetime import datetime
from typing import Any, Dict, List

DB_DIR = pathlib.Path("./data/duckdb")
DB_DIR.mkdir(parents=True, exist_ok=True)


def get_conn(org_id: str):
    """Get or create a DuckDB connection for an organization."""
    db_file = DB_DIR / f"{org_id}.duckdb"
    return duckdb.connect(str(db_file), read_only=False)


def ensure_table(conn, table_name: str, sample_record: Dict[str, Any]):
    """
    Ensures a DuckDB table exists with columns inferred from sample_record.
    If new columns appear later, adds them automatically.
    """
    conn.execute("CREATE SCHEMA IF NOT EXISTS main")
    conn.execute(f"CREATE TABLE IF NOT EXISTS main.{table_name} (id UUID DEFAULT uuid(), _ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")

    if not sample_record:
        return

    existing_cols = {r[0] for r in conn.execute(f"PRAGMA table_info('main.{table_name}')").fetchall()}

    for col, val in sample_record.items():
        if col in existing_cols:
            continue

        dtype = infer_duckdb_type(val)
        print(f"[db] ➕ Adding new column '{col}:{dtype}' to main.{table_name}")
        conn.execute(f"ALTER TABLE main.{table_name} ADD COLUMN {col} {dtype}")


def infer_duckdb_type(value: Any) -> str:
    """Infer a DuckDB-compatible column type from a Python value."""
    if isinstance(value, bool):
        return "BOOLEAN"
    if isinstance(value, (int, float)):
        return "DOUBLE"
    if isinstance(value, datetime):
        return "TIMESTAMP"
    if isinstance(value, dict) or isinstance(value, list):
        return "JSON"
    return "VARCHAR"


def insert_records(conn, table_name: str, records: List[Dict[str, Any]]):
    """
    Insert records into the specified table.
    Assumes ensure_table() has already been called.
    """
    if not records:
        return

    cols = records[0].keys()
    placeholders = ", ".join(["?"] * len(cols))
    col_list = ", ".join(cols)
    insert_sql = f"INSERT INTO main.{table_name} ({col_list}) VALUES ({placeholders})"

    values = [tuple(r.get(c) for c in cols) for r in records]
    conn.executemany(insert_sql, values)
    print(f"[db] ✅ Inserted {len(records)} rows into {table_name}")


def bootstrap(org_id: str, payload: Dict[str, Any]):
    """
    Main entrypoint for ingestion.
    Detects whether the payload contains:
      - A single table (list of dicts)
      - Multiple named tables (dict of lists)
    """
    conn = get_conn(org_id)
    conn.execute("CREATE SCHEMA IF NOT EXISTS main")

    if isinstance(payload, dict) and "tables" in payload:
        # multi-table mode
        for table_name, rows in payload["tables"].items():
            if not rows:
                continue
            ensure_table(conn, table_name, rows[0])
            insert_records(conn, table_name, rows)
    elif isinstance(payload, list):
        # single-table mode (assume 'sales' as default)
        ensure_table(conn, "sales", payload[0])
        insert_records(conn, "sales", payload)
    else:
        print("[db] ⚠️ Unsupported payload shape")

    conn.close()
