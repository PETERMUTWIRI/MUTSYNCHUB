from fastapi import APIRouter, Query
from datetime import date, timedelta
import pandas as pd
from app.engine.analytics import AnalyticsService
from app.redis_pool import redis_client
from app.utils.detect_industry import detect_industry

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/unified/{org_id}")
def unified_report(org_id: str, date_from: date = Query(...), date_to: date = Query(...)):
    # historical parquet
    df_hist = pd.read_parquet(f"/data/{org_id}/sales.parquet", filters=[("timestamp", ">=", date_from), ("timestamp", "<=", date_to)])
    # live last 5 min
    live_json = redis_client.get(f"live:{org_id}")
    df_live = pd.DataFrame(json.loads(live_json)["raw_data"]) if live_json else pd.DataFrame()
    df = pd.concat([df_hist, df_live]).drop_duplicates(subset=["id"])
    industry = detect_industry(df)
    report = AnalyticsService().perform_eda(df.to_dict("records"), industry=industry)
    return report
