# app/routers/socket.py
import socketio
from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from app.deps import verify_key   # your API-key guard

# 1. long-lived Socket.IO server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[
        "https://mut-sync-hub.vercel.app",
        "http://localhost:3000",
    ],
)

# 2. ASGI sub-app mounted at /socket.io
socket_app = socketio.ASGIApp(sio)

# 3. FastAPI router for extra REST routes
router = APIRouter(prefix="/socket.io")

# ----------  new broadcast route (called by n8n workflow) ----------
@router.post("/socket-push/{org_id}")
async def socket_push(org_id: str, payload: dict, _: str = Depends(verify_key)):
    """
    Receive top-N rows from n8n and broadcast them to every browser
    connected to this org room.
    """
    await sio.emit("datasource:new-rows", payload, room=org_id)
    return {"broadcast": "ok"}

# ----------  old health stub ----------
@router.get("/health")
async def health():
    return PlainTextContent("ok")

# ----------  socket events (keep what you already had) ----------
@sio.event
async def connect(sid, environ, auth):
    org_id = auth.get("orgId") if auth else "demo"
    await sio.save_session(sid, {"orgId": org_id})
    await sio.enter_room(sid, org_id)          # join org room
    print(f"[socket] {sid} connected → room {org_id}")

@sio.event
async def disconnect(sid):
    print(f"[socket] {sid} disconnected")