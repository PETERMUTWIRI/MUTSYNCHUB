from fastapi import APIRouter, Query, Depends, HTTPException
from typing import Dict, Any, List, Union 
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.deps import verify_api_key
from app.db import bootstrap
from app.mapper import canonify_df
import pandas as pd
import json
from datetime import datetime
from app.core.event_hub import event_hub
import logging
logger = logging.getLogger(__name__)  

router = APIRouter(tags=["datasources"])  



# =======================================================================
# 2️⃣  SMART JSON ENDPOINT – fully schema-agnostic and multi-table aware
# =======================================================================
# app/routers/datasources.py

class JsonPayload(BaseModel):
    config: Dict[str, Any]
    data: Union[List[Any], Dict[str, Any]]  # Flexible: list or { "tables": {...} }

@router.post("/json")
async def create_source_json(
    payload: JsonPayload,
    orgId: str = Query(...),      # ✅ From Vercel
    sourceId: str = Query(...),   # ✅ From Vercel
    type: str = Query(...),       # ✅ From Vercel

    _: str = Depends(verify_api_key),
):
    
    org_id = orgId
    source_id = sourceId
    
    """
    Enterprise ingestion endpoint:
    - Stores raw audit trail
    - Normalizes to canonical schema
    - Auto-detects industry
    - Broadcasts real-time updates
    - Returns comprehensive metadata
    """
    try:
        # ✅ Validate payload
        if not payload or not payload.data:
            raise HTTPException(
                status_code=400, 
                detail="Missing payload.data. Expected list or dict."
            )

        # 1. 💾 Store raw data for audit & lineage
        bootstrap(orgId, payload.data)
        print(f"[api/json] ✅ Raw data stored for org: {orgId}")
       
        industry_task = {
            "id": f"detect_industry:{org_id}:{source_id}:{int(datetime.now().timestamp())}",
            "function": "detect_industry",
             "args": {"org_id": org_id, "source_id": source_id}
        }
        event_hub.lpush("python:task_queue", json.dumps(industry_task))
        #  Entity will be auto-queued by process_detect_industry()
       
        df, industry, confidence = canonify_df(org_id, source_id)
        
        # Convert DataFrame to JSON-safe format
        preview_df = df.head(3).copy()
        for col in preview_df.columns:
           if pd.api.types.is_datetime64_any_dtype(preview_df[col]):
                preview_df[col] = preview_df[col].dt.strftime('%Y-%m-%d %H:%M:%S')
           elif pd.api.types.is_timedelta64_dtype(preview_df[col]):
               preview_df[col] = preview_df[col].astype(str)

        preview_rows = preview_df.to_dict("records") if not preview_df.empty else []

        
        
        # 5. ✅ Return comprehensive response
        return JSONResponse(
            status_code=200,
            content={
                "id": sourceId,
                "status": "processed",
                "industry": industry,
                "confidence": round(confidence, 4),
                "recentRows": preview_rows,
                "message": "✅ Data ingested and normalized successfully",
                "rowsProcessed": len(df),
                "schemaColumns": list(df.columns) if not df.empty else [],
                "processingTimeMs": 0, # You can add timing if needed
            }
        )

    except HTTPException:
        raise  # Re-raise FastAPI errors as-is
        
    except pd.errors.EmptyDataError:
        print(f"[api/json] ⚠️ Empty data for org: {orgId}")
        return JSONResponse(
            status_code=200,  # Not an error - just no data
            content={
                "id": sourceId,
                "status": "no_data",
                "industry": "unknown",
                "confidence": 0.0,
                "message": "⚠️ No valid data rows found",
                "rowsProcessed": 0,
            }
        )
        
    except Exception as e:
        print(f"[api/json] ❌ Unexpected error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Ingestion pipeline failed: {str(e)}"
        )