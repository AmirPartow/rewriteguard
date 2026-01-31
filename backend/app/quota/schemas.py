"""
Pydantic schemas for plans and quotas.
"""
from datetime import date
from typing import Literal
from pydantic import BaseModel, Field


# Plan types
PlanType = Literal["free", "premium"]


class UsageStats(BaseModel):
    """Daily usage statistics for a user."""
    user_id: int
    plan_type: PlanType
    daily_limit: int = Field(..., description="Daily word limit based on plan")
    words_used_today: int = Field(..., ge=0, description="Total words used today")
    words_detect: int = Field(..., ge=0, description="Words used for detection")
    words_paraphrase: int = Field(..., ge=0, description="Words used for paraphrasing")
    words_remaining: int = Field(..., description="Words remaining for today")
    usage_date: date
    percentage_used: float = Field(..., ge=0, le=100, description="Percentage of quota used")


class QuotaCheckResult(BaseModel):
    """Result of checking if user has enough quota."""
    allowed: bool = Field(..., description="Whether the request is allowed")
    words_requested: int = Field(..., ge=0)
    words_remaining: int = Field(..., description="Words remaining after this request")
    message: str = Field(default="")


class QuotaError(BaseModel):
    """Error response when quota is exceeded."""
    error: str = "quota_exceeded"
    plan_type: PlanType
    daily_limit: int
    words_used: int
    words_requested: int
    upgrade_available: bool = True
    message: str
