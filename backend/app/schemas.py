from pydantic import BaseModel, Field
from typing import Literal

class DetectRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=20000, description="The text to analyze")

class DetectResponse(BaseModel):
    label: Literal["ai", "human"] = Field(..., description="The predicted label")
    probability: float = Field(..., ge=0.0, le=1.0, description="The confidence probability")
