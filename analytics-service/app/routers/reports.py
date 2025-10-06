"""
Analytics engine routes – stateless.
"""
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
import pandas as pd
import json
import os
from datetime import date

from app.engine.analytics import AnalyticsService
from app.utils.detect_industry import detect_industry
from app.service.industry_svc import eda, forecast, basket, market_dynamics, supply_chain, customer_insights, operational_efficiency, risk_assessment, sustainability

router = APIRouter(prefix="/analytics", tags=["Analytics"])

# ---------- legacy ----------
@router.get("/live/{org_id}")
def live_kpi(org_id: str):
    raw = redis_client.get(f"live:{org_id}")
    return json.loads(raw) if raw else {"summary": {"daily_sales": 0, "daily_qty": 0, "avg_basket": 0}, "trend": []}

# ---------- NEW – stateless ----------
class RunAnalyticIn(BaseModel):
    analytic: str   # eda | forecast | basket | ...
    dateColumn: str | None = None
    valueColumn: str | None = None
    minSupport: float = 0.01
    minConfidence: float = 0.3
    minLift: float = 1.0

@router.post("/run")
async def run_analytic(body: RunAnalyticIn):
    """
    Stateless entry – caller (Next-js) must pass parquet file path in header
    X-Data-Path: /data/{org_id}/sales.parquet
    """
    path = os.environ.get("X_DATA_PATH")   # injected by Next-js
    if not path or not os.path.exists(path):
        raise HTTPException(404, "Data file not found")
    df = pd.read_parquet(path)
    data = df.to_dict("records")
    industry, _ = detect_industry(df)

    match body.analytic:
        case "eda":
            result = await eda(data, industry)
        case "forecast":
            if not body.dateColumn or not body.valueColumn:
                raise HTTPException(400, "dateColumn & valueColumn required")
            result = await forecast(data, body.dateColumn, body.valueColumn)
        case "basket":
            result = await basket(data, body.minSupport, body.minConfidence, body.minLift)
        case "market-dynamics":
            result = await market_dynamics(data)
        case "supply-chain":
            result = await supply_chain(data)
        case "customer-insights":
            result = await customer_insights(data)
        case "operational-efficiency":
            result = await operational_efficiency(data)
        case "risk-assessment":
            result = await risk_assessment(data)
        case "sustainability":
            result = await sustainability(data)
        case _:
            raise HTTPException(400, "Unknown analytic")

    return {"industry": industry, "data": result}