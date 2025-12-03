# app/routers/analytics_stream.py
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks, Body, Depends
from typing import List, Dict
from datetime import datetime
import logging
from app.deps import verify_api_key
from app.core.event_hub import event_hub
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/analytics/stream", tags=["analytics"])

class AnalyticsStreamManager:
    """Manages Redis streams for real-time analytics without WebSockets"""
    
    def __init__(self, org_id: str, source_id: str):
        self.org_id = org_id
        self.source_id = source_id
        self.stream_key = f"stream:analytics:{org_id}:{source_id}"
        self.consumer_group = f"analytics_consumers_{org_id}"
        
    async def ensure_consumer_group(self):
        """Create Redis consumer group if not exists"""
        try:
            event_hub.ensure_consumer_group(self.stream_key, self.consumer_group)
        except Exception as e:
            if "BUSYGROUP" not in str(e):
                print(f"[stream] ⚠️ Group creation warning: {e}")
    
    async def publish_kpi_update(self, data: Dict):
        """Publish KPI update to Redis stream"""
        message = {
            "type": "kpi_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        event_hub.emit_kpi_update(self.org_id, self.source_id, data)
    
    async def publish_insight(self, insight: Dict):
        """Publish AI insight to stream"""
        message = {
            "type": "insight",
            "timestamp": datetime.utcnow().isoformat(),
            "data": insight
        }
        event_hub.emit_insight(self.org_id, self.source_id, insight)
    
    def read_recent(self, count: int = 10) -> List[Dict]:
        """Read recent messages for polling"""
        try:
            return event_hub.read_recent_stream(self.stream_key, count)
        except Exception as e:
            print(f"[stream] ❌ Read error: {e}")
            return []

@router.get("/recent")
async def get_recent_analytics(
    count: int = Query(10, ge=1, le=100),
    org_id: str = Query(..., description="Organization ID"),
    source_id: str = Query(..., description="Data source ID"),
    api_key: str = Depends(verify_api_key)
):
    """poll recent analytics from the event hub"""
    if not org_id:
        raise HTTPException(status_code=400, detail="org_id required")
    
    # use the hub to get events
    events = event_hub.get_recent_events(org_id, source_id, count)
    
    # filter and format for frontend
    messages = []
    for event in events:
        if event["event_type"] == "kpi_update":
            messages.append({
                "type": "kpi_update",
                "timestamp": event["timestamp"],
                "data": event["data"]
            })
        elif event["event_type"] == "insight":
            messages.append({
                "type": "insight",
                "timestamp": event["timestamp"],
                "data": event["data"]
            })
    
    return {
        "status": "success",
        "org_id": org_id,
        "source_id": source_id,
        "messages": messages,
        "timestamp": datetime.utcnow().isoformat()
    }



# app/routers/analytics_stream.py
 # ✅ Add imports

@router.post("/callback")
async def qstash_kpi_callback(
    background_tasks: BackgroundTasks,  # ✅ First (no default)
    payload: Dict = Body(...),  # ✅ Second (has default)
):
    """QStash calls this to compute KPIs"""
    org_id = payload["org_id"]
    source_id = payload["source_id"]
    
    # Trigger background computation
    background_tasks.add_task(run_analytics_worker, org_id, source_id)
    
    return {"status": "accepted"}

@router.post("/notify")
async def qstash_notification(payload: Dict = Body(...)):
    """QStash calls this when job is done"""
    # This is where you notify frontend
    # Could ping a webhook or update a status key in Redis
    
    return {"status": "ok"}

async def run_analytics_worker(org_id: str, source_id: str):
    """Run the KPI worker and publish results"""
    try:
        from app.tasks.analytics_worker import AnalyticsWorker
        worker = AnalyticsWorker(org_id, source_id)
        results = await worker.run()
        
        # Publish via central hub
        event_hub.emit_kpi_update(org_id, source_id, results)
        
    except Exception as e:
        print(f"[callback] ❌ Worker failed: {e}")