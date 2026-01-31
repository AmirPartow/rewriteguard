"""
FastAPI routes for quota and usage management.
"""
from fastapi import APIRouter, HTTPException, Header, status
from typing import Annotated
import logging

from app.quota.schemas import UsageStats, QuotaCheckResult
from app.quota.service import get_user_usage, check_quota, set_user_plan, PLAN_LIMITS
from app.auth.service import validate_session, SessionNotFoundError

router = APIRouter()
logger = logging.getLogger(__name__)


async def get_user_id_from_token(authorization: str | None) -> int:
    """Extract user ID from authorization header."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format",
        )
    
    try:
        user_info = await validate_session(parts[1])
        return user_info.id
    except SessionNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )


@router.get("/usage", response_model=UsageStats)
async def get_usage(
    authorization: Annotated[str | None, Header()] = None,
) -> UsageStats:
    """
    Get current user's usage statistics for today.
    
    Returns daily word usage, limits, and remaining quota.
    """
    user_id = await get_user_id_from_token(authorization)
    return get_user_usage(user_id)


@router.get("/check", response_model=QuotaCheckResult)
async def check_user_quota(
    words: int,
    authorization: Annotated[str | None, Header()] = None,
) -> QuotaCheckResult:
    """
    Check if user has enough quota for a given word count.
    
    - **words**: Number of words to check against quota
    """
    if words < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Word count must be non-negative",
        )
    
    user_id = await get_user_id_from_token(authorization)
    return check_quota(user_id, words)


@router.get("/plans")
async def get_plans():
    """
    Get available plans and their limits.
    """
    return {
        "plans": [
            {
                "name": "free",
                "daily_limit": PLAN_LIMITS["free"],
                "price": 0,
                "features": ["AI Detection", "Paraphrasing", "1,000 words/day"],
            },
            {
                "name": "premium",
                "daily_limit": PLAN_LIMITS["premium"],
                "price": 9.99,
                "features": ["AI Detection", "Paraphrasing", "10,000 words/day", "Priority Support"],
            },
        ]
    }


@router.post("/upgrade")
async def upgrade_plan(
    authorization: Annotated[str | None, Header()] = None,
):
    """
    Upgrade user to premium plan (demo - instantly upgrades).
    
    In production, this would integrate with payment processing.
    """
    user_id = await get_user_id_from_token(authorization)
    set_user_plan(user_id, "premium")
    
    usage = get_user_usage(user_id)
    
    return {
        "message": "Successfully upgraded to premium!",
        "plan_type": "premium",
        "daily_limit": PLAN_LIMITS["premium"],
        "words_remaining": usage.words_remaining,
    }
