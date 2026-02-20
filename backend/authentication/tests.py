import os
from unittest.mock import Mock, patch
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
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
