import os
import re
import requests
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.http import require_GET
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from rest_framework import generics 
from rest_framework.response import Response 
from authentication.serializers import SignupSerializer, LoginSerializer
from authentication.serializers import VerifyEmailSerializer
from authentication.serializers import ResendVerificationSerializer
from .utils import create_internal_token
from rest_framework.permissions import IsAuthenticated 
from authentication.serializers import ChangeEmailUnverifiedSerializer
from rest_framework import status 
from rest_framework_simplejwt.tokens import RefreshToken

import secrets 
import hashlib 
from datetime import timedelta 
from django.utils import timezone 
from django.http import JsonResponse 
from rest_framework.decorators import api_view, permission_classes 
from rest_framework.permissions import IsAuthenticated
import requests
from django.conf import settings


def _frontend_base_url():
    return os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")


def _split_google_name(display_name):
    full_name = (display_name or "").strip()
    if not full_name:
        return "Google", "CustomUser"

    parts = full_name.split(maxsplit=1)
    first_name = parts[0][:30] or "Google"
    last_name = (parts[1] if len(parts) > 1 else "CustomUser")[:30] or "CustomUser"
    return first_name, last_name


def _generate_unique_google_username(CustomUser, email):
    local_part = (email or "").split("@")[0]
    base = re.sub(r"[^a-zA-Z0-9_]", "_", local_part).strip("_").lower() or "google_user"
    base = base[:30]
    if len(base) < 3:
        base = f"{base}user"[:30]

    candidate = base
    counter = 1
    while CustomUser.objects.filter(username__iexact=candidate).exists():
        suffix = f"_{counter}"
        stem = base[: 30 - len(suffix)] or "usr"
        candidate = f"{stem}{suffix}"
        counter += 1
    return candidate


@require_GET
def google_login(request):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")

    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        "?response_type=code"
        f"&client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
        "&prompt=consent"
    )

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
            "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
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
        except Exception as e:
            print("Error validando id_token:", e)
            return redirect(f"{frontend_base_url}/auth/signin?error=invalid_token")

        email = google_info.get("email")
        if not email:
            return redirect(f"{frontend_base_url}/auth/signin?error=missing_email")

        display_name = google_info.get("name")
        google_sub = google_info.get("sub")

        CustomUser = get_user_model()
        user = CustomUser.objects.filter(email__iexact=email).first()
        if not user:
            first_name, last_name = _split_google_name(display_name)
            username = _generate_unique_google_username(CustomUser, email)
            user = CustomUser.objects.create_user(
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

        token = create_internal_token(user)
        return redirect(f"{frontend_base_url}/auth/callback?token={token}")
    except Exception as e:
        print("Unexpected OAuth error:", e)
        return redirect(f"{_frontend_base_url()}/auth/signin?error=unexpected")

class SignupView(generics.CreateAPIView):
    serializer_class = SignupSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            "token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "email_verified": bool(user.email_verified_at),
            },
            "message": "Cuenta creada. Revisa tu correo para verificarla."
        }, status=status.HTTP_201_CREATED)


class VerifyEmailView(generics.GenericAPIView):
    serializer_class = VerifyEmailSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"detail": "Correo verificado correctamente"})

class ResendVerificationView(generics.GenericAPIView):
    serializer_class = ResendVerificationSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Si la cuenta existe, se ha enviado un nuevo código"})

class ChangeEmailUnverifiedView(generics.GenericAPIView):
    serializer_class = ChangeEmailUnverifiedSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Email actualizado. Revisa tu bandeja para el nuevo código."})
    
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            "token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "email_verified": bool(user.email_verified_at),
            }
        })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_delete_account(request):
    user = request.user
    token = secrets.token_hex(16)

    token_hash = hashlib.sha256(token.encode()).hexdigest()

    user.deletion_token_hash = token_hash
    user.deletion_token_expires_at = timezone.now() + timedelta(minutes=15)
    user.save()

    # 4. Send email with BillionMail
    send_delete_confirmation_email(user.email, token)

    return JsonResponse({"message": "Correo enviado"})

def send_delete_confirmation_email(email, token):
    requests.post(
        "https://api.billionmail.com/send",
        json={
            "to": email,
            "template_id": "template_account_removal_confirmation",
            "variables": {
                "token": token
            }
        },
        headers={
            "Authorization": f"Bearer {settings.BILLIONMAIL_API_KEY}"
        }
    )
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_delete_account(request):
    user = request.user
    token = request.data.get("token")

    if not token:
        return JsonResponse({"error": "Token requerido"}, status=400)

    token_hash = hashlib.sha256(token.encode()).hexdigest()

    if user.deletion_token_hash != token_hash:
        return JsonResponse({"error": "Token inválido"}, status=400)

    if timezone.now() > user.deletion_token_expires_at:
        return JsonResponse({"error": "Token expirado"}, status=400)

    user.delete()

    return JsonResponse({"message": "Cuenta eliminada"})





