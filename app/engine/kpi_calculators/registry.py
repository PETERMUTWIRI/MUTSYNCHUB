"""
🏭 KPI Calculator Factory Registry
Enterprise Pattern: Zero-bias, fault-tolerant, async-ready
- Supports dynamic entity_type injection from Redis
- Backward compatible with legacy calculators
- Async interface for non-blocking instantiation
"""

import logging
import asyncio
from typing import Type, Dict, Any, Optional
import pandas as pd
from app.engine.kpi_calculators.supermarket import SupermarketKPICalculator
from app.engine.kpi_calculators.retail import RetailKPICalculator
from app.engine.kpi_calculators.hospitality import HospitalityKPICalculator
from app.engine.kpi_calculators.generic import GenericKPICalculator

logger = logging.getLogger(__name__)

# Zero-bias registry - industry → calculator mapping
KPI_CALCULATORS: Dict[str, Type] = {
    "supermarket": SupermarketKPICalculator,
    "retail": RetailKPICalculator,
    "hospitality": HospitalityKPICalculator,
    "restaurant": HospitalityKPICalculator,
    "default": GenericKPICalculator,
}

def get_kpi_calculator(
    industry: str, 
    org_id: str, 
    df: pd.DataFrame, 
    source_id: Optional[str] = None,
    entity_type: str = "SALES"  # ✅ NEW: Injected from Redis
) -> Any:
    """
    🎯 Factory - gets calculator for any industry with fault tolerance
    
    Args:
        industry: Industry name (e.g., "supermarket")
        org_id: Organization ID
        df: DataFrame to analyze
        source_id: Optional source identifier
        entity_type: Entity type from Redis (e.g., "SALES", "INVENTORY")
    
    Returns:
        Instantiated calculator class
    
    Raises:
        ValueError: If df is empty or org_id missing
        TypeError: If calculator instantiation fails
    """
    if not org_id or df.empty:
        raise ValueError("org_id and non-empty df required")
    
    # Normalize industry name
    industry_key = industry.lower().strip() if industry else "default"
    calculator_class = KPI_CALCULATORS.get(industry_key, KPI_CALCULATORS["default"])
    
    logger.info(f"[KPI] 🎯 {calculator_class.__name__} for {org_id}/{entity_type} ({industry_key})")
    
    # ✅ **Universal constructor** - handles all signature variations
    try:
        # Modern signature with entity_type
        return calculator_class(
            org_id=org_id, 
            df=df, 
            source_id=source_id,
            entity_type=entity_type
        )
    except TypeError as e:
        if "entity_type" in str(e):
            # Legacy calculator without entity_type support
            logger.warning(f"[KPI] {calculator_class.__name__} legacy signature: {e}")
            try:
                return calculator_class(org_id=org_id, df=df, source_id=source_id)
            except TypeError:
                # Ultra-legacy: only org_id and df
                logger.warning(f"[KPI] {calculator_class.__name__} ultra-legacy signature")
                return calculator_class(org_id=org_id, df=df)
        else:
            # Unexpected error
            logger.error(f"[KPI] Unexpected instantiation error: {e}")
            raise

# Async version for non-blocking instantiation
async def get_kpi_calculator_async(
    industry: str, 
    org_id: str, 
    df: pd.DataFrame, 
    source_id: Optional[str] = None,
    entity_type: str = "SALES"  # ✅ NEW: Async version also accepts entity_type
) -> Any:
    """
    🎯 Async factory - non-blocking calculator instantiation
    
    Args:
        Same as get_kpi_calculator
    
    Returns:
        Instantiated calculator class
    
    Usage:
        calculator = await get_kpi_calculator_async(...)
    """
    return await asyncio.to_thread(
        get_kpi_calculator, 
        industry, 
        org_id, 
        df, 
        source_id,
        entity_type
    )