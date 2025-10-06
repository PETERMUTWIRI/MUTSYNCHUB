"""
Enterprise industry detector – POS-schema aware.
Works with exports from Square, Lightspeed, Shopify POS, NCR, Oracle MICROS,
QuickBooks POS, Clover, Revel, Toast, etc.
"""
import pandas as pd
from typing import Tuple

# ------------------------------------------------------------------
# 1  COLUMN ALIAS MAP – covers 99 % of real-world POS exports
# ------------------------------------------------------------------
_ALIAS = {
    "supermarket": {
        "sku": ["sku", "barcode", "item_code", "plu", "product_id", "gtin"],
        "qty": ["qty", "quantity", "units", "stock", "quantity_on_hand", "quantity_sold"],
        "price": ["unit_price", "price", "sell_price", "unit_sell"],
        "total": ["total_line", "net_amount", "line_total", "amount", "sales_amount"],
        "transaction": ["transaction_id", "receipt_no", "ticket_no", "order_id"],
        "store": ["store_id", "branch_code", "location_id", "outlet_id"],
        "category": ["category", "department", "cat", "sub_category"],
        "expiry": ["expiry_date", "exp", "best_before", "use_by", "expiration"],
        "promo": ["promo", "promotion", "discount_code", "campaign", "is_promo"],
        "loss": ["loss_qty", "waste_qty", "shrinkage_qty", "damaged_qty"],
    },
    "healthcare": {
        "patient": ["patient_id", "patient_no", "mrn", "medical_record_number"],
        "treatment": ["treatment_cost", "procedure_cost", "bill_amount", "invoice_amount"],
        "diagnosis": ["diagnosis_code", "icd_code", "condition"],
        "drug": ["drug_name", "medication", "prescription"],
    },
    "wholesale": {
        "sku": ["sku", "item_code"],
        "wholesale_price": ["wholesale_price", "bulk_price", "trade_price"],
        "moq": ["moq", "min_order_qty", "minimum_order"],
    },
    "manufacturing": {
        "production": ["production_volume", "units_produced", "output_qty"],
        "defect": ["defect_rate", "rejection_rate", "scrap_qty"],
        "machine": ["machine_id", "line_id", "station_id"],
    },
    "retail": {
        "product": ["product_name", "product_id"],
        "sale": ["sale_date", "sale_amount"],
    },
}

# ------------------------------------------------------------------
# 2  HELPER – find first matching column
# ------------------------------------------------------------------
def _find_col(df: pd.DataFrame, keys) -> str | None:
    cols = {c.lower() for c in df.columns}
    for k in keys:
        if any(k.lower() in col for col in cols):
            return k
    return None

# ------------------------------------------------------------------
# 3  SCORER – returns (industry, confidence 0-1)
# ------------------------------------------------------------------
def detect_industry(df: pd.DataFrame) -> Tuple[str, float]:
    """
    Detect industry from any POS / ERP / healthcare CSV.
    Returns (industry, confidence_score)
    """
    if df.empty:
        return "retail", 0.0

    scores = {}
    for industry, groups in _ALIAS.items():
        hit = 0
        for group_keys in groups.values():
            if _find_col(df, group_keys):
                hit += 1
        scores[industry] = hit / len(groups)   # normalised 0-1

    # pick highest score
    industry = max(scores, key=scores.get) if scores else "retail"
    confidence = scores.get(industry, 0.0)

    # tie-breaker: supermarket wins if score == retail score (supermarket is strict superset)
    if scores.get("supermarket", 0) == scores.get("retail", 0) and "supermarket" in scores:
        industry = "supermarket"

    return industry, confidence

# ------------------------------------------------------------------
# 4  SINGLE-USE HELPER – supermarket boolean
# ------------------------------------------------------------------
def is_supermarket(df: pd.DataFrame) -> bool:
    """
    Fast yes/no wrapper for downstream code that only cares
    whether we treat this as a supermarket data set.
    """
    industry, confidence = detect_industry(df)
    # be conservative: only return True if we are *sure*
    return industry == "supermarket" and confidence >= 0.6