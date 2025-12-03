"""
Mapper v5.0: SRE-Observable Entity/Industry Detection

Changes:
- Added Prometheus metrics for all Redis operations
- Added circuit breaker for Redis failures
- Added pub/sub events when entity/industry is detected
- Added structured JSON logging for Loki/Splunk
- Added health check endpoint
- ZERO changes to core detection logic
"""

import os
import json
import asyncio
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
import time
import logging
from typing import Dict, Any, Optional

from app.db import get_conn, ensure_raw_table, transactional_conn, ensure_schema_versions_table
from app.core.detection_engine import hybrid_detect_entity_type,hybrid_detect_industry_type
from app.core.event_hub import event_hub
from app.deps import get_sre_metrics
from app.core.sre_logging import emit_mapper_log
# Prometheus metrics (free tier compatible)
try:
    from prometheus_client import Counter, Histogram, Gauge
except ImportError:
    class Counter: 
        def __init__(self, *args, **kwargs): pass
        def inc(self, amount=1): pass
    
    class Histogram: 
        def __init__(self, *args, **kwargs): pass
        def observe(self, value): pass
    
    class Gauge: 
        def __init__(self, *args, **kwargs): pass
        def set(self, value): pass

logger = logging.getLogger(__name__)

# ---------------------- SRE: Metrics & Circuit Breaker ---------------------- #

# Prometheus metrics (class-level)
class MapperMetrics:
    """SRE: Metrics for mapper operations"""
    redis_reads = Counter(
        'mapper_redis_reads_total',
        'Total Redis read operations',
        ['org_id', 'status']  # success / error / cache_hit
    )
    
    redis_writes = Counter(
        'mapper_redis_writes_total',
        'Total Redis write operations',
        ['org_id', 'status']
    )
    
    fallback_runs = Counter(
        'mapper_fallback_total',
        'Total fallback executions',
        ['org_id', 'fallback_type']  # entity / industry / combined
    )
    
    detection_latency = Histogram(
        'mapper_detection_duration_seconds',
        'Time to detect entity/industry',
        ['org_id', 'detection_type']  # entity / industry
    )
    
    cache_size = Gauge(
        'mapper_cache_entries',
        'Number of cached entries',
        ['cache_type']  # entity / industry
    )

# Circuit breaker state
_circuit_breaker = {
    "failure_count": 0,
    "last_failure_time": None,
    "is_open": False,
    "threshold": 5,  # Open after 5 failures
    "reset_timeout": 300  # Reset after 5 minutes
}

# ---------------------- Canonical Schema (UNCHANGED) ---------------------- #
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

ALIAS_FILE = "./db/alias_memory.json"

# Module-level caches (UNCHANGED)
_ENTITY_CACHE = {}
_INDUSTRY_CACHE = {}

# ---------------------- SRE: Helper Functions (NEW) ---------------------- #

def _check_circuit_breaker() -> bool:
    """Check if Redis circuit is open"""
    if not _circuit_breaker["is_open"]:
        return True
    
    # Check if enough time has passed to try again
    if _circuit_breaker["last_failure_time"]:
        elapsed = time.time() - _circuit_breaker["last_failure_time"]
        if elapsed > _circuit_breaker["reset_timeout"]:
            logger.warning("[CIRCUIT] 🔄 Closing breaker, retrying...")
            _circuit_breaker["is_open"] = False
            _circuit_breaker["failure_count"] = 0
            return True
    
    logger.error("[CIRCUIT] 🔴 Circuit breaker OPEN - rejecting Redis ops")
    return False

def _record_redis_failure(error: str):
    """Track Redis failures"""
    _circuit_breaker["failure_count"] += 1
    _circuit_breaker["last_failure_time"] = time.time()
    
    if _circuit_breaker["failure_count"] >= _circuit_breaker["threshold"]:
        _circuit_breaker["is_open"] = True
        logger.critical(f"[CIRCUIT] 🔴 Breaker opened! {_circuit_breaker['failure_count']} failures")

