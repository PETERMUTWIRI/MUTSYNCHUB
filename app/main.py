from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from app.routers import ingress, reports, flags, datasources, scheduler, run, health, socket, analytics
from app.tasks.scheduler import start_scheduler
from app.deps import verify_key
from contextlib import asynccontextmanager
import os

# ----------  lifespan  ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield

# ----------  app init  ----------
app = FastAPI(
    title="MutSyncHub Analytics Engine",
    version="2.2",
    lifespan=lifespan
)

# ----------  Socket.IO Mount  ----------
app.mount("/socket.io", socket.socket_app)

# ----------  Middleware (fix order) ----------
@app.middleware("http")
async def serialize_all_responses(request, call_next):
    """Ensure all responses are safely JSON-serializable."""
    response = await call_next(request)
    if isinstance(response, dict):
        return JSONResponse(content=jsonable_encoder(response))
    return response

# ----------  CORS Configuration ----------
origins = [
    "https://mut-sync-hub.vercel.app",  # live frontend
    "http://localhost:3000",            # local dev
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------  Routers ----------
app.include_router(health.router)  # public route (no key)
app.include_router(datasources.router, dependencies=[Depends(verify_key)])
app.include_router(reports.router, dependencies=[Depends(verify_key)])
app.include_router(flags.router, dependencies=[Depends(verify_key)])
app.include_router(scheduler.router, dependencies=[Depends(verify_key)])
app.include_router(run.router, dependencies=[Depends(verify_key)])
app.include_router(socket.router)
app.include_router(analytics.router, dependencies=[Depends(verify_key)])

# ----------  Public Health Endpoint ----------
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "analytics-engine"}
