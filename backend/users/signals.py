import requests
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser

BILLIONMAIL_API_KEY = settings.BILLIONMAIL_API_KEY
BILLIONMAIL_GROUP_ID_NEWSLETTER = settings.BILLIONMAIL_GROUP_ID_NEWSLETTER 

BASE_URL = "https://api.billionmail.com"

@receiver(post_save, sender=CustomUser)
def sync_billionmail_subscription(sender, instance, **kwargs):
    email = instance.email

    headers = {
        "Authorization": f"Bearer {BILLIONMAIL_API_KEY}",
        "Content-Type": "application/json"
    }

    if instance.allow_notifications:
        url = f"{BASE_URL}/groups/{BILLIONMAIL_GROUP_ID_NEWSLETTER}/members"
        data = {"email": email}

        try:
            requests.post(url, json=data, headers=headers, timeout=5)
        except Exception:
            pass 
    else:
        url = f"{BASE_URL}/groups/{BILLIONMAIL_GROUP_ID_NEWSLETTER}/members/{email}"

        try:
            requests.delete(url, headers=headers, timeout=5)
        except Exception:
            pass
