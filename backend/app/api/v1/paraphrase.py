"""
Paraphrase API Endpoint Module
==============================

This module provides the /v1/paraphrase REST API endpoint for text paraphrasing.
It supports multiple paraphrasing modes (standard, formal, casual, creative, concise)
and returns the paraphrased text along with processing time metrics and token usage.

Features:
- Async processing with thread pool for CPU-bound ML operations
- 30-second timeout protection to prevent long-running requests
- Comprehensive logging for monitoring and debugging
- Graceful error handling with appropriate HTTP status codes
- Job recording with latency and token usage metrics
- Redis caching for repeat request optimization

Author: RewriteGuard Team
"""

from fastapi import APIRouter, HTTPException, Depends
from app.schemas import ParaphraseRequest, ParaphraseResponse
from app.services.paraphrase_service import get_paraphraser, Paraphraser, ParaphraseResult
from app.redis_client import (
    generate_cache_key,
    get_cached_paraphrase,
    set_cached_paraphrase,
    PARAPHRASE_CACHE_TTL
)
import logging
import time
import asyncio
import anyio
from datetime import datetime
import uuid

# Create router instance for paraphrase endpoints
router = APIRouter()

# Logger for this module - logs to configured handlers
logger = logging.getLogger(__name__)


def record_job(
    job_id: str,
    mode: str,
    input_length: int,
    output_length: int,
    latency_ms: float,
    input_tokens: int,
    output_tokens: int,
    total_tokens: int,
    status: str = "success"
):
    """
    Record job entry with latency and token usage for monitoring/billing.
    
    This logs the job details in a structured format that can be:
    - Parsed by log aggregation systems (e.g., ELK, Datadog)
    - Used for billing calculations based on token usage
    - Analyzed for performance monitoring
    
    Args:
        job_id: Unique identifier for the job
        mode: Paraphrasing mode used
        input_length: Character count of input
        output_length: Character count of output
        latency_ms: Processing time in milliseconds
        input_tokens: Number of input tokens processed
        output_tokens: Number of output tokens generated
        total_tokens: Total tokens (input + output)
        status: Job status (success/error)
    """
    logger.info(
        f"JOB_RECORD | "
        f"job_id={job_id} | "
        f"timestamp={datetime.utcnow().isoformat()}Z | "
        f"status={status} | "
        f"mode={mode} | "
        f"input_chars={input_length} | "
        f"output_chars={output_length} | "
        f"latency_ms={latency_ms:.2f} | "
        f"input_tokens={input_tokens} | "
        f"output_tokens={output_tokens} | "
        f"total_tokens={total_tokens}"
    )


