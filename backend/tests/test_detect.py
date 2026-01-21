from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app
from app.services.ml_service import get_detector

client = TestClient(app)

def mock_detector(text: str):
    return "ai", 0.95

def test_detect_endpoint():
    # Override the dependency
    app.dependency_overrides[get_detector] = lambda: MagicMock(predict=mock_detector)
    
    response = client.post("/v1/detect", json={"text": "This is a test sentence."})
    
    assert response.status_code == 200
    expected_response = {
        "label": "ai",
        "probability": 0.95
    }
    assert response.json() == expected_response

    # Clean up
    app.dependency_overrides = {}

def test_detect_endpoint_validation_error():
    response = client.post("/v1/detect", json={"text": ""})  # Too short
    assert response.status_code == 422

def test_detect_endpoint_text_too_long():
    response = client.post("/v1/detect", json={"text": "a" * 20001})  # Too long
    assert response.status_code == 422
