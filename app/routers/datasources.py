from fastapi import APIRouter, Query, Form, File, UploadFile, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Any
from app.deps import verify_key
from app.db import get_conn, ensure_raw_table
from app.mapper import canonify_df
from app.utils.detect_industry import detect_industry
from app.sockets import sio  # <-- your socket.io instance
import pandas as pd
import json


router = APIRouter(prefix="/api/v1", tags=["datasources"])


# ----------  ORIGINAL  –  multipart (files + form)  ----------
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
    Keeps existing behaviour – CSV upload, POS plug-in, etc.
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

    df = canonify_df(orgId)
    industry, confidence = detect_industry(df)
    conn.close()

    # live broadcast
    rows = df.head(3).to_dict("records")
    await sio.emit("datasource:new-rows", {"rows": rows}, room=orgId)

    return {
        "id": sourceId,
        "status": "listening" if type != "WEBHOOK" else "received",
        "industry": industry,
        "confidence": confidence,
        "recentRows": rows,
    }


# ----------  NEW  –  raw JSON for n8n / services  ----------
class JsonPayload(BaseModel):
    config: dict
    data:   List[Any]


@router.post("/datasources/json")
async def create_source_json(
    orgId: str = Query(...),
    sourceId: str = Query(...),
    type: str = Query(...),
    payload: JsonPayload,
    _: str = Depends(verify_key),
):
    """
    Accepts raw JSON from n8n, Postman, curl, etc.
    Body must be { "config": {...}, "data": [...] }
    """
    conn = get_conn(orgId)
    ensure_raw_table(conn)

    # insert rows
    for row in payload.data:
        conn.execute("INSERT INTO raw_rows (row_data) VALUES (?)", (json.dumps(row),))

    df = canonify_df(orgId)
    industry, confidence = detect_industry(df)
    conn.close()

    # live broadcast
    rows = df.head(3).to_dict("records")
    await sio.emit("datasource:new-rows", {"rows": rows}, room=orgId)

    return {
        "id": sourceId,
        "status": "listening",
        "industry": industry,
        "confidence": confidence,
        "recentRows": rows,
    }