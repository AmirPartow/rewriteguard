import os
import requests
from typing import Optional, Dict, Any
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Use environment variables for real keys
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")


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


def verify_facebook_code(code: str, redirect_uri: str) -> Optional[Dict[str, Any]]:
    """
    Exchanges code for user info from Facebook.
    """
    if not FACEBOOK_APP_ID or not FACEBOOK_APP_SECRET:
        return None

    try:
        # 1. Exchange code for access token
        token_url = "https://graph.facebook.com/v12.0/oauth/access_token"
        params = {
            "client_id": FACEBOOK_APP_ID,
            "redirect_uri": redirect_uri,
            "client_secret": FACEBOOK_APP_SECRET,
            "code": code,
        }
        res = requests.get(token_url, params=params)
        access_token = res.json().get("access_token")

        if not access_token:
            return None

        # 2. Get user info
        user_url = "https://graph.facebook.com/me"
        user_params = {"fields": "id,name,email", "access_token": access_token}
        user_res = requests.get(user_url, params=user_params)
        user_data = user_res.json()

        return {
            "provider": "facebook",
            "provider_id": user_data["id"],
            "email": user_data.get("email"),
            "full_name": user_data.get("name", ""),
        }
    except Exception as e:
        print(f"Facebook verify error: {e}")
        return None
