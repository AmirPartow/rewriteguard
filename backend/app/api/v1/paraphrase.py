from fastapi import APIRouter, HTTPException, Depends
from app.schemas import ParaphraseRequest, ParaphraseResponse
from app.services.paraphrase_service import get_paraphraser, Paraphraser
import logging
import time
import asyncio
import anyio

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/paraphrase", response_model=ParaphraseResponse)
async def paraphrase_text(
    request: ParaphraseRequest,
    paraphraser: Paraphraser = Depends(get_paraphraser)
):
    """
    Paraphrases the input text using the specified mode.
    
    Args:
        request: Contains text to paraphrase and optional mode
        
    Returns:
        ParaphraseResponse with paraphrased text, mode used, and timing
        
    Raises:
        504: Request timeout after 30 seconds
        500: Internal server error
    """
    text_length = len(request.text)
    text_preview = request.text[:50] + "..." if len(request.text) > 50 else request.text
    logger.info(f"Received paraphrase request | mode={request.mode} | text_length={text_length} | preview='{text_preview}'")
    
    start_time = time.perf_counter()
    
    try:
        # Run paraphrase in thread pool with timeout
        async def run_paraphrase():
            return await anyio.to_thread.run_sync(
                lambda: paraphraser.paraphrase(request.text, request.mode)
            )
        
        # Apply 30 second timeout for paraphrase (longer than detection)
        try:
            paraphrased_text = await asyncio.wait_for(run_paraphrase(), timeout=30.0)
        except asyncio.TimeoutError:
            logger.error(f"Paraphrase timeout after 30s | text_length={text_length} | mode={request.mode}")
            raise HTTPException(
                status_code=504,
                detail="Request timeout: Paraphrasing took too long to complete"
            )
        
        duration_ms = (time.perf_counter() - start_time) * 1000
        
        logger.info(
            f"Paraphrase complete | mode={request.mode} | "
            f"latency_ms={duration_ms:.2f} | input_length={text_length} | "
            f"output_length={len(paraphrased_text)}"
        )
        
        return ParaphraseResponse(
            paraphrased_text=paraphrased_text,
            mode=request.mode,
            processing_time_ms=round(duration_ms, 2)
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (like timeout)
        raise
    except Exception as e:
        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.error(
            f"Paraphrase error | error={str(e)} | latency_ms={duration_ms:.2f} | "
            f"text_length={text_length} | mode={request.mode}",
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="Internal server error during paraphrase processing"
        )
