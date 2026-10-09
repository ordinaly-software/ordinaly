from django.urls import path, include
from rest_framework.routers import DefaultRouter, SimpleRouter
from . import newsletter_views, views
from .views import (
    NewsletterConfirmView,
    NewsletterSubscribeView,
    NewsletterSubscribersView,
    NewsletterUnsubscribeView,
)

router = DefaultRouter()
router.register(r'', views.UserViewSet)

# Must come before the user router: its empty prefix would otherwise swallow /newsletters/<pk>/.
newsletter_router = SimpleRouter()
newsletter_router.register(r'newsletters', newsletter_views.NewsletterViewSet, basename='newsletter')

urlpatterns = [
    path('', include(newsletter_router.urls)),
    path('', include(router.urls)),
    path("newsletter/subscribers/", NewsletterSubscribersView.as_view()),
    path("newsletter/subscribe/", NewsletterSubscribeView.as_view()),
    path("newsletter/confirm/", NewsletterConfirmView.as_view()),
    path("newsletter/unsubscribe/", NewsletterUnsubscribeView.as_view()),
    path("newsletter/track/o/<str:token>/", newsletter_views.newsletter_open_pixel),
    path("newsletter/track/c/<str:token>/", newsletter_views.newsletter_click),
]
