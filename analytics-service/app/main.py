from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Header
from app.routers import ingress, reports, interpret, flags, datasources,scheduler,run     # ← NEW
from app.tasks.scheduler import start_scheduler
from app.deps import verify_key                       # ← use the shared one
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield

app = FastAPI(title="MutSyncHub Analytics Engine", version="2.2", lifespan=lifespan)

origins = [
    "https://potential-yodel-4jr5qq54gqvwh6wg-3000.app.github.dev",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------  mount routers (auth guarded)  ------------------------------
app.include_router(datasources.router, dependencies=[Depends(verify_key)])  # ← NEW
# app.include_router(ingress.router,   dependencies=[Depends(verify_key)])
app.include_router(reports.router,   dependencies=[Depends(verify_key)])
app.include_router(interpret.router, dependencies=[Depends(verify_key)])
app.include_router(flags.router,     dependencies=[Depends(verify_key)])
app.include_router(scheduler.router, dependencies=[Depends(verify_key)]) 
app.include_router(run.router, dependencies=[Depends(verify_key)])
# -------------  public health check  ---------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}