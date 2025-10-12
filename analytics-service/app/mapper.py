from app.utils.detect_industry import _ALIAS
import pandas as pd, json, duckdb
from app.db import get_conn, ensure_raw_table

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

def canonify_df(org_id: str) -> pd.DataFrame:
    conn = get_conn(org_id)
    rows = conn.execute("SELECT row_data FROM raw_rows WHERE ingested_at >= now() - INTERVAL 6 HOUR").fetchall()
    if not rows:
        return pd.DataFrame()   # empty but shaped

    raw = pd.DataFrame([json.loads(r[0]) for r in rows])
    raw.columns = raw.columns.str.lower().str.strip()

    mapping = {}
    for canon, aliases in CANONICAL.items():
        for col in raw.columns:
            if any(a in col for a in aliases):
                mapping[col] = canon
                break

    df = raw.rename(columns=mapping)[CANONICAL.keys()].copy()
    # coerce dtypes
    if "timestamp" in df:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    if "expiry_date" in df:
        df["expiry_date"] = pd.to_datetime(df["expiry_date"], errors="coerce").dt.date
    if "promo_flag" in df:
        df["promo_flag"] = df["promo_flag"].astype(str).isin({"1", "true", "t", "yes"})
    numeric = ["qty", "total"]
    for col in numeric:
        if col in df:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    return df