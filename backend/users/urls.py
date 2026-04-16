from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views 
from .views import NewsletterSubscribersView
from .views import newsletter_subscribe

router = DefaultRouter()
router.register(r'', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("newsletter/subscribers/", NewsletterSubscribersView.as_view()),
    path("newsletter/subscribe/", newsletter_subscribe), 
]
