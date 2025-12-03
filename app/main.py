# app/main.py – ENTERPRISE ANALYTICS ENGINE v3.0
"""
MutSyncHub Analytics Engine
Enterprise-grade AI analytics platform with zero-cost inference
# """
import logging
import os
import time
import uuid
import subprocess
import asyncio
import threading
import pathlib 
import json 

# # ─── Third-Party ──────────────────────────────────────────────────────────────
from fastapi import FastAPI, Depends, HTTPException, Request, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

# ─── Internal Imports ─────────────────────────────────────────────────────────
from app.core.event_hub import event_hub
# NOTE: worker_manager is now created via async factory `get_worker_manager()`
# Old import kept as comment for reference:
# from app.core.worker_manager import worker_manager
from app.core.worker_manager import get_worker_manager
from app.deps import rate_limit_org, verify_api_key, check_all_services
from app.tasks.analytics_worker import trigger_kpi_computation
from app.service.vector_service import cleanup_expired_vectors
from app.routers import health, datasources, reports, flags, scheduler, analytics_stream,ai_query,schema
from app.service.llm_service import load_llm_service
from app.deps import get_qstash_client
from prometheus_client import make_asgi_app
# ─── Logger Configuration ───────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

def safe_redis_decode(value):
    """Safely decode Redis values that might be bytes or str"""
    if isinstance(value, bytes):
        return value.decode('utf-8')
    return value
