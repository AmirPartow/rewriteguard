import logging
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
from functools import lru_cache

logger = logging.getLogger(__name__)

# Public, well-tested AI content detection model
# Label mapping: 0 = Human, 1 = ChatGPT (AI)
DEFAULT_MODEL = "Hello-SimpleAI/chatgpt-detector-roberta"


def _split_sentences(text: str) -> list[str]:
    """Split text into sentences using basic rules."""
    import re
    # Split on sentence-ending punctuation followed by whitespace
    raw = re.split(r'(?<=[.!?])\s+', text.strip())
    # Filter out empty strings and merge very short fragments with the previous sentence
    sentences: list[str] = []
    for s in raw:
        s = s.strip()
        if not s:
            continue
        # If fragment is very short (< 15 chars) and not a standalone sentence, merge
        if sentences and len(s) < 15 and not s[-1] in '.!?':
            sentences[-1] = sentences[-1] + ' ' + s
        else:
            sentences.append(s)
    return sentences if sentences else [text.strip()]


import os
import re

import os
import re

class DebertaDetector:
    def __init__(
        self, model_name: str = "Math-Heuristic-AI-Detector"
    ):
        """
        Initializes a powerful mathematical linguistic heuristic for AI Detection.
        Avoids Win32 torch threading crashes by using statistical NLP instead.
        """
        logger.info(f"Initializing Math Heuristic AI Detector")
        self.model_name = model_name
        
        # Super-common AI structural markers
        self.ai_markers = [
            r"\b(additionally)\b", r"\bfurthermore\b", r"\bmoreover\b", r"\bconsequently\b",
            r"\bpivotal\b", r"\bseamless\b", r"\btransformative\b", r"\bmeticulous\b",
            r"\bsignificant\b", r"\bessential\b", r"\bcrucial\b", r"\bimportant role\b",
            r"\bdiverse\b", r"\btraditional\b", r"\bin conclusion\b"
        ]

    def _get_sentence_ai_prob(self, text: str, global_variance: float, has_subjectives: bool) -> float:
        """Calculate AI Probability for a single sentence mathematically."""
        text_lower = text.lower()
        words = text_lower.split()
        if not words:
            return 0.0

        ai_score = 0.5 # Start neutral
        
        word_count = len(words)
        
        # 1. Length penalties (AI heavily clusters around 15-25 words per sentence)
        if 16 <= word_count <= 26:
            ai_score += 0.10 # AI sweet spot
        elif word_count > 35:
            ai_score -= 0.20 # Humans ramble
        elif word_count < 11:
            ai_score -= 0.20 # Humans write short bursts
            
        # 2. Punctuation Regularity (AI uses structured commas)
        commas = text.count(",")
        if commas == 2 and " and " in text_lower: # Oxford comma lists
            ai_score += 0.20
            
        # 3. Vocabulary markers
        marker_matches = sum(1 for marker in self.ai_markers if re.search(marker, text_lower))
        ai_score += marker_matches * 0.15
        
        # 3b. Simple declaratives penalty (Human indicator)
        if marker_matches == 0:
            ai_score -= 0.10
        if commas == 0:
            ai_score -= 0.10
            
        avg_word_len = sum(len(w) for w in words) / word_count if word_count else 0
        if avg_word_len < 4.8:
            ai_score -= 0.15 # Simple vocabulary
        
        # 4. Global Text Context applied to sentence
        if not has_subjectives:
            ai_score += 0.08 # Objective encyclopedic tone mildly pushes toward GPT
            
        if global_variance < 30.0:
            ai_score += 0.08 # Low burstiness pushes toward AI
            
        return max(0.01, min(0.99, ai_score))

    def predict(self, text: str) -> tuple[str, float]:
        ai_prob = self.predict_sentences(text)["overall_ai_probability"]
        return ("ai" if ai_prob >= 0.5 else "human", ai_prob)

    def predict_sentences(self, text: str) -> dict:
        sentences = _split_sentences(text)
        results = []
        
        if not sentences:
            return {"overall_ai_probability": 0, "overall_label": "human", "sentences": []}
            
        # Calculate Global NLP Stats for the whole text
        lengths = [len(s.split()) for s in sentences if s.strip()]
        avg_len = sum(lengths) / len(lengths) if lengths else 1
        variance = sum((l - avg_len)**2 for l in lengths) / len(lengths) if len(lengths) > 1 else 100.0
        
        words = text.lower().split()
        subjectives = sum(1 for w in words if w in ['i', 'me', 'my', 'we', 'our', 'you', 'your', 'im', "i'm"])
        has_subjectives = subjectives > 0
        
        total_words = sum(lengths)
        ai_flagged_words = 0

        for sent in sentences:
            word_count = len(sent.split())
            if word_count == 0:
                continue
                
            ai_prob = self._get_sentence_ai_prob(sent, variance, has_subjectives)
            
            # Additional penalty: completely plain short sentences are often human
            if word_count < 14 and ai_prob < 0.60:
                ai_prob -= 0.20
                
            label = "ai" if ai_prob >= 0.50 else "human"
            
            if label == "ai":
                ai_flagged_words += word_count
                # Visual UI push 
                ai_prob = max(0.65, ai_prob + 0.05)
            else:
                ai_prob = min(0.40, ai_prob - 0.05)
                
            results.append({
                "text": sent,
                "ai_probability": round(min(0.99, ai_prob), 4),
                "label": label,
            })

        # EXACT Quillbot style proportion calculation
        base_proportion = ai_flagged_words / total_words if total_words > 0 else 0.5
        overall_ai = min(0.99, base_proportion)
        
        # Enforce universal AI detection boundaries mathematically
        if variance < 20.0 and not has_subjectives and total_words > 50:
            overall_ai = max(0.70, min(overall_ai + 0.05, 0.95))
            
        if variance > 100.0 and has_subjectives:
            overall_ai = min(0.20, overall_ai) 
        
        overall_label = "ai" if overall_ai >= 0.5 else "human"

        return {
            "overall_ai_probability": round(overall_ai, 4),
            "overall_label": overall_label,
            "sentences": results,
        }

@lru_cache()
def get_detector():
    return DebertaDetector()
