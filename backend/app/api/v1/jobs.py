"""
Jobs API endpoint for tracking and retrieving user job history.
"""
from fastapi import APIRouter, Header, HTTPException, status
from typing import Annotated
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import logging

from app.auth.service import validate_session, SessionNotFoundError

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory job storage for demo
_jobs_db: list[dict] = []
_job_counter = 1


class JobRecord(BaseModel):
    """A job record for display."""
    id: int
    user_id: int
    job_type: str = Field(..., description="'detect' or 'paraphrase'")
    input_preview: str = Field(..., description="First 100 chars of input")
    word_count: int
    status: str = Field(default="completed")
    created_at: datetime


class JobsResponse(BaseModel):
    """Response with list of jobs."""
    jobs: list[JobRecord]
    total_count: int


async def get_user_id_from_token(authorization: str | None) -> int:
    """Extract user ID from authorization header."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format",
        )
    
    try:
        user_info = await validate_session(parts[1])
        return user_info.id
    except SessionNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )


def record_job(
    user_id: int, 
    job_type: str, 
    input_text: str, 
    word_count: int,
    status: str = "completed"
) -> int:
    """
    Record a new job entry.
    
    Args:
        user_id: The user's ID
        job_type: Type of job ('detect' or 'paraphrase')
        input_text: The input text (will be truncated for preview)
        word_count: Number of words processed
        status: Job status
        
    Returns:
        The job ID
    """
    global _job_counter
    
    job_id = _job_counter
    _job_counter += 1
    
    input_preview = input_text[:100] + "..." if len(input_text) > 100 else input_text
    
    job = {
        "id": job_id,
        "user_id": user_id,
        "job_type": job_type,
        "input_preview": input_preview,
        "word_count": word_count,
        "status": status,
        "created_at": datetime.now(timezone.utc),
    }
    
    _jobs_db.append(job)
    logger.info(f"Job recorded: id={job_id} user={user_id} type={job_type} words={word_count}")
    
    return job_id


@router.get("/recent", response_model=JobsResponse)
async def get_recent_jobs(
    limit: int = 10,
    authorization: Annotated[str | None, Header()] = None,
) -> JobsResponse:
    """
    Get recent jobs for the authenticated user.
    
    - **limit**: Maximum number of jobs to return (default 10, max 50)
    """
    user_id = await get_user_id_from_token(authorization)
    
    # Clamp limit
    limit = min(max(1, limit), 50)
    
    # Filter jobs for this user and sort by created_at desc
    user_jobs = [j for j in _jobs_db if j["user_id"] == user_id]
    user_jobs.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Take limit
    recent_jobs = user_jobs[:limit]
    
    return JobsResponse(
        jobs=[JobRecord(**j) for j in recent_jobs],
        total_count=len(user_jobs),
    )


@router.get("/stats")
async def get_job_stats(
    authorization: Annotated[str | None, Header()] = None,
):
    """
    Get job statistics for the authenticated user.
    """
    user_id = await get_user_id_from_token(authorization)
    
    user_jobs = [j for j in _jobs_db if j["user_id"] == user_id]
    
    detect_jobs = [j for j in user_jobs if j["job_type"] == "detect"]
    paraphrase_jobs = [j for j in user_jobs if j["job_type"] == "paraphrase"]
    
    return {
        "total_jobs": len(user_jobs),
        "detect_jobs": len(detect_jobs),
        "paraphrase_jobs": len(paraphrase_jobs),
        "total_words_processed": sum(j["word_count"] for j in user_jobs),
    }
