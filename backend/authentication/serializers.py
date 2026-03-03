from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Q
from users.services.otp_service import create_otp_for_user
from users.services.email_service import send_verification_email
from django.utils import timezone 
from users.services.otp_service import validate_otp 
from users.services.notification_service import (
    queue_and_dispatch_account_created_notification,
    queue_and_dispatch_email_updated_notification,
)
from users.models import EmailVerificationOTP 
from django.conf import settings
from django.contrib.auth import authenticate


User = get_user_model()


def _find_user_for_verification_email(email: str):
    normalized_email = (email or "").strip()
    if not normalized_email:
        return None, False

    user = User.objects.filter(
        Q(pending_email__iexact=normalized_email) | Q(email__iexact=normalized_email)
    ).order_by("id").first()
    if not user:
        return None, False

    is_pending_email = bool(
        user.pending_email and user.pending_email.strip().lower() == normalized_email.lower()
    )
    return user, is_pending_email


def _email_is_in_use(email: str, *, exclude_user=None) -> bool:
    normalized_email = (email or "").strip()
    if not normalized_email:
        return False

    queryset = User.objects.all()
    if exclude_user:
        queryset = queryset.exclude(pk=exclude_user.pk)

    return queryset.filter(
        Q(email__iexact=normalized_email) | Q(pending_email__iexact=normalized_email)
    ).exists()


class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "password"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        email = validated_data["email"]
        base_username = email.split("@")[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            email=email,
            username=username,
            password=validated_data["password"],
            status="pending_verification",
            email_verified_at=None
        )

        code, otp = create_otp_for_user(user)
        send_verification_email(user.email, code)

        return user


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data["email"]
        code = data["code"]

        user, is_pending_email_verification = _find_user_for_verification_email(email)
        if not user:
            raise serializers.ValidationError("Código inválido")

        if user.email_verified_at and not is_pending_email_verification:
            raise serializers.ValidationError("La cuenta ya está verificada")

        success, reason = validate_otp(user, code)

        if not success:
            if reason == "EXPIRED":
                raise serializers.ValidationError("El código ha expirado")
            if reason == "INVALID":
                raise serializers.ValidationError("Código incorrecto")
            if reason == "TOO_MANY_ATTEMPTS":
                raise serializers.ValidationError("Demasiados intentos")
            raise serializers.ValidationError("Código inválido")

        if is_pending_email_verification:
            target_email = (user.pending_email or "").strip()
            if not target_email:
                raise serializers.ValidationError("Código inválido")
            if _email_is_in_use(target_email, exclude_user=user):
                raise serializers.ValidationError({"email": "Este email ya está en uso"})

            previous_email = user.email
            user.email = target_email
            user.pending_email = None
            user.email_verified_at = timezone.now()
            user.status = "active"
            user.save(update_fields=["email", "pending_email", "email_verified_at", "status"])
            try:
                queue_and_dispatch_email_updated_notification(user, previous_email)
            except Exception:
                pass
        else:
            user.email_verified_at = timezone.now()
            user.status = "active"
            user.save(update_fields=["email_verified_at", "status"])
            try:
                queue_and_dispatch_account_created_notification(user)
            except Exception:
                pass

        return data


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, data):
        email = data["email"]

        user, is_pending_email_verification = _find_user_for_verification_email(email)
        if not user:
            raise serializers.ValidationError("Si la cuenta existe, se enviará un nuevo código")

        if user.email_verified_at and not is_pending_email_verification:
            raise serializers.ValidationError("La cuenta ya está verificada")

        self.user = user
        self.target_email = (user.pending_email if is_pending_email_verification else user.email) or email
        
        otp = EmailVerificationOTP.objects.filter(
            user=user,
            invalidated_at__isnull=True
        ).order_by("-created_at").first()

        if otp:
            elapsed = (timezone.now() - otp.last_sent_at).total_seconds()
            if elapsed < settings.EMAIL_OTP_RESEND_COOLDOWN_SECONDS:
                remaining = int(settings.EMAIL_OTP_RESEND_COOLDOWN_SECONDS - elapsed)
                raise serializers.ValidationError(f"Debes esperar {remaining} segundos para reenviar el código")

        return data

    def save(self):
        user = self.user

        code, otp = create_otp_for_user(user)
        send_verification_email(self.target_email, code)

        return user


class ChangeEmailUnverifiedSerializer(serializers.Serializer):
    new_email = serializers.EmailField()

    def validate_new_email(self, value):
        if _email_is_in_use(value):
            raise serializers.ValidationError("Este email ya está en uso")
        return value

    def validate(self, data):
        user = self.context["request"].user

        if user.email_verified_at:
            raise serializers.ValidationError("La cuenta ya está verificada")

        return data

    def save(self):
        user = self.context["request"].user
        new_email = self.validated_data["new_email"]

        user.email = new_email
        user.save()

        EmailVerificationOTP.objects.filter(
            user=user,
            invalidated_at__isnull=True
        ).update(invalidated_at=timezone.now())

        code, otp = create_otp_for_user(user)
        send_verification_email(new_email, code)

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email y contraseña son obligatorios")

        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError("Credenciales inválidas")

        attrs["user"] = user
        return attrs
