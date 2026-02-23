from django.urls import path
from . import views
from authentication.views import SignupView
from authentication.views import VerifyEmailView
from authentication.views import ResendVerificationView
from authentication.views import ChangeEmailUnverifiedView

urlpatterns = [
    path("google/login/", views.google_login),
    path("google/callback/", views.google_callback),
    path("signup/", SignupView.as_view(), name="signup"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationView.as_view(), name="resend-verification"),
    path("change-email-unverified/", ChangeEmailUnverifiedView.as_view(), name="change-email-unverified"),
]
