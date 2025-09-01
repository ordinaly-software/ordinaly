from django.urls import path, include

urlpatterns = [
    path('courses/', include('courses.urls')),
    path('terms/', include('terms.urls')),
    path('users/', include('users.urls')),
    path('services/', include('services.urls')),
]
