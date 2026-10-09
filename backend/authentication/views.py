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
from .utils import create_internal_token


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


@require_GET
def google_login(request):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = _google_redirect_uri()

    query = urlencode(
        {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
        }
    )
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{query}"

    return redirect(url)


@require_GET
def google_callback(request):
    try:
        frontend_base_url = _frontend_base_url()
        code = request.GET.get("code")

        if "error" in request.GET:
            return redirect(f"{frontend_base_url}/auth/signin?error=cancelled")

        if not code:
            return JsonResponse({"error": "Missing code"}, status=400)

        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "redirect_uri": _google_redirect_uri(),
            "grant_type": "authorization_code",
        }

        token_response = requests.post(token_url, data=data).json()

        if "id_token" not in token_response:
            return JsonResponse({"error": "Token exchange failed", "details": token_response}, status=400)

        id_token_google = token_response["id_token"]

        try:
            google_info = id_token.verify_oauth2_token(
                id_token_google,
                google_requests.Request(),
                os.getenv("GOOGLE_CLIENT_ID")
            )
        except Exception:
            # print("Error validando id_token:", e)
            return redirect(f"{frontend_base_url}/auth/signin?error=invalid_token")

        email = google_info.get("email")
        if not email:
            return redirect(f"{frontend_base_url}/auth/signin?error=missing_email")

        display_name = google_info.get("name")
        google_sub = google_info.get("sub")

        user_model = get_user_model()
        user = user_model.objects.filter(email__iexact=email).first()
        if not user:
            first_name, last_name = _split_google_name(display_name)
            username = _generate_unique_google_username(user_model, email)
            user = user_model.objects.create_user(
                email=email,
                username=username,
                name=first_name,
                surname=last_name,
                company="",
            )

        if user.google_sub and user.google_sub != google_sub:
            return redirect(f"{frontend_base_url}/auth/signin?error=account_conflict")

        if not user.google_sub:
            user.google_sub = google_sub
            user.save(update_fields=["google_sub"])

        # Send verification email for new or unverified users
        if not user.email_verified_at:
            try:
                from users.services.otp_service import create_otp_for_user
                from users.services.email_service import send_verification_email
                code, _ = create_otp_for_user(user)
                send_verification_email(user.email, code)
            except Exception:
                # print(f"Failed to send verification email for Google OAuth user: {e}")
                pass

        token = create_internal_token(user)
        email_verified = "true" if user.email_verified_at else "false"
        return redirect(f"{frontend_base_url}/auth/callback?token={token}&email_verified={email_verified}&email={email}")
    except Exception:
        # print("Unexpected OAuth error:", e)
        return redirect(f"{_frontend_base_url()}/auth/signin?error=unexpected")


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
                send_password_reset_email(user.email, token, user.name or user.username)
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
