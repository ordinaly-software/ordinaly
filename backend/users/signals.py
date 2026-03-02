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

    # Guardar en tu BD
    if instance.allow_notifications:
        NewsletterSubscriber.objects.get_or_create(
            email=email,
            defaults={"name": instance.first_name}
        )
    else:
        NewsletterSubscriber.objects.filter(email=email).delete()

    # Enviar a BillionMail (solo submit)
    if instance.allow_notifications:
        url = f"https://mail.ordinaly.ai/api/subscribe/submit?token={settings.BILLIONMAIL_FORM_TOKEN}"
        try:
            requests.post(url, json={"email": email}, timeout=5)
        except Exception:
            pass

