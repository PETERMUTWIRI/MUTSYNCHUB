"""
app/routers/health.py – SRE LOG AGGREGATION HUB
===============================================
Central observability endpoint aggregating logs from all refactored services:
- Analytics Worker
- Vector Service
- LLM Service  
- Mapper/Detector
- Database Connections

Provides real-time logs, error rates, and service-specific diagnostics.
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Path
from typing import Dict, Any, List, Optional
import os
import time
import json
import logging
import threading
import asyncio
import torch
import datetime
from datetime import timedelta
from app.deps import (
    check_all_services, get_redis, get_vector_db, get_duckdb, 
    get_sre_metrics, HF_API_TOKEN, close_all_connections
)
from app.db import get_db_stats
from app.service.llm_service import LocalLLMService, get_llm_service
from app.tasks.analytics_worker import get_worker_manager
from app.service.vector_service import VectorService
from app.mapper import health_check_mapper, MapperMetrics
from fastapi.responses import StreamingResponse, Response
from app.core.sre_logging import log_aggregator, emit_worker_log, emit_vector_log, emit_llm_log, emit_mapper_log, emit_deps_log

# Prometheus aggregation
try:
    from prometheus_client import generate_latest, CollectorRegistry, CONTENT_TYPE_LATEST, Gauge
except ImportError:
    CONTENT_TYPE_LATEST = "text/plain; version=0.0.4; charset=utf-8"
    Gauge = None

logger = logging.getLogger(__name__)
from app.mapper import health_check_mapper, MapperMetrics

# Prometheus aggregation
try:
    from prometheus_client import generate_latest, CollectorRegistry, CONTENT_TYPE_LATEST
except ImportError:
    CONTENT_TYPE_LATEST = "text/plain; version=0.0.4; charset=utf-8"

logger = logging.getLogger(__name__)
router = APIRouter(tags=["health"])


# ---------------------- SRE: Unified Health Endpoint ---------------------- #

@router.get("/health")
async def health_check():
    """Aggregated health status from all services"""
    start_time = time.time()
    
    # Check all core services
    service_status = check_all_services()
    
    # Check worker manager health
    try:
        manager = await get_worker_manager()
        worker_metrics = manager.get_metrics()
        worker_healthy = len(worker_metrics.get("active_workers", [])) < 50  # Arbitrary threshold
    except Exception as e:
        worker_healthy = False
        service_status["worker_manager"] = f"❌ {e}"
    
    # Check LLM service
    try:
        llm = get_llm_service()
        llm_health = llm.health_check()
        llm_healthy = llm_health["status"] == "healthy"
    except Exception as e:
        llm_healthy = False
        service_status["llm_service"] = f"❌ {e}"
    
    # Check mapper cache health
    try:
        mapper_health = health_check_mapper()
        mapper_healthy = mapper_health["status"] == "healthy"
    except Exception as e:
        mapper_healthy = False
        service_status["mapper"] = f"❌ {e}"
    
    # Overall health determination
    all_healthy = (
        all("✅" in str(v) for v in service_status.values()) and
        worker_healthy and llm_healthy and mapper_healthy
    )
    
    # Emit aggregated health log
    log_aggregator.emit(
        "health_router", "info" if all_healthy else "error",
        "Health check completed",
        all_healthy=all_healthy,
        services_checked=len(service_status),
        duration_ms=(time.time() - start_time) * 1000
    )
    
    return {
        "status": "healthy" if all_healthy else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime_seconds": time.time() - start_time,
        "environment": "production" if os.getenv("SPACE_ID") else "development",
        "services": {
            **service_status,
            "worker_manager": "✅ healthy" if worker_healthy else "❌ unhealthy",
            "llm_service": "✅ healthy" if llm_healthy else "❌ unhealthy",
            "mapper": "✅ healthy" if mapper_healthy else "❌ unhealthy"
        },
        "sre_metrics": get_sre_metrics(),
        "_links": {
            "logs": "/health/logs",
            "metrics": "/health/metrics",
            "status": "/health/status"
        }
    }

# ---------------------- SRE: Real-Time Log Streaming ---------------------- #

@router.get("/health/logs")
async def get_service_logs(
    service: Optional[str] = Query(None, description="Filter by service (analytics_worker, vector_service, llm_service, mapper, dependencies)"),
    level: Optional[str] = Query(None, description="Filter by level (info, warning, error, critical)"),
    limit: int = Query(100, ge=1, le=1000, description="Number of logs to return"),
    tail: bool = Query(False, description="Stream logs in real-time (SSE)")
):
    """
    Retrieve recent logs from all services or filter by service/level.
    
    Examples:
    - GET /health/logs?service=vector_service&level=error
    - GET /health/logs?service=analytics_worker&tail=true (SSE stream)
    """
    if tail:
        # SSE streaming of logs
        async def log_stream():
            last_count = len(log_aggregator.buffer)
            while True:
                current_count = len(log_aggregator.buffer)
                if current_count > last_count:
                    new_logs = log_aggregator.buffer[last_count:]
                    for log in new_logs:
                        if (not service or log["service"] == service) and (not level or log["level"] == level):
                            yield f"data: {json.dumps(log)}\n\n"
                    last_count = current_count
                await asyncio.sleep(0.5)
        
        return StreamingResponse(
            log_stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache"}
        )
    
    # Return historical logs
    logs = log_aggregator.get_logs(service=service, level=level, limit=limit)
    
    return {
        "status": "success",
        "logs": logs,
        "total": len(logs),
        "service": service or "all",
        "level": level or "all"
    }

# ---------------------- SRE: Error Rate Tracking ---------------------- #

@router.get("/health/error-rates")
async def get_error_rates(
    window_minutes: int = Query(5, ge=1, le=60, description="Time window in minutes")
):
    """Get error rates for all services over the specified time window"""
    services = ["analytics_worker", "vector_service", "llm_service", "mapper", "dependencies"]
    
    rates = {}
    for service in services:
        rates[service] = {
            "error_rate": log_aggregator.get_error_rate(service, window_minutes),
            "window_minutes": window_minutes
        }
    
    # Overall system error rate
    total_logs = sum(len([log for log in log_aggregator.buffer if log["timestamp"] >= (datetime.utcnow() - timedelta(minutes=window_minutes)).isoformat()]) for _ in services)
    total_errors = sum(len([log for log in log_aggregator.buffer if log["level"] in ("error", "critical") and log["timestamp"] >= (datetime.utcnow() - timedelta(minutes=window_minutes)).isoformat()]) for _ in services)
    
    overall_rate = total_errors / total_logs if total_logs > 0 else 0.0
    
    # Alert if error rate is high
    alert = overall_rate > 0.1  # 10% error rate threshold
    
    if alert:
        log_aggregator.emit("health_router", "error", "High system error rate detected", rate=overall_rate)
    
    return {
        "status": "healthy" if not alert else "alerting",
        "overall_error_rate": round(overall_rate, 4),
        "service_rates": rates,
        "window_minutes": window_minutes,
        "alert": alert
    }

# ---------------------- SRE: Service-Specific Health ---------------------- #

@router.get("/health/workers")
async def health_workers():
    """Analytics worker health and metrics"""
    try:
        manager = await get_worker_manager()
        metrics = manager.get_metrics()
        
        # Get recent worker logs
        worker_logs = log_aggregator.get_logs(service="analytics_worker", limit=50)
        
        return {
            "status": "healthy" if metrics.get("workers_failed", 0) < 10 else "degraded",
            "active_workers": metrics.get("active_workers", 0),
            "triggers_processed": metrics.get("triggers_processed", 0),
            "workers_failed": metrics.get("workers_failed", 0),
            "total_latency_ms": metrics.get("total_latency_ms", 0),
            "recent_logs": worker_logs,
            "_links": {
                "logs": "/health/logs?service=analytics_worker",
                "stream": "/api/v1/analytics/stream/sse"
            }
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

@router.get("/health/vectors")
async def health_vectors():
    """Vector service health and metrics"""
    try:
        # Create a dummy vector service to check health
        vector_service = VectorService(org_id="health_check")
        
        # Get recent vector logs
        vector_logs = log_aggregator.get_logs(service="vector_service", limit=50)
        
        return {
            "status": "healthy",
            "model_cached": len(vector_service._global_model_cache) > 0,
            "redis_type": "tcp" if hasattr(vector_service.vector_conn, 'pubsub') else "upstash",
            "recent_logs": vector_logs,
            "circuit_breaker": vector_service._check_circuit_breaker(),
            "_links": {
                "logs": "/health/logs?service=vector_service",
                "metrics": "/health/metrics/vector"
            }
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

@router.get("/health/llm")
async def health_llm():
    """LLM service health and metrics"""
    try:
        llm_service = get_llm_service()
        health = llm_service.health_check()
        
        # Get recent LLM logs
        llm_logs = log_aggregator.get_logs(service="llm_service", limit=50)
        
        return {
            **health,
            "recent_logs": llm_logs,
            "_links": {
                "logs": "/health/logs?service=llm_service",
                "generate": "/api/v1/generate"
            }
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

@router.get("/health/mapper")
async def health_mapper():
    """Mapper service health and metrics"""
    try:
        mapper_health = health_check_mapper()
        
        # Get recent mapper logs
        mapper_logs = log_aggregator.get_logs(service="mapper", limit=50)
        
        return {
            **mapper_health,
            "recent_logs": mapper_logs,
            "_links": {
                "logs": "/health/logs?service=mapper",
                "canonical_columns": len(mapper_health.get("canonical_columns", []))
            }
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

# ---------------------- SRE: Prometheus Metrics ---------------------- #

@router.get("/health/metrics")
async def get_prometheus_metrics():
    """
    Return aggregated Prometheus metrics from all services
    Compatible with Prometheus scraping
    """
    registry = CollectorRegistry()
    
    # Aggregate metrics from all services
    sre_metrics = get_sre_metrics()
    
    # Create gauges for SRE metrics
    for metric_name, values in sre_metrics.items():
        if isinstance(values, dict):
            gauge = Gauge(f'sre_{metric_name}', f'SRE {metric_name}', ['org_id'], registry=registry)
            for org_id, value in values.items():
                gauge.labels(org_id=org_id).set(value)
    
    # Add error rates
    error_rate_gauge = Gauge('system_error_rate', 'Overall system error rate', registry=registry)
    error_rate_gauge.set(log_aggregator.get_error_rate("all", 5))
    
    # Add service health status
    health_gauge = Gauge('service_health', 'Service health status (1=healthy)', ['service'], registry=registry)
    services = ["analytics_worker", "vector_service", "llm_service", "mapper", "dependencies"]
    for service in services:
        is_healthy = log_aggregator.get_error_rate(service, 5) < 0.1
        health_gauge.labels(service=service).set(1 if is_healthy else 0)
    
    return Response(
        content=generate_latest(registry),
        media_type=CONTENT_TYPE_LATEST
    )

# ---------------------- SRE: Shutdown Handler ---------------------- #

@router.post("/health/shutdown")
async def shutdown_services():
    """Graceful shutdown - close all connections"""
    try:
        # Shutdown LLM service
        llm_service = get_llm_service()
        if hasattr(llm_service, '_model') and llm_service._model:
            del llm_service._model
            if 'torch' in globals() and torch is not None:
                torch.cuda.empty_cache()
        
        # Shutdown worker manager
        manager = await get_worker_manager()
        manager.shutdown()
        
        # Shutdown LLM service again (if needed)
        llm_service = get_llm_service()
        if hasattr(llm_service, '_model') and llm_service._model:
            del llm_service._model
            if 'torch' in globals() and torch is not None:
                torch.cuda.empty_cache()
        
        log_aggregator.emit("health_router", "info", "Shutdown completed")
        
        return {"status": "shutdown_complete"}
    except Exception as e:
        log_aggregator.emit("health_router", "error", f"Shutdown failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))