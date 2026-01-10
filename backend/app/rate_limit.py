"""
Rate limiting module for API endpoints.
Uses a simple in-memory counter (not production-ready, use Redis for production).
"""
import os
from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import HTTPException

# In-memory store for rate limiting (use Redis in production)
_request_counts = defaultdict(list)

RATE_LIMIT = int(os.getenv("RATE_LIMIT", "10"))
RATE_WINDOW = int(os.getenv("RATE_WINDOW", "60"))  # seconds

def rate_limiter():
    """
    Simple rate limiter dependency.
    Limits requests to RATE_LIMIT per RATE_WINDOW seconds.
    """
    # In a real app, you'd use the client IP or API key
    client_id = "global"  # Simplified for demo
    
    now = datetime.now()
    cutoff = now - timedelta(seconds=RATE_WINDOW)
    
    # Clean old requests
    _request_counts[client_id] = [
        req_time for req_time in _request_counts[client_id]
        if req_time > cutoff
    ]
    
    # Check limit
    if len(_request_counts[client_id]) >= RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Max {RATE_LIMIT} requests per {RATE_WINDOW} seconds."
        )
    
    # Record this request
    _request_counts[client_id].append(now)
    
    return True
