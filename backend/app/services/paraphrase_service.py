import logging
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from functools import lru_cache
from typing import Literal

logger = logging.getLogger(__name__)

ParaphraseMode = Literal["standard", "formal", "casual", "creative", "concise"]

class Paraphraser:
    """
    Paraphraser service using T5 model for text paraphrasing.
    Supports multiple modes for different paraphrasing styles.
    """
    
    # Mode-specific prompts for T5
    MODE_PROMPTS = {
        "standard": "paraphrase: ",
        "formal": "paraphrase to formal: ",
        "casual": "paraphrase to casual: ",
        "creative": "paraphrase creatively: ",
        "concise": "paraphrase concisely: ",
    }
    
    def __init__(self, model_name: str = "Vamsi/T5_Paraphrase_Paws"):
        """
        Initializes the T5 paraphrase model and tokenizer.
        Using a specialized paraphrase model fine-tuned on PAWS dataset.
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_name = model_name
        self.model = None
        self.tokenizer = None
        
        try:
            logger.info(f"Loading paraphrase model: {model_name} on {self.device}")
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(self.device)
            self.model.eval()
            logger.info("Paraphrase model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load paraphrase model {model_name}: {e}")
            # Keep model as None for graceful degradation
    
    def paraphrase(self, text: str, mode: ParaphraseMode = "standard") -> str:
        """
        Paraphrase the input text using the specified mode.
        
        Args:
            text: Input text to paraphrase
            mode: Paraphrasing style (standard, formal, casual, creative, concise)
            
        Returns:
            Paraphrased text
        """
        if not self.model or not self.tokenizer:
            # Fallback for development if model isn't loaded
            logger.warning("Paraphrase model not loaded, returning mock paraphrase.")
            return self._mock_paraphrase(text, mode)
        
        try:
            # Get the mode-specific prompt
            prompt = self.MODE_PROMPTS.get(mode, self.MODE_PROMPTS["standard"])
            input_text = f"{prompt}{text}"
            
            # Tokenize input
            inputs = self.tokenizer(
                input_text, 
                return_tensors="pt", 
                truncation=True, 
                max_length=512
            ).to(self.device)
            
            # Generate paraphrase with beam search for quality
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_length=512,
                    num_beams=5,
                    num_return_sequences=1,
                    temperature=0.8 if mode == "creative" else 0.7,
                    do_sample=mode == "creative",
                    early_stopping=True,
                    no_repeat_ngram_size=2,
                )
            
            # Decode and return
            paraphrased = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            return paraphrased
            
        except Exception as e:
            logger.error(f"Paraphrase error: {e}")
            raise e
    
    def _mock_paraphrase(self, text: str, mode: ParaphraseMode) -> str:
        """
        Mock paraphrase for development/testing when model isn't available.
        """
        mode_prefixes = {
            "standard": "Paraphrased: ",
            "formal": "In formal terms: ",
            "casual": "Simply put: ",
            "creative": "Reimagined: ",
            "concise": "In brief: ",
        }
        prefix = mode_prefixes.get(mode, "")
        # Simple mock: just add prefix and slightly modify
        words = text.split()
        if len(words) > 3:
            # Swap some words around for variety
            words[0], words[-1] = words[-1], words[0]
        return f"{prefix}{' '.join(words)}"


@lru_cache()
def get_paraphraser():
    """Singleton getter for the paraphraser instance."""
    return Paraphraser()
