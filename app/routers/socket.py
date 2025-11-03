# app/routers/socket.py
import socketio
import httpx
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

# 1. long-lived Socket.IO server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[
        "https://mut-sync-hub.vercel.app",
        "http://localhost:3000",
    ],
)

# 2. cache orgId from Vercel
ORG_ID_URL = "https://mut-sync-hub.vercel.app/api/org-id"
_org_id_cache: str | None = None

async def _get_org_id() -> str:
    global _org_id_cache
    if _org_id_cache:
        return _org_id_cache
    async with httpx.AsyncClient() as c:
        r = await c.get(ORG_ID_URL, timeout=5)
        r.raise_for_status()
        _org_id_cache = r.json()["orgId"]
    return _org_id_cache

# 3. Socket.IO events
@sio.event
async def connect(sid, environ, auth):
    org_id = await _get_org_id()
    await sio.save_session(sid, {"orgId": org_id})
    print(f"[socket] client {sid} connected for org {org_id}")

@sio.event
async def disconnect(sid):
    print(f"[socket] client {sid} disconnected")

@sio.event
async def broadcast(sid, data):
    """client asks to broadcast to its own org room"""
    org_id = (await sio.get_session(sid))["orgId"]
    await sio.emit(data["event"], data["payload"], room=org_id)

# 4. expose ASGI sub-app at /socket.io
socket_app = socketio.ASGIApp(sio)

# 5. tiny health helper so old polling stub still returns 200
router = APIRouter(prefix="/socket.io")

@router.get("/health")
async def health():
    return PlainTextResponse("ok")