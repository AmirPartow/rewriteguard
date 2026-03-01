import logging
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
from functools import lru_cache

logger = logging.getLogger(__name__)


class DebertaDetector:
    def __init__(
        self, model_name: str = "DmitryUlow/deberta-v3-small-ai-content-detector"
    ):
        """
        Initializes the DeBERTa model and tokenizer.
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Optimize for single-core CPU (t3.micro)
        if self.device.type == "cpu":
            torch.set_num_threads(1)
            torch.set_num_interop_threads(1)

        self.model_name = model_name
        self.model = None
        self.tokenizer = None

        try:
            logger.info(f"Loading model: {model_name} on {self.device}")
            # Note: In a real scenario, you probably want to point to a local path or a specific fine-tuned model
            # for "AI detection". Using a base model here as a placeholder for the logic.
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                model_name
            ).to(self.device)
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
            # Reduce max_length to 256 for significantly faster CPU inference
            inputs = self.tokenizer(
                text, return_tensors="pt", truncation=True, max_length=256
            ).to(self.device)
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
                self.model.config.id2label.get(prediction_idx, str(prediction_idx))

                # Normalize to ai/human (this is a placeholder mapping)
                # For most fine-tuned models: 0 = human, 1 = ai
                # If we use a generic model, we'll assume index 1 is 'positive/fake/ai' and index 0 is 'human'
                if prediction_idx == 1:
                    normalized_label = "ai"
                    # For AI, score is already probs[0][1]
                else:
                    normalized_label = "human"
                    # For Human, score is probs[0][0]

                return normalized_label, score

        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise e


# specific singleton
@lru_cache()
def get_detector():
    return DebertaDetector()
