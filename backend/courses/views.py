from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer


class IsAdminUserOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow admin users to edit."""

    def has_permission(self, request, view):
        # Read permissions are allowed to any request (including anonymous)
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to authenticated admin users
        return request.user and request.user.is_authenticated and request.user.is_staff


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
        except Exception:
            return Response(
                {"detail": "An error occurred while deleting the course."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Override update method to handle file replacement properly."""
        try:
            return super().update(request, *args, **kwargs)
        except Exception:
            return Response(
                {"detail": "An error occurred while updating the course."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def partial_update(self, request, *args, **kwargs):
        """Override partial_update method to handle file replacement properly."""
        try:
            return super().partial_update(request, *args, **kwargs)
        except Exception:
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

        # Check if the course has a start date
        if course.start_date is None or course.end_date is None:
            return Response(
                {"detail": "Cannot enroll in a course without specified dates."},
                status=status.HTTP_400_BAD_REQUEST
            )

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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unenroll(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        course = self.get_object()
        user = request.user

        # Check if user is enrolled
        try:
            enrollment = Enrollment.objects.get(user=user, course=course)
            enrollment.delete()
            return Response(
                {"detail": "Successfully unenrolled from the course."},
                status=status.HTTP_200_OK
            )
        except Enrollment.DoesNotExist:
            return Response(
                {"detail": "You are not enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated],
            url_path='calendar-export-test')
    def calendar_export_test(self, request, pk=None):
        """Export course schedule to various calendar formats (test endpoint)"""
        course = self.get_object()

        # Check if user is enrolled in the course
        if not Enrollment.objects.filter(user=request.user, course=course).exists():
            return Response(
                {"detail": "You must be enrolled in this course to export calendar events."},
                status=status.HTTP_403_FORBIDDEN
            )
        format_type = request.query_params.get('calendar_format', 'google')
        if format_type not in ['google', 'outlook', 'ics']:
            return Response(
                {"detail": "Invalid format. Supported formats: google, outlook, ics"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            export_data = course.get_calendar_export_data(format_type)
            if format_type == 'ics':
                # Return ICS file for download
                response = HttpResponse(export_data, content_type='text/calendar')
                response['Content-Disposition'] = f'attachment; filename="{course.title}.ics"'
                return response
            else:
                # Return JSON with calendar URLs
                return Response({
                    'course': course.title,
                    'format': format_type,
                    'events': export_data
                })
        except Exception:
            return Response(
                {"detail": "An error occurred while generating the calendar export."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return empty queryset if user is not authenticated
        # The permission class will handle the authentication error
        if not self.request.user.is_authenticated:
            return Enrollment.objects.none()

        # Regular users can only see their own enrollments
        if not self.request.user.is_staff:
            return Enrollment.objects.filter(user=self.request.user)
        # Admin users can see all enrollments
        return Enrollment.objects.all()
