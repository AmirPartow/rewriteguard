"""
Authentication service layer - handles business logic for user auth.
Uses in-memory storage for demo purposes.
In production, replace with proper database calls.
"""
from datetime import datetime, timezone
from typing import Any
import logging

from .utils import hash_password, verify_password, create_session_token, hash_token
from .schemas import UserInfo

logger = logging.getLogger(__name__)

# In-memory storage for demo (replace with database in production)
_users_db: dict[str, dict[str, Any]] = {}
_sessions_db: dict[str, dict[str, Any]] = {}
_user_id_counter = 1


class AuthServiceError(Exception):
    """Base exception for auth service errors."""
    pass


class EmailAlreadyExistsError(AuthServiceError):
    """Email already registered."""
    pass


class InvalidCredentialsError(AuthServiceError):
    """Invalid email or password."""
    pass


class SessionNotFoundError(AuthServiceError):
    """Session not found or expired."""
    pass


class UserNotActiveError(AuthServiceError):
    """User account is not active."""
    pass


async def create_user(email: str, password: str, full_name: str = "") -> dict[str, Any]:
    """
    Create a new user account.
    
    Args:
        email: User's email (already validated and normalized)
        password: Plain text password (already validated)
        full_name: User's full name
        
    Returns:
        Dict with user_id and email
        
    Raises:
        EmailAlreadyExistsError: If email is already registered
    """
    global _user_id_counter
    
    if email in _users_db:
        logger.warning(f"Signup attempt with existing email: {email}")
        raise EmailAlreadyExistsError("An account with this email already exists")
    
    password_hash = hash_password(password)
    user_id = _user_id_counter
    _user_id_counter += 1
    
    _users_db[email] = {
        "id": user_id,
        "email": email,
        "full_name": full_name,
        "password_hash": password_hash,
        "is_active": True,
        "email_verified": False,
        "created_at": datetime.now(timezone.utc),
        "last_login": None,
    }
    
    logger.info(f"New user created: {email} (id={user_id})")
    return {"user_id": user_id, "email": email}


async def authenticate_user(email: str, password: str) -> tuple[str, datetime, UserInfo]:
    """
    Authenticate user and create a session.
    
    Args:
        email: User's email
        password: Plain text password
        
    Returns:
        Tuple of (session_token, expires_at, user_info)
        
    Raises:
        InvalidCredentialsError: If email/password is incorrect
        UserNotActiveError: If user account is deactivated
    """
    user = _users_db.get(email)
    
    if not user:
        logger.warning(f"Login attempt with unknown email: {email}")
        raise InvalidCredentialsError("Invalid email or password")
    
    if not verify_password(password, user["password_hash"]):
        logger.warning(f"Login attempt with wrong password for: {email}")
        raise InvalidCredentialsError("Invalid email or password")
    
    if not user["is_active"]:
        logger.warning(f"Login attempt for inactive account: {email}")
        raise UserNotActiveError("Account is deactivated")
    
    # Create session
    token, token_hash, expires_at = create_session_token(days_valid=7)
    
    _sessions_db[token_hash] = {
        "user_id": user["id"],
        "email": email,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    }
    
    # Update last login
    user["last_login"] = datetime.now(timezone.utc)
    
    user_info = UserInfo(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        is_active=user["is_active"],
    )
    
    logger.info(f"User logged in: {email}")
    return token, expires_at, user_info


async def validate_session(token: str) -> UserInfo:
    """
    Validate a session token and return user info.
    
    Args:
        token: Raw session token
        
    Returns:
        UserInfo for the authenticated user
        
    Raises:
        SessionNotFoundError: If session is invalid or expired
    """
    token_hash = hash_token(token)
    session = _sessions_db.get(token_hash)
    
    if not session:
        raise SessionNotFoundError("Invalid session")
    
    if session["expires_at"] < datetime.now(timezone.utc):
        # Clean up expired session
        del _sessions_db[token_hash]
        raise SessionNotFoundError("Session expired")
    
    user = _users_db.get(session["email"])
    if not user or not user["is_active"]:
        raise SessionNotFoundError("User not found or inactive")
    
    return UserInfo(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        is_active=user["is_active"],
    )


async def invalidate_session(token: str) -> bool:
    """
    Invalidate a session (logout).
    
    Args:
        token: Raw session token
        
    Returns:
        True if session was found and invalidated
    """
    token_hash = hash_token(token)
    
    if token_hash in _sessions_db:
        email = _sessions_db[token_hash].get("email", "unknown")
        del _sessions_db[token_hash]
        logger.info(f"User logged out: {email}")
        return True
    
    return False


async def get_current_user(token: str) -> UserInfo | None:
    """
    Get current user from session token if valid.
    
    Args:
        token: Raw session token
        
    Returns:
        UserInfo if valid, None otherwise
    """
    try:
        return await validate_session(token)
    except SessionNotFoundError:
        return None
