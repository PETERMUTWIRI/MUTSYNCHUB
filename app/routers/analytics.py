from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])

@router.get("/stream/recent")
async def get_recent_stream(
    org_id: str = Query(...),
    source_id: str = Query(...),
    count: int = Query(10)
):
    """
    Mock endpoint to satisfy the frontend polling request.
    """
    return {
        "messages": [
            {
                "type": "kpi_update",
                "timestamp": "2025-11-28T12:00:00Z",
                "data": {"daily_sales": 12345.67, "active_users": 89}
            }
        ]
    }
