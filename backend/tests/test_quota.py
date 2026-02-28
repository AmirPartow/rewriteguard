"""
Tests for quota service and enforcement.
Uses an in-memory SQLite database for test isolation.
"""
import pytest
from datetime import date
from sqlalchemy import create_engine, text


@pytest.fixture(autouse=True)
def setup_test_db(monkeypatch):
    """Set up an in-memory SQLite database for each test."""
    import db as db_module

    test_engine = create_engine("sqlite:///:memory:")

    # Create tables that match the PostgreSQL schema
    with test_engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                full_name TEXT,
                password_hash TEXT NOT NULL DEFAULT '',
                is_active BOOLEAN NOT NULL DEFAULT 1,
                email_verified BOOLEAN NOT NULL DEFAULT 0,
                last_login TIMESTAMP,
                plan_type TEXT NOT NULL DEFAULT 'free',
                daily_word_limit INTEGER NOT NULL DEFAULT 1000,
                stripe_customer_id TEXT,
                stripe_subscription_id TEXT,
                subscription_status TEXT DEFAULT 'inactive',
                subscription_current_period_end TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE daily_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
                words_detect INTEGER NOT NULL DEFAULT 0,
                words_paraphrase INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, usage_date)
            )
        """))
        # Create a test user for all tests
        conn.execute(text("""
            INSERT INTO users (id, email, full_name, password_hash)
            VALUES (1, 'test@example.com', 'Test User', 'hash')
        """))
        conn.commit()

    # Patch the db module's engine to use our test engine
    monkeypatch.setattr(db_module, "engine", test_engine)

    yield test_engine

    test_engine.dispose()


# Import after fixture is defined
from app.quota.service import (
    get_user_usage, track_usage, check_quota, get_user_plan, set_user_plan,
    reset_daily_usage, QuotaExceededError, PLAN_LIMITS,
)


class TestPlanLimits:
    """Test plan configuration."""

    def test_free_plan_limit(self):
        """Free plan should have 1000 word limit."""
        assert PLAN_LIMITS["free"] == 1000

    def test_premium_plan_limit(self):
        """Premium plan should have 10000 word limit."""
        assert PLAN_LIMITS["premium"] == 10000


class TestUserPlan:
    """Test user plan management."""

    def test_default_plan_is_free(self):
        """New users should default to free plan."""
        assert get_user_plan(999) == "free"

    def test_set_plan_to_premium(self):
        """Setting plan to premium should work."""
        set_user_plan(1, "premium")
        assert get_user_plan(1) == "premium"


class TestUsageTracking:
    """Test word usage tracking."""

    def test_new_user_has_zero_usage(self):
        """New user should have no usage."""
        usage = get_user_usage(1)
        assert usage.words_used_today == 0
        assert usage.words_detect == 0
        assert usage.words_paraphrase == 0
        assert usage.words_remaining == 1000  # Free plan limit

    def test_track_detect_usage(self):
        """Should track detection word usage."""
        track_usage(1, 100, "detect")
        usage = get_user_usage(1)

        assert usage.words_detect == 100
        assert usage.words_paraphrase == 0
        assert usage.words_used_today == 100
        assert usage.words_remaining == 900

    def test_track_paraphrase_usage(self):
        """Should track paraphrase word usage."""
        track_usage(1, 200, "paraphrase")
        usage = get_user_usage(1)

        assert usage.words_detect == 0
        assert usage.words_paraphrase == 200
        assert usage.words_used_today == 200

    def test_track_combined_usage(self):
        """Should combine detect and paraphrase usage."""
        track_usage(1, 100, "detect")
        track_usage(1, 150, "paraphrase")
        track_usage(1, 50, "detect")

        usage = get_user_usage(1)
        assert usage.words_detect == 150
        assert usage.words_paraphrase == 150
        assert usage.words_used_today == 300
        assert usage.words_remaining == 700

    def test_percentage_calculation(self):
        """Should calculate percentage correctly."""
        track_usage(1, 500, "detect")
        usage = get_user_usage(1)
        assert usage.percentage_used == 50.0


class TestQuotaEnforcement:
    """Test quota limit enforcement."""

    def test_quota_check_allowed(self):
        """Should allow requests within quota."""
        result = check_quota(1, 500)
        assert result.allowed is True
        assert result.words_remaining == 500

    def test_quota_check_denied(self):
        """Should deny requests exceeding quota."""
        result = check_quota(1, 1500)  # Free limit is 1000
        assert result.allowed is False
        assert "exceeded" in result.message.lower() or "remaining" in result.message.lower()

    def test_track_usage_enforces_limit(self):
        """Should raise error when quota exceeded."""
        # Use 900 words
        track_usage(1, 900, "detect")

        # Try to use 200 more (would exceed 1000 limit)
        with pytest.raises(QuotaExceededError) as exc_info:
            track_usage(1, 200, "detect", enforce_limit=True)

        assert exc_info.value.daily_limit == 1000
        assert exc_info.value.words_used == 900
        assert exc_info.value.words_requested == 200

    def test_track_usage_without_enforcement(self):
        """Should allow exceeding when not enforcing."""
        track_usage(1, 900, "detect")
        # Should not raise even though it exceeds
        track_usage(1, 200, "detect", enforce_limit=False)

        usage = get_user_usage(1)
        assert usage.words_used_today == 1100
        assert usage.words_remaining == 0  # Capped at 0

    def test_premium_higher_limit(self):
        """Premium users should have higher limit."""
        set_user_plan(1, "premium")

        # Should allow 5000 words (would fail on free)
        track_usage(1, 5000, "detect")

        usage = get_user_usage(1)
        assert usage.daily_limit == 10000
        assert usage.words_remaining == 5000


class TestResetUsage:
    """Test usage reset functionality."""

    def test_reset_clears_usage(self):
        """Reset should clear daily usage."""
        track_usage(1, 500, "detect")
        track_usage(1, 300, "paraphrase")

        reset_daily_usage(1)

        usage = get_user_usage(1)
        assert usage.words_used_today == 0
        assert usage.words_detect == 0
        assert usage.words_paraphrase == 0
