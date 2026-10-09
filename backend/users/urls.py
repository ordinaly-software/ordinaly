from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views 
from .views import (
    NewsletterConfirmView,
    NewsletterSubscribeView,
    NewsletterSubscribersView,
    NewsletterUnsubscribeView,
)

router = DefaultRouter()
router.register(r'', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("newsletter/subscribers/", NewsletterSubscribersView.as_view()),
    path("newsletter/subscribe/", NewsletterSubscribeView.as_view()),
    path("newsletter/confirm/", NewsletterConfirmView.as_view()),
    path("newsletter/unsubscribe/", NewsletterUnsubscribeView.as_view()),
]
