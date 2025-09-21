import pandas as pd

def detect_industry(df: pd.DataFrame) -> str:
    cols = set(df.columns)
    if {"product_id", "qty", "price", "total"}.issubset(cols): return "supermarket"
    if {"sku", "wholesale_price", "retail_price"}.issubset(cols): return "wholesale"
    if {"patient_id", "treatment_cost"}.issubset(cols): return "healthcare"
    return "retail"
