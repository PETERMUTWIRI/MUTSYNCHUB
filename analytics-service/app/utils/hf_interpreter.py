import os, json
from huggingface_hub import InferenceClient

hf = InferenceClient(token=os.getenv("HF_TOKEN"))

def interpret_report(report: dict, question: str | None):
    prompt = f"""
You are a Kenyan business analyst. Use simple, friendly English.
Metrics: {json.dumps(report, default=str)}
Question: {question or "Give me the top 3 insights and one action I should take today."}
Answer in 3 short bullet points.
"""
    out = hf.text_generation(
        model="google/flan-t5-large",
        inputs=prompt,
        parameters=dict(max_new_tokens=120, temperature=0.7)
    )
    return {"answer": out.generated_text.strip()}
