# app/routers/schema.py
from fastapi import APIRouter, Depends, Query
from app.deps import verify_api_key
from typing import Dict 
from app.schemas.org_schema import OrgSchema
router = APIRouter(prefix="/api/v1/schema", tags=["schema"])

@router.get("/discover")
async def discover_schema(
    org_id: str = Query(..., description="Organization ID"),
    api_key: str = Depends(verify_api_key),
):
    """Return column mappings for this org"""
    schema = OrgSchema(org_id)
    return schema.get_mapping()

@router.post("/override")
async def override_schema(
    mapping: Dict[str, str],
    org_id: str = Query(..., description="Organization ID"),
    api_key: str = Depends(verify_api_key),
):

    """Allow manual column mapping override"""
    schema = OrgSchema(org_id)
    schema.save_mapping(mapping)
    return {"status": "saved", "mapping": mapping}