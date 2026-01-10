from fastapi import FastAPI
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.health import router as health_router
from app.api.detect import router as detect_router
from app.ml.model import load_model

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