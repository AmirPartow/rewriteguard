"""
Stripe service layer - handles Stripe API interactions for subscriptions.
Manages checkout sessions, webhooks, and subscription lifecycle.
Uses PostgreSQL database for persistent storage.
"""

import stripe
import logging
from typing import Any

from sqlalchemy import text

from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# Plan configuration
PLAN_CONFIG = {
    "free": {"daily_word_limit": 1000, "name": "Free"},
    "premium": {"daily_word_limit": 10000, "name": "Premium"},
}


def _get_engine():
    """Lazy import to avoid circular dependency at module load time."""
    from db import engine

    return engine


class StripeServiceError(Exception):
    """Base exception for Stripe service errors."""

    pass


class StripeNotConfiguredError(StripeServiceError):
    """Stripe is not properly configured."""

    pass


class CustomerNotFoundError(StripeServiceError):
    """Stripe customer not found."""

    pass


class SubscriptionNotFoundError(StripeServiceError):
    """Subscription not found."""

    pass


def _ensure_stripe_configured():
    """Raise error if Stripe is not configured."""
    if not settings.STRIPE_SECRET_KEY:
        raise StripeNotConfiguredError(
            "Stripe is not configured. Set STRIPE_SECRET_KEY in environment."
        )


async def get_or_create_customer(user_id: int, email: str) -> str:
    """
    Get existing Stripe customer or create a new one.

    Args:
        user_id: Internal user ID
        email: User's email address

    Returns:
        Stripe customer ID
    """
    _ensure_stripe_configured()
    engine = _get_engine()

    # Check if user already has a Stripe customer
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT stripe_customer_id FROM users WHERE id = :user_id"),
            {"user_id": user_id},
        )
        row = result.fetchone()
        if row and row[0]:
            return row[0]

    # Create new Stripe customer
    try:
        customer = stripe.Customer.create(
            email=email,
            metadata={"user_id": str(user_id)},
        )

        # Store customer ID in database
        with engine.connect() as conn:
            conn.execute(
                text(
                    "UPDATE users SET stripe_customer_id = :customer_id WHERE id = :user_id"
                ),
                {"customer_id": customer.id, "user_id": user_id},
            )
            conn.commit()

        logger.info(f"Created Stripe customer {customer.id} for user {user_id}")
        return customer.id

    except stripe.StripeError as e:
        logger.error(f"Failed to create Stripe customer: {e}")
        raise StripeServiceError(f"Failed to create customer: {str(e)}")


async def create_checkout_session(
    user_id: int,
    email: str,
    price_id: str | None = None,
) -> tuple[str, str]:
    """
    Create a Stripe Checkout session for subscription signup.

    Args:
        user_id: Internal user ID
        email: User's email
        price_id: Stripe Price ID (uses default if not provided)

    Returns:
        Tuple of (checkout_url, session_id)
    """
    _ensure_stripe_configured()

    # Use default premium price if not provided
    if not price_id:
        price_id = settings.STRIPE_PREMIUM_PRICE_ID
        if not price_id:
            raise StripeServiceError(
                "No price ID provided and STRIPE_PREMIUM_PRICE_ID not configured"
            )

    # Get or create customer
    customer_id = await get_or_create_customer(user_id, email)

    try:
        session = stripe.checkout.Session.create(
            customer=customer_id,
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{settings.FRONTEND_URL}/dashboard?checkout=success",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard?checkout=canceled",
            metadata={"user_id": str(user_id)},
            subscription_data={
                "metadata": {"user_id": str(user_id)},
            },
        )

        logger.info(f"Created checkout session {session.id} for user {user_id}")
        return session.url, session.id

    except stripe.StripeError as e:
        logger.error(f"Failed to create checkout session: {e}")
        raise StripeServiceError(f"Failed to create checkout session: {str(e)}")


async def create_portal_session(user_id: int) -> str:
    """
    Create a Stripe Customer Portal session for managing subscriptions.

    Args:
        user_id: Internal user ID

    Returns:
        Portal URL
    """
    _ensure_stripe_configured()
    engine = _get_engine()

    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT stripe_customer_id FROM users WHERE id = :user_id"),
            {"user_id": user_id},
        )
        row = result.fetchone()
        customer_id = row[0] if row else None

    if not customer_id:
        raise CustomerNotFoundError("User does not have a Stripe customer account")

    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{settings.FRONTEND_URL}/dashboard",
        )

        logger.info(f"Created portal session for user {user_id}")
        return session.url

    except stripe.StripeError as e:
        logger.error(f"Failed to create portal session: {e}")
        raise StripeServiceError(f"Failed to create portal session: {str(e)}")