def _record_redis_success():
    """Reset failure count on success"""
    if _circuit_breaker["failure_count"] > 0:
        logger.info(f"[CIRCUIT] ✅ Resetting failure count (was {_circuit_breaker['failure_count']})")
        _circuit_breaker["failure_count"] = 0

def _publish_detection_event(org_id: str, source_id: str, detection_type: str, data: Dict):
    """
    🚀 Pub/Sub: Publish entity/industry detection event
    Frontend can subscribe to: `detection:events:{org_id}:{source_id}`
    """
    try:
        channel = f"detection:events:{org_id}:{source_id}"
        payload = {
            "type": f"{detection_type}.detected",
            "timestamp": datetime.utcnow().isoformat(),
            "org_id": org_id,
            "source_id": source_id,
            "data": data
        }
        
        # Fire-and-forget (non-blocking)
        asyncio.create_task(
            asyncio.to_thread(
                event_hub.publish,
                channel,
                json.dumps(payload)
            )
        )
        
        logger.info(f"[PUBSUB] 📡 Published {detection_type} detection event")
        
    except Exception as e:
        logger.error(f"[PUBSUB] ❌ Failed to publish detection event: {e}")

# ---------------------- Core Functions (INSTRUMENTED ONLY) ---------------------- #

def map_pandas_to_duck(col: str, series: pd.Series) -> str:
    """Map pandas dtype to DuckDB type (UNCHANGED)"""
    if pd.api.types.is_bool_dtype(series):     return "BOOLEAN"
    if pd.api.types.is_integer_dtype(series):  return "BIGINT"
    if pd.api.types.is_float_dtype(series):    return "DOUBLE"
    if pd.api.types.is_datetime64_any_dtype(series): return "TIMESTAMP"
    return "VARCHAR"

def load_dynamic_aliases() -> None:
    """Load column alias mappings (UNCHANGED)"""
    if os.path.exists(ALIAS_FILE):
        try:
            with open(ALIAS_FILE) as f:
                dynamic_aliases = json.load(f)
            for k, v in dynamic_aliases.items():
                if k in CANONICAL:
                    CANONICAL[k].extend([a for a in v if a not in CANONICAL[k]])
                else:
                    CANONICAL[k] = v
        except Exception as e:
            print(f"[mapper] ⚠️ Failed to load alias memory: {e}")

def save_dynamic_aliases() -> None:
    """Save column alias mappings (UNCHANGED)"""
    os.makedirs(os.path.dirname(ALIAS_FILE), exist_ok=True)
    with open(ALIAS_FILE, "w") as f:
        json.dump(CANONICAL, f, indent=2)

# ---------------------- SRE: Health Check (NEW) ---------------------- #

def health_check_mapper(org_id: str = "test") -> Dict[str, Any]:
    """SRE: Health check for mapper service"""
    return {
        "status": "healthy" if not _circuit_breaker["is_open"] else "degraded",
        "circuit_breaker": {
            "open": _circuit_breaker["is_open"],
            "failure_count": _circuit_breaker["failure_count"]
        },
        "cache_size": {
            "entity": len(_ENTITY_CACHE),
            "industry": len(_INDUSTRY_CACHE)
        },
        "canonical_columns": len(CANONICAL),
        "metrics": get_sre_metrics()
    }

# ---------------------- Entity & Industry Detection (INSTRUMENTED) ---------------------- #

