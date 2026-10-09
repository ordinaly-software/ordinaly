"""Rendering, tracking, fan-out and sending of newsletters."""
import html
import re
from urllib.parse import urlparse

from django.conf import settings
from django.core import signing
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.db.models import F
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

from users.models import EmailNotificationJob, Newsletter, NewsletterDelivery, NewsletterSubscriber
from users.services.mail import branded_email_context
from users.services.newsletter_service import make_unsubscribe_token, unsubscribe_url

OPEN_SALT = "newsletter-open"
CLICK_SALT = "newsletter-click"

_HREF_RE = re.compile(r'href="(https?://[^"]+)"', re.IGNORECASE)
_LINK_RE = re.compile(r'<a\s[^>]*href="([^"]+)"[^>]*>(.*?)</a>', re.IGNORECASE | re.DOTALL)


def _backend_url(path: str) -> str:
    return f"{settings.BACKEND_BASE_URL.rstrip('/')}{path}"


# --- tracking ---------------------------------------------------------------------------------

def make_open_token(delivery) -> str:
    return signing.dumps(delivery.pk, salt=OPEN_SALT)


def make_click_token(delivery, url: str) -> str:
    # The URL is signed with the delivery, so the redirect endpoint can't be abused as an open redirect.
    return signing.dumps({"d": delivery.pk, "u": url}, salt=CLICK_SALT)


def record_open(token) -> None:
    try:
        delivery_id = signing.loads(token, salt=OPEN_SALT)
    except signing.BadSignature:
        return
    NewsletterDelivery.objects.filter(pk=delivery_id, opened_at__isnull=True).update(opened_at=timezone.now())
    NewsletterDelivery.objects.filter(pk=delivery_id).update(open_count=F("open_count") + 1)


def resolve_click(token):
    """Count the click and return the destination URL, or None if the token is not valid."""
    try:
        data = signing.loads(token, salt=CLICK_SALT)
        delivery_id, url = data["d"], data["u"]
    except (signing.BadSignature, KeyError, TypeError):
        return None
    if urlparse(url).scheme not in ("http", "https"):
        return None
    NewsletterDelivery.objects.filter(pk=delivery_id, clicked_at__isnull=True).update(clicked_at=timezone.now())
    NewsletterDelivery.objects.filter(pk=delivery_id).update(click_count=F("click_count") + 1)
    return url


# --- rendering --------------------------------------------------------------------------------

def _track_links(content: str, delivery) -> str:
    def rewrite(match):
        url = html.unescape(match.group(1))
        if "/newsletter/unsubscribe" in url:
            return match.group(0)
        tracked = _backend_url(f"/api/newsletter/track/c/{make_click_token(delivery, url)}/")
        return f'href="{tracked}"'

    return _HREF_RE.sub(rewrite, content)


def _html_to_text(content: str) -> str:
    with_links = _LINK_RE.sub(lambda m: f"{strip_tags(m.group(2)).strip()} ({m.group(1)})", content)
    text = html.unescape(strip_tags(re.sub(r"<(br|/p|/div|/h[1-6]|/li)\s*/?>", "\n", with_links, flags=re.IGNORECASE)))
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def render_newsletter(newsletter, *, name: str, unsubscribe_link: str, delivery=None, subject=None):
    """Return (html, text). `delivery` enables open/click tracking; previews and tests omit it."""
    content = (newsletter.html_body or "").replace("{{unsubscribe_url}}", unsubscribe_link)
    content = content.replace("{{name}}", html.escape(name or ""))
    # The plain-text part keeps the original URLs: no tracking, and readable.
    content_text = _html_to_text(content)
    if delivery is not None:
        content = _track_links(content, delivery)
    context = branded_email_context(
        subject=subject if subject is not None else newsletter.subject,
        content=content,
        content_text=content_text,
        unsubscribe_url=unsubscribe_link,
        open_pixel_url=_backend_url(f"/api/newsletter/track/o/{make_open_token(delivery)}/") if delivery else "",
    )
    return render_to_string("emails/newsletter.html", context), render_to_string("emails/newsletter.txt", context)


