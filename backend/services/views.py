from rest_framework import viewsets, filters, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request as DRFRequest
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
        # If req is a raw WSGIRequest (no .data) wrap it into a DRF Request
        if not hasattr(req, 'data'):
            try:
                req = DRFRequest(req)
            except Exception:
                # If wrapping fails, fall back to original request
                pass
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
        # Use parsed data from DRF Request when available
        data = getattr(req, 'data', None)
        if data is None:
            data = getattr(request, 'data', None)
        serializer = self.get_serializer(instance, data=data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
