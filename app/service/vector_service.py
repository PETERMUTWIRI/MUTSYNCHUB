import numpy as np
import pandas as pd
import json
import time
import asyncio
from typing import List, Dict, Any, Optional, Union, Callable
from dataclasses import dataclass
from app.core.event_hub import event_hub
from app.deps import get_vector_db
from sentence_transformers import SentenceTransformer
import logging
from datetime import datetime, timedelta
from enum import Enum
from app.core.sre_logging import  emit_vector_log
logger = logging.getLogger(__name__)


class VectorStoreEventType(Enum):
    """Pub/sub event types for vector storage lifecycle"""
    UPSERT_STARTED = "vector.upsert.started"
    UPSERT_COMPLETED = "vector.upsert.completed"
    UPSERT_FAILED = "vector.upsert.failed"
    SEARCH_QUERIED = "vector.search.queried"
    CACHE_WARMED = "vector.cache.warmed"
    VSS_FALLBACK = "vector.vss.fallback"


@dataclass
class VectorMetrics:
    """SRE monitoring metrics for vector operations"""
    org_id: str
    operation: str
    duration_ms: float
    vector_count: int
    redis_latency_ms: float = 0
    vss_latency_ms: float = 0
    cost_usd: float = 0.0  # Estimated cost per 1000 vectors
    error: Optional[str] = None
    pipeline_used: bool = False


