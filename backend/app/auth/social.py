import os
import requests
import logging
import jwt
from typing import Optional, Dict, Any
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

logger = logging.getLogger(__name__)

# --- Google ---
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# --- Facebook ---
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")

# --- Apple ---
APPLE_CLIENT_ID = os.getenv("APPLE_CLIENT_ID")  # e.g. com.rewriteguard.web

# --- X (Twitter) ---
X_CLIENT_ID = os.getenv("X_CLIENT_ID")
X_CLIENT_SECRET = os.getenv("X_CLIENT_SECRET")


def verify_google_code(code: str, redirect_uri: str) -> Optional[Dict[str, Any]]:
    """Exchanges Google authorization code for user info."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return None

    try:
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
        logger.error(f"Google verify error: {e}")
        return None


def verify_facebook_code(code: str, redirect_uri: str) -> Optional[Dict[str, Any]]:
    """Exchanges Facebook authorization code for user info."""
    if not FACEBOOK_APP_ID or not FACEBOOK_APP_SECRET:
        return None

    try:
        # Exchange code for access token
        token_url = "https://graph.facebook.com/v19.0/oauth/access_token"
        params = {
            "client_id": FACEBOOK_APP_ID,
            "client_secret": FACEBOOK_APP_SECRET,
            "redirect_uri": redirect_uri,
            "code": code,
        }
        res = requests.get(token_url, params=params)
        token_data = res.json()

        access_token = token_data.get("access_token")
        if not access_token:
            logger.error(f"Facebook token exchange failed: {token_data}")
            return None

        # Get user info
        user_url = "https://graph.facebook.com/me"
        user_params = {
            "fields": "id,name,email",
            "access_token": access_token,
        }
        user_res = requests.get(user_url, params=user_params)
        user_data = user_res.json()

        if "id" not in user_data:
            logger.error(f"Facebook user info failed: {user_data}")
            return None

        return {
            "provider": "facebook",
            "provider_id": user_data["id"],
            "email": user_data.get("email"),
            "full_name": user_data.get("name", ""),
        }
    except Exception as e:
        logger.error(f"Facebook verify error: {e}")
        return None


def verify_apple_code(code: str, redirect_uri: str) -> Optional[Dict[str, Any]]:
    """Exchanges Apple authorization code for user info."""
    if not APPLE_CLIENT_ID:
        return None

    try:
        # Apple sends an id_token directly in the authorization response
        # The code is the id_token in Apple's flow when using response_mode=fragment
        # For server-side, we decode the JWT id_token
        # Apple's public keys for JWT verification
        apple_keys_url = "https://appleid.apple.com/auth/keys"
        keys_res = requests.get(apple_keys_url)
        apple_keys = keys_res.json()

        # Decode the id_token (code contains the id_token for Apple)
        # In production, Apple returns id_token alongside the code
        # We verify the JWT using Apple's public keys
        header = jwt.get_unverified_header(code)
        key = None
        for k in apple_keys.get("keys", []):
            if k["kid"] == header.get("kid"):
                key = jwt.algorithms.RSAAlgorithm.from_jwk(k)
                break

        if not key:
            logger.error("Apple JWT key not found")
            return None

        payload = jwt.decode(
            code,
            key,
            algorithms=["RS256"],
            audience=APPLE_CLIENT_ID,
            issuer="https://appleid.apple.com",
        )

        return {
            "provider": "apple",
            "provider_id": payload["sub"],
            "email": payload.get("email"),
            "full_name": "",  # Apple only sends name on first auth
        }
    except Exception as e:
        logger.error(f"Apple verify error: {e}")
        return None


def verify_x_code(code: str, redirect_uri: str, code_verifier: str = "") -> Optional[Dict[str, Any]]:
    """Exchanges X (Twitter) OAuth 2.0 authorization code for user info."""
    if not X_CLIENT_ID or not X_CLIENT_SECRET:
        return None

    try:
        # Exchange code for access token (OAuth 2.0 with PKCE)
        token_url = "https://api.x.com/2/oauth2/token"
        data = {
            "code": code,
            "grant_type": "authorization_code",
            "client_id": X_CLIENT_ID,
            "redirect_uri": redirect_uri,
            "code_verifier": code_verifier or "challenge",
        }
        res = requests.post(
            token_url,
            data=data,
            auth=(X_CLIENT_ID, X_CLIENT_SECRET),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        token_data = res.json()

        access_token = token_data.get("access_token")
        if not access_token:
            logger.error(f"X token exchange failed: {token_data}")
            return None

        # Get user info
        user_url = "https://api.x.com/2/users/me"
        user_res = requests.get(
            user_url,
            headers={"Authorization": f"Bearer {access_token}"},
            params={"user.fields": "id,name,username"},
        )
        user_data = user_res.json()

        user = user_data.get("data", {})
        if not user.get("id"):
            logger.error(f"X user info failed: {user_data}")
            return None

        return {
            "provider": "x",
            "provider_id": user["id"],
            "email": None,  # X doesn't provide email by default
            "full_name": user.get("name", user.get("username", "")),
        }
    except Exception as e:
        logger.error(f"X verify error: {e}")
        return None
