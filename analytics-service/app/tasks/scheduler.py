import asyncio, pandas as pd
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.engine.analytics import AnalyticsService
from app.utils.email import send_pdf_email
from app.utils.detect_industry import detect_industry

sched = AsyncIOScheduler()

def nightly_job(org_id: str):
    df = pd.read_parquet(f"/data/{org_id}/sales.parquet")
    report = AnalyticsService().perform_eda(df.to_dict("records"), industry=detect_industry(df))
    send_pdf_email(org_id, "Nightly Analytics Report", report)

def start_scheduler():
    # load all orgs
    from app.db import get_orgs
    for org in get_orgs():
        sched.add_job(nightly_job, "cron", hour=6, minute=0, args=[org.id], id=f"nightly_{org.id}")
    sched.start()
