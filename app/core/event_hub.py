"""Central Event Hub wrapper around Redis streams & pub/sub.

Provides a small compatibility layer so callers can emit events
and read recent stream entries without importing `redis` directly.
"""
import json
from datetime import datetime
from typing import Any, Dict
import logging
from app.deps import get_redis

logger = logging.getLogger(__name__)
class EventHub:
    def __init__(self):
        self.redis = get_redis()
        self.is_rest_api = not hasattr(self.redis, 'pubsub')
    # Generic key helpers
    def get_key(self, key: str):
        return self.redis.get(key)

    def setex(self, key: str, ttl: int, value: str):
        try:
            return self.redis.setex(key, ttl, value)
        except Exception as e:
            logger.error(f"[hub] ❌ setex failed for {key}: {e}", exc_info=True)
            raise

    def exists(self, key: str) -> bool:
        return self.redis.exists(key)

    def delete(self, key: str):
        return self.redis.delete(key)
    
    # ✅ ADD: Raw command execution compatibility
    def execute_command(self, *args):
        """
        Execute raw Redis command (works for both TCP and Upstash)
        Usage: execute_command("XADD", "stream", "*", "field", "value")
        """
        try:
            if self.is_rest_api:
                # Upstash: pass as list to execute()
                return self.redis.execute(list(args))
            else:
                # TCP Redis: native execute_command
                return self.redis.execute_command(*args)
        except Exception as e:
            logger.error(f"[hub] ❌ Command failed {args}: {e}")
            raise

    # Stream & pub/sub helpers
    def stream_key(self, org_id: str, source_id: str) -> str:
        return f"stream:analytics:{org_id}:{source_id}"

    def trigger_channel(self, org_id: str, source_id: str) -> str:
        return f"analytics_trigger:{org_id}:{source_id}"

    def emit_kpi_update(self, org_id: str, source_id: str, kpi_data: Dict[str, Any]):
        message = {
            "type": "kpi_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": kpi_data,
        }
        return self.redis.xadd(self.stream_key(org_id, source_id), {"message": json.dumps(message)})

    def emit_insight(self, org_id: str, source_id: str, insight: Dict[str, Any]):
        message = {
            "type": "insight",
            "timestamp": datetime.utcnow().isoformat(),
            "data": insight,
        }
        return self.redis.xadd(self.stream_key(org_id, source_id), {"message": json.dumps(message)})

    def emit_status(self, org_id: str, source_id: str, status: str, message: str = "", details: Dict | None = None):
        payload = {
            "type": "status",
            "status": status,
            "message": message,
            "details": details or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        channel = f"analytics:{org_id}:{source_id}:status"
        return self.redis.publish(channel, json.dumps(payload))

    def emit_error(self, org_id: str, source_id: str, error_message: str, error_details: Dict | None = None):
        payload = {
            "type": "error",
            "message": error_message,
            "details": error_details or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        channel = f"analytics:{org_id}:{source_id}:error"
        return self.redis.publish(channel, json.dumps(payload))

    # app/core/event_hub.py

    # app/core/event_hub.py - Line 89

    def emit_analytics_trigger(self, org_id: str, source_id: str, extra: dict | None = None):
        """Write trigger to centralized stream"""
        stream_key = "stream:analytics_triggers"
        
        payload = {
            "org_id": org_id,
            "source_id": source_id,
            "timestamp": datetime.utcnow().isoformat(),
        }
        if extra:
            payload.update(extra)

        try:
            # ✅ Use compatibility wrapper
            msg_id = self.execute_command(
                "XADD", 
                stream_key,
                "*",  # Auto-generate ID
                "message",
                json.dumps(payload)
            )
            
            logger.info(f"[hub] 📤 trigger emitted: {org_id}:{source_id} (msg: {msg_id})")
            return msg_id
        except Exception as e:
            logger.error(f"[hub] ❌ emit failed: {e}", exc_info=True)
            return None

    def ensure_consumer_group(self, stream_key: str, group: str):
        try:
            return self.redis.xgroup_create(stream_key, group, id="0", mkstream=True)
        except Exception as e:
            # ignore BUSYGROUP
            if "BUSYGROUP" in str(e):
                return None
            raise

    def read_recent_stream(self, stream_key: str, count: int = 10):
        try:
            messages = self.redis.xrevrange(stream_key, count=count)
            out = []
            for msg in messages:
                # msg -> (id, {b'message': b'...'} )
                data = msg[1].get(b"message") if isinstance(msg[1], dict) else None
                if data:
                    try:
                        out.append(json.loads(data.decode()))
                    except Exception:
                        try:
                            out.append(json.loads(data))
                        except Exception:
                            out.append({"raw": data})
            return out
        except Exception:
            return []

    def get_recent_events(self, org_id: str, source_id: str, count: int = 10):
        return self.read_recent_stream(self.stream_key(org_id, source_id), count)

    # Simple queue helpers
    def lpush(self, key: str, value: str):
        return self.redis.lpush(key, value)

    def brpop(self, key: str, timeout: int = 0):
        return self.redis.brpop(key, timeout=timeout)

    def publish(self, channel: str, message: str):
        return self.redis.publish(channel, message)

    def keys(self, pattern: str):
        return self.redis.keys(pattern)

    def pipeline(self):
        """Return a redis pipeline-like object if supported by client.

        Note: Upstash client may not support classic pipelines; callers should
        handle attribute errors and fall back to sequential commands.
        """
        try:
            return self.redis.pipeline()
        except Exception:
            return None


# Singleton
event_hub = EventHub()
