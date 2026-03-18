-- 005_add_social_auth.sql
-- Add social login support to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(100);

-- Create index for faster lookup during social login
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider, provider_id);
