from fastapi import APIRouter, HTTPException, Depends
from app.schemas import DetectRequest, DetectResponse
from app.services.ml_service import get_detector, DebertaDetector
import logging
import time
import asyncio
import anyio

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/detect", response_model=DetectResponse)
async def detect_text(
    request: DetectRequest,
    detector: DebertaDetector = Depends(get_detector)
):
    """
    Detects the likelihood of the text being AI-generated using DeBERTa.
    
    Returns:
        DetectResponse with label (ai/human) and probability score
        
    Raises:
        504: Request timeout after 10 seconds
        500: Internal server error
    """
    text_length = len(request.text)
    text_preview = request.text[:50] + "..." if len(request.text) > 50 else request.text
    logger.info(f"Received detection request | text_length={text_length} | preview='{text_preview}'")
    
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
            f"latency_ms={duration_ms:.2f} | text_length={text_length}"
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
