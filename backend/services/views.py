from rest_framework import viewsets, filters, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
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
            # Try underlying WSGIRequest if present (APIRequestFactory/force_authenticate sometimes sets there)
            raw = getattr(self.request, '_request', None)
            if raw:
                user = getattr(raw, 'user', None)

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
            raw = getattr(self.request, '_request', None)
            if raw:
                user = getattr(raw, 'user', None)
        serializer.save(created_by=user)

    def update(self, request, *args, **kwargs):
        # Resolve authenticated user from request or underlying WSGIRequest
        user = getattr(request, 'user', None)
        if not user:
            raw = getattr(request, '_request', None)
            if raw:
                user = getattr(raw, 'user', None)
        if not (user and getattr(user, 'is_authenticated', False)):
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
