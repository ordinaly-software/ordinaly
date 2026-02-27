from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.services.otp_service import create_otp_for_user
from users.services.email_service import send_verification_email
from django.utils import timezone 
from users.services.otp_service import validate_otp 
from users.services.email_service import send_welcome_email
from users.models import EmailVerificationOTP 
from django.conf import settings
from django.contrib.auth import authenticate


User = get_user_model()


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

        # search user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Código inválido")

        if user.email_verified_at:
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

        user.email_verified_at = timezone.now()
        user.status = "active"
        user.save()
        send_welcome_email(user.email, user.name or user.username)

        return data


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, data):
        email = data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Si la cuenta existe, se enviará un nuevo código")

        if user.email_verified_at:
            raise serializers.ValidationError("La cuenta ya está verificada")
        
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
        email = self.validated_data["email"]
        user = User.objects.get(email=email)

        code, otp = create_otp_for_user(user)
        send_verification_email(user.email, code)

        return user


class ChangeEmailUnverifiedSerializer(serializers.Serializer):
    new_email = serializers.EmailField()

    def validate_new_email(self, value):
        if User.objects.filter(email=value).exists():
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
