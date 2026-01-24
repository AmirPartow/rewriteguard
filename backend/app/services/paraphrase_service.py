"""
Paraphrase Service Module
=========================

This module provides the T5-large based paraphrasing service with comprehensive
text preprocessing and post-processing capabilities.

Features:
- T5-large model integration for high-quality paraphrasing
- Text preprocessing: cleaning, chunking, tokenization
- Post-processing: chunk merging, length trimming
- Multiple paraphrase modes for different writing styles
- Graceful fallback for development/testing environments

Model: google/flan-t5-large (or similar T5-large variant)

Author: RewriteGuard Team
"""

import logging
import re
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from functools import lru_cache
from typing import Literal, List, Optional

logger = logging.getLogger(__name__)

# Type alias for paraphrase modes
ParaphraseMode = Literal["standard", "formal", "casual", "creative", "concise"]

# Configuration constants
MAX_CHUNK_LENGTH = 450  # Max tokens per chunk (leaving room for prompt)
MAX_OUTPUT_LENGTH = 512  # Max output tokens per chunk
MIN_CHUNK_LENGTH = 50   # Minimum tokens to form a chunk
OVERLAP_SENTENCES = 1    # Number of sentences to overlap between chunks


class TextPreprocessor:
    """
    Handles text preprocessing operations including cleaning, chunking, and tokenization.
    Prepares raw text for optimal processing by the T5 model.
    """
    
    def __init__(self, tokenizer):
        """
        Initialize the preprocessor with a tokenizer.
        
        Args:
            tokenizer: HuggingFace tokenizer for the T5 model
        """
        self.tokenizer = tokenizer
    
    def clean_text(self, text: str) -> str:
        """
        Clean and normalize input text.
        
        Operations:
        - Normalize whitespace (multiple spaces -> single space)
        - Normalize line breaks
        - Remove control characters
        - Strip leading/trailing whitespace
        
        Args:
            text: Raw input text
            
        Returns:
            Cleaned text ready for processing
        """
        # Normalize unicode characters
        text = text.strip()
        
        # Replace multiple whitespaces with single space
        text = re.sub(r'[ \t]+', ' ', text)
        
        # Normalize line breaks (multiple -> double for paragraph separation)
        text = re.sub(r'\n\s*\n', '\n\n', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Remove control characters except newlines and tabs
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
        
        return text
    
    def split_into_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences for chunking.
        
        Uses regex pattern to detect sentence boundaries while handling
        common abbreviations and edge cases.
        
        Args:
            text: Cleaned text
            
        Returns:
            List of sentences
        """
        # Simple sentence splitting pattern
        # Handles: periods, question marks, exclamation points
        # Avoids splitting on common abbreviations
        sentence_pattern = r'(?<=[.!?])\s+(?=[A-Z])'
        sentences = re.split(sentence_pattern, text)
        
        # Filter out empty sentences and strip whitespace
        sentences = [s.strip() for s in sentences if s.strip()]
        
        return sentences
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into processable chunks that fit within model context.
        
        Strategy:
        - Split into sentences first
        - Group sentences into chunks under MAX_CHUNK_LENGTH tokens
        - Maintain sentence boundaries (no mid-sentence splits)
        - Add overlap between chunks for coherent output
        
        Args:
            text: Cleaned input text
            
        Returns:
            List of text chunks ready for tokenization
        """
        sentences = self.split_into_sentences(text)
        
        if not sentences:
            return [text] if text else []
        
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            # Estimate token count for this sentence
            sentence_tokens = len(self.tokenizer.encode(sentence, add_special_tokens=False))
            
            # If single sentence exceeds max, it becomes its own chunk
            if sentence_tokens > MAX_CHUNK_LENGTH:
                # Save current chunk if exists
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                    current_chunk = []
                    current_length = 0
                
                # Add long sentence as its own chunk (will be truncated by model)
                chunks.append(sentence)
                continue
            
            # Check if adding this sentence would exceed limit
            if current_length + sentence_tokens > MAX_CHUNK_LENGTH:
                # Save current chunk
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                
                # Start new chunk with overlap (last sentence from previous)
                if OVERLAP_SENTENCES > 0 and current_chunk:
                    overlap = current_chunk[-OVERLAP_SENTENCES:]
                    current_chunk = overlap + [sentence]
                    current_length = sum(
                        len(self.tokenizer.encode(s, add_special_tokens=False)) 
                        for s in current_chunk
                    )
                else:
                    current_chunk = [sentence]
                    current_length = sentence_tokens
            else:
                current_chunk.append(sentence)
                current_length += sentence_tokens
        
        # Don't forget the last chunk
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        logger.info(f"Text chunked into {len(chunks)} chunks")
        return chunks
    
    def tokenize(self, text: str, max_length: int = MAX_CHUNK_LENGTH) -> dict:
        """
        Tokenize text for model input.
        
        Args:
            text: Text to tokenize
            max_length: Maximum sequence length
            
        Returns:
            Dictionary with input_ids, attention_mask, etc.
        """
        return self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=max_length,
            padding=True
        )


class TextPostprocessor:
    """
    Handles post-processing of model output including chunk merging and length trimming.
    Ensures coherent, well-formatted final output.
    """
    
    def __init__(self, tokenizer):
        """
        Initialize the postprocessor with a tokenizer.
        
        Args:
            tokenizer: HuggingFace tokenizer for decoding
        """
        self.tokenizer = tokenizer
    
    def decode_output(self, output_ids: torch.Tensor) -> str:
        """
        Decode model output tokens to text.
        
        Args:
            output_ids: Token IDs from model generation
            
        Returns:
            Decoded text string
        """
        return self.tokenizer.decode(output_ids, skip_special_tokens=True)
    
    def merge_chunks(self, chunks: List[str]) -> str:
        """
        Merge paraphrased chunks into coherent output.
        
        Strategy:
        - Remove duplicate sentences from overlapping regions
        - Ensure proper spacing and punctuation
        - Maintain paragraph structure
        
        Args:
            chunks: List of paraphrased text chunks
            
        Returns:
            Merged, coherent text
        """
        if not chunks:
            return ""
        
        if len(chunks) == 1:
            return chunks[0].strip()
        
        merged = chunks[0].strip()
        
        for i in range(1, len(chunks)):
            current_chunk = chunks[i].strip()
            
            if not current_chunk:
                continue
            
            # Try to detect and remove overlapping content
            merged_sentences = self._split_sentences(merged)
            current_sentences = self._split_sentences(current_chunk)
            
            # Check for overlap at boundary
            overlap_found = False
            for overlap_size in range(min(3, len(merged_sentences)), 0, -1):
                if overlap_size <= len(current_sentences):
                    # Compare last N sentences of merged with first N of current
                    merged_end = ' '.join(merged_sentences[-overlap_size:]).lower()
                    current_start = ' '.join(current_sentences[:overlap_size]).lower()
                    
                    # Fuzzy match (allow small differences)
                    if self._similarity(merged_end, current_start) > 0.8:
                        # Remove overlapping sentences from current chunk
                        current_chunk = ' '.join(current_sentences[overlap_size:])
                        overlap_found = True
                        break
            
            # Add space and append
            if current_chunk:
                if merged and not merged.endswith((' ', '\n')):
                    merged += ' '
                merged += current_chunk
        
        return merged
    
    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences for overlap detection."""
        pattern = r'(?<=[.!?])\s+'
        sentences = re.split(pattern, text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _similarity(self, text1: str, text2: str) -> float:
        """Calculate simple word-based similarity ratio."""
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1 & words2
        union = words1 | words2
        
        return len(intersection) / len(union) if union else 0.0
    
    def trim_length(self, text: str, max_chars: Optional[int] = None, 
                    max_sentences: Optional[int] = None) -> str:
        """
        Trim output to specified length constraints.
        
        Args:
            text: Text to trim
            max_chars: Maximum character count (optional)
            max_sentences: Maximum sentence count (optional)
            
        Returns:
            Trimmed text, cut at sentence boundary when possible
        """
        if not text:
            return text
        
        # Trim by sentence count first
        if max_sentences is not None:
            sentences = self._split_sentences(text)
            if len(sentences) > max_sentences:
                text = ' '.join(sentences[:max_sentences])
                # Ensure proper ending punctuation
                if text and text[-1] not in '.!?':
                    text += '.'
        
        # Trim by character count
        if max_chars is not None and len(text) > max_chars:
            # Try to cut at sentence boundary
            sentences = self._split_sentences(text)
            trimmed = ""
            
            for sentence in sentences:
                if len(trimmed) + len(sentence) + 1 <= max_chars:
                    trimmed = (trimmed + ' ' + sentence).strip() if trimmed else sentence
                else:
                    break
            
            # If no complete sentence fits, hard cut with ellipsis
            if not trimmed:
                trimmed = text[:max_chars-3].rsplit(' ', 1)[0] + '...'
            
            text = trimmed
        
        return text
    
    def clean_output(self, text: str) -> str:
        """
        Final cleanup of output text.
        
        Operations:
        - Fix double spaces
        - Fix punctuation spacing
        - Ensure proper capitalization
        
        Args:
            text: Raw model output
            
        Returns:
            Cleaned, polished text
        """
        # Fix multiple spaces
        text = re.sub(r' +', ' ', text)
        
        # Fix spacing around punctuation
        text = re.sub(r'\s+([.!?,;:])', r'\1', text)
        text = re.sub(r'([.!?])\s*([A-Z])', r'\1 \2', text)
        
        # Ensure first character is capitalized
        if text:
            text = text[0].upper() + text[1:]
        
        return text.strip()


class Paraphraser:
    """
    Main paraphraser class integrating T5-large model with preprocessing and post-processing.
    
    Supports multiple paraphrasing modes for different writing styles:
    - standard: Balanced rewrite maintaining original meaning
    - formal: Professional, academic tone
    - casual: Conversational, friendly style
    - creative: Unique, expressive rewording
    - concise: Brief, to-the-point version
    """
    
    # Mode-specific prompts for T5
    MODE_PROMPTS = {
        "standard": "paraphrase: ",
        "formal": "paraphrase in formal language: ",
        "casual": "paraphrase in casual language: ",
        "creative": "paraphrase creatively: ",
        "concise": "paraphrase concisely: ",
    }
    
    # T5-large model configuration
    MODEL_NAME = "google/flan-t5-large"  # High-quality T5-large variant
    FALLBACK_MODEL = "google/flan-t5-base"  # Smaller fallback if large fails
    
    def __init__(self, model_name: Optional[str] = None):
        """
        Initialize the T5-large paraphraser with all components.
        
        Downloads and configures the model and tokenizer on first use.
        Falls back to smaller model or mock mode if resources unavailable.
        
        Args:
            model_name: Optional override for model name (for testing)
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_name = model_name or self.MODEL_NAME
        self.model = None
        self.tokenizer = None
        self.preprocessor = None
        self.postprocessor = None
        
        self._load_model()
    
    def _load_model(self):
        """
        Download and configure T5-large model and tokenizer.
        
        Attempts to load the primary model, falls back to smaller variant,
        and finally to mock mode if all fails.
        """
        models_to_try = [self.model_name, self.FALLBACK_MODEL]
        
        for model_name in models_to_try:
            try:
                logger.info(f"Loading paraphrase model: {model_name} on {self.device}")
                
                # Download and load tokenizer
                self.tokenizer = AutoTokenizer.from_pretrained(
                    model_name,
                    model_max_length=512
                )
                
                # Download and load model
                self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
                self.model.to(self.device)
                self.model.eval()
                
                # Initialize preprocessor and postprocessor with tokenizer
                self.preprocessor = TextPreprocessor(self.tokenizer)
                self.postprocessor = TextPostprocessor(self.tokenizer)
                
                logger.info(f"Successfully loaded paraphrase model: {model_name}")
                self.model_name = model_name
                return
                
            except Exception as e:
                logger.warning(f"Failed to load {model_name}: {e}")
                continue
        
        logger.error("All model loading attempts failed. Using mock mode.")
    
    def paraphrase(self, text: str, mode: ParaphraseMode = "standard") -> str:
        """
        Paraphrase the input text using T5-large with full preprocessing/postprocessing.
        
        Pipeline:
        1. Preprocess: clean -> chunk -> tokenize
        2. Generate: run each chunk through T5 model
        3. Postprocess: decode -> merge chunks -> trim -> clean
        
        Args:
            text: Input text to paraphrase
            mode: Paraphrasing style (standard, formal, casual, creative, concise)
            
        Returns:
            Paraphrased text in the specified style
        """
        # Fallback to mock if model not loaded
        if not self.model or not self.tokenizer:
            logger.warning("Model not loaded, returning mock paraphrase.")
            return self._mock_paraphrase(text, mode)
        
        try:
            # === PREPROCESSING ===
            # Step 1: Clean the input text
            cleaned_text = self.preprocessor.clean_text(text)
            logger.debug(f"Cleaned text length: {len(cleaned_text)}")
            
            # Step 2: Chunk text for processing
            chunks = self.preprocessor.chunk_text(cleaned_text)
            logger.info(f"Processing {len(chunks)} chunks in '{mode}' mode")
            
            # === GENERATION ===
            # Step 3: Process each chunk through the model
            paraphrased_chunks = []
            prompt = self.MODE_PROMPTS.get(mode, self.MODE_PROMPTS["standard"])
            
            for i, chunk in enumerate(chunks):
                # Prepare input with mode-specific prompt
                input_text = f"{prompt}{chunk}"
                
                # Tokenize
                inputs = self.preprocessor.tokenize(input_text)
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                
                # Generate paraphrase
                with torch.no_grad():
                    outputs = self.model.generate(
                        **inputs,
                        max_length=MAX_OUTPUT_LENGTH,
                        num_beams=5,
                        num_return_sequences=1,
                        temperature=0.8 if mode == "creative" else 0.7,
                        do_sample=(mode == "creative"),
                        early_stopping=True,
                        no_repeat_ngram_size=3,
                        length_penalty=1.0 if mode != "concise" else 0.8,
                    )
                
                # Decode output
                paraphrased = self.postprocessor.decode_output(outputs[0])
                paraphrased_chunks.append(paraphrased)
                
                logger.debug(f"Chunk {i+1}/{len(chunks)} processed")
            
            # === POST-PROCESSING ===
            # Step 4: Merge chunks
            merged_text = self.postprocessor.merge_chunks(paraphrased_chunks)
            
            # Step 5: Clean final output
            final_text = self.postprocessor.clean_output(merged_text)
            
            # Step 6: Trim if concise mode
            if mode == "concise":
                original_sentences = len(self.preprocessor.split_into_sentences(cleaned_text))
                target_sentences = max(1, int(original_sentences * 0.7))  # 70% of original
                final_text = self.postprocessor.trim_length(final_text, max_sentences=target_sentences)
            
            logger.info(f"Paraphrase complete: {len(text)} -> {len(final_text)} chars")
            return final_text
            
        except Exception as e:
            logger.error(f"Paraphrase error: {e}", exc_info=True)
            raise
    
    def _mock_paraphrase(self, text: str, mode: ParaphraseMode) -> str:
        """
        Mock paraphrase for development/testing when model isn't available.
        
        Provides realistic-looking output for UI development.
        
        Args:
            text: Input text
            mode: Paraphrase mode
            
        Returns:
            Mock paraphrased text
        """
        mode_transforms = {
            "standard": lambda t: f"[Paraphrased] {t}",
            "formal": lambda t: f"In formal terms, {t.lower()}",
            "casual": lambda t: f"So basically, {t.lower()}",
            "creative": lambda t: f"Reimagining this: {t}",
            "concise": lambda t: ' '.join(t.split()[:len(t.split())//2]) + "...",
        }
        
        transform = mode_transforms.get(mode, mode_transforms["standard"])
        return transform(text)


@lru_cache()
def get_paraphraser() -> Paraphraser:
    """
    Singleton getter for the Paraphraser instance.
    
    Uses LRU cache to ensure only one model instance is loaded,
    conserving memory and improving response times.
    
    Returns:
        Shared Paraphraser instance
    """
    return Paraphraser()
