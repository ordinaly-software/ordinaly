from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
import logging
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer

logger = logging.getLogger(__name__)


class IsAdminUserOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow admin users to edit."""

    def has_permission(self, request, view):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to admin users
        return request.user and request.user.is_staff


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdminUserOrReadOnly]

    def destroy(self, request, *args, **kwargs):
        """Override destroy method to handle file deletion properly."""
        try:
            instance = self.get_object()
            # The file deletion is handled in the model's delete method
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting course {kwargs.get('pk')}: {str(e)}")
            return Response(
                {"detail": "An error occurred while deleting the course."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Override update method to handle file replacement properly."""
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error updating course {kwargs.get('pk')}: {str(e)}")
            return Response(
                {"detail": "An error occurred while updating the course."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def partial_update(self, request, *args, **kwargs):
        """Override partial_update method to handle file replacement properly."""
        try:
            return super().partial_update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error updating course {kwargs.get('pk')}: {str(e)}")
            return Response(
                {"detail": "An error occurred while updating the course."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        course = self.get_object()
        user = request.user

        # Check if the course is full
        if course.enrollments.count() >= course.max_attendants:
            return Response(
                {"detail": "This course is already full."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user is already enrolled
        if Enrollment.objects.filter(user=user, course=course).exists():
            return Response(
                {"detail": "You are already enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create enrollment
        enrollment = Enrollment.objects.create(user=user, course=course)
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        # Regular users can only see their own enrollments
        if not self.request.user.is_staff:
            return Enrollment.objects.filter(user=self.request.user)
        # Admin users can see all enrollments
        return Enrollment.objects.all()