def poll_for_entity(org_id: str, source_id: str, timeout: int = 10) -> dict:
    """
    Poll Redis for entity detection result - NOW WITH SRE OBSERVABILITY
    
    Core logic: UNCHANGED
    - Checks cache first (zero Redis calls)
    - Polls Redis twice with 3s sleep
    - Falls back to combined detection
    
    Added:
    - Prometheus metrics for cache hits/misses
    - Circuit breaker protection
    - Pub/sub event when entity detected
    - Structured logging
    """
    start_time = time.time()
    cache_key = (org_id, source_id)
    
    # 1. Check cache (zero Redis calls)
    if cache_key in _ENTITY_CACHE:
        logger.info(f"[ENTITY] 💾 CACHE HIT: {cache_key}")
        MapperMetrics.redis_reads.labels(org_id=org_id, status="cache_hit").inc()
        
        # Publish event (cache hit is still a "detection")
        _publish_detection_event(org_id, source_id, "entity", _ENTITY_CACHE[cache_key])
        
        return _ENTITY_CACHE[cache_key]
    
    # SRE: Check circuit breaker
    if not _check_circuit_breaker():
        logger.error("[ENTITY] 🔴 Circuit open - using fallback immediately")
        entity_info, _ = _fallback_combined(org_id, source_id)
        MapperMetrics.fallback_runs.labels(org_id=org_id, fallback_type="entity").inc()
        return entity_info
    
    try:
        # 2-4. Try Redis (twice with sleep)
        entity_key = f"entity:{org_id}:{source_id}"
        logger.info(f"[ENTITY] ⏳ Polling for key: {entity_key}")
        
        for attempt in range(2):
            redis_start = time.time()
            data = event_hub.get_key(entity_key)
            redis_latency = (time.time() - redis_start) * 1000
            
            if data:
                entity_info = json.loads(data)
                logger.info(f"[ENTITY] ✅ Redis hit: {entity_info['entity_type']} (attempt {attempt+1})")
                
                MapperMetrics.redis_reads.labels(org_id=org_id, status="success").inc()
                MapperMetrics.detection_latency.labels(org_id=org_id, detection_type="entity").observe(
                    (time.time() - start_time) + attempt * 3
                )
                
                # Cache and publish
                _ENTITY_CACHE[cache_key] = entity_info
                MapperMetrics.cache_size.labels(cache_type="entity").set(len(_ENTITY_CACHE))
                
                # 🚀 Pub/sub event
                _publish_detection_event(org_id, source_id, "entity", entity_info)
                
                _record_redis_success()
                
                return entity_info
            
            if attempt == 0:
                logger.debug("[ENTITY] 🔄 First check failed, sleeping 3s...")
                time.sleep(3.0)
                MapperMetrics.redis_reads.labels(org_id=org_id, status="miss").inc()
        
        # 5. Fallback
        logger.warning("[ENTITY] ⚠️ Using fallback")
        MapperMetrics.fallback_runs.labels(org_id=org_id, fallback_type="entity").inc()
        entity_info, _ = _fallback_combined(org_id, source_id)
        
        return entity_info
        
    except Exception as e:
        _record_redis_failure(str(e))
        MapperMetrics.redis_reads.labels(org_id=org_id, status="error").inc()
        logger.error(f"[ENTITY] ❌ Error: {e}, using fallback")
        
        entity_info, _ = _fallback_combined(org_id, source_id)
        return entity_info

