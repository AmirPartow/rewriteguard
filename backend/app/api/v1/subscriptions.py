"""
FastAPI routes for Stripe subscription management.
Handles checkout sessions, customer portal, and webhooks.
"""
from fastapi import APIRouter, HTTPException, Header, Request, status
from typing import Annotated
import logging

from app.auth.service import validate_session, SessionNotFoundError
from app.stripe.schemas import (
    CreateCheckoutSessionRequest,
    CreateCheckoutSessionResponse,
    CreatePortalSessionResponse,
    SubscriptionStatus,
    WebhookResponse,
    SubscriptionPlan,
)
from app.stripe.service import (
    create_checkout_session,
    create_portal_session,
    get_subscription_status,
    handle_webhook_event,
    is_stripe_configured,
    StripeServiceError,
    StripeNotConfiguredError,
    CustomerNotFoundError,
    PLAN_CONFIG,
)
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


async def _get_current_user(authorization: str | None) -> tuple[int, str]:
    """Extract and validate user from authorization header."""
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
    
    try:
        user_info = await validate_session(parts[1])
        return user_info.id, user_info.email
    except SessionNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )


@router.get("/config")
async def get_stripe_config():
    """
    Get Stripe configuration for frontend.
    
    Returns publishable key and whether Stripe is configured.
    """
    return {
        "is_configured": is_stripe_configured(),
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY if is_stripe_configured() else None,
    }


@router.get("/plans", response_model=list[SubscriptionPlan])
async def get_subscription_plans():
    """
    Get available subscription plans.
    """
    return [
        SubscriptionPlan(
            id="free",
            name="Free",
            price_cents=0,
            currency="usd",
            interval="month",
            daily_word_limit=PLAN_CONFIG["free"]["daily_word_limit"],
            features=[
                "1,000 words/day",
                "AI Detection",
                "Basic Paraphrasing",
                "Email Support",
            ],
        ),
        SubscriptionPlan(
            id="premium",
            name="Premium",
            price_cents=999,  # $9.99/month
            currency="usd",
            interval="month",
            daily_word_limit=PLAN_CONFIG["premium"]["daily_word_limit"],
            features=[
                "10,000 words/day",
                "AI Detection",
                "Advanced Paraphrasing",
                "Priority Processing",
                "API Access",
                "Priority Support",
            ],
        ),
    ]


@router.get("/status", response_model=SubscriptionStatus)
async def get_status(
    authorization: Annotated[str | None, Header()] = None,
):
    """
    Get current user's subscription status.
    
    Requires authentication.
    """
    user_id, _ = await _get_current_user(authorization)
    
    status_data = await get_subscription_status(user_id)
    return SubscriptionStatus(**status_data)


@router.post("/checkout", response_model=CreateCheckoutSessionResponse)
async def create_checkout(
    request: CreateCheckoutSessionRequest,
    authorization: Annotated[str | None, Header()] = None,
):
    """
    Create a Stripe Checkout session for subscribing to premium.
    
    Returns a URL to redirect the user to complete payment.
    """
    user_id, email = await _get_current_user(authorization)
    
    try:
        checkout_url, session_id = await create_checkout_session(
            user_id=user_id,
            email=email,
            price_id=request.price_id,
        )
        return CreateCheckoutSessionResponse(
            checkout_url=checkout_url,
            session_id=session_id,
        )
    except StripeNotConfiguredError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment processing is not configured",
        )
    except StripeServiceError as e:
        logger.error(f"Checkout session creation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/portal", response_model=CreatePortalSessionResponse)
async def create_portal(
    authorization: Annotated[str | None, Header()] = None,
):
    """
    Create a Stripe Customer Portal session.
    
    Allows users to manage their subscription, update payment methods,
    view billing history, and cancel subscription.
    """
    user_id, _ = await _get_current_user(authorization)
    
    try:
        portal_url = await create_portal_session(user_id)
        return CreatePortalSessionResponse(portal_url=portal_url)
    except StripeNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment processing is not configured",
        )
    except CustomerNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No billing account found. Please subscribe first.",
        )
    except StripeServiceError as e:
        logger.error(f"Portal session creation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/webhook", response_model=WebhookResponse)
async def handle_webhook(
    request: Request,
    stripe_signature: Annotated[str | None, Header(alias="Stripe-Signature")] = None,
):
    """
    Handle Stripe webhook events.
    
    This endpoint receives events from Stripe when subscription status changes:
    - checkout.session.completed: User completed payment
    - customer.subscription.created: New subscription started
    - customer.subscription.updated: Subscription renewed or changed
    - customer.subscription.deleted: Subscription canceled
    - invoice.paid: Payment successful
    - invoice.payment_failed: Payment failed
    """
    payload = await request.body()
    
    if not stripe_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe-Signature header",
        )
    
    try:
        result = await handle_webhook_event(payload, stripe_signature)
        return WebhookResponse(**result)
    except StripeServiceError as e:
        logger.error(f"Webhook processing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
