# app/engine/kpi_calculators/hospitality.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.engine.kpi_calculators.base import BaseKPICalculator
from app.schemas.org_schema import OrgSchema

class HospitalityKPICalculator(BaseKPICalculator):
    """Restaurant & Hospitality KPI engine"""
    
    def __init__(self, org_id: str, df: pd.DataFrame, source_id: Optional[str] = None, entity_type: str = "SALES"):
        super().__init__(org_id=org_id, df=df, source_id=source_id, entity_type=entity_type)
        self.schema = OrgSchema(org_id)
        self.org_id = org_id
        self.source_id = source_id
        self.entity_type = entity_type
        self._alias_columns()
    
    def _alias_columns(self):
        """Dynamic aliasing for hospitality semantic fields"""
        mapping = self.schema.get_mapping()
        for semantic, actual in mapping.items():
            if actual in self.df.columns:
                self.df = self.df.rename(columns={actual: semantic})
    
    def compute_all(self) -> Dict[str, Any]:
        """Compute hospitality KPIs"""
        quality_issues = self._detect_data_quality_issues()
        metrics = {
            "operations": self._compute_operational_metrics(),
            "revenue": self._compute_revenue_metrics(),
            "service": self._compute_service_metrics(),
            "labor": self._compute_labor_metrics(),
            "metadata": {
                "computed_at": datetime.utcnow().isoformat(),
                "rows_analyzed": len(self.df),
                "data_quality_issues": quality_issues,
                "schema_version": "ai:v3",
                "industry": "hospitality"
            }
        }
        
        return metrics
    
    def _compute_operational_metrics(self) -> Dict[str, Any]:
        """Core operational KPIs"""
        return {
            "covers": self._safe_calc('covers', 'sum', 0),
            "table_turnover": self._calculate_table_turnover(),
            "peak_dining_hour": self._get_peak_dining_hour(),
            "occupancy_rate": self._calculate_occupancy_rate(),
        }
    
    def _compute_revenue_metrics(self) -> Dict[str, Any]:
        """Revenue analysis"""
        daily_revenue = float(self.df['total'].sum()) if 'total' in self.df.columns else 0.0
        
        return {
            "daily_revenue": daily_revenue,
            "rev_per_cover": daily_revenue / max(self._safe_calc('covers', 'sum', 1), 1),
            "avg_check": self._safe_calc('total', lambda x: x.mean(), 0.0),
            "beverage_vs_food_ratio": self._calculate_beverage_ratio(),
        }
    
    def _compute_service_metrics(self) -> Dict[str, Any]:
        """Service quality metrics"""
        return {
            "avg_service_time": self._safe_calc('service_time', 'mean', 15.0),
            "order_accuracy": 98.5,  # Placeholder for AI-based detection
            "customer_satisfaction": self._estimate_satisfaction(),
        }
    
    def _compute_labor_metrics(self) -> Dict[str, Any]:
        """Labor efficiency"""
        daily_revenue = float(self.df['total'].sum()) if 'total' in self.df.columns else 0.0
        
        return {
            "labor_cost_ratio": self._safe_calc('labor_hours', 
                                               lambda lh: (lh.sum() * 20) / max(daily_revenue, 1) * 100, 25.0),
            "covers_per_hour": self._safe_calc(['covers', 'labor_hours'], 
                                               lambda c, lh: c.sum() / max(lh.sum(), 1), 0.0),
            "staff_efficiency": self._calculate_staff_efficiency(),
        }
    
    def _safe_calc(self, field: str, operation: Any, default: Any) -> Any:
        """Universal safe calculation"""
        try:
            if field not in self.df.columns:
                return default
            
            if callable(operation):
                return operation(self.df[field])
            
            return getattr(self.df[field], operation)()
        except:
            return default
    
    def _calculate_table_turnover(self) -> float:
        """Calculate table turnover rate"""
        if 'table_id' in self.df.columns and 'timestamp' in self.df.columns:
            tables_used = self.df['table_id'].nunique()
            total_covers = self._safe_calc('covers', 'sum', 1)
            return float(total_covers / max(tables_used, 1))
        return 2.5
    
    def _get_peak_dining_hour(self) -> str:
        """Find peak dining hour"""
        if 'timestamp' in self.df.columns:
            self.df['timestamp'] = pd.to_datetime(self.df['timestamp'])
            hourly_covers = self.df.groupby(self.df['timestamp'].dt.hour)['covers'].sum()
            return f"{hourly_covers.idxmax()}:00"
        return "19:00"
    
    def _calculate_occupancy_rate(self) -> float:
        """Calculate seating occupancy rate"""
        if 'table_id' in self.df.columns:
            tables_occupied = self.df['table_id'].nunique()
            total_tables = max(tables_occupied, 20)  # Assume 20 if unknown
            return float(tables_occupied / total_tables * 100)
        return 75.0
    
    def _calculate_beverage_ratio(self) -> float:
        """Calculate beverage to food revenue ratio"""
        if 'category' in self.df.columns and 'total' in self.df.columns:
            beverage_sales = self.df[
                self.df['category'].astype(str).str.contains('drink|beverage|wine|beer', case=False, na=False)
            ]['total'].sum()
            food_sales = self.df['total'].sum() - beverage_sales
            return float(beverage_sales / max(food_sales, 1) * 100)
        return 25.0
    
    def _estimate_satisfaction(self) -> float:
        """Estimate customer satisfaction from available data"""
        if 'service_time' in self.df.columns:
            avg_time = self.df['service_time'].mean()
            if avg_time < 10:
                return 95.0
            elif avg_time < 15:
                return 85.0
            else:
                return 70.0
        return 85.0
    
    def _calculate_staff_efficiency(self) -> float:
        """Calculate staff efficiency score"""
        if 'employee_id' in self.df.columns:
            return float(self.df.groupby('employee_id')['total'].sum().mean())
        return 0.0