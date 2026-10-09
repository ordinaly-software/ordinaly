"""Django email backend that sends through the Gmail API (HTTPS + OAuth2).

Google blocks SMTP AUTH with username/password from datacenter IPs (VPS), so
production can't use the SMTP backend with a Gmail/Workspace account. Enable
with:

    EMAIL_BACKEND=config.email_backends.GmailApiEmailBackend
    GMAIL_API_REFRESH_TOKEN=...   # from `python manage.py setup_gmail_send_token`

It reuses GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (the Google login client).
"""

import base64

import requests
from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

TOKEN_URL = "https://oauth2.googleapis.com/token"
SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
REQUEST_TIMEOUT_SECONDS = 10


def refresh_access_token(refresh_token: str) -> str:
    response = requests.post(
        TOKEN_URL,
        data={
            "refresh_token": refresh_token,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "grant_type": "refresh_token",
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def send_raw_message(access_token: str, raw_message_b64url: str) -> None:
    response = requests.post(
        SEND_URL,
        headers={"Authorization": f"Bearer {access_token}"},
        json={"raw": raw_message_b64url},
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()


class GmailApiEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        try:
            access_token = refresh_access_token(settings.GMAIL_API_REFRESH_TOKEN)
        except Exception:
            if self.fail_silently:
                return 0
            raise

        sent = 0
        for message in email_messages:
            raw = base64.urlsafe_b64encode(message.message().as_bytes()).decode("ascii")
            try:
                send_raw_message(access_token, raw)
            except Exception:
                if not self.fail_silently:
                    raise
                continue
            sent += 1
        return sent
