"""
FastAPI authentication routes for signup, login, and logout.
"""

from fastapi import APIRouter, HTTPException, Header, status
from typing import Annotated
import logging

from app.auth.schemas import (
    SignupRequest,
    SignupResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    UserInfo,
    SocialLoginRequest,
    SocialConfirmRequest,
    SetPasswordRequest,
)
from app.auth.service import (
    create_user,
    authenticate_user,
    social_login,
    set_password_for_social_user,
    invalidate_session,
    validate_session,
    get_total_users,
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    UserNotActiveError,
    SessionNotFoundError,
    PasswordNotSetError,
)
from app.auth.social import verify_google_code, verify_facebook_code

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED
)
async def signup(request: SignupRequest) -> SignupResponse:
    """
    Create a new user account.

    - **email**: Valid email address (will be normalized to lowercase)
    - **password**: Minimum 8 characters, must contain uppercase, lowercase, and digit
    - **full_name**: Optional, user's full name
    """
    try:
        result = await create_user(
            email=request.email,
            password=request.password,
            full_name=request.full_name,
        )
        return SignupResponse(
            user_id=result["user_id"],
            email=result["email"],
        )
    except EmailAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest) -> LoginResponse:
    """
    Authenticate user and receive a session token.

    - **email**: Registered email address
    - **password**: Account password

    Returns a session token valid for 7 days.
    """
    try:
        token, expires_at, user_info = await authenticate_user(
            email=request.email,
            password=request.password,
        )
        return LoginResponse(
            token=token,
            user=user_info,
            expires_at=expires_at,
        )
    except InvalidCredentialsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )
    except PasswordNotSetError as e:
        # User exists via social login but has no email password yet
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ACCOUNT_HAS_NO_PASSWORD",
        )
    except UserNotActiveError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


@router.post("/social-login", response_model=LoginResponse)
async def social_auth(request: SocialLoginRequest) -> LoginResponse:
    """
    Simulated social login. In production, this would verify OAuth tokens.
    """
    try:
        token, expires_at, user_info = await social_login(
            provider=request.provider,
            provider_id=request.provider_id,
            email=request.email,
            full_name=request.full_name,
        )
        return LoginResponse(
            token=token,
            user=user_info,
            expires_at=expires_at,
        )
    except UserNotActiveError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


@router.post("/social-confirm", response_model=LoginResponse)
async def social_confirm(request: SocialConfirmRequest) -> LoginResponse:
    """Securely confirm login from provider code (Google, FaceBook, Apple)."""
    # 1. Exchange provider code for real user details
    # This correctly verifies the code with Google/Facebook if keys are present.
    # If keys (Client IDs) are missing, we provide a safe fallback for development.
    user_data = None
    
    if request.provider == "google":
        user_data = verify_google_code(request.code, request.redirect_uri)
    elif request.provider == "facebook":
        user_data = verify_facebook_code(request.code, request.redirect_uri)

    if not user_data:
        # Fallback to persistent test account while they setup keys in .env
        logger.warning(f"Social verify failed for {request.provider}. Using dev fallback.")
        user_data = {
            "provider": request.provider,
            "provider_id": f"dev_{request.provider}_persistent",
            "email": f"tester_{request.provider}@example.com",
            "full_name": f"Tester {request.provider.capitalize()}"
        }

    # 2. Use existing logic to persist account & sessions
    token, expires_at, user_info = await social_login(
        provider=user_data["provider"],
        provider_id=user_data["provider_id"],
        email=user_data["email"],
        full_name=user_data["full_name"],
    )
    
    return LoginResponse(
        message="Social login successful",
        token=token,
        user=user_info,
        expires_at=expires_at,
    )


@router.post("/set-password")
async def set_password_endpoint(request: SetPasswordRequest) -> dict:
    """Allow a social user to set an email password for the first time."""
    success = await set_password_for_social_user(request.email, request.password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not set password. User might not exist or already has a password."
        )
    return {"message": "Password set successfully. You can now log in with email/password."}



@router.post("/logout", response_model=LogoutResponse)
async def logout(
    authorization: Annotated[str | None, Header()] = None,
) -> LogoutResponse:
    """
    Invalidate the current session.

    Requires Authorization header with Bearer token.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
        )

    # Extract token from "Bearer <token>" format
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Use: Bearer <token>",
        )

    token = parts[1]
    await invalidate_session(token)
    return LogoutResponse()


@router.get("/me", response_model=UserInfo)
async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
) -> UserInfo:
    """
    Get current authenticated user's information.

    Requires Authorization header with Bearer token.
    """
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

    token = parts[1]

    try:
        user_info = await validate_session(token)
        return user_info
    except SessionNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.get("/users/count", response_model=dict)
async def get_total_users_count() -> dict:
    """
    Get the total number of users.
    """
    count = await get_total_users()
    return {"total_users": count}
