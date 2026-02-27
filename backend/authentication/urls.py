from django.urls import path
from . import views
from authentication.views import VerifyEmailView
from authentication.views import ResendVerificationView
from authentication.views import ChangeEmailUnverifiedView
from .views import request_delete_account
from .views import confirm_delete_account
from .views import request_password_reset
from .views import confirm_password_reset

urlpatterns = [
    path("google/login/", views.google_login),
    path("google/callback/", views.google_callback),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationView.as_view(), name="resend-verification"),
    path("change-email-unverified/", ChangeEmailUnverifiedView.as_view(), name="change-email-unverified"),
    path("delete/request/", request_delete_account, name="delete-request"),
    path("delete/confirm/", confirm_delete_account, name="delete-confirm"),
    path("password/reset/request/", request_password_reset, name="password-reset-request"),
    path("password/reset/confirm/", confirm_password_reset, name="password-reset-confirm"),
]