def _send(*, to, subject, text, html_body, headers=None):
    message = EmailMultiAlternatives(
        subject=subject,
        body=text,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to],
        headers=headers or {},
    )
    message.attach_alternative(html_body, "text/html")
    message.send()


def send_delivery(delivery) -> bool:
    """Send one subscriber's copy. Returns False when it was skipped (cancelled or no longer subscribed)."""
    newsletter, sub = delivery.newsletter, delivery.subscriber
    if newsletter.status == Newsletter.STATUS_CANCELLED:
        return False
    if sub is None or sub.status != NewsletterSubscriber.STATUS_ACTIVE:
        return False

    token = make_unsubscribe_token(sub)
    html_body, text = render_newsletter(
        newsletter, name=sub.name, unsubscribe_link=unsubscribe_url(sub), delivery=delivery
    )
    _send(
        to=sub.email,
        subject=newsletter.subject,
        text=text,
        html_body=html_body,
        headers={
            "List-Unsubscribe": f"<{_backend_url(f'/api/newsletter/unsubscribe/?token={token}')}>, "
                                f"<mailto:{settings.CONTACT_EMAIL}?subject=unsubscribe>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
    )
    NewsletterDelivery.objects.filter(pk=delivery.pk).update(sent_at=timezone.now())
    return True


def send_test(newsletter, to_email: str) -> None:
    link = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/newsletter/unsubscribe"
    subject = f"[PRUEBA] {newsletter.subject}"
    html_body, text = render_newsletter(newsletter, name="", unsubscribe_link=link, subject=subject)
    _send(to=to_email, subject=subject, text=text, html_body=html_body)


# --- scheduling -------------------------------------------------------------------------------

def _job_key_prefix(newsletter) -> str:
    return f"newsletter:{newsletter.pk}:"


def enqueue_due_newsletters(*, now=None) -> int:
    """Fan due newsletters out into one queued job per active subscriber, and close finished ones."""
    from users.services.notification_service import NOTIFICATION_NEWSLETTER, queue_email_notification

    now = now or timezone.now()
    started = 0

    for newsletter in Newsletter.objects.filter(status=Newsletter.STATUS_SCHEDULED, scheduled_for__lte=now):
        with transaction.atomic():
            claimed = Newsletter.objects.filter(pk=newsletter.pk, status=Newsletter.STATUS_SCHEDULED).update(
                status=Newsletter.STATUS_SENDING, started_at=now
            )
            if not claimed:
                continue
            for sub in NewsletterSubscriber.objects.filter(status=NewsletterSubscriber.STATUS_ACTIVE):
                delivery, _ = NewsletterDelivery.objects.get_or_create(newsletter=newsletter, subscriber=sub)
                queue_email_notification(
                    None,
                    NOTIFICATION_NEWSLETTER,
                    force=True,
                    unique_key=f"{_job_key_prefix(newsletter)}{sub.pk}",
                    recipient_email=sub.email,
                    delivery_id=delivery.pk,
                )
        started += 1

    for newsletter in Newsletter.objects.filter(status=Newsletter.STATUS_SENDING):
        unfinished = EmailNotificationJob.objects.filter(
            unique_key__startswith=_job_key_prefix(newsletter),
            status__in=[EmailNotificationJob.STATUS_PENDING, EmailNotificationJob.STATUS_PROCESSING],
        )
        if not unfinished.exists():
            Newsletter.objects.filter(pk=newsletter.pk, status=Newsletter.STATUS_SENDING).update(
                status=Newsletter.STATUS_SENT, sent_at=now
            )
    return started


def cancel_sending(newsletter) -> int:
    """Stop a newsletter that is going out: drop the jobs not yet sent."""
    deleted, _ = EmailNotificationJob.objects.filter(
        unique_key__startswith=_job_key_prefix(newsletter),
        status=EmailNotificationJob.STATUS_PENDING,
    ).delete()
    newsletter.status = Newsletter.STATUS_CANCELLED
    newsletter.save(update_fields=["status", "updated_at"])
    return deleted
