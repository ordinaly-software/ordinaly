from django.contrib import admin
from .models import CustomUser
from .models import NewsletterSubscriber

admin.site.register(NewsletterSubscriber)
admin.site.register(CustomUser)
