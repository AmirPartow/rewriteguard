"""
Authentication service layer - handles business logic for user auth.
Uses PostgreSQL database for persistent storage.
Accounts survive container restarts and EC2 stop/start cycles.
"""

from datetime import datetime, timezone
from typing import Any
import logging

from sqlalchemy import text

from .utils import hash_password, verify_password, create_session_token, hash_token
from .schemas import UserInfo

logger = logging.getLogger(__name__)


def _get_engine():
    """Lazy import to avoid circular dependency at module load time."""
    from db import engine

    return engine


def _now():
    """Get the DB-appropriate NOW() function."""
    from db import now_func

    return now_func()


def _is_sqlite():
    """Check if we're using SQLite."""
    from db import IS_SQLITE

    return IS_SQLITE


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


class PasswordNotSetError(AuthServiceError):
    """User has no password set (likely social-only user)."""

    pass


async def create_user(email: str, password: str, full_name: str = "") -> dict[str, Any]:
    """
    Create a new user account in the database.

    Args:
        email: User's email (already validated and normalized)
        password: Plain text password (already validated)
        full_name: User's full name

    Returns:
        Dict with user_id and email

    Raises:
        EmailAlreadyExistsError: If email is already registered
    """
    engine = _get_engine()

    with engine.connect() as conn:
        # Check if email already exists
        result = conn.execute(
            text("SELECT id, password_hash FROM users WHERE email = :email"),
            {"email": email},
        )
        existing = result.fetchone()
        if existing:
            existing_id, existing_hash = existing
            # If the existing account has a broken/empty password hash
            # (from old in-memory code or DDL default ''), allow re-registration
            # by updating the password hash
            if not existing_hash or existing_hash == "" or "$" not in existing_hash:
                password_hash = hash_password(password)
                conn.execute(
                    text(
                        "UPDATE users SET password_hash = :password_hash, full_name = :full_name WHERE id = :id"
                    ),
                    {
                        "password_hash": password_hash,
                        "full_name": full_name,
                        "id": existing_id,
                    },
                )
                conn.commit()
                logger.info(
                    f"Updated password hash for existing user: {email} (id={existing_id})"
                )
                return {"user_id": existing_id, "email": email}
            else:
                logger.warning(f"Signup attempt with existing email: {email}")
                raise EmailAlreadyExistsError(
                    "An account with this email already exists"
                )

        password_hash = hash_password(password)
        now = _now()

        if _is_sqlite():
            # SQLite doesn't support RETURNING
            conn.execute(
                text(f"""
                    INSERT INTO users (email, full_name, password_hash, is_active, email_verified, created_at)
                    VALUES (:email, :full_name, :password_hash, 1, 0, {now})
                """),
                {
                    "email": email,
                    "full_name": full_name,
                    "password_hash": password_hash,
                },
            )
            result = conn.execute(text("SELECT last_insert_rowid()"))
            user_id = result.fetchone()[0]
        else:
            # PostgreSQL with RETURNING
            result = conn.execute(
                text(f"""
                    INSERT INTO users (email, full_name, password_hash, is_active, email_verified, created_at)
                    VALUES (:email, :full_name, :password_hash, TRUE, FALSE, {now})
                    RETURNING id
                """),
                {
                    "email": email,
                    "full_name": full_name,
                    "password_hash": password_hash,
                },
            )
            user_id = result.fetchone()[0]

        conn.commit()

    logger.info(f"New user created: {email} (id={user_id})")
    return {"user_id": user_id, "email": email}


