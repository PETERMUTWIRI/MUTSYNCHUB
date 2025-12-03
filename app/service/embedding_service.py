# app/service/embedding_service.py
import requests
from app.deps import HF_API_TOKEN

class EmbeddingService:
    def __init__(self):
        self.api_url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
        self.headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    
    def generate(self, text: str) -> list[float]:
        """Generate embedding - uses HF free tier (10k/day)"""
        try:
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json={"inputs": text, "options": {"wait_for_model": True}},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            # Fallback to local if API fails
            print(f"HF API failed, using local fallback: {e}")
            return self._local_fallback(text)
    
    def _local_fallback(self, text: str) -> list[float]:
        """Local embedding generation (slower but reliable)"""
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        return model.encode(text).tolist()

embedder = EmbeddingService()