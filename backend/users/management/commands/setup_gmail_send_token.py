"""One-off command to obtain GMAIL_API_REFRESH_TOKEN (see config/email_backends.py).

Run it once on your local machine (it opens a browser to sign in with the
sender account):

    cd backend && python manage.py setup_gmail_send_token

Prerequisite: add "http://localhost:8090/" as an authorized redirect URI of the
OAuth client (GOOGLE_CLIENT_ID) in https://console.cloud.google.com/apis/credentials
and enable the Gmail API for the project. Copy the printed token into
GMAIL_API_REFRESH_TOKEN in the production .env.
"""

import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlencode, urlparse

import requests
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

REDIRECT_URI = "http://localhost:8090/"
SCOPE = "https://www.googleapis.com/auth/gmail.send"
AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"


class _CallbackHandler(BaseHTTPRequestHandler):
    captured_code = None

    def do_GET(self):
        params = parse_qs(urlparse(self.path).query)
        _CallbackHandler.captured_code = params.get("code", [None])[0]
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"<h1>You can close this tab now.</h1>")

    def log_message(self, format, *args):
        pass


class Command(BaseCommand):
    help = "Obtain GMAIL_API_REFRESH_TOKEN through an interactive OAuth flow (once)."

    def handle(self, *args, **options):
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            raise CommandError("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are missing in .env.")

        url = f"{AUTHORIZATION_URL}?" + urlencode({
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": REDIRECT_URI,
            "response_type": "code",
            "scope": SCOPE,
            "access_type": "offline",
            "prompt": "consent",
        })
        self.stdout.write(f"Opening the browser to grant consent...\n{url}")
        webbrowser.open(url)

        server = HTTPServer(("localhost", 8090), _CallbackHandler)
        self.stdout.write("Waiting for the redirect on http://localhost:8090/ ...")
        server.handle_request()

        code = _CallbackHandler.captured_code
        if not code:
            raise CommandError("No authorization code received.")

        response = requests.post(
            TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
        response.raise_for_status()
        refresh_token = response.json().get("refresh_token")
        if not refresh_token:
            raise CommandError(
                "Google returned no refresh_token. Revoke the app at "
                "https://myaccount.google.com/permissions and try again."
            )

        self.stdout.write(self.style.SUCCESS("\nDone. Put this line in the production .env:\n"))
        self.stdout.write(f"GMAIL_API_REFRESH_TOKEN={refresh_token}")