@router.post("/paraphrase", response_model=ParaphraseResponse)
async def paraphrase_text(
    request: ParaphraseRequest,
    paraphraser: Paraphraser = Depends(get_paraphraser)
):
    """
    Paraphrases the input text using the specified mode and parameters.
    
    Request Body:
        - text: The text to paraphrase (1-10000 chars)
        - mode: Paraphrasing style (standard, formal, casual, creative, concise)
        - temperature: Controls randomness (0.0-1.0, default 0.7)
        - max_length: Maximum output tokens (50-1024, default 512)
        
    Returns:
        ParaphraseResponse with:
        - paraphrased_text: The rewritten text
        - mode: Mode that was used
        - processing_time_ms: Latency in milliseconds
        - input_tokens: Number of input tokens processed
        - output_tokens: Number of output tokens generated
        - total_tokens: Total tokens for billing
        - cached: Whether result was served from cache
        
    Raises:
        504: Request timeout after 30 seconds
        500: Internal server error
    """
    # Generate unique job ID for tracking
    job_id = str(uuid.uuid4())[:8]
    
    text_length = len(request.text)
    text_preview = request.text[:50] + "..." if len(request.text) > 50 else request.text
    logger.info(
        f"Received paraphrase request | job_id={job_id} | "
        f"mode={request.mode} | temp={request.temperature} | max_len={request.max_length} | "
        f"text_length={text_length} | preview='{text_preview}'"
    )
    
    start_time = time.perf_counter()
    
    # === CACHE LOOKUP ===
    # Generate cache key from hash(text + mode + params)
    cache_key = generate_cache_key(
        request.text, 
        request.mode, 
        request.temperature, 
        request.max_length
    )
    
    # Try to get cached result
    cached_result = get_cached_paraphrase(cache_key)
    if cached_result:
        duration_ms = (time.perf_counter() - start_time) * 1000
        
        logger.info(
            f"CACHE_HIT | job_id={job_id} | mode={request.mode} | "
            f"latency_ms={duration_ms:.2f} | text_length={text_length} | "
            f"output_length={len(cached_result.get('paraphrased_text', ''))} | "
            f"cache_speedup=true"
        )
        
        # Record cache-hit job
        record_job(
            job_id=job_id,
            mode=request.mode,
            input_length=text_length,
            output_length=len(cached_result.get('paraphrased_text', '')),
            latency_ms=duration_ms,
            input_tokens=cached_result.get('input_tokens', 0),
            output_tokens=cached_result.get('output_tokens', 0),
            total_tokens=cached_result.get('total_tokens', 0),
            status="cache_hit"
        )
        
        return ParaphraseResponse(
            paraphrased_text=cached_result['paraphrased_text'],
            mode=cached_result['mode'],
            processing_time_ms=round(duration_ms, 2),
            input_tokens=cached_result['input_tokens'],
            output_tokens=cached_result['output_tokens'],
            total_tokens=cached_result['total_tokens']
        )
    
    # === CACHE MISS - Run ML Paraphrase ===
    try:
        # Run paraphrase in thread pool with timeout
        async def run_paraphrase():
            return await anyio.to_thread.run_sync(
                lambda: paraphraser.paraphrase(
                    request.text, 
                    request.mode,
                    request.temperature,
                    request.max_length
                )
            )
        
        # Apply 30 second timeout for paraphrase (longer than detection)
        try:
            result: ParaphraseResult = await asyncio.wait_for(run_paraphrase(), timeout=30.0)
        except asyncio.TimeoutError:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(f"Paraphrase timeout after 30s | job_id={job_id} | text_length={text_length} | mode={request.mode}")
            
            # Record failed job
            record_job(
                job_id=job_id,
                mode=request.mode,
                input_length=text_length,
                output_length=0,
                latency_ms=duration_ms,
                input_tokens=0,
                output_tokens=0,
                total_tokens=0,
                status="timeout"
            )
            
            raise HTTPException(
                status_code=504,
                detail="Request timeout: Paraphrasing took too long to complete"
            )
        
        duration_ms = (time.perf_counter() - start_time) * 1000
        
        # === CACHE STORAGE ===
        # Store successful result in cache for future requests
        cache_data = {
            'paraphrased_text': result.text,
            'mode': request.mode,
            'input_tokens': result.input_tokens,
            'output_tokens': result.output_tokens,
            'total_tokens': result.total_tokens
        }
        set_cached_paraphrase(cache_key, cache_data)
        
        # Record successful job with latency and token usage
        record_job(
            job_id=job_id,
            mode=request.mode,
            input_length=text_length,
            output_length=len(result.text),
            latency_ms=duration_ms,
            input_tokens=result.input_tokens,
            output_tokens=result.output_tokens,
            total_tokens=result.total_tokens,
            status="success"
        )
        
        logger.info(
            f"Paraphrase complete | job_id={job_id} | mode={request.mode} | "
            f"latency_ms={duration_ms:.2f} | input_length={text_length} | "
            f"output_length={len(result.text)} | total_tokens={result.total_tokens} | "
            f"cached_for_next=true"
        )
        
        return ParaphraseResponse(
            paraphrased_text=result.text,
            mode=request.mode,
            processing_time_ms=round(duration_ms, 2),
            input_tokens=result.input_tokens,
            output_tokens=result.output_tokens,
            total_tokens=result.total_tokens
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (like timeout)
        raise
    except Exception as e:
        duration_ms = (time.perf_counter() - start_time) * 1000
        
        # Record error job
        record_job(
            job_id=job_id,
            mode=request.mode,
            input_length=text_length,
            output_length=0,
            latency_ms=duration_ms,
            input_tokens=0,
            output_tokens=0,
            total_tokens=0,
            status="error"
        )
        
        logger.error(
            f"Paraphrase error | job_id={job_id} | error={str(e)} | latency_ms={duration_ms:.2f} | "
            f"text_length={text_length} | mode={request.mode}",
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="Internal server error during paraphrase processing"
        )

