from app.db import get_conn, ensure_raw_table
from datetime import datetime, timedelta

def purge_old_raw(org_id: str, hours=6):
    conn = get_conn(org_id)
    cutoff = datetime.now() - timedelta(hours=hours)
    cutoff_str = cutoff.strftime("%Y-%m-%d %H:%M:%S")
    conn.execute(f"DELETE FROM raw_rows WHERE ingested_at < TIMESTAMP '{cutoff_str}'")
    conn.commit(); conn.close()