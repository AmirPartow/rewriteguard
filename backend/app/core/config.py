from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # --- Application ---
    APP_NAME: str = "rewriteguard-backend"
    APP_VERSION: str = "0.1.0"
    ENV: str = "dev"  # dev | prod
    LOG_LEVEL: str = "INFO"

    # --- Database ---
    DATABASE_URL: str = ""

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"
    PARAPHRASE_CACHE_TTL: int = 3600  # 1 hour in seconds

    # --- Rate Limiting ---
    RATE_LIMIT: int = 10
    RATE_WINDOW: int = 60

    # --- Stripe ---
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PREMIUM_PRICE_ID: str = ""  # Price ID for premium subscription

    # --- URLs ---
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: str = ""  # Additional CORS origins (comma-separated)

    # --- AWS ---
    AWS_REGION: str = "us-west-2"


settings = Settings()
