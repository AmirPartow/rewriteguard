from fastapi import APIRouter, HTTPException, Depends, Header, Request
from typing import Annotated
from app.schemas import DetectRequest
from app.services.ml_service import get_detector, DebertaDetector
from app.quota.service import track_usage, QuotaExceededError
from app.auth.service import validate_session, SessionNotFoundError
import logging
import time
import asyncio
import anyio

router = APIRouter()
logger = logging.getLogger(__name__)

# Semaphore to serialize ML inference — on t3.micro (1 vCPU), concurrent
# inference causes thread contention that explodes latency. Queuing requests
# ensures each gets full CPU and finishes in ~1s instead of all fighting for 25s.
_ml_semaphore = asyncio.Semaphore(1)


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


@router.post("/detect")
async def detect_text(
    request: DetectRequest,
    detector: DebertaDetector = Depends(get_detector),
    authorization: Annotated[str | None, Header()] = None,
):
    """
    Detects the likelihood of the text being AI-generated using sentence-level analysis.

    Returns per-sentence AI probability scores and the overall weighted score.
    """
    text_length = len(request.text)
    word_count = count_words(request.text)
    text_preview = request.text[:50] + "..." if len(request.text) > 50 else request.text
    logger.info(
        f"Received detection request | text_length={text_length} | words={word_count} | preview='{text_preview}'"
    )

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
                },
            )

    start_time = time.perf_counter()

    try:
        async def run_prediction():
            async with _ml_semaphore:
                return detector.predict_sentences(request.text)

        try:
            result = await asyncio.wait_for(run_prediction(), timeout=60.0)
        except asyncio.TimeoutError:
            logger.error(f"Prediction timeout after 60s | text_length={text_length}")
            raise HTTPException(
                status_code=504,
                detail="Request timeout: Detection took too long to complete. Try shorter text or wait a moment.",
            )

        duration_ms = (time.perf_counter() - start_time) * 1000

        logger.info(
            f"Prediction complete | label={result['overall_label']} | "
            f"probability={result['overall_ai_probability']:.4f} | "
            f"sentences={len(result['sentences'])} | "
            f"latency_ms={duration_ms:.2f} | text_length={text_length} | words={word_count}"
        )

        # Return backward-compatible fields + new sentence data
        return {
            "label": result["overall_label"],
            "probability": result["overall_ai_probability"],
            "sentences": result["sentences"],
        }

    except HTTPException:
        raise
    except Exception as e:
        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.error(
            f"Detection error | error={str(e)} | latency_ms={duration_ms:.2f} | "
            f"text_length={text_length}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500, detail=f"Detection error: {str(e)}"
        )
