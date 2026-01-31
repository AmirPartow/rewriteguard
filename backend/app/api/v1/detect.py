from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Annotated
from app.schemas import DetectRequest, DetectResponse
from app.services.ml_service import get_detector, DebertaDetector
from app.quota.service import track_usage, check_quota, QuotaExceededError
from app.auth.service import validate_session, SessionNotFoundError
import logging
import time
import asyncio
import anyio

router = APIRouter()
logger = logging.getLogger(__name__)


def count_words(text: str) -> int:
    """Count words in text."""
    return len(text.split())


async def get_optional_user_id(authorization: str | None) -> int | None:
    """Get user ID from token if provided, otherwise return None."""
    if not authorization:
        return None
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    
    try:
        user_info = await validate_session(parts[1])
        return user_info.id
    except SessionNotFoundError:
        return None


@router.post("/detect", response_model=DetectResponse)
async def detect_text(
    request: DetectRequest,
    detector: DebertaDetector = Depends(get_detector),
    authorization: Annotated[str | None, Header()] = None,
):
    """
    Detects the likelihood of the text being AI-generated using DeBERTa.
    
    If authenticated (Authorization header), enforces daily word quota:
    - Free plan: 1,000 words/day
    - Premium plan: 10,000 words/day
    
    Returns:
        DetectResponse with label (ai/human) and probability score
        
    Raises:
        429: Quota exceeded (authenticated users only)
        504: Request timeout after 10 seconds
        500: Internal server error
    """
    text_length = len(request.text)
    word_count = count_words(request.text)
    text_preview = request.text[:50] + "..." if len(request.text) > 50 else request.text
    logger.info(f"Received detection request | text_length={text_length} | words={word_count} | preview='{text_preview}'")
    
    # Check and track quota if authenticated
    user_id = await get_optional_user_id(authorization)
    if user_id is not None:
        try:
            track_usage(user_id, word_count, "detect", enforce_limit=True)
        except QuotaExceededError as e:
            logger.warning(f"Quota exceeded for user {user_id}: {e}")
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "quota_exceeded",
                    "message": f"Daily quota exceeded. You have {e.words_remaining} words remaining.",
                    "plan_type": e.plan_type,
                    "daily_limit": e.daily_limit,
                    "words_used": e.words_used,
                    "words_requested": e.words_requested,
                    "upgrade_url": "/v1/quota/upgrade",
                }
            )
    
    start_time = time.perf_counter()
    
    try:
        # Run CPU-bound prediction in thread pool with timeout
        async def run_prediction():
            return await anyio.to_thread.run_sync(detector.predict, request.text)
        
        # Apply 10 second timeout
        try:
            label, score = await asyncio.wait_for(run_prediction(), timeout=10.0)
        except asyncio.TimeoutError:
            logger.error(f"Prediction timeout after 10s | text_length={text_length}")
            raise HTTPException(
                status_code=504,
                detail="Request timeout: Detection took too long to complete"
            )
        
        duration_ms = (time.perf_counter() - start_time) * 1000
        
        logger.info(
            f"Prediction complete | label={label} | probability={score:.4f} | "
            f"latency_ms={duration_ms:.2f} | text_length={text_length} | words={word_count}"
        )
        
        return DetectResponse(label=label, probability=score)
        
    except HTTPException:
        # Re-raise HTTP exceptions (like timeout)
        raise
    except Exception as e:
        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.error(
            f"Detection error | error={str(e)} | latency_ms={duration_ms:.2f} | "
            f"text_length={text_length}",
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="Internal server error during detection processing"
        )

