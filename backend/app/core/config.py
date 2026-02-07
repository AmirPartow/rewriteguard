from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "rewriteguard-backend"
    APP_VERSION: str = "0.1.0"
    LOG_LEVEL: str = "INFO"

    # Redis configuration for caching
    REDIS_URL: str = "redis://localhost:6379/0"
    PARAPHRASE_CACHE_TTL: int = 3600  # 1 hour in seconds

    # Stripe configuration
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PREMIUM_PRICE_ID: str = ""  # Price ID for premium subscription
    
    # Frontend URL for Stripe redirects
    FRONTEND_URL: str = "http://localhost:5173"

    # Add later when you need them:
    # DATABASE_URL: str | None = None
    # OPENAI_API_KEY: str | None = None

settings = Settings()
