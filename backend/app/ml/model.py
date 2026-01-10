from __future__ import annotations

import threading
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from .config import MODEL_NAME, DEVICE

_tokenizer = None
_model = None
_lock = threading.Lock()

def load_model():
    """
    Load tokenizer + model once (singleton pattern with thread-safe lock).
    """
    global _tokenizer, _model
    if _tokenizer is not None and _model is not None:
        return _tokenizer, _model

    with _lock:
        if _tokenizer is not None and _model is not None:
            return _tokenizer, _model

        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        _model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_NAME,
            num_labels=2
        )

        device = torch.device(DEVICE if DEVICE else "cpu")
        _model.to(device)
        _model.eval()

        return _tokenizer, _model
