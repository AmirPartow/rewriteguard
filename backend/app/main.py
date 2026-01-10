from fastapi import FastAPI, Depends
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.health import router as health_router
from app.api.detect import router as detect_router
from app.ml.model import load_model
from app.rate_limit import rate_limiter

setup_logging(settings.LOG_LEVEL)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

app.include_router(health_router)
app.include_router(detect_router)

@app.on_event("startup")
def startup_event():
    load_model()

@app.get("/")
def root():
    return {"service": settings.APP_NAME, "version": settings.APP_VERSION}

@app.get("/protected")
def protected(_: None = Depends(rate_limiter)):
    return {"ok": True, "message": "passed rate limit"}