"""
WorkerManager v5.0: TCP Redis Pub/Sub + SRE Observability

Key changes:
- Replaces polling with Redis pub/sub for instant trigger detection
- Adds Prometheus metrics for worker lifecycle
- Circuit breaker for Redis connection failures
- Structured JSON logging for Loki/Splunk
- Backward compatible: falls back to polling if TCP Redis unavailable
- Zero changes to public API
"""

import asyncio
import json
import os
import time
from typing import Dict, List, Optional, Any, AsyncGenerator
from datetime import datetime
import logging
from enum import Enum

from app.core.event_hub import event_hub
from app.tasks.analytics_worker import AnalyticsWorker
from app.core.sre_logging import emit_worker_log, emit_deps_log

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


class WorkerEventType(Enum):
    """Pub/sub event types for worker lifecycle"""
    WORKER_STARTED = "worker.started"
    WORKER_COMPLETED = "worker.completed"
    WORKER_FAILED = "worker.failed"
    TRIGGER_RECEIVED = "trigger.received"


class WorkerManagerMetrics:
    """SRE: Prometheus metrics for worker operations"""
    triggers_received = Counter(
        'worker_triggers_total',
        'Total triggers received',
        ['org_id', 'source_id']
    )
    
    workers_spawned = Counter(
        'workers_spawned_total',
        'Total workers spawned',
        ['org_id', 'source_id']
    )
    
    workers_failed = Counter(
        'workers_failed_total',
        'Total worker failures',
        ['org_id', 'source_id', 'error_type']
    )
    
    worker_duration = Histogram(
        'worker_duration_seconds',
        'Worker execution duration',
        ['org_id', 'source_id']
    )
    
    trigger_latency = Histogram(
        'trigger_latency_seconds',
        'Time from trigger to worker start',
        ['org_id', 'source_id']
    )
    
    active_workers_gauge = Gauge(
        'active_workers',
        'Number of currently active workers',
        ['org_id']
    )


