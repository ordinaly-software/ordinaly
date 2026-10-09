"""Common email layer: renders emails/<template>.html + .txt and sends them
through Django's mail framework (backend chosen by ``settings.EMAIL_BACKEND``).
"""

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone

SITE_URL = "https://ordinaly.ai"


def branded_email_context(**extra) -> dict:
    """Context shared by every template that extends emails/base.*."""
    return {
        "site_url": SITE_URL,
        "frontend_base_url": settings.FRONTEND_BASE_URL.rstrip("/"),
        "contact_email": settings.CONTACT_EMAIL,
        "year": timezone.now().year,
        **extra,
    }


def send_branded_email(*, to: str, subject: str, template_name: str, **context) -> None:
    ctx = branded_email_context(subject=subject, **context)
    message = EmailMultiAlternatives(
        subject=subject,
        body=render_to_string(f"emails/{template_name}.txt", ctx),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to],
    )
    message.attach_alternative(render_to_string(f"emails/{template_name}.html", ctx), "text/html")
    message.send()
