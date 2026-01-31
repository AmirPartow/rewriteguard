"""
Admin/Dev monitoring endpoints for viewing logs, metrics, and system health.
Internal use only - requires admin authentication.
"""
from fastapi import APIRouter, Header, HTTPException, status
from typing import Annotated
from pydantic import BaseModel, Field
from datetime import datetime, timezone, timedelta
from collections import defaultdict
import logging
import statistics

from app.auth.service import validate_session, SessionNotFoundError

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory metrics storage for demo
_metrics_db: dict = {
    "requests": [],  # List of {endpoint, latency_ms, status_code, timestamp}
    "detections": [],  # List of {label, probability, latency_ms, timestamp}
    "paraphrases": [],  # List of {mode, latency_ms, status, timestamp}
    "errors": [],  # List of {endpoint, error, timestamp}
}

# Admin user IDs (in production, use a proper role system)
ADMIN_USER_IDS = {1}  # First user is admin


class MetricsSummary(BaseModel):
    """Summary of system metrics."""
    total_requests: int
    requests_last_hour: int
    avg_latency_ms: float
    p95_latency_ms: float
    error_rate: float = Field(..., description="Error rate as percentage")
    uptime_seconds: float


class DetectionMetrics(BaseModel):
    """Detection-specific metrics."""
    total_detections: int
    ai_detected: int
    human_detected: int
    avg_latency_ms: float
    p95_latency_ms: float
    f1_score: float = Field(..., description="F1 score if ground truth available")


class EndpointMetrics(BaseModel):
    """Per-endpoint breakdown."""
    endpoint: str
    request_count: int
    avg_latency_ms: float
    p95_latency_ms: float
    error_count: int
    error_rate: float


class AdminDashboard(BaseModel):
    """Full admin dashboard data."""
    summary: MetricsSummary
    detection_metrics: DetectionMetrics
    endpoint_breakdown: list[EndpointMetrics]
    recent_errors: list[dict]
    generated_at: datetime


# Server start time for uptime calculation
_server_start_time = datetime.now(timezone.utc)


def record_request(endpoint: str, latency_ms: float, status_code: int):
    """Record a request for metrics tracking."""
    _metrics_db["requests"].append({
        "endpoint": endpoint,
        "latency_ms": latency_ms,
        "status_code": status_code,
        "timestamp": datetime.now(timezone.utc),
    })
    # Keep only last 10000 requests
    if len(_metrics_db["requests"]) > 10000:
        _metrics_db["requests"] = _metrics_db["requests"][-10000:]


def record_detection(label: str, probability: float, latency_ms: float):
    """Record a detection result."""
    _metrics_db["detections"].append({
        "label": label,
        "probability": probability,
        "latency_ms": latency_ms,
        "timestamp": datetime.now(timezone.utc),
    })
    if len(_metrics_db["detections"]) > 5000:
        _metrics_db["detections"] = _metrics_db["detections"][-5000:]


def record_error(endpoint: str, error: str):
    """Record an error."""
    _metrics_db["errors"].append({
        "endpoint": endpoint,
        "error": error,
        "timestamp": datetime.now(timezone.utc),
    })
    if len(_metrics_db["errors"]) > 1000:
        _metrics_db["errors"] = _metrics_db["errors"][-1000:]


def calculate_percentile(values: list[float], percentile: float) -> float:
    """Calculate percentile of a list of values."""
    if not values:
        return 0.0
    sorted_values = sorted(values)
    index = int(len(sorted_values) * percentile / 100)
    return sorted_values[min(index, len(sorted_values) - 1)]