class WorkerManager:
    """
    🎛️ Enterprise worker manager with SRE observability
    Uses TCP Redis pub/sub for real-time triggers, falls back to polling
    """
    
    def __init__(self):
        self.active_workers: Dict[str, asyncio.Task] = {}
        self._shutdown = False
        
        # Adaptive polling config (used as fallback)
        self.active_interval = float(os.getenv("WORKER_POLL_ACTIVE", "1.0"))
        self.idle_interval = float(os.getenv("WORKER_POLL_IDLE", "30.0"))
        self.consecutive_empty = 0
        
        # Pub/sub state
        self._pubsub = None
        self._subscription_task = None
        
        # SRE: Circuit breaker
        self._circuit_breaker = {
            "failure_count": 0,
            "last_failure_time": None,
            "is_open": False,
            "threshold": 5,
            "reset_timeout": 300
        }
        
        # SRE: Metrics tracking
        self._metrics = {
            "triggers_processed": 0,
            "workers_spawned": 0,
            "workers_failed": 0,
            "total_latency_ms": 0
        }
        
        emit_worker_log("info", "WorkerManager initialized with SRE observability")
    
    # ====== SRE: Circuit Breaker ======
    
    def _check_circuit_breaker(self) -> bool:
        """Check if Redis circuit is open"""
        if not self._circuit_breaker["is_open"]:
            return True
        
        # Check if enough time has passed to retry
        if self._circuit_breaker["last_failure_time"]:
            elapsed = time.time() - self._circuit_breaker["last_failure_time"]
            if elapsed > self._circuit_breaker["reset_timeout"]:
                logger.warning("[WORKER] Circuit breaker closing, retrying...")
                self._circuit_breaker["is_open"] = False
                self._circuit_breaker["failure_count"] = 0
                return True
        
        logger.error("[WORKER] Circuit breaker OPEN - rejecting operations")
        return False
    
    def _record_failure(self, error_type: str):
        """Track Redis/pubsub failures"""
        self._circuit_breaker["failure_count"] += 1
        self._circuit_breaker["last_failure_time"] = time.time()
        
        if self._circuit_breaker["failure_count"] >= self._circuit_breaker["threshold"]:
            self._circuit_breaker["is_open"] = True
            logger.critical(f"[WORKER] Circuit opened! {self._circuit_breaker['failure_count']} failures")
    
    def _record_success(self):
        """Reset failure count on success"""
        if self._circuit_breaker["failure_count"] > 0:
            logger.info(f"[WORKER] Resetting failure count (was {self._circuit_breaker['failure_count']})")
            self._circuit_breaker["failure_count"] = 0
    
    # ====== SRE: Metrics Collection ======
    
    def _emit_metrics(self, operation: str, duration_ms: float, **kwargs):
        """Emit structured metrics for monitoring"""
        metrics_data = {
            "service": "worker_manager",
            "operation": operation,
            "duration_ms": round(duration_ms, 2),
            "timestamp": datetime.utcnow().isoformat(),
            **kwargs
        }
        
        emit_worker_log("info", f"Metrics: {operation}", **metrics_data)
    
    # ====== Pub/Sub Listener (NEW) ======
    
    async def start_listener(self):
        """
        🎧 TCP REDIS: Real-time pub/sub trigger listener
        Falls back to polling if TCP Redis unavailable
        
        Redis ops: 0/sec idle, instant delivery under load
        """
        emit_worker_log("info", "Starting WorkerManager listener", 
                       active_interval=self.active_interval,
                       idle_interval=self.idle_interval)
        
        # Try pub/sub first (TCP Redis only)
        if hasattr(event_hub.redis, 'pubsub') and not event_hub.is_rest_api:
            await self._start_pubsub_listener()
        else:
            # Fall back to polling (Upstash-compatible)
            logger.warning("[WORKER] ⚠️ TCP Redis not available, falling back to polling")
            await self._start_polling_listener()
    
    async def _start_pubsub_listener(self):
        """Real-time pub/sub subscription"""
        try:
            self._pubsub = event_hub.redis.pubsub()
            channel = "stream:analytics_triggers"
            
            await asyncio.to_thread(self._pubsub.subscribe, channel)
            logger.info(f"[WORKER] 📡 Subscribed to {channel}")
            
            while not self._shutdown:
                if not self._check_circuit_breaker():
                    await asyncio.sleep(self._circuit_breaker["reset_timeout"])
                    continue
                
                try:
                    message = await asyncio.to_thread(self._pubsub.get_message, timeout=1.0)
                    
                    if message and message['type'] == 'message':
                        trigger_start = time.time()
                        
                        payload = json.loads(message['data'])
                        await self._handle_trigger(payload)
                        
                        # SRE: Record trigger latency
                        latency_ms = (time.time() - trigger_start) * 1000
                        org_id = payload.get("org_id", "unknown")
                        source_id = payload.get("source_id", "unknown")
                        
                        WorkerManagerMetrics.trigger_latency.labels(
                            org_id=org_id, source_id=source_id
                        ).observe(latency_ms / 1000)
                        
                        WorkerManagerMetrics.triggers_received.labels(
                            org_id=org_id, source_id=source_id
                        ).inc()
                        
                        emit_worker_log("info", "Trigger processed via pub/sub", 
                                       org_id=org_id, source_id=source_id, latency_ms=latency_ms)
                    
                    # Heartbeat
                    await asyncio.sleep(0.1)
                    
                except Exception as e:
                    self._record_failure(f"pubsub_error:{type(e).__name__}")
                    emit_worker_log("error", "Pub/sub error", error=str(e))
                    await asyncio.sleep(5)
                    
        except Exception as e:
            logger.error(f"[WORKER] ❌ Pub/sub init failed: {e}, falling back to polling")
            await self._start_polling_listener()
    
    async def _start_polling_listener(self):
        """Legacy polling-based listener (Upstash-compatible)"""
        emit_worker_log("info", "Starting polling-based listener (fallback)")
        
        while not self._shutdown:
            try:
                # Check for triggers with ONE Redis operation
                messages = await self._fetch_pending_triggers()
                
                if messages:
                    self.consecutive_empty = 0
                    await self._process_batch(messages)
                    interval = self.active_interval
                else:
                    self.consecutive_empty += 1
                    interval = self._get_backoff_interval()
                
                if self.consecutive_empty == 5:
                    logger.info(f"[WORKER] 🛌 Idle mode (poll: {interval:.1f}s)")
                
                await asyncio.sleep(interval)
                
            except asyncio.CancelledError:
                logger.info("[WORKER] 🛑 Listener cancelled")
                break
            except Exception as e:
                self._record_failure(f"polling_error:{type(e).__name__}")
                emit_worker_log("error", "Polling error", error=str(e))
                await asyncio.sleep(5)
    
    # ====== Fallback Polling Methods (UNCHANGED) ======
    
    async def _fetch_pending_triggers(self) -> List[tuple]:
        """Fetch pending triggers using xrevrange (Upstash-compatible)"""
        try:
            result = event_hub.redis.xrevrange(
                "stream:analytics_triggers",
                count=10
            )
            
            messages = []
            if isinstance(result, dict):
                for msg_id, data in result.items():
                    messages.append((msg_id, data))
            elif isinstance(result, list):
                for item in result:
                    if isinstance(item, (list, tuple)) and len(item) == 2:
                        msg_id, data = item
                        if isinstance(data, list):
                            data_dict = {}
                            for i in range(0, len(data), 2):
                                if i + 1 < len(data):
                                    key = data[i].decode() if isinstance(data[i], bytes) else str(data[i])
                                    value = data[i+1].decode() if isinstance(data[i+1], bytes) else str(data[i+1])
                                    data_dict[key] = value
                            messages.append((msg_id, data_dict))
                        else:
                            messages.append((msg_id, data))
            
            return messages
            
        except Exception as e:
            emit_worker_log("error", "Fetch triggers failed", error=str(e))
            return []
    
    async def _process_batch(self, messages: List[tuple]):
        """Process multiple triggers efficiently"""
        emit_worker_log("info", f"Processing {len(messages)} triggers", trigger_count=len(messages))
        
        for msg_id, msg_data in messages:
            try:
                if isinstance(msg_data, dict):
                    message_str = msg_data.get("message", "{}")
                else:
                    message_str = "{}"
                
                payload = json.loads(message_str)
                await self._handle_trigger(payload)
                
                # Acknowledge: delete processed message
                event_hub.redis.xdel("stream:analytics_triggers", msg_id)
                self._metrics["triggers_processed"] += 1
                
            except Exception as e:
                self._metrics["workers_failed"] += 1
                self._record_failure(f"process_error:{type(e).__name__}")
                emit_worker_log("error", "Process error", error=str(e))
    
    # ====== Worker Execution (INSTRUMENTED) ======
    
    async def _handle_trigger(self, data: dict):
        """Launch worker with deduplication and metrics"""
        org_id = data.get("org_id")
        source_id = data.get("source_id")
        
        if not org_id or not source_id:
            emit_worker_log("warning", "Invalid trigger payload", payload=data)
            return
        
        worker_id = f"{org_id}:{source_id}"
        
        # Skip if already running
        if worker_id in self.active_workers and not self.active_workers[worker_id].done():
            emit_worker_log("debug", "Worker already running", worker_id=worker_id)
            return
        
        # Spawn worker
        start_time = time.time()
        task = asyncio.create_task(
            self._run_worker(worker_id, org_id, source_id, data),
            name=f"worker-{worker_id}"
        )
        self.active_workers[worker_id] = task
        
        # SRE: Update metrics
        self._metrics["workers_spawned"] += 1
        WorkerManagerMetrics.workers_spawned.labels(
            org_id=org_id, source_id=source_id
        ).inc()
        
        WorkerManagerMetrics.active_workers_gauge.labels(org_id=org_id).inc()
        
        emit_worker_log("info", "Worker spawned", 
                       worker_id=worker_id, org_id=org_id, source_id=source_id)
    
    async def _run_worker(self, worker_id: str, org_id: str, source_id: str, trigger_data: dict):
        """Execute KPI computation with full instrumentation"""
        start_time = time.time()
        
        try:
            emit_worker_log("info", "Worker execution started", worker_id=worker_id)
            
            worker = AnalyticsWorker(org_id, source_id)
            results = await worker.run()
            
            duration_ms = (time.time() - start_time) * 1000
            self._metrics["total_latency_ms"] += duration_ms
            
            WorkerManagerMetrics.worker_duration.labels(
                org_id=org_id, source_id=source_id
            ).observe(duration_ms / 1000)
            
            # Update active workers gauge
            WorkerManagerMetrics.active_workers_gauge.labels(org_id=org_id).dec()
            
            emit_worker_log("info", "Worker completed", 
                           worker_id=worker_id, duration_ms=round(duration_ms, 2))
            
            return results
            
        except Exception as e:
            self._metrics["workers_failed"] += 1
            self._record_failure(f"worker_error:{type(e).__name__}")
            
            WorkerManagerMetrics.workers_failed.labels(
                org_id=org_id, source_id=source_id, error_type=type(e).__name__
            ).inc()
            
            emit_worker_log("error", "Worker failed", 
                           worker_id=worker_id, error=str(e))
            
            raise
        
        finally:
            self.active_workers.pop(worker_id, None)
    
    # ====== SRE: Status & Metrics ======
    
    def get_metrics(self) -> Dict[str, Any]:
        """SRE: Get current metrics snapshot"""
        return {
            **self._metrics,
            "active_workers": len(self.active_workers),
            "consecutive_empty": self.consecutive_empty,
            "backoff_interval": self._get_backoff_interval(),
            "circuit_breaker": {
                "open": self._circuit_breaker["is_open"],
                "failure_count": self._circuit_breaker["failure_count"]
            },
            "pubsub_mode": self._pubsub is not None
        }
    
    def shutdown(self):
        """Graceful shutdown with SRE cleanup"""
        self._shutdown = True
        
        # Close pub/sub connection
        if self._pubsub:
            try:
                asyncio.run_coroutine_threadsafe(
                    asyncio.to_thread(self._pubsub.close),
                    asyncio.get_event_loop()
                )
            except:
                pass
        
        emit_worker_log("warning", "Shutdown initiated", 
                       active_workers=len(self.active_workers))
        
        # Wait for active workers to complete
        if self.active_workers:
            pending = list(self.active_workers.values())
            asyncio.gather(*pending, return_exceptions=True)
        
        emit_worker_log("info", "Shutdown completed")


