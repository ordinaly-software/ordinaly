"""
Helper to validate Google reCAPTCHA tokens.
"""

from typing import Optional
import os

import requests

RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")
RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"


def verify_recaptcha_token(token: Optional[str]) -> bool:
    """Verify the token against Google only when a secret key exists."""
    if not RECAPTCHA_SECRET_KEY:
        return True
    if not token:
        return False

    try:
        response = requests.post(
            RECAPTCHA_VERIFY_URL,
            data={"secret": RECAPTCHA_SECRET_KEY, "response": token},
            timeout=5,
        )
        response.raise_for_status()
        payload = response.json()
        return bool(payload.get("success"))
    except requests.RequestException:
        return False