# ─── Lifespan Management ───────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Enterprise startup/shutdown sequence with health validation.
    """
    # ─── Startup ───────────────────────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("🚀 ANALYTICS ENGINE v3.0 - STARTUP SEQUENCE")
    logger.info("=" * 60)
    
    app.state.instance_id = f"engine-{uuid.uuid4().hex[:8]}"
    logger.info(f"Instance ID: {app.state.instance_id}")
    logger.info("🚀 STARTUP SEQUENCE")
    
    # ✅ CRITICAL: Set persistent cache dir (survives restarts)
    os.makedirs("/data/hf_cache", exist_ok=True)
    os.environ["HF_HOME"] = "/data/hf_cache"
    os.environ["TRANSFORMERS_CACHE"] = "/data/hf_cache"
    os.environ["HF_HUB_CACHE"] = "/data/hf_cache"
    
    # Set Hugging Face cache symlink (if needed)
    cache_dir = pathlib.Path("/data/hf_cache")
    home_cache = pathlib.Path.home() / ".cache" / "huggingface"
    if not home_cache.exists():
        home_cache.parent.mkdir(parents=True, exist_ok=True)
        home_cache.symlink_to(cache_dir)
    # Validate service health on boot
    try:
        services = check_all_services()
        healthy = [k for k, v in services.items() if "✅" in str(v)]
        unhealthy = [k for k, v in services.items() if "❌" in str(v)]
        
        logger.info(f"✅ Healthy: {len(healthy)} services")
        for svc in healthy:
            logger.info(f"   → {svc}: {services[svc]}")
        
        if unhealthy:
            logger.warning(f"⚠️ Unhealthy: {len(unhealthy)} services")
            for svc in unhealthy:
                logger.warning(f"   → {svc}: {services[svc]}")
        
    except Exception as e:
        logger.error(f"🔴 Startup health check failed: {e}")
    
    # Start scheduler in background (optional - controllable via env)
    scheduler_process = None
    if os.getenv("DISABLE_SCHEDULER") != "1":
        try:
            scheduler_process = subprocess.Popen(["python", "/app/scheduler_loop.py"])
            logger.info(f"✅ Scheduler started (PID: {scheduler_process.pid})")
        except Exception as e:
            logger.warning(f"⚠️ Scheduler failed to start: {e}")
    else:
        logger.info("ℹ️ Scheduler start skipped (DISABLE_SCHEDULER=1)")
    
    logger.info("✅ Startup sequence complete")

    
   
    # ✅ start worker manager listener (optional)
    if os.getenv("DISABLE_WORKER_MANAGER") != "1":
        logger.info("🚀 starting worker manager...")
        try:
            # Use the async factory to get the singleton manager instance
            worker_manager = await get_worker_manager()
            asyncio.create_task(worker_manager.start_listener(), name="worker-manager")
        except Exception as e:
            logger.error(f"❌ Failed to start worker manager: {e}")
    else:
        logger.info("ℹ️ Worker manager start skipped (DISABLE_WORKER_MANAGER=1)")
    # Now load optional services (LLM, QStash)
    if os.getenv("DISABLE_LLM_LOAD") != "1":
        try:
            load_llm_service()  # Starts background loading
            logger.info("🤖 LLM service loading in background...")
        except Exception as e:
            logger.error(f"❌ LLM load failed: {e}")
    else:
        logger.info("ℹ️ LLM loading skipped (DISABLE_LLM_LOAD=1)")

    # QStash client is optional; guard behind env var
    if os.getenv("DISABLE_QSTASH") != "1":
        try:
            get_qstash_client()  # This creates the singleton if not exists
            logger.info("✅ QStash ready")
        except RuntimeError as e:
            logger.warning(f"⚠️ QStash disabled: {e}")
    else:
        logger.info("ℹ️ QStash initialization skipped (DISABLE_QSTASH=1)")
    yield
    
    # ─── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("🛑 ANALYTICS ENGINE - SHUTDOWN SEQUENCE")
    logger.info("=" * 60)
    
    # Close scheduler
    scheduler_process.terminate()
    logger.info("   → Stopped scheduler")
    
    # Close all database connections
    from app.deps import _org_db_connections, _vector_db_conn
    
    if _org_db_connections:
        for org_id, conn in _org_db_connections.items():
            try:
                conn.close()
                logger.info(f"   → Closed DB: {org_id}")
            except Exception:
                pass
    
    if _vector_db_conn:
        try:
            _vector_db_conn.close()
            logger.info("   → Closed Vector DB")
        except Exception:
            pass
    
    logger.info("✅ Shutdown complete")

# ─── FastAPI Application ───────────────────────────────────────────────────────
app = FastAPI(
    title="MutSyncHub Analytics Engine",
    version="3.0.0",
    description="""Enterprise-grade AI analytics engine with:
    
    • Hybrid entity detection (Rule-based + LLM)
    • Vector similarity search (DuckDB VSS)
    • Zero external API costs (Local Mistral-7B)
    • Multi-tenant data isolation
    • Redis-backed async processing
    
    **🔒 All endpoints require X-API-KEY header except /health**""",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    contact={
        "name": "MutSyncHub Enterprise",
        "email": "enterprise@mutsynchub.com"
    },
    license_info={
        "name": "MIT License",
    }
)
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)  

# ─── Startup Workers ───────────────────────────────────────────────────────────
@app.on_event("startup")
async def start_workers():
    """🚀 Start Einstein+Elon engine"""
    
    # 1. Redis listener (triggers AnalyticsWorker)
    # Redis listener removed; worker manager now handles trigger events
    logger.info("✅ Worker manager will handle trigger events")
    
    # 2. Vector cleanup (daily)
    def run_cleanup():
        while True:
            cleanup_expired_vectors()
            time.sleep(86400)  # 24 hours
    
    cleanup_thread = threading.Thread(target=run_cleanup, daemon=True)
    cleanup_thread.start()
    logger.info("✅ Vector cleanup scheduler started")

# ─── Request ID Middleware ─────────────────────────────────────────────────────
@app.middleware("http")
async def add_request_tracking(request: Request, call_next):
    """
    Add request ID and timing for observability.
    """
    request_id = f"req-{uuid.uuid4().hex[:12]}"
    request.state.request_id = request_id
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Add headers
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{process_time:.3f}s"
    
    # Log
    logger.info(
        f"{request.method} {request.url.path} | {response.status_code} "
        f"| {process_time:.3f}s | {request_id}"
    )
    
    return response

# ─── KPI Computation Endpoint ──────────────────────────────────────────────────
# ─── KPI Computation Endpoint ──────────────────────────────────────────────────
# At top of app/main.py - add import


# Replace the compute_kpis function
@app.post("/api/v1/kpi/compute")
async def compute_kpis(
    background_tasks: BackgroundTasks,
    org_id: str = Query(..., description="Organization ID"),
    source_id: str = Query(..., description="Data source ID"),
    api_key: str = Depends(verify_api_key),  # ✅ Returns string, not HTTPAuthorizationCredentials
    limited_org: str = Depends(rate_limit_org(max_requests=50))
):
    """
    Trigger KPI computation.
    Returns immediately; results published to Redis stream.
    """
    try:
        # Check cache first
        cached = event_hub.get_key(f"kpi_cache:{org_id}:{source_id}")
        if cached:
            return {
                "status": "cached",
                "org_id": org_id,
                "data": json.loads(cached),
                "rate_limit": {
                    "remaining": 50,
                    "reset_in": 60
                }
            }
        
        
        background_tasks.add_task(trigger_kpi_computation, org_id, source_id)
        
        return {
            "status": "processing",
            "org_id": org_id,
            "message": "KPI computation queued. Poll /analytics/stream/recent for results.",
            "poll_url": f"/api/v1/analytics/stream/recent?org_id={org_id}&source_id={source_id}"
        }
    except Exception as e:
        logger.error(f"❌ KPI compute error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── Background KPI Scheduler ──────────────────────────────────────────────────
async def continuous_kpi_refresh():
    """
    Auto-refresh KPIs every 5 minutes for active organizations.
    """
    await asyncio.sleep(10)  # Let app startup complete
    
    while True:
        try:
            logger.debug("🔄 KPI scheduler tick...")
            
            active_keys = event_hub.keys("entity:*")
            for key in active_keys[:10]:  # Max 10 per batch
                key_parts = safe_redis_decode(key).split(":")
                if len(key_parts) >= 3:
                    org_id, source_id = key_parts[1], key_parts[2]

                    # Skip if recently computed
                    cache_key = f"kpi_cache:{org_id}:{source_id}"
                    if event_hub.exists(cache_key):
                        continue

                    # Skip if worker already running
                    if event_hub.exists(f"worker:lock:{org_id}:{source_id}"):
                        continue

                    # Trigger computation
                    logger.info(f"⏰ Auto-triggering KPIs for {org_id}/{source_id}")
                    await trigger_kpi_computation(org_id, source_id)
                    await asyncio.sleep(1)  # 1s gap between triggers
            
        except Exception as e:
            logger.error(f"❌ Scheduler error: {e}")
        
        await asyncio.sleep(300)  # ⭐ CRITICAL: Sleep 5 minutes between cycles
@app.get("/debug/stream-content")
def debug_stream(
    org_id: str = Query(...),
    source_id: str = Query(...),
    api_key: str = Depends(verify_api_key)
):
    """See what's actually in the Redis stream"""
    stream_key = f"stream:analytics:{org_id}:{source_id}"
    events = event_hub.read_recent_stream(stream_key, 10)
    
    # Also check for entity/industry keys
    entity_key = f"entity:{org_id}:{source_id}"
    industry_key = f"industry:{org_id}:{source_id}"
    
    return {
        "stream_key": stream_key,
        "events_count": len(events),
        "events": events,
        "entity_exists": bool(event_hub.get_key(entity_key)),
        "industry_exists": bool(event_hub.get_key(industry_key)),
        "entity_data": event_hub.get_key(entity_key),
        "industry_data": event_hub.get_key(industry_key),
    }
