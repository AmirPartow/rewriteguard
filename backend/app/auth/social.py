import os
import requests
from typing import Optional, Dict, Any
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Use environment variables for real keys
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")


def verify_google_code(code: str, redirect_uri: str) -> Optional[Dict[str, Any]]:
    """
    Exchanges authorization code for user info from Google.
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        # Fallback for development if no keys are provided
        return None

    try:
        # 1. Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }
        res = requests.post(token_url, data=data)
        tokens = res.json()

        if "id_token" not in tokens:
            return None

        # 2. Verify id_token
        idinfo = id_token.verify_oauth2_token(
            tokens["id_token"], google_requests.Request(), GOOGLE_CLIENT_ID
        )

        return {
            "provider": "google",
            "provider_id": idinfo["sub"],
            "email": idinfo.get("email"),
            "full_name": idinfo.get("name", ""),
        }
    except Exception as e:
        print(f"Google verify error: {e}")
        return None
