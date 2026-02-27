import hashlib
import os
import re
import secrets
from datetime import timedelta

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
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from authentication.serializers import (
    ChangeEmailUnverifiedSerializer,
    LoginSerializer,
    ResendVerificationSerializer,
    SignupSerializer,
    VerifyEmailSerializer,
)
from .utils import create_internal_token


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
        except Exception:
            # print("Error validando id_token:", e)
            return redirect(f"{frontend_base_url}/auth/signin?error=invalid_token")

        email = google_info.get("email")
        if not email:
            return redirect(f"{frontend_base_url}/auth/signin?error=missing_email")

        display_name = google_info.get("name")
        google_sub = google_info.get("sub")

        CustomUser = get_user_model()
        user = CustomUser.objects.filter(email__iexact=email).first()
        is_new_user = False
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
            is_new_user = True

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
                code, otp = create_otp_for_user(user)
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


class SignupView(generics.CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]

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
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"detail": "Correo verificado correctamente"})


class ResendVerificationView(generics.GenericAPIView):
    serializer_class = ResendVerificationSerializer
    permission_classes = [AllowAny]

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
    permission_classes = [AllowAny]

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
            send_delete_confirmation_email(user.email, token, user.name or user.username)
        except Exception:
            # print(f"Failed to send delete confirmation email: {e}")
            return Response(
                {"error": "No se pudo enviar el correo de confirmación"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"message": "Correo enviado"}, status=status.HTTP_200_OK)


