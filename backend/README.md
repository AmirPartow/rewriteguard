# RewriteGuard Backend

FastAPI backend service for RewriteGuard.

## Features

- ✅ FastAPI application with automatic API documentation
- ✅ Health check endpoint (`/health`)
- ✅ Logging configuration via environment variables
- ✅ Settings management using Pydantic Settings
- ✅ Environment-based configuration

## Project Structure

```
backend/
├── .env                    # Environment variables
├── requirements.txt        # Python dependencies
└── app/
    ├── main.py            # FastAPI application entry point
    ├── api/
    │   └── health.py      # Health check endpoint
    └── core/
        ├── config.py      # Application settings
        └── logging.py     # Logging configuration
```

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Edit `.env` file to customize settings:

```env
APP_NAME=rewriteguard-backend
APP_VERSION=0.1.0
LOG_LEVEL=INFO
```

### 3. Run the Server

```bash
uvicorn app.main:app --reload
```

The server will start at `http://localhost:8000`

## API Endpoints

- **GET /** - Root endpoint, returns service info
  ```json
  {
    "service": "rewriteguard-backend",
    "version": "0.1.0"
  }
  ```

- **GET /health** - Health check endpoint
  ```json
  {
    "ok": true
  }
  ```

- **GET /docs** - Interactive API documentation (Swagger UI)
- **GET /redoc** - Alternative API documentation (ReDoc)

### Detection API

- **POST /v1/detect** - Analyze text for AI generation
  **Request Body:**
  ```json
  {
    "text": "Text to analyze..."
  }
  ```
  **Response:**
  ```json
  {
    "label": "ai",
    "probability": 0.98
  }
  ```

## Development

### Running in Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Testing the Endpoints

Using curl:
```bash
# Test health check
curl http://localhost:8000/health

# Test AI detection
curl -X POST http://localhost:8000/v1/detect \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a sample text to analyze for AI generation."}'
```

Or visit in your browser:
- http://localhost:8000/ - Root endpoint
- http://localhost:8000/health - Health check
- http://localhost:8000/docs - Interactive API docs

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `rewriteguard-backend` | Application name |
| `APP_VERSION` | `0.1.0` | Application version |
| `LOG_LEVEL` | `INFO` | Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL) |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection URL for caching |
| `PARAPHRASE_CACHE_TTL` | `3600` | Cache TTL in seconds (default: 1 hour) |

## Redis Caching

The paraphrase endpoint supports Redis caching for improved performance on repeat requests.

### Features

- **Cache Key**: Generated from SHA256 hash of `text + mode + temperature + max_length`
- **TTL Configuration**: Configurable via `PARAPHRASE_CACHE_TTL` environment variable
- **Cache-Hit Logging**: All cache hits/misses are logged for monitoring
- **Speed Improvement**: Cache hits return in <10ms vs 1-30s for ML processing

### Cache Stats Endpoint

- **GET /cache-stats** - Get Redis cache statistics
  ```json
  {
    "status": "connected",
    "keys": 42,
    "used_memory": "1.5M",
    "ttl_seconds": 3600
  }
  ```

### Running Redis Locally

```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:latest

# Or via Docker Compose (included in project)
docker-compose up redis
```

## Next Steps

- Add database connectivity
- Implement authentication
- Add API endpoints for core functionality
- Set up testing framework
- Configure CORS for frontend integration

