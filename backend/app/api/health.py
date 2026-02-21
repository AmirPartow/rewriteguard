"""
Health Check Endpoints
========================

Provides three-tier health checking for production:

1. /health/live  — Liveness probe (app is running, not deadlocked)
2. /health/ready — Readiness probe (app + dependencies are operational)
3. /health      — Backward-compatible simple health check

Compatible with:
- AWS ECS health checks
- AWS ALB target group health checks
- Kubernetes liveness/readiness probes
- Docker HEALTHCHECK
"""

import time
import logging
from fastapi import APIRouter

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health"])

# Record startup time for uptime reporting
_START_TIME = time.time()


@router.get("/health/live")
async def liveness():
    """
    Liveness probe — confirms the process is alive and responding.

    Used by container orchestrators (ECS, K8s) to detect deadlocks.
    Should NEVER perform external dependency checks.
    """
    return {"status": "alive"}


@router.get("/health/ready")
async def readiness():
    """
    Readiness probe — confirms the app can serve traffic.

    Checks all critical dependencies:
    - PostgreSQL database connectivity
    - Redis cache connectivity

    Returns HTTP 503 if any dependency is unhealthy.
    """
    checks = {}
    overall_healthy = True

    # --- Check Redis ---
    try:
        from app.redis_client import r, REDIS_AVAILABLE
        if REDIS_AVAILABLE and r is not None:
            r.ping()
            checks["redis"] = {"status": "healthy"}
        else:
            checks["redis"] = {"status": "degraded", "detail": "not connected"}
    except Exception as e:
        checks["redis"] = {"status": "unhealthy", "detail": str(e)}
        overall_healthy = False

    # --- Check Database ---
    try:
        from sqlalchemy import text
        from db import engine
        if engine is not None:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            checks["database"] = {"status": "healthy"}
        else:
            checks["database"] = {"status": "degraded", "detail": "engine not available"}
    except Exception as e:
        checks["database"] = {"status": "unhealthy", "detail": str(e)}
        overall_healthy = False

    # --- Check Stripe (non-critical) ---
    try:
        from app.stripe.service import is_stripe_configured
        if is_stripe_configured():
            checks["stripe"] = {"status": "healthy"}
        else:
            checks["stripe"] = {"status": "degraded", "detail": "not configured"}
    except Exception as e:
        checks["stripe"] = {"status": "degraded", "detail": str(e)}

    uptime_seconds = round(time.time() - _START_TIME, 1)

    status_code = 200 if overall_healthy else 503
    response = {
        "status": "healthy" if overall_healthy else "unhealthy",
        "uptime_seconds": uptime_seconds,
        "checks": checks,
    }

    if not overall_healthy:
        logger.warning("Readiness check failed: %s", checks)
        from fastapi.responses import JSONResponse
        return JSONResponse(content=response, status_code=503)

    return response


@router.get("/health")
async def health():
    """
    Simple health check — backward compatible.

    Returns basic status for quick monitoring.
    """
    return {
        "ok": True,
        "uptime_seconds": round(time.time() - _START_TIME, 1),
    }