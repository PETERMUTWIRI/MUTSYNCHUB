# app/entity_detector.py
import pandas as pd
from typing import Tuple

# Entity-specific canonical schemas
ENTITY_SCHEMAS = {
    "sales": {
        "indicators": ["timestamp", "total", "amount", "qty", "quantity", "sale_date", "transaction_id"],
        "required_matches": 2,
        "aliases": {
            "timestamp": ["timestamp", "date", "sale_date", "created_at", "transaction_time"],
            "product_id": ["sku", "barcode", "plu", "product_id", "item_code"],
            "qty": ["qty", "quantity", "units", "pieces", "item_count"],
            "total": ["total", "amount", "line_total", "sales_amount", "price"],
            "store_id": ["store_id", "branch", "location", "outlet_id", "branch_code"],
        }
    },
    "inventory": {
        "indicators": ["stock", "quantity_on_hand", "reorder", "inventory", "current_stock", "warehouse_qty"],
        "required_matches": 2,
        "aliases": {
            "product_id": ["sku", "barcode", "plu", "product_id", "item_code"],
            "current_stock": ["stock", "quantity_on_hand", "qty_available", "current_quantity"],
            "reorder_point": ["reorder_level", "min_stock", "reorder_point", "threshold"],
            "supplier_id": ["supplier", "supplier_id", "vendor", "vendor_code"],
            "last_stock_date": ["last_stock_date", "last_receipt", "last_updated"],
        }
    },
    "customer": {
        "indicators": ["customer_id", "email", "phone", "customer_name", "client_id", "loyalty_number"],
        "required_matches": 2,
        "aliases": {
            "customer_id": ["customer_id", "client_id", "member_id", "loyalty_number", "phone"],
            "full_name": ["customer_name", "full_name", "name", "client_name"],
            "email": ["email", "email_address", "e_mail"],
            "phone": ["phone", "phone_number", "mobile", "contact"],
        }
    },
    "product": {
        "indicators": ["product_name", "product_id", "sku", "category", "price", "cost", "unit_of_measure"],
        "required_matches": 2,
        "aliases": {
            "product_id": ["sku", "barcode", "plu", "product_id", "item_code"],
            "product_name": ["product_name", "name", "description", "item_name"],
            "category": ["category", "department", "cat", "family", "classification"],
            "unit_price": ["price", "unit_price", "selling_price", "retail_price"],
            "cost_price": ["cost", "cost_price", "purchase_price", "wholesale_price"],
        }
    }
}

def detect_entity_type(df: pd.DataFrame) -> Tuple[str, float]:
    """
    AUTO-DETECT entity type from DataFrame columns.
    Returns: (entity_type, confidence_score)
    """
    columns = {str(col).lower().strip() for col in df.columns}
    
    scores = {}
    for entity_type, config in ENTITY_SCHEMAS.items():
        # Count matches between DataFrame columns and entity indicators
        matches = sum(
            1 for indicator in config["indicators"] 
            if any(indicator in col for col in columns)
        )
        
        # Calculate confidence (0.0 to 1.0)
        confidence = min(matches / config["required_matches"], 1.0)
        scores[entity_type] = confidence
    
    # Return best match if confident enough
    if scores:
        best_entity = max(scores, key=scores.get)
        confidence = scores[best_entity]
        
        if confidence > 0.3:  # 30% threshold
            return best_entity, confidence
    
    # Default to sales if uncertain (most common)
    return "sales", 0.0