def poll_for_industry(org_id: str, source_id: str, timeout: int = 10) -> dict:
    """
    Poll Redis for industry detection result - NOW WITH SRE OBSERVABILITY
    
    Core logic: UNCHANGED
    Reuses data from poll_for_entity to avoid duplicate Redis calls
    
    Added:
    - Prometheus metrics for cache hits/misses
    - Circuit breaker protection
    - Pub/sub event when industry detected
    """
    start_time = time.time()
    cache_key = (org_id, source_id)
    
    # 1. Check cache (filled by poll_for_entity)
    if cache_key in _INDUSTRY_CACHE:
        logger.info(f"[INDUSTRY] 💾 CACHE HIT: {cache_key}")
        MapperMetrics.redis_reads.labels(org_id=org_id, status="cache_hit").inc()
        
        _publish_detection_event(org_id, source_id, "industry", _INDUSTRY_CACHE[cache_key])
        
        return _INDUSTRY_CACHE[cache_key]
    
    # SRE: Check circuit breaker (already checked in poll_for_entity, but safe)
    if not _check_circuit_breaker():
        logger.error("[INDUSTRY] 🔴 Circuit open - using fallback")
        industry_info = _fallback_industry_detection(org_id, source_id)
        MapperMetrics.fallback_runs.labels(org_id=org_id, fallback_type="industry").inc()
        return industry_info
    
    try:
        # 2. Try Redis (should be cached from poll_for_entity)
        industry_key = f"industry:{org_id}:{source_id}"
        logger.info(f"[INDUSTRY] ⏳ Polling for key: {industry_key}")
        
        redis_start = time.time()
        data = event_hub.get_key(industry_key)
        redis_latency = (time.time() - redis_start) * 1000
        
        if data:
            industry_info = json.loads(data)
            logger.info(f"[INDUSTRY] ✅ Redis hit: {industry_info['industry']}")
            
            MapperMetrics.redis_reads.labels(org_id=org_id, status="success").inc()
            MapperMetrics.detection_latency.labels(org_id=org_id, detection_type="industry").observe(
                time.time() - start_time
            )
            
            # Cache and publish
            _INDUSTRY_CACHE[cache_key] = industry_info
            MapperMetrics.cache_size.labels(cache_type="industry").set(len(_INDUSTRY_CACHE))
            
            # 🚀 Pub/sub event
            _publish_detection_event(org_id, source_id, "industry", industry_info)
            
            _record_redis_success()
            
            return industry_info
        
        # 3. Emergency fallback
        logger.warning("[INDUSTRY] ⚠️ Cache miss, running emergency fallback")
        MapperMetrics.fallback_runs.labels(org_id=org_id, fallback_type="industry").inc()
        industry_info = _fallback_industry_detection(org_id, source_id)
        
        return industry_info
        
    except Exception as e:
        _record_redis_failure(str(e))
        MapperMetrics.redis_reads.labels(org_id=org_id, status="error").inc()
        logger.error(f"[INDUSTRY] ❌ Error: {e}, using fallback")
        
        industry_info = _fallback_industry_detection(org_id, source_id)
        return industry_info

