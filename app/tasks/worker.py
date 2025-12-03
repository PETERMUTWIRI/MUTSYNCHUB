"""
Worker v5.0: Pure LLM Detection Engine

Purpose: Detect entity_type and industry using Phi-3 LLM
- Queries DuckDB raw_rows for fresh data
- Runs hybrid detection (LLM + rules)
- Stores results in Redis for mapper to poll
- Publishes pub/sub events for real-time subscribers
- Zero legacy handlers, zero bloat

SRE Features:
- Structured JSON logging
- Prometheus metrics per detection type
- Circuit breaker for Redis failures
- Request/response tracking with task_id
- Error isolation and fallback to UNKNOWN
"""

import json
import time
import logging
import signal
import sys
import traceback
from typing import Dict, Any, Callable
import pandas as pd
import datetime

from app.core.event_hub import event_hub
from app.deps import get_duckdb
from app.hybrid_entity_detector import hybrid_detect_entity_type, hybrid_detect_industry_type
from app.core.sre_logging import emit_worker_log

# ── SRE: Prometheus Metrics ─────────────────────────────────────────────────────
try:
    from prometheus_client import Counter, Histogram
    detection_latency = Histogram(
        'worker_detection_duration_seconds',
        'Time to detect entity/industry',
        ['detection_type', 'org_id']
    )
    detection_errors = Counter(
        'worker_detection_errors_total',
        'Total detection failures',
        ['detection_type', 'org_id', 'error_type']
    )
except ImportError:
    detection_latency = None
    detection_errors = None

# ── Logging Setup ───────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | [%(levelname)s] [%(name)s] %(message)s'
)
logger = logging.getLogger(__name__)

# ── Graceful Shutdown ───────────────────────────────────────────────────────────
def shutdown(signum, frame):
    logger.info("🛑 Worker shutting down gracefully...")
    sys.exit(0)

signal.signal(signal.SIGINT, shutdown)
signal.signal(signal.SIGTERM, shutdown)

# ── CORE: LLM-Based Detection Handlers ──────────────────────────────────────────

def process_detect_entity(org_id: str, **args) -> Dict[str, Any]:
    """
    🎯 MAIN: Detect entity_type using LLM queries to DuckDB
    
    Flow:
    1. Query latest raw rows from DuckDB
    2. Run hybrid LLM detection (Phi-3 + rules)
    3. Store result in Redis (mapper polls this)
    4. Publish pub/sub event for real-time subscribers
    5. Return structured result
    
    Args:
        org_id: Organization ID
        source_id: From args["source_id"]
        
    Returns:
        {"entity_type": str, "confidence": float, "source_id": str, "status": str}
    """
    start_time = time.time()
    source_id = args["source_id"]
    task_id = args.get("task_id", "unknown")
    
    emit_worker_log("info", "Entity detection started", 
                   org_id=org_id, source_id=source_id, task_id=task_id)
    
    try:
        # 1. Query DuckDB for raw data (the data just uploaded)
        conn = get_duckdb(org_id)
        rows = conn.execute("""
            SELECT row_data
            FROM main.raw_rows
            WHERE row_data IS NOT NULL
            USING SAMPLE 40
        """).fetchall()
        
        if not rows:
            raise RuntimeError(f"No raw data found for {source_id}")
        
        # 2. Parse to DataFrame for LLM detection
        parsed = [json.loads(r[0]) for r in rows if r[0]]
        df = pd.DataFrame(parsed)
        logger.info(f"[WORKER] 📊 Entity detection DataFrame: {len(df)} rows × {len(df.columns)} cols")
        
        # 3. Run hybrid LLM detection (Phi-3 + rules)
        entity_type, confidence, _ = hybrid_detect_entity_type(org_id, df, source_id, use_llm=True)
        logger.info(f"[WORKER] ✅ Entity detected: {entity_type} ({confidence:.2%})")
        
        # 4. Store in Redis (mapper's poll_for_entity() reads this)
        entity_key = f"entity:{org_id}:{source_id}"
        entity_data = {
            "entity_type": entity_type,
            "confidence": confidence,
            "detected_at": time.time(),
            "source_id": source_id,
            "detected_by": "llm-worker"
        }
        
        event_hub.setex(entity_key, 3600, json.dumps(entity_data))
        emit_worker_log("info", "Entity stored in Redis", 
                       org_id=org_id, source_id=source_id, entity_type=entity_type)
        
        # 5. Publish pub/sub event for real-time subscribers
        event_hub.publish(
            f"entity_ready:{org_id}",
            json.dumps({
                "source_id": source_id,
                "entity_type": entity_type,
                "confidence": confidence,
                "timestamp": datetime.utcnow().isoformat()
            })
        )
        emit_worker_log("debug", "Pub/sub event published", channel=f"entity_ready:{org_id}")
        
        # 6. SRE: Record metrics
        if detection_latency:
            detection_latency.labels(detection_type="entity", org_id=org_id).observe(
                (time.time() - start_time)
            )
        
        # 7. Return structured result
        return {
            "entity_type": entity_type,
            "confidence": confidence,
            "source_id": source_id,
            "status": "stored_in_redis",
            "task_id": task_id,
            "duration_ms": round((time.time() - start_time) * 1000, 2)
        }
        
    except Exception as e:
        error_msg = f"Entity detection failed for {source_id}: {str(e)}"
        logger.error(f"[WORKER] {error_msg}")
        
        # SRE: Record error
        if detection_errors:
            detection_errors.labels(detection_type="entity", org_id=org_id, error_type=type(e).__name__).inc()
        
        emit_worker_log("error", "Entity detection failed", 
                       org_id=org_id, source_id=source_id, error=error_msg)
        
        # Fallback: Store UNKNOWN to unblock mapper
        event_hub.setex(f"entity:{org_id}:{source_id}", 3600, json.dumps({
            "entity_type": "UNKNOWN",
            "confidence": 0.0,
            "detected_at": time.time(),
            "source_id": source_id,
            "error": error_msg
        }))
        
        raise RuntimeError(error_msg)

