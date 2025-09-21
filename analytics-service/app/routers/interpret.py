from fastapi import APIRouter
from pydantic import BaseModel
from app.utils.hf_interpreter import interpret_report

router = APIRouter(prefix="/ai", tags=["AI Interpret"])

class InterpretReq(BaseModel):
    report: dict
    question: str | None = None

@router.post("/interpret")
def interpret(req: InterpretReq):
    return interpret_report(req.report, req.question)
