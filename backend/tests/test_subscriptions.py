"""
Tests for Stripe subscription endpoints.
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock


class TestSubscriptionEndpoints:
    """Test subscription API endpoints."""

    def test_get_stripe_config_not_configured(self, client):
        """Test getting Stripe config when not configured."""
        with patch('app.api.v1.subscriptions.is_stripe_configured', return_value=False):
            response = client.get("/v1/subscriptions/config")
            assert response.status_code == 200
            data = response.json()
            assert data["is_configured"] == False
            assert data["publishable_key"] is None

    def test_get_subscription_plans(self, client):
        """Test getting available subscription plans."""
        response = client.get("/v1/subscriptions/plans")
        assert response.status_code == 200
        
        plans = response.json()
        assert len(plans) == 2
        
        # Check free plan
        free_plan = next(p for p in plans if p["id"] == "free")
        assert free_plan["name"] == "Free"
        assert free_plan["price_cents"] == 0
        assert free_plan["daily_word_limit"] == 1000
        
        # Check premium plan
        premium_plan = next(p for p in plans if p["id"] == "premium")
        assert premium_plan["name"] == "Premium"
        assert premium_plan["price_cents"] == 999
        assert premium_plan["daily_word_limit"] == 10000

    def test_get_status_requires_auth(self, client):
        """Test subscription status requires authentication."""
        response = client.get("/v1/subscriptions/status")
        assert response.status_code == 401

    def test_get_status_with_invalid_token(self, client):
        """Test subscription status with invalid token."""
        response = client.get(
            "/v1/subscriptions/status",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401

    def test_create_checkout_requires_auth(self, client):
        """Test checkout creation requires authentication."""
        response = client.post("/v1/subscriptions/checkout", json={})
        assert response.status_code == 401

    def test_create_portal_requires_auth(self, client):
        """Test portal creation requires authentication."""
        response = client.post("/v1/subscriptions/portal")
        assert response.status_code == 401

    def test_webhook_requires_signature(self, client):
        """Test webhook requires Stripe signature header."""
        response = client.post(
            "/v1/subscriptions/webhook",
            content=b'{}',
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 400
        assert "Missing Stripe-Signature" in response.json()["detail"]


class TestSubscriptionService:
    """Test subscription service layer."""

    @pytest.mark.asyncio
    async def test_subscription_status_default(self):
        """Test default subscription status for new user."""
        from app.stripe.service import get_subscription_status
        
        status = await get_subscription_status(999)  # Non-existent user
        
        assert status["plan_type"] == "free"
        assert status["subscription_status"] == "inactive"
        assert status["is_active"] == False
        assert status["daily_word_limit"] == 1000

    @pytest.mark.asyncio
    async def test_stripe_not_configured_error(self):
        """Test error when Stripe is not configured."""
        from app.stripe.service import create_checkout_session, StripeNotConfiguredError
        
        with patch('app.stripe.service.settings') as mock_settings:
            mock_settings.STRIPE_SECRET_KEY = ""
            
            with pytest.raises(StripeNotConfiguredError):
                await create_checkout_session(1, "test@example.com")

    def test_is_stripe_configured(self):
        """Test Stripe configuration check."""
        from app.stripe.service import is_stripe_configured
        
        with patch('app.stripe.service.settings') as mock_settings:
            # Not configured
            mock_settings.STRIPE_SECRET_KEY = ""
            mock_settings.STRIPE_PREMIUM_PRICE_ID = ""
            assert is_stripe_configured() == False
            
            # Partially configured
            mock_settings.STRIPE_SECRET_KEY = "sk_test_xxx"
            mock_settings.STRIPE_PREMIUM_PRICE_ID = ""
            assert is_stripe_configured() == False
            
            # Fully configured
            mock_settings.STRIPE_SECRET_KEY = "sk_test_xxx"
            mock_settings.STRIPE_PREMIUM_PRICE_ID = "price_xxx"
            assert is_stripe_configured() == True


class TestWebhookHandling:
    """Test webhook event handling."""

    @pytest.mark.asyncio
    async def test_handle_checkout_completed(self):
        """Test handling checkout.session.completed event."""
        from app.stripe.service import _handle_checkout_completed, _subscriptions_db
        
        mock_session = MagicMock()
        mock_session.metadata = {"user_id": "1"}
        mock_session.subscription = "sub_123"
        mock_session.customer = "cus_123"
        
        await _handle_checkout_completed(mock_session)
        
        assert 1 in _subscriptions_db
        assert _subscriptions_db[1]["subscription_status"] == "active"
        assert _subscriptions_db[1]["stripe_subscription_id"] == "sub_123"

    @pytest.mark.asyncio
    async def test_handle_subscription_deleted(self):
        """Test handling subscription deletion."""
        from app.stripe.service import (
            _handle_subscription_deleted, 
            _subscriptions_db
        )
        
        # Setup existing subscription
        _subscriptions_db[2] = {
            "stripe_customer_id": "cus_456",
            "stripe_subscription_id": "sub_456",
            "subscription_status": "active",
        }
        
        mock_subscription = MagicMock()
        mock_subscription.metadata = {"user_id": "2"}
        mock_subscription.id = "sub_456"
        mock_subscription.customer = "cus_456"
        
        await _handle_subscription_deleted(mock_subscription)
        
        assert _subscriptions_db[2]["subscription_status"] == "canceled"


@pytest.fixture
def client():
    """Create test client."""
    from fastapi.testclient import TestClient
    from app.main import app
    return TestClient(app)
