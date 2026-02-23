from django.http import JsonResponse
from django.urls import resolve

ALLOWED_UNVERIFIED_PATHS = [
    "signup",
    "verify-email",
    "resend-verification",
    "change-email-unverified",
    "login",
    "logout",
]

class EmailVerificationRequiredMiddleware:
    #Blocks access to protected endpoints if the user has not verified their email.

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = request.user

        if not user.is_authenticated:
            return self.get_response(request)

        if user.email_verified_at:
            return self.get_response(request)

        # Get name of current view
        resolver = resolve(request.path)
        current_view = resolver.url_name

        if current_view in ALLOWED_UNVERIFIED_PATHS:
            return self.get_response(request)

        return JsonResponse(
            {"detail": "Tu cuenta aún no está verificada."},
            status=403
        )
