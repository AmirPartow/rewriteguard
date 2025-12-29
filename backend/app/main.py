from fastapi import FastAPI, Depends
from .rate_limit import rate_limiter

app = FastAPI(title="rewriteguard-backend")

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/protected")
def protected(_: None = Depends(rate_limiter)):
    return {"ok": True, "message": "passed rate limit"}
