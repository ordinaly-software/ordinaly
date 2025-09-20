import tempfile
import os
from django.test import TestCase, override_settings
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from PIL import Image
from io import BytesIO
from datetime import date, time, timedelta
from django.db import IntegrityError
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from users.models import CustomUser
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer
from courses.admin import CourseAdmin
from django.contrib import admin as django_admin
from .forms import CourseAdminForm
import json


TEST_PASSWORD = os.environ.get("ORDINALY_TEST_PASSWORD")


# Helper function to create a test image
def get_test_image_file():
    file = BytesIO()
    image = Image.new('RGB', (100, 100))
    image.save(file, 'png')
    file.name = 'test.png'
    file.seek(0)
    return SimpleUploadedFile(file.name, file.read(), content_type='image/png')


# General-purpose test data mixin for user, course, and enrollment
class TestUserCourseEnrollmentMixin:
    def create_test_user(self, **overrides):
        data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'password': TEST_PASSWORD,
            'name': 'Test',
            'surname': 'User',
            'company': 'Test Company',
        }
        data.update(overrides)
        return CustomUser.objects.create_user(**data)

    def create_test_course(self, **overrides):
        data = {
            'title': 'Test Course',
            'description': 'Test Description',
            'image': get_test_image_file(),
            'price': Decimal('99.99'),
            'location': 'Test Location',
            'start_date': date(2023, 12, 31),
            'end_date': date(2023, 12, 31),
            'start_time': time(14, 0),
            'end_time': time(17, 0),
            'periodicity': 'once',
            'max_attendants': 20,
        }
        data.update(overrides)
        return Course.objects.create(**data)

    def create_test_enrollment(self, user=None, course=None, **overrides):
        user = user or self.create_test_user()
        course = course or self.create_test_course()
        data = {
            'user': user,
            'course': course,
        }
        data.update(overrides)
        return Enrollment.objects.create(**data)


class CourseImageCleanupTestMixin:
    @classmethod
    def teardown_class(cls):
        """Remove only test-generated images from MEDIA_ROOT/course_images/"""
        course_images_dir = os.path.join(settings.MEDIA_ROOT, 'course_images')
        test_prefixes = [
            'test', 'create', 'duplicate', 'updated', 'extra', 'new', 'searchable', 'license', 'Temp',
            'Existing', 'Admin', 'Serializer', 'Model', 'Duration', 'Complex', 'One-time', 'Yoga', 'Advanced',
            'Monthly', 'Special', 'Daily', 'Description'
        ]
        if os.path.isdir(course_images_dir):
            for fname in os.listdir(course_images_dir):
                if fname.endswith('.png') and any(fname.startswith(prefix) for prefix in test_prefixes):
                    try:
                        os.remove(os.path.join(course_images_dir, fname))
                    except Exception:
                        pass
        super().tearDownClass()


