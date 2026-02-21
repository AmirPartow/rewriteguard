import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging import setup_logging
from app.api.v1.detect import router as detect_router
from app.api.v1.paraphrase import router as paraphrase_router
from app.api.v1.auth import router as auth_router
from app.api.v1.quota import router as quota_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.admin import router as admin_router
from app.api.v1.subscriptions import router as subscriptions_router
from app.api.health import router as health_router
from app.redis_client import get_cache_stats
from app.middleware import RequestLoggingMiddleware
from .rate_limit import rate_limiter

setup_logging(level=os.getenv("LOG_LEVEL", "INFO"))

app = FastAPI(
    title="RewriteGuard API",
    version=os.getenv("APP_VERSION", "0.1.0"),
    docs_url="/docs" if os.getenv("ENV", "dev") != "prod" else None,
    redoc_url="/redoc" if os.getenv("ENV", "dev") != "prod" else None,
)

# ---------------------------------------------------------------------------
# CORS — allow frontend origins (local dev + production domain)
# ---------------------------------------------------------------------------
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://rewritguard.com",
    "https://www.rewritguard.com",
    "https://app.rewritguard.com",
]

# Allow override via env var (comma-separated list)
extra_origins = os.getenv("CORS_ORIGINS", "")
if extra_origins:
    ALLOWED_ORIGINS.extend([o.strip() for o in extra_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware (adds X-Request-ID and timing)
app.add_middleware(RequestLoggingMiddleware)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(health_router, tags=["Health"])
app.include_router(auth_router, prefix="/v1/auth", tags=["Authentication"])
app.include_router(quota_router, prefix="/v1/quota", tags=["Quota"])
app.include_router(jobs_router, prefix="/v1/jobs", tags=["Jobs"])
app.include_router(admin_router, prefix="/v1/admin", tags=["Admin"])
app.include_router(subscriptions_router, prefix="/v1/subscriptions", tags=["Subscriptions"])
app.include_router(detect_router, prefix="/v1", tags=["Detection"])
app.include_router(paraphrase_router, prefix="/v1", tags=["Paraphrase"])


@app.get("/cache-stats")
def cache_stats():
    """Get Redis cache statistics for monitoring."""
    return get_cache_stats()


@app.get("/protected")
def protected(_: None = Depends(rate_limiter)):
    return {"ok": True, "message": "passed rate limit"}
