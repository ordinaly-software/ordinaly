from django.urls import path
from . import views
from authentication.views import SignupView
from authentication.views import VerifyEmailView
from authentication.views import ResendVerificationView
from authentication.views import ChangeEmailUnverifiedView
from authentication.views import LoginView
from .views import request_delete_account
from .views import confirm_delete_account

urlpatterns = [
    path("google/login/", views.google_login),
    path("google/callback/", views.google_callback),
    path("signup/", SignupView.as_view(), name="signup"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationView.as_view(), name="resend-verification"),
    path("change-email-unverified/", ChangeEmailUnverifiedView.as_view(), name="change-email-unverified"),
    path("login/", LoginView.as_view(), name="login"),
    path("delete/request/", request_delete_account),
    path("delete/confirm/", confirm_delete_account),


]
