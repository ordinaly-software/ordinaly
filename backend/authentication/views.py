import os
import requests
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.http import require_GET
from django.contrib.auth import get_user_model
from django.conf import settings

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .utils import create_internal_token


@require_GET
def google_login(request):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")

    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        "?response_type=code"
        f"&client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
        "&prompt=consent"
    )

    return redirect(url)


@require_GET
def google_callback(request):
    try:
        code = request.GET.get("code")
    
        if "error" in request.GET:
            return redirect("http://localhost:3000/auth/signin?error=cancelled")


        if not code:
            return JsonResponse({"error": "Missing code"}, status=400)

        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
            "grant_type": "authorization_code",
        }

        token_response = requests.post(token_url, data=data).json()

        if "id_token" not in token_response:
            return JsonResponse({"error": "Token exchange failed", "details": token_response}, status=400)

        id_token_google = token_response["id_token"]

        try:
            google_info = id_token.verify_oauth2_token(
                id_token_google,
                google_requests.Request(),
                os.getenv("GOOGLE_CLIENT_ID")
            )
        except Exception as e:
            print("Error validando id_token:", e)
            return redirect("http://localhost:3000/auth/signin?error=invalid_token")

        email = google_info.get("email")
        name = google_info.get("name")
        picture = google_info.get("picture")
        google_sub = google_info.get("sub")


        User = get_user_model()
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": email, "first_name": name}
        )

        if not getattr(user, "google_sub", None):
            user.google_sub = google_sub
            user.save()

        token = create_internal_token(user)
    
        user = User.objects.filter(email=email).first()
        if user and user.google_sub and user.google_sub != google_sub: 
            return redirect("http://localhost:3000/auth/signin?error=account_conflict")

        return redirect(f"http://localhost:3000/auth/callback?token={token}")
    except Exception as e:
        print("Unexpected OAuth error:", e)
        return redirect("http://localhost:3000/auth/signin?error=unexpected")

