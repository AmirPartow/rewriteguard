import os

MODEL_NAME = os.getenv("ML_MODEL_NAME", "microsoft/deberta-v3-base")
DEVICE = os.getenv("ML_DEVICE", "cpu") # "cpu" or "cuda"
MAX_LENGTH = int(os.getenv("ML_MAX_LENGTH", "256"))
THRESHOLD = float(os.getenv("ML_THRESHOLD", "0.5"))
