from fastapi import APIRouter, Depends
from pydantic import BaseModel
import pandas as pd
from app.deps import verify_key
from app.tasks.scheduler import run_analytic_job

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

class RunIn(BaseModel):
    analytic: str
    orgId: str

@router.post("/run", dependencies=[Depends(verify_key)])
async def analytics_run(payload: RunIn):
    print(f"[run] received orgId={payload.orgId} analytic={payload.analytic}")
    raw = await run_analytic_job(payload.orgId, payload.analytic)
    print(f"[run] raw result keys = {list(raw.keys())}")
    if "error" in raw:
        print(f"[run] error branch: {raw['error']}")
        return {"error": raw["error"]}, 400

    df = pd.DataFrame(raw.get("data", []))
    print(f"[run] dataframe shape = {df.shape}")
    print(f"[run] dataframe head:\n{df.head()}")

    shaped = {
        "daily_sales": float(df["total"].sum()) if "total" in df.columns else 0.0,
        "daily_qty": int(df["qty"].sum()) if "qty" in df.columns else 0,
        "avg_basket": (float(df["total"].sum()) / int(df["qty"].sum())) if df["qty"].sum() else 0.0,
        "supermarket_kpis": {
            "stock_on_hand": int(df["qty"].sum()),
            "expiring_next_7_days": 0,
            "promo_lift_pct": 0.0,
            "shrinkage_pct": 0.0,
        },
        **raw,
    }
    print(f"[run] shaped payload = {shaped}")
    return shaped