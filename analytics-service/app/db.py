import duckdb, os, pathlib

DB_DIR = pathlib.Path("./data/duckdb")
DB_DIR.mkdir(exist_ok=True)
DB_DIR.parent.mkdir(exist_ok=True)   # ensure ./data exists

def get_conn(org_id: str):
    db_file = DB_DIR / f"{org_id}.duckdb"
    return duckdb.connect(str(db_file))

def bootstrap(org_id: str):
    conn = get_conn(org_id)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sales(
            timestamp TIMESTAMP,
            product_id VARCHAR,
            qty INTEGER,
            total DOUBLE,
            store_id VARCHAR,
            category VARCHAR,
            promo_flag BOOLEAN,
            expiry_date DATE
        )
    """)
    conn.close()

def ensure_kpi_log(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS kpi_log(
            ts          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            daily_sales DOUBLE,
            daily_qty   BIGINT,
            avg_basket  DOUBLE,
            shrinkage   DOUBLE,
            promo_lift  DOUBLE,
            stock       BIGINT
        )
    """)

def ensure_raw_table(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS raw_rows(
            ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            row_data    JSON     -- every column, any name
        )
    """)