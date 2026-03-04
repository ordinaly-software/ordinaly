import os
import hashlib
from datetime import timedelta
from unittest.mock import Mock, patch
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase
from .utils import create_internal_token


class CreateInternalTokenTests(TestCase):
    def setUp(self):
        CustomUser = get_user_model()
        self.user = CustomUser.objects.create_user(
            email="oauth@example.com",
            username="oauth_user",
            password="test-password-123",
            name="OAuth",
            surname="User",
            company="Ordinaly",
        )

    def test_returns_rest_framework_token_key(self):
        token_key = create_internal_token(self.user)

        token = Token.objects.get(user=self.user)
        self.assertEqual(token_key, token.key)

    def test_reuses_existing_token(self):
        existing_token = Token.objects.create(user=self.user)

        token_key = create_internal_token(self.user)

        self.assertEqual(token_key, existing_token.key)
        self.assertEqual(Token.objects.filter(user=self.user).count(), 1)


class GoogleCallbackTests(TestCase):
    def setUp(self):
        self.env = {
            "GOOGLE_CLIENT_ID": "test-google-client-id",
            "GOOGLE_CLIENT_SECRET": "test-google-client-secret",
            "GOOGLE_REDIRECT_URI": "http://localhost:8000/auth/google/callback/",
            "FRONTEND_URL": "http://localhost:3000",
        }

    @patch.dict(os.environ, {}, clear=False)
    @patch("authentication.views.id_token.verify_oauth2_token")
    @patch("authentication.views.requests.post")
    def test_google_callback_creates_user_with_custom_user_fields(self, mock_post, mock_verify):
        for key, value in self.env.items():
            os.environ[key] = value

        mock_post.return_value = Mock(json=lambda: {"id_token": "mock-id-token"})
        mock_verify.return_value = {
            "email": "google.user@example.com",
            "name": "Google User",
            "sub": "google-sub-1",
        }

        response = self.client.get("/auth/google/callback/?code=test-code")

        self.assertEqual(response.status_code, 302)
        self.assertIn("/auth/callback?token=", response.url)

        CustomUser = get_user_model()
        user = CustomUser.objects.get(email="google.user@example.com")
        self.assertEqual(user.name, "Google")
        self.assertEqual(user.surname, "User")
        self.assertEqual(user.company, "")
        self.assertEqual(user.google_sub, "google-sub-1")
        self.assertTrue(Token.objects.filter(user=user).exists())

    @patch.dict(os.environ, {}, clear=False)
    @patch("authentication.views.id_token.verify_oauth2_token")
    @patch("authentication.views.requests.post")
    def test_google_callback_links_existing_user_without_google_sub(self, mock_post, mock_verify):
        for key, value in self.env.items():
            os.environ[key] = value

        CustomUser = get_user_model()
        user = CustomUser.objects.create_user(
            email="existing@example.com",
            username="existing_user",
            password="test-password-123",
            name="Existing",
            surname="User",
            company="Ordinaly",
        )

        mock_post.return_value = Mock(json=lambda: {"id_token": "mock-id-token"})
        mock_verify.return_value = {
            "email": "existing@example.com",
            "name": "Existing User",
            "sub": "google-sub-2",
        }

        response = self.client.get("/auth/google/callback/?code=test-code")

        self.assertEqual(response.status_code, 302)
        self.assertIn("/auth/callback?token=", response.url)

        user.refresh_from_db()
        self.assertEqual(user.google_sub, "google-sub-2")
        self.assertTrue(Token.objects.filter(user=user).exists())

    @patch.dict(os.environ, {}, clear=False)
    @patch("authentication.views.id_token.verify_oauth2_token")
    @patch("authentication.views.requests.post")
    def test_google_callback_rejects_account_conflict(self, mock_post, mock_verify):
        for key, value in self.env.items():
            os.environ[key] = value

        CustomUser = get_user_model()
        user = CustomUser.objects.create_user(
            email="conflict@example.com",
            username="conflict_user",
            password="test-password-123",
            name="Conflict",
            surname="User",
            company="Ordinaly",
        )
        user.google_sub = "google-sub-original"
        user.save(update_fields=["google_sub"])

        mock_post.return_value = Mock(json=lambda: {"id_token": "mock-id-token"})
        mock_verify.return_value = {
            "email": "conflict@example.com",
            "name": "Conflict User",
            "sub": "google-sub-different",
        }

        response = self.client.get("/auth/google/callback/?code=test-code")

        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "http://localhost:3000/auth/signin?error=account_conflict",
        )


