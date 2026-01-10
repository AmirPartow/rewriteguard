from fastapi import APIRouter
from pydantic import BaseModel
from app.ml.detect import run_detection

router = APIRouter()

class DetectRequest(BaseModel):
    text: str

@router.post("/detect")
def detect(req: DetectRequest):
    return run_detection(req.text)