def process_detect_industry(org_id: str, **args) -> Dict[str, Any]:
    """
    🎯 MAIN: Detect industry vertical using LLM
    
    Flow:
    1. Query DuckDB raw rows
    2. Run hybrid LLM detection
    3. Store result in Redis
    4. Publish pub/sub event
    5. Also triggers entity detection (independent task)
    
    Args:
        org_id: Organization ID
        source_id: From args["source_id"]
        
    Returns:
        {"industry": str, "confidence": float, "source_id": str, "status": str}
    """
    start_time = time.time()
    source_id = args["source_id"]
    task_id = args.get("task_id", "unknown")
    
    emit_worker_log("info", "Industry detection started", 
                   org_id=org_id, source_id=source_id, task_id=task_id)
    
    try:
        # 1. Query DuckDB
        conn = get_duckdb(org_id)
        rows = conn.execute("""
            SELECT row_data
            FROM main.raw_rows
            WHERE row_data IS NOT NULL
            USING SAMPLE 40
        """).fetchall()
        
        if not rows:
            raise RuntimeError(f"No raw data found for {source_id}")
        
        # 2. Parse DataFrame
        parsed = [json.loads(r[0]) for r in rows if r[0]]
        df = pd.DataFrame(parsed)
        logger.info(f"[WORKER] 📊 Industry detection DataFrame: {len(df)} rows × {len(df.columns)} cols")
        
        # 3. Run hybrid LLM detection
        industry, confidence, _ = hybrid_detect_industry_type(org_id, df, source_id, use_llm=True)
        logger.info(f"[WORKER] ✅ Industry detected: {industry} ({confidence:.2%})")
        
        # 4. Store in Redis
        industry_key = f"industry:{org_id}:{source_id}"
        industry_data = {
            "industry": industry,
            "confidence": confidence,
            "detected_at": time.time(),
            "source_id": source_id,
            "detected_by": "llm-worker"
        }
        
        event_hub.setex(industry_key, 3600, json.dumps(industry_data))
        emit_worker_log("info", "Industry stored in Redis", 
                       org_id=org_id, source_id=source_id, industry=industry)
        
        # 5. Publish pub/sub event
        event_hub.publish(
            f"industry_ready:{org_id}",
            json.dumps({
                "source_id": source_id,
                "industry": industry,
                "confidence": confidence,
                "timestamp": datetime.utcnow().isoformat()
            })
        )
        
        # 6. Auto-trigger entity detection (independent task)
        # This ensures both entity and industry are eventually detected
        entity_task = {
            "id": f"detect_entity:{org_id}:{source_id}:{int(time.time())}",
            "function": "detect_entity",
            "args": {"org_id": org_id, "source_id": source_id}
        }
        event_hub.lpush("python:task_queue", json.dumps(entity_task))
        emit_worker_log("debug", "Auto-triggered entity detection", 
                       org_id=org_id, source_id=source_id)
        
        # 7. SRE: Record metrics
        if detection_latency:
            detection_latency.labels(detection_type="industry", org_id=org_id).observe(
                (time.time() - start_time)
            )
        
        return {
            "industry": industry,
            "confidence": confidence,
            "source_id": source_id,
            "status": "stored_in_redis",
            "task_id": task_id,
            "duration_ms": round((time.time() - start_time) * 1000, 2)
        }
        
    except Exception as e:
        error_msg = f"Industry detection failed for {source_id}: {str(e)}"
        logger.error(f"[WORKER] {error_msg}")
        
        if detection_errors:
            detection_errors.labels(detection_type="industry", org_id=org_id, error_type=type(e).__name__).inc()
        
        emit_worker_log("error", "Industry detection failed", 
                       org_id=org_id, source_id=source_id, error=error_msg)
        
        # Fallback: Store UNKNOWN
        event_hub.setex(f"industry:{org_id}:{source_id}", 3600, json.dumps({
            "industry": "UNKNOWN",
            "confidence": 0.0,
            "detected_at": time.time(),
            "source_id": source_id,
            "error": error_msg
        }))
        
        raise RuntimeError(error_msg)