class DeleteAccountViewsTests(APITestCase):
    def setUp(self):
        CustomUser = get_user_model()
        self.user = CustomUser.objects.create_user(
            email="delete@example.com",
            username="delete_user",
            password="test-password-123",
            name="Delete",
            surname="User",
            company="Ordinaly",
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    @override_settings(DEBUG=False)
    @patch("authentication.views.send_delete_confirmation_email")
    @patch("authentication.views.secrets.token_hex", return_value="plain-delete-token")
    def test_request_delete_account_post_sets_token_hash_and_expiry(self, mock_token_hex, mock_send_email):
        response = self.client.post("/auth/delete/request/", {}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Correo enviado")

        self.user.refresh_from_db()
        expected_hash = hashlib.sha256("plain-delete-token".encode()).hexdigest()
        self.assertEqual(self.user.deletion_token_hash, expected_hash)
        self.assertIsNotNone(self.user.deletion_token_expires_at)
        self.assertGreater(self.user.deletion_token_expires_at, timezone.now())
        mock_send_email.assert_called_once_with(self.user.email, "plain-delete-token", "Delete")

    def test_request_delete_account_get_not_allowed(self):
        response = self.client.get("/auth/delete/request/")
        self.assertEqual(response.status_code, 405)

    def test_confirm_delete_account_post_deletes_user_when_token_is_valid(self):
        raw_token = "valid-delete-token"
        self.user.deletion_token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        self.user.deletion_token_expires_at = timezone.now() + timedelta(minutes=10)
        self.user.save(update_fields=["deletion_token_hash", "deletion_token_expires_at"])

        response = self.client.post("/auth/delete/confirm/", {"token": raw_token}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Cuenta eliminada")
        self.assertFalse(get_user_model().objects.filter(id=self.user.id).exists())

    def test_confirm_delete_account_get_not_allowed(self):
        response = self.client.get("/auth/delete/confirm/")
        self.assertEqual(response.status_code, 405)

    @patch("authentication.views.send_delete_confirmation_email", side_effect=Exception("SMTP error"))
    def test_request_delete_account_email_failure_returns_500(self, mock_send_email):
        response = self.client.post("/auth/delete/request/", {}, format="json")
        self.assertEqual(response.status_code, 500)
        self.assertIn("error", response.data)

    def test_confirm_delete_account_missing_token_returns_400(self):
        response = self.client.post("/auth/delete/confirm/", {}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_confirm_delete_account_invalid_token_returns_400(self):
        response = self.client.post("/auth/delete/confirm/", {"token": "bogus"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_confirm_delete_account_expired_token_returns_400(self):
        raw_token = "expired-delete-token"
        self.user.deletion_token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        self.user.deletion_token_expires_at = timezone.now() - timedelta(minutes=1)
        self.user.save(update_fields=["deletion_token_hash", "deletion_token_expires_at"])

        response = self.client.post("/auth/delete/confirm/", {"token": raw_token}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("expirado", response.data["error"].lower())


class EmailVerificationMiddlewareTests(APITestCase):
    def setUp(self):
        CustomUser = get_user_model()
        self.unverified_user = CustomUser.objects.create_user(
            email="unverified@example.com",
            username="unverified_user",
            password="test-password-123",
            name="Unverified",
            surname="User",
            company="Test",
            email_verified_at=None,
        )
        self.verified_user = CustomUser.objects.create_user(
            email="verified@example.com",
            username="verified_user",
            password="test-password-123",
            name="Verified",
            surname="User",
            company="Test",
            email_verified_at=timezone.now(),
        )
        self.staff_user = CustomUser.objects.create_user(
            email="staff@example.com",
            username="staff_user",
            password="test-password-123",
            name="Staff",
            surname="User",
            company="Test",
            is_staff=True,
            email_verified_at=None,
        )
        self.superuser = CustomUser.objects.create_user(
            email="super@example.com",
            username="super_user",
            password="test-password-123",
            name="Super",
            surname="User",
            company="Test",
            is_superuser=True,
            email_verified_at=None,
        )

        self.unverified_token = Token.objects.create(user=self.unverified_user)
        self.verified_token = Token.objects.create(user=self.verified_user)
        self.staff_token = Token.objects.create(user=self.staff_user)
        self.superuser_token = Token.objects.create(user=self.superuser)

    def test_unauthenticated_user_passes_through(self):
        response = self.client.post("/auth/login/", {}, format="json")
        # Should not be 403 - may be validation error but not middleware block
        self.assertNotEqual(response.status_code, 403)

    def test_verified_user_can_access_protected_endpoint(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.verified_token.key}")
        response = self.client.post("/auth/delete/request/", {}, format="json")
        # Should not be 403 (middleware passes), might be 500 from email failure but not 403
        self.assertNotEqual(response.status_code, 403)

    def test_unverified_user_blocked_on_protected_endpoint(self):
        # Use RequestFactory to test the middleware in isolation,
        # since DRF TokenAuth runs after Django middleware.
        from django.test import RequestFactory
        from django.http import HttpResponse
        from authentication.middleware import EmailVerificationRequiredMiddleware
        factory = RequestFactory()
        request = factory.post("/auth/delete/request/")
        request.user = self.unverified_user
        middleware = EmailVerificationRequiredMiddleware(lambda r: HttpResponse(status=200))
        response = middleware(request)
        self.assertEqual(response.status_code, 403)

    def test_unverified_user_allowed_on_verify_email(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.unverified_token.key}")
        response = self.client.post("/auth/verify-email/", {}, format="json")
        # Should not be 403 (allowed path) - may be 400 for missing fields
        self.assertNotEqual(response.status_code, 403)

    def test_unverified_user_allowed_on_resend_verification(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.unverified_token.key}")
        response = self.client.post("/auth/resend-verification/", {}, format="json")
        self.assertNotEqual(response.status_code, 403)

    def test_unverified_user_allowed_on_signup(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.unverified_token.key}")
        response = self.client.post("/auth/signup/", {}, format="json")
        self.assertNotEqual(response.status_code, 403)

    def test_unverified_user_allowed_on_login(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.unverified_token.key}")
        response = self.client.post("/auth/login/", {}, format="json")
        self.assertNotEqual(response.status_code, 403)

    def test_unverified_user_allowed_on_change_email(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.unverified_token.key}")
        response = self.client.patch("/auth/change-email-unverified/", {}, format="json")
        self.assertNotEqual(response.status_code, 403)

    def test_staff_user_bypasses_middleware(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.staff_token.key}")
        response = self.client.post("/auth/delete/request/", {}, format="json")
        self.assertNotEqual(response.status_code, 403)

    def test_superuser_bypasses_middleware(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.superuser_token.key}")
        response = self.client.post("/auth/delete/request/", {}, format="json")
        self.assertNotEqual(response.status_code, 403)

    def test_unverified_user_allowed_on_password_reset_request(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.unverified_token.key}")
        response = self.client.post("/auth/password/reset/request/", {}, format="json")
        self.assertNotEqual(response.status_code, 403)

    def test_unverified_user_allowed_on_password_reset_confirm(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.unverified_token.key}")
        response = self.client.post("/auth/password/reset/confirm/", {}, format="json")
        self.assertNotEqual(response.status_code, 403)


class AuthSerializerTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            email="serializer@example.com",
            username="serializer_user",
            password="test-password-123",
            name="Serializer",
            surname="Test",
            company="Ordinaly",
        )

    @patch("authentication.serializers.send_verification_email")
    @patch("authentication.serializers.create_otp_for_user", return_value=("123456", Mock()))
    def test_signup_serializer_creates_user(self, mock_otp, mock_email):
        from authentication.serializers import SignupSerializer
        data = {"email": "new@example.com", "password": "newpass123"}
        serializer = SignupSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.email, "new@example.com")
        self.assertEqual(user.status, "pending_verification")
        mock_otp.assert_called_once()
        mock_email.assert_called_once_with("new@example.com", "123456")

    @patch("authentication.serializers.queue_and_dispatch_account_created_notification")
    @patch("authentication.serializers.validate_otp", return_value=(True, "OK"))
    def test_verify_email_serializer_success(self, mock_validate, mock_queue):
        from authentication.serializers import VerifyEmailSerializer
        from users.models import EmailVerificationOTP

        EmailVerificationOTP.objects.create(
            user=self.user,
            code_hash="dummy",
            expires_at=timezone.now() + timedelta(minutes=15),
        )

        serializer = VerifyEmailSerializer(data={"email": self.user.email, "code": "123456"})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.email_verified_at)
        self.assertEqual(self.user.status, "active")
        mock_queue.assert_called_once_with(self.user)

    @patch("authentication.serializers.queue_and_dispatch_email_updated_notification")
    @patch("authentication.serializers.validate_otp", return_value=(True, "OK"))
    def test_verify_email_serializer_applies_pending_email_after_verification(self, mock_validate, mock_queue):
        from authentication.serializers import VerifyEmailSerializer
        from users.models import EmailVerificationOTP

        self.user.email_verified_at = timezone.now()
        self.user.pending_email = "pending@example.com"
        self.user.save(update_fields=["email_verified_at", "pending_email"])

        EmailVerificationOTP.objects.create(
            user=self.user,
            code_hash="dummy",
            expires_at=timezone.now() + timedelta(minutes=15),
        )

        serializer = VerifyEmailSerializer(data={"email": "pending@example.com", "code": "123456"})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "pending@example.com")
        self.assertIsNone(self.user.pending_email)
        mock_queue.assert_called_once_with(self.user, "serializer@example.com")

    def test_verify_email_serializer_user_not_found(self):
        from authentication.serializers import VerifyEmailSerializer
        serializer = VerifyEmailSerializer(data={"email": "nobody@example.com", "code": "123456"})
        self.assertFalse(serializer.is_valid())

    def test_verify_email_serializer_already_verified(self):
        from authentication.serializers import VerifyEmailSerializer
        self.user.email_verified_at = timezone.now()
        self.user.save()
        serializer = VerifyEmailSerializer(data={"email": self.user.email, "code": "123456"})
        self.assertFalse(serializer.is_valid())

    @patch("authentication.serializers.validate_otp", return_value=(False, "EXPIRED"))
    def test_verify_email_serializer_expired_code(self, mock_validate):
        from authentication.serializers import VerifyEmailSerializer
        serializer = VerifyEmailSerializer(data={"email": self.user.email, "code": "123456"})
        self.assertFalse(serializer.is_valid())

    @patch("authentication.serializers.validate_otp", return_value=(False, "INVALID"))
    def test_verify_email_serializer_invalid_code(self, mock_validate):
        from authentication.serializers import VerifyEmailSerializer
        serializer = VerifyEmailSerializer(data={"email": self.user.email, "code": "000000"})
        self.assertFalse(serializer.is_valid())

    @patch("authentication.serializers.validate_otp", return_value=(False, "TOO_MANY_ATTEMPTS"))
    def test_verify_email_serializer_too_many_attempts(self, mock_validate):
        from authentication.serializers import VerifyEmailSerializer
        serializer = VerifyEmailSerializer(data={"email": self.user.email, "code": "123456"})
        self.assertFalse(serializer.is_valid())

    @patch("authentication.serializers.validate_otp", return_value=(False, "NO_OTP"))
    def test_verify_email_serializer_generic_failure(self, mock_validate):
        from authentication.serializers import VerifyEmailSerializer
        serializer = VerifyEmailSerializer(data={"email": self.user.email, "code": "123456"})
        self.assertFalse(serializer.is_valid())

    def test_resend_verification_user_not_found(self):
        from authentication.serializers import ResendVerificationSerializer
        serializer = ResendVerificationSerializer(data={"email": "nobody@example.com"})
        self.assertFalse(serializer.is_valid())

    def test_resend_verification_already_verified(self):
        from authentication.serializers import ResendVerificationSerializer
        self.user.email_verified_at = timezone.now()
        self.user.save()
        serializer = ResendVerificationSerializer(data={"email": self.user.email})
        self.assertFalse(serializer.is_valid())

    @override_settings(EMAIL_OTP_RESEND_COOLDOWN_SECONDS=120)
    def test_resend_verification_cooldown_active(self):
        from authentication.serializers import ResendVerificationSerializer
        from users.models import EmailVerificationOTP
        EmailVerificationOTP.objects.create(
            user=self.user,
            code_hash="dummy",
            expires_at=timezone.now() + timedelta(minutes=15),
            last_sent_at=timezone.now(),
        )
        serializer = ResendVerificationSerializer(data={"email": self.user.email})
        self.assertFalse(serializer.is_valid())

    @patch("authentication.serializers.send_verification_email")
    @patch("authentication.serializers.create_otp_for_user", return_value=("654321", Mock()))
    @override_settings(EMAIL_OTP_RESEND_COOLDOWN_SECONDS=0)
    def test_resend_verification_success(self, mock_otp, mock_email):
        from authentication.serializers import ResendVerificationSerializer
        serializer = ResendVerificationSerializer(data={"email": self.user.email})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.email, self.user.email)
        mock_email.assert_called_once()

    @patch("authentication.serializers.send_verification_email")
    @patch("authentication.serializers.create_otp_for_user", return_value=("654321", Mock()))
    @override_settings(EMAIL_OTP_RESEND_COOLDOWN_SECONDS=0)
    def test_resend_verification_uses_pending_email_for_verified_user(self, mock_otp, mock_email):
        from authentication.serializers import ResendVerificationSerializer

        self.user.email_verified_at = timezone.now()
        self.user.pending_email = "pending@example.com"
        self.user.save(update_fields=["email_verified_at", "pending_email"])

        serializer = ResendVerificationSerializer(data={"email": "pending@example.com"})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        mock_email.assert_called_once_with("pending@example.com", "654321")

    def test_change_email_duplicate(self):
        from authentication.serializers import ChangeEmailUnverifiedSerializer
        serializer = ChangeEmailUnverifiedSerializer(data={"new_email": self.user.email})
        self.assertFalse(serializer.is_valid())

    def test_change_email_already_verified(self):
        from authentication.serializers import ChangeEmailUnverifiedSerializer
        self.user.email_verified_at = timezone.now()
        self.user.save()
        request = Mock()
        request.user = self.user
        serializer = ChangeEmailUnverifiedSerializer(
            data={"new_email": "fresh@example.com"},
            context={"request": request},
        )
        self.assertFalse(serializer.is_valid())

    @patch("authentication.serializers.send_verification_email")
    @patch("authentication.serializers.create_otp_for_user", return_value=("111111", Mock()))
    def test_change_email_success(self, mock_otp, mock_email):
        from authentication.serializers import ChangeEmailUnverifiedSerializer
        request = Mock()
        request.user = self.user
        serializer = ChangeEmailUnverifiedSerializer(
            data={"new_email": "brand_new@example.com"},
            context={"request": request},
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.email, "brand_new@example.com")
        mock_email.assert_called_once_with("brand_new@example.com", "111111")

    def test_login_serializer_missing_fields(self):
        from authentication.serializers import LoginSerializer
        serializer = LoginSerializer(data={"email": "", "password": ""})
        self.assertFalse(serializer.is_valid())

    def test_login_serializer_invalid_credentials(self):
        from authentication.serializers import LoginSerializer
        serializer = LoginSerializer(data={"email": self.user.email, "password": "wrong"})
        self.assertFalse(serializer.is_valid())

    def test_login_serializer_success(self):
        from authentication.serializers import LoginSerializer
        serializer = LoginSerializer(data={"email": self.user.email, "password": "test-password-123"})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["user"], self.user)


class AuthViewTests(APITestCase):
    def setUp(self):
        self.User = get_user_model()

    @patch.dict(os.environ, {"GOOGLE_CLIENT_ID": "cid", "GOOGLE_REDIRECT_URI": "http://localhost/cb"})
    def test_google_login_redirects(self):
        response = self.client.get("/auth/google/login/")
        self.assertEqual(response.status_code, 302)
        self.assertIn("accounts.google.com", response.url)

    @override_settings(DEBUG=False)
    @patch.dict(
        os.environ,
        {
            "GOOGLE_CLIENT_ID": "cid",
            "GOOGLE_REDIRECT_URI": "http://localhost:8000/auth/google/callback/",
            "BACKEND_BASE_URL": "https://api.ordinaly.ai",
        },
    )
    def test_google_login_uses_backend_base_url_in_production_when_redirect_uri_is_localhost(self):
        response = self.client.get("/auth/google/login/")
        self.assertEqual(response.status_code, 302)
        self.assertIn("redirect_uri=https%3A%2F%2Fapi.ordinaly.ai%2Fauth%2Fgoogle%2Fcallback%2F", response.url)

    @override_settings(DEBUG=False)
    @patch.dict(
        os.environ,
        {
            "GOOGLE_CLIENT_ID": "cid",
            "GOOGLE_REDIRECT_URI": "https://api.ordinaly.ai/auth/google/callback/",
        },
    )
    def test_google_login_normalizes_http_redirect_uri_to_https_in_production(self):
        response = self.client.get("/auth/google/login/")
        self.assertEqual(response.status_code, 302)
        self.assertIn("redirect_uri=https%3A%2F%2Fapi.ordinaly.ai%2Fauth%2Fgoogle%2Fcallback%2F", response.url)

    @patch.dict(os.environ, {"FRONTEND_URL": "http://localhost:3000"})
    def test_google_callback_error_param_redirects(self):
        response = self.client.get("/auth/google/callback/?error=access_denied")
        self.assertEqual(response.status_code, 302)
        self.assertIn("error=cancelled", response.url)

    @patch.dict(os.environ, {"FRONTEND_URL": "http://localhost:3000"})
    def test_google_callback_missing_code_returns_400(self):
        response = self.client.get("/auth/google/callback/")
        self.assertEqual(response.status_code, 400)

    @patch.dict(os.environ, {
        "FRONTEND_URL": "http://localhost:3000",
        "GOOGLE_CLIENT_ID": "cid",
        "GOOGLE_CLIENT_SECRET": "secret",
        "GOOGLE_REDIRECT_URI": "http://localhost/cb",
    })
    @patch("authentication.views.requests.post")
    def test_google_callback_token_exchange_fails(self, mock_post):
        mock_post.return_value = Mock(json=lambda: {"error": "invalid_grant"})
        response = self.client.get("/auth/google/callback/?code=badcode")
        self.assertEqual(response.status_code, 400)

    @patch.dict(os.environ, {
        "FRONTEND_URL": "http://localhost:3000",
        "GOOGLE_CLIENT_ID": "cid",
        "GOOGLE_CLIENT_SECRET": "secret",
        "GOOGLE_REDIRECT_URI": "http://localhost/cb",
    })
    @patch("authentication.views.id_token.verify_oauth2_token", side_effect=ValueError("bad token"))
    @patch("authentication.views.requests.post")
    def test_google_callback_invalid_id_token(self, mock_post, mock_verify):
        mock_post.return_value = Mock(json=lambda: {"id_token": "bad"})
        response = self.client.get("/auth/google/callback/?code=test-code")
        self.assertEqual(response.status_code, 302)
        self.assertIn("error=invalid_token", response.url)

    @patch.dict(os.environ, {
        "FRONTEND_URL": "http://localhost:3000",
        "GOOGLE_CLIENT_ID": "cid",
        "GOOGLE_CLIENT_SECRET": "secret",
        "GOOGLE_REDIRECT_URI": "http://localhost/cb",
    })
    @patch("authentication.views.id_token.verify_oauth2_token")
    @patch("authentication.views.requests.post")
    def test_google_callback_missing_email(self, mock_post, mock_verify):
        mock_post.return_value = Mock(json=lambda: {"id_token": "mock"})
        mock_verify.return_value = {"sub": "123"}
        response = self.client.get("/auth/google/callback/?code=test-code")
        self.assertEqual(response.status_code, 302)
        self.assertIn("error=missing_email", response.url)

    @patch("authentication.serializers.send_verification_email")
    @patch("authentication.serializers.create_otp_for_user", return_value=("123456", Mock()))
    def test_signup_view_success(self, mock_otp, mock_email):
        response = self.client.post("/auth/signup/", {
            "email": "signup@example.com",
            "password": "strongpassword123",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["email"], "signup@example.com")
        self.assertFalse(response.data["user"]["email_verified"])

    @patch("authentication.serializers.queue_and_dispatch_account_created_notification")
    @patch("authentication.serializers.validate_otp", return_value=(True, "OK"))
    def test_verify_email_view_success(self, mock_validate, mock_queue):
        user = self.User.objects.create_user(
            email="toverify@example.com",
            username="toverify",
            password="test-password-123",
            name="To",
            surname="Verify",
        )
        response = self.client.post("/auth/verify-email/", {
            "email": "toverify@example.com",
            "code": "123456",
        }, format="json")
        self.assertEqual(response.status_code, 200)

    @patch("authentication.serializers.send_verification_email")
    @patch("authentication.serializers.create_otp_for_user", return_value=("123456", Mock()))
    @override_settings(EMAIL_OTP_RESEND_COOLDOWN_SECONDS=0)
    def test_resend_verification_view_success(self, mock_otp, mock_email):
        self.User.objects.create_user(
            email="resend@example.com",
            username="resend_user",
            password="test-password-123",
            name="Resend",
            surname="User",
        )
        response = self.client.post("/auth/resend-verification/", {
            "email": "resend@example.com",
        }, format="json")
        self.assertEqual(response.status_code, 200)

    @patch("authentication.serializers.send_verification_email")
    @patch("authentication.serializers.create_otp_for_user", return_value=("123456", Mock()))
    def test_change_email_view_success(self, mock_otp, mock_email):
        user = self.User.objects.create_user(
            email="changeme@example.com",
            username="changeme_user",
            password="test-password-123",
            name="Change",
            surname="Me",
        )
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        response = self.client.patch("/auth/change-email-unverified/", {
            "new_email": "changed@example.com",
        }, format="json")
        self.assertEqual(response.status_code, 200)

    def test_login_view_success(self):
        self.User.objects.create_user(
            email="logintest@example.com",
            username="logintest",
            password="test-password-123",
            name="Login",
            surname="Test",
        )
        response = self.client.post("/auth/login/", {
            "email": "logintest@example.com",
            "password": "test-password-123",
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.data)

    def test_login_view_invalid_credentials(self):
        response = self.client.post("/auth/login/", {
            "email": "noone@example.com",
            "password": "wrong",
        }, format="json")
        self.assertEqual(response.status_code, 400)


class PasswordResetViewTests(APITestCase):
    def setUp(self):
        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            email="resetme@example.com",
            username="resetme_user",
            password="oldpassword123",
            name="Reset",
            surname="Me",
        )

    @patch("users.services.email_service.send_password_reset_email")
    def test_request_password_reset_with_valid_email(self, mock_email):
        response = self.client.post("/auth/password/reset/request/", {
            "email": "resetme@example.com",
        }, format="json")
        self.assertEqual(response.status_code, 200)
        mock_email.assert_called_once()
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.password_reset_token_hash)

    def test_request_password_reset_empty_email(self):
        response = self.client.post("/auth/password/reset/request/", {}, format="json")
        self.assertEqual(response.status_code, 200)

    def test_request_password_reset_nonexistent_email(self):
        response = self.client.post("/auth/password/reset/request/", {
            "email": "nobody@example.com",
        }, format="json")
        # Always returns 200 for safety
        self.assertEqual(response.status_code, 200)

    @patch("users.services.email_service.send_password_reset_email", side_effect=Exception("email fail"))
    def test_request_password_reset_email_failure_still_returns_200(self, mock_email):
        response = self.client.post("/auth/password/reset/request/", {
            "email": "resetme@example.com",
        }, format="json")
        self.assertEqual(response.status_code, 200)

    def test_confirm_password_reset_missing_fields(self):
        response = self.client.post("/auth/password/reset/confirm/", {}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_confirm_password_reset_short_password(self):
        response = self.client.post("/auth/password/reset/confirm/", {
            "token": "sometoken",
            "new_password": "short",
        }, format="json")
        self.assertEqual(response.status_code, 400)

    def test_confirm_password_reset_invalid_token(self):
        response = self.client.post("/auth/password/reset/confirm/", {
            "token": "invalidtoken",
            "new_password": "newstrongpass123",
        }, format="json")
        self.assertEqual(response.status_code, 400)

    def test_confirm_password_reset_expired_token(self):
        import secrets
        raw_token = secrets.token_hex(16)
        self.user.password_reset_token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        self.user.password_reset_token_expires_at = timezone.now() - timedelta(minutes=1)
        self.user.save(update_fields=["password_reset_token_hash", "password_reset_token_expires_at"])

        response = self.client.post("/auth/password/reset/confirm/", {
            "token": raw_token,
            "new_password": "newstrongpass123",
        }, format="json")
        self.assertEqual(response.status_code, 400)

    def test_confirm_password_reset_success(self):
        import secrets
        raw_token = secrets.token_hex(16)
        self.user.password_reset_token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        self.user.password_reset_token_expires_at = timezone.now() + timedelta(minutes=15)
        self.user.save(update_fields=["password_reset_token_hash", "password_reset_token_expires_at"])

        response = self.client.post("/auth/password/reset/confirm/", {
            "token": raw_token,
            "new_password": "newstrongpass123",
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newstrongpass123"))
        self.assertIsNone(self.user.password_reset_token_hash)

    @patch("authentication.views.queue_and_dispatch_password_reset_completed_notification")
    def test_confirm_password_reset_enqueues_confirmation_email(self, mock_queue):
        import secrets

        raw_token = secrets.token_hex(16)
        self.user.password_reset_token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        self.user.password_reset_token_expires_at = timezone.now() + timedelta(minutes=15)
        self.user.save(update_fields=["password_reset_token_hash", "password_reset_token_expires_at"])

        response = self.client.post("/auth/password/reset/confirm/", {
            "token": raw_token,
            "new_password": "newstrongpass123",
        }, format="json")

        self.assertEqual(response.status_code, 200)
        mock_queue.assert_called_once_with(self.user)


class GoogleHelperFunctionTests(TestCase):
    def test_split_google_name_full_name(self):
        from authentication.views import _split_google_name
        first, last = _split_google_name("John Doe")
        self.assertEqual(first, "John")
        self.assertEqual(last, "Doe")

    def test_split_google_name_single_name(self):
        from authentication.views import _split_google_name
        first, last = _split_google_name("Madonna")
        self.assertEqual(first, "Madonna")
        self.assertEqual(last, "CustomUser")

    def test_split_google_name_empty(self):
        from authentication.views import _split_google_name
        first, last = _split_google_name("")
        self.assertEqual(first, "Google")
        self.assertEqual(last, "CustomUser")

    def test_split_google_name_none(self):
        from authentication.views import _split_google_name
        first, last = _split_google_name(None)
        self.assertEqual(first, "Google")
        self.assertEqual(last, "CustomUser")

    def test_generate_unique_google_username_basic(self):
        from authentication.views import _generate_unique_google_username
        CustomUser = get_user_model()
        username = _generate_unique_google_username(CustomUser, "john.doe@gmail.com")
        self.assertTrue(len(username) >= 3)
        self.assertTrue(len(username) <= 30)

    def test_generate_unique_google_username_short_local(self):
        from authentication.views import _generate_unique_google_username
        CustomUser = get_user_model()
        username = _generate_unique_google_username(CustomUser, "ab@gmail.com")
        self.assertTrue(len(username) >= 3)

    def test_generate_unique_google_username_collision(self):
        from authentication.views import _generate_unique_google_username
        CustomUser = get_user_model()
        CustomUser.objects.create_user(
            email="existing_collision@example.com",
            username="john_doe",
            password="pass123",
            name="John",
            surname="Doe",
        )
        username = _generate_unique_google_username(CustomUser, "john.doe@gmail.com")
        self.assertNotEqual(username, "john_doe")
