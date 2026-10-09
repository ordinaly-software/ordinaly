from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import CustomUser, NewsletterSubscriber


@receiver(post_save, sender=CustomUser)
def sync_newsletter_subscription(sender, instance, **kwargs):
    if instance.allow_notifications:
        NewsletterSubscriber.objects.get_or_create(
            email=instance.email,
            defaults={"name": getattr(instance, "name", "")},
        )
    else:
        NewsletterSubscriber.objects.filter(email=instance.email).delete()