# ==================== FastAPI Integration ====================

_worker_manager_instance: Optional[WorkerManager] = None


async def get_worker_manager() -> WorkerManager:
    """Singleton manager factory"""
    global _worker_manager_instance
    if _worker_manager_instance is None:
        _worker_manager_instance = WorkerManager()
    return _worker_manager_instance


async def trigger_kpi_computation(org_id: str, source_id: str) -> Dict[str, Any]:
    """
    🎯 Endpoint handler - triggers worker via pub/sub or stream
    Now emits SRE metrics for tracking
    """
    try:
        manager = await get_worker_manager()
        
        # Publish to pub/sub if available (TCP Redis)
        if hasattr(event_hub.redis, 'pubsub') and not event_hub.is_rest_api:
            channel = "stream:analytics_triggers"
            payload = {
                "org_id": org_id,
                "source_id": source_id,
                "type": "kpi_compute",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            await asyncio.to_thread(
                event_hub.publish,
                channel,
                json.dumps(payload)
            )
            
            WorkerManagerMetrics.triggers_received.labels(
                org_id=org_id, source_id=source_id
            ).inc()
            
            emit_worker_log("info", "Trigger published via pub/sub", 
                           org_id=org_id, source_id=source_id)
        else:
            # Fall back to stream (Upstash)
            event_hub.redis.xadd(
                "stream:analytics_triggers",
                {"message": json.dumps({
                    "org_id": org_id,
                    "source_id": source_id,
                    "type": "kpi_compute",
                    "timestamp": datetime.utcnow().isoformat()
                })}
            )
            
            emit_worker_log("info", "Trigger published via stream (fallback)", 
                           org_id=org_id, source_id=source_id)
        
        return {
            "status": "triggered",
            "org_id": org_id,
            "source_id": source_id,
            "mode": "pubsub" if hasattr(event_hub.redis, 'pubsub') and not event_hub.is_rest_api else "stream"
        }
        
    except Exception as e:
        emit_worker_log("error", "Trigger failed", error=str(e))
        return {"status": "error", "message": str(e)}


async def continuous_kpi_refresh(manager: WorkerManager):
    """Background refresh (optional, unchanged logic)"""
    await asyncio.sleep(10)
    
    while True:
        try:
            manager = await get_worker_manager()
            keys = event_hub.redis.keys("entity:*:*")
            
            for key in keys[:10]:
                key_str = key.decode() if isinstance(key, bytes) else key
                _, org_id, source_id = key_str.split(":")
                
                if f"{org_id}:{source_id}" in manager.active_workers:
                    continue
                
                cache_key = f"kpi_cache:{org_id}:{source_id}"
                if event_hub.redis.exists(cache_key):
                    continue
                
                await trigger_kpi_computation(org_id, source_id)
                await asyncio.sleep(1)
            
        except Exception as e:
            emit_worker_log("error", "Background refresh error", error=str(e))
        
        await asyncio.sleep(300)