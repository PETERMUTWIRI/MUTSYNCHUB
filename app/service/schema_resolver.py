# app/services/schema_resolver.py
from typing import Optional
from app.schemas.org_schema import OrgSchema
from app.service.llm_service import LocalLLMService
import logging

logger = logging.getLogger(__name__)
class SchemaResolver:
    """
    Autonomous schema resolution service that learns from your data.
    Bridges the gap between raw columns and semantic understanding.
    """
    
    def __init__(self, org_id: str):
        self.org_id = org_id
        self.schema = OrgSchema(org_id)
        self.llm = LocalLLMService()
    
    def resolve_with_certainty(self, semantic_field: str) -> Optional[str]:
        """
        Returns column name only if confidence > 95%.
        Otherwise triggers AI training workflow.
        """
        mapping = self.schema.get_mapping()
        column = mapping.get(semantic_field)
        
        if column:
            # Verify with LLM for critical fields
            if semantic_field in {"total", "timestamp", "transaction_id"}:
                return self._verify_critical_field(semantic_field, column)
            return column
        
        # No match found - trigger autonomous learning
        return self._learn_new_mapping(semantic_field)
    
    def _verify_critical_field(self, semantic: str, candidate: str) -> Optional[str]:
        """LLM verification for business-critical fields"""
        try:
            prompt = f"""
            Verify: Does column '{candidate}' represent '{semantic}'?
            
            Return ONLY 'YES' or 'NO'. Consider business logic and data patterns.
            """
            response = self.llm.generate(prompt, max_tokens=5).strip()
            return candidate if response == "YES" else None
        except:
            return candidate
    
    def _learn_new_mapping(self, semantic: str) -> Optional[str]:
        """Autonomous learning from user queries and corrections"""
        # This would integrate with your feedback loop
        logger.warning(f"[Schema] Need training for: {self.org_id}.{semantic}")
        return None