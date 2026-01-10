import torch
from .config import MAX_LENGTH, THRESHOLD, DEVICE
from .model import load_model

def run_detection(text: str) -> dict:
    """
    Runs DeBERTa inference on text.

    Returns:
    {
        "label": "AI" or "HUMAN",
        "score": float between 0.0 and 1.0
    }
    """
    tokenizer, model = load_model()

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=MAX_LENGTH,
        padding=True,
    )

    device = torch.device(DEVICE if DEVICE else "cpu")
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=-1)[0]
        score = float(probs[1].item())

    label = "AI" if score >= THRESHOLD else "HUMAN"
    return {"label": label, "score": score}
