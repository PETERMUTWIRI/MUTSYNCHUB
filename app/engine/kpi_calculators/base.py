"""
🛡️ Universal Base KPI Calculator
Enterprise Pattern: Async, fault-tolerant, LLM-guarded, schema-aware
"""

import pandas as pd
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import asyncio
import json
from app.schemas.org_schema import OrgSchema
from app.service.llm_service import get_llm_service

logger = logging.getLogger(__name__)


class BaseKPICalculator(ABC):
    """
    🏛️ Enterprise Base Class
    - Async-ready
    - LLM-guarded (won't crash if LLM not loaded)
    - Schema-aware with dynamic mapping
    - Comprehensive error handling
    """
    
    def __init__(self, org_id: str, df: pd.DataFrame, source_id: Optional[str] = None, entity_type: str = "SALES"):
        """
        ✅ Universal constructor - all parameters optional except org_id and df
    
        Args:
            org_id: Organization ID (required)
            df: DataFrame to analyze (required)
            source_id: Optional source identifier for tracking
            entity_type: Entity type from Redis (e.g., "SALES", "INVENTORY")
        """
        if not org_id or df.empty:
            raise ValueError("org_id and non-empty df required")
        
        self.org_id = org_id
        self.source_id = source_id
        self.df = df.copy()  # Defensive copy to prevent mutation
        self.entity_type = entity_type  # ✅ Store entity_type
    
        # ✅ FIXED: Pass entity_type to OrgSchema
        self.schema = OrgSchema(org_id=org_id, entity_type=entity_type)
        self.llm = get_llm_service()
        self.computed_at = datetime.utcnow()
        self._cache: Dict[str, Any] = {}  # In-memory cache for this run
    
        logger.info(f"[KPI] 📊 {self.__class__.__name__} initialized for {org_id}/{entity_type} ({len(df)} rows)")
    @abstractmethod
    async def compute_all(self) -> Dict[str, Any]:
        """
        🎯 Main entry point - **MUST BE ASYNC** for LLM calls
        
        Returns:
            Complete KPI dictionary with metadata
        """
        pass
    
    def _safe_calc(
        self, 
        semantic_field: str, 
        operation: str, 
        default: Any = 0.0,
        fallback_field: Optional[str] = None
    ) -> Any:
        """
        🔒 **Enterprise-safe calculation** with multiple fallback strategies
        
        Args:
            semantic_field: Semantic field name (e.g., "total")
            operation: pandas operation ("sum", "mean", "nunique", etc.)
            default: Default value if calculation fails
            fallback_field: Secondary field to try if primary fails
        
        Returns:
            Scalar result or default
        """
        try:
            # Primary field resolution
            actual_col = self.schema.get_column(semantic_field)
            
            if actual_col and actual_col in self.df.columns:
                series = self.df[actual_col]
                
                # Handle different operation types
                if operation == "nunique":
                    return int(series.nunique())
                elif operation == "count":
                    return int(series.count())
                elif operation == "sum":
                    return float(series.sum())
                elif operation == "mean":
                    return float(series.mean())
                elif operation == "max":
                    return float(series.max())
                elif operation == "min":
                    return float(series.min())
                elif operation == "std":
                    return float(series.std())
                else:
                    logger.warning(f"[KPI] Unknown operation: {operation}")
                    return default
            
            # Fallback field if provided
            if fallback_field and fallback_field in self.df.columns:
                logger.info(f"[KPI] Fallback to {fallback_field} for {semantic_field}")
                return getattr(self.df[fallback_field], operation, lambda: default)()
            
            logger.warning(f"[KPI] Field '{semantic_field}' not found, returning default: {default}")
            return default
            
        except Exception as e:
            logger.error(f"[KPI] Calculation failed for '{semantic_field}.{operation}': {e}")
            return default
    
    def _cache_value(self, key: str, value: Any, ttl: int = 3600):
        """
        💾 Cache value in Redis for cross-worker sharing
        
        Args:
            key: Cache key (will be prefixed with org_id)
            value: Value to cache (must be JSON-serializable)
            ttl: Time-to-live in seconds
        """
        try:
            from app.core.event_hub import event_hub
            cache_key = f"kpi_cache:{self.org_id}:{key}"
            event_hub.setex(cache_key, ttl, json.dumps(value))
        except Exception as e:
            logger.warning(f"[KPI] Cache write failed: {e}")
    
    def _get_cached_value(self, key: str, default: Any = None) -> Any:
        """
        📖 Retrieve cached value from Redis
        
        Args:
            key: Cache key (without prefix)
            default: Default value if cache miss
            
        Returns:
            Cached value or default
        """
        try:
            from app.core.event_hub import event_hub
            cache_key = f"kpi_cache:{self.org_id}:{key}"
            data = event_hub.get_key(cache_key)
            
            if data:
                return json.loads(data)
            return default
            
        except Exception as e:
            logger.warning(f"[KPI] Cache read failed: {e}")
            return default
    
    def _calculate_growth(self, current: float, previous: float) -> float:
        """
        📈 Safe growth calculation with divide-by-zero protection
        
        Args:
            current: Current period value
            previous: Previous period value
            
        Returns:
            Growth percentage or 0.0 if invalid
        """
        try:
            if previous and previous > 0:
                return float((current - previous) / previous * 100)
            return 0.0
        except Exception:
            return 0.0
    
    async def _llm_generate_safe(self, prompt: str, max_tokens: int = 50) -> Optional[str]:
        """
        🤖 **LLM-guarded generation** - won't crash if LLM not ready
        
        Args:
            prompt: Prompt for LLM
            max_tokens: Max tokens to generate
            
        Returns:
            Generated text or None if LLM unavailable
        """
        try:
            if not self.llm.is_ready():
                logger.warning("[KPI] LLM not ready, skipping AI tier")
                return None
            
            return await asyncio.to_thread(
                self.llm.generate, 
                prompt, 
                max_tokens=max_tokens
            )
        except Exception as e:
            logger.warning(f"[KPI] LLM generation failed: {e}")
            return None
    
    def _validate_data_quality(self) -> List[Dict[str, Any]]:
        """
        🔍 **Enterprise data quality check**
        
        Returns:
            List of quality issues with severity levels
        """
        issues = []
        
        # Check for missing timestamps
        if 'timestamp' in self.df.columns:
            missing_ts = self.df['timestamp'].isna().sum()
            if missing_ts > 0:
                issues.append({
                    "field": "timestamp",
                    "issue": "missing_values",
                    "count": int(missing_ts),
                    "severity": "high" if missing_ts > len(self.df) * 0.1 else "medium"
                })
        
        # Check for negative totals
        if 'total' in self.df.columns:
            negative_sales = (self.df['total'] < 0).sum()
            if negative_sales > 0:
                issues.append({
                    "field": "total",
                    "issue": "negative_values",
                    "count": int(negative_sales),
                    "severity": "medium"
                })
        
        return issues