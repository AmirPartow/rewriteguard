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

## Development

### Running in Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Testing the Endpoints

Using curl:
```bash
# Test root endpoint
curl http://localhost:8000/

# Test health check
curl http://localhost:8000/health
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

## Next Steps

- Add database connectivity
- Implement authentication
- Add API endpoints for core functionality
- Set up testing framework
- Configure CORS for frontend integration
