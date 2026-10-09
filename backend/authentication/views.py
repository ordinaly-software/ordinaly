import hashlib
import os
import re
import secrets
from datetime import timedelta
from urllib.parse import urlencode, urlparse, urlunparse

import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.shortcuts import redirect
from django.utils import timezone
from django.views.decorators.http import require_GET
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.serializers import (
    ChangeEmailUnverifiedSerializer,
    LoginSerializer,
    ResendVerificationSerializer,
    SignupSerializer,
    VerifyEmailSerializer,
)
from users.services.notification_service import queue_and_dispatch_password_reset_completed_notification
from .utils import (
    create_internal_token,
    make_google_link_state,
    mark_email_verified,
    read_google_link_state,
)


def _frontend_base_url():
    return os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")


def _is_local_url(value):
    parsed = urlparse((value or "").strip())
    hostname = (parsed.hostname or "").lower()
    return hostname in {"localhost", "127.0.0.1"}


def _enforce_https_for_public_url(value):
    parsed = urlparse((value or "").strip())
    if not parsed.scheme or not parsed.netloc:
        return value

    if settings.DEBUG or _is_local_url(value):
        return value

    if parsed.scheme == "http":
        return urlunparse(parsed._replace(scheme="https"))

    return value


def _google_redirect_uri():
    redirect_uri = (os.getenv("GOOGLE_REDIRECT_URI") or "").strip()
    if redirect_uri and (settings.DEBUG or not _is_local_url(redirect_uri)):
        return _enforce_https_for_public_url(redirect_uri)

    backend_base_url = (os.getenv("BACKEND_BASE_URL") or "").strip().rstrip("/")
    if backend_base_url:
        secure_backend_base_url = _enforce_https_for_public_url(backend_base_url).rstrip("/")
        return f"{secure_backend_base_url}/auth/google/callback/"

    return "http://localhost:8000/auth/google/callback/"


def _split_google_name(display_name):
    full_name = (display_name or "").strip()
    if not full_name:
        return "Google", "CustomUser"

    parts = full_name.split(maxsplit=1)
    first_name = parts[0][:30] or "Google"
    last_name = (parts[1] if len(parts) > 1 else "CustomUser")[:30] or "CustomUser"
    return first_name, last_name


def _generate_unique_google_username(user_model, email):
    local_part = (email or "").split("@")[0]
    base = re.sub(r"\W", "_", local_part, flags=re.ASCII).strip("_").lower() or "google_user"
    base = base[:30]
    if len(base) < 3:
        base = f"{base}user"[:30]

    candidate = base
    counter = 1
    while user_model.objects.filter(username__iexact=candidate).exists():
        suffix = f"_{counter}"
        stem = base[: 30 - len(suffix)] or "usr"
        candidate = f"{stem}{suffix}"
        counter += 1
    return candidate


def _google_authorize_url(state=None):
    params = {
        "response_type": "code",
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "redirect_uri": _google_redirect_uri(),
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    if state:
        params["state"] = state
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"


class GoogleAuthError(Exception):
    """A failure while talking to Google; `code` is what the frontend gets to show."""

    def __init__(self, code):
        super().__init__(code)
        self.code = code


def _fetch_google_profile(code):
    """Exchange the authorization code and return Google's verified id_token claims."""
    token_response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "redirect_uri": _google_redirect_uri(),
            "grant_type": "authorization_code",
        },
    ).json()

    if "id_token" not in token_response:
        raise GoogleAuthError("unexpected")

    try:
        info = id_token.verify_oauth2_token(
            token_response["id_token"], google_requests.Request(), os.getenv("GOOGLE_CLIENT_ID")
        )
    except Exception:
        raise GoogleAuthError("invalid_token")

    if not info.get("email"):
        raise GoogleAuthError("missing_email")
    # Only trust an address Google itself has verified.
    if not info.get("email_verified"):
        raise GoogleAuthError("email_not_verified")
    return info