# Model Tests
@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CourseModelTest(CourseImageCleanupTestMixin, TestCase):
    def test_course_draft_default_false(self):
        course_data = self.course_data.copy()
        course_data['draft'] = None
        course = Course.objects.create(**course_data)
        self.assertFalse(course.draft)

    def test_course_draft_explicit_true(self):
        course_data = self.course_data.copy()
        course_data['draft'] = True
        course = Course.objects.create(**course_data)
        self.assertTrue(course.draft)

    def test_course_draft_null_treated_false(self):
        course_data = self.course_data.copy()
        course_data['draft'] = None
        course = Course.objects.create(**course_data)
        self.assertFalse(course.draft)

    def setUp(self):
        self.course_data = {
            'title': 'Test Course',
            'subtitle': 'Test Subtitle',
            'description': 'Test Description',
            'image': get_test_image_file(),
            'price': Decimal('99.99'),
            'location': None,
            'start_date': date(2023, 12, 31),
            'end_date': date(2023, 12, 31),
            'start_time': time(14, 0),
            'end_time': time(17, 0),
            'periodicity': 'once',
            'max_attendants': 20
        }
        self.course = Course.objects.create(**self.course_data)

    def tearDown(self):
        """Clean up database objects"""
        try:
            Course.objects.all().delete()
        except Exception:
            pass  # Ignore errors if transaction is broken
        try:
            CustomUser.objects.all().delete()
        except Exception:
            pass
        super().tearDown()

    def test_course_creation(self):
        self.assertEqual(self.course.title, 'Test Course')
        self.assertEqual(self.course.subtitle, 'Test Subtitle')
        self.assertEqual(self.course.description, 'Test Description')
        self.assertEqual(self.course.price, Decimal('99.99'))
        self.assertIsNone(self.course.location)
        self.assertEqual(self.course.start_date, date(2023, 12, 31))
        self.assertEqual(self.course.end_date, date(2023, 12, 31))
        self.assertEqual(self.course.start_time, time(14, 0))
        self.assertEqual(self.course.end_time, time(17, 0))
        self.assertEqual(self.course.periodicity, 'once')
        self.assertEqual(self.course.max_attendants, 20)
        self.assertTrue(self.course.image)

    def test_course_location_nullable(self):
        # Should allow blank location
        course_data = self.course_data.copy()
        course_data['location'] = ''
        course = Course(**course_data)
        course.full_clean()  # Should not raise ValidationError
        self.assertEqual(course.location, '')

        # Should allow null location
        course_data['location'] = None
        course = Course(**course_data)
        course.full_clean()  # Should not raise ValidationError
        self.assertIsNone(course.location)

    def test_course_string_representation(self):
        self.assertEqual(str(self.course), 'Test Course')

    def test_course_verbose_name_plural(self):
        self.assertEqual(Course._meta.verbose_name_plural, 'Courses')

    def test_course_max_length_validation(self):
        # Test title max length
        course_data = {
            'title': 'a' * 101,  # Assuming max_length=100 for title
            'subtitle': 'Test Subtitle',
            'description': 'Test Description',
            'image': get_test_image_file(),
            'price': Decimal('99.99'),
            'location': 'Test Location',
            'start_date': date(2023, 12, 31),
            'end_date': date(2023, 12, 31),
            'start_time': time(14, 0),
            'end_time': time(17, 0),
            'periodicity': 'once',
            'max_attendants': 20
        }
        # Use the local course_data (with an overly long title) and validate without saving
        course = Course(**course_data)
        with self.assertRaises(ValidationError):
            course.full_clean()

        # Test subtitle max length
        course_data = {
            'title': 'Test Course',
            'subtitle': 'a' * 201,  # Assuming max_length=200 for subtitle
            'description': 'Test Description',
            'image': get_test_image_file(),
            'price': Decimal('99.99'),
            'location': 'Test Location',
            'start_date': date(2023, 12, 31),
            'end_date': date(2023, 12, 31),
            'start_time': time(14, 0),
            'end_time': time(17, 0),
            'periodicity': 'once',
            'max_attendants': 20
        }
        course = Course(**course_data)
        with self.assertRaises(ValidationError):
            course.full_clean()

        # Test location max length
        course_data = {
            'title': 'Test Course',
            'subtitle': 'Test Subtitle',
            'description': 'Test Description',
            'image': get_test_image_file(),
            'price': Decimal('99.99'),
            'location': 'a' * 101,  # Assuming max_length=100 for location
            'start_date': date(2023, 12, 31),
            'end_date': date(2023, 12, 31),
            'start_time': time(14, 0),
            'end_time': time(17, 0),
            'periodicity': 'once',
            'max_attendants': 20
        }
        course = Course(**course_data)
        with self.assertRaises(ValidationError):
            course.full_clean()

    def test_course_min_value_validation(self):

        # Test forbidden price range [0.01, 0.49]
        for forbidden_price in [Decimal('0.01'), Decimal('0.10'), Decimal('0.49')]:
            course_data = {
                'title': 'Test Course',
                'subtitle': 'Test Subtitle',
                'description': 'Test Description',
                'image': get_test_image_file(),
                'price': forbidden_price,
                'location': 'Test Location',
                'start_date': date(2023, 12, 31),
                'end_date': date(2023, 12, 31),
                'start_time': time(14, 0),
                'end_time': time(17, 0),
                'periodicity': 'once',
                'max_attendants': 20
            }
            course = Course(**course_data)
            with self.assertRaises(ValidationError):
                course.full_clean()

        # Test negative price
        course_data = {
            'title': 'Test Course',
            'subtitle': 'Test Subtitle',
            'description': 'Test Description',
            'image': get_test_image_file(),
            'price': Decimal('-1.00'),
            'location': 'Test Location',
            'start_date': date(2023, 12, 31),
            'end_date': date(2023, 12, 31),
            'start_time': time(14, 0),
            'end_time': time(17, 0),
            'periodicity': 'once',
            'max_attendants': 20
        }
        course = Course(**course_data)
        with self.assertRaises(ValidationError):
            course.full_clean()

        # Test price > 999999.99
        course_data = {
            'title': 'Test Course',
            'subtitle': 'Test Subtitle',
            'description': 'Test Description',
            'image': get_test_image_file(),
            'price': Decimal('1000000.00'),
            'location': 'Test Location',
            'start_date': date(2023, 12, 31),
            'end_date': date(2023, 12, 31),
            'start_time': time(14, 0),
            'end_time': time(17, 0),
            'periodicity': 'once',
            'max_attendants': 20
        }
        course = Course(**course_data)
        with self.assertRaises(ValidationError):
            course.full_clean()

        # Test max_attendants min value
        course_data = {
            'title': 'Test Course',
            'subtitle': 'Test Subtitle',
            'description': 'Test Description',
            'image': get_test_image_file(),
            'price': Decimal('99.99'),
            'location': 'Test Location',
            'start_date': date(2023, 12, 31),
            'end_date': date(2023, 12, 31),
            'start_time': time(14, 0),
            'end_time': time(17, 0),
            'periodicity': 'once',
            'max_attendants': 0  # Invalid max_attendants
        }
        course = Course(**course_data)
        with self.assertRaises(ValidationError):
            course.full_clean()

    def test_course_optional_fields(self):
        # Test subtitle is optional
        course_data = {
            'title': 'Test Course',
            'description': 'Test Description',
            'image': get_test_image_file(),
            'price': Decimal('99.99'),
            'location': 'Test Location',
            'start_date': date(2023, 12, 31),
            'end_date': date(2023, 12, 31),
            'start_time': time(14, 0),
            'end_time': time(17, 0),
            'periodicity': 'once',
            'max_attendants': 20
        }
        course = Course(**course_data)
        course.full_clean()  # Should not raise ValidationError
        self.assertIsNone(course.subtitle)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class EnrollmentModelTest(TestUserCourseEnrollmentMixin, CourseImageCleanupTestMixin, TestCase):
    def setUp(self):
        self.user = self.create_test_user()
        self.course = self.create_test_course()
        self.enrollment = self.create_test_enrollment(user=self.user, course=self.course)

    def tearDown(self):
        """Clean up database objects"""
        try:
            Enrollment.objects.all().delete()
        except Exception:
            pass  # Ignore errors if transaction is broken
        try:
            Course.objects.all().delete()
        except Exception:
            pass
        try:
            CustomUser.objects.all().delete()
        except Exception:
            pass
        super().tearDown()

    def test_enrollment_creation(self):
        self.assertEqual(self.enrollment.user, self.user)
        self.assertEqual(self.enrollment.course, self.course)
        self.assertIsNotNone(self.enrollment.enrolled_at)

    def test_enrollment_string_representation(self):
        expected_string = f"{self.user.username} enrolled in {self.course.title}"
        self.assertEqual(str(self.enrollment), expected_string)

    def test_enrollment_unique_together_constraint(self):
        # Attempt to create a duplicate enrollment
        with self.assertRaises(IntegrityError):
            Enrollment.objects.create(
                user=self.user,
                course=self.course
            )

    def test_enrollment_cascade_delete_user(self):
        # Test that enrollment is deleted when user is deleted
        enrollment_id = self.enrollment.id
        self.user.delete()
        with self.assertRaises(Enrollment.DoesNotExist):
            Enrollment.objects.get(id=enrollment_id)

    def test_enrollment_cascade_delete_course(self):
        # Test that enrollment is deleted when course is deleted
        enrollment_id = self.enrollment.id
        self.course.delete()
        with self.assertRaises(Enrollment.DoesNotExist):
            Enrollment.objects.get(id=enrollment_id)


