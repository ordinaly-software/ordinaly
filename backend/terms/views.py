from rest_framework import filters, viewsets, status
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.exceptions import ValidationError
import logging
from .models import Terms
from .serializers import TermsSerializer

logger = logging.getLogger(__name__)


class IsAdmin(BasePermission):
    """
    Custom permission to only allow admin users.
    Returns 403 for both unauthenticated and non-admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class TermsViewSet(viewsets.ModelViewSet):
    queryset = Terms.objects.all().order_by('-updated_at')
    serializer_class = TermsSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['tag', 'name']
    # Override authentication to avoid 401 responses for unauthenticated users
    authentication_classes = []
    permission_classes = []  # Override default permissions

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

    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def available_tags(self, request):
        """Return tags that haven't been used yet."""
        existing_tags = set(Terms.objects.values_list('tag', flat=True))
        all_tags = dict(Terms.TAG_CHOICES)
        available_tags = []

        for tag_key, tag_display in all_tags.items():
            if tag_key not in existing_tags:
                available_tags.append({
                    'value': tag_key,
                    'label': tag_key  # Send key for translation lookup
                })

        return Response({
            'available_tags': available_tags,
            'total_available': len(available_tags),
            'total_possible': len(all_tags)
        })

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Override destroy method to handle file deletion properly."""
        try:
            instance = self.get_object()
            # The file deletion is handled in the model's delete method
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting terms {kwargs.get('pk')}: {str(e)}")
            return Response(
                {"detail": "An error occurred while deleting the document."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Override update method to handle file replacement properly."""
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error updating terms {kwargs.get('pk')}: {str(e)}")
            return Response(
                {"detail": "An error occurred while updating the document."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def partial_update(self, request, *args, **kwargs):
        """Override partial_update method to handle file replacement properly."""
        try:
            return super().partial_update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error updating terms {kwargs.get('pk')}: {str(e)}")
            return Response(
                {"detail": "An error occurred while updating the document."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        tag = request.data.get('tag')
        if tag and Terms.objects.filter(tag=tag).exists():
            tag_display = dict(Terms.TAG_CHOICES).get(tag, tag)
            return Response(
                {'tag': [f'A "{tag_display}" document already exists. Each document type can only be created once.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            # Use e.messages to return the error messages
            return Response({'detail': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
