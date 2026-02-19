import jwt
import datetime
from django.conf import settings

def create_internal_token(user):
    payload = {
        "user_id": user.id,
        "email": user.email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24),
        "iat": datetime.datetime.utcnow(),
    }

    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
