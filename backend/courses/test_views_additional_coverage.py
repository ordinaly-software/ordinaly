import json
import os
import tempfile
from datetime import date, datetime, time, timedelta
from decimal import Decimal as PyDecimal
from unittest.mock import MagicMock, patch

from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.test import APIClient, APIRequestFactory, force_authenticate

from users.models import CustomUser
from courses.models import Course, Enrollment
from courses.views import CourseViewSet, EnrollmentViewSet, StripeWebhookView


TEST_PASSWORD = os.environ.get("ORDINALY_TEST_PASSWORD") or "test-password"


def make_test_image(name: str = "test.png"):
    try:
        from PIL import Image
    except Exception:  # pragma: no cover
        from django.core.files.uploadedfile import SimpleUploadedFile

        return SimpleUploadedFile(name, b"fake", content_type="image/png")

    from django.core.files.uploadedfile import SimpleUploadedFile

    buffer = tempfile.SpooledTemporaryFile()
    image = Image.new("RGB", (20, 20))
    image.save(buffer, "png")
    buffer.seek(0)
    return SimpleUploadedFile(name, buffer.read(), content_type="image/png")


def make_user(**overrides):
    data = {
        "email": "u@example.com",
        "username": "user1",
        "password": TEST_PASSWORD,
        "name": "Test",
        "surname": "User",
        "company": "C",
    }
    data.update(overrides)
    return CustomUser.objects.create_user(**data)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CourseViewsAdditionalCoverageTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.factory = APIRequestFactory()
        self.admin = make_user(email="admin@example.com", username="admin1", is_staff=True)
        self.user = make_user(email="user@example.com", username="user2", is_staff=False)
        self.course = Course.objects.create(
            title="Course",
            subtitle="Sub",
            description="Desc",
            image=make_test_image("course.png"),
            price=PyDecimal("10.00"),
            location="Loc",
            start_date=date.today() + timedelta(days=10),
            end_date=date.today() + timedelta(days=10),
            start_time=time(10, 0),
            end_time=time(12, 0),
            periodicity="once",
            max_attendants=2,
            draft=False,
        )

    def test_get_object_raises_not_found_when_no_lookup(self):
        view = CourseViewSet()
        request = self.factory.get("/api/courses/courses/")
        request.user = self.user
        view.request = request
        view.kwargs = {}
        with self.assertRaises(NotFound):
            view.get_object()

    def test_destroy_handles_unexpected_exception(self):
        view = CourseViewSet()
        request = self.factory.delete(f"/api/courses/courses/{self.course.slug}/")
        force_authenticate(request, user=self.admin)
        request.user = self.admin
        view.request = request
        view.kwargs = {"slug": self.course.slug}
        view.get_object = lambda: self.course
        view.perform_destroy = lambda instance: (_ for _ in ()).throw(Exception("boom"))
        response = view.destroy(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_update_handles_unexpected_exception(self):
        view = CourseViewSet()
        request = self.factory.put(f"/api/courses/courses/{self.course.slug}/", {"title": "X"}, format="json")
        force_authenticate(request, user=self.admin)
        request.user = self.admin
        view.request = request
        view.kwargs = {"slug": self.course.slug}
        with patch("rest_framework.viewsets.ModelViewSet.update", side_effect=Exception("boom")):
            response = view.update(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_partial_update_reraises_api_exception(self):
        view = CourseViewSet()
        request = self.factory.patch(f"/api/courses/courses/{self.course.slug}/", {"title": "X"}, format="json")
        force_authenticate(request, user=self.admin)
        request.user = self.admin
        view.request = request
        view.kwargs = {"slug": self.course.slug}
        with patch("rest_framework.viewsets.ModelViewSet.partial_update", side_effect=NotFound()):
            with self.assertRaises(NotFound):
                view.partial_update(request, slug=self.course.slug)

    def test_enroll_action_branches(self):
        view = CourseViewSet()
        # unauthenticated line coverage (method-level check)
        request = self.factory.post(f"/api/courses/courses/{self.course.slug}/enroll/")
        request.user = MagicMock(is_authenticated=False)
        view.request = request
        view.kwargs = {"slug": self.course.slug}
        view.get_object = lambda: self.course
        response = view.enroll(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # missing dates
        no_dates = Course.objects.create(
            title="NoDates",
            description="D",
            image=make_test_image("nodates.png"),
            price=PyDecimal("10.00"),
            periodicity="once",
            max_attendants=2,
            start_date=None,
            end_date=None,
            start_time=None,
            end_time=None,
            draft=False,
        )
        request = self.factory.post(f"/api/courses/courses/{no_dates.slug}/enroll/")
        force_authenticate(request, user=self.user)
        request.user = self.user
        view.request = request
        view.get_object = lambda: no_dates
        response = view.enroll(request, slug=no_dates.slug)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # full course
        Enrollment.objects.create(user=self.admin, course=self.course)
        Enrollment.objects.create(user=self.user, course=self.course)
        other = make_user(email="o@example.com", username="user3", is_staff=False)
        request = self.factory.post(f"/api/courses/courses/{self.course.slug}/enroll/")
        force_authenticate(request, user=other)
        request.user = other
        view.request = request
        view.get_object = lambda: self.course
        response = view.enroll(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_checkout_session_branches(self):
        view = CourseViewSet()
        request = self.factory.post(f"/api/courses/courses/{self.course.slug}/create-checkout-session/")
        force_authenticate(request, user=self.user)
        request.user = self.user
        view.request = request
        view.kwargs = {"slug": self.course.slug}
        view.get_object = lambda: self.course

        # already enrolled
        Enrollment.objects.create(user=self.user, course=self.course)
        response = view.create_checkout_session(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        Enrollment.objects.all().delete()

        # missing dates
        self.course.start_date = None
        self.course.end_date = None
        response = view.create_checkout_session(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.course.start_date = date.today() + timedelta(days=10)
        self.course.end_date = date.today() + timedelta(days=10)

        # full course
        Enrollment.objects.create(user=self.admin, course=self.course)
        Enrollment.objects.create(user=self.user, course=self.course)
        response = view.create_checkout_session(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        Enrollment.objects.all().delete()

        # free course enrolls directly
        free = Course.objects.create(
            title="Free",
            description="D",
            image=make_test_image("free.png"),
            price=PyDecimal("0.00"),
            periodicity="once",
            max_attendants=5,
            start_date=date.today() + timedelta(days=10),
            end_date=date.today() + timedelta(days=10),
            draft=False,
        )
        view.get_object = lambda: free
        response = view.create_checkout_session(request, slug=free.slug)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["enrolled"])

        # missing email
        view.get_object = lambda: self.course
        original_email = self.user.email
        self.user.email = ""
        self.user.save()
        response = view.create_checkout_session(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.user.email = original_email
        self.user.save()

        # no stripe key configured
        with patch.dict(os.environ, {"STRIPE_SECRET_KEY": ""}):
            response = view.create_checkout_session(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

        # invalid price conversion
        def decimal_side_effect(value):
            if str(value) == "0.00":
                return PyDecimal("0.00")
            raise Exception("invalid")

        with patch.dict(os.environ, {"STRIPE_SECRET_KEY": "sk_test"}), patch(
            "courses.views.Decimal", side_effect=decimal_side_effect
        ):
            response = view.create_checkout_session(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # stripe session create success
        dummy_session = MagicMock()
        dummy_session.url = "https://stripe.test/checkout"
        with patch.dict(os.environ, {"STRIPE_SECRET_KEY": "sk_test"}), patch(
            "courses.views.stripe.checkout.Session.create", return_value=dummy_session
        ):
            response = view.create_checkout_session(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("checkout_url", response.data)

        # stripe session create exception
        with patch.dict(os.environ, {"STRIPE_SECRET_KEY": "sk_test"}), patch(
            "courses.views.stripe.checkout.Session.create", side_effect=Exception("boom")
        ):
            response = view.create_checkout_session(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_refund_course_branches(self):
        view = CourseViewSet()
        request = self.factory.post(f"/api/courses/courses/{self.course.slug}/refund-course/")
        force_authenticate(request, user=self.user)
        request.user = self.user
        view.request = request
        view.kwargs = {"slug": self.course.slug}
        view.get_object = lambda: self.course

        # not enrolled
        response = view.refund_course(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # course started
        started = Course.objects.create(
            title="Started",
            description="D",
            image=make_test_image("started.png"),
            price=PyDecimal("10.00"),
            periodicity="once",
            max_attendants=5,
            start_date=timezone.now().date(),
            end_date=timezone.now().date(),
            draft=False,
        )
        Enrollment.objects.create(user=self.user, course=started)
        view.get_object = lambda: started
        response = view.refund_course(request, slug=started.slug)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        Enrollment.objects.all().delete()

        # no payment intent -> unenroll
        Enrollment.objects.create(user=self.user, course=self.course)
        view.get_object = lambda: self.course
        response = view.refund_course(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Enrollment.objects.filter(user=self.user, course=self.course).exists())

        # no stripe key configured
        enrollment = Enrollment.objects.create(user=self.user, course=self.course, stripe_payment_intent_id="pi_123")
        with patch.dict(os.environ, {"STRIPE_SECRET_KEY": ""}):
            response = view.refund_course(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        enrollment.refresh_from_db()

        # stripe refund success
        with patch.dict(os.environ, {"STRIPE_SECRET_KEY": "sk_test"}), patch(
            "courses.views.stripe.Refund.create", return_value=MagicMock(id="re_1")
        ):
            response = view.refund_course(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Enrollment.objects.filter(user=self.user, course=self.course).exists())

        # stripe refund exception
        Enrollment.objects.create(user=self.user, course=self.course, stripe_payment_intent_id="pi_456")
        with patch.dict(os.environ, {"STRIPE_SECRET_KEY": "sk_test"}), patch(
            "courses.views.stripe.Refund.create", side_effect=Exception("boom")
        ):
            response = view.refund_course(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_unenroll_branches(self):
        view = CourseViewSet()
        request = self.factory.post(f"/api/courses/courses/{self.course.slug}/unenroll/")
        force_authenticate(request, user=self.user)
        request.user = self.user
        view.request = request
        view.kwargs = {"slug": self.course.slug}
        view.get_object = lambda: self.course

        # not enrolled
        response = view.unenroll(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # set up enrollment and patch time to cover time math branches
        Enrollment.objects.create(user=self.user, course=self.course)

        fixed_now = timezone.make_aware(datetime.combine(date.today(), time(23, 0)))
        with patch("courses.views.timezone.now", return_value=fixed_now):
            # start_time with tzinfo triggers the localtime() branch for aware datetimes
            self.course.start_date = date.today()
            self.course.end_date = date.today()
            self.course.start_time = time(1, 0, tzinfo=timezone.get_current_timezone())
            self.course.end_time = time(0, 30, tzinfo=timezone.get_current_timezone())
            self.course.timezone = "Invalid/Zone"

            # now is far past start time on same day -> shift start forward a day + ensure end > start
            response = view.unenroll(request, slug=self.course.slug)
        # course is considered already started due to shift; response should be 400
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # success path: course starts > 24h away
        Enrollment.objects.all().delete()
        Enrollment.objects.create(user=self.user, course=self.course)
        future_now = timezone.make_aware(datetime.combine(date.today(), time(10, 0)))
        self.course.start_date = date.today() + timedelta(days=3)
        self.course.end_date = date.today() + timedelta(days=3)
        self.course.start_time = time(10, 0)
        self.course.end_time = time(12, 0)
        with patch("courses.views.timezone.now", return_value=future_now):
            response = view.unenroll(request, slug=self.course.slug)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Enrollment.objects.filter(user=self.user, course=self.course).exists())

        # build_dt early return when dates missing (coverage for date_value None path)
        no_dates_course = Course.objects.create(
            title="NoDatesUnenroll",
            description="D",
            image=make_test_image("nodates-unenroll.png"),
            price=PyDecimal("10.00"),
            periodicity="once",
            max_attendants=5,
            start_date=None,
            end_date=None,
            start_time=None,
            end_time=None,
            draft=False,
        )
        Enrollment.objects.create(user=self.user, course=no_dates_course)
        view.get_object = lambda: no_dates_course
        response = view.unenroll(request, slug=no_dates_course.slug)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Enrollment.objects.filter(user=self.user, course=no_dates_course).exists())

    def test_calendar_export_test_branches(self):
        url = reverse("course-calendar-export-test", kwargs={"slug": self.course.slug})
        self.client.force_authenticate(user=self.user)

        # must be enrolled
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        Enrollment.objects.create(user=self.user, course=self.course)

        # invalid format
        resp = self.client.get(url + "?calendar_format=invalid")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

        # successful JSON response
        with patch.object(Course, "get_calendar_export_data", return_value=[{"x": 1}]):
            resp = self.client.get(url + "?calendar_format=google")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("events", resp.data)

        # ICS download
        with patch.object(Course, "get_calendar_export_data", return_value="BEGIN:VCALENDAR"):
            resp = self.client.get(url + "?calendar_format=ics")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp["Content-Type"], "text/calendar")

        # exception -> 500
        with patch.object(Course, "get_calendar_export_data", side_effect=Exception("boom")):
            resp = self.client.get(url + "?calendar_format=google")
        self.assertEqual(resp.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_stripe_webhook_branches(self):
        url = reverse("stripe-webhook")

        # construct_event error -> 400
        with patch("courses.views.stripe.Webhook.construct_event", side_effect=Exception("bad sig")):
            resp = self.client.post(url, data=b"{}", content_type="application/json")
        self.assertEqual(resp.status_code, 400)

        # user/course not found -> 400
        event = {
            "type": "checkout.session.completed",
            "data": {"object": {"metadata": {"user_id": "9999", "course_id": "9999"}, "payment_intent": "pi_x"}},
        }
        with patch("courses.views.stripe.Webhook.construct_event", return_value=event):
            resp = self.client.post(url, data=b"{}", content_type="application/json")
        self.assertEqual(resp.status_code, 400)

        # create enrollment (created=True)
        event = {
            "type": "checkout.session.completed",
            "data": {"object": {"metadata": {"user_id": str(self.user.id), "course_id": str(self.course.id)}, "payment_intent": "pi_1"}},
        }
        with patch("courses.views.stripe.Webhook.construct_event", return_value=event):
            resp = self.client.post(url, data=b"{}", content_type="application/json")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(Enrollment.objects.filter(user=self.user, course=self.course).exists())

        # update enrollment when it exists but has no payment_intent stored (created=False branch)
        enrollment = Enrollment.objects.get(user=self.user, course=self.course)
        enrollment.stripe_payment_intent_id = None
        enrollment.save()
        event["data"]["object"]["payment_intent"] = "pi_2"
        with patch("courses.views.stripe.Webhook.construct_event", return_value=event):
            resp = self.client.post(url, data=b"{}", content_type="application/json")
        self.assertEqual(resp.status_code, 200)
        enrollment.refresh_from_db()
        self.assertEqual(enrollment.stripe_payment_intent_id, "pi_2")

        # enrollment error -> 500
        with patch("courses.views.stripe.Webhook.construct_event", return_value=event), patch(
            "courses.views.Enrollment.objects.get_or_create", side_effect=Exception("boom")
        ):
            resp = self.client.post(url, data=b"{}", content_type="application/json")
        self.assertEqual(resp.status_code, 500)

    def test_enrollment_viewset_get_queryset_for_auth_and_roles(self):
        view = EnrollmentViewSet()
        request = self.factory.get("/api/courses/enrollments/")
        request.user = MagicMock(is_authenticated=False)
        view.request = request
        self.assertEqual(view.get_queryset().count(), 0)

        # regular user only sees own
        Enrollment.objects.create(user=self.user, course=self.course)
        request.user = self.user
        view.request = request
        self.assertEqual(view.get_queryset().count(), 1)

        # admin sees all
        request.user = self.admin
        view.request = request
        self.assertGreaterEqual(view.get_queryset().count(), 1)
