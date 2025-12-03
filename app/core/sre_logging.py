"""
app/core/sre_logging.py – SRE Log Aggregation (No Circular Dependencies)
==========================================================================
Central log aggregator and emitter functions that can be safely imported
by any service without causing circular imports.
"""

import threading
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from collections import deque

# Global log aggregator (ring buffer for recent logs)
class LogAggregator:
    """Thread-safe ring buffer storing last 1000 logs from all services"""
    def __init__(self, max_size: int = 1000):
        self.max_size = max_size
        self.buffer: deque = deque(maxlen=max_size)
        self.lock = threading.Lock()
    
    def emit(self, service: str, level: str, message: str, **kwargs):
        """Add a log entry from any service"""
        with self.lock:
            entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "service": service,
                "level": level,
                "message": message,
                **kwargs
            }
            self.buffer.append(entry)
    
    def get_logs(self, service: Optional[str] = None, level: Optional[str] = None, limit: int = 100) -> List[Dict]:
        """Retrieve filtered logs (most recent first)"""
        with self.lock:
            filtered = [
                log for log in self.buffer
                if (not service or log["service"] == service)
                and (not level or log["level"] == level)
            ]
            return list(filtered)[-limit:]
    
    def get_error_rate(self, service: Optional[str], window_minutes: int = 5) -> float:
        """Calculate error rate for a service (or all if service=None)"""
        cutoff = datetime.utcnow() - timedelta(minutes=window_minutes)
        cutoff_str = cutoff.isoformat()
        
        with self.lock:
            recent = [
                log for log in self.buffer
                if log["timestamp"] >= cutoff_str
                and (not service or log["service"] == service)
            ]
            if not recent:
                return 0.0
            errors = [log for log in recent if log["level"] in ("error", "critical")]
            return len(errors) / len(recent)

# Global singleton
log_aggregator = LogAggregator(max_size=1000)

# Service-specific emitter functions (safe to import anywhere)
def emit_worker_log(level: str, message: str, **kwargs):
    log_aggregator.emit("analytics_worker", level, message, **kwargs)

def emit_vector_log(level: str, message: str, **kwargs):
    log_aggregator.emit("vector_service", level, message, **kwargs)

def emit_llm_log(level: str, message: str, **kwargs):
    log_aggregator.emit("llm_service", level, message, **kwargs)

def emit_mapper_log(level: str, message: str, **kwargs):
    log_aggregator.emit("mapper", level, message, **kwargs)

def emit_deps_log(level: str, message: str, **kwargs):
    log_aggregator.emit("dependencies", level, message, **kwargs)