"""
Redis Cache Tests for Paraphrase Endpoint
==========================================

Tests for verifying Redis caching functionality:
- Cache key generation
- Cache hit/miss behavior
- Speed improvement on repeat inputs

Author: RewriteGuard Team
"""

import pytest
import hashlib
import json
from unittest.mock import patch, MagicMock


class TestCacheKeyGeneration:
    """Tests for cache key generation."""
    
    def test_generate_cache_key_deterministic(self):
        """Same inputs should produce same cache key."""
        from app.redis_client import generate_cache_key
        
        text = "Hello world"
        mode = "standard"
        temperature = 0.7
        max_length = 512
        
        key1 = generate_cache_key(text, mode, temperature, max_length)
        key2 = generate_cache_key(text, mode, temperature, max_length)
        
        assert key1 == key2
        assert key1.startswith("paraphrase:")
    
    def test_generate_cache_key_different_text(self):
        """Different text should produce different cache keys."""
        from app.redis_client import generate_cache_key
        
        key1 = generate_cache_key("Hello world", "standard", 0.7, 512)
        key2 = generate_cache_key("Goodbye world", "standard", 0.7, 512)
        
        assert key1 != key2
    
    def test_generate_cache_key_different_mode(self):
        """Different mode should produce different cache keys."""
        from app.redis_client import generate_cache_key
        
        key1 = generate_cache_key("Hello world", "standard", 0.7, 512)
        key2 = generate_cache_key("Hello world", "formal", 0.7, 512)
        
        assert key1 != key2
    
    def test_generate_cache_key_different_temperature(self):
        """Different temperature should produce different cache keys."""
        from app.redis_client import generate_cache_key
        
        key1 = generate_cache_key("Hello world", "standard", 0.7, 512)
        key2 = generate_cache_key("Hello world", "standard", 0.8, 512)
        
        assert key1 != key2
    
    def test_generate_cache_key_different_max_length(self):
        """Different max_length should produce different cache keys."""
        from app.redis_client import generate_cache_key
        
        key1 = generate_cache_key("Hello world", "standard", 0.7, 512)
        key2 = generate_cache_key("Hello world", "standard", 0.7, 256)
        
        assert key1 != key2
    
    def test_cache_key_is_sha256(self):
        """Cache key should be a valid SHA256 hash with prefix."""
        from app.redis_client import generate_cache_key
        
        key = generate_cache_key("Hello world", "standard", 0.7, 512)
        
        # Remove prefix and verify length
        hash_part = key.replace("paraphrase:", "")
        assert len(hash_part) == 64  # SHA256 produces 64 hex characters


class TestCacheOperations:
    """Tests for cache get/set operations."""
    
    @patch('app.redis_client.r')
    @patch('app.redis_client.REDIS_AVAILABLE', True)
    def test_get_cached_paraphrase_hit(self, mock_redis):
        """Test cache hit returns cached data."""
        from app.redis_client import get_cached_paraphrase
        
        cached_data = {
            'paraphrased_text': 'Cached result',
            'mode': 'standard',
            'input_tokens': 10,
            'output_tokens': 12,
            'total_tokens': 22
        }
        mock_redis.get.return_value = json.dumps(cached_data)
        
        result = get_cached_paraphrase("paraphrase:test_key")
        
        assert result == cached_data
        mock_redis.get.assert_called_once_with("paraphrase:test_key")
    
    @patch('app.redis_client.r')
    @patch('app.redis_client.REDIS_AVAILABLE', True)
    def test_get_cached_paraphrase_miss(self, mock_redis):
        """Test cache miss returns None."""
        from app.redis_client import get_cached_paraphrase
        
        mock_redis.get.return_value = None
        
        result = get_cached_paraphrase("paraphrase:nonexistent_key")
        
        assert result is None
    
    @patch('app.redis_client.r')
    @patch('app.redis_client.REDIS_AVAILABLE', True)
    def test_set_cached_paraphrase(self, mock_redis):
        """Test setting cache successfully."""
        from app.redis_client import set_cached_paraphrase, PARAPHRASE_CACHE_TTL
        
        cache_data = {
            'paraphrased_text': 'Test result',
            'mode': 'formal',
            'input_tokens': 5,
            'output_tokens': 7,
            'total_tokens': 12
        }
        
        result = set_cached_paraphrase("paraphrase:test_key", cache_data)
        
        assert result is True
        mock_redis.setex.assert_called_once_with(
            "paraphrase:test_key",
            PARAPHRASE_CACHE_TTL,
            json.dumps(cache_data)
        )
    
    @patch('app.redis_client.r', None)
    @patch('app.redis_client.REDIS_AVAILABLE', False)
    def test_cache_operations_when_redis_unavailable(self):
        """Test graceful handling when Redis is unavailable."""
        from app.redis_client import get_cached_paraphrase, set_cached_paraphrase
        
        # Should return None for get
        assert get_cached_paraphrase("any_key") is None
        
        # Should return False for set
        assert set_cached_paraphrase("any_key", {"data": "test"}) is False


class TestCacheStats:
    """Tests for cache statistics endpoint."""
    
    @patch('app.redis_client.r')
    @patch('app.redis_client.REDIS_AVAILABLE', True)
    def test_get_cache_stats(self, mock_redis):
        """Test getting cache statistics."""
        from app.redis_client import get_cache_stats
        
        mock_redis.info.return_value = {"used_memory_human": "1.5M"}
        mock_redis.dbsize.return_value = 42
        
        stats = get_cache_stats()
        
        assert stats["status"] == "connected"
        assert stats["keys"] == 42
        assert stats["used_memory"] == "1.5M"
    
    @patch('app.redis_client.REDIS_AVAILABLE', False)
    def test_get_cache_stats_unavailable(self):
        """Test cache stats when Redis unavailable."""
        from app.redis_client import get_cache_stats
        
        stats = get_cache_stats()
        
        assert stats["status"] == "unavailable"


class TestCacheSpeedImprovement:
    """Tests to verify speed improvement on repeat inputs."""
    
    def test_cache_hit_latency_is_low(self):
        """Cache hits should have very low latency (< 10ms typically)."""
        import time
        from unittest.mock import patch
        
        cached_data = {
            'paraphrased_text': 'Cached result',
            'mode': 'standard',
            'input_tokens': 10,
            'output_tokens': 12,
            'total_tokens': 22
        }
        
        with patch('app.redis_client.r') as mock_redis, \
             patch('app.redis_client.REDIS_AVAILABLE', True):
            mock_redis.get.return_value = json.dumps(cached_data)
            
            from app.redis_client import get_cached_paraphrase
            
            start = time.perf_counter()
            result = get_cached_paraphrase("paraphrase:test_key")
            end = time.perf_counter()
            
            latency_ms = (end - start) * 1000
            
            # Cache lookup should be very fast (< 50ms even with mock overhead)
            assert latency_ms < 50
            assert result is not None
