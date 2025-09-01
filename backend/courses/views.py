from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer
from django.conf import settings
from django.utils import timezone

# Stripe webhook endpoint to handle payment events
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import stripe
from decimal import Decimal
import os


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

    def get_queryset(self):
        qs = Course.objects.all()
        user = self.request.user
        # Only show draft courses to admin users
        if not (user and user.is_authenticated and user.is_staff):
            qs = qs.filter(draft=False)
        return qs
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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated],
            url_path='create-checkout-session')
    def create_checkout_session(self, request, pk=None):
        """Create a Stripe Checkout session for the course, or enroll directly if free."""
        course = self.get_object()
        user = self.request.user

        # Check if user is already enrolled
        if Enrollment.objects.filter(user=user, course=course).exists():
            return Response({"detail": "You are already enrolled in this course."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Check if the course has a start date
        if course.start_date is None or course.end_date is None:
            return Response({"detail": "Cannot enroll in a course without specified dates."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Check if the course is full
        if course.enrollments.count() >= course.max_attendants:
            return Response({"detail": "This course is already full."},
                            status=status.HTTP_400_BAD_REQUEST)

        # If course is free, enroll directly
        if course.price is None or course.price == Decimal('0.00'):
            enrollment = Enrollment.objects.create(user=user, course=course)
            serializer = EnrollmentSerializer(enrollment)
            return Response({"enrolled": True, "enrollment": serializer.data})

        if not stripe.api_key:
            return Response({"detail": "Stripe secret key not configured."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Create Stripe Checkout session
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": course.title,
                            "description": course.subtitle or "",
                        },
                        "unit_amount": int(course.price * 100),
                    },
                    "quantity": 1,
                }],
                mode="payment",
                customer_email=user.email,
                metadata={
                    "user_id": str(user.id),
                    "course_id": str(course.id),
                },
                success_url=request.build_absolute_uri("/formation?payment=success"),
                cancel_url=request.build_absolute_uri("/formation?payment=cancel"),
            )
            return Response({"checkout_url": session.url})
        except Exception as e:
            return Response({"detail": f"Stripe error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='refund-course')
    def refund_course(self, request, pk=None):
        """Refund the course if not started and unenroll the user. If not paid, just unenroll."""
        course = self.get_object()
        user = request.user

        # Check if user is enrolled
        try:
            enrollment = Enrollment.objects.get(user=user, course=course)
        except Enrollment.DoesNotExist:
            return Response({"detail": "You are not enrolled in this course."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Check if course has started
        if course.start_date and course.start_date <= timezone.now().date():
            return Response({"detail": "Refunds are only allowed before the course starts."},
                            status=status.HTTP_400_BAD_REQUEST)

        # If no Stripe payment, just unenroll (free or unpaid enrollment)
        if not getattr(enrollment, 'stripe_payment_intent_id', None):
            enrollment.delete()
            return Response({"detail": "Unenrolled from course (no payment to refund)."}, status=status.HTTP_200_OK)

        # Otherwise, process Stripe refund
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        if not stripe.api_key:
            return Response({"detail": "Stripe secret key not configured."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            refund = stripe.Refund.create(payment_intent=enrollment.stripe_payment_intent_id)
            enrollment.delete()
            return Response({"detail": "Refund processed and unenrolled from course."})
        except Exception as e:
            return Response({"detail": f"Stripe refund error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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


class StripeWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        event = None
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except Exception as e:
            return Response({'detail': f'Webhook error: {str(e)}'}, status=400)

        # Handle successful payment
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            user_id = session['metadata'].get('user_id')
            course_id = session['metadata'].get('course_id')
            payment_intent = session.get('payment_intent')
            # Enroll user and store payment intent
            try:
                enrollment, created = Enrollment.objects.get_or_create(
                    user_id=user_id, course_id=course_id,
                    defaults={'stripe_payment_intent_id': payment_intent}
                )
                if not created and not enrollment.stripe_payment_intent_id:
                    enrollment.stripe_payment_intent_id = payment_intent
                    enrollment.save()
            except Exception as e:
                return Response({'detail': f'Enrollment error: {str(e)}'}, status=500)
        return Response({'status': 'success'})


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
