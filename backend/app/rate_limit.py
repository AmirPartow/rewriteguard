import os
import time
from fastapi import Header, HTTPException
from .redis_client import r

RATE_LIMIT = int(os.getenv("RATE_LIMIT", "10"))
RATE_WINDOW = int(os.getenv("RATE_WINDOW", "60"))  # seconds

async def rate_limiter(x_api_key: str = Header(default=None, alias="X-API-Key")):
    # Allow missing key for now (default to public) to ease testing
    if not x_api_key:
        x_api_key = "public"
    
    key = f"rl:{x_api_key}"
    
    try:
        current = r.incr(key)
        if current == 1:
            r.expire(key, RATE_WINDOW)

        if current > RATE_LIMIT:
            ttl = r.ttl(key)
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again in {ttl}s"
            )
    except Exception:
        # If Redis is unavailable, we default to allowing the request
        # In a strict environment, we might block or fallback to in-memory
        pass
