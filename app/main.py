from fastapi import FastAPI, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter, Query
from app.routers import ingress, reports, flags, datasources, scheduler, run, health,socket # ← health added
from app.tasks.scheduler import start_scheduler
from app.deps import verify_key
from contextlib import asynccontextmanager
import os
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


@app.middleware("http")
async def serialize_all_responses(request, call_next):
    response = await call_next(request)
    if isinstance(response, dict):
        return JSONResponse(content=jsonable_encoder(response))
    return response
# ----------  lifespan  ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield

# ----------  app init  ----------
app = FastAPI(title="MutSyncHub Analytics Engine", version="2.2", lifespan=lifespan)

app.mount("/socket.io", socket.socket_app)
# ----------  CORS – live Vercel domain  ----------
origins = [
    "https://mut-sync-hub.vercel.app",   # ← your live frontend
    "http://localhost:3000",             # ← local dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------  routers  ----------
app.include_router(health.router)            # ← no auth (public)
app.include_router(datasources.router, dependencies=[Depends(verify_key)])
app.include_router(reports.router, dependencies=[Depends(verify_key)])
app.include_router(flags.router, dependencies=[Depends(verify_key)])
app.include_router(scheduler.router, dependencies=[Depends(verify_key)])
app.include_router(run.router, dependencies=[Depends(verify_key)])
app.include_router(socket.router)
# ----------  public health  ----------
@app.get("/health")
def health():
    return {"status": "ok", "service": "analytics-engine"}