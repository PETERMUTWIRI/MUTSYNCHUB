"""
Stateless scheduler – caller (Next-js) orchestrates storage & quota.
Only duty: run analytics on cron, return JSON.
"""
import asyncio
import pandas as pd
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.engine.analytics import AnalyticsService
from app.service.industry_svc import (eda, forecast, basket, market_dynamics,
                                      supply_chain, customer_insights,
                                      operational_efficiency, risk_assessment,
                                      sustainability)
from app.utils.detect_industry import detect_industry
from app.utils.email import send_pdf_email
import os
from datetime import datetime

sched = AsyncIOScheduler()

# ------------------------------------------------------------------
# 1  RUN ONE ANALYTIC – pure logic, no DB
# ------------------------------------------------------------------
async def run_analytic_job(org_id: str, analytic_type: str, **kwargs) -> dict:
    path = f"/data/{org_id}/sales.parquet"
    if not os.path.exists(path):
        return {"error": "No data file"}

    df = pd.read_parquet(path)
    data = df.to_dict("records")
    industry, _ = detect_industry(df)

    match analytic_type:
        case "eda":
            result = await eda(data, industry)
        case "forecast":
            result = await forecast(data, kwargs["date_col"], kwargs["value_col"])
        case "basket":
            result = await basket(data, 0.01, 0.3, 1.0)
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
            return {"error": "Unknown analytic"}

    # fire-and-forget email (caller decides storage)
    pdf_url = f"{os.getenv('PUBLIC_URL', '')}/api/reports/{org_id}/{analytic_type}.pdf"
    asyncio.create_task(send_pdf_email(org_id, f"{analytic_type} report", {"pdf": pdf_url, "data": result}))

    return {"orgId": org_id, "analytic": analytic_type, "industry": industry, "results": result, "timestamp": datetime.utcnow().isoformat()}

# --------------  existing code above unchanged  --------------

def add_job_to_scheduler(schedule: dict):
    """Called by REST router when a schedule is created."""
    org_id    = schedule["orgId"]
    freq      = schedule["frequency"]
    analytics = schedule["analytics"]
    for analytic in analytics:
        job_id = f"{schedule['id']}_{analytic}"
        if freq == "daily":
            sched.add_job(run_analytic_job, "cron", hour=6, minute=0,
                          args=[org_id, analytic], id=job_id)
        elif freq == "weekly":
            sched.add_job(run_analytic_job, "cron", day_of_week=0, hour=6, minute=0,
                          args=[org_id, analytic], id=job_id)
        elif freq == "monthly":
            sched.add_job(run_analytic_job, "cron", day=1, hour=6, minute=0,
                          args=[org_id, analytic], id=job_id)

def remove_job_from_scheduler(schedule_id: str):
    """Called by REST router when a schedule is deleted."""
    # APScheduler does not support wild-cards – iterate and match prefix
    for job in sched.get_jobs():
        if job.id.startswith(schedule_id):
            sched.remove_job(job.id)

# --------------  existing load_schedules() below unchanged  --------------

# ------------------------------------------------------------------
# 2  SCHEDULE LOADER – reads simple ENV list (no Prisma)
# ------------------------------------------------------------------
async def load_schedules():
    """
    Expects ENV variable SCHEDULES as JSON:
    [{"orgId":"demo","frequency":"daily","analytics":["eda","basket"]}]
    """
    import json
    raw = os.getenv("SCHEDULES", "[]")
    try:
        schedules = json.loads(raw)
    except Exception:
        schedules = []

    for sch in schedules:
        org_id = sch["orgId"]
        freq = sch.get("frequency", "daily")
        analytics = sch.get("analytics", ["eda"])

        for analytic in analytics:
            job_id = f"{org_id}_{analytic}"
            if freq == "daily":
                sched.add_job(run_analytic_job, "cron", hour=6, minute=0, args=[org_id, analytic], id=job_id)
            elif freq == "weekly":
                sched.add_job(run_analytic_job, "cron", day_of_week=0, hour=6, minute=0, args=[org_id, analytic], id=job_id)
            elif freq == "monthly":
                sched.add_job(run_analytic_job, "cron", day=1, hour=6, minute=0, args=[org_id, analytic], id=job_id)

# ------------------------------------------------------------------
# 3  STARTER
# ------------------------------------------------------------------
def start_scheduler():
    asyncio.create_task(load_schedules())
    sched.start()