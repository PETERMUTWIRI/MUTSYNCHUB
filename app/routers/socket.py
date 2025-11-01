from fastapi import APIRouter, Query
from fastapi.responses import PlainTextResponse
import json

router = APIRouter(prefix="/socket.io", tags=["socket"])

@router.get("")
def socketio_poll(
    orgId: str = Query(...),
    EIO: str = Query("4"),
    transport: str = Query("polling"),
):
    """
    Socket.IO v4 polling handshake.
    Returns the exact text payload the browser expects.
    """
    handshake = {
        "sid": "render-123456",
        "upgrades": ["websocket"],
        "pingInterval": 25000,
        "pingTimeout": 20000,
    }
    # v4 framing: "0" + JSON length + JSON string
    payload = "0" + json.dumps(handshake)
    return PlainTextResponse(content=payload, media_type="text/plain")