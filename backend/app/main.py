from fastapi import FastAPI
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.health import router as health_router

setup_logging(settings.LOG_LEVEL)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

app.include_router(health_router)

@app.get("/")
def root():
    return {"service": settings.APP_NAME, "version": settings.APP_VERSION}