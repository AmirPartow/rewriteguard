"""
Structured Logging Configuration
==================================

Provides structured JSON logging for production (CloudWatch-compatible)
and human-readable logging for local development.

Features:
- JSON-formatted logs for production log aggregation
- Request-ID correlation support
- Environment and service metadata in every log entry
- CloudWatch Logs compatible output
"""

import logging
import sys
import os
import uuid
from contextvars import ContextVar
from typing import Optional

# Context variable for request-scoped correlation IDs
request_id_var: ContextVar[Optional[str]] = ContextVar("request_id", default=None)


def get_request_id() -> str:
    """Get the current request ID, or generate a new one."""
    rid = request_id_var.get()
    if rid is None:
        rid = str(uuid.uuid4())[:8]
        request_id_var.set(rid)
    return rid


class StructuredFormatter(logging.Formatter):
    """
    JSON-structured log formatter for production.
    
    Output is one JSON object per line, compatible with:
    - AWS CloudWatch Logs Insights
    - ELK / OpenSearch
    - Datadog / Splunk
    """

    def format(self, record: logging.LogRecord) -> str:
        import json
        from datetime import datetime, timezone

        log_entry = {
            "timestamp": datetime.fromtimestamp(
                record.created, tz=timezone.utc
            ).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "service": os.getenv("APP_NAME", "rewriteguard-backend"),
            "environment": os.getenv("ENV", "dev"),
        }

        # Add request ID if available
        rid = request_id_var.get()
        if rid:
            log_entry["request_id"] = rid

        # Add module/function context
        log_entry["module"] = record.module
        log_entry["function"] = record.funcName
        log_entry["line"] = record.lineno

        # Add exception info if present
        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)

        # Add any extra fields attached to the record
        for key in ("latency_ms", "status_code", "method", "path", "user_id",
                     "text_length", "cache_hit", "label", "probability"):
            val = getattr(record, key, None)
            if val is not None:
                log_entry[key] = val

        return json.dumps(log_entry, default=str)


class HumanReadableFormatter(logging.Formatter):
    """Pretty formatter for local development."""

    FORMAT = "%(asctime)s %(levelname)-8s [%(name)s] %(message)s"
    DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

    def __init__(self) -> None:
        super().__init__(fmt=self.FORMAT, datefmt=self.DATE_FORMAT)

    def format(self, record: logging.LogRecord) -> str:
        rid = request_id_var.get()
        if rid:
            record.msg = f"[{rid}] {record.msg}"
        return super().format(record)


def setup_logging(level: str = "INFO") -> None:
    """
    Configure application logging.

    - In production (ENV=prod): JSON structured logs to stdout
    - In development: Human-readable colored logs to stdout

    Args:
        level: Log level string (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    env = os.getenv("ENV", "dev")
    log_level = getattr(logging, level.upper(), logging.INFO)

    # Root logger setup
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove existing handlers to avoid duplicates
    root_logger.handlers.clear()

    # Create stdout handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)

    if env == "prod":
        handler.setFormatter(StructuredFormatter())
    else:
        handler.setFormatter(HumanReadableFormatter())

    root_logger.addHandler(handler)

    # Suppress noisy third-party loggers
    for noisy in ("uvicorn.access", "httpcore", "httpx", "urllib3"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    logging.info(
        "Logging configured | level=%s | env=%s | format=%s",
        level,
        env,
        "json" if env == "prod" else "human",
    )