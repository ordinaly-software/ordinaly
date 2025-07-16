from django.urls import path
from . import views

urlpatterns = [
    path('', views.home),  # main page view to test api connection
]
