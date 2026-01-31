"""
Pydantic schemas for authentication endpoints.
"""
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
import re


class SignupRequest(BaseModel):
    """Request body for user signup."""
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=8, max_length=128, description="Password (min 8 chars)")
    full_name: str = Field(default="", max_length=255, description="User's full name")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_regex, v):
            raise ValueError("Invalid email format")
        return v.lower().strip()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class SignupResponse(BaseModel):
    """Response from successful signup."""
    message: str = "Account created successfully"
    user_id: int
    email: str


class LoginRequest(BaseModel):
    """Request body for user login."""
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip()


class LoginResponse(BaseModel):
    """Response from successful login."""
    message: str = "Login successful"
    token: str = Field(..., description="Session token for authentication")
    user: "UserInfo"
    expires_at: datetime


class UserInfo(BaseModel):
    """User information returned on login."""
    id: int
    email: str
    full_name: str
    is_active: bool


class LogoutRequest(BaseModel):
    """Request body for logout (optional, can also use header token)."""
    token: str | None = Field(default=None, description="Session token to invalidate")


class LogoutResponse(BaseModel):
    """Response from successful logout."""
    message: str = "Logged out successfully"


class AuthError(BaseModel):
    """Error response for authentication failures."""
    error: str
    detail: str | None = None


# Required for forward references
LoginResponse.model_rebuild()
