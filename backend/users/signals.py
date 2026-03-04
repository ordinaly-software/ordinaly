import requests
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser
from .models import CustomUser, NewsletterSubscriber

BILLIONMAIL_API_KEY = settings.BILLIONMAIL_API_KEY
BILLIONMAIL_GROUP_ID_NEWSLETTER = settings.BILLIONMAIL_GROUP_ID_NEWSLETTER 

BASE_URL = "https://api.billionmail.com"



@receiver(post_save, sender=CustomUser)
def sync_billionmail_subscription(sender, instance, **kwargs):
    email = instance.email
    user_name = getattr(instance, "name", "")

    # Guardar en tu BD local
    if instance.allow_notifications:
        NewsletterSubscriber.objects.get_or_create(
            email=email,
            defaults={"name": user_name}
        )
    else:
        NewsletterSubscriber.objects.filter(email=email).delete()

    if instance.allow_notifications:
        url = f"https://api.billionmail.com/v1/groups/{settings.BILLIONMAIL_GROUP_ID_NEWSLETTER}/subscribers"
        headers = {
            "Authorization": f"Bearer {settings.BILLIONMAIL_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {"email": email, "name": user_name}

        try:
            requests.post(url, json=data, headers=headers, timeout=5)
        except Exception:
            pass


