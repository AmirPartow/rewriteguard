import logging
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
from functools import lru_cache

logger = logging.getLogger(__name__)

class DebertaDetector:
    def __init__(self, model_name: str = "microsoft/deberta-v3-small"):
        """
        Initializes the DeBERTa model and tokenizer.
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_name = model_name
        self.model = None
        self.tokenizer = None
        
        try:
            logger.info(f"Loading model: {model_name} on {self.device}")
            # Note: In a real scenario, you probably want to point to a local path or a specific fine-tuned model
            # for "AI detection". Using a base model here as a placeholder for the logic.
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name).to(self.device)
            self.model.eval()
            logger.info("Model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            # Depending on requirements, we might want to raise here or allow partial failure
            # For this task, we'll log it.

    def predict(self, text: str) -> tuple[str, float]:
        """
        Predict whether text is AI-generated or human-written.
        Returns (label, score) where label is internal representation.
        """
        if not self.model or not self.tokenizer:
            # Fallback for development if model isn't present
            logger.warning("Model not loaded, returning mock prediction.")
            return "human", 0.99

        try:
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512).to(self.device)
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probs = F.softmax(logits, dim=-1)
                
                # Get the highest probability prediction
                prediction_idx = torch.argmax(probs, dim=-1).item()
                score = probs[0][prediction_idx].item()
                
                # Map index to label
                # For a fine-tuned AI detection model, this would map to ai/human
                # For base model, we'll map based on config or use heuristic
                raw_label = self.model.config.id2label.get(prediction_idx, str(prediction_idx))
                
                # Normalize to ai/human (this is a placeholder mapping)
                # In production, this would be based on actual model training
                if raw_label.lower() in ["ai", "fake", "generated", "1"]:
                    normalized_label = "ai"
                else:
                    normalized_label = "human"
                
                return normalized_label, score

        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise e

# specific singleton
@lru_cache()
def get_detector():
    return DebertaDetector()
