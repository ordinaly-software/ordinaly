from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import CustomUser
from .services.newsletter_service import sync_user_subscription

NEWSLETTER_FIELDS = {"email", "name", "allow_notifications", "email_verified_at"}


@receiver(post_save, sender=CustomUser)
def sync_newsletter_subscription(sender, instance, update_fields=None, raw=False, **kwargs):
    if raw:
        return
    if update_fields is not None and not NEWSLETTER_FIELDS.intersection(update_fields):
        return
    sync_user_subscription(instance)
