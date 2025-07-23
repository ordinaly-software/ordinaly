from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.home),  # main page view to test api connection
    path('courses/', include('courses.urls')),
    path('terms/', include('terms.urls')),
    path('users/', include('users.urls')),
    path('services/', include('services.urls')),
]
