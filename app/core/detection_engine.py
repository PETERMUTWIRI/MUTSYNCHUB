"""
app/core/detection_engine.py – UNIVERSAL DETECTION ENGINE
=======================================================

Consolidated entity and industry detection with dual-mode (LLM + rule-based).

Functions:
- hybrid_detect_entity_type()
- hybrid_detect_industry_type()
- Redis caching helpers
- Prometheus metrics
- Zero circular dependencies
"""

import json
import logging
import pandas as pd
from typing import Tuple, Optional, Dict, Any
from datetime import datetime
import time
from app.core.event_hub import event_hub
from app.service.llm_service import get_llm_service

# ✅ RULE-BASED IMPORTS (both in one place)
from app.entity_detector import detect_entity_type as rule_based_entity
from app.utils.detect_industry import detect_industry as rule_based_industry

from app.core.sre_logging import emit_mapper_log

# SRE: Prometheus metrics
try:
    from prometheus_client import Counter, Histogram
    detection_latency = Histogram(
        'detection_duration_seconds',
        'Time to detect entity/industry',
        ['detection_type', 'org_id']
    )
    detection_errors = Counter(
        'detection_errors_total',
        'Total detection failures',
        ['detection_type', 'org_id', 'error_type']
    )
except ImportError:
    detection_latency = None
    detection_errors = None

logger = logging.getLogger(__name__)


# ====================================================================
# 🎯 ENTITY TYPE DETECTION
# ====================================================================

def hybrid_detect_entity_type(org_id: str, df: pd.DataFrame, source_id: str, 
                             use_llm: bool = False) -> Tuple[str, float, bool]:
    """
    Detect entity_type (SALES, INVENTORY, CUSTOMER, PRODUCT, etc.)
    
    Args:
        org_id: Organization ID
        df: DataFrame to analyze
        source_id: Source identifier
        use_llm: If True, use LLM fallback when confidence < 0.75
    
    Returns:
        (entity_type: str, confidence: float, is_confident: bool)
    """
    start_time = time.time()
    emit_mapper_log("info", "Entity detection started", 
                   org_id=org_id, source_id=source_id, use_llm=use_llm)
    
    # 1. Rule-based detection (ALWAYS runs first – <10ms)
    entity_type, confidence = rule_based_entity(df)
    entity_type = entity_type.upper()
    
    emit_mapper_log("info", "Rule-based entity completed", 
                   org_id=org_id, source_id=source_id, 
                   entity_type=entity_type, confidence=confidence)
    
    # 2. If confident OR LLM disabled, return immediately
    if confidence > 0.75 or not use_llm:
        return entity_type, confidence, True
    
    # 3. LLM fallback (only when use_llm=True and confidence < 0.75)
    try:
        emit_mapper_log("info", "Entity LLM fallback required", 
                       org_id=org_id, source_id=source_id, rule_confidence=confidence)
        
        llm = get_llm_service()
        if not llm.is_ready():
            emit_mapper_log("warning", "LLM not ready, using rule-based entity", 
                           org_id=org_id, source_id=source_id)
            return entity_type, confidence, False
        
        # Build prompt
        columns_str = ",".join(df.columns)
        prompt = f"""Analyze these column names and determine the business entity type:

Columns: {columns_str}

Return ONLY JSON:
{{"entity_type":"SALES|INVENTORY|CUSTOMER|PRODUCT","confidence":0.95}}"""
        
        # Generate with LLM
        response = llm.generate(prompt, max_tokens=50, temperature=0.1)
        result = json.loads(response)
        
        llm_entity = result["entity_type"].upper()
        llm_confidence = float(result["confidence"])
        
        emit_mapper_log("info", "Entity LLM completed", 
                       org_id=org_id, source_id=source_id, 
                       llm_entity=llm_entity, llm_confidence=llm_confidence)
        
        # Use LLM result if more confident
        if llm_confidence > confidence:
            return llm_entity, llm_confidence, True
        
        return entity_type, confidence, False
        
    except Exception as e:
        emit_mapper_log("error", "Entity LLM fallback failed", 
                       org_id=org_id, source_id=source_id, error=str(e))
        
        if detection_errors:
            detection_errors.labels(detection_type="entity", org_id=org_id, error_type=type(e).__name__).inc()
        
        return entity_type, confidence, False