async def get_subscription_status(user_id: int) -> dict[str, Any]:
    """
    Get current subscription status for a user from the database.

    Args:
        user_id: Internal user ID

    Returns:
        Dict with subscription details
    """
    engine = _get_engine()

    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT subscription_status, subscription_current_period_end
                FROM users WHERE id = :user_id
            """),
            {"user_id": user_id},
        )
        row = result.fetchone()

    subscription_status = "inactive"
    current_period_end = None

    if row:
        subscription_status = row[0] or "inactive"
        current_period_end = row[1]

    is_premium = subscription_status in ("active", "trialing")
    plan_type = "premium" if is_premium else "free"

    return {
        "plan_type": plan_type,
        "subscription_status": subscription_status,
        "current_period_end": current_period_end,
        "is_active": is_premium,
        "daily_word_limit": PLAN_CONFIG[plan_type]["daily_word_limit"],
    }


async def handle_webhook_event(payload: bytes, sig_header: str) -> dict[str, Any]:
    """
    Handle Stripe webhook events.

    Args:
        payload: Raw request body
        sig_header: Stripe-Signature header value

    Returns:
        Dict with processing result
    """
    _ensure_stripe_configured()

    if not settings.STRIPE_WEBHOOK_SECRET:
        logger.warning(
            "Webhook secret not configured - skipping signature verification"
        )
        event = stripe.Event.construct_from(
            stripe.util.convert_to_stripe_object(payload),
            stripe.api_key,
        )
    else:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            logger.error(f"Invalid webhook payload: {e}")
            raise StripeServiceError("Invalid payload")
        except stripe.SignatureVerificationError as e:
            logger.error(f"Invalid webhook signature: {e}")
            raise StripeServiceError("Invalid signature")

    # Process the event
    event_type = event.type
    event_data = event.data.object

    logger.info(f"Processing webhook event: {event_type}")

    # Handle subscription events
    if event_type == "checkout.session.completed":
        await _handle_checkout_completed(event_data)
    elif event_type == "customer.subscription.created":
        await _handle_subscription_created(event_data)
    elif event_type == "customer.subscription.updated":
        await _handle_subscription_updated(event_data)
    elif event_type == "customer.subscription.deleted":
        await _handle_subscription_deleted(event_data)
    elif event_type == "invoice.paid":
        await _handle_invoice_paid(event_data)
    elif event_type == "invoice.payment_failed":
        await _handle_payment_failed(event_data)
    else:
        logger.info(f"Unhandled event type: {event_type}")

    # Record event in database
    engine = _get_engine()
    try:
        with engine.connect() as conn:
            conn.execute(
                text("""
                    INSERT INTO subscription_events (stripe_event_id, event_type, created_at)
                    VALUES (:event_id, :event_type, NOW())
                    ON CONFLICT (stripe_event_id) DO NOTHING
                """),
                {"event_id": event.id, "event_type": event_type},
            )
            conn.commit()
    except Exception as e:
        logger.warning(f"Failed to record webhook event: {e}")

    return {
        "received": True,
        "event_type": event_type,
        "message": f"Processed {event_type}",
    }


async def _handle_checkout_completed(session: Any):
    """Handle successful checkout completion."""
    user_id = session.metadata.get("user_id")
    if not user_id:
        logger.warning("Checkout session missing user_id metadata")
        return

    user_id = int(user_id)
    subscription_id = session.subscription
    customer_id = session.customer

    engine = _get_engine()
    with engine.connect() as conn:
        conn.execute(
            text("""
                UPDATE users SET
                    stripe_customer_id = :customer_id,
                    stripe_subscription_id = :subscription_id,
                    subscription_status = 'active',
                    plan_type = 'premium',
                    daily_word_limit = 10000
                WHERE id = :user_id
            """),
            {
                "customer_id": customer_id,
                "subscription_id": subscription_id,
                "user_id": user_id,
            },
        )
        conn.commit()

    logger.info(
        f"Checkout completed for user {user_id}, subscription: {subscription_id}"
    )

    # Try to send a welcome email
    try:
        from app.services.email_service import send_subscription_receipt_email

        # Look up user email from database
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT email FROM users WHERE id = :user_id"),
                {"user_id": user_id},
            )
            row = result.fetchone()
            user_email = row[0] if row else ""

        if user_email:
            import asyncio

            asyncio.create_task(
                send_subscription_receipt_email(
                    user_email=user_email,
                    subscription_id=subscription_id,
                    plan_name="Premium",
                )
            )
        else:
            logger.warning(f"Could not find email for user {user_id} to send receipt.")
    except Exception as e:
        logger.error(f"Failed to trigger receipt email: {e}")


async def _handle_subscription_created(subscription: Any):
    """Handle new subscription creation."""
    user_id = subscription.metadata.get("user_id")
    if not user_id:
        # Try to find user by customer ID
        customer_id = subscription.customer
        user_id = _find_user_by_customer(customer_id)
        if not user_id:
            logger.warning(f"Subscription created but no user found: {subscription.id}")
            return

    user_id = int(user_id)
    engine = _get_engine()

    with engine.connect() as conn:
        conn.execute(
            text("""
                UPDATE users SET
                    stripe_subscription_id = :subscription_id,
                    subscription_status = :status,
                    subscription_current_period_end = to_timestamp(:period_end)
                WHERE id = :user_id
            """),
            {
                "subscription_id": subscription.id,
                "status": subscription.status,
                "period_end": subscription.current_period_end,
                "user_id": user_id,
            },
        )
        conn.commit()

    logger.info(f"Subscription created for user {user_id}: {subscription.status}")


async def _handle_subscription_updated(subscription: Any):
    """Handle subscription updates (plan changes, renewals, etc.)."""
    user_id = subscription.metadata.get("user_id")
    if not user_id:
        customer_id = subscription.customer
        user_id = _find_user_by_customer(customer_id)
        if not user_id:
            logger.warning(f"Subscription updated but no user found: {subscription.id}")
            return

    user_id = int(user_id)
    engine = _get_engine()
    new_status = subscription.status

    # Determine plan type based on status
    is_premium = new_status in ("active", "trialing")
    plan_type = "premium" if is_premium else "free"
    daily_word_limit = PLAN_CONFIG[plan_type]["daily_word_limit"]

    with engine.connect() as conn:
        conn.execute(
            text("""
                UPDATE users SET
                    subscription_status = :status,
                    subscription_current_period_end = to_timestamp(:period_end),
                    plan_type = :plan_type,
                    daily_word_limit = :daily_word_limit
                WHERE id = :user_id
            """),
            {
                "status": new_status,
                "period_end": subscription.current_period_end,
                "plan_type": plan_type,
                "daily_word_limit": daily_word_limit,
                "user_id": user_id,
            },
        )
        conn.commit()

    logger.info(f"Subscription updated for user {user_id}: -> {new_status}")


async def _handle_subscription_deleted(subscription: Any):
    """Handle subscription cancellation/deletion."""
    user_id = subscription.metadata.get("user_id")
    if not user_id:
        customer_id = subscription.customer
        user_id = _find_user_by_customer(customer_id)
        if not user_id:
            logger.warning(f"Subscription deleted but no user found: {subscription.id}")
            return

    user_id = int(user_id)
    engine = _get_engine()

    with engine.connect() as conn:
        conn.execute(
            text("""
                UPDATE users SET
                    subscription_status = 'canceled',
                    stripe_subscription_id = NULL,
                    plan_type = 'free',
                    daily_word_limit = 1000
                WHERE id = :user_id
            """),
            {"user_id": user_id},
        )
        conn.commit()

    logger.info(f"Subscription canceled for user {user_id}")


async def _handle_invoice_paid(invoice: Any):
    """Handle successful payment (renewal)."""
    customer_id = invoice.customer
    user_id = _find_user_by_customer(customer_id)

    if user_id:
        logger.info(
            f"Invoice paid for user {user_id}: {invoice.amount_paid / 100:.2f} {invoice.currency.upper()}"
        )

        engine = _get_engine()
        with engine.connect() as conn:
            conn.execute(
                text(
                    "UPDATE users SET subscription_status = 'active' WHERE id = :user_id"
                ),
                {"user_id": user_id},
            )
            conn.commit()


async def _handle_payment_failed(invoice: Any):
    """Handle failed payment."""
    customer_id = invoice.customer
    user_id = _find_user_by_customer(customer_id)

    if user_id:
        logger.warning(f"Payment failed for user {user_id}")

        engine = _get_engine()
        with engine.connect() as conn:
            conn.execute(
                text(
                    "UPDATE users SET subscription_status = 'past_due' WHERE id = :user_id"
                ),
                {"user_id": user_id},
            )
            conn.commit()


def _find_user_by_customer(customer_id: str) -> int | None:
    """Find user ID by Stripe customer ID from the database."""
    engine = _get_engine()

    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT id FROM users WHERE stripe_customer_id = :customer_id"),
            {"customer_id": customer_id},
        )
        row = result.fetchone()
        return row[0] if row else None


# Utility function to check if Stripe is configured
def is_stripe_configured() -> bool:
    """Check if Stripe is properly configured."""
    return bool(settings.STRIPE_SECRET_KEY and settings.STRIPE_PREMIUM_PRICE_ID)
