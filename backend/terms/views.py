from rest_framework import filters, viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from .models import Terms
from .serializers import TermsSerializer


class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.is_staff


class TermsViewSet(viewsets.ModelViewSet):
    queryset = Terms.objects.all().order_by('-updated_at')
    serializer_class = TermsSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['tag', 'name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        tag = self.request.query_params.get('tag', None)
        if tag:
            return queryset.filter(tag=tag)
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def create(self, request, *args, **kwargs):
        tag = request.data.get('tag')
        if tag and Terms.objects.filter(tag=tag).exists():
            return Response(
                {'tag': [f'A "{dict(Terms.TAG_CHOICES).get(tag, tag)}" document already exists.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            # Use e.messages to return the error messages
            return Response({'detail': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
