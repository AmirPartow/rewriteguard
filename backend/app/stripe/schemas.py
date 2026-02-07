"""
Pydantic schemas for Stripe subscription endpoints.
"""
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Literal


class CreateCheckoutSessionRequest(BaseModel):
    """Request to create a Stripe checkout session."""
    price_id: str | None = Field(
        default=None,
        description="Optional Stripe Price ID. Uses default premium price if not provided."
    )


class CreateCheckoutSessionResponse(BaseModel):
    """Response from creating a checkout session."""
    checkout_url: str = Field(..., description="URL to redirect user to Stripe checkout")
    session_id: str = Field(..., description="Stripe checkout session ID")


class CreatePortalSessionResponse(BaseModel):
    """Response from creating a customer portal session."""
    portal_url: str = Field(..., description="URL to redirect user to Stripe customer portal")


class SubscriptionStatus(BaseModel):
    """Current subscription status for a user."""
    plan_type: Literal["free", "premium"] = Field(..., description="Current plan type")
    subscription_status: str = Field(..., description="Stripe subscription status")
    current_period_end: datetime | None = Field(
        None, description="When current subscription period ends"
    )
    is_active: bool = Field(..., description="Whether subscription is currently active")
    daily_word_limit: int = Field(..., description="Daily word limit based on plan")


class WebhookResponse(BaseModel):
    """Response from webhook processing."""
    received: bool = True
    event_type: str | None = None
    message: str = "Webhook processed successfully"


class SubscriptionPlan(BaseModel):
    """Available subscription plan details."""
    id: str
    name: str
    price_cents: int
    currency: str = "usd"
    interval: Literal["month", "year"]
    daily_word_limit: int
    features: list[str]
