"""Google and password sign-in living side by side on the same account."""
import os
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from users.models import EmailNotificationJob

User = get_user_model()

ENV = {
    "GOOGLE_CLIENT_ID": "test-google-client-id",
    "GOOGLE_CLIENT_SECRET": "test-google-client-secret",
    "GOOGLE_REDIRECT_URI": "http://localhost:8000/auth/google/callback/",
    "FRONTEND_URL": "http://localhost:3000",
}
PASSWORD = "test-password-123"


def google_info(email="person@example.com", sub="sub-1", verified=True, name="Person Example"):
    info = {"email": email, "sub": sub, "name": name}
    if verified is not None:
        info["email_verified"] = verified
    return info


class GoogleFlowTestCase(APITestCase):
    def setUp(self):
        patcher = patch.dict(os.environ, ENV)
        patcher.start()
        self.addCleanup(patcher.stop)

    def callback(self, info, state=None, extra=""):
        with patch("authentication.views.requests.post") as post, patch(
            "authentication.views.id_token.verify_oauth2_token"
        ) as verify:
            post.return_value = Mock(json=lambda: {"id_token": "mock"})
            verify.return_value = info
            url = "/auth/google/callback/?code=test-code" + (f"&state={state}" if state else "") + extra
            return self.client.get(url)

    def make_user(self, email="person@example.com", username="person", password=PASSWORD, verified=True, **extra):
        user = User.objects.create_user(
            email=email, username=username, password=password, name="Per", surname="Son", **extra
        )
        if verified:
            user.email_verified_at = timezone.now()
            user.save(update_fields=["email_verified_at"])
        return user

    def auth(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")


class GoogleSignInTests(GoogleFlowTestCase):
    def test_new_google_user_is_created_verified_and_welcomed(self):
        response = self.callback(google_info("new@example.com", "sub-new", name="New Person"))

        self.assertEqual(response.status_code, 302)
        self.assertIn("/auth/callback?token=", response.url)
        self.assertIn("email_verified=true", response.url)
        user = User.objects.get(email="new@example.com")
        self.assertEqual((user.name, user.surname, user.google_sub), ("New", "Person", "sub-new"))
        self.assertIsNotNone(user.email_verified_at)
        self.assertFalse(user.has_usable_password())
        self.assertTrue(EmailNotificationJob.objects.filter(user=user, notification_type="account_created").exists())

    def test_email_not_verified_by_google_is_rejected(self):
        for verified in (False, None):
            response = self.callback(google_info("nope@example.com", verified=verified))
            self.assertEqual(response.url, "http://localhost:3000/auth/callback?error=email_not_verified")
        self.assertFalse(User.objects.filter(email="nope@example.com").exists())

    def test_existing_password_account_is_never_linked_or_signed_in(self):
        user = self.make_user("taken@example.com", "taken")

        response = self.callback(google_info("Taken@Example.com", "sub-attacker"))

        self.assertEqual(response.url, "http://localhost:3000/auth/callback?error=account_exists")
        user.refresh_from_db()
        self.assertIsNone(user.google_sub)
        self.assertFalse(Token.objects.filter(user=user).exists())

    def test_even_an_unverified_password_account_is_not_taken_over(self):
        # Someone could register a victim's address with a password they know; Google must not hand it over.
        user = self.make_user("victim@example.com", "victim", verified=False)

        response = self.callback(google_info("victim@example.com", "sub-victim"))

        self.assertIn("error=account_exists", response.url)
        user.refresh_from_db()
        self.assertIsNone(user.google_sub)
        self.assertIsNone(user.email_verified_at)

    def test_email_belonging_to_a_different_google_account_is_a_conflict(self):
        self.make_user("conflict@example.com", "conflict", google_sub="sub-original")

        response = self.callback(google_info("conflict@example.com", "sub-different"))

        self.assertEqual(response.url, "http://localhost:3000/auth/callback?error=account_conflict")

    def test_connected_user_signs_in_even_if_the_google_email_differs(self):
        user = self.make_user("work@example.com", "work", google_sub="sub-linked")

        response = self.callback(google_info("personal@gmail.com", "sub-linked"))

        self.assertIn("/auth/callback?token=", response.url)
        self.assertTrue(Token.objects.filter(user=user).exists())
        self.assertEqual(User.objects.count(), 1)

    def test_legacy_google_user_with_same_email_gets_verified_on_sign_in(self):
        user = self.make_user("legacy@example.com", "legacy", password=None, verified=False, google_sub="sub-legacy")

        response = self.callback(google_info("legacy@example.com", "sub-legacy"))

        self.assertIn("email_verified=true", response.url)
        user.refresh_from_db()
        self.assertIsNotNone(user.email_verified_at)

    def test_errors_land_on_the_page_that_shows_them(self):
        cancelled = self.client.get("/auth/google/callback/?error=access_denied")
        self.assertEqual(cancelled.url, "http://localhost:3000/auth/callback?error=cancelled")


class ConnectGoogleTests(GoogleFlowTestCase):
    def setUp(self):
        super().setUp()
        self.user = self.make_user()
        self.auth(self.user)

    def start(self):
        response = self.client.post("/auth/google/link/")
        self.assertEqual(response.status_code, 200)
        return response.json()["url"].split("state=")[1].split("&")[0]

    def test_start_requires_login(self):
        self.client.credentials()
        self.assertEqual(self.client.post("/auth/google/link/").status_code, 401)

    def test_start_returns_a_google_url_carrying_the_signed_state(self):
        response = self.client.post("/auth/google/link/")
        url = response.json()["url"]
        self.assertTrue(url.startswith("https://accounts.google.com/o/oauth2/v2/auth?"))
        self.assertIn("state=", url)

    def test_start_is_refused_when_google_is_already_connected(self):
        self.user.google_sub = "sub-x"
        self.user.save(update_fields=["google_sub"])
        self.assertEqual(self.client.post("/auth/google/link/").status_code, 400)

    def test_connects_any_google_account_even_with_a_different_email(self):
        state = self.start()
        self.client.credentials()  # the callback comes from Google's redirect, not from the API client

        response = self.callback(google_info("someone.else@gmail.com", "sub-other"), state=state)

        self.assertEqual(response.url, "http://localhost:3000/profile?google=linked")
        self.user.refresh_from_db()
        self.assertEqual(self.user.google_sub, "sub-other")
        self.assertTrue(self.user.has_usable_password())

    def test_connecting_with_the_same_email_also_verifies_the_account(self):
        unverified = self.make_user("same@example.com", "same", verified=False)
        self.auth(unverified)
        state = self.start()

        self.callback(google_info("same@example.com", "sub-same"), state=state)

        unverified.refresh_from_db()
        self.assertIsNotNone(unverified.email_verified_at)

    def test_connecting_with_another_email_does_not_verify_the_account(self):
        unverified = self.make_user("mine@example.com", "mine", verified=False)
        self.auth(unverified)
        state = self.start()

        self.callback(google_info("different@gmail.com", "sub-different"), state=state)

        unverified.refresh_from_db()
        self.assertEqual(unverified.google_sub, "sub-different")
        self.assertIsNone(unverified.email_verified_at)

    def test_google_account_used_by_someone_else_is_refused(self):
        self.make_user("owner@example.com", "owner", google_sub="sub-taken")
        state = self.start()

        response = self.callback(google_info("owner@example.com", "sub-taken"), state=state)

        self.assertEqual(response.url, "http://localhost:3000/profile?google_error=already_linked")
        self.user.refresh_from_db()
        self.assertIsNone(self.user.google_sub)

    def test_a_second_google_account_cannot_replace_the_first(self):
        state = self.start()
        self.user.google_sub = "sub-first"
        self.user.save(update_fields=["google_sub"])

        response = self.callback(google_info("x@gmail.com", "sub-second"), state=state)

        self.assertEqual(response.url, "http://localhost:3000/profile?google_error=already_has_google")
        self.user.refresh_from_db()
        self.assertEqual(self.user.google_sub, "sub-first")

    def test_tampered_state_is_refused(self):
        response = self.callback(google_info(), state="not-a-valid-state")
        self.assertEqual(response.url, "http://localhost:3000/profile?google_error=invalid_state")

    def test_expired_state_is_refused(self):
        state = self.start()
        with patch("authentication.utils.GOOGLE_LINK_MAX_AGE_SECONDS", -1):
            response = self.callback(google_info("x@gmail.com", "sub-late"), state=state)
        self.assertEqual(response.url, "http://localhost:3000/profile?google_error=invalid_state")
        self.user.refresh_from_db()
        self.assertIsNone(self.user.google_sub)

    def test_unverified_google_email_is_refused(self):
        state = self.start()
        response = self.callback(google_info("x@gmail.com", "sub-u", verified=False), state=state)
        self.assertEqual(response.url, "http://localhost:3000/profile?google_error=email_not_verified")

    def test_cancelling_at_google_returns_to_the_profile(self):
        state = self.start()
        response = self.client.get(f"/auth/google/callback/?error=access_denied&state={state}")
        self.assertEqual(response.url, "http://localhost:3000/profile?google_error=cancelled")


class DisconnectGoogleTests(GoogleFlowTestCase):
    def test_disconnects_when_the_account_has_a_password(self):
        user = self.make_user(google_sub="sub-1")
        self.auth(user)
        self.assertEqual(self.client.post("/auth/google/unlink/").status_code, 200)
        user.refresh_from_db()
        self.assertIsNone(user.google_sub)

    def test_refuses_to_disconnect_when_google_is_the_only_way_in(self):
        user = self.make_user(password=None, google_sub="sub-1")
        self.auth(user)
        response = self.client.post("/auth/google/unlink/")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"], "Set a password before disconnecting Google")
        user.refresh_from_db()
        self.assertEqual(user.google_sub, "sub-1")

    def test_requires_login_and_a_connected_google(self):
        self.assertEqual(self.client.post("/auth/google/unlink/").status_code, 401)
        self.auth(self.make_user())
        self.assertEqual(self.client.post("/auth/google/unlink/").status_code, 400)


class PasswordOnGoogleAccountsTests(GoogleFlowTestCase):
    def google_only_user(self):
        return self.make_user("g@example.com", "gonly", password=None, google_sub="sub-g")

    def test_signing_in_with_a_password_on_a_google_only_account_says_so(self):
        self.google_only_user()
        for identifier in ("g@example.com", "gonly"):
            response = self.client.post("/api/users/signin/", {"emailOrUsername": identifier, "password": "whatever1"}, format="json")
            self.assertEqual(response.status_code, 401)
            self.assertEqual(response.json()["detail"], "This account uses Google sign-in")
        login = self.client.post("/auth/login/", {"email": "g@example.com", "password": "whatever1"}, format="json")
        self.assertIn("This account uses Google sign-in", str(login.json()))

    def test_wrong_password_elsewhere_stays_a_generic_error(self):
        self.make_user("plain@example.com", "plain")
        self.make_user("both@example.com", "both", google_sub="sub-both")
        for identifier in ("plain@example.com", "both@example.com", "nobody@example.com"):
            response = self.client.post("/api/users/signin/", {"emailOrUsername": identifier, "password": "wrong-pass1"}, format="json")
            self.assertEqual(response.json()["detail"], "Invalid credentials")

    def test_google_user_gets_a_create_password_email_and_can_then_use_both_methods(self):
        user = self.google_only_user()

        self.client.post("/auth/password/reset/request/", {"email": "g@example.com"}, format="json")
        self.assertEqual(mail.outbox[-1].subject, "Crea tu contraseña - Ordinaly")
        token = mail.outbox[-1].body.split("token=")[1].split()[0]
        self.client.post("/auth/password/reset/confirm/", {"token": token, "new_password": "brand-new-pass1"}, format="json")

        user.refresh_from_db()
        self.assertTrue(user.has_usable_password())
        self.assertEqual(user.google_sub, "sub-g")
        signin = self.client.post("/api/users/signin/", {"emailOrUsername": "g@example.com", "password": "brand-new-pass1"}, format="json")
        self.assertEqual(signin.status_code, 200)

    def test_account_with_a_password_still_gets_the_reset_wording(self):
        self.make_user("plain@example.com", "plain")
        self.client.post("/auth/password/reset/request/", {"email": "plain@example.com"}, format="json")
        self.assertEqual(mail.outbox[-1].subject, "Restablecer contraseña - Ordinaly")

    def test_profile_tells_the_frontend_which_methods_the_account_has(self):
        user = self.google_only_user()
        self.auth(user)
        data = self.client.get("/api/users/profile/").json()
        self.assertTrue(data["is_google_authenticated"])
        self.assertFalse(data["has_usable_password"])

        both = self.make_user("both@example.com", "both", google_sub="sub-both")
        self.auth(both)
        data = self.client.get("/api/users/profile/").json()
        self.assertTrue(data["is_google_authenticated"])
        self.assertTrue(data["has_usable_password"])
