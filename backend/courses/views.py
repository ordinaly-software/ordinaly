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
from django.db import transaction

# Stripe webhook endpoint to handle payment events
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import stripe

from decimal import Decimal
import logging
import os
from users.services.notification_service import (
    dispatch_email_job_now,
    queue_course_enrollment_notification,
    queue_course_published_notifications,
    queue_course_unenrollment_notification,
)

logger = logging.getLogger(__name__)
from django.core.files.base import ContentFile
from uuid import uuid4

# Set Stripe API key from environment at import time
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

COURSE_FULL_DETAIL = "This course is already full."
ALREADY_ENROLLED_DETAIL = "You are already enrolled in this course."
ENROLLMENT_EMAIL_FAILURE_LOG = "Failed to send enrollment confirmation email for user %s"
UNENROLLMENT_EMAIL_FAILURE_LOG = "Failed to send unenrollment confirmation email for user %s"


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

    def perform_create(self, serializer):
        course = serializer.save()
        if not course.draft:
            try:
                queue_course_published_notifications(course)
            except Exception:
                logger.exception("Failed to queue course publication notifications for course %s", course.pk)

    def perform_update(self, serializer):
        was_draft = serializer.instance.draft
        course = serializer.save()
        if was_draft and not course.draft:
            try:
                queue_course_published_notifications(course)
            except Exception:
                logger.exception("Failed to queue course publication notifications for course %s", course.pk)

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
        with transaction.atomic():
            locked_course = Course.objects.select_for_update().get(pk=course.pk)
            # Check if the course is full
            if locked_course.enrollments.count() >= locked_course.max_attendants:
                return Response(
                    {"detail": COURSE_FULL_DETAIL},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if user is already enrolled
            if Enrollment.objects.filter(user=user, course=locked_course).exists():
                return Response(
                    {"detail": ALREADY_ENROLLED_DETAIL},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create enrollment
            enrollment = Enrollment.objects.create(user=user, course=locked_course)

            try:
                job = queue_course_enrollment_notification(user, locked_course)
                dispatch_email_job_now(job)
            except Exception:
                logger.exception(ENROLLMENT_EMAIL_FAILURE_LOG, user.email)

            serializer = EnrollmentSerializer(enrollment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def duplicate(self, request, *args, **kwargs):
        """Create a copy of this course with a new slug and copied image."""
        course = self.get_object()

        copy = Course(
            title=f"{course.title} (Copy)",
            subtitle=course.subtitle,
            description=course.description,
            bonified_course_link=course.bonified_course_link,
            youtube_video_url=course.youtube_video_url,
            price=course.price,
            location=course.location,
            start_date=course.start_date,
            end_date=course.end_date,
            start_time=course.start_time,
            end_time=course.end_time,
            periodicity=course.periodicity,
            timezone=course.timezone,
            weekdays=course.weekdays,
            week_of_month=course.week_of_month,
            interval=course.interval,
            exclude_dates=course.exclude_dates,
            max_attendants=course.max_attendants,
            draft=True,
        )
        copy.slug = ""
        if course.image:
            try:
                course.image.open('rb')
                content = course.image.read()
                ext = os.path.splitext(course.image.name)[1] or ".jpg"
                filename = f"{uuid4().hex}{ext}"
                copy.image.save(filename, ContentFile(content), save=False)
            except Exception:
                pass
        copy.save()
        # Ensure duplicated course starts with zero enrollments.
        Enrollment.objects.filter(course=copy).delete()
        serializer = self.get_serializer(copy)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def _enroll_in_free_course(self, course, user):
        """Enroll the user directly when the course is free."""
        with transaction.atomic():
            locked_course = Course.objects.select_for_update().get(pk=course.pk)
            if locked_course.enrollments.count() >= locked_course.max_attendants:
                return Response({"detail": COURSE_FULL_DETAIL},
                                status=status.HTTP_400_BAD_REQUEST)
            if Enrollment.objects.filter(user=user, course=locked_course).exists():
                return Response({"detail": ALREADY_ENROLLED_DETAIL},
                                status=status.HTTP_400_BAD_REQUEST)
            enrollment = Enrollment.objects.create(user=user, course=locked_course)

            try:
                job = queue_course_enrollment_notification(user, locked_course)
                dispatch_email_job_now(job)
            except Exception:
                logger.exception(ENROLLMENT_EMAIL_FAILURE_LOG, user.email)

            serializer = EnrollmentSerializer(enrollment)
            return Response({"enrolled": True, "enrollment": serializer.data})

    def _create_stripe_checkout_session(self, course, user):
        """Create and return a Stripe Checkout session Response for a paid course."""
        if not user.email:
            return Response({"detail": "User email is required for Stripe checkout."},
                            status=status.HTTP_400_BAD_REQUEST)

        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        if not stripe.api_key:
            return Response({"detail": "Stripe secret key not configured."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            price_int = int(Decimal(course.price) * 100)
        except Exception:
            return Response({"detail": "Invalid course price."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            frontend_url = os.getenv('FRONTEND_BASE_URL', 'http://localhost:3000')
            success_url = f"{frontend_url}/formacion?payment=success"
            cancel_url = f"{frontend_url}/formacion?payment=cancel"

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
            return Response({"checkout_url": session.url})
        except Exception:
            return Response({"detail": "An internal error occurred during Stripe checkout."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated],
            url_path='create-checkout-session')
    def create_checkout_session(self, request, *args, **kwargs):
        """Create a Stripe Checkout session for the course, or enroll directly if free."""
        course = self.get_object()
        user = self.request.user

        # Check if user is already enrolled
        if Enrollment.objects.filter(user=user, course=course).exists():
            return Response({"detail": ALREADY_ENROLLED_DETAIL},
                            status=status.HTTP_400_BAD_REQUEST)

        # Check if the course has a start date
        if course.start_date is None or course.end_date is None:
            return Response({"detail": "Cannot enroll in a course without specified dates."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Check if the course is full
        if course.enrollments.count() >= course.max_attendants:
            return Response({"detail": COURSE_FULL_DETAIL},
                            status=status.HTTP_400_BAD_REQUEST)

        # If course is free, enroll directly
        if course.price is None or course.price == Decimal('0.00'):
            return self._enroll_in_free_course(course, user)

        return self._create_stripe_checkout_session(course, user)

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

            try:
                job = queue_course_unenrollment_notification(user, course)
                dispatch_email_job_now(job)
            except Exception:
                logger.exception(UNENROLLMENT_EMAIL_FAILURE_LOG, user.email)

            return Response({"detail": "Unenrolled from course (no payment to refund)."}, status=status.HTTP_200_OK)

        # Otherwise, process Stripe refund
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        if not stripe.api_key:
            return Response({"detail": "Stripe secret key not configured."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            refund = stripe.Refund.create(payment_intent=enrollment.stripe_payment_intent_id)
            enrollment.delete()

            try:
                job = queue_course_unenrollment_notification(user, course)
                dispatch_email_job_now(job)
            except Exception:
                logger.exception(UNENROLLMENT_EMAIL_FAILURE_LOG, user.email)

            return Response({"detail": f"Refund processed and unenrolled from course: {refund.id}"})
        except Exception as e:
            return Response({"detail": f"Stripe refund error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _course_local_datetime(self, course, date_value, time_value):
        """Combine a date/time pair into a timezone-aware datetime in the course's timezone."""
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

    def _course_unenroll_window(self, course, now):
        """Compute (course_start, course_end), adjusted for sessions that wrap past
        midnight or whose end would otherwise fall before their start."""
        course_start = self._course_local_datetime(
            course, getattr(course, "start_date", None), getattr(course, "start_time", None)
        )
        course_end = self._course_local_datetime(
            course, getattr(course, "end_date", None), getattr(course, "end_time", None)
        )

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

        return course_start, course_end

    def _unenroll_timing_error(self, course_start, course_end, now):
        """Return an error Response if unenrolling isn't allowed right now, else None."""
        if course_end and now > course_end:
            return Response(
                {"detail": "No puedes cancelar la inscripción porque el curso ya ha finalizado."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if course_start and now >= course_start:
            return Response(
                {"detail": "No puedes cancelar la inscripción porque el curso ya ha comenzado."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if course_start and (course_start - now) <= timedelta(hours=24):
            return Response(
                {"detail": "No puedes cancelar la inscripción en las 24 horas previas al inicio del curso."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return None

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

        now = timezone.localtime(timezone.now(), timezone.get_current_timezone())
        course_start, course_end = self._course_unenroll_window(course, now)

        timing_error = self._unenroll_timing_error(course_start, course_end, now)
        if timing_error:
            return timing_error

        enrollment.delete()

        try:
            job = queue_course_unenrollment_notification(user, course)
            dispatch_email_job_now(job)
        except Exception:
            logger.exception(UNENROLLMENT_EMAIL_FAILURE_LOG, user.email)

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

    def _apply_checkout_session_payment(self, session):
        """Enroll the user and store the payment intent for a completed checkout session."""
        from users.models import CustomUser
        from courses.models import Course

        user_id = session['metadata'].get('user_id')
        course_id = session['metadata'].get('course_id')
        payment_intent = session.get('payment_intent')

        try:
            user = CustomUser.objects.filter(id=user_id).first()
            course = Course.objects.filter(id=course_id).first()
            if not user or not course:
                return Response({'detail': 'User or course not found.'}, status=400)
            with transaction.atomic():
                locked_course = Course.objects.select_for_update().get(pk=course.pk)
                if Enrollment.objects.filter(user=user, course=locked_course).exists():
                    enrollment = Enrollment.objects.get(user=user, course=locked_course)
                    if not enrollment.stripe_payment_intent_id:
                        enrollment.stripe_payment_intent_id = payment_intent
                        enrollment.save()
                else:
                    if locked_course.enrollments.count() >= locked_course.max_attendants:
                        return Response({'detail': COURSE_FULL_DETAIL}, status=400)
                    enrollment = Enrollment.objects.create(
                        user=user,
                        course=locked_course,
                        stripe_payment_intent_id=payment_intent
                    )
                    try:
                        job = queue_course_enrollment_notification(user, locked_course)
                        dispatch_email_job_now(job)
                    except Exception:
                        logger.exception(ENROLLMENT_EMAIL_FAILURE_LOG, user.email)
            return Response({'status': 'success'})
        except Exception:
            logger.exception('Enrollment processing failed during checkout session payment application.')
            return Response({'detail': 'An internal error has occurred.'}, status=500)

    def post(self, request, *args, **kwargs):
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except Exception as e:
            return Response({'detail': f'Webhook error: {str(e)}'}, status=400)

        # Handle successful payment
        if event['type'] == 'checkout.session.completed':
            return self._apply_checkout_session_payment(event['data']['object'])
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
