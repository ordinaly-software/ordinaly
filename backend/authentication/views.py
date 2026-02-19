import os
import requests
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.http import require_GET
from django.contrib.auth import get_user_model 
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
    code = request.GET.get("code")

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

    if "access_token" not in token_response:
        return JsonResponse({"error": "Token exchange failed", "details": token_response}, status=400)

    access_token = token_response["access_token"]
    
    User = get_user_model()

    user_info = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()
    
    email = user_info.get("email")
    name = user_info.get("name")
    picture = user_info.get("picture")
    google_sub = user_info.get("id") or user_info.get("sub")

    # Buscar usuario existente
    user, created = User.objects.get_or_create(
    email=email,
    defaults={
        "username": email,
        "first_name": name,
    }
)

    # Guardar google_sub si no está
    if not hasattr(user, "google_sub") or not user.google_sub:
        user.google_sub = google_sub
        user.save()

    # Crear token interno
    token = create_internal_token(user)

    # Redirigir al frontend con el token
    return redirect(f"http://localhost:3000/auth/callback?token={token}")

