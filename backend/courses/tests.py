import tempfile
import shutil
from django.test import TestCase, override_settings
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from django.conf import settings
from decimal import Decimal
from PIL import Image
from io import BytesIO
from datetime import date, time
from django.db import IntegrityError

from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from users.models import CustomUser
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer


# Helper function to create a test image
def get_test_image_file():
    file = BytesIO()
    image = Image.new('RGB', (100, 100))
    image.save(file, 'png')
    file.name = 'test.png'
    file.seek(0)
    return SimpleUploadedFile(file.name, file.read(), content_type='image/png')


# Model Tests
@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CourseModelTest(TestCase):

    @classmethod
    def tearDownClass(cls):
        """Remove the temporary media directory"""
        try:
            shutil.rmtree(settings.MEDIA_ROOT)
        except (OSError, FileNotFoundError):
            pass
        super().tearDownClass()

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
        self.assertEqual(self.course.location, 'Test Location')
        self.assertEqual(self.course.start_date, date(2023, 12, 31))
        self.assertEqual(self.course.end_date, date(2023, 12, 31))
        self.assertEqual(self.course.start_time, time(14, 0))
        self.assertEqual(self.course.end_time, time(17, 0))
        self.assertEqual(self.course.periodicity, 'once')
        self.assertEqual(self.course.max_attendants, 20)
        self.assertTrue(self.course.image)

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
        # Test price min value
        course_data = {
            'title': 'Test Course',
            'subtitle': 'Test Subtitle',
            'description': 'Test Description',
            'image': get_test_image_file(),
            'price': Decimal('0.00'),  # Invalid price
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
class EnrollmentModelTest(TestCase):

    @classmethod
    def tearDownClass(cls):
        """Remove the temporary media directory"""
        try:
            shutil.rmtree(settings.MEDIA_ROOT)
        except (OSError, FileNotFoundError):
            pass
        super().tearDownClass()

    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpassword',
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
class CourseSerializerTest(TestCase):

    @classmethod
    def tearDownClass(cls):
        """Remove the temporary media directory"""
        try:
            shutil.rmtree(settings.MEDIA_ROOT)
        except (OSError, FileNotFoundError):
            pass
        super().tearDownClass()

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
            'id', 'title', 'subtitle', 'description', 'image', 'price',
            'location', 'start_date', 'end_date', 'start_time', 'end_time',
            'periodicity', 'timezone', 'weekdays', 'week_of_month', 'interval',
            'exclude_dates', 'max_attendants', 'enrolled_count',
            'duration_hours', 'formatted_schedule', 'schedule_description',
            'next_occurrences', 'weekday_display', 'created_at', 'updated_at'
        ]
        self.assertCountEqual(data.keys(), expected_fields)

    def test_enrolled_count_field(self):
        # Initially there should be no enrollments
        self.assertEqual(self.serializer.data['enrolled_count'], 0)

        # Create a user and enrollment
        user = CustomUser.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpassword',
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
class EnrollmentSerializerTest(TestCase):

    @classmethod
    def tearDownClass(cls):
        """Remove the temporary media directory"""
        try:
            shutil.rmtree(settings.MEDIA_ROOT)
        except (OSError, FileNotFoundError):
            pass
        super().tearDownClass()

    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpassword',
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
            ['id', 'user', 'course', 'enrolled_at']
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
            password='testpassword',
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
class CourseViewSetTest(APITestCase):

    @classmethod
    def tearDownClass(cls):
        """Remove the temporary media directory"""
        try:
            shutil.rmtree(settings.MEDIA_ROOT)
        except (OSError, FileNotFoundError):
            pass
        super().tearDownClass()

    def setUp(self):
        self.client = APIClient()
        self.admin_user = CustomUser.objects.create_user(
            email='admin@example.com',
            username='adminuser',
            password='adminpassword',
            name='Admin',
            surname='User',
            company='Admin Company',
            is_staff=True
        )
        self.regular_user = CustomUser.objects.create_user(
            email='user@example.com',
            username='regularuser',
            password='userpassword',
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
        self.course_detail_url = reverse('course-detail', kwargs={'pk': self.course.pk})
        self.course_enroll_url = reverse('course-enroll', kwargs={'pk': self.course.pk})

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
                password='password',
                name=f'User{i}',
                surname='Test',
                company='Test Company'
            )
            Enrollment.objects.create(user=user, course=self.course)

        # Try to enroll one more user
        response = self.client.post(self.course_enroll_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Enrollment.objects.filter(user=self.regular_user, course=self.course).exists())


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class EnrollmentViewSetTest(APITestCase):

    @classmethod
    def tearDownClass(cls):
        """Remove the temporary media directory"""
        try:
            shutil.rmtree(settings.MEDIA_ROOT)
        except (OSError, FileNotFoundError):
            pass
        super().tearDownClass()

    def setUp(self):
        self.client = APIClient()
        self.admin_user = CustomUser.objects.create_user(
            email='admin@example.com',
            username='adminuser',
            password='adminpassword',
            name='Admin',
            surname='User',
            company='Admin Company',
            is_staff=True
        )
        self.regular_user = CustomUser.objects.create_user(
            email='user@example.com',
            username='regularuser',
            password='userpassword',
            name='Regular',
            surname='User',
            company='User Company'
        )
        self.other_user = CustomUser.objects.create_user(
            email='other@example.com',
            username='otheruser',
            password='otherpassword',
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
class AdvancedSchedulingTestCase(TestCase):
    @classmethod
    def tearDownClass(cls):
        """Remove the temporary media directory"""
        try:
            shutil.rmtree(settings.MEDIA_ROOT)
        except (OSError, FileNotFoundError):
            pass
        super().tearDownClass()

    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
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
            start_date=date(2025, 9, 15),
            end_date=date(2025, 9, 15),
            start_time=time(14, 0),
            end_time=time(17, 0),
            periodicity='once',
            max_attendants=20
        )

        occurrences = course.get_next_occurrences()
        self.assertEqual(len(occurrences), 1)
        self.assertEqual(occurrences[0], date(2025, 9, 15))

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
            start_date=date(2025, 9, 15),
            end_date=date(2025, 9, 15),
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
            start_date=date(2025, 9, 15),
            end_date=date(2025, 9, 15),
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