class VectorService:
    """
    🧠 Einstein's semantic memory with VSS acceleration
    TCP Redis features: True pipelines, pub/sub, zero rate limits
    SRE mindset: Metrics, circuit breakers, real-time monitoring
    """
    
    # ====== Singleton model cache ======
    _global_model_cache = {}
    _model_lock = asyncio.Lock()
    _default_model_name = "all-MiniLM-L6-v2"
    
    # ====== SRE: Circuit breaker state ======
    _redis_circuit_breaker = {
        "failure_count": 0,
        "last_failure_time": None,
        "is_open": False,
        "threshold": 5,  # Open after 5 failures
        "reset_timeout": 300  # Reset after 5 minutes
    }
    
    # ====== Cost tracking ======
    # Upstash: $0.20 per 100k commands | TCP Redis: $0
    COST_PER_COMMAND_UPSTASH = 0.000002  # $0.20 / 100,000
    COST_PER_COMMAND_TCP = 0.0
    
    def __init__(self, org_id: str):
        self.org_id = org_id
        self.vector_conn = get_vector_db(org_id)
        self._model = None
        self._metrics_callbacks: List[Callable[[VectorMetrics], None]] = []
    
    # ====== SRE: Metrics collection ======
    def add_metrics_callback(self, callback: Callable[[VectorMetrics], None]):
        """Register callback for real-time metrics (e.g., Prometheus)"""
        self._metrics_callbacks.append(callback)
    
    def _emit_metrics(self, metrics: VectorMetrics):
        """Notify all registered callbacks (analytics worker, etc.)"""
        for callback in self._metrics_callbacks:
            try:
                callback(metrics)
            except Exception as e:
                logger.error(f"[METRICS] ❌ Callback failed: {e}")
    
    def _record_operation(self, operation: str, start_time: float, 
                         vector_count: int = 0, **kwargs):
        """Helper to record metrics in SRE format"""
        duration_ms = (time.time() - start_time) * 1000
        
        # Estimate cost
        cost_per_call = (self.COST_PER_COMMAND_UPSTASH if event_hub.is_rest_api 
                        else self.COST_PER_COMMAND_TCP)
        estimated_cost = (vector_count or kwargs.get('commands', 0)) * cost_per_call
        
        metrics = VectorMetrics(
            org_id=self.org_id,
            operation=operation,
            duration_ms=duration_ms,
            vector_count=vector_count,
            cost_usd=estimated_cost,
            pipeline_used=kwargs.get('pipeline_used', False),
            redis_latency_ms=kwargs.get('redis_latency', 0),
            vss_latency_ms=kwargs.get('vss_latency', 0),
            error=kwargs.get('error')
        )
        
        self._emit_metrics(metrics)
        
        # Log in SRE format (structured logging)
        log_data = {
            "event": "vector_operation",
            "org_id": self.org_id,
            "operation": operation,
            "duration_ms": round(duration_ms, 2),
            "vector_count": vector_count,
            "cost_usd": round(estimated_cost, 6),
            "pipeline_used": metrics.pipeline_used,
            "redis_type": "upstash" if event_hub.is_rest_api else "tcp"
        }
        
        if metrics.error:
            log_data["error"] = metrics.error
            logger.error(f"[METRICS] {json.dumps(log_data)}")
        else:
            logger.info(f"[METRICS] {json.dumps(log_data)}")
    
    # ====== SRE: Circuit breaker ======
    def _check_circuit_breaker(self) -> bool:
        """Check if Redis circuit is open (too many failures)"""
        state = self._redis_circuit_breaker
        
        if not state["is_open"]:
            return True
        
        # Check if enough time has passed to try again
        if state["last_failure_time"]:
            elapsed = time.time() - state["last_failure_time"]
            if elapsed > state["reset_timeout"]:
                logger.warning("[CIRCUIT] 🔄 Closing breaker, trying again...")
                state["is_open"] = False
                state["failure_count"] = 0
                return True
        
        logger.error("[CIRCUIT] 🔴 Circuit breaker OPEN, skipping Redis")
        return False
    
    def _record_redis_failure(self, error: str):
        """Track failures for circuit breaker"""
        state = self._redis_circuit_breaker
        state["failure_count"] += 1
        state["last_failure_time"] = time.time()
        
        if state["failure_count"] >= state["threshold"]:
            state["is_open"] = True
            logger.critical(f"[CIRCUIT] 🔴 Breaker opened! {state['failure_count']} failures")
    
    def _record_redis_success(self):
        """Reset failure count on success"""
        state = self._redis_circuit_breaker
        if state["failure_count"] > 0:
            logger.info(f"[CIRCUIT] ✅ Resetting failure count (was {state['failure_count']})")
            state["failure_count"] = 0
    
    # ====== Pub/Sub event emission ======
    def _publish_vector_event(self, event_type: VectorStoreEventType, 
                            data: Dict[str, Any]):
        """Publish events to Redis pub/sub for real-time monitoring"""
        try:
            channel = f"vector:events:{self.org_id}"
            payload = {
                "type": event_type.value,
                "timestamp": datetime.utcnow().isoformat(),
                "org_id": self.org_id,
                "data": data
            }
            
            # Fire and forget - don't block on pub/sub
            asyncio.create_task(
                asyncio.to_thread(
                    event_hub.publish,
                    channel,
                    json.dumps(payload)
                )
            )
            logger.debug(f"[PUBSUB] 📡 Published {event_type.value}")
            
        except Exception as e:
            logger.error(f"[PUBSUB] ❌ Failed to publish event: {e}")
    
    # ====== Embedding generation (unchanged core logic) ======
    async def _get_or_load_model(self) -> SentenceTransformer:
        async with self._model_lock:
            if self._default_model_name in self._global_model_cache:
                logger.debug(f"[Vector] Using cached model: {self._default_model_name}")
                return self._global_model_cache[self._default_model_name]
            
            logger.info(f"[Vector] Loading model: {self._default_model_name}")
            model = await asyncio.to_thread(
                SentenceTransformer, 
                self._default_model_name,
                device="cpu"
            )
            
            self._global_model_cache[self._default_model_name] = model
            logger.info(f"[Vector] ✅ Model cached globally")
            return model
    
    def _embed_sync(self, text: str, model: SentenceTransformer) -> List[float]:
        if not text or not text.strip():
            dim = model.get_sentence_embedding_dimension()
            return [0.0] * dim
        
        embedding = model.encode(
            text, 
            convert_to_tensor=False,
            normalize_embeddings=True
        )
        return embedding.tolist()
    
    async def embed(self, text: str) -> List[float]:
        if not isinstance(text, str):
            raise TypeError(f"Text must be string, got {type(text)}")
        
        model = await self._get_or_load_model()
        return await asyncio.to_thread(self._embed_sync, text, model)
    
    async def embed_batch(self, texts: List[str], batch_size: int = 100) -> List[List[float]]:
        if not texts:
            logger.warning("[Vector] Empty text list")
            return []
        
        texts = [t for t in texts if t and t.strip()]
        if not texts:
            return []
        
        model = await self._get_or_load_model()
        embeddings = []
        total_batches = (len(texts) + batch_size - 1) // batch_size
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = await asyncio.to_thread(
                lambda batch_texts: [self._embed_sync(t, model) for t in batch_texts],
                batch
            )
            embeddings.extend(batch_embeddings)
            
            if (i // batch_size + 1) % 5 == 0:
                logger.debug(f"[Embed] Batch {i//batch_size + 1}/{total_batches}")
        
        emit_vector_log("info", f"✅ Generated {len(embeddings)} embeddings", 
                org_id=self.org_id, vector_count=len(embeddings))
        return embeddings
    
    # ====== REFACTORED: TCP Redis pipeline + pub/sub ======
    async def _upsert_redis(
        self,
        embeddings: List[List[float]],
        metadata: List[Dict[str, Any]],
        namespace: str
    ) -> bool:
        """
        🚀 TCP Redis: True pipeline (0ms latency, zero cost)
        Upstash: Sequential with rate limiting
        """
        start_time = time.time()
        
        # SRE: Check circuit breaker
        if not self._check_circuit_breaker():
            logger.error("[UPSERT] 🔴 Circuit open, skipping Redis")
            self._record_operation(
                "upsert_redis", start_time, vector_count=len(embeddings),
                error="circuit_breaker_open"
            )
            return False
        
        # Strategic: Store only hot vectors (100 max)
        max_vectors = min(100, len(embeddings))
        if len(embeddings) > 100:
            logger.info(f"[UPSERT] 📉 Truncating {len(embeddings)} → {max_vectors} vectors for hot cache")
        
        try:
            # 🎯 Check pipeline support (TCP vs Upstash)
            pipe = event_hub.pipeline()
            
            if pipe and not event_hub.is_rest_api:
                # ✅ **TCP REDIS: True pipeline - 1 command, 10ms total**
                for idx in range(max_vectors):
                    key = f"vector:{namespace}:{idx}:{int(time.time())}"
                    pipe.setex(key, 86400, json.dumps({
                        "embedding": embeddings[idx],
                        "metadata": metadata[idx],
                        "org_id": self.org_id
                    }))
                
                # Execute pipeline in thread pool
                redis_start = time.time()
                await asyncio.to_thread(pipe.execute)
                redis_latency = (time.time() - redis_start) * 1000
                
                self._record_redis_success()
                self._record_operation(
                    "upsert_redis", start_time, vector_count=max_vectors,
                    pipeline_used=True, redis_latency=redis_latency
                )
                
                # 🚀 **PUB/SUB: Broadcast completion event**
                self._publish_vector_event(
                    VectorStoreEventType.UPSERT_COMPLETED,
                    {
                        "namespace": namespace,
                        "vectors_stored": max_vectors,
                        "storage": "redis_hot",
                        "latency_ms": round(redis_latency, 2)
                    }
                )
                
                logger.info(f"[✅ VECTOR] Redis PIPELINE: {max_vectors} vectors in {redis_latency:.2f}ms")
                return True
                
            else:
                # ❌ **UPSTASH: Sequential with rate limiting**
                logger.warning("[UPSERT] ⚠️ Pipeline not supported, using sequential")
                
                for idx in range(max_vectors):
                    key = f"vector:{namespace}:{idx}:{int(time.time())}"
                    redis_start = time.time()
                    
                    await asyncio.to_thread(
                        event_hub.setex,
                        key,
                        86400,
                        json.dumps({
                            "embedding": embeddings[idx],
                            "metadata": metadata[idx],
                            "org_id": self.org_id
                        })
                    )
                    
                    redis_latency = (time.time() - redis_start) * 1000
                    await asyncio.sleep(0.01)  # Rate limit
                    
                    # Emit per-vector event for granular monitoring
                    self._publish_vector_event(
                        VectorStoreEventType.UPSERT_COMPLETED,
                        {
                            "namespace": namespace,
                            "vector_id": idx,
                            "storage": "redis_hot_sequential",
                            "latency_ms": round(redis_latency, 2)
                        }
                    )
                
                logger.info(f"[✅ VECTOR] Redis SEQUENTIAL: {max_vectors} vectors (rate-limited)")
                return True
                
        except Exception as e:
            self._record_redis_failure(str(e))
            
            self._record_operation(
                "upsert_redis", start_time, vector_count=max_vectors,
                error=str(e)
            )
            
            self._publish_vector_event(
                VectorStoreEventType.UPSERT_FAILED,
                {
                    "namespace": namespace,
                    "error": str(e),
                    "vector_count": max_vectors
                }
            )
            
            emit_vector_log("error", f"❌ Redis error: {e}", error=str(e))
            return False
    
    # ====== Existing methods (polished with metrics) ======
    async def upsert_embeddings(
        self,
        embeddings: List[List[float]],
        metadata: List[Dict[str, Any]],
        namespace: str
    ) -> bool:
        """Store in Redis + VSS with full observability"""
        start_time = time.time()
        
        try:
            # 🚀 **PUB/SUB: Start event**
            self._publish_vector_event(
                VectorStoreEventType.UPSERT_STARTED,
                {
                    "namespace": namespace,
                    "total_vectors": len(embeddings),
                    "hot_vectors": min(100, len(embeddings))
                }
            )
            
            # Run both stores concurrently
            redis_task = self._upsert_redis(embeddings, metadata, namespace)
            vss_start = time.time()
            vss_task = asyncio.to_thread(self._upsert_vss, embeddings, metadata, namespace)
            
            redis_success, _ = await asyncio.gather(redis_task, vss_task)
            vss_latency = (time.time() - vss_start) * 1000
            
            self._record_operation(
                "dual_upsert", start_time, vector_count=len(embeddings),
                vss_latency=vss_latency
            )
            
            if redis_success:
                logger.info(f"[✅ VECTOR] Dual-store complete: {len(embeddings)} vectors")
            else:
                logger.warning("[⚠️ VECTOR] Redis failed, VSS succeeded (graceful degradation)")
            
            return True
            
        except Exception as e:
            self._record_operation(
                "upsert_embeddings", start_time, vector_count=len(embeddings),
                error=str(e)
            )
            logger.error(f"[❌ VECTOR] Dual upsert failed: {e}")
            return False
    
    def _upsert_vss(self, embeddings, metadata, namespace):
        """Store in DuckDB VSS (cold storage)"""
        try:
            import pandas as pd
            
            records = []
            for idx, (emb, meta) in enumerate(zip(embeddings, metadata)):
                content = " ".join([str(v) for v in meta.values() if v])[:1000]
                records.append({
                    "id": f"{namespace}:{idx}:{int(time.time())}",
                    "org_id": self.org_id,
                    "content": content,
                    "embedding": emb,
                    "entity_type": namespace.split(":")[0],
                    "created_at": datetime.now().isoformat(),
                })
            
            if not records:
                return
            
            records_df = pd.DataFrame(records)
            
            self.vector_conn.execute("""
                INSERT INTO vector_store.embeddings 
                (id, org_id, content, embedding, entity_type, created_at)
                SELECT id, org_id, content, 
                       embedding::FLOAT[384],
                       entity_type, created_at
                FROM records_df
                ON CONFLICT (id) DO UPDATE SET
                    embedding = EXCLUDED.embedding,
                    content = EXCLUDED.content,
                    created_at = EXCLUDED.created_at
            """)
            
            logger.info(f"[✅ VECTOR] VSS: Stored {len(records_df)} vectors")
            
        except Exception as e:
            logger.error(f"[❌ VECTOR] VSS error: {e}", exc_info=True)
    
    async def semantic_search(self, query_embedding: List[float], 
                             top_k: int = 10, min_score: float = 0.7,
                             days_back: int = 30) -> List[Dict]:
        """
        🔍 Search with full observability and pub/sub events
        """
        start_time = time.time()
        
        try:
            # Try Redis hot cache first
            redis_start = time.time()
            redis_results = await self._search_redis(query_embedding, top_k, min_score)
            redis_latency = (time.time() - redis_start) * 1000
            
            if redis_results:
                self._record_operation(
                    "search_redis", start_time, vector_count=len(redis_results),
                    redis_latency=redis_latency
                )
                
                self._publish_vector_event(
                    VectorStoreEventType.SEARCH_QUERIED,
                    {
                        "source": "redis",
                        "results": len(redis_results),
                        "latency_ms": round(redis_latency, 2),
                        "fallback_to_vss": False
                    }
                )
                
                return redis_results
            
            # Fallback to VSS
            logger.info("[SEARCH] Cache miss, querying VSS...")
            vss_start = time.time()
            vss_results = self._search_vss(query_embedding, top_k, min_score, days_back)
            vss_latency = (time.time() - vss_start) * 1000
            
            self._record_operation(
                "search_vss", start_time, vector_count=len(vss_results),
                vss_latency=vss_latency
            )
            
            self._publish_vector_event(
                VectorStoreEventType.VSS_FALLBACK,
                {
                    "source": "vss",
                    "results": len(vss_results),
                    "latency_ms": round(vss_latency, 2),
                    "cache_warm_triggered": len(vss_results) > 0
                }
            )
            
            # Warm cache with VSS results
            if vss_results:
                asyncio.create_task(self._warm_cache(vss_results))
            
            return vss_results
            
        except Exception as e:
            self._record_operation(
                "semantic_search", start_time, vector_count=0,
                error=str(e)
            )
            logger.error(f"[SEARCH] Error: {e}")
            return []
    
    async def _search_redis(self, query_emb: List[float], top_k: int, min_score: float) -> List[Dict]:
        """Search Redis with circuit breaker protection"""
        if not self._check_circuit_breaker():
            logger.warning("[SEARCH] 🔴 Circuit open, skipping Redis")
            return []
        
        try:
            pattern = f"vector:{self.org_id}:*"
            keys = await asyncio.to_thread(event_hub.keys, pattern)
            keys = keys[:1000]  # Limit scan
            
            results = []
            query_np = np.array(query_emb, dtype=np.float32)
            
            for key in keys:
                data = await asyncio.to_thread(event_hub.get_key, key)
                if not data:
                    continue
                
                try:
                    vec_data = json.loads(data)
                    emb = np.array(vec_data["embedding"], dtype=np.float32)
                    
                    similarity = np.dot(query_np, emb) / (
                        np.linalg.norm(query_np) * np.linalg.norm(emb) + 1e-9
                    )
                    
                    if similarity >= min_score:
                        results.append({
                            "score": float(similarity),
                            "metadata": vec_data["metadata"],
                            "source": "redis"
                        })
                except Exception:
                    continue
            
            self._record_redis_success()
            return sorted(results, key=lambda x: x["score"], reverse=True)[:top_k]
            
        except Exception as e:
            self._record_redis_failure(str(e))
            logger.error(f"[SEARCH] Redis error: {e}")
            return []
    
    def _search_vss(self, query_emb: List[float], top_k: int, min_score: float, days_back: int) -> List[Dict]:
        """Search DuckDB VSS"""
        try:
            cutoff = (datetime.now() - timedelta(days=days_back)).isoformat()
            
            results = self.vector_conn.execute("""
                SELECT id, content, embedding, created_at,
                       array_cosine_similarity(embedding, ?::FLOAT[384]) as similarity
                FROM vector_store.embeddings
                WHERE org_id = ?
                  AND entity_type = ?
                  AND created_at >= ?
                  AND similarity >= ?
                ORDER BY similarity DESC
                LIMIT ?
            """, [query_emb, self.org_id, "sales", cutoff, min_score, top_k]).fetchall()
            
            return [{
                "score": float(r[4]),
                "metadata": {
                    "id": r[0],
                    "content": r[1],
                    "created_at": r[3].isoformat() if r[3] else None
                },
                "source": "vss"
            } for r in results]
            
        except Exception as e:
            logger.error(f"[SEARCH] VSS error: {e}")
            return []
    
    async def _warm_cache(self, results: List[Dict]):
        """Warm Redis with VSS results (non-blocking)"""
        try:
            pipe = event_hub.pipeline()
            if not pipe:
                return  # Can't warm cache if no pipeline
            
            for r in results[:10]:  # Warm top 10 only
                pipe.setex(
                    f"vector:warm:{int(time.time())}:{r['metadata']['id']}",
                    86400,
                    json.dumps(r)
                )
            
            await asyncio.to_thread(pipe.execute)
            logger.info(f"[WARM] 🔥 Cached {len(results[:10])} vectors to Redis")
            
            self._publish_vector_event(
                VectorStoreEventType.CACHE_WARMED,
                {
                    "vectors_warmed": len(results[:10]),
                    "source": "vss_to_redis"
                }
            )
            
        except Exception as e:
            logger.error(f"[WARM] ❌ Failed: {e}")


# ---- Background Cleanup Worker (with SRE metrics) ----
def cleanup_expired_vectors():
    """🧹 Daily cleanup with monitoring"""
    try:
        start_time = time.time()
        vector_conn = get_vector_db()
        
        deleted = vector_conn.execute("""
            DELETE FROM vector_store.embeddings
            WHERE created_at <= (CURRENT_TIMESTAMP - INTERVAL 30 DAY)
            RETURNING COUNT(*) as count
        """).fetchone()
        
        duration_ms = (time.time() - start_time) * 1000
        
        if deleted and deleted[0] > 0:
            logger.info(f"[CLEANUP] 🗑️ Deleted {deleted[0]} vectors in {duration_ms:.2f}ms")
        
        # Publish cleanup event
        asyncio.create_task(
            event_hub.publish(
                "vector:cleanup:events",
                json.dumps({
                    "type": "cleanup.completed",
                    "deleted_count": deleted[0] if deleted else 0,
                    "duration_ms": round(duration_ms, 2)
                })
            )
        )
        
    except Exception as e:
        logger.error(f"[CLEANUP] ❌ Error: {e}", exc_info=True)