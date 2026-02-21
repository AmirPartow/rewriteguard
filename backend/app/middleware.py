"""
Request Logging Middleware
===========================

Provides request-scoped logging with:
- Unique request ID generation and propagation
- Request/response timing metrics
- Structured log fields for monitoring dashboards
"""

import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.logging import request_id_var

logger = logging.getLogger("rewriteguard.middleware")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that:
    1. Assigns a unique X-Request-ID to every request
    2. Logs request start and completion with latency
    3. Propagates request ID via context variable for downstream loggers
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        # Generate or reuse incoming request ID
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
        request_id_var.set(request_id)

        start_time = time.perf_counter()
        method = request.method
        path = request.url.path

        # Skip noisy health-check logs
        is_health = path in ("/health", "/health/ready", "/health/live")

        if not is_health:
            logger.info(
                "Request started | %s %s",
                method,
                path,
                extra={"method": method, "path": path},
            )

        try:
            response = await call_next(request)
        except Exception:
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.exception(
                "Request failed | %s %s | %.2fms",
                method,
                path,
                latency_ms,
                extra={
                    "method": method,
                    "path": path,
                    "latency_ms": latency_ms,
                    "status_code": 500,
                },
            )
            raise

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        if not is_health:
            logger.info(
                "Request completed | %s %s | %d | %.2fms",
                method,
                path,
                response.status_code,
                latency_ms,
                extra={
                    "method": method,
                    "path": path,
                    "latency_ms": latency_ms,
                    "status_code": response.status_code,
                },
            )

        # Return request ID in response headers for tracing
        response.headers["X-Request-ID"] = request_id
        return response