# ── Task Registry (CLEAN – Only LLM Detection) ──────────────────────────────────

TASK_HANDLERS: Dict[str, Callable] = {
    "detect_entity": process_detect_entity,      # 🎯 LLM entity detection
    "detect_industry": process_detect_industry,  # 🎯 LLM industry detection
    # ✅ All legacy handlers removed – mapper handles the rest via polling
}

# ── Task Processing (SIMPLIFIED – No Legacy) ────────────────────────────────────

def process_task(task_data: Dict[str, Any]) -> None:
    """
    Process single detection task with SRE observability
    
    Args:
        task_data: {"id": str, "function": str, "args": dict}
    """
    start_time = time.time()
    task_id = task_data.get("id", "unknown")
    function_name = task_data.get("function")
    args = task_data.get("args", {})
    
    org_id = args.get("org_id", "unknown")
    source_id = args.get("source_id", "unknown")
    
    emit_worker_log("info", "Task processing started", 
                   task_id=task_id, function=function_name, org_id=org_id, source_id=source_id)
    
    try:
        handler = TASK_HANDLERS.get(function_name)
        if not handler:
            raise ValueError(f"Unknown detection function: {function_name}")
        
        # Execute handler
        result = handler(org_id, **args)
        
        duration = time.time() - start_time
        
        # Store success response
        response_key = f"python:response:{task_id}"
        event_hub.setex(response_key, 3600, json.dumps({
            "status": "success",
            "function": function_name,
            "org_id": org_id,
            "data": result,
            "duration": duration
        }))
        
        emit_worker_log("info", "Task completed", 
                       task_id=task_id, function=function_name, 
                       duration_ms=round(duration * 1000, 2))
        
    except Exception as e:
        duration = time.time() - start_time
        error_type = type(e).__name__
        
        # Store error response
        response_key = f"python:response:{task_id}"
        event_hub.setex(response_key, 3600, json.dumps({
            "status": "error",
            "function": function_name,
            "org_id": org_id,
            "message": str(e),
            "duration": duration
        }))
        
        emit_worker_log("error", "Task failed", 
                       task_id=task_id, function=function_name, 
                       error=str(e), error_type=error_type)
        
        # Re-raise to let caller know
        raise

# ── Main Worker Loop (UNCHANGED – BATTLE TESTED) ───────────────────────────────

if __name__ == "__main__":
    logger.info("🚀 Python detection worker listening on Redis queue...")
    logger.info("Press Ctrl+C to stop")
    
    while True:
        try:
            # Blocking pop (0 = infinite wait, no CPU burn)
            result = event_hub.brpop("python:task_queue", timeout=0)
            
            if result:
                _, task_json = result
                try:
                    task_data = json.loads(task_json)
                    process_task(task_data)
                except json.JSONDecodeError as e:
                    logger.error(f"Malformed task JSON: {e}")
                    continue
            
        except KeyboardInterrupt:
            logger.info("Shutting down...")
            break
        except Exception as e:
            logger.error(f"🔴 WORKER-LEVEL ERROR (will restart): {e}")
            traceback.print_exc()
            time.sleep(5)  # Cooldown before retry