# Serializer Tests
@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CourseSerializerTest(CourseImageCleanupTestMixin, TestCase):
    def setUp(self):
        self.course_data = {
            'title': 'Test Course',
            'subtitle': 'Test Subtitle',
            'description': 'Test Description',
            'image': get_test_image_file(),
            'price': Decimal('99.99'),
            'location': 'Test Location',
            'start_date': date(2023, 12, 31),
            'end_date': date(2023, 12, 31),
            'start_time': time(14, 0),
            'end_time': time(17, 0),
            'periodicity': 'once',
            'max_attendants': 20
        }
        self.course = Course.objects.create(**self.course_data)
        self.serializer = CourseSerializer(instance=self.course)

    def tearDown(self):
        """Clean up database objects"""
        Course.objects.all().delete()
        CustomUser.objects.all().delete()
        super().tearDown()

    def test_contains_expected_fields(self):
        data = self.serializer.data
        expected_fields = [
            'id', 'slug', 'title', 'subtitle', 'description', 'image', 'price',
            'location', 'start_date', 'end_date', 'start_time', 'end_time',
            'periodicity', 'timezone', 'weekdays', 'week_of_month', 'interval',
            'exclude_dates', 'max_attendants', 'enrolled_count',
            'duration_hours', 'formatted_schedule', 'schedule_description',
            'next_occurrences', 'weekday_display', 'created_at', 'updated_at', 'draft',
        ]
        self.assertCountEqual(data.keys(), expected_fields)

    def test_enrolled_count_field(self):
        # Initially there should be no enrollments
        self.assertEqual(self.serializer.data['enrolled_count'], 0)

        # Create a user and enrollment
        user = CustomUser.objects.create_user(
            email='test@example.com',
            username='testuser',
            password=TEST_PASSWORD,
            name='Test',
            surname='User',
            company='Test Company'
        )
        Enrollment.objects.create(user=user, course=self.course)

        # Refresh serializer and check enrolled_count
        serializer = CourseSerializer(instance=self.course)
        self.assertEqual(serializer.data['enrolled_count'], 1)

    def test_field_content(self):
        data = self.serializer.data
        self.assertEqual(data['title'], 'Test Course')
        self.assertEqual(data['subtitle'], 'Test Subtitle')
        self.assertEqual(data['description'], 'Test Description')
        self.assertEqual(data['price'], '99.99')
        self.assertEqual(data['location'], 'Test Location')
        self.assertEqual(data['start_date'], '2023-12-31')
        self.assertEqual(data['end_date'], '2023-12-31')
        self.assertEqual(data['start_time'], '14:00:00')
        self.assertEqual(data['end_time'], '17:00:00')
        self.assertEqual(data['periodicity'], 'once')
        self.assertEqual(data['max_attendants'], 20)
        self.assertTrue(data['image'])

    def test_validation(self):
        # Test with invalid data
        invalid_data = {
            'title': '',  # Empty title
            'description': 'Test Description',
            'price': '-10.00',  # Negative price
            'location': 'Test Location',
            'start_date': '2023-12-31',
            'end_date': '2023-12-31',
            'start_time': '14:00:00',
            'end_time': '17:00:00',
            'periodicity': 'once',
            'max_attendants': 0  # Invalid max_attendants
        }
        serializer = CourseSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)
        self.assertIn('price', serializer.errors)
        self.assertIn('max_attendants', serializer.errors)
        self.assertIn('image', serializer.errors)  # Required field


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CourseSerializerExtraTest(CourseImageCleanupTestMixin, TestCase):
    """Targeted tests for serializer validation branches and method fallbacks."""
    def setUp(self):
        self.today = date.today()

    def test_validate_price_edges_and_forbidden_range(self):
        # Negative price
        data = {
            'title': 'P', 'description': 'd', 'image': get_test_image_file(),
            'price': Decimal('-1.00'), 'start_date': self.today, 'end_date': self.today,
            'start_time': time(9, 0), 'end_time': time(10, 0), 'periodicity': 'once', 'max_attendants': 1
        }
        s = CourseSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn('price', s.errors)

        # Too large price
        data['price'] = Decimal('1000000.00')
        s = CourseSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn('price', s.errors)

        # Forbidden small range
        data['price'] = Decimal('0.10')
        s = CourseSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn('price', s.errors)

    def test_image_required_on_create_and_size_limit(self):
        # Missing image on create
        data = {
            'title': 'No Image', 'description': 'd', 'price': Decimal('10.00'),
            'start_date': self.today, 'end_date': self.today, 'start_time': time(9, 0),
            'end_time': time(10, 0), 'periodicity': 'once', 'max_attendants': 1
        }
        s = CourseSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn('image', s.errors)

        # Image too large (>1MB)
        big = BytesIO()
        big.write(b"\0" * (1024 * 1024 + 10))
        big.name = 'big.png'
        big.seek(0)
        big_file = SimpleUploadedFile(big.name, big.read(), content_type='image/png')
        data['image'] = big_file
        s = CourseSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn('image', s.errors)

    def test_to_internal_value_sets_draft_false_and_empty_strings_to_none(self):
        data = {
            'title': 'Draft Test', 'description': 'd', 'image': get_test_image_file(),
            'price': Decimal('10.00'), 'start_date': None, 'end_date': None, 'start_time': None, 'end_time': None,
            'periodicity': 'once', 'max_attendants': 1
        }
        s = CourseSerializer(data=data)
        # validate to populate validated_data
        self.assertTrue(s.is_valid())
        self.assertIn('draft', s.validated_data)
        self.assertFalse(s.validated_data['draft'])
        # None values should remain None
        self.assertIsNone(s.validated_data.get('start_date'))
        self.assertIsNone(s.validated_data.get('start_time'))

    def test_prevent_lowering_max_attendants_below_enrolled(self):
        # Create course with one enrollment
        course = Course.objects.create(
            title='CapTest', description='d', image=get_test_image_file(), price=10.0,
            start_date=self.today, end_date=self.today, start_time=time(9, 0), end_time=time(10, 0),
            periodicity='once', max_attendants=5
        )
        user = CustomUser.objects.create_user(email='u@example.com', username='u', password=TEST_PASSWORD,
                                              name='A', surname='B', company='C')
        Enrollment.objects.create(user=user, course=course)

        s = CourseSerializer(instance=course, data={'max_attendants': 0}, partial=True)
        self.assertFalse(s.is_valid())
        self.assertIn('max_attendants', s.errors)

    def test_method_field_exception_fallbacks_and_weekday_display(self):
        # Create a course and monkeypatch instance methods to raise
        course = Course.objects.create(
            title='MethTest', description='d', image=get_test_image_file(), price=10.0,
            start_date=self.today, end_date=self.today, start_time=time(9, 0), end_time=time(10, 0),
            periodicity='once', max_attendants=1
        )

        def boom_next(limit=5):
            raise Exception('boom')

        def boom_desc():
            raise Exception('boom')

        course.get_next_occurrences = boom_next
        course.get_schedule_description = boom_desc
        course.weekdays = []

        s = CourseSerializer(instance=course)
        data = s.data
        self.assertEqual(data['next_occurrences'], [])
        self.assertIsNone(data['schedule_description'])
        self.assertEqual(data['weekday_display'], [])

    def test_weekday_display_populated(self):
        course = Course.objects.create(
            title='WeekTest', description='d', image=get_test_image_file(), price=10.0,
            start_date=self.today, end_date=self.today, start_time=time(9, 0), end_time=time(10, 0),
            periodicity='once', weekdays=[0, 2], max_attendants=1
        )
        s = CourseSerializer(instance=course)
        wd = s.data['weekday_display']
        self.assertIn('Monday', wd)
        self.assertIn('Wednesday', wd)

    def test_enrollment_serializer_user_details_handles_missing_names(self):
        user = CustomUser.objects.create_user(
            email='n@example.com', username='n', password=TEST_PASSWORD,
            name='', surname='', company=''
        )
        course = Course.objects.create(
            title='E', description='d', image=get_test_image_file(), price=10.0,
            start_date=self.today, end_date=self.today, start_time=time(9, 0), end_time=time(10, 0),
            periodicity='once', max_attendants=1
        )
        e = Enrollment.objects.create(user=user, course=course)
        s = EnrollmentSerializer(instance=e)
        ud = s.data['user_details']
        self.assertEqual(ud['name'], '')
        self.assertEqual(ud['surname'], '')
        self.assertEqual(ud['company'], '')


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class EnrollmentSerializerTest(CourseImageCleanupTestMixin, TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email='test@example.com',
            username='testuser',
            password=TEST_PASSWORD,
            name='Test',
            surname='User',
            company='Test Company'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            image=get_test_image_file(),
            price=Decimal('99.99'),
            location='Test Location',
            start_date=date(2023, 12, 31),
            end_date=date(2023, 12, 31),
            start_time=time(14, 0),
            end_time=time(17, 0),
            periodicity='once',
            max_attendants=20
        )
        self.enrollment = Enrollment.objects.create(
            user=self.user,
            course=self.course
        )
        self.serializer = EnrollmentSerializer(instance=self.enrollment)

    def tearDown(self):
        """Clean up database objects"""
        Enrollment.objects.all().delete()
        Course.objects.all().delete()
        CustomUser.objects.all().delete()
        super().tearDown()

    def test_contains_expected_fields(self):
        data = self.serializer.data
        self.assertCountEqual(
            data.keys(),
            ['id', 'user', 'course', 'enrolled_at', 'user_details']
        )

    def test_field_content(self):
        data = self.serializer.data
        self.assertEqual(data['user'], self.user.id)
        self.assertEqual(data['course'], self.course.id)
        self.assertIsNotNone(data['enrolled_at'])

    def test_validation(self):
        # Test with valid data
        user2 = CustomUser.objects.create_user(
            email='test2@example.com',
            username='testuser2',
            password=TEST_PASSWORD,
            name='Test2',
            surname='User2',
            company='Test Company'
        )
        valid_data = {
            'user': user2.id,
            'course': self.course.id
        }
        serializer = EnrollmentSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())

        # Test with invalid data
        invalid_data = {
            'user': 999,  # Non-existent user
            'course': self.course.id
        }
        serializer = EnrollmentSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('user', serializer.errors)


