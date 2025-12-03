# app/qstash_client.py
import logging
from typing import Optional, Dict, Any
from app.deps import get_qstash_client  # ✅ Import from existing logic

logger = logging.getLogger(__name__)

def is_qstash_available() -> bool:
    """
    Check if QStash is available without raising errors.
    Uses the singleton from deps.py
    """
    try:
        get_qstash_client()
        return True
    except RuntimeError:
        return False

def publish_message(url: str, body: Dict[str, Any], callback: Optional[str] = None) -> Dict[str, Any]:
    """
    Publish a message to QStash using the singleton client from deps.
    
    Args:
        url: Endpoint URL to call
        body: JSON payload
        callback: Optional callback URL
    
    Returns:
        Dict with message_id
        
    Raises:
        RuntimeError: If QStash not initialized
    """
    client = get_qstash_client()
    result = client.message.publish(url=url, body=body, callback=callback)
    
    return {"message_id": result.message_id}