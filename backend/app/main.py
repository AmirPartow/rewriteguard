from fastapi import FastAPI, Depends
from app.core.logging import setup_logging
from app.api.v1.detect import router as detect_router
from app.api.v1.paraphrase import router as paraphrase_router
from .rate_limit import rate_limiter

setup_logging()

app = FastAPI(title="rewriteguard-backend")

app.include_router(detect_router, prefix="/v1", tags=["Detection"])
app.include_router(paraphrase_router, prefix="/v1", tags=["Paraphrase"])

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/protected")
def protected(_: None = Depends(rate_limiter)):
    return {"ok": True, "message": "passed rate limit"}
