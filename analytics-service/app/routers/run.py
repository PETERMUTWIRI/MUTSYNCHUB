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
    raw = await run_analytic_job(payload.orgId, payload.analytic)
    if "error" in raw:
        return {"error": raw["error"]}, 400

    # ----------  compute universal KPIs  ----------
    df = pd.DataFrame(raw.get("data", []))
    daily_sales = float(df["total"].sum()) if "total" in df.columns else 0.0
    daily_qty   = int(df["qty"].sum()) if "qty" in df.columns else 0
    avg_basket  = daily_sales / daily_qty if daily_qty else 0.0

    # ----------  supermarket extras  ----------
    stock_on_hand        = int(df["qty"].sum())  # crude stock = total qty
    expiring_next_7_days = int(df[df["expiry_date"].lt(pd.Timestamp.utcnow() + pd.Timedelta(days=7))]["qty"].sum()) if "expiry_date" in df.columns else 0
    promo_lift_pct       = float(df[df["promo"] == 1]["total"].sum() / df["total"].sum() * 100 - 100) if "promo" in df.columns and df["total"].sum() else 0.0
    shrinkage_pct        = float(df["loss_qty"].sum() / df["qty"].sum() * 100) if "loss_qty" in df.columns and df["qty"].sum() else 0.0

    shaped = {
        "daily_sales": daily_sales,
        "daily_qty": daily_qty,
        "avg_basket": avg_basket,
        "supermarket_kpis": {
            "stock_on_hand": stock_on_hand,
            "expiring_next_7_days": expiring_next_7_days,
            "promo_lift_pct": promo_lift_pct,
            "shrinkage_pct": shrinkage_pct,
        },
        **raw,  # keep whatever else the engine returned
    }
    return shaped