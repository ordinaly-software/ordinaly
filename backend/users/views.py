import logging

from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from django.contrib.auth import authenticate
from django.db import IntegrityError
from django.db.models import Q
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from .models import CustomUser
from .serializers import CustomUserSerializer
from .services.otp_service import create_otp_for_user
from .services.email_service import send_verification_email
from .services.notification_service import queue_and_dispatch_email_updated_notification

logger = logging.getLogger(__name__)


class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    authentication_classes = [TokenAuthentication]

    def _validated_verified_email_change(self, user, raw_email):
        requested_email = (raw_email or "").strip()
        if not requested_email:
            return None

        current_email = (user.email or "").strip().lower()
        if requested_email.lower() == current_email:
            return None

        if CustomUser.objects.exclude(pk=user.pk).filter(
            Q(email__iexact=requested_email) | Q(pending_email__iexact=requested_email)
        ).exists():
            raise ValidationError({"email": ["email_taken"]})

        return requested_email

    def _start_verified_email_change(self, user, requested_email):
        if user.pending_email and user.pending_email.strip().lower() == requested_email.lower():
            return user.pending_email

        previous_pending_email = user.pending_email
        user.pending_email = requested_email
        user.save(update_fields=["pending_email"])

        try:
            code, _ = create_otp_for_user(user)
            send_verification_email(requested_email, code)
        except Exception:
            user.pending_email = previous_pending_email
            user.save(update_fields=["pending_email"])
            raise

        return requested_email

    def _update_response_payload(self, serializer, *, pending_email=None):
        response_data = dict(serializer.data)
        if pending_email:
            response_data["pending_email"] = pending_email
            response_data["email_change_requires_verification"] = True
            response_data["detail"] = "Verification code sent to the new email address."
        return response_data

    def get_permissions(self):
        if self.action in ['signup', 'signin']:
            permission_classes = [AllowAny]
            if self.request.user.is_authenticated:
                permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def signup(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return Response({'detail': 'You are already signed in.'}, status=status.HTTP_400_BAD_REQUEST)

        data = dict(request.data)
        data.pop("recaptchaToken", None)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        try:
            user = serializer.save()
        except (IntegrityError, DjangoValidationError) as exc:
            response = self._handle_duplicate_error(exc)
            if response:
                return response
            return Response({'detail': 'An unexpected error occurred. Please try again.'},
                        status=status.HTTP_400_BAD_REQUEST)

        # Create OTP and send verification email
        try:
            code, otp = create_otp_for_user(user)
            send_verification_email(user.email, code)
        except Exception:
            logger.exception("Failed to send verification email for user %s", user.email)

        token, created = Token.objects.get_or_create(user=user)
        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        response_data['token'] = token.key
        response_data['email_verified'] = False
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    def _handle_duplicate_error(self, exc):
        response_data = {}
        if isinstance(exc, DjangoValidationError):
            message_dict = getattr(exc, "message_dict", {})
            if "email" in message_dict:
                response_data["email"] = ["email_taken"]
            if "username" in message_dict:
                response_data["username"] = ["username_taken"]
            all_messages = message_dict.get("__all__")
            if all_messages:
                combined = " ".join(all_messages).lower()
            else:
                combined = ""
        else:
            combined = str(exc).lower()

        if (
            "unique_email_ci" in combined
            or "custom user with this email" in combined
            or "email_taken" in combined
        ):
            response_data.setdefault("email", ["email_taken"])
        if (
            "unique_username_ci" in combined
            or "custom user with this username" in combined
            or "username_taken" in combined
        ):
            response_data.setdefault("username", ["username_taken"])

        if response_data:
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        return None

    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated])
    def update_user(self, request, pk=None):
        user = self.get_object()
        if request.user != user and not request.user.is_staff and not request.user.is_superuser:
            return Response(
                {'detail': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if 'password' in request.data:
            old_password = request.data.get('oldPassword')
            if not user.check_password(old_password):
                return Response({'oldPassword': 'Wrong password.'}, status=status.HTTP_400_BAD_REQUEST)
        previous_email = user.email
        pending_email = None
        update_data = request.data.copy()
        raw_email = update_data.get("email")
        if user.email_verified_at:
            try:
                pending_email = self._validated_verified_email_change(user, raw_email)
            except ValidationError as exc:
                return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
            if pending_email:
                update_data.pop("email", None)
        serializer = self.get_serializer(user, data=update_data, partial=True)
        serializer.is_valid(raise_exception=True)
        if pending_email:
            try:
                self._start_verified_email_change(user, pending_email)
            except Exception:
                logger.exception("Failed to send verification email for pending email change on user %s", user.pk)
                return Response(
                    {"email": ["No se pudo enviar el correo de verificación"]},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        updated_user = serializer.save()
        if not pending_email:
            try:
                queue_and_dispatch_email_updated_notification(updated_user, previous_email)
            except Exception:
                logger.exception("Failed to send email update notification for user %s", updated_user.pk)
        return Response(self._update_response_payload(serializer, pending_email=pending_email))

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_user(self, request, pk=None):
        user = self.get_object()
        if request.user != user and not request.user.is_staff and not request.user.is_superuser:
            return Response(
                {'detail': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        self.perform_destroy(user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def signin(self, request):
        if request.user.is_authenticated:
            return Response({'detail': 'You are already signed in.'}, status=status.HTTP_400_BAD_REQUEST)

        email_or_username = request.data.get('emailOrUsername')
        password = request.data.get('password')

        if not email_or_username or not password:
            return Response({'detail': 'Email/Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email_or_username, password=password)

        if user is not None:
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            token, created = Token.objects.get_or_create(user=user)

            # Auto-send verification OTP for unverified users (including legacy users)
            if not user.email_verified_at:
                try:
                    code, otp = create_otp_for_user(user)
                    send_verification_email(user.email, code)
                except Exception:
                    logger.exception("Failed to send verification email on signin for user %s", user.email)

            serializer = self.get_serializer(user)
            response_data = serializer.data
            response_data['token'] = token.key
            response_data['email_verified'] = bool(user.email_verified_at)
            return Response(response_data, status=status.HTTP_200_OK)

        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def signout(self, request):
        try:
            token = request.user.auth_token
            if token:
                token.delete()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def check_role(self, request):
        user = request.user
        is_admin = user.is_staff or user.is_superuser

        return Response({
            'user_role': 'admin' if is_admin else 'user',
            'is_admin': is_admin
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        """Get current user's profile information"""
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """Update current user's profile information"""
        user = request.user
        previous_email = user.email
        pending_email = None
        update_data = request.data.copy()
        raw_email = update_data.get("email")

        if user.email_verified_at:
            try:
                pending_email = self._validated_verified_email_change(user, raw_email)
            except ValidationError as exc:
                return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
            if pending_email:
                update_data.pop("email", None)

        serializer = self.get_serializer(user, data=update_data, partial=True)
        if serializer.is_valid():
            if pending_email:
                try:
                    self._start_verified_email_change(user, pending_email)
                except Exception:
                    logger.exception("Failed to send verification email for pending email change on user %s", user.pk)
                    return Response(
                        {"email": ["No se pudo enviar el correo de verificación"]},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            updated_user = serializer.save()
            if not pending_email:
                try:
                    queue_and_dispatch_email_updated_notification(updated_user, previous_email)
                except Exception:
                    logger.exception("Failed to send email update notification for user %s", updated_user.pk)
            return Response(
                self._update_response_payload(serializer, pending_email=pending_email),
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_profile(self, request):
        """Delete current user's account"""
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
