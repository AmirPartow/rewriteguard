"""
Quota service for tracking and enforcing usage limits.
Uses in-memory storage for demo (replace with database in production).
"""
from datetime import date, datetime, timezone
from typing import Any, Literal
import logging

from .schemas import PlanType, UsageStats, QuotaCheckResult

logger = logging.getLogger(__name__)

# Plan limits: words per day
PLAN_LIMITS: dict[PlanType, int] = {
    "free": 1000,
    "premium": 10000,
}

# In-memory storage for demo (replace with database in production)
# Structure: {user_id: {date_str: {"detect": int, "paraphrase": int}}}
_usage_db: dict[int, dict[str, dict[str, int]]] = {}

# User plan storage (in production, this would be in the users table)
_user_plans: dict[int, PlanType] = {}


class QuotaExceededError(Exception):
    """Raised when user exceeds their daily word quota."""
    def __init__(
        self, 
        plan_type: PlanType, 
        daily_limit: int, 
        words_used: int, 
        words_requested: int
    ):
        self.plan_type = plan_type
        self.daily_limit = daily_limit
        self.words_used = words_used
        self.words_requested = words_requested
        self.words_remaining = max(0, daily_limit - words_used)
        super().__init__(
            f"Quota exceeded: {words_used}/{daily_limit} words used, "
            f"requested {words_requested}, remaining {self.words_remaining}"
        )


def get_user_plan(user_id: int) -> PlanType:
    """Get user's plan type. Defaults to 'free'."""
    return _user_plans.get(user_id, "free")


def set_user_plan(user_id: int, plan_type: PlanType) -> None:
    """Set user's plan type."""
    _user_plans[user_id] = plan_type
    logger.info(f"User {user_id} plan set to: {plan_type}")


def _get_today_str() -> str:
    """Get today's date as string key."""
    return date.today().isoformat()


def get_user_usage(user_id: int) -> UsageStats:
    """
    Get usage statistics for a user for today.
    
    Args:
        user_id: The user's ID
        
    Returns:
        UsageStats with current usage and limits
    """
    plan_type = get_user_plan(user_id)
    daily_limit = PLAN_LIMITS[plan_type]
    today_str = _get_today_str()
    
    user_usage = _usage_db.get(user_id, {})
    today_usage = user_usage.get(today_str, {"detect": 0, "paraphrase": 0})
    
    words_detect = today_usage.get("detect", 0)
    words_paraphrase = today_usage.get("paraphrase", 0)
    words_used_today = words_detect + words_paraphrase
    words_remaining = max(0, daily_limit - words_used_today)
    percentage_used = min(100.0, (words_used_today / daily_limit) * 100) if daily_limit > 0 else 0
    
    return UsageStats(
        user_id=user_id,
        plan_type=plan_type,
        daily_limit=daily_limit,
        words_used_today=words_used_today,
        words_detect=words_detect,
        words_paraphrase=words_paraphrase,
        words_remaining=words_remaining,
        usage_date=date.today(),
        percentage_used=round(percentage_used, 1),
    )


def check_quota(user_id: int, word_count: int) -> QuotaCheckResult:
    """
    Check if user has enough quota for the requested word count.
    
    Args:
        user_id: The user's ID
        word_count: Number of words to process
        
    Returns:
        QuotaCheckResult indicating if request is allowed
    """
    usage = get_user_usage(user_id)
    
    if word_count <= usage.words_remaining:
        return QuotaCheckResult(
            allowed=True,
            words_requested=word_count,
            words_remaining=usage.words_remaining - word_count,
            message="Quota available",
        )
    else:
        return QuotaCheckResult(
            allowed=False,
            words_requested=word_count,
            words_remaining=usage.words_remaining,
            message=f"Quota exceeded. You have {usage.words_remaining} words remaining today. "
                    f"Upgrade to premium for {PLAN_LIMITS['premium']:,} words/day.",
        )


def track_usage(
    user_id: int, 
    word_count: int, 
    usage_type: Literal["detect", "paraphrase"],
    enforce_limit: bool = True
) -> UsageStats:
    """
    Track word usage for a user.
    
    Args:
        user_id: The user's ID
        word_count: Number of words used
        usage_type: Type of usage ("detect" or "paraphrase")
        enforce_limit: If True, raises QuotaExceededError when limit reached
        
    Returns:
        Updated UsageStats
        
    Raises:
        QuotaExceededError: If enforce_limit is True and quota would be exceeded
    """
    plan_type = get_user_plan(user_id)
    daily_limit = PLAN_LIMITS[plan_type]
    today_str = _get_today_str()
    
    # Initialize user storage if needed
    if user_id not in _usage_db:
        _usage_db[user_id] = {}
    
    if today_str not in _usage_db[user_id]:
        _usage_db[user_id][today_str] = {"detect": 0, "paraphrase": 0}
    
    current_usage = _usage_db[user_id][today_str]
    current_total = current_usage["detect"] + current_usage["paraphrase"]
    
    # Check quota if enforcing
    if enforce_limit and (current_total + word_count) > daily_limit:
        logger.warning(
            f"Quota exceeded for user {user_id}: "
            f"{current_total}/{daily_limit} used, requested {word_count}"
        )
        raise QuotaExceededError(
            plan_type=plan_type,
            daily_limit=daily_limit,
            words_used=current_total,
            words_requested=word_count,
        )
    
    # Track usage
    _usage_db[user_id][today_str][usage_type] += word_count
    
    logger.info(
        f"User {user_id} used {word_count} words for {usage_type}. "
        f"Today's total: {current_total + word_count}/{daily_limit}"
    )
    
    return get_user_usage(user_id)


def reset_daily_usage(user_id: int) -> None:
    """Reset a user's daily usage (for testing)."""
    today_str = _get_today_str()
    if user_id in _usage_db and today_str in _usage_db[user_id]:
        _usage_db[user_id][today_str] = {"detect": 0, "paraphrase": 0}


def get_all_usage() -> dict[int, dict[str, dict[str, int]]]:
    """Get all usage data (for debugging)."""
    return _usage_db.copy()
