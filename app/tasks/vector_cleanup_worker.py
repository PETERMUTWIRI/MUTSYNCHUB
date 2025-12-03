# app/tasks/vector_cleanup_worker.py
import asyncio
from app.core.event_hub import event_hub
from app.services.vector_service import VectorService
import logging

logger = logging.getLogger(__name__)

async def run_vector_cleanup():
    """Runs daily, cleans expired vectors from DuckDB"""
    while True:
        try:
            # Get active orgs from Redis (or config)
            org_keys = event_hub.keys("schema:mapping:*")
            org_ids = list(set([k.decode().split(":")[-1] for k in org_keys]))
            
            for org_id in org_ids:
                try:
                    vector_service = VectorService(org_id)
                    vector_service.cleanup_expired()
                except Exception as e:
                    logger.error(f"[Cleanup] Failed for {org_id}: {e}")
            
            # Sleep 24 hours
            await asyncio.sleep(86400)
            
        except Exception as e:
            logger.error(f"[Cleanup] Fatal: {e}")
            await asyncio.sleep(3600)  # Retry in 1 hour on error