"""
Quota service for tracking and enforcing usage limits.
Uses PostgreSQL database for persistent storage.
"""

from datetime import date
from typing import Literal
import logging

from sqlalchemy import text

from .schemas import PlanType, UsageStats, QuotaCheckResult


def _now():
    """Get the DB-appropriate NOW() function."""
    from db import now_func

    return now_func()


logger = logging.getLogger(__name__)

# Plan limits: words per day
PLAN_LIMITS: dict[PlanType, int] = {
    "free": 1000,
    "premium": 10000,
}


def _get_engine():
    """Lazy import to avoid circular dependency at module load time."""
    from db import engine

    return engine


class QuotaExceededError(Exception):
    """Raised when user exceeds their daily word quota."""

    def __init__(
        self,
        plan_type: PlanType,
        daily_limit: int,
        words_used: int,
        words_requested: int,
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
    """Get user's plan type from the database. Defaults to 'free'."""
    engine = _get_engine()

    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT plan_type FROM users WHERE id = :user_id"),
            {"user_id": user_id},
        )
        row = result.fetchone()
        return row[0] if row else "free"


def set_user_plan(user_id: int, plan_type: PlanType) -> None:
    """Set user's plan type in the database."""
    engine = _get_engine()

    with engine.connect() as conn:
        conn.execute(
            text("UPDATE users SET plan_type = :plan_type WHERE id = :user_id"),
            {"plan_type": plan_type, "user_id": user_id},
        )
        conn.commit()

    logger.info(f"User {user_id} plan set to: {plan_type}")


def _get_today_str() -> str:
    """Get today's date as string key."""
    return date.today().isoformat()


def get_user_usage(user_id: int) -> UsageStats:
    """
    Get usage statistics for a user for today from the database.

    Args:
        user_id: The user's ID

    Returns:
        UsageStats with current usage and limits
    """
    plan_type = get_user_plan(user_id)
    daily_limit = PLAN_LIMITS.get(plan_type, 1000)
    today = date.today()

    engine = _get_engine()

    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT words_detect, words_paraphrase
                FROM daily_usage
                WHERE user_id = :user_id AND usage_date = :today
            """),
            {"user_id": user_id, "today": today},
        )
        row = result.fetchone()

    words_detect = row[0] if row else 0
    words_paraphrase = row[1] if row else 0
    words_used_today = words_detect + words_paraphrase
    words_remaining = max(0, daily_limit - words_used_today)
    percentage_used = (
        min(100.0, (words_used_today / daily_limit) * 100) if daily_limit > 0 else 0
    )

    return UsageStats(
        user_id=user_id,
        plan_type=plan_type,
        daily_limit=daily_limit,
        words_used_today=words_used_today,
        words_detect=words_detect,
        words_paraphrase=words_paraphrase,
        words_remaining=words_remaining,
        usage_date=today,
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
    enforce_limit: bool = True,
) -> UsageStats:
    """
    Track word usage for a user in the database.

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
    daily_limit = PLAN_LIMITS.get(plan_type, 1000)
    today = date.today()

    engine = _get_engine()

    with engine.connect() as conn:
        # Get current usage
        result = conn.execute(
            text("""
                SELECT words_detect, words_paraphrase
                FROM daily_usage
                WHERE user_id = :user_id AND usage_date = :today
            """),
            {"user_id": user_id, "today": today},
        )
        row = result.fetchone()

        current_detect = row[0] if row else 0
        current_paraphrase = row[1] if row else 0
        current_total = current_detect + current_paraphrase

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

        # Upsert usage
        if row:
            # Update existing row
            if usage_type == "detect":
                conn.execute(
                    text(f"""
                        UPDATE daily_usage 
                        SET words_detect = words_detect + :word_count, updated_at = {_now()}
                        WHERE user_id = :user_id AND usage_date = :today
                    """),
                    {"word_count": word_count, "user_id": user_id, "today": today},
                )
            else:
                conn.execute(
                    text(f"""
                        UPDATE daily_usage 
                        SET words_paraphrase = words_paraphrase + :word_count, updated_at = {_now()}
                        WHERE user_id = :user_id AND usage_date = :today
                    """),
                    {"word_count": word_count, "user_id": user_id, "today": today},
                )
        else:
            # Insert new row
            detect_val = word_count if usage_type == "detect" else 0
            paraphrase_val = word_count if usage_type == "paraphrase" else 0
            conn.execute(
                text("""
                    INSERT INTO daily_usage (user_id, usage_date, words_detect, words_paraphrase)
                    VALUES (:user_id, :today, :detect, :paraphrase)
                """),
                {
                    "user_id": user_id,
                    "today": today,
                    "detect": detect_val,
                    "paraphrase": paraphrase_val,
                },
            )
        conn.commit()

    logger.info(
        f"User {user_id} used {word_count} words for {usage_type}. "
        f"Today's total: {current_total + word_count}/{daily_limit}"
    )

    return get_user_usage(user_id)


def reset_daily_usage(user_id: int) -> None:
    """Reset a user's daily usage (for testing)."""
    engine = _get_engine()
    today = date.today()

    with engine.connect() as conn:
        conn.execute(
            text(f"""
                UPDATE daily_usage 
                SET words_detect = 0, words_paraphrase = 0, updated_at = {_now()}
                WHERE user_id = :user_id AND usage_date = :today
            """),
            {"user_id": user_id, "today": today},
        )
        conn.commit()


def get_all_usage() -> dict[int, dict[str, dict[str, int]]]:
    """Get all usage data (for debugging)."""
    engine = _get_engine()

    result_dict: dict[int, dict[str, dict[str, int]]] = {}

    with engine.connect() as conn:
        result = conn.execute(
            text(
                "SELECT user_id, usage_date, words_detect, words_paraphrase FROM daily_usage"
            )
        )
        for row in result:
            user_id = row[0]
            date_str = str(row[1])
            if user_id not in result_dict:
                result_dict[user_id] = {}
            result_dict[user_id][date_str] = {
                "detect": row[2],
                "paraphrase": row[3],
            }

    return result_dict
