-- Add Stripe subscription fields to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Create subscriptions history table for tracking payment events
CREATE TABLE IF NOT EXISTS subscription_events (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT REFERENCES users(id) ON DELETE CASCADE,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type      TEXT NOT NULL,
  subscription_id TEXT,
  customer_id     TEXT,
  plan_type       TEXT,
  amount_cents    INT,
  currency        TEXT DEFAULT 'usd',
  event_data      JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_stripe_event_id ON subscription_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Comment: Subscription statuses
-- inactive: No active subscription (free tier)
-- active: Active premium subscription
-- past_due: Payment failed but subscription still valid
-- canceled: Subscription canceled, will end at period end
-- expired: Subscription has fully ended
