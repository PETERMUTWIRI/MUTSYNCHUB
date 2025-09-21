from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse
from app.routers import ingress, reports, interpret
from app.tasks.scheduler import start_scheduler
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield

app = FastAPI(title="MutSyncHub Analytics Engine", version="2.1", lifespan=lifespan)
app.include_router(ingress.router)
app.include_router(reports.router)
app.include_router(interpret.router)

@app.get("/health")
def health():
    return {"status": "ok"}