@app.post("/api/v1/cache/clear")
def clear_cache(org_id: str, source_id: str, api_key: str = Depends(verify_api_key)):
    """Clear entity/industry caches to force fresh reads"""
    cache_key = (org_id, source_id)
    
    # Import the cache dicts
    from app.mapper import _ENTITY_CACHE, _INDUSTRY_CACHE
    
    if cache_key in _ENTITY_CACHE:
        del _ENTITY_CACHE[cache_key]
    if cache_key in _INDUSTRY_CACHE:
        del _INDUSTRY_CACHE[cache_key]
    
    return {"status": "cleared", "cache_key": str(cache_key)}

# ─── Root Endpoint ─────────────────────────────────────────────────────────────
@app.get("/", tags=["root"])
def read_root():
    """
    Service information and discovery.
    """
    return {
        "status": "operational",
        "service": "MutSyncHub Analytics Engine",
        "version": "3.0.0",
        "mode": "production" if os.getenv("SPACE_ID") else "development",
        "instance_id": app.state.instance_id,
        "endpoints": {
            "docs": "/api/docs",
            "health": "/api/health/detailed",
            "datasources": "/api/datasources",
        },
        "features": [
            "Hybrid entity detection",
            "Vector similarity search",
            "Multi-tenant isolation",
            "Redis-backed async processing"
        ]
    }

# ─── CORS Configuration ────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    "https://mut-sync-hub.vercel.app",
    "http://localhost:3000",
    "https://studio.huggingface.co",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Response-Time"],
    max_age=3600,
)

# ─── Global Error Handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch all uncaught exceptions and return safe error response.
    """
    logger.error(
        f"🔴 Unhandled error | Path: {request.url.path} | "
        f"Request ID: {request.state.request_id} | Error: {str(exc)}",
        exc_info=True
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Check server logs.",
            "request_id": request.state.request_id,
            "timestamp": time.time()
        }
    )

# ─── Router Registration ───────────────────────────────────────────────────────
# Register routers (explicitly, no loops)
app.include_router(health.router, prefix="/health")
app.include_router(datasources.router, prefix="/api/v1/datasources", dependencies=[Depends(verify_api_key)])
app.include_router(reports.router, prefix="/api/v1/reports", dependencies=[Depends(verify_api_key)])
app.include_router(flags.router, prefix="/api/v1/flags", dependencies=[Depends(verify_api_key)])
app.include_router(scheduler.router, prefix="/api/v1/scheduler", dependencies=[Depends(verify_api_key)])
app.include_router(analytics_stream.router, dependencies=[Depends(verify_api_key)])
app.include_router(ai_query.router, prefix="/api/v1/ai-query", dependencies=[Depends(verify_api_key)])
app.include_router(schema.router, prefix="/api/v1/schema", dependencies=[Depends(verify_api_key)])