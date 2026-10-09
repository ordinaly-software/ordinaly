import logging
from datetime import timedelta

from django.conf import settings
from django.core import signing
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.utils import timezone

from users.models import CustomUser, NewsletterSubscriber

logger = logging.getLogger(__name__)

CONFIRM_SALT = "newsletter-confirm"
UNSUBSCRIBE_SALT = "newsletter-unsubscribe"
CONFIRM_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 3600
CONFIRMATION_RESEND_COOLDOWN = timedelta(minutes=5)


class InvalidNewsletterToken(Exception):
    pass


class InvalidNewsletterEmail(Exception):
    pass


def sync_user_subscription(user):
    """Mirror a user's email, name and newsletter opt-in into the unified subscriber list."""
    with transaction.atomic():
        sub = NewsletterSubscriber.objects.filter(user=user).first()
        if sub is None:
            # Banner sign-up made before the account existed, or a row from before users were linked.
            sub = NewsletterSubscriber.objects.filter(user__isnull=True, email__iexact=user.email).first()

        if not user.allow_notifications:
            # An unlinked banner sign-up is a separate consent: opting out of the account
            # preference must not cancel it.
            if sub and sub.user_id == user.pk and sub.status != NewsletterSubscriber.STATUS_UNSUBSCRIBED:
                sub.status = NewsletterSubscriber.STATUS_UNSUBSCRIBED
                sub.unsubscribed_at = timezone.now()
                _apply_identity(sub, user)
                sub.save()
            return sub

        if sub is None:
            sub = NewsletterSubscriber(source=NewsletterSubscriber.SOURCE_ACCOUNT)
        sub.user = user
        _apply_identity(sub, user)
        # The opt-in only counts once the address is proven to be theirs: a verified account,
        # or a banner sign-up that was already confirmed through the email link.
        if user.email_verified_at or sub.confirmed_at:
            if sub.status != NewsletterSubscriber.STATUS_ACTIVE or not sub.confirmed_at:
                sub.status = NewsletterSubscriber.STATUS_ACTIVE
                sub.confirmed_at = sub.confirmed_at or timezone.now()
                sub.unsubscribed_at = None
        else:
            sub.status = NewsletterSubscriber.STATUS_PENDING
        sub.save()
        return sub


def _apply_identity(sub, user):
    # Free the address if an unlinked banner sign-up already holds it (the account takes over).
    NewsletterSubscriber.objects.filter(
        user__isnull=True, email__iexact=user.email
    ).exclude(pk=sub.pk).delete()
    sub.email = user.email
    sub.name = getattr(user, "name", "") or ""


def make_confirm_token(sub) -> str:
    return signing.dumps({"id": sub.pk, "email": sub.email}, salt=CONFIRM_SALT)


def make_unsubscribe_token(sub) -> str:
    """Never expires: the link in an old newsletter must keep working."""
    return signing.dumps({"id": sub.pk}, salt=UNSUBSCRIBE_SALT)


def unsubscribe_url(sub) -> str:
    return f"{settings.FRONTEND_BASE_URL.rstrip('/')}/newsletter/unsubscribe?token={make_unsubscribe_token(sub)}"


def _load_subscriber(token, salt, **kwargs):
    try:
        data = signing.loads(token, salt=salt, **kwargs)
        return data, NewsletterSubscriber.objects.get(pk=data["id"])
    except (signing.BadSignature, KeyError, TypeError, NewsletterSubscriber.DoesNotExist) as exc:
        raise InvalidNewsletterToken() from exc


def request_banner_subscription(raw_email) -> None:
    """Start (or restart) a double opt-in. Never reveals whether the address is already subscribed."""
    from users.services.notification_service import queue_and_dispatch_newsletter_confirmation

    email = (raw_email or "").strip().lower()
    try:
        validate_email(email)
    except ValidationError as exc:
        raise InvalidNewsletterEmail() from exc

    now = timezone.now()
    with transaction.atomic():
        sub = NewsletterSubscriber.objects.select_for_update().filter(email__iexact=email).first()
        if sub is None:
            sub = NewsletterSubscriber(email=email, source=NewsletterSubscriber.SOURCE_BANNER)
        elif sub.status == NewsletterSubscriber.STATUS_ACTIVE:
            return
        elif sub.confirmation_sent_at and now - sub.confirmation_sent_at < CONFIRMATION_RESEND_COOLDOWN:
            return

        sub.status = NewsletterSubscriber.STATUS_PENDING
        sub.confirmation_sent_at = now
        sub.save()

    try:
        queue_and_dispatch_newsletter_confirmation(sub)
    except Exception:
        # The job stays queued and is retried by the notification worker.
        logger.exception("Newsletter confirmation email failed for subscriber %s", sub.pk)


def confirm_banner_subscription(token) -> NewsletterSubscriber:
    data, sub = _load_subscriber(token, CONFIRM_SALT, max_age=CONFIRM_TOKEN_MAX_AGE_SECONDS)
    if sub.email != data.get("email"):
        raise InvalidNewsletterToken()

    user = CustomUser.objects.filter(email__iexact=sub.email, email_verified_at__isnull=False).first()
    if user:
        # Verified account owner: the opt-in lives on the account so both views stay in sync.
        if not user.allow_notifications:
            user.allow_notifications = True
            user.save(update_fields=["allow_notifications"])
        sub.refresh_from_db()
        if sub.status == NewsletterSubscriber.STATUS_ACTIVE:
            return sub

    sub.status = NewsletterSubscriber.STATUS_ACTIVE
    sub.confirmed_at = sub.confirmed_at or timezone.now()
    sub.unsubscribed_at = None
    sub.save()
    return sub


def unsubscribe(token) -> NewsletterSubscriber:
    _, sub = _load_subscriber(token, UNSUBSCRIBE_SALT)
    if sub.user_id:
        user = sub.user
        if user.allow_notifications:
            user.allow_notifications = False
            user.save(update_fields=["allow_notifications"])
        sub.refresh_from_db()
    if sub.status != NewsletterSubscriber.STATUS_UNSUBSCRIBED:
        sub.status = NewsletterSubscriber.STATUS_UNSUBSCRIBED
        sub.unsubscribed_at = timezone.now()
        sub.save()
    return sub
