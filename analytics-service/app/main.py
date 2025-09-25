# analytics-service/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ingress, reports, interpret, flags
from app.tasks.scheduler import start_scheduler
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield

app = FastAPI(title="MutSyncHub Analytics Engine", version="2.2", lifespan=lifespan)

# ✅ explicit origins – no wildcard
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

app.include_router(ingress.router)
app.include_router(reports.router)
app.include_router(interpret.router)
app.include_router(flags.router)

@app.get("/health")
def health():
    return {"status": "ok"}