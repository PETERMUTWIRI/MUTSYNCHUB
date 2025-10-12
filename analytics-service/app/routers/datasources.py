from fastapi import APIRouter, Query, Body, Depends
from fastapi import HTTPException
from app.deps import verify_key
from app.db import get_conn, ensure_raw_table
from app.mapper import canonify_df
from app.utils.detect_industry import detect_industry
import pandas as pd

router = APIRouter(prefix="/api/v1", tags=["datasources"])

@router.post("/datasources")
def create_source(
    orgId: str = Query(...),
    sourceId: str = Query(...),
    type: str = Query(...),
    config: dict = Body(...),  # ← only Body for complex config
    _: str = Depends(verify_key),
):
    conn = get_conn(orgId)
    ensure_raw_table(conn)
    
    # Assuming canonify_df returns a DataFrame
    df = canonify_df(orgId)
    
    # Detect industry and confidence
    industry, confidence = detect_industry(df)
    
    # Close the database connection
    conn.close()
    
    # Return the response
    return {
        "id": sourceId,
        "status": "listening",
        "industry": industry,
        "confidence": confidence,
        "recentRows": df.head(3).to_dict("records"),
    }