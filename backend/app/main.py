from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging import setup_logging
from app.api.v1.detect import router as detect_router
from app.api.v1.paraphrase import router as paraphrase_router
from app.api.v1.auth import router as auth_router
from app.api.v1.quota import router as quota_router
from app.redis_client import get_cache_stats
from .rate_limit import rate_limiter

setup_logging()

app = FastAPI(title="rewriteguard-backend")

# Add CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/v1/auth", tags=["Authentication"])
app.include_router(quota_router, prefix="/v1/quota", tags=["Quota"])
app.include_router(detect_router, prefix="/v1", tags=["Detection"])
app.include_router(paraphrase_router, prefix="/v1", tags=["Paraphrase"])

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/cache-stats")
def cache_stats():
    """Get Redis cache statistics for monitoring."""
    return get_cache_stats()

@app.get("/protected")
def protected(_: None = Depends(rate_limiter)):
    return {"ok": True, "message": "passed rate limit"}