# ====================================================================
# 🎯 INDUSTRY TYPE DETECTION
# ====================================================================

def hybrid_detect_industry_type(org_id: str, df: pd.DataFrame, source_id: str,
                               use_llm: bool = False) -> Tuple[str, float, bool]:
    """
    Detect industry vertical (SUPERMARKET, MANUFACTURING, PHARMA, RETAIL, WHOLESALE, HEALTHCARE)
    
    Args:
        org_id: Organization ID
        df: DataFrame to analyze
        source_id: Source identifier
        use_llm: If True, enhance with LLM when confidence < 0.75
    
    Returns:
        (industry: str, confidence: float, is_confident: bool)
    """
    start_time = time.time()
    emit_mapper_log("info", "Industry detection started", 
                   org_id=org_id, source_id=source_id, use_llm=use_llm)
    
    # ✅ RULE-BASED DETECTION (always runs first – <10ms)
    industry, confidence = rule_based_industry(df)
    industry = industry.upper()
    
    emit_mapper_log("info", "Rule-based industry completed", 
                   org_id=org_id, source_id=source_id, 
                   industry=industry, confidence=confidence)
    
    # 2. If confident OR LLM disabled, return immediately
    if confidence > 0.75 or not use_llm:
        return industry, confidence, True
    
    # 3. LLM fallback
    try:
        emit_mapper_log("info", "Industry LLM fallback required", 
                       org_id=org_id, source_id=source_id, rule_confidence=confidence)
        
        llm = get_llm_service()
        if not llm.is_ready():
            emit_mapper_log("warning", "LLM not ready for industry", 
                           org_id=org_id, source_id=source_id)
            return industry, confidence, False
        
        # Industry-specific prompt with sample data
        columns_str = ",".join(df.columns)
        sample_data = df.head(3).to_dict(orient="records")
        
        prompt = f"""Analyze this dataset and determine the business industry vertical:

Columns: {columns_str}
Sample rows: {json.dumps(sample_data)}

Return ONLY JSON:
{{"industry":"SUPERMARKET|MANUFACTURING|PHARMA|RETAIL|WHOLESALE|HEALTHCARE","confidence":0.95}}"""
        
        response = llm.generate(prompt, max_tokens=50, temperature=0.1)
        result = json.loads(response)
        
        llm_industry = result["industry"].upper()
        llm_confidence = float(result["confidence"])
        
        emit_mapper_log("info", "Industry LLM completed", 
                       org_id=org_id, source_id=source_id, 
                       llm_industry=llm_industry, llm_confidence=llm_confidence)
        
        if llm_confidence > confidence:
            return llm_industry, llm_confidence, True
        
        return industry, confidence, False
        
    except Exception as e:
        emit_mapper_log("error", "Industry LLM fallback failed", 
                       org_id=org_id, source_id=source_id, error=str(e))
        
        if detection_errors:
            detection_errors.labels(detection_type="industry", org_id=org_id, error_type=type(e).__name__).inc()
        
        return industry, confidence, False


# ====================================================================
# 🔧 REDIS CACHE HELPERS (Shared by both)
# ====================================================================

def get_cached_detection(org_id: str, source_id: str, detection_type: str) -> Optional[Dict[str, Any]]:
    """
    Check Redis for cached detection result
    
    Args:
        detection_type: "entity" or "industry"
    
    Returns:
        {"type": str, "confidence": float, "cached": True} or None
    """
    key = f"{detection_type}:{org_id}:{source_id}"
    cached = event_hub.get_key(key)
    
    if cached:
        data = json.loads(cached)
        data["cached"] = True
        return data
    
    return None


def cache_detection(org_id: str, source_id: str, detection_type: str, 
                   value: str, confidence: float):
    """Store detection result in Redis with 1-hour TTL"""
    key = f"{detection_type}:{org_id}:{source_id}"
    
    event_hub.setex(key, 3600, json.dumps({
        "type": value,
        "confidence": confidence,
        "cached_by": "detection_engine",
        "cached_at": datetime.utcnow().isoformat()
    }))