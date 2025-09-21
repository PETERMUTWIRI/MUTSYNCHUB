from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.live_ingest import LiveIngestService

router = APIRouter(prefix="/ingress", tags=["Live Ingest"])

@router.websocket("/pos/{org_id}")
async def websocket_pos(websocket: WebSocket, org_id: str):
    await websocket.accept()
    service = LiveIngestService(org_id)
    try:
        while True:
            msg = await websocket.receive_json()
            await service.handle(msg)
    except WebSocketDisconnect:
        pass
