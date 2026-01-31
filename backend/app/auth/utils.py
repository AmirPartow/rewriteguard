"""
Authentication utility functions for password hashing and session management.
"""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone


def hash_password(password: str) -> str:
    """
    Hash a password using SHA-256 with salt.
    For production, consider using bcrypt or argon2.
    """
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return f"{salt}${password_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    """
    Verify a password against a stored hash.
    """
    try:
        salt, hash_value = stored_hash.split("$")
        computed_hash = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
        return secrets.compare_digest(computed_hash, hash_value)
    except (ValueError, AttributeError):
        return False


def generate_token() -> str:
    """
    Generate a cryptographically secure session token.
    """
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """
    Hash a session token for storage.
    """
    return hashlib.sha256(token.encode()).hexdigest()


def create_session_token(days_valid: int = 7) -> tuple[str, str, datetime]:
    """
    Create a new session token with its hash and expiration.
    
    Returns:
        tuple: (raw_token, token_hash, expires_at)
    """
    token = generate_token()
    token_hash = hash_token(token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=days_valid)
    return token, token_hash, expires_at