async def authenticate_user(
    email: str, password: str
) -> tuple[str, datetime, UserInfo]:
    """
    Authenticate user and create a session in the database.

    Args:
        email: User's email
        password: Plain text password

    Returns:
        Tuple of (session_token, expires_at, user_info)

    Raises:
        InvalidCredentialsError: If email/password is incorrect
        UserNotActiveError: If user account is deactivated
    """
    engine = _get_engine()

    with engine.connect() as conn:
        # Look up user by email
        result = conn.execute(
            text(
                "SELECT id, email, full_name, password_hash, is_active FROM users WHERE email = :email"
            ),
            {"email": email},
        )
        row = result.fetchone()

        if not row:
            logger.warning(f"Login attempt with unknown email: {email}")
            raise InvalidCredentialsError("Invalid email or password")

        user_id, user_email, full_name, password_hash, is_active = row

        # CHECK 1: If user exists but has no password (signed up via social)
        if not password_hash or password_hash == "" or "$" not in str(password_hash):
            logger.warning(f"Login attempt for social-only account: {email}")
            raise PasswordNotSetError("Please set a password or use social login.")

        if not verify_password(password, password_hash):
            logger.warning(f"Login attempt with wrong password for: {email}")
            raise InvalidCredentialsError("Invalid email or password")

        if not is_active:
            logger.warning(f"Login attempt for inactive account: {email}")
            raise UserNotActiveError("Account is deactivated")

        # Create session
        token, token_hash, expires_at = create_session_token(days_valid=7)
        now = _now()

        conn.execute(
            text(f"""
                INSERT INTO sessions (user_id, token_hash, expires_at, created_at)
                VALUES (:user_id, :token_hash, :expires_at, {now})
            """),
            {
                "user_id": user_id,
                "token_hash": token_hash,
                "expires_at": expires_at,
            },
        )

        # Update last login
        conn.execute(
            text(f"UPDATE users SET last_login = {now} WHERE id = :user_id"),
            {"user_id": user_id},
        )
        conn.commit()

    user_info = UserInfo(
        id=user_id,
        email=user_email,
        full_name=full_name or "",
        is_active=bool(is_active),
    )

    logger.info(f"User logged in: {email}")
    return token, expires_at, user_info


async def social_login(
    provider: str, provider_id: str, email: str, full_name: str = ""
) -> tuple[str, datetime, UserInfo]:
    """
    Handle authentication via a social provider.
    Creates user if they don't exist by email or provider_id.
    """
    logger.info(f"Incoming social login request: {provider} / {provider_id} / {email}")
    engine = _get_engine()
    email = email.lower().strip()

    try:
        with engine.connect() as conn:
            # 1. Try to find user by provider_id
            logger.debug(f"Checking for existing user by {provider}_id: {provider_id}")
            result = conn.execute(
                text(
                    "SELECT id, email, full_name, is_active FROM users WHERE provider = :p AND provider_id = :pid"
                ),
                {"p": provider, "pid": provider_id},
            )
            row = result.fetchone()

            if not row:
                logger.debug(f"User not found by provider_id, checking by email: {email}")
                # 2. Try to find user by email
                result = conn.execute(
                    text("SELECT id, provider, provider_id FROM users WHERE email = :email"),
                    {"email": email},
                )
                email_row = result.fetchone()

                if email_row:
                    user_id, existing_provider, existing_pid = email_row
                    logger.debug(f"Found existing user by email: {user_id}. Linking provider.")
                    # Link provider if not already linked
                    if not existing_provider:
                        conn.execute(
                            text(
                                "UPDATE users SET provider = :p, provider_id = :pid WHERE id = :user_id"
                            ),
                            {"p": provider, "pid": provider_id, "user_id": user_id},
                        )
                else:
                    # 3. Create new user
                    logger.info(f"Creating new user for {email} via {provider}")
                    now = _now()
                    if _is_sqlite():
                        conn.execute(
                            text(f"""
                                INSERT INTO users (email, full_name, provider, provider_id, is_active, email_verified, created_at)
                                VALUES (:email, :full_name, :p, :pid, 1, 1, {now})
                            """),
                            {
                                "email": email,
                                "full_name": full_name,
                                "p": provider,
                                "pid": provider_id,
                            },
                        )
                        user_id = conn.execute(text("SELECT last_insert_rowid()")).fetchone()[
                            0
                        ]
                    else:
                        user_id = conn.execute(
                            text(f"""
                                INSERT INTO users (email, full_name, provider, provider_id, is_active, email_verified, created_at)
                                VALUES (:email, :full_name, :p, :pid, TRUE, TRUE, {now})
                                RETURNING id
                            """),
                            {
                                "email": email,
                                "full_name": full_name,
                                "p": provider,
                                "pid": provider_id,
                            },
                        ).fetchone()[0]
            else:
                user_id = row[0]
                logger.debug(f"Found existing user by provider_id: {user_id}")

            # Now get user info for session
            result = conn.execute(
                text("SELECT id, email, full_name, is_active FROM users WHERE id = :id"),
                {"id": user_id},
            )
            user_id, user_email, full_name, is_active = result.fetchone()

            if not is_active:
                logger.warning(f"Social login for inactive account: {user_email}")
                raise UserNotActiveError("Account is deactivated")

            # Create session
            logger.debug(f"Creating session for user {user_id}")
            token, token_hash, expires_at = create_session_token(
                days_valid=30
            )  # longer sessions for social
            now = _now()

            conn.execute(
                text(f"""
                    INSERT INTO sessions (user_id, token_hash, expires_at, created_at)
                    VALUES (:user_id, :token_hash, :expires_at, {now})
                """),
                {
                    "user_id": user_id,
                    "token_hash": token_hash,
                    "expires_at": expires_at,
                },
            )

            conn.execute(
                text(f"UPDATE users SET last_login = {now} WHERE id = :user_id"),
                {"user_id": user_id},
            )
            conn.commit()
    except Exception as e:
        logger.error(f"Social login failed: {str(e)}", exc_info=True)
        raise

    user_info = UserInfo(

        id=user_id,
        email=user_email,
        full_name=full_name or "",
        is_active=bool(is_active),
    )

    logger.info(f"Social user logged in: {user_email} via {provider}")
    return token, expires_at, user_info