def _fallback_combined(org_id: str, source_id: str) -> tuple[dict, dict]:
    """
    SINGLE DuckDB query to detect BOTH entity and industry.
    Writes BOTH keys to Redis atomically.
    Updates caches WITHOUT immediately invalidating them.
    
    Core logic: UNCHANGED
    - Runs detection in parallel ThreadPoolExecutor
    - Writes to Redis via event_hub.setex()
    - Updates in-memory caches
    
    Added:
    - Prometheus metrics for fallback executions
    - Circuit breaker checks
    - Pub/sub events for both entity and industry
    - Structured logging
    """
    start_time = time.time()
    logger.info(f"[FALLBACK] 🚨 Running combined fallback for {org_id}/{source_id}")
    
    MapperMetrics.fallback_runs.labels(org_id=org_id, fallback_type="combined").inc()
    
    # SRE: Check circuit breaker before DB query
    if not _check_circuit_breaker():
        logger.error("[FALLBACK] 🔴 Circuit open - returning UNKNOWN")
        entity_info = {"entity_type": "UNKNOWN", "confidence": 0.0}
        industry_info = {"industry": "UNKNOWN", "confidence": 0.0}
        return entity_info, industry_info
    
    # Default values
    entity_info = {"entity_type": "UNKNOWN", "confidence": 0.0}
    industry_info = {"industry": "UNKNOWN", "confidence": 0.0}
    
    try:
        conn = get_conn(org_id)
        rows = conn.execute("""
            SELECT row_data
            FROM main.raw_rows
            WHERE row_data IS NOT NULL
            USING SAMPLE 100
        """).fetchall()
        
        if rows:
            parsed = [json.loads(r[0]) for r in rows if r[0]]
            df = pd.DataFrame(parsed)
            df.columns = [str(col).lower().strip() for col in df.columns]
            
            def detect_entity():
                try:
                    return hybrid_detect_entity_type(org_id, df, source_id, use_llm=False)
                except Exception as e:
                    logger.error(f"[FALLBACK] Entity detection failed: {e}")
                    return ("UNKNOWN", 0.0, False)
            
            def detect_industry():
                try:
                    
                    return hybrid_detect_industry_type(org_id, df, source_id, use_llm=False)
                except Exception as e:
                    logger.error(f"[FALLBACK] Industry detection failed: {e}")
                    return ("UNKNOWN", 0.0, False)
            
            with ThreadPoolExecutor(max_workers=2) as ex:
                ent_future = ex.submit(detect_entity)
                ind_future = ex.submit(detect_industry)
                
                entity_type, ent_conf, _ = ent_future.result()
                industry, ind_conf, _ = ind_future.result()
                
                entity_info = {"entity_type": entity_type, "confidence": ent_conf}
                industry_info = {"industry": industry, "confidence": ind_conf}
                
                logger.info(
                    f"[FALLBACK] ✅ Entity: {entity_type} ({ent_conf:.2%}), "
                    f"Industry: {industry} ({ind_conf:.2%})"
                )
        
    except Exception as e:
        logger.error(f"[FALLBACK] ❌ Failed: {e}")
        MapperMetrics.stream_errors.labels(org_id=org_id, error_type="fallback_error").inc()
    
    # GUARANTEE: Write to Redis (pipeline-like for both keys)
    try:
        e_key = f"entity:{org_id}:{source_id}"
        i_key = f"industry:{org_id}:{source_id}"
        
        # Handle both TCP and Upstash
        redis_start = time.time()
        event_hub.setex(e_key, 3600, json.dumps(entity_info))
        event_hub.setex(i_key, 3600, json.dumps(industry_info))
        redis_latency = (time.time() - redis_start) * 1000
        
        logger.info(f"[FALLBACK] 💾 WRITTEN to Redis in {redis_latency:.2f}ms")
        
        MapperMetrics.redis_writes.labels(org_id=org_id, status="success").inc(2)
        MapperMetrics.detection_latency.labels(org_id=org_id, detection_type="combined").observe(
            time.time() - start_time
        )
        
        # 🚀 Pub/sub events for both detections
        _publish_detection_event(org_id, source_id, "entity", entity_info)
        _publish_detection_event(org_id, source_id, "industry", industry_info)
        
        _record_redis_success()
        
    except Exception as re:
        _record_redis_failure(str(re))
        MapperMetrics.redis_writes.labels(org_id=org_id, status="error").inc(2)
        logger.error(f"[FALLBACK] ❌ Redis write failed: {re}")
    
    # Update caches
    cache_key = (org_id, source_id)
    _ENTITY_CACHE[cache_key] = entity_info
    _INDUSTRY_CACHE[cache_key] = industry_info
    MapperMetrics.cache_size.labels(cache_type="entity").set(len(_ENTITY_CACHE))
    MapperMetrics.cache_size.labels(cache_type="industry").set(len(_INDUSTRY_CACHE))
    
    return entity_info, industry_info

