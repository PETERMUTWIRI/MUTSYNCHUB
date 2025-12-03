# app/engine/kpi_calculators/generic.py
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any
from app.engine.kpi_calculators.base import BaseKPICalculator

class GenericKPICalculator(BaseKPICalculator):
    """
    🌍 Universal calculator - works for ANY data
    No supermarket bias. Pure metrics.
    """
    
    def compute_all(self) -> Dict[str, Any]:
        """Compute universal metrics"""
        
        metrics = {
            "overview": self._compute_overview(),
            "financial": self._compute_financial(),
            "temporal": self._compute_temporal(),
            "metadata": {
                "computed_at": self.computed_at.isoformat(),
                "rows_analyzed": len(self.df),
                "industry": "generic",
                "schema_version": "ai:v3"
            }
        }
        
        return metrics
    
    def _compute_overview(self) -> Dict[str, Any]:
        """High-level stats"""
        return {
            "total_records": len(self.df),
            "unique_values": len(self.df.drop_duplicates()),
            "null_percentage": float(self.df.isnull().sum().sum() / (len(self.df) * len(self.df.columns)) * 100),
            "numeric_columns": len(self.df.select_dtypes(include=[np.number]).columns),
            "text_columns": len(self.df.select_dtypes(include=['object']).columns)
        }
    
    def _compute_financial(self) -> Dict[str, Any]:
        """Auto-detect money columns"""
        total_col = self.schema.get_column("total")
        
        return {
            "total_sum": float(self.df[total_col].sum()) if total_col in self.df.columns else 0.0,
            "total_avg": float(self.df[total_col].mean()) if total_col in self.df.columns else 0.0,
            "total_max": float(self.df[total_col].max()) if total_col in self.df.columns else 0.0,
            "transaction_count": len(self.df)
        }
    
    def _compute_temporal(self) -> Dict[str, Any]:
        """Time-based patterns"""
        timestamp_col = self.schema.get_column("timestamp")
        
        if timestamp_col not in self.df.columns:
            return {"error": "No timestamp column"}
        
        return {
            "date_range_days": float((self.df[timestamp_col].max() - self.df[timestamp_col].min()).days),
            "records_per_day": float(len(self.df) / max(1, (self.df[timestamp_col].max() - self.df[timestamp_col].min()).days)),
            "peak_hour": int(self.df[timestamp_col].dt.hour.mode().iloc[0]) if not self.df[timestamp_col].dt.hour.mode().empty else 0
        }