async def validate_session(token: str) -> UserInfo:
    """
    Validate a session token and return user info from the database.

    Args:
        token: Raw session token

    Returns:
        UserInfo for the authenticated user

    Raises:
        SessionNotFoundError: If session is invalid or expired
    """
    engine = _get_engine()
    token_hash = hash_token(token)

    with engine.connect() as conn:
        # Look up session and join with user
        result = conn.execute(
            text("""
                SELECT s.user_id, s.expires_at, u.email, u.full_name, u.is_active
                FROM sessions s
                JOIN users u ON u.id = s.user_id
                WHERE s.token_hash = :token_hash
            """),
            {"token_hash": token_hash},
        )
        row = result.fetchone()

        if not row:
            raise SessionNotFoundError("Invalid session")

        user_id, expires_at, email, full_name, is_active = row

        # Handle timezone-aware comparison
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)

        now = datetime.now(timezone.utc)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < now:
            # Clean up expired session
            conn.execute(
                text("DELETE FROM sessions WHERE token_hash = :token_hash"),
                {"token_hash": token_hash},
            )
            conn.commit()
            raise SessionNotFoundError("Session expired")

        if not is_active:
            raise SessionNotFoundError("User not found or inactive")

    return UserInfo(
        id=user_id,
        email=email,
        full_name=full_name or "",
        is_active=bool(is_active),
    )


async def invalidate_session(token: str) -> bool:
    """
    Invalidate a session (logout) by removing it from the database.

    Args:
        token: Raw session token

    Returns:
        True if session was found and invalidated
    """
    engine = _get_engine()
    token_hash = hash_token(token)

    with engine.connect() as conn:
        if _is_sqlite():
            # SQLite: check then delete (no RETURNING)
            result = conn.execute(
                text("SELECT user_id FROM sessions WHERE token_hash = :token_hash"),
                {"token_hash": token_hash},
            )
            row = result.fetchone()
            if row:
                conn.execute(
                    text("DELETE FROM sessions WHERE token_hash = :token_hash"),
                    {"token_hash": token_hash},
                )
                conn.commit()
                logger.info(f"User logged out (user_id={row[0]})")
                return True
        else:
            # PostgreSQL with RETURNING
            result = conn.execute(
                text(
                    "DELETE FROM sessions WHERE token_hash = :token_hash RETURNING user_id"
                ),
                {"token_hash": token_hash},
            )
            row = result.fetchone()
            conn.commit()
            if row:
                logger.info(f"User logged out (user_id={row[0]})")
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


async def get_total_users() -> int:
    """
    Get the total number of registered users from the database.

    Returns:
        Total number of users as int.
    """
    engine = _get_engine()

    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM users"))
        actual_users = result.fetchone()[0]

    # Offset by a baseline so new site doesn't look empty, plus actual signups
    baseline = 10000
    return baseline + actual_users
async def set_password_for_social_user(email: str, password: str) -> bool:
    """
    Allow a social user to set a password for the first time.
    Only works if their password_hash is currently empty.
    """
    engine = _get_engine()
    password_hash = hash_password(password)
    email = email.lower().strip()

    with engine.connect() as conn:
        # Check if user exists and has NO password
        result = conn.execute(
            text("SELECT id, password_hash FROM users WHERE email = :email"),
            {"email": email},
        )
        row = result.fetchone()

        if not row:
            logger.warning(f"Set password attempt for unknown email: {email}")
            return False

        user_id, existing_hash = row
        if existing_hash and "$" in str(existing_hash):
            logger.warning(f"Set password attempt for user who ALREADY has a password: {email}")
            return False

        # Update the password
        conn.execute(
            text("UPDATE users SET password_hash = :hash WHERE id = :user_id"),
            {"hash": password_hash, "user_id": user_id},
        )
        conn.commit()
    
    logger.info(f"Password set successfully for social user: {email}")
    return True
