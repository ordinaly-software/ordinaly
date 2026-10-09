"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.permissions import AllowAny
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

# The API docs are public (they only describe the contract); trying a request
# from Swagger still needs a token, via the "Authorize" button.
DOCS_VIEW_KWARGS = {'permission_classes': [AllowAny], 'authentication_classes': []}

urlpatterns = [
    path('admin/', admin.site.urls),
    # Before the api/ includes: their slug routes would otherwise swallow api/docs/.
    path('api/schema/', SpectacularAPIView.as_view(**DOCS_VIEW_KWARGS), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema', **DOCS_VIEW_KWARGS), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema', **DOCS_VIEW_KWARGS), name='redoc'),
    path('api/', include('api.urls')),
    path('auth/', include('authentication.urls')),
    path('api/', include('users.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
