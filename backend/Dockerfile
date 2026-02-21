FROM python:3.11-slim

# --- Metadata ---
LABEL maintainer="rewriteguard.com"
LABEL description="RewriteGuard API Backend"

WORKDIR /app

# --- System dependencies ---
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
  && rm -rf /var/lib/apt/lists/*

# --- Install Python dependencies ---
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Copy application code ---
COPY app ./app
COPY db.py .

# --- Environment defaults ---
ENV PORT=8000
ENV ENV=prod
ENV LOG_LEVEL=INFO
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

# --- Docker health check (used by ECS, Docker Compose, etc.) ---
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/health/live || exit 1

# --- Run with production settings ---
# Workers auto-calculated: 2 * CPU cores + 1 (override with WEB_CONCURRENCY env)
CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "2", \
     "--access-log", \
     "--proxy-headers", \
     "--forwarded-allow-ips", "*"]
