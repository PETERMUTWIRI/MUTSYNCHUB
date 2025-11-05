# app/routers/socket.py
import socketio
from fastapi import APIRouter, Depends, Path, Request
from fastapi.responses import PlainTextResponse
from app.deps import verify_key  # your API-key guard

# 1️⃣ Socket.IO server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[
        "https://mut-sync-hub.vercel.app",
        "http://localhost:3000",
    ],
)

# 2️⃣ ASGI sub-app (mounted separately in main.py)
socket_app = socketio.ASGIApp(sio)

# 3️⃣ FastAPI router for REST routes (no prefix → /socket-push)
router = APIRouter(tags=["socket"])

# ----------  POST /socket-push/{org_id} ----------
@router.post("/socket-push/{org_id}")
async def socket_push(
    org_id: str = Path(...),
    request: Request = None,
    _: str = Depends(verify_key),
):
    """
    Receive top-N rows from n8n workflow and broadcast them
    live to all connected clients in the given org room.
    """
    payload = await request.json()
    rows = payload.get("rows", [])
    await sio.emit("datasource:new-rows", {"rows": rows}, room=org_id)
    print(f"[socket] 🔄 broadcasted {len(rows)} rows → room={org_id}")
    return {"status": "ok", "emitted": len(rows)}

# ----------  Health Check ----------
@router.get("/health")
async def health():
    return PlainTextResponse("ok")

# ----------  Socket.IO Events ----------
@sio.event
async def connect(sid, environ, auth):
    org_id = (auth or {}).get("orgId", "demo")
    await sio.save_session(sid, {"orgId": org_id})
    await sio.enter_room(sid, org_id)
    print(f"[socket] ✅ {sid} connected → room={org_id}")

@sio.event
async def disconnect(sid):
    print(f"[socket] ❌ {sid} disconnected")
