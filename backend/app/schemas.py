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
    text: str = Field(..., min_length=1, max_length=10000, description="The text to paraphrase")
    mode: ParaphraseMode = Field(default="standard", description="Paraphrasing style mode")

class ParaphraseResponse(BaseModel):
    paraphrased_text: str = Field(..., description="The paraphrased text")
    mode: ParaphraseMode = Field(..., description="The mode used for paraphrasing")
    processing_time_ms: float = Field(..., ge=0.0, description="Processing time in milliseconds")