# View Tests
@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CourseViewSetTest(CourseImageCleanupTestMixin, APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = CustomUser.objects.create_user(
            email='admin@example.com',
            username='adminuser',
            password=TEST_PASSWORD,
            name='Admin',
            surname='User',
            company='Admin Company',
            is_staff=True
        )
        self.regular_user = CustomUser.objects.create_user(
            email='user@example.com',
            username='regularuser',
            password=TEST_PASSWORD,
            name='Regular',
            surname='User',
            company='User Company'
        )
        self.course_data = {
            'title': 'Test Course',
            'subtitle': 'Test Subtitle',
            'description': 'Test Description',
            'image': get_test_image_file(),
            'price': '99.99',
            'location': 'Test Location',
            'start_date': '2023-12-31',
            'end_date': '2023-12-31',
            'start_time': '14:00:00',
            'end_time': '17:00:00',
            'periodicity': 'once',
            'max_attendants': 20
        }
        self.course = Course.objects.create(
            title='Existing Course',
            description='Existing Description',
            image=get_test_image_file(),
            price=Decimal('49.99'),
            location='Existing Location',
            start_date=date(2023, 11, 30),
            end_date=date(2023, 11, 30),
            start_time=time(10, 0),
            end_time=time(13, 0),
            periodicity='once',
            max_attendants=10
        )
        self.course_url = reverse('course-list')
        self.course_detail_url = reverse('course-detail', kwargs={'slug': self.course.slug})
        self.course_enroll_url = reverse('course-enroll', kwargs={'slug': self.course.slug})

    def tearDown(self):
        """Clean up database objects"""
        Enrollment.objects.all().delete()
        Course.objects.all().delete()
        CustomUser.objects.all().delete()
        super().tearDown()

    def test_list_courses(self):
        # Anyone can list courses
        response = self.client.get(self.course_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_course(self):
        # Anyone can retrieve a course
        response = self.client.get(self.course_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Existing Course')

    def test_create_course_as_admin(self):
        # Admin can create a course
        self.client.force_authenticate(user=self.admin_user)

        # Create fresh image file for this test
        course_data = self.course_data.copy()
        course_data['image'] = get_test_image_file()

        response = self.client.post(self.course_url, course_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.count(), 2)
        self.assertEqual(Course.objects.latest('id').title, 'Test Course')

    def test_create_course_as_regular_user(self):
        # Regular user cannot create a course
        self.client.force_authenticate(user=self.regular_user)

        # Create fresh image file for this test
        course_data = self.course_data.copy()
        course_data['image'] = get_test_image_file()

        response = self.client.post(self.course_url, course_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Course.objects.count(), 1)

    def test_update_course_as_admin(self):
        # Admin can update a course
        self.client.force_authenticate(user=self.admin_user)
        update_data = {'title': 'Updated Course Title'}
        response = self.client.patch(self.course_detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.course.refresh_from_db()
        self.assertEqual(self.course.title, 'Updated Course Title')

    def test_update_course_as_regular_user(self):
        # Regular user cannot update a course
        self.client.force_authenticate(user=self.regular_user)
        update_data = {'title': 'Attempted Update'}
        response = self.client.patch(self.course_detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.course.refresh_from_db()
        self.assertEqual(self.course.title, 'Existing Course')

    def test_delete_course_as_admin(self):
        # Admin can delete a course
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.course_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Course.objects.count(), 0)

    def test_delete_course_as_regular_user(self):
        # Regular user cannot delete a course
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.delete(self.course_detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Course.objects.count(), 1)

    def test_enroll_in_course(self):
        # User can enroll in a course
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.post(self.course_enroll_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Enrollment.objects.filter(user=self.regular_user, course=self.course).exists())

    def test_enroll_in_course_unauthenticated(self):
        # Unauthenticated user cannot enroll
        response = self.client.post(self.course_enroll_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Enrollment.objects.count(), 0)

    def test_enroll_in_course_already_enrolled(self):
        # Cannot enroll twice
        self.client.force_authenticate(user=self.regular_user)
        Enrollment.objects.create(user=self.regular_user, course=self.course)
        response = self.client.post(self.course_enroll_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Enrollment.objects.count(), 1)

    def test_enroll_in_full_course(self):
        # Cannot enroll in a full course
        self.client.force_authenticate(user=self.regular_user)
        # Fill the course to capacity
        for i in range(self.course.max_attendants):
            user = CustomUser.objects.create_user(
                email=f'user{i}@example.com',
                username=f'user{i}',
                password=TEST_PASSWORD,
                name=f'User{i}',
                surname='Test',
                company='Test Company'
            )
            Enrollment.objects.create(user=user, course=self.course)

        # Try to enroll one more user
        response = self.client.post(self.course_enroll_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Enrollment.objects.filter(user=self.regular_user, course=self.course).exists())

    def test_enroll_in_course_without_dates(self):
        # Create a course without dates
        course_without_dates = Course.objects.create(
            title='Course Without Dates',
            description='Test Description',
            image=get_test_image_file(),
            price=Decimal('99.99'),
            location='Test Location',
            start_date=None,
            end_date=None,
            start_time=None,
            end_time=None,
            periodicity='once',
            max_attendants=20
        )

        # Set up the URL for enrollment
        course_enroll_url = reverse('course-enroll', kwargs={'slug': course_without_dates.slug})

        # Attempt to enroll as a regular user
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.post(course_enroll_url)

        # Verify enrollment is rejected
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Enrollment.objects.filter(user=self.regular_user, course=course_without_dates).exists())


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class EnrollmentViewSetTest(CourseImageCleanupTestMixin, APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = CustomUser.objects.create_user(
            email='admin@example.com',
            username='adminuser',
            password=TEST_PASSWORD,
            name='Admin',
            surname='User',
            company='Admin Company',
            is_staff=True
        )
        self.regular_user = CustomUser.objects.create_user(
            email='user@example.com',
            username='regularuser',
            password=TEST_PASSWORD,
            name='Regular',
            surname='User',
            company='User Company'
        )
        self.other_user = CustomUser.objects.create_user(
            email='other@example.com',
            username='otheruser',
            password=TEST_PASSWORD,
            name='Other',
            surname='User',
            company='Other Company'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            image=get_test_image_file(),
            price=Decimal('99.99'),
            location='Test Location',
            start_date=date(2023, 12, 31),
            end_date=date(2023, 12, 31),
            start_time=time(14, 0),
            end_time=time(17, 0),
            periodicity='once',
            max_attendants=20
        )
        self.enrollment = Enrollment.objects.create(
            user=self.regular_user,
            course=self.course
        )
        self.other_enrollment = Enrollment.objects.create(
            user=self.other_user,
            course=self.course
        )
        self.enrollment_url = reverse('enrollment-list')
        self.enrollment_detail_url = reverse('enrollment-detail', kwargs={'pk': self.enrollment.pk})

    def tearDown(self):
        """Clean up database objects"""
        Enrollment.objects.all().delete()
        Course.objects.all().delete()
        CustomUser.objects.all().delete()
        super().tearDown()

    def test_list_enrollments_as_admin(self):
        # Admin can see all enrollments
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.enrollment_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_enrollments_as_regular_user(self):
        # Regular user can only see their own enrollments
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.enrollment_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['user'], self.regular_user.id)

    def test_retrieve_own_enrollment(self):
        # User can retrieve their own enrollment
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.enrollment_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user'], self.regular_user.id)

    def test_retrieve_other_enrollment_as_regular_user(self):
        # Regular user cannot retrieve another user's enrollment
        self.client.force_authenticate(user=self.regular_user)
        other_enrollment_url = reverse('enrollment-detail', kwargs={'pk': self.other_enrollment.pk})
        response = self.client.get(other_enrollment_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_other_enrollment_as_admin(self):
        # Admin can retrieve any enrollment
        self.client.force_authenticate(user=self.admin_user)
        other_enrollment_url = reverse('enrollment-detail', kwargs={'pk': self.other_enrollment.pk})
        response = self.client.get(other_enrollment_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user'], self.other_user.id)

    def test_create_enrollment_not_allowed(self):
        # EnrollmentViewSet is ReadOnlyModelViewSet, so create should not be allowed
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'user': self.admin_user.id,
            'course': self.course.id
        }
        response = self.client.post(self.enrollment_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_update_enrollment_not_allowed(self):
        # EnrollmentViewSet is ReadOnlyModelViewSet, so update should not be allowed
        self.client.force_authenticate(user=self.admin_user)
        data = {'user': self.admin_user.id}
        response = self.client.patch(self.enrollment_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete_enrollment_not_allowed(self):
        # EnrollmentViewSet is ReadOnlyModelViewSet, so delete should not be allowed
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.enrollment_detail_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_unauthenticated_access(self):
        # Unauthenticated user cannot access enrollments
        response = self.client.get(self.enrollment_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# Advanced Scheduling Tests
@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class AdvancedSchedulingTestCase(CourseImageCleanupTestMixin, TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password=TEST_PASSWORD,
            name='Test',
            surname='User',
            company='Test Company'
        )

    def tearDown(self):
        """Clean up database objects"""
        Course.objects.all().delete()
        CustomUser.objects.all().delete()
        super().tearDown()

    def test_once_schedule(self):
        """Test one-time event scheduling"""
        course = Course.objects.create(
            title='One-time Workshop',
            description='A single workshop session',
            image=get_test_image_file(),
            price=50.00,
            location='Conference Room A',
            start_date=date(2125, 9, 15),
            end_date=date(2125, 9, 15),
            start_time=time(14, 0),
            end_time=time(17, 0),
            periodicity='once',
            max_attendants=20
        )

        occurrences = course.get_next_occurrences()
        self.assertEqual(len(occurrences), 1)
        self.assertEqual(occurrences[0], date(2125, 9, 25))

    def test_weekly_multiple_weekdays(self):
        """Test weekly schedule on multiple weekdays (e.g., Mon & Wed)"""
        course = Course.objects.create(
            title='Yoga Classes',
            description='Weekly yoga sessions',
            image=get_test_image_file(),
            price=80.00,
            location='Studio B',
            start_date=date(2025, 9, 1),  # Sunday
            end_date=date(2025, 12, 31),
            start_time=time(18, 0),
            end_time=time(19, 30),
            periodicity='weekly',
            weekdays=[0, 2],  # Monday and Wednesday
            max_attendants=15
        )

        occurrences = course.get_next_occurrences(limit=8)
        # Should get Mondays and Wednesdays
        for occurrence in occurrences:
            self.assertIn(occurrence.weekday(), [0, 2])  # Mon=0, Wed=2

    def test_biweekly_schedule(self):
        """Test biweekly schedule"""
        course = Course.objects.create(
            title='Advanced Programming',
            description='Biweekly coding sessions',
            image=get_test_image_file(),
            price=120.00,
            location='Lab 1',
            start_date=date(2025, 9, 2),  # Monday
            end_date=date(2025, 12, 31),
            start_time=time(19, 0),
            end_time=time(21, 0),
            periodicity='biweekly',
            weekdays=[0],  # Monday only
            max_attendants=10
        )

        occurrences = course.get_next_occurrences(limit=4)
        # Should be every other Monday
        for i in range(1, len(occurrences)):
            days_diff = (occurrences[i] - occurrences[i-1]).days
            self.assertEqual(days_diff, 14)  # Exactly 2 weeks

    def test_monthly_first_monday(self):
        """Test monthly schedule on first Monday of each month"""
        course = Course.objects.create(
            title='Monthly Team Meeting',
            description='First Monday of every month',
            image=get_test_image_file(),
            price=0.00,
            location='Meeting Room',
            start_date=date(2025, 9, 1),
            end_date=date(2025, 12, 31),
            start_time=time(9, 0),
            end_time=time(10, 0),
            periodicity='monthly',
            weekdays=[0],  # Monday
            week_of_month=1,  # First week
            max_attendants=50
        )

        occurrences = course.get_next_occurrences(limit=4)
        # Each occurrence should be the first Monday of its month
        for occurrence in occurrences:
            self.assertEqual(occurrence.weekday(), 0)  # Monday
            # Should be in the first 7 days of the month
            self.assertLessEqual(occurrence.day, 7)

    def test_custom_interval(self):
        """Test custom interval (every 3 weeks)"""
        course = Course.objects.create(
            title='Special Workshop Series',
            description='Every 3 weeks',
            image=get_test_image_file(),
            price=75.00,
            location='Workshop Space',
            start_date=date(2025, 9, 1),
            end_date=date(2025, 12, 31),
            start_time=time(10, 0),
            end_time=time(12, 0),
            periodicity='weekly',
            interval=3,  # Every 3 weeks
            max_attendants=25
        )

        occurrences = course.get_next_occurrences(limit=4)
        # Should be every 3 weeks (21 days)
        for i in range(1, len(occurrences)):
            days_diff = (occurrences[i] - occurrences[i-1]).days
            self.assertEqual(days_diff, 21)

    def test_exclude_dates(self):
        """Test excluding specific dates (holidays)"""
        course = Course.objects.create(
            title='Daily Exercise',
            description='Daily except holidays',
            image=get_test_image_file(),
            price=100.00,
            location='Gym',
            start_date=date(2025, 12, 20),
            end_date=date(2025, 12, 30),
            start_time=time(7, 0),
            end_time=time(8, 0),
            periodicity='daily',
            exclude_dates=['2025-12-25', '2025-12-26'],  # Christmas holidays
            max_attendants=30
        )

        occurrences = course.get_next_occurrences()
        excluded_dates = [date(2025, 12, 25), date(2025, 12, 26)]

        # None of the excluded dates should be in occurrences
        for excluded_date in excluded_dates:
            self.assertNotIn(excluded_date, occurrences)

    def test_calendar_export_google(self):
        """Test Google Calendar export"""
        course = Course.objects.create(
            title='Test Course',
            description='Test description',
            image=get_test_image_file(),
            price=50.00,
            location='Test Location',
            start_date=date(2225, 9, 15),
            end_date=date(2225, 9, 15),
            start_time=time(14, 0),
            end_time=time(17, 0),
            periodicity='once',
            max_attendants=20
        )

        export_data = course.get_calendar_export_data('google')
        self.assertIsInstance(export_data, list)
        self.assertGreater(len(export_data), 0)
        self.assertIn('url', export_data[0])
        self.assertIn('calendar.google.com', export_data[0]['url'])

    def test_calendar_export_ics(self):
        """Test ICS calendar export"""
        course = Course.objects.create(
            title='Test Course',
            description='Test description',
            image=get_test_image_file(),
            price=50.00,
            location='Test Location',
            start_date=date(2125, 9, 25),
            end_date=date(2125, 9, 25),
            start_time=time(14, 0),
            end_time=time(17, 0),
            periodicity='once',
            max_attendants=20
        )

        export_data = course.get_calendar_export_data('ics')
        self.assertIsInstance(export_data, str)
        self.assertIn('BEGIN:VCALENDAR', export_data)
        self.assertIn('BEGIN:VEVENT', export_data)
        self.assertIn('Test Course', export_data)

    def test_formatted_schedule_display(self):
        """Test formatted schedule display for complex patterns"""
        course = Course.objects.create(
            title='Complex Schedule',
            description='Test complex schedule display',
            image=get_test_image_file(),
            price=60.00,
            location='Test Room',
            start_date=date(2025, 9, 1),
            end_date=date(2025, 12, 31),
            start_time=time(18, 0),
            end_time=time(19, 30),
            periodicity='weekly',
            weekdays=[0, 2, 4],  # Mon, Wed, Fri
            max_attendants=15
        )

        formatted = course.formatted_schedule
        self.assertIn('Monday', formatted)
        self.assertIn('Wednesday', formatted)
        self.assertIn('Friday', formatted)
        self.assertIn('18:00', formatted)
        self.assertIn('19:30', formatted)

    def test_duration_calculation(self):
        """Test course duration calculation"""
        course = Course.objects.create(
            title='Duration Test',
            description='Test duration calculation',
            image=get_test_image_file(),
            price=50.00,
            location='Test Room',
            start_date=date(2025, 9, 1),
            end_date=date(2025, 9, 1),
            start_time=time(14, 0),
            end_time=time(16, 30),  # 2.5 hours
            periodicity='once',
            max_attendants=20
        )

        self.assertEqual(course.duration_hours, 2.5)

    def test_schedule_description(self):
        """Test detailed schedule description"""
        course = Course.objects.create(
            title='Description Test',
            description='Test schedule description',
            image=get_test_image_file(),
            price=50.00,
            location='Test Room',
            start_date=date(2025, 9, 1),
            end_date=date(2025, 12, 31),
            start_time=time(18, 0),
            end_time=time(19, 30),
            periodicity='weekly',
            weekdays=[0, 2],  # Mon, Wed
            interval=2,  # Every 2 weeks
            exclude_dates=['2025-12-25'],
            max_attendants=15
        )

        description = course.get_schedule_description()
        self.assertIn('Weekly', description)
        self.assertIn('Every 2', description)
        self.assertIn('Monday', description)
        self.assertIn('Wednesday', description)
        self.assertIn('Excluded dates: 1', description)


class CourseAdminTest(CourseImageCleanupTestMixin, TestCase):
    def setUp(self):
        self.course = Course.objects.create(
            title='Admin Test',
            description='desc',
            image=get_test_image_file(),
            price=10.0,
            location='loc',
            start_date=date(2025, 1, 1),
            end_date=date(2025, 1, 2),
            start_time=time(10, 0),
            end_time=time(12, 0),
            periodicity='once',
            max_attendants=5
        )
        self.admin = CourseAdmin(Course, django_admin.site)

    def test_get_enrolled_count(self):
        self.assertEqual(self.admin.get_enrolled_count(self.course), 0)

    def test_get_weekdays_display_empty(self):
        self.assertEqual(self.admin.get_weekdays_display(self.course), '-')

    def test_get_weekdays_display_some(self):
        self.course.weekdays = [0, 2]
        self.assertIn('Monday', self.admin.get_weekdays_display(self.course))
        self.assertIn('Wednesday', self.admin.get_weekdays_display(self.course))

    def test_get_form_help_text(self):
        form = self.admin.get_form(request=None)
        self.assertIn('Select specific weekdays', form.base_fields['weekdays'].help_text)
        self.assertIn('Dates to exclude from schedule', form.base_fields['exclude_dates'].help_text)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CourseFormTest(TestCase):
    def setUp(self):
        # Minimal course data for form validation
        self.today = timezone.now().date()
        self.course_data = {
            'title': 'Form Test',
            'description': 'desc',
            'image': get_test_image_file(),
            'price': Decimal('10.00'),
            'location': 'loc',
            'start_date': self.today,
            'end_date': self.today + timedelta(days=1),
            'start_time': time(10, 0),
            'end_time': time(12, 0),
            'periodicity': 'once',
            'max_attendants': 5
        }

    def test_clean_start_date_in_past(self):
        past = self.today - timedelta(days=1)
        data = self.course_data.copy()
        data['start_date'] = past
        form = CourseAdminForm(data, files={'image': get_test_image_file()})
        self.assertFalse(form.is_valid())
        self.assertIn('start_date', form.errors)

    def test_clean_end_date_in_past(self):
        past = self.today - timedelta(days=1)
        data = self.course_data.copy()
        data['end_date'] = past
        form = CourseAdminForm(data, files={'image': get_test_image_file()})
        self.assertFalse(form.is_valid())
        self.assertIn('end_date', form.errors)

    def test_clean_end_date_before_start_date(self):
        data = self.course_data.copy()
        data['start_date'] = self.today + timedelta(days=5)
        data['end_date'] = self.today + timedelta(days=1)
        form = CourseAdminForm(data, files={'image': get_test_image_file()})
        self.assertFalse(form.is_valid())
        self.assertIn('end_date', form.errors)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CourseModelsExtraTest(CourseImageCleanupTestMixin, TestCase):
    def setUp(self):
        self.today = date.today()

    def get_large_image_file(self):
        # Create a fake image >1MB to trigger validation
        big = BytesIO()
        big.write(b"\0" * (1024 * 1024 + 10))
        big.name = 'big.png'
        big.seek(0)
        return SimpleUploadedFile(big.name, big.read(), content_type='image/png')

    def test_clean_image_too_large_raises(self):
        course = Course(
            title='Big Image',
            description='desc',
            image=self.get_large_image_file(),
            price=Decimal('10.00'),
            start_date=self.today,
            end_date=self.today,
            start_time=time(10, 0),
            end_time=time(11, 0),
            periodicity='once',
            max_attendants=1
        )
        with self.assertRaises(ValidationError):
            course.full_clean()

    def test_formatted_schedule_daily_and_biweekly_and_custom(self):
        # Daily interval >1
        c1 = Course.objects.create(
            title='Daily',
            description='d',
            image=get_test_image_file(),
            price=10.0,
            location='loc',
            start_date=self.today,
            end_date=self.today + timedelta(days=5),
            start_time=time(9, 0),
            end_time=time(10, 0),
            periodicity='daily',
            interval=2,
            max_attendants=1,
        )
        fs = c1.formatted_schedule
        self.assertIn('Every 2 days', fs)

        # Biweekly with weekdays
        c2 = Course.objects.create(
            title='Biweekly',
            description='d',
            image=get_test_image_file(),
            price=10.0,
            location='loc',
            start_date=self.today,
            end_date=self.today + timedelta(days=30),
            start_time=time(9, 0),
            end_time=time(10, 0),
            periodicity='biweekly',
            weekdays=[self.today.weekday()],
            max_attendants=1,
        )
        self.assertIn('Every other week on', c2.formatted_schedule)

        # Custom with no weekdays
        c3 = Course.objects.create(
            title='Custom',
            description='d',
            image=get_test_image_file(),
            price=10.0,
            location='loc',
            start_date=self.today,
            end_date=self.today + timedelta(days=5),
            start_time=time(9, 0),
            end_time=time(10, 0),
            periodicity='custom',
            max_attendants=1,
        )
        self.assertIn('Custom schedule', c3.formatted_schedule)

    def test_get_schedule_description_all_parts(self):
        c = Course.objects.create(
            title='Desc',
            description='d',
            image=get_test_image_file(),
            price=10.0,
            location='loc',
            start_date=self.today,
            end_date=self.today + timedelta(days=30),
            start_time=time(9, 0),
            end_time=time(10, 0),
            periodicity='weekly',
            interval=2,
            weekdays=[0, 2],
            week_of_month=1,
            exclude_dates=['2025-12-25'],
            max_attendants=5,
        )
        desc = c.get_schedule_description()
        self.assertIn('Interval: Every 2', desc)
        self.assertIn('Weekdays:', desc)
        self.assertIn('Week of month:', desc)
        self.assertIn('Excluded dates: 1', desc)

    def test_calendar_export_missing_times(self):
        c = Course.objects.create(
            title='NoTimes',
            description='d',
            image=get_test_image_file(),
            price=10.0,
            location='loc',
            start_date=self.today,
            end_date=self.today + timedelta(days=1),
            start_time=None,
            end_time=None,
            periodicity='once',
            max_attendants=1,
        )
        self.assertEqual(c.get_calendar_export_data('google'), [])
        self.assertEqual(c.get_calendar_export_data('outlook'), [])
        self.assertIsNone(c.get_calendar_export_data('ics'))

    def test_get_next_occurrences_daily_and_custom(self):
        start = self.today
        c = Course.objects.create(
            title='DailyOcc',
            description='d',
            image=get_test_image_file(),
            price=10.0,
            location='loc',
            start_date=start,
            end_date=start + timedelta(days=4),
            start_time=time(9, 0),
            end_time=time(10, 0),
            periodicity='daily',
            interval=1,
            max_attendants=1,
        )
        occ = c.get_next_occurrences(limit=3)
        self.assertGreaterEqual(len(occ), 1)

        # Custom using weekdays fallback
        c2 = Course.objects.create(
            title='CustomOcc',
            description='d',
            image=get_test_image_file(),
            price=10.0,
            location='loc',
            start_date=start,
            end_date=start + timedelta(days=10),
            start_time=time(9, 0),
            end_time=time(10, 0),
            periodicity='custom',
            weekdays=[start.weekday()],
            max_attendants=1,
        )
        occ2 = c2.get_next_occurrences(limit=5)
        self.assertTrue(all([d.weekday() == start.weekday() for d in occ2]))

    def test__is_nth_weekday_of_month_last_and_invalid(self):
        c = Course()
        # Pick a known date which is last Monday of September 2025: 29 Sep 2025 is Monday and last Monday
        test_date = date(2025, 9, 29)
        self.assertTrue(c._is_nth_weekday_of_month(test_date, 0, -1))
        # Invalid week_of_month (too large)
        self.assertFalse(c._is_nth_weekday_of_month(test_date, 0, 10))

    def test_save_slug_uniqueness_and_truncation_and_image_replace_delete(self):
        # Create a base course with a long title
        long_title = 'a' * 150
        c1 = Course.objects.create(
            title=long_title,
            description='d',
            image=get_test_image_file(),
            price=10.0,
            location='loc',
            start_date=self.today,
            end_date=self.today,
            start_time=time(9, 0),
            end_time=time(10, 0),
            periodicity='once',
            max_attendants=1,
        )
        self.assertTrue(len(c1.slug) <= 110)

        # Create another with same title -> should get suffix
        c2 = Course.objects.create(
            title=long_title,
            description='d',
            image=get_test_image_file(),
            price=10.0,
            location='loc',
            start_date=self.today,
            end_date=self.today,
            start_time=time(9, 0),
            end_time=time(10, 0),
            periodicity='once',
            max_attendants=1,
        )
        self.assertNotEqual(c1.slug, c2.slug)

        # Test image replacement deletes old file
        old_path = c2.image.path
        new_image = get_test_image_file()
        c2.image = new_image
        c2.save()
        self.assertFalse(os.path.exists(old_path))

        # Test delete removes file
        path = c2.image.path
        c2.delete()
        self.assertFalse(os.path.exists(path))


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CourseModelsMoreTest(CourseImageCleanupTestMixin, TestCase):
    def setUp(self):
        self.today = date.today()

    def test_formatted_schedule_once_and_weekly_no_weekdays(self):
        # Once
        c_once = Course.objects.create(
            title='OnceFmt', description='d', image=get_test_image_file(), price=10.0,
            location='loc', start_date=self.today, end_date=self.today, start_time=time(8, 0), end_time=time(9, 0),
            periodicity='once', max_attendants=1
        )
        fs = c_once.formatted_schedule
        self.assertIn('from', fs)

        # Weekly with no weekdays (fallback)
        c_week = Course.objects.create(
            title='WeekFmt', description='d', image=get_test_image_file(), price=10.0,
            location='loc', start_date=self.today, end_date=self.today + timedelta(days=14),
            start_time=time(8, 0), end_time=time(9, 0), periodicity='weekly', weekdays=[], interval=1, max_attendants=1
        )
        self.assertIn('Weekly', c_week.formatted_schedule)

    def test_formatted_schedule_monthly_simple_and_with_week_of_month(self):
        # Simple monthly (same day)
        start = date(self.today.year, self.today.month, 5)
        c_month = Course.objects.create(
            title='MonthSimple', description='d', image=get_test_image_file(), price=10.0,
            location='loc', start_date=start, end_date=start + timedelta(days=90),
            start_time=time(8, 0), end_time=time(9, 0), periodicity='monthly', interval=1, max_attendants=1
        )
        self.assertIn('Monthly', c_month.formatted_schedule)

        # Monthly with week_of_month and weekdays
        c_month2 = Course.objects.create(
            title='MonthComplex',
            description='d',
            image=get_test_image_file(),
            price=10.0,
            location='loc',
            start_date=start,
            end_date=start + timedelta(days=90),
            start_time=time(8, 0),
            end_time=time(9, 0),
            periodicity='monthly',
            weekdays=[0],
            week_of_month=1,
            max_attendants=1,
        )
        self.assertIn('First week', c_month2.formatted_schedule)

    def test_get_next_occurrences_weekly_no_weekdays_and_monthly_complex(self):
        # Weekly fallback to start_date weekday
        start = self.today
        c = Course.objects.create(
            title='WeeklyFallback', description='d', image=get_test_image_file(), price=10.0,
            location='loc', start_date=start, end_date=start + timedelta(days=21),
            start_time=time(8, 0), end_time=time(9, 0), periodicity='weekly', weekdays=[], interval=1, max_attendants=1
        )
        occ = c.get_next_occurrences(limit=5)
        # occurrences should include dates with same weekday as start
        self.assertTrue(all([d.weekday() == start.weekday() for d in occ]))

        # Monthly complex: first Monday of next months (use a date that is a Monday)
        test_date = date(2025, 9, 1)  # 1 Sep 2025 is Monday
        c2 = Course.objects.create(
            title='MonthlyNth',
            description='d',
            image=get_test_image_file(),
            price=10.0,
            location='loc',
            start_date=test_date,
            end_date=date(2025, 12, 31),
            start_time=time(8, 0),
            end_time=time(9, 0),
            periodicity='monthly',
            weekdays=[0],
            week_of_month=1,
            max_attendants=1,
        )
        occ2 = c2.get_next_occurrences(limit=3)
        self.assertTrue(len(occ2) >= 1)

    def test_save_handles_missing_old_instance_and_calendar_unknown(self):
        # Create and delete underlying DB row to trigger Course.DoesNotExist in save()
        c = Course.objects.create(
            title='Transient', description='d', image=get_test_image_file(), price=10.0,
            location='loc', start_date=self.today, end_date=self.today, start_time=time(8, 0), end_time=time(9, 0),
            periodicity='once', max_attendants=1
        )
        pk = c.pk
        # Delete DB row
        Course.objects.filter(pk=pk).delete()
        # c still has pk set; calling save should handle missing old_instance gracefully
        c.title = 'Transient Updated'
        c.save()  # should not raise

        # Unknown calendar format returns None
        c3 = Course.objects.create(
            title='CalUnknown', description='d', image=get_test_image_file(), price=10.0,
            location='loc', start_date=self.today, end_date=self.today, start_time=time(8, 0), end_time=time(9, 0),
            periodicity='once', max_attendants=1
        )
        self.assertIsNone(c3.get_calendar_export_data('unknown'))


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CourseViewActionsExtraTest(CourseImageCleanupTestMixin, APITestCase):
    """Focused tests for specific CourseViewSet actions and Stripe webhook handling."""
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='view@example.com', username='viewuser', password=TEST_PASSWORD,
            name='V', surname='U', company='VC'
        )
        self.course = Course.objects.create(
            title='ActionCourse', description='d', image=get_test_image_file(), price=Decimal('10.00'),
            start_date=date.today() + timedelta(days=7), end_date=date.today() + timedelta(days=7),
            start_time=time(9, 0), end_time=time(10, 0), periodicity='once', max_attendants=10
        )

    def tearDown(self):
        Enrollment.objects.all().delete()
        Course.objects.all().delete()
        CustomUser.objects.all().delete()
        super().tearDown()

    def test_create_checkout_session_without_stripe_key_returns_500(self):
        # Ensure STRIPE_SECRET_KEY is not set
        if 'STRIPE_SECRET_KEY' in os.environ:
            del os.environ['STRIPE_SECRET_KEY']
        self.client.force_authenticate(user=self.user)
        url = reverse('course-create-checkout-session', kwargs={'slug': self.course.slug})
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_refund_course_without_payment_intent_unenrolls(self):
        # Enroll the user without a stripe payment intent
        Enrollment.objects.create(user=self.user, course=self.course)
        self.client.force_authenticate(user=self.user)
        url = reverse('course-refund-course', kwargs={'slug': self.course.slug})
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(Enrollment.objects.filter(user=self.user, course=self.course).exists())

    def test_calendar_export_test_forbidden_when_not_enrolled(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('course-calendar-export-test', kwargs={'slug': self.course.slug})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_stripe_webhook_invalid_signature_returns_400(self):
        # Call webhook endpoint with invalid signature
        webhook_url = reverse('stripe-webhook')
        payload = json.dumps({'type': 'test.event'}).encode('utf-8')
        resp = self.client.post(webhook_url, data=payload, content_type='application/json', HTTP_STRIPE_SIGNATURE='bad')
        self.assertEqual(resp.status_code, 400)

    def test_get_object_numeric_fallback_allows_numeric_id_in_url(self):
        # Retrieve course using numeric id in the slug position
        url = reverse('course-detail', kwargs={'slug': str(self.course.pk)})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['title'], self.course.title)

    def test_create_checkout_session_missing_user_email_returns_400(self):
        # User without email cannot create checkout session. create_user requires an email,
        # so create with a placeholder and then clear the field to simulate missing email.
        no_email_user = CustomUser.objects.create_user(
            email='placeholder@example.com', username='noemail', password=TEST_PASSWORD,
            name='N', surname='E', company='C'
        )
        no_email_user.email = ''
        no_email_user.save()
        self.client.force_authenticate(user=no_email_user)
        url = reverse('course-create-checkout-session', kwargs={'slug': self.course.slug})
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_checkout_session_success_with_mocked_stripe(self):
        # Mock stripe.checkout.Session.create to simulate a successful session creation
        import stripe as _stripe_module

        class DummySession:
            def __init__(self, url):
                self.url = url

        orig_create = None
        try:
            orig_create = _stripe_module.checkout.Session.create
        except Exception:
            orig_create = None

        def fake_create(*args, **kwargs):
            return DummySession(url='https://checkout.example/session')

        # Ensure stripe key is present for this branch
        os.environ['STRIPE_SECRET_KEY'] = 'sk_test'
        # Patch
        _stripe_module.checkout.Session.create = fake_create
        try:
            self.client.force_authenticate(user=self.user)
            url = reverse('course-create-checkout-session', kwargs={'slug': self.course.slug})
            resp = self.client.post(url)
            self.assertEqual(resp.status_code, status.HTTP_200_OK)
            self.assertIn('checkout_url', resp.data)
        finally:
            # Restore if possible
            if orig_create is not None:
                _stripe_module.checkout.Session.create = orig_create
            if 'STRIPE_SECRET_KEY' in os.environ:
                del os.environ['STRIPE_SECRET_KEY']

    def test_destroy_unexpected_exception_returns_500(self):
        # Monkeypatch the viewset get_object to raise a non-API exception
        from courses.views import CourseViewSet

        original = CourseViewSet.get_object

        def raise_exc(self):
            raise Exception('boom')

        CourseViewSet.get_object = raise_exc
        try:
            # Make an admin user to attempt delete
            admin = CustomUser.objects.create_user(
                email='a2@example.com',
                username='admin2',
                password=TEST_PASSWORD,
                name='A',
                surname='B',
                company='C',
                is_staff=True,
            )
            self.client.force_authenticate(user=admin)
            url = reverse('course-detail', kwargs={'slug': self.course.slug})
            resp = self.client.delete(url)
            self.assertEqual(resp.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            CourseViewSet.get_object = original

    def test_unenroll_success_and_not_enrolled(self):
        # Enroll then unenroll
        Enrollment.objects.create(user=self.user, course=self.course)
        self.client.force_authenticate(user=self.user)
        url = reverse('course-unenroll', kwargs={'slug': self.course.slug})
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Unenroll again should return 400
        resp2 = self.client.post(url)
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_calendar_export_ics_for_enrolled_user_returns_file(self):
        Enrollment.objects.create(user=self.user, course=self.course)
        self.client.force_authenticate(user=self.user)
        url = reverse('course-calendar-export-test', kwargs={'slug': self.course.slug}) + '?calendar_format=ics'
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'text/calendar')