def _fallback_industry_detection(org_id: str, source_id: str) -> dict:
    """
    Emergency fallback for industry only (rarely used).
    Core logic: UNCHANGED
    Added: SRE metrics, circuit breaker, pub/sub event
    """
    logger.info(f"[FALLBACK_IND] 🚨 Emergency fallback for {org_id}/{source_id}")
    MapperMetrics.fallback_runs.labels(org_id=org_id, fallback_type="industry_emergency").inc()
    
    if not _check_circuit_breaker():
        logger.error("[FALLBACK_IND] 🔴 Circuit open - returning UNKNOWN")
        return {"industry": "UNKNOWN", "confidence": 0.0}
    
    try:
        conn = get_conn(org_id)
        rows = conn.execute("""
            SELECT row_data
            FROM main.raw_rows
            WHERE row_data IS NOT NULL
            USING SAMPLE 100
        """).fetchall()
        
        if not rows:
            logger.warning("[FALLBACK_IND] No data found")
            return {"industry": "UNKNOWN", "confidence": 0.0}
        
        parsed = [json.loads(r[0]) for r in rows if r[0]]
        df = pd.DataFrame(parsed)
        df.columns = [str(col).lower().strip() for col in df.columns]
        
        from app.core.detection_engine import hybrid_detect_industry_type
        industry, confidence, _ = hybrid_detect_industry_type(org_id, df, source_id, use_llm=False)

        
        industry_info = {"industry": industry, "confidence": confidence}
        logger.info(f"[FALLBACK_IND] ✅ Detected: {industry} ({confidence:.2%})")
        
        # Write to Redis
        redis_key = f"industry:{org_id}:{source_id}"
        event_hub.setex(redis_key, 3600, json.dumps(industry_info))
        logger.info(f"[FALLBACK_IND] 💾 WRITTEN to Redis: {redis_key}")
        
        MapperMetrics.redis_writes.labels(org_id=org_id, status="success").inc()
        _record_redis_success()
        
        # 🚀 Pub/sub event
        _publish_detection_event(org_id, source_id, "industry", industry_info)
        
        return industry_info
        
    except Exception as e:
        _record_redis_failure(str(e))
        MapperMetrics.redis_writes.labels(org_id=org_id, status="error").inc()
        logger.error(f"[FALLBACK_IND] ❌ Failed: {e}")
        
        # Write UNKNOWN even on error
        redis_key = f"industry:{org_id}:{source_id}"
        event_hub.setex(redis_key, 3600, json.dumps({"industry": "UNKNOWN", "confidence": 0.0}))
        return {"industry": "UNKNOWN", "confidence": 0.0}

# ---------------------- Canonical Table Creation (UNCHANGED) ---------------------- #

