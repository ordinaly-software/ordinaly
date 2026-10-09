from django.core import signing
from django.utils import timezone
from rest_framework.authtoken.models import Token

from users.services.notification_service import queue_and_dispatch_account_created_notification

GOOGLE_LINK_SALT = "google-link"
GOOGLE_LINK_MAX_AGE_SECONDS = 600


def create_internal_token(user):
    token, _ = Token.objects.get_or_create(user=user)
    return token.key


def mark_email_verified(user, *, send_welcome=True):
    """Same effect as completing the email OTP: the address is proven to be the user's."""
    user.email_verified_at = timezone.now()
    user.status = "active"
    user.save(update_fields=["email_verified_at", "status"])
    if send_welcome:
        try:
            queue_and_dispatch_account_created_notification(user)
        except Exception:
            pass


GOOGLE_ONLY_MESSAGE = "This account uses Google sign-in"


def is_google_only_account(identifier):
    """True if `identifier` (email or username) belongs to an account that can only sign in with Google."""
    from django.contrib.auth import get_user_model
    from django.db.models import Q

    identifier = (identifier or "").strip()
    if not identifier:
        return False
    user = get_user_model().objects.filter(Q(email__iexact=identifier) | Q(username__iexact=identifier)).first()
    return bool(user and user.google_sub and not user.has_usable_password())


def make_google_link_state(user):
    """Signed, short-lived proof of who started the "connect Google" flow (the callback has no token)."""
    return signing.dumps({"uid": user.pk}, salt=GOOGLE_LINK_SALT)


def read_google_link_state(state):
    try:
        return signing.loads(state, salt=GOOGLE_LINK_SALT, max_age=GOOGLE_LINK_MAX_AGE_SECONDS)["uid"]
    except (signing.BadSignature, KeyError, TypeError):
        return None