def send_delete_confirmation_email(email, token, user_name):
    from users.services.email_service import _send_email

    frontend_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")
    confirm_url = f"{frontend_url}/delete_account/confirm?token={token}"
    keep_url = f"{frontend_url}/profile"

    html = f"""\
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Confirmaci&oacute;n de eliminaci&oacute;n de cuenta - Ordinaly</title>
    <!--[if mso]>
      <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
    <![endif]-->
    <style>
      :root{{--bg:#f6f7f8;--card:#ffffff;--text:#0f172a;--muted:#475569;--line:#e5e7eb;--cta:#316C20;--danger:#B42318;--radius:14px;--footer_bg:#ffffff;--footer_text:#0f172a;--footer_link:#0f172a;--footer_line:#e5e7eb;}}
      html,body{{margin:0;padding:0;background:var(--bg);}}
      img{{border:0;outline:none;text-decoration:none;display:block;max-width:100%;}}
      a{{color:inherit;text-decoration:none;}}
      .preheader{{display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;}}
      .container{{width:100%;background:var(--bg);padding:24px 12px;}}
      .card{{max-width:640px;margin:0 auto;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;}}
      .p{{padding:28px 24px;}}
      .h1{{font:800 24px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--text);margin:0;}}
      .h2{{font:800 16px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--text);margin:0;}}
      .text{{font:400 15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--muted);margin:0;}}
      .divider{{height:1px;background:var(--line);line-height:1px;font-size:1px;}}
      .badge{{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:6px 10px;font:700 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--muted);}}
      .warn{{border:1px solid rgba(180,35,24,0.25);border-radius:12px;padding:12px 14px;background:#fff;font:400 13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--muted);}}
      .warn strong{{color:var(--danger);}}
      .list{{padding-left:18px;margin:10px 0 0;}}
      .list li{{margin:6px 0;color:var(--muted);font:400 15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;}}
      .footer{{background:var(--footer_bg);color:var(--footer_text);padding:30px 24px;text-align:center;font:400 14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;border-top:1px solid var(--footer_line);}}
      .footer a{{color:var(--footer_link);text-decoration:underline;margin:0 5px;}}
      .social-row{{margin-top:14px;}}
      .social-cell{{width:44px;height:44px;border-radius:999px;background:var(--cta);}}
      .social-link{{display:block;width:44px;height:44px;line-height:44px;text-align:center;}}
      .social-svg{{width:20px;height:20px;vertical-align:middle;margin-top:12px;}}
      @media (max-width:520px){{.p{{padding:22px 16px;}}.h1{{font-size:22px;}}}}
    </style>
  </head>
  <body>
    <div class="preheader">Confirma la eliminaci&oacute;n de tu cuenta de Ordinaly. Esta acci&oacute;n puede ser irreversible.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="container">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="card">
          <!-- HEADER -->
          <tr><td class="p" style="padding-bottom:18px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td align="left" style="vertical-align:middle;">
                  <a href="https://ordinaly.ai" target="_blank" rel="noopener noreferrer">
                    <img src="https://ordinaly.ai/logo.webp" alt="Ordinaly" height="34" style="height:34px;width:auto;" />
                  </a>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span class="badge">Eliminaci&oacute;n de cuenta</span>
                </td>
              </tr>
            </table>
            <div style="height:16px;"></div>
            <h1 class="h1">Confirmaci&oacute;n de eliminaci&oacute;n de cuenta</h1>
            <p class="text" style="margin-top:8px;">
              Hola {user_name}, hemos recibido una solicitud para eliminar tu cuenta de Ordinaly.
            </p>
          </td></tr>
          <tr><td class="divider"></td></tr>
          <!-- BODY -->
          <tr><td class="p">
            <div class="warn">
              <strong>Importante:</strong> al confirmar, perder&aacute;s el acceso y se eliminar&aacute;n tus datos asociados a la cuenta.
            </div>
            <div style="height:16px;"></div>
            <h2 class="h2">Qu&eacute; conlleva eliminar tu cuenta</h2>
            <ul class="list">
              <li>Eliminaci&oacute;n de tus datos de perfil y preferencias.</li>
              <li>P&eacute;rdida del historial de cursos, progreso y certificados asociados (si aplica).</li>
              <li>Baja autom&aacute;tica de la newsletter y comunicaciones de Ordinaly.</li>
              <li>Eliminaci&oacute;n o desactivaci&oacute;n de automatizaciones y configuraciones guardadas.</li>
              <li>P&eacute;rdida de acceso a contenidos y formaci&oacute;n relacionada con IA y automatizaci&oacute;n vinculada a tu cuenta.</li>
            </ul>
            <div style="height:18px;"></div>
            <!-- ACTIONS -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr><td align="center" style="padding:0 0 10px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr><td align="center" bgcolor="#B42318" style="border-radius:10px;">
                    <a href="{confirm_url}" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;padding:12px 18px;font:800 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;border-radius:10px;">
                      Confirmar eliminaci&oacute;n
                    </a>
                  </td></tr>
                </table>
              </td></tr>
              <tr><td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr><td align="center" bgcolor="#ffffff" style="border-radius:10px;border:1px solid #e5e7eb;">
                    <a href="{keep_url}" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;padding:12px 18px;font:800 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,Helvetica,sans-serif;color:#0f172a;text-decoration:none;border-radius:10px;">
                      Mantener mi cuenta
                    </a>
                  </td></tr>
                </table>
              </td></tr>
            </table>
            <div style="height:16px;"></div>
            <p class="text" style="font-size:13px;">
              Si t&uacute; no has solicitado esto, entra en tu cuenta y cambia la contrase&ntilde;a.
              Si necesitas ayuda, escribe a <a href="mailto:info@ordinaly.ai" style="text-decoration:underline;">info@ordinaly.ai</a>.
            </p>
            <div style="height:18px;"></div>
            <h2 class="h2">El equipo de Ordinaly te echar&aacute; de menos</h2>
            <p class="text" style="margin-top:6px;">
              Todav&iacute;a est&aacute;s a tiempo de seguir aprovechando los servicios de automatizaci&oacute;n e IA, nuestra formaci&oacute;n profesional y estar a la &uacute;ltima en IA y tecnolog&iacute;a a nivel empresarial.
            </p>
            <div style="height:10px;"></div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
              <tr>
                <td width="33.33%" align="center" valign="top">
                  <a href="https://ordinaly.ai/contact" target="_blank" rel="noopener noreferrer">
                    <img src="https://ordinaly.ai/static/main_service_home_ilustration.webp" alt="" style="width:100%;height:auto;display:block;" />
                  </a>
                </td>
                <td style="width:2px;background:#e5e7eb;"></td>
                <td width="33.33%" align="center" valign="top">
                  <a href="https://ordinaly.ai/formation" target="_blank" rel="noopener noreferrer">
                    <img src="https://ordinaly.ai/static/backgrounds/formation_background.webp" alt="" style="width:100%;height:auto;display:block;" />
                  </a>
                </td>
                <td style="width:2px;background:#e5e7eb;"></td>
                <td width="33.33%" align="center" valign="top">
                  <a href="https://ordinaly.ai/services" target="_blank" rel="noopener noreferrer">
                    <img src="https://ordinaly.ai/static/about/story_01.webp" alt="" style="width:100%;height:auto;display:block;" />
                  </a>
                </td>
              </tr>
            </table>
          </td></tr>
          <!-- FOOTER -->
          <tr><td class="footer">
            <p style="margin:0;font-weight:700;">ORDINALY SOFTWARE</p>
            <p style="margin:8px 0 0;">Automatizaci&oacute;n empresarial e IA desde Sevilla para el mundo</p>
            <p style="margin:14px 0 0;">
              <a href="https://ordinaly.ai" target="_blank" rel="noopener noreferrer">Sitio web</a> |
              <a href="https://ordinaly.ai/contact" target="_blank" rel="noopener noreferrer">Contacto</a> |
              <a href="https://ordinaly.ai/blog" target="_blank" rel="noopener noreferrer">Blog</a>
            </p>
            <p style="margin:14px 0 0;">&copy; 2026 Ordinaly Software. Todos los derechos reservados.</p>
            <p style="margin:10px 0 0;">
              <a href="mailto:info@ordinaly.ai">info@ordinaly.ai</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>"""

    _send_email(email, html, subject="Confirmar eliminación de cuenta - Ordinaly")


