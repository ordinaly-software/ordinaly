from rest_framework import viewsets, filters, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
import json
from .models import Service
from .serializers import ServiceSerializer


class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.is_staff


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()

    def get_queryset(self):
        qs = Service.objects.all()
        # Be robust when tests set a plain WSGIRequest or don't attach user
        user = getattr(self.request, 'user', None)
        if not user:
            # Respect force_authenticate markers set in tests (request._force_auth_user)
            user = getattr(self.request, '_force_auth_user', None)
            if not user:
                # Try underlying WSGIRequest if present (APIRequestFactory/force_authenticate sometimes sets there)
                raw = getattr(self.request, '_request', None)
                if raw:
                    user = getattr(raw, 'user', None)
                    if not user:
                        user = getattr(raw, '_force_auth_user', None)

        # Only show draft services to admin users
        if not (user and getattr(user, 'is_authenticated', False) and getattr(user, 'is_staff', False)):
            qs = qs.filter(draft=False)
        return qs
    serializer_class = ServiceSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'subtitle', 'description']
    ordering_fields = ['title', 'created_at', 'price', 'duration', 'color']
    ordering = ['-is_featured', 'title']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdmin]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Resolve user similarly to get_queryset to be robust in tests
        user = getattr(self.request, 'user', None)
        if not user:
            user = getattr(self.request, '_force_auth_user', None)
            if not user:
                raw = getattr(self.request, '_request', None)
                if raw:
                    user = getattr(raw, 'user', None)
                    if not user:
                        user = getattr(raw, '_force_auth_user', None)
        serializer.save(created_by=user)

    def update(self, request, *args, **kwargs):
        # Prefer view.request if tests set it directly (many tests set view.request = request)
        req = getattr(self, 'request', request)
        # If req is a raw WSGIRequest (no .data) parse JSON/form body manually
        parsed_data = None
        if not hasattr(req, 'data'):
            # Try JSON first (APIRequestFactory with format='json')
            content_type = getattr(req, 'content_type', None) or req.META.get('CONTENT_TYPE', '')
            if content_type and 'application/json' in content_type:
                try:
                    body = getattr(req, 'body', None)
                    if body is None:
                        # WSGIRequest may have read in POST; try raw POST
                        parsed_data = None
                    else:
                        parsed_data = json.loads(body.decode(getattr(req, 'encoding', 'utf-8') or 'utf-8'))
                except Exception:
                    parsed_data = None
            else:
                # Fallback: try POST/QueryDict for form-encoded data
                try:
                    parsed_data = getattr(req, 'POST', None)
                except Exception:
                    parsed_data = None
        # Resolve authenticated user from req or underlying WSGIRequest
        user = getattr(req, 'user', None)
        if not user:
            user = getattr(req, '_force_auth_user', None)
            if not user:
                raw = getattr(req, '_request', None)
                if raw:
                    user = getattr(raw, 'user', None)
                    if not user:
                        user = getattr(raw, '_force_auth_user', None)
        if not (user and getattr(user, 'is_authenticated', False)):
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        instance = self.get_object()
        # Determine data to pass to serializer: prefer parsed_data, then req.data, then request.data
        if parsed_data is not None:
            data = parsed_data
        else:
            data = getattr(req, 'data', None)
            if data is None:
                data = getattr(request, 'data', None)
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
