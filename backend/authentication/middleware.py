from django.http import JsonResponse
from django.urls import resolve

ALLOWED_UNVERIFIED_PATHS = [
    # Auth app named routes
    "signup",
    "login",
    "verify-email",
    "resend-verification",
    "change-email-unverified",
    "password-reset-request",
    "password-reset-confirm",
    "delete-confirm",
    # DRF router-generated names (UserViewSet, basename=customuser)
    "customuser-signout",
    "customuser-signin",
    "customuser-signup",
]

# Read-only methods that never modify the database
SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


class EmailVerificationRequiredMiddleware:
    """Blocks mutating requests to protected endpoints if the user has not verified their email."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = request.user

        if not user.is_authenticated:
            return self.get_response(request)

        if user.email_verified_at:
            return self.get_response(request)

        # Always allow superusers and staff (Django admin access)
        if user.is_superuser or user.is_staff:
            return self.get_response(request)

        # Always allow Django admin paths
        if request.path.startswith("/admin/"):
            return self.get_response(request)

        # Allow read-only methods so unverified users can browse the app
        if request.method in SAFE_METHODS:
            return self.get_response(request)

        # Get name of current view
        try:
            resolver = resolve(request.path)
            current_view = resolver.url_name
        except Exception:
            current_view = None

        if current_view in ALLOWED_UNVERIFIED_PATHS:
            return self.get_response(request)

        return JsonResponse(
            {
                "code": "email_not_verified",
                "detail": "Tu cuenta aún no está verificada.",
                "email": user.email,
            },
            status=403,
        )
