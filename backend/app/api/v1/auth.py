"""
FastAPI authentication routes for signup, login, and logout.
"""
from fastapi import APIRouter, HTTPException, Header, status
from typing import Annotated
import logging

from app.auth.schemas import (
    SignupRequest, SignupResponse,
    LoginRequest, LoginResponse,
    LogoutResponse, UserInfo
)
from app.auth.service import (
    create_user, authenticate_user, invalidate_session, validate_session,
    EmailAlreadyExistsError, InvalidCredentialsError, 
    UserNotActiveError, SessionNotFoundError
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
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
    except UserNotActiveError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


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
