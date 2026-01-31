-- Add plan type and daily word limit to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS daily_word_limit INT NOT NULL DEFAULT 1000;

-- Create usage tracking table for daily word counts
CREATE TABLE IF NOT EXISTS daily_usage (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usage_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  words_detect    INT NOT NULL DEFAULT 0,
  words_paraphrase INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON daily_usage(usage_date);

-- Comment: Plan types and their limits
-- free: 1,000 words/day
-- premium: 10,000 words/day