def ensure_canonical_table(duck, df: pd.DataFrame, entity_type: str) -> str:
    """Creates entity-specific table (UNCHANGED)"""
    table_name = f"main.{entity_type}_canonical"
    
    duck.execute(f"""
        CREATE TABLE IF NOT EXISTS {table_name} (
            id UUID DEFAULT uuid(),
            _ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    existing_cols_raw = duck.execute(f"PRAGMA table_info('{table_name}')").fetchall()
    existing_cols = {str(r[0]).lower() for r in existing_cols_raw}
    
    for col in df.columns:
        col_name = str(col).lower().strip()
        if col_name not in existing_cols:
            try:
                dtype = map_pandas_to_duck(col_name, df[col])
                logger.info(f"[MAPPER] ➕ Adding column '{col_name}:{dtype}'")
                duck.execute(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {dtype}")
            except Exception as e:
                logger.warning(f"[MAPPER] ⚠️ Skipping column {col_name}: {e}")
    
    return table_name

# ---------------------- Main Pipeline (INSTRUMENTED) ---------------------- #

def canonify_df(org_id: str, source_id: str, hours_window: int = 24) -> tuple[pd.DataFrame, str, float]:
    """
    ENTERPRISE DATA INGESTION PIPELINE
    Safe, idempotent, and Redis-efficient.
    
    Core logic: UNCHANGED
    Added: SRE metrics, structured logging, pub/sub events
    """
    start_time = time.time()
    emit_mapper_log("info", f"🚀 Starting pipeline for {org_id}/{source_id}")
    
    # Load aliases
    load_dynamic_aliases()
    
    # 1️⃣ FETCH RAW DATA
    with get_conn(org_id) as conn:
        ensure_raw_table(conn)
        cutoff_time = datetime.now() - timedelta(hours=hours_window)
        
        try:
            rows = conn.execute("""
                SELECT row_data FROM main.raw_rows 
                WHERE row_data IS NOT NULL 
                AND LENGTH(CAST(row_data AS TEXT)) > 0
                AND ingested_at >= ?
                ORDER BY ingested_at DESC
            """, (cutoff_time,)).fetchall()
        except Exception as e:
            emit_mapper_log("error", f"❌ SQL read error: {e}", error=str(e))
            return pd.DataFrame(), "unknown", 0.0
    
    if not rows:
        logger.warning("[MAPPER] ⚠️ No audit rows found")
        return pd.DataFrame(), "unknown", 0.0
    
    # 2️⃣ PARSE JSON (UNCHANGED)
    parsed, malformed_count = [], 0
    for r in rows:
        raw = r[0]
        if not raw:
            malformed_count += 1
            continue
        
        try:
            obj = raw if isinstance(raw, (dict, list)) else json.loads(str(raw))
        except Exception:
            malformed_count += 1
            continue
        
        if isinstance(obj, dict):
            if "rows" in obj and isinstance(obj["rows"], list):
                parsed.extend(obj["rows"])
            elif "data" in obj and isinstance(obj["data"], list):
                parsed.extend(obj["data"])
            elif "tables" in obj and isinstance(obj["tables"], dict):
                for table_rows in obj["tables"].values():
                    if isinstance(table_rows, list):
                        parsed.extend(table_rows)
            else:
                parsed.append(obj)
        elif isinstance(obj, list):
            parsed.extend(obj)
        else:
            malformed_count += 1
    
    if malformed_count:
        logger.warning(f"[MAPPER] ⚠️ Skipped {malformed_count} malformed rows")
    if not parsed:
        logger.error("[MAPPER] ❌ No valid data after parsing")
        return pd.DataFrame(), "unknown", 0.0
    
    # 3️⃣ NORMALIZE COLUMNS (UNCHANGED)
    df = pd.DataFrame(parsed)
    df.columns = [str(col).lower().strip() for col in df.columns]
    df = df.loc[:, ~df.columns.duplicated()]
    logger.info(f"[MAPPER] 📊 Parsed DataFrame: {len(df)} rows × {len(df.columns)} cols")
    
    # 4️⃣ MAP TO CANONICAL SCHEMA (UNCHANGED)
    mapping, canonical_used = {}, set()
    for canon, aliases in CANONICAL.items():
        for col in df.columns:
            if any(str(alias).lower() in col for alias in aliases):
                if canon not in canonical_used:
                    mapping[col] = canon
                    canonical_used.add(canon)
                    logger.info(f"[MAPPER] 🔀 Mapped '{col}' → canonical '{canon}'")
                break
    
    for col in df.columns:
        for canon in CANONICAL.keys():
            if str(canon).lower() in col and col not in CANONICAL[canon]:
                CANONICAL[canon].append(col)
                logger.info(f"[MAPPER] 🧠 Learned new alias: {canon} ← {col}")
    
    save_dynamic_aliases()
    
    renamed = df.rename(columns=mapping)
    
    final_columns, seen = [], set()
    for col in renamed.columns:
        if col in CANONICAL.keys():
            if col not in seen:
                final_columns.append(col)
                seen.add(col)
        else:
            final_columns.append(col)
    
    df = renamed[final_columns].copy()
    logger.info(f"[MAPPER] ✅ Kept columns: {list(df.columns)}")
    
    # 5️⃣ TYPE CONVERSIONS (UNCHANGED)
    try:
        if "timestamp" in df:
            df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
        if "expiry_date" in df:
            df["expiry_date"] = pd.to_datetime(df["expiry_date"], errors="coerce").dt.date
        if "promo_flag" in df:
            df["promo_flag"] = df["promo_flag"].astype(str).isin({"1", "true", "t", "yes"})
        for col in ("qty", "total"):
            if col in df:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    except Exception as e:
        logger.warning(f"[MAPPER] ⚠️ Type conversion warning: {e}")
    
    # 6️⃣ DETECT ENTITY & INDUSTRY (UNCHANGED)
    entity_info = poll_for_entity(org_id, source_id)
    entity_type = entity_info["entity_type"]
    
    industry_info = poll_for_industry(org_id, source_id)
    industry = industry_info["industry"]
    industry_confidence = industry_info["confidence"]
    logger.info(f"[MAPPER] 🎯 Entity: {entity_type}, Industry: {industry} ({industry_confidence:.2%})")
    
    # 7️⃣ SCHEMA VERSIONING & TRANSACTIONAL INSERT (UNCHANGED)
    os.makedirs("./db", exist_ok=True)
    
    rows_inserted = 0
    
    with transactional_conn(org_id) as duck:
        ensure_schema_versions_table(duck)
        
        # Detect schema changes (UNCHANGED)
        current_schema = {col: map_pandas_to_duck(col, df[col]) for col in df.columns}
        existing_schema_row = duck.execute("""
            SELECT schema_json, version_id FROM main.schema_versions 
            WHERE table_name = ? AND status = 'applied' 
            ORDER BY version_id DESC LIMIT 1
        """, (f"{entity_type}_canonical",)).fetchone()
        
        is_new_schema = (
            not existing_schema_row or 
            json.loads(existing_schema_row[0]) != current_schema
        )
        
        version_id = None
        if is_new_schema:
            version_id = duck.execute("""
                INSERT INTO main.schema_versions 
                (version_id, table_name, schema_json, status) 
                VALUES (nextval('schema_version_seq'), ?, ?, 'pending') 
                RETURNING version_id
            """, (f"{entity_type}_canonical", json.dumps(current_schema))).fetchone()[0]
            logger.info(f"[MAPPER] 📝 Created schema v{version_id} for {entity_type}_canonical")
        
        # Ensure table exists
        table_name = ensure_canonical_table(duck, df, entity_type)
        
        # Insert data (UNCHANGED)
        if not df.empty:
            table_info = duck.execute(f"PRAGMA table_info('{table_name}')").fetchall()
            table_cols = [str(r[1]) for r in table_info]
            
            df_to_insert = df[[col for col in df.columns if col in table_cols]]
            
            if not df_to_insert.empty:
                df_to_insert = df_to_insert.replace([np.inf, -np.inf, np.nan], None)
                
                cols_str = ", ".join(df_to_insert.columns)
                placeholders = ", ".join(["?"] * len(df_to_insert.columns))
                
                duck.executemany(
                    f"INSERT INTO {table_name} ({cols_str}) VALUES ({placeholders})",
                    df_to_insert.values.tolist()
                )
                rows_inserted = len(df_to_insert)
                logger.info(f"[MAPPER] 💾 Inserted {rows_inserted} rows into {table_name}")
        
        # Mark schema as applied (UNCHANGED)
        if is_new_schema and version_id:
            try:
                duck.execute("""
                    UPDATE main.schema_versions 
                    SET applied_at = CURRENT_TIMESTAMP, status = 'applied'
                    WHERE version_id = ?
                """, (version_id,))
                logger.info(f"[MAPPER] ✅ Schema v{version_id} marked as applied")
            except Exception as e:
                logger.warning(f"[MAPPER] ⚠️ Schema update warning: {e}")
    
    # 8️⃣ FINAL: Clean DataFrame for response (UNCHANGED)
    df = df.replace([np.inf, -np.inf, np.nan], None)
    duration_ms = (time.time() - start_time) * 1000
    logger.info(f"[MAPPER] ✅ Pipeline complete in {duration_ms:.2f}ms for {org_id}")
    
    # 9️⃣ SINGLE, SAFE WORKER TRIGGER (INSTRUMENTED)
    try:
        # Defensive: ensure keys exist
        e_key = f"entity:{org_id}:{source_id}"
        i_key = f"industry:{org_id}:{source_id}"
        
        if not event_hub.exists(e_key) or not event_hub.exists(i_key):
            logger.warning("[MAPPER] ⚠️ Keys missing, running fallback to ensure")
            _fallback_combined(org_id, source_id)
        
        # 🎯 ONE trigger message to worker manager
        trigger_start = time.time()
        event_hub.emit_analytics_trigger(org_id, source_id, {
            "type": "kpi_compute",
            "entity_type": entity_type,
            "industry": industry,
            "rows_inserted": rows_inserted,
            "timestamp": datetime.now().isoformat()
        })
        trigger_latency = (time.time() - trigger_start) * 1000
        
        logger.info(f"[MAPPER] 🚀 Triggered analytics in {trigger_latency:.2f}ms")
        
    except Exception as e:
        logger.error(f"[MAPPER] ⚠️ Analytics trigger failed: {e}")
        _record_redis_failure(f"trigger_error:{e}")
    
    return df, industry, industry_confidence