class ConfirmDeleteAccountView(APIView):
    permission_classes = [AllowAny]
    http_method_names = ["post", "options"]

    def post(self, request):
        token = request.data.get("token")

        if not token:
            return Response({"error": "Token requerido"}, status=status.HTTP_400_BAD_REQUEST)

        token_hash = hashlib.sha256(token.encode()).hexdigest()

        CustomUser = get_user_model()
        user = CustomUser.objects.filter(deletion_token_hash=token_hash).first()

        if not user:
            return Response({"error": "Token inválido"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.deletion_token_expires_at or timezone.now() > user.deletion_token_expires_at:
            return Response({"error": "Token expirado"}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        return Response({"message": "Cuenta eliminada"}, status=status.HTTP_200_OK)


request_delete_account = RequestDeleteAccountView.as_view()
confirm_delete_account = ConfirmDeleteAccountView.as_view()


class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]
    http_method_names = ["post", "options"]

    def post(self, request):
        email = request.data.get("email")
        generic_msg = "Si la cuenta existe, se ha enviado un correo"

        if not email:
            return Response({"message": generic_msg}, status=status.HTTP_200_OK)

        CustomUser = get_user_model()
        user = CustomUser.objects.filter(email__iexact=email).first()

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
                {"error": "Token y nueva contraseña son requeridos"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {"error": "La contraseña debe tener al menos 8 caracteres"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_hash = hashlib.sha256(token.encode()).hexdigest()
        CustomUser = get_user_model()
        user = CustomUser.objects.filter(password_reset_token_hash=token_hash).first()

        if not user:
            return Response({"error": "Token inválido"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.password_reset_token_expires_at or timezone.now() > user.password_reset_token_expires_at:
            return Response({"error": "Token expirado"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.password_reset_token_hash = None
        user.password_reset_token_expires_at = None
        user.save(update_fields=["password", "password_reset_token_hash", "password_reset_token_expires_at"])

        return Response({"message": "Contraseña actualizada correctamente"}, status=status.HTTP_200_OK)


request_password_reset = RequestPasswordResetView.as_view()
confirm_password_reset = ConfirmPasswordResetView.as_view()
