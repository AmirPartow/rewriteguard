"""
Tests for authentication endpoints and service.
Uses an in-memory SQLite database for test isolation.
"""

import pytest
from sqlalchemy import create_engine, text
from app.auth.utils import (
    hash_password,
    verify_password,
    create_session_token,
    hash_token,
)


class TestPasswordUtils:
    """Test password hashing utilities."""

    def test_hash_password_creates_salted_hash(self):
        """Hash should include salt separator."""
        password = "SecurePass123"
        hashed = hash_password(password)

        assert "$" in hashed
        parts = hashed.split("$")
        assert len(parts) == 2
        assert len(parts[0]) == 32  # Salt is 16 bytes hex = 32 chars
        assert len(parts[1]) == 64  # SHA256 hex = 64 chars

    def test_hash_password_unique_per_call(self):
        """Same password should produce different hashes (different salts)."""
        password = "SecurePass123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        assert hash1 != hash2

    def test_verify_password_correct(self):
        """Correct password should verify."""
        password = "SecurePass123"
        hashed = hash_password(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Wrong password should not verify."""
        password = "SecurePass123"
        hashed = hash_password(password)

        assert verify_password("WrongPass123", hashed) is False

    def test_verify_password_invalid_hash_format(self):
        """Invalid hash format should return False."""
        assert verify_password("anypassword", "invalid_hash_no_separator") is False
        assert verify_password("anypassword", "") is False


class TestSessionTokenUtils:
    """Test session token utilities."""

    def test_create_session_token_returns_tuple(self):
        """Should return token, hash, and expiry."""
        token, token_hash, expires_at = create_session_token(days_valid=7)

        assert isinstance(token, str)
        assert isinstance(token_hash, str)
        assert len(token) > 20
        assert len(token_hash) == 64  # SHA256 hex

    def test_hash_token_consistent(self):
        """Same token should produce same hash."""
        token = "test_token_123"
        hash1 = hash_token(token)
        hash2 = hash_token(token)

        assert hash1 == hash2


@pytest.fixture(autouse=True)
def setup_test_db(monkeypatch):
    """Set up an in-memory SQLite database for each test."""
    import db as db_module

    test_engine = create_engine("sqlite:///:memory:")

    # Create tables that match the PostgreSQL schema
    with test_engine.connect() as conn:
        conn.execute(
            text("""
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
        """)
        )
        conn.execute(
            text("""
            CREATE TABLE sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                user_agent TEXT
            )
        """)
        )
        conn.commit()

    # Patch the db module's engine to use our test engine
    monkeypatch.setattr(db_module, "engine", test_engine)
    monkeypatch.setattr(db_module, "IS_SQLITE", True)
    monkeypatch.setattr(db_module, "now_func", lambda: "CURRENT_TIMESTAMP")

    yield test_engine

    test_engine.dispose()


class TestAuthService:
    """Test authentication service functions."""

    @pytest.mark.anyio
    async def test_create_user_success(self):
        """Should create user and return user_id."""
        from app.auth.service import create_user

        result = await create_user(
            email="test@example.com", password="SecurePass123", full_name="Test User"
        )

        assert result["email"] == "test@example.com"
        assert result["user_id"] >= 1

    @pytest.mark.anyio
    async def test_create_user_duplicate_email(self):
        """Should raise error for duplicate email."""
        from app.auth.service import create_user, EmailAlreadyExistsError

        await create_user("test@example.com", "SecurePass123")

        with pytest.raises(EmailAlreadyExistsError):
            await create_user("test@example.com", "AnotherPass456")

    @pytest.mark.anyio
    async def test_authenticate_user_success(self):
        """Should authenticate and return session."""
        from app.auth.service import create_user, authenticate_user

        await create_user("test@example.com", "SecurePass123", "Test User")

        token, expires_at, user_info = await authenticate_user(
            email="test@example.com", password="SecurePass123"
        )

        assert isinstance(token, str)
        assert len(token) > 20
        assert user_info.email == "test@example.com"
        assert user_info.full_name == "Test User"

    @pytest.mark.anyio
    async def test_authenticate_user_wrong_password(self):
        """Should raise error for wrong password."""
        from app.auth.service import (
            create_user,
            authenticate_user,
            InvalidCredentialsError,
        )

        await create_user("test@example.com", "SecurePass123")

        with pytest.raises(InvalidCredentialsError):
            await authenticate_user("test@example.com", "WrongPass456")

    @pytest.mark.anyio
    async def test_authenticate_user_nonexistent(self):
        """Should raise error for nonexistent user."""
        from app.auth.service import authenticate_user, InvalidCredentialsError

        with pytest.raises(InvalidCredentialsError):
            await authenticate_user("nobody@example.com", "AnyPass123")

    @pytest.mark.anyio
    async def test_validate_session_success(self):
        """Should validate token and return user info."""
        from app.auth.service import create_user, authenticate_user, validate_session

        await create_user("test@example.com", "SecurePass123", "Test User")
        token, _, _ = await authenticate_user("test@example.com", "SecurePass123")

        user_info = await validate_session(token)

        assert user_info.email == "test@example.com"
        assert user_info.full_name == "Test User"

    @pytest.mark.anyio
    async def test_validate_session_invalid_token(self):
        """Should raise error for invalid token."""
        from app.auth.service import validate_session, SessionNotFoundError

        with pytest.raises(SessionNotFoundError):
            await validate_session("invalid_token_12345")

    @pytest.mark.anyio
    async def test_invalidate_session_success(self):
        """Should invalidate session and prevent reuse."""
        from app.auth.service import (
            create_user,
            authenticate_user,
            validate_session,
            invalidate_session,
            SessionNotFoundError,
        )

        await create_user("test@example.com", "SecurePass123")
        token, _, _ = await authenticate_user("test@example.com", "SecurePass123")

        # Invalidate
        result = await invalidate_session(token)
        assert result is True

        # Token should no longer work
        with pytest.raises(SessionNotFoundError):
            await validate_session(token)

    @pytest.mark.anyio
    async def test_invalidate_session_nonexistent(self):
        """Should return False for nonexistent session."""
        from app.auth.service import invalidate_session

        result = await invalidate_session("nonexistent_token")
        assert result is False