def _auth_error_redirect(code):
    return redirect(f"{_frontend_base_url()}/auth/callback?error={code}")


def _profile_redirect(**params):
    return redirect(f"{_frontend_base_url()}/profile?{urlencode(params)}")


@require_GET
def google_login(request):
    return redirect(_google_authorize_url())


class GoogleLinkStartView(APIView):
    """Authenticated users start "connect Google" here; the frontend then redirects to the returned URL."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.google_sub:
            return Response({"error": "Google is already connected"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"url": _google_authorize_url(state=make_google_link_state(request.user))})


class GoogleUnlinkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.google_sub:
            return Response({"error": "Google is not connected"}, status=status.HTTP_400_BAD_REQUEST)
        # Without a password, Google is the only way in: disconnecting would lock the account.
        if not user.has_usable_password():
            return Response({"error": "Set a password before disconnecting Google"}, status=status.HTTP_400_BAD_REQUEST)
        user.google_sub = None
        user.save(update_fields=["google_sub"])
        return Response({"message": "Google disconnected"})


def _google_link_callback(code, state):
    """Attach the Google account to the signed-in user that started the flow."""
    user_model = get_user_model()
    user = user_model.objects.filter(pk=read_google_link_state(state)).first()
    if not user:
        return _profile_redirect(google_error="invalid_state")

    try:
        info = _fetch_google_profile(code)
    except GoogleAuthError as exc:
        return _profile_redirect(google_error=exc.code)

    sub = info["sub"]
    if user_model.objects.filter(google_sub=sub).exclude(pk=user.pk).exists():
        return _profile_redirect(google_error="already_linked")
    if user.google_sub and user.google_sub != sub:
        return _profile_redirect(google_error="already_has_google")

    user.google_sub = sub
    user.save(update_fields=["google_sub"])
    if not user.email_verified_at and (info["email"] or "").lower() == (user.email or "").lower():
        mark_email_verified(user)
    return _profile_redirect(google="linked")


@require_GET
def google_callback(request):
    try:
        code = request.GET.get("code")
        state = request.GET.get("state")

        if "error" in request.GET:
            if state:
                return _profile_redirect(google_error="cancelled")
            return _auth_error_redirect("cancelled")

        if not code:
            return JsonResponse({"error": "Missing code"}, status=400)

        if state:
            return _google_link_callback(code, state)

        try:
            google_info = _fetch_google_profile(code)
        except GoogleAuthError as exc:
            return _auth_error_redirect(exc.code)

        email = google_info["email"]
        google_sub = google_info.get("sub")
        user_model = get_user_model()

        user = user_model.objects.filter(google_sub=google_sub).first()
        if user is None:
            existing = user_model.objects.filter(email__iexact=email).first()
            if existing is not None:
                # Never attach Google to an existing account just because the emails match: whoever
                # registered it first may not be the owner. The owner signs in with their password and
                # connects Google from their profile.
                return _auth_error_redirect("account_conflict" if existing.google_sub else "account_exists")

            first_name, last_name = _split_google_name(google_info.get("name"))
            user = user_model.objects.create_user(
                email=email,
                username=_generate_unique_google_username(user_model, email),
                name=first_name,
                surname=last_name,
                company="",
                google_sub=google_sub,
            )
            mark_email_verified(user)
        elif not user.email_verified_at and email.lower() == (user.email or "").lower():
            mark_email_verified(user)

        token = create_internal_token(user)
        email_verified = "true" if user.email_verified_at else "false"
        return redirect(f"{_frontend_base_url()}/auth/callback?token={token}&email_verified={email_verified}&email={user.email}")
    except Exception:
        return _auth_error_redirect("unexpected")


class VerifyEmailView(generics.GenericAPIView):
    serializer_class = VerifyEmailSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"detail": "Email verified successfully"})


class SignupView(generics.GenericAPIView):
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "token": token.key,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "email_verified": bool(user.email_verified_at),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "token": token.key,
                "email_verified": bool(user.email_verified_at),
                "user": {
                    "id": user.id,
                    "email": user.email,
                },
            },
            status=status.HTTP_200_OK,
        )


class ResendVerificationView(generics.GenericAPIView):
    serializer_class = ResendVerificationSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "If the account exists, a new code has been sent"})


class ChangeEmailUnverifiedView(generics.GenericAPIView):
    serializer_class = ChangeEmailUnverifiedSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Email updated. Check your inbox for the new code."})


class RequestDeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ["post", "options"]

    def post(self, request):
        user = request.user
        token = secrets.token_hex(16)
        token_hash = hashlib.sha256(token.encode()).hexdigest()

        user.deletion_token_hash = token_hash
        user.deletion_token_expires_at = timezone.now() + timedelta(minutes=15)
        user.save(update_fields=["deletion_token_hash", "deletion_token_expires_at"])

        try:
            from users.services.email_service import send_delete_confirmation_email

            send_delete_confirmation_email(user.email, token, user.name or user.username)
        except Exception:
            # print(f"Failed to send delete confirmation email: {e}")
            return Response(
                {"error": "Could not send the confirmation email"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"message": "Email sent"}, status=status.HTTP_200_OK)


class ConfirmDeleteAccountView(APIView):
    permission_classes = [AllowAny]
    http_method_names = ["post", "options"]

    def post(self, request):
        token = request.data.get("token")

        if not token:
            return Response({"error": "Token required"}, status=status.HTTP_400_BAD_REQUEST)

        token_hash = hashlib.sha256(token.encode()).hexdigest()

        user_model = get_user_model()
        user = user_model.objects.filter(deletion_token_hash=token_hash).first()

        if not user:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.deletion_token_expires_at or timezone.now() > user.deletion_token_expires_at:
            return Response({"error": "Token expired"}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        return Response({"message": "Account deleted"}, status=status.HTTP_200_OK)


request_delete_account = RequestDeleteAccountView.as_view()
confirm_delete_account = ConfirmDeleteAccountView.as_view()


class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]
    http_method_names = ["post", "options"]

    def post(self, request):
        email = request.data.get("email")
        generic_msg = "If the account exists, an email has been sent"

        if not email:
            return Response({"message": generic_msg}, status=status.HTTP_200_OK)

        user_model = get_user_model()
        user = user_model.objects.filter(email__iexact=email).first()

        if user:
            token = secrets.token_hex(16)
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            user.password_reset_token_hash = token_hash
            user.password_reset_token_expires_at = timezone.now() + timedelta(minutes=15)
            user.save(update_fields=["password_reset_token_hash", "password_reset_token_expires_at"])

            from users.services.email_service import send_password_reset_email
            try:
                send_password_reset_email(
                    user.email, token, user.name or user.username, creating=not user.has_usable_password()
                )
            except Exception:
                # print(f"Failed to send password reset email: {e}")
                pass

        return Response({"message": generic_msg}, status=status.HTTP_200_OK)


class ConfirmPasswordResetView(APIView):
    permission_classes = [AllowAny]
    http_method_names = ["post", "options"]

    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not token or not new_password:
            return Response(
                {"error": "Token and new password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters long"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_hash = hashlib.sha256(token.encode()).hexdigest()
        user_model = get_user_model()
        user = user_model.objects.filter(password_reset_token_hash=token_hash).first()

        if not user:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.password_reset_token_expires_at or timezone.now() > user.password_reset_token_expires_at:
            return Response({"error": "Token expired"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.password_reset_token_hash = ""
        user.password_reset_token_expires_at = None
        user.save(update_fields=["password", "password_reset_token_hash", "password_reset_token_expires_at"])
        try:
            queue_and_dispatch_password_reset_completed_notification(user)
        except Exception:
            pass

        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)


request_password_reset = RequestPasswordResetView.as_view()
confirm_password_reset = ConfirmPasswordResetView.as_view()
