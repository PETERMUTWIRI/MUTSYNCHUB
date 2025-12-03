from typing import TypedDict, Dict, Any
from typing import Literal


class AnalyticsEvent(TypedDict, total=False):
    event_type: str
    timestamp: str
    data: Dict[str, Any]
    severity: str


class KPIUpdateEvent(AnalyticsEvent):
    event_type: Literal["kpi_update"]
    data: Dict[str, Any]  # kpi results


class InsightEvent(AnalyticsEvent):
    event_type: Literal["insight"]
    data: Dict[str, Any]  # insight data


class StatusEvent(AnalyticsEvent):
    event_type: Literal["status"]
    data: Dict[str, Any]  # status info