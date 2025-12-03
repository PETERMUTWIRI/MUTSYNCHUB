# app/redis_client.py – Lazy Singleton (No Startup Crash)
from app.deps import get_redis

# Export the singleton instance (lazy, doesn't connect until first use)
redis = get_redis()

# ✅ REMOVE: Don't ping on import - causes startup race condition
# try:
#     redis.ping()
#     print("✅ Redis bridge connected")
# except Exception as e:
#     print(f"❌ Redis connection failed: {e}")
#     raise RuntimeError(f"Redis not available: {e}")