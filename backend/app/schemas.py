from pydantic import BaseModel, Field
from typing import Literal

class DetectRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=20000, description="The text to analyze")

class DetectResponse(BaseModel):
    label: Literal["ai", "human"] = Field(..., description="The predicted label")
    probability: float = Field(..., ge=0.0, le=1.0, description="The confidence probability")

# Paraphrase schemas
ParaphraseMode = Literal["standard", "formal", "casual", "creative", "concise"]

class ParaphraseRequest(BaseModel):
    """
    Request body for /v1/paraphrase endpoint.
    
    Attributes:
        text: The text to paraphrase (1-10000 chars)
        mode: Paraphrasing style (standard, formal, casual, creative, concise)
        temperature: Controls randomness (0.0-1.0, higher = more creative)
        max_length: Maximum output length in tokens (default 512)
    """
    text: str = Field(..., min_length=1, max_length=10000, description="The text to paraphrase")
    mode: ParaphraseMode = Field(default="standard", description="Paraphrasing style mode")
    temperature: float = Field(default=0.7, ge=0.0, le=1.0, description="Controls randomness (0.0-1.0)")
    max_length: int = Field(default=512, ge=50, le=1024, description="Maximum output length in tokens")

class ParaphraseResponse(BaseModel):
    """
    Response from /v1/paraphrase endpoint with paraphrased text and metrics.
    
    Includes job recording information: latency and token usage for monitoring.
    """
    paraphrased_text: str = Field(..., description="The paraphrased text")
    mode: ParaphraseMode = Field(..., description="The mode used for paraphrasing")
    processing_time_ms: float = Field(..., ge=0.0, description="Processing time in milliseconds")
    # Token usage metrics for job recording
    input_tokens: int = Field(..., ge=0, description="Number of input tokens processed")
    output_tokens: int = Field(..., ge=0, description="Number of output tokens generated")
    total_tokens: int = Field(..., ge=0, description="Total tokens (input + output)")
