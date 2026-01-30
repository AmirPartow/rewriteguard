"""
Redis Client Module
====================

Provides Redis connection and caching utilities for the RewriteGuard backend.
Supports paraphrase result caching with configurable TTL and cache-hit tracking.

Features:
- Configurable TTL via environment variable
- SHA256-based cache key generation for paraphrase requests
- Graceful fallback when Redis is unavailable
- Structured cache operations with logging

Author: RewriteGuard Team
"""

import os
import json
import hashlib
import logging
from typing import Optional, Any
import redis

logger = logging.getLogger(__name__)

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Cache TTL configuration (default: 1 hour = 3600 seconds)
PARAPHRASE_CACHE_TTL = int(os.getenv("PARAPHRASE_CACHE_TTL", "3600"))

# Initialize Redis connection
try:
    r = redis.Redis.from_url(REDIS_URL, decode_responses=True)
    # Test connection
    r.ping()
    REDIS_AVAILABLE = True
    logger.info(f"Redis connected at {REDIS_URL} | TTL={PARAPHRASE_CACHE_TTL}s")
except redis.ConnectionError:
    r = None
    REDIS_AVAILABLE = False
    logger.warning("Redis unavailable - caching disabled")


def generate_cache_key(text: str, mode: str, temperature: float, max_length: int) -> str:
    """
    Generate a unique cache key for paraphrase requests.
    
    Uses SHA256 hash of the concatenated parameters to create a fixed-length,
    collision-resistant key.
    
    Args:
        text: Input text to paraphrase
        mode: Paraphrasing mode (standard, formal, casual, creative, concise)
        temperature: Generation temperature (0.0-1.0)
        max_length: Maximum output length in tokens
        
    Returns:
        Cache key string in format "paraphrase:{hash}"
    """
    # Create a deterministic string from all parameters
    key_data = json.dumps({
        "text": text,
        "mode": mode,
        "temperature": temperature,
        "max_length": max_length
    }, sort_keys=True)
    
    # Generate SHA256 hash
    hash_value = hashlib.sha256(key_data.encode()).hexdigest()
    
    return f"paraphrase:{hash_value}"


def get_cached_paraphrase(cache_key: str) -> Optional[dict]:
    """
    Retrieve cached paraphrase result from Redis.
    
    Args:
        cache_key: The cache key to look up
        
    Returns:
        Cached result dict if found, None otherwise
    """
    if not REDIS_AVAILABLE or r is None:
        return None
    
    try:
        cached = r.get(cache_key)
        if cached:
            logger.info(f"CACHE_HIT | key={cache_key[:40]}...")
            return json.loads(cached)
        else:
            logger.info(f"CACHE_MISS | key={cache_key[:40]}...")
            return None
    except redis.RedisError as e:
        logger.error(f"Redis get error: {e}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Cache decode error: {e}")
        return None


def set_cached_paraphrase(cache_key: str, result: dict, ttl: int = None) -> bool:
    """
    Store paraphrase result in Redis cache.
    
    Args:
        cache_key: The cache key to store under
        result: The paraphrase result dict to cache
        ttl: Optional TTL override in seconds (defaults to PARAPHRASE_CACHE_TTL)
        
    Returns:
        True if successfully cached, False otherwise
    """
    if not REDIS_AVAILABLE or r is None:
        return False
    
    if ttl is None:
        ttl = PARAPHRASE_CACHE_TTL
    
    try:
        r.setex(cache_key, ttl, json.dumps(result))
        logger.info(f"CACHE_SET | key={cache_key[:40]}... | ttl={ttl}s")
        return True
    except redis.RedisError as e:
        logger.error(f"Redis set error: {e}")
        return False


def get_cache_stats() -> dict:
    """
    Get cache statistics for monitoring.
    
    Returns:
        Dict with cache stats (keys count, memory usage, etc.)
    """
    if not REDIS_AVAILABLE or r is None:
        return {"status": "unavailable"}
    
    try:
        info = r.info("memory")
        key_count = r.dbsize()
        return {
            "status": "connected",
            "keys": key_count,
            "used_memory": info.get("used_memory_human", "unknown"),
            "ttl_seconds": PARAPHRASE_CACHE_TTL
        }
    except redis.RedisError as e:
        logger.error(f"Redis stats error: {e}")
        return {"status": "error", "error": str(e)}
