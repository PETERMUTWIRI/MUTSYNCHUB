from apscheduler.schedulers.asyncio import AsyncIOScheduler
import pandas as pd
from app.engine.analytics import AnalyticsService
from app.utils.detect_industry import detect_industry
from app.utils.email import send_pdf_email
import asyncio

sched = AsyncIOScheduler()

def nightly_job(org_id: str):
    df = pd.read_parquet(f"/data/{org_id}/sales.parquet")
    report = AnalyticsService().perform_eda(df.to_dict("records"), industry=detect_industry(df))
    asyncio.create_task(send_pdf_email(org_id, "Nightly Analytics Report", report))

def start_scheduler():
    # dummy loader – replace with real DB call
    orgs = [{"id": "demo"}]
    for org in orgs:
        sched.add_job(nightly_job, "cron", hour=6, minute=0, args=[org["id"]], id=f"nightly_{org['id']}")
    sched.start()
