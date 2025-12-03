# app/routers/ai_query.py
from fastapi import APIRouter, Depends, HTTPException, Query
from app.service.vector_service import VectorService
from app.service.llm_service import LocalLLMService # Your existing LLM file
from app.deps import verify_api_key

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

@router.post("/query")
async def ai_query(
    query: str,
    org_id: str = Query(..., description="Organization ID"),
    api_key: str = Depends(verify_api_key),
):
    """RAG endpoint: Question → Vector Search → LLM → Answer"""
    """RAG endpoint: Question → Vector Search → LLM → Answer"""
    
    try:
        # 1. Search vector DB for relevant context
        vector_service = VectorService(org_id)
        context = vector_service.semantic_search(query, top_k=5)
        
        if not context:
            return {
                "answer": "I don't have enough recent data to answer that. Try asking about sales, inventory, or customer patterns.",
                "sources": []
            }
        
        # 2. Build RAG prompt with context
        context_str = "\n\n".join([
            f"Transaction: {c['text']} (Metadata: {c['metadata']})" 
            for c in context
        ])
        
        prompt = f"""You are a retail analytics AI. Answer the user's question using ONLY the transaction data below.

**User Question:** {query}

**Relevant Transactions (Last 7 Days):**
{context_str}

**Instructions:**
- If the data doesn't support the question, say so
- Provide specific numbers and dates when available
- Cite transaction IDs if present
- Keep answer under 200 words
- Format with markdown for clarity
"""
        
        # 3. Call your existing LLM
        llm_service = LocalLLMService()
        answer = await llm_service.generate(prompt)
        
        return {
            "answer": answer,
            "sources": context,
            "query": query
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Query failed: {str(e)}")

# Health check endpoint
@router.get("/health")
async def ai_health():
    return {"status": "ready", "model": "sentence-transformers/all-MiniLM-L6-v2"}