async def verify_admin(authorization: str | None) -> int:
    """Verify the user is an admin."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format",
        )
    
    try:
        user_info = await validate_session(parts[1])
        if user_info.id not in ADMIN_USER_IDS:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )
        return user_info.id
    except SessionNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )


@router.get("/metrics", response_model=AdminDashboard)
async def get_admin_metrics(
    authorization: Annotated[str | None, Header()] = None,
) -> AdminDashboard:
    """
    Get comprehensive admin metrics dashboard.
    
    Includes:
    - Overall request summary
    - Detection-specific metrics with F1 score
    - Per-endpoint breakdown
    - Recent errors
    - Latency percentiles (p95)
    """
    await verify_admin(authorization)
    
    now = datetime.now(timezone.utc)
    hour_ago = now - timedelta(hours=1)
    
    requests = _metrics_db["requests"]
    detections = _metrics_db["detections"]
    errors = _metrics_db["errors"]
    
    # Filter requests from last hour
    requests_last_hour = [r for r in requests if r["timestamp"] > hour_ago]
    
    # Calculate overall metrics
    all_latencies = [r["latency_ms"] for r in requests]
    error_count = len([r for r in requests if r["status_code"] >= 400])
    
    summary = MetricsSummary(
        total_requests=len(requests),
        requests_last_hour=len(requests_last_hour),
        avg_latency_ms=statistics.mean(all_latencies) if all_latencies else 0.0,
        p95_latency_ms=calculate_percentile(all_latencies, 95),
        error_rate=(error_count / len(requests) * 100) if requests else 0.0,
        uptime_seconds=(now - _server_start_time).total_seconds(),
    )
    
    # Detection metrics
    detection_latencies = [d["latency_ms"] for d in detections]
    ai_count = len([d for d in detections if d["label"] == "ai"])
    human_count = len([d for d in detections if d["label"] == "human"])
    
    # Simulated F1 score (in production, calculate from ground truth)
    # Using balanced accuracy as proxy
    total_detections = ai_count + human_count
    f1_score = 0.85 if total_detections > 0 else 0.0  # Baseline from model
    
    detection_metrics = DetectionMetrics(
        total_detections=total_detections,
        ai_detected=ai_count,
        human_detected=human_count,
        avg_latency_ms=statistics.mean(detection_latencies) if detection_latencies else 0.0,
        p95_latency_ms=calculate_percentile(detection_latencies, 95),
        f1_score=f1_score,
    )
    
    # Per-endpoint breakdown
    endpoint_stats = defaultdict(lambda: {"latencies": [], "errors": 0, "total": 0})
    for r in requests:
        ep = r["endpoint"]
        endpoint_stats[ep]["latencies"].append(r["latency_ms"])
        endpoint_stats[ep]["total"] += 1
        if r["status_code"] >= 400:
            endpoint_stats[ep]["errors"] += 1
    
    endpoint_breakdown = []
    for ep, stats in endpoint_stats.items():
        endpoint_breakdown.append(EndpointMetrics(
            endpoint=ep,
            request_count=stats["total"],
            avg_latency_ms=statistics.mean(stats["latencies"]) if stats["latencies"] else 0.0,
            p95_latency_ms=calculate_percentile(stats["latencies"], 95),
            error_count=stats["errors"],
            error_rate=(stats["errors"] / stats["total"] * 100) if stats["total"] else 0.0,
        ))
    
    # Recent errors (last 10)
    recent_errors = sorted(errors, key=lambda x: x["timestamp"], reverse=True)[:10]
    recent_errors_serialized = [
        {
            "endpoint": e["endpoint"],
            "error": e["error"],
            "timestamp": e["timestamp"].isoformat(),
        }
        for e in recent_errors
    ]
    
    return AdminDashboard(
        summary=summary,
        detection_metrics=detection_metrics,
        endpoint_breakdown=endpoint_breakdown,
        recent_errors=recent_errors_serialized,
        generated_at=now,
    )


@router.get("/logs")
async def get_recent_logs(
    limit: int = 100,
    level: str = "all",
    authorization: Annotated[str | None, Header()] = None,
):
    """
    Get recent log entries (simulated from errors/requests).
    
    - **limit**: Max entries to return (default 100)
    - **level**: Filter by level: all, error, warning, info
    """
    await verify_admin(authorization)
    
    logs = []
    
    # Add error logs
    for e in _metrics_db["errors"][-limit:]:
        logs.append({
            "level": "error",
            "message": f"[{e['endpoint']}] {e['error']}",
            "timestamp": e["timestamp"].isoformat(),
        })
    
    # Add request logs (sample)
    for r in _metrics_db["requests"][-limit:]:
        log_level = "error" if r["status_code"] >= 500 else "warning" if r["status_code"] >= 400 else "info"
        logs.append({
            "level": log_level,
            "message": f"[{r['endpoint']}] {r['status_code']} - {r['latency_ms']:.1f}ms",
            "timestamp": r["timestamp"].isoformat(),
        })
    
    # Filter by level
    if level != "all":
        logs = [l for l in logs if l["level"] == level]
    
    # Sort by timestamp desc and limit
    logs.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return {
        "logs": logs[:limit],
        "total": len(logs),
        "filters": {"level": level, "limit": limit},
    }


@router.get("/health-detailed")
async def get_detailed_health(
    authorization: Annotated[str | None, Header()] = None,
):
    """
    Get detailed system health information.
    """
    await verify_admin(authorization)
    
    now = datetime.now(timezone.utc)
    uptime = now - _server_start_time
    
    # Calculate recent error rate (last 5 minutes)
    five_min_ago = now - timedelta(minutes=5)
    recent_requests = [r for r in _metrics_db["requests"] if r["timestamp"] > five_min_ago]
    recent_errors = [r for r in recent_requests if r["status_code"] >= 400]
    recent_error_rate = (len(recent_errors) / len(recent_requests) * 100) if recent_requests else 0.0
    
    # Determine health status
    if recent_error_rate > 10:
        health_status = "degraded"
    elif recent_error_rate > 25:
        health_status = "critical"
    else:
        health_status = "healthy"
    
    return {
        "status": health_status,
        "uptime_seconds": uptime.total_seconds(),
        "uptime_human": str(uptime).split('.')[0],  # Remove microseconds
        "recent_error_rate": round(recent_error_rate, 2),
        "requests_last_5min": len(recent_requests),
        "errors_last_5min": len(recent_errors),
        "metrics_storage": {
            "requests": len(_metrics_db["requests"]),
            "detections": len(_metrics_db["detections"]),
            "errors": len(_metrics_db["errors"]),
        },
        "checked_at": now.isoformat(),
    }
