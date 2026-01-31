"""
Tests for authentication endpoints and service.
"""
import pytest
from app.auth.utils import hash_password, verify_password, create_session_token, hash_token
from app.auth.service import (
    create_user, authenticate_user, validate_session, invalidate_session,
    EmailAlreadyExistsError, InvalidCredentialsError, SessionNotFoundError,
    _users_db, _sessions_db
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
def clear_test_data():
    """Clear in-memory storage before and after each test."""
    _users_db.clear()
    _sessions_db.clear()
    yield
    _users_db.clear()
    _sessions_db.clear()


class TestAuthService:
    """Test authentication service functions."""
    
    @pytest.mark.anyio
    async def test_create_user_success(self):
        """Should create user and return user_id."""
        result = await create_user(
            email="test@example.com",
            password="SecurePass123",
            full_name="Test User"
        )
        
        assert result["email"] == "test@example.com"
        assert result["user_id"] == 1
        assert "test@example.com" in _users_db
    
    @pytest.mark.anyio
    async def test_create_user_duplicate_email(self):
        """Should raise error for duplicate email."""
        await create_user("test@example.com", "SecurePass123")
        
        with pytest.raises(EmailAlreadyExistsError):
            await create_user("test@example.com", "AnotherPass456")
    
    @pytest.mark.anyio
    async def test_authenticate_user_success(self):
        """Should authenticate and return session."""
        await create_user("test@example.com", "SecurePass123", "Test User")
        
        token, expires_at, user_info = await authenticate_user(
            email="test@example.com",
            password="SecurePass123"
        )
        
        assert isinstance(token, str)
        assert len(token) > 20
        assert user_info.email == "test@example.com"
        assert user_info.full_name == "Test User"
    
    @pytest.mark.anyio
    async def test_authenticate_user_wrong_password(self):
        """Should raise error for wrong password."""
        await create_user("test@example.com", "SecurePass123")
        
        with pytest.raises(InvalidCredentialsError):
            await authenticate_user("test@example.com", "WrongPass456")
    
    @pytest.mark.anyio
    async def test_authenticate_user_nonexistent(self):
        """Should raise error for nonexistent user."""
        with pytest.raises(InvalidCredentialsError):
            await authenticate_user("nobody@example.com", "AnyPass123")
    
    @pytest.mark.anyio
    async def test_validate_session_success(self):
        """Should validate token and return user info."""
        await create_user("test@example.com", "SecurePass123", "Test User")
        token, _, _ = await authenticate_user("test@example.com", "SecurePass123")
        
        user_info = await validate_session(token)
        
        assert user_info.email == "test@example.com"
        assert user_info.full_name == "Test User"
    
    @pytest.mark.anyio
    async def test_validate_session_invalid_token(self):
        """Should raise error for invalid token."""
        with pytest.raises(SessionNotFoundError):
            await validate_session("invalid_token_12345")
    
    @pytest.mark.anyio
    async def test_invalidate_session_success(self):
        """Should invalidate session and prevent reuse."""
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
        result = await invalidate_session("nonexistent_token")
        assert result is False
