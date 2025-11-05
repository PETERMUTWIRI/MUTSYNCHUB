from fastapi import APIRouter, Query, Form, File, UploadFile, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Any, Dict, Union
from app.deps import verify_key
from app.db import get_conn, ensure_raw_table, bootstrap
from app.mapper import canonify_df
from app.utils.detect_industry import detect_industry
from app.routers.socket import sio
import pandas as pd
import json

router = APIRouter(prefix="/api/v1", tags=["datasources"])


# =======================================================================
# 1️⃣  ORIGINAL UPLOAD ENDPOINT – handles CSV, POS plug-in, etc.
# =======================================================================
@router.post("/datasources")
async def create_source(
    orgId: str = Query(...),
    sourceId: str = Query(...),
    type: str = Query(...),
    config: str = Form(...),
    file: UploadFile = File(None),
    data: str = Form(None),
    _: str = Depends(verify_key),
):
    """
    Keeps existing behavior – for CSV upload, POS plug-in, API push, etc.
    """
    conn = get_conn(orgId)
    ensure_raw_table(conn)

    config_dict = json.loads(config)

    if type == "FILE_IMPORT" and file:
        chunk_size = 1000
        for chunk in pd.read_csv(file.file, chunksize=chunk_size):
            for _, row in chunk.iterrows():
                conn.execute("INSERT INTO raw_rows (row_data) VALUES (?)", (row.to_json(),))
        file.file.seek(0)
    elif type in ["API", "DATABASE", "WEBHOOK", "POS_SYSTEM", "ERP", "CUSTOM"]:
        if not data:
            raise HTTPException(status_code=400, detail="Data required for non-file sources")
        records = json.loads(data)
        records = records if isinstance(records, list) else [records]
        for row in records:
            conn.execute("INSERT INTO raw_rows (row_data) VALUES (?)", (json.dumps(row),))

    # Normalize, detect, and close connection
    df = canonify_df(orgId)
    industry, confidence = detect_industry(df)
    conn.close()

    # Live broadcast sample
    rows = df.head(3).to_dict("records")
    await sio.emit("datasource:new-rows", {"rows": rows}, room=orgId)

    return {
        "id": sourceId,
        "status": "listening" if type != "WEBHOOK" else "received",
        "industry": industry,
        "confidence": confidence,
        "recentRows": rows,
    }


# =======================================================================
# 2️⃣  SMART JSON ENDPOINT – fully schema-agnostic and multi-table aware
# =======================================================================
class JsonPayload(BaseModel):
    config: Dict[str, Any]
    data: Union[List[Any], Dict[str, Any]]  # flexible: list or { "tables": {...} }


@router.post("/datasources/json")
async def create_source_json(
    payload: JsonPayload,
    orgId: str = Query(...),
    sourceId: str = Query(...),
    type: str = Query(...),
    _: str = Depends(verify_key),
):
    """
    Accepts structured JSON (list or multi-table dict) from n8n, Render jobs, or APIs.
    Automatically evolves schemas, stores data, detects industry, and broadcasts live rows.
    """
    try:
        if not payload or not payload.data:
            raise HTTPException(status_code=400, detail="Missing payload data")

        # 💾 Flexible insertion – handles one or multiple tables
        bootstrap(orgId, payload.data)

        # 🧭 Canonical normalization (only if “sales” or compatible table exists)
        df = canonify_df(orgId)
        industry, confidence = detect_industry(df)

        # 🎯 Preview last few normalized rows
        rows = df.head(3).to_dict("records") if not df.empty else []
        await sio.emit("datasource:new-rows", {"rows": rows}, room=orgId)

        return JSONResponse(
            content={
                "id": sourceId,
                "status": "processed",
                "industry": industry,
                "confidence": confidence,
                "recentRows": rows,
                "message": "✅ Data ingested successfully",
            }
        )

    except Exception as e:
        print(f"[datasources/json] ❌ ingestion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
