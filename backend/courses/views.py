from rest_framework import viewsets, permissions, status
from rest_framework.exceptions import APIException, NotFound
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer
from django.utils import timezone
from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

# Stripe webhook endpoint to handle payment events
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import stripe

from decimal import Decimal
import os

# Set Stripe API key from environment at import time
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')


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
    lookup_field = 'slug'

    def get_object(self):
        """Resolve object by slug first, then fall back to numeric PK if needed.

        This allows older clients that still send numeric IDs in the URL to work
        while the viewset primarily uses slug lookups.
        """
        lookup_value = self.kwargs.get(self.lookup_field) or self.kwargs.get('pk')
        queryset = self.filter_queryset(self.get_queryset())

        # Try slug lookup first
        if lookup_value is None:
            raise NotFound(detail="Course not found")

        try:
            obj = queryset.get(**{self.lookup_field: lookup_value})
            self.check_object_permissions(self.request, obj)
            return obj
        except Course.DoesNotExist:
            # If the lookup value looks numeric, try PK fallback
            if str(lookup_value).isdigit():
                try:
                    obj = queryset.get(pk=lookup_value)
                    self.check_object_permissions(self.request, obj)
                    return obj
                except Course.DoesNotExist:
                    pass
            raise NotFound(detail="Course not found")

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
        except APIException:
            # Let DRF handle expected API exceptions (404, 403, etc.)
            raise
        except Exception:
            # Log unexpected exceptions and return 500
            return Response(
                {"detail": "An error occurred while deleting the course."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Override update method to handle file replacement properly."""
        try:
            return super().update(request, *args, **kwargs)
        except APIException:
            # Re-raise DRF API exceptions so they are converted to proper 4xx responses
            raise
        except Exception:
            return Response(
                {"detail": "An error occurred while updating the course."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def partial_update(self, request, *args, **kwargs):
        """Override partial_update method to handle file replacement properly."""
        try:
            return super().partial_update(request, *args, **kwargs)
        except APIException:
            raise
        except Exception:
            return Response(
                {"detail": "An error occurred while updating the course."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, *args, **kwargs):
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
    def create_checkout_session(self, request, *args, **kwargs):
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

        # Validate user email
        if not user.email:
            # print(f"[Stripe Checkout] User email missing for user id {user.id}")
            return Response({"detail": "User email is required for Stripe checkout."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Ensure Stripe API key is set
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        if not stripe.api_key:
            # print("[Stripe Checkout] Stripe secret key not configured.")
            return Response({"detail": "Stripe secret key not configured."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Validate course price
        try:
            price_int = int(Decimal(course.price) * 100)
        except Exception:
            return Response({"detail": "Invalid course price."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Create Stripe Checkout session
        try:
            frontend_url = os.getenv('FRONTEND_BASE_URL', 'http://localhost:3000')
            success_url = f"{frontend_url}/formation?payment=success"
            cancel_url = f"{frontend_url}/formation?payment=cancel"

            product_data = {"name": course.title}
            if course.subtitle:
                product_data["description"] = course.subtitle

            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": "eur",
                        "product_data": product_data,
                        "unit_amount": price_int,
                    },
                    "quantity": 1,
                }],
                mode="payment",
                customer_email=user.email,
                metadata={
                    "user_id": str(user.id),
                    "course_id": str(course.id),
                },
                success_url=success_url,
                cancel_url=cancel_url,
            )
            # print(f"[Stripe Checkout] Session created: {session.id}")
            return Response({"checkout_url": session.url})
        except Exception:
            return Response({"detail": "An internal error occurred during Stripe checkout."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='refund-course')
    def refund_course(self, request, *args, **kwargs):
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
            return Response({"detail": f"Refund processed and unenrolled from course: {refund.id}"})
        except Exception as e:
            return Response({"detail": f"Stripe refund error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unenroll(self, request, *args, **kwargs):
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
        except Enrollment.DoesNotExist:
            return Response(
                {"detail": "You are not enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST
            )

        def build_dt(date_value, time_value):
            if not date_value:
                return None
            base_time = time_value or time(0, 0)
            dt = datetime.combine(date_value, base_time)
            tzinfo = None
            if isinstance(getattr(course, "timezone", None), str):
                try:
                    tzinfo = ZoneInfo(course.timezone)
                except Exception:
                    tzinfo = None
            tzinfo = tzinfo or timezone.get_current_timezone()
            if timezone.is_naive(dt):
                dt = timezone.make_aware(dt, tzinfo)
            else:
                dt = timezone.localtime(dt, tzinfo)
            return dt

        now = timezone.localtime(timezone.now(), timezone.get_current_timezone())

        # Build start/end datetimes with timezone awareness
        course_start = build_dt(getattr(course, "start_date", None), getattr(course, "start_time", None))
        course_end = build_dt(getattr(course, "end_date", None), getattr(course, "end_time", None))

        # If the times wrap past midnight but the date is "today", shift forward a day
        if course_start and course_start.date() == now.date():
            hours_diff = (now - course_start).total_seconds() / 3600
            if hours_diff > 12:  # likely rolled past midnight, so interpret as next day
                course_start = course_start + timedelta(days=1)
                if course_end:
                    course_end = course_end + timedelta(days=1)

        # Ensure end is not before start (e.g., overnight courses)
        if course_start and course_end and course_end <= course_start:
            course_end = course_end + timedelta(days=1)

        # Check if course has ended
        if course_end and now > course_end:
            return Response(
                {"detail": "No puedes cancelar la inscripción porque el curso ya ha finalizado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if course has started
        if course_start and now >= course_start:
            return Response(
                {"detail": "No puedes cancelar la inscripción porque el curso ya ha comenzado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check 24h restriction
        if course_start and (course_start - now) <= timedelta(hours=24):
            return Response(
                {"detail": "No puedes cancelar la inscripción en las 24 horas previas al inicio del curso."},
                status=status.HTTP_400_BAD_REQUEST
            )

        enrollment.delete()
        return Response(
            {"detail": "Successfully unenrolled from the course."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated],
            url_path='calendar-export-test')
    def calendar_export_test(self, request, *args, **kwargs):
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
        webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        # print(f"[Stripe Webhook] Payload: {payload}")
        # print(f"[Stripe Webhook] Signature Header: {sig_header}")
        # print(f"[Stripe Webhook] Webhook Secret: {webhook_secret}")
        event = None
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
            # print(f"[Stripe Webhook] Event: {event}")
        except Exception as e:
            # print(f"[Stripe Webhook] Error constructing event: {e}")
            return Response({'detail': f'Webhook error: {str(e)}'}, status=400)

        # Handle successful payment
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            user_id = session['metadata'].get('user_id')
            course_id = session['metadata'].get('course_id')
            payment_intent = session.get('payment_intent')
            # print(f"[Stripe Webhook] Session: {session}")
            # print(f"[Stripe Webhook] user_id: {user_id}, course_id: {course_id}, payment_intent: {payment_intent}")
            # Enroll user and store payment intent
            try:
                from users.models import CustomUser
                from courses.models import Course
                user = CustomUser.objects.filter(id=user_id).first()
                course = Course.objects.filter(id=course_id).first()
                if not user or not course:
                    # print(f"[Stripe Webhook] User or course not found. user: {user}, course: {course}")
                    return Response({'detail': 'User or course not found.'}, status=400)
                enrollment, created = Enrollment.objects.get_or_create(
                    user=user, course=course,
                    defaults={'stripe_payment_intent_id': payment_intent}
                )
                if not created and not enrollment.stripe_payment_intent_id:
                    enrollment.stripe_payment_intent_id = payment_intent
                    enrollment.save()
                # print(f"[Stripe Webhook] Enrollment created: {created}, enrollment: {enrollment}")
            except Exception as e:
                # print(f"[Stripe Webhook] Enrollment error: {e}")
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
