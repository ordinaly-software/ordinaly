from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
import os
import tempfile
from .models import Terms
from .serializers import TermsSerializer
from django.urls import reverse
from django.conf import settings
from django.test import override_settings
from unittest.mock import patch


TEST_PASSWORD = os.environ.get("ORDINALY_TEST_PASSWORD")

User = get_user_model()


# General-purpose test mixin for terms test setup and teardown
class TestTermsSetupMixin:
    @classmethod
    def teardown_class(cls):
        """Remove only test-generated PDF files from MEDIA_ROOT/terms/"""
        terms_dir = os.path.join(settings.MEDIA_ROOT, 'terms')
        if os.path.isdir(terms_dir):
            for fname in os.listdir(terms_dir):
                if fname.endswith('.pdf') and fname.split('_')[0] in [
                  'test', 'create', 'duplicate', 'updated', 'extra', 'new', 'searchable', 'license', 'Temp']:
                    try:
                        os.remove(os.path.join(terms_dir, fname))
                    except Exception:
                        pass
        super().teardown_class()

    def create_test_user(self, **overrides):
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': TEST_PASSWORD,
            'name': 'Test',
            'surname': 'User',
            'company': 'Test Company',
        }
        data.update(overrides)
        return User.objects.create_user(**data)

    def create_test_pdf(self, name="test_terms.pdf", content=b"%PDF-1.5\n%Test PDF content"):
        return SimpleUploadedFile(name, content, content_type="application/pdf")

    def get_basic_terms_data(self, **overrides):
        data = {
            'name': 'Test Terms',
            'author': getattr(self, 'user', None),
            'pdf_content': getattr(self, 'pdf_content', None),
            'version': '1.0',
            'tag': 'terms',
        }
        data.update(overrides)
        return data


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class TermsModelTests(TestTermsSetupMixin, TestCase):
    """Tests for the Terms model"""

    @classmethod
    def teardown_class(cls):
        super().teardown_class()

    def setUp(self):
        self.user = self.create_test_user()
        self.pdf_content = self.create_test_pdf()
        self.terms_data = self.get_basic_terms_data()

    def tearDown(self):
        """Clean up database objects"""
        Terms.objects.all().delete()
        super().tearDown()

    def test_create_terms_success(self):
        """Test creating terms with valid data"""
        terms = Terms.objects.create(**self.terms_data)
        self.assertEqual(terms.name, 'Test Terms')
        self.assertEqual(terms.author, self.user)
        self.assertEqual(terms.version, '1.0')
        self.assertEqual(terms.tag, 'terms')
        self.assertTrue(terms.pdf_content.name.endswith('.pdf'))

    def test_str_method(self):
        """Test the __str__ method returns name"""
        terms = Terms.objects.create(**self.terms_data)
        self.assertEqual(str(terms), 'Test Terms')

    def test_tag_choices(self):
        """Test all valid tag choices"""
        for tag, _ in Terms.TAG_CHOICES:
            terms_data = self.terms_data.copy()
            terms_data['tag'] = tag
            terms_data['name'] = f'Test {tag}'
            terms_data['pdf_content'] = SimpleUploadedFile(
                f"test_{tag}.pdf",
                b"%PDF-1.5\n%Test PDF content",
                content_type="application/pdf"
            )
            terms = Terms.objects.create(**terms_data)
            self.assertEqual(terms.tag, tag)

    def test_invalid_tag(self):
        """Test invalid tag raises ValidationError"""
        terms_data = self.terms_data.copy()
        terms_data['tag'] = 'invalid_tag'
        terms = Terms(**terms_data)
        with self.assertRaises(ValidationError):
            terms.full_clean()

    def test_duplicate_tag(self):
        """Test creating terms with duplicate tag raises ValidationError"""
        # Create first terms
        Terms.objects.create(**self.terms_data)

        # Try to create another with the same tag
        duplicate_terms = Terms(
            name='Duplicate Terms',
            author=self.user,
            pdf_content=SimpleUploadedFile(
                "duplicate_terms.pdf",
                b"%PDF-1.5\n%Duplicate PDF content",
                content_type="application/pdf"
            ),
            version='1.1',
            tag='terms'  # Same tag as first terms
        )

        with self.assertRaises(ValidationError):
            duplicate_terms.clean()

    def test_missing_pdf_content_file(self):
        """Test missing pdf_content file raises ValidationError"""
        terms_data = self.terms_data.copy()
        terms_data['pdf_content'] = None
        terms = Terms(**terms_data)
        with self.assertRaises(ValidationError):
            terms.clean()

    def test_invalid_pdf_extension(self):
        """Test invalid pdf_content file extension raises ValidationError"""
        terms_data = self.terms_data.copy()
        terms_data['pdf_content'] = SimpleUploadedFile(
            "test_terms.docx",
            b"This is a docx file, not PDF.",
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        terms = Terms(**terms_data)
        with self.assertRaises(ValidationError):
            terms.clean()

    def test_delete_removes_files(self):
        """Test that deleting a Terms object removes the associated PDF file"""
        with tempfile.NamedTemporaryFile(suffix='.pdf') as pdf_temp:
            pdf_temp.write(b"%PDF-1.5\n%Test PDF content")
            pdf_temp.flush()

            pdf_file = SimpleUploadedFile(
                os.path.basename(pdf_temp.name),
                pdf_temp.read(),
                content_type="application/pdf"
            )

            terms = Terms.objects.create(
                name='Temp Terms',
                author=self.user,
                pdf_content=pdf_file,
                version='1.0',
                tag='privacy'
            )

            pdf_content_path = terms.pdf_content.path

            self.assertTrue(os.path.exists(pdf_content_path))

            terms.delete()

            self.assertFalse(os.path.exists(pdf_content_path))


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class TermsSerializerTests(TestCase):
    """Tests for the TermsSerializer"""

    @classmethod
    def teardown_class(cls):
        """Remove only test-generated PDF files from MEDIA_ROOT/terms/"""
        terms_dir = os.path.join(settings.MEDIA_ROOT, 'terms')
        if os.path.isdir(terms_dir):
            for fname in os.listdir(terms_dir):
                if fname.endswith('.pdf') and fname.split('_')[0] in [
                  'test', 'create', 'duplicate', 'updated', 'extra', 'new', 'searchable', 'license', 'Temp']:
                    try:
                        os.remove(os.path.join(terms_dir, fname))
                    except Exception:
                        pass
        super().teardown_class()

    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password=TEST_PASSWORD,
            name='Test',
            surname='User',
            company='Test Company'
        )

        # Create test PDF file
        self.pdf_content = SimpleUploadedFile(
            "test_terms.pdf",
            b"%PDF-1.5\n%Test PDF content",
            content_type="application/pdf"
        )

        # Basic valid terms data
        self.terms_data = {
            'name': 'Test Terms',
            'pdf_content': self.pdf_content,
            'version': '1.0',
            'tag': 'terms'
        }

    def tearDown(self):
        """Clean up database objects"""
        Terms.objects.all().delete()
        super().tearDown()

    def test_serializer_with_valid_data(self):
        """Test serializer with valid data"""
        serializer = TermsSerializer(data=self.terms_data)
        self.assertTrue(serializer.is_valid())

    def test_serializer_with_missing_required_fields(self):
        """Test serializer with missing required fields"""
        required_fields = ['pdf_content', 'version']
        for field in required_fields:
            data = self.terms_data.copy()
            data.pop(field)
            serializer = TermsSerializer(data=data)
            self.assertFalse(serializer.is_valid())
            self.assertIn(field, serializer.errors)

    def test_serializer_read_only_fields(self):
        """Test serializer read-only fields"""
        read_only_fields = ['created_at', 'updated_at', 'author']
        data = self.terms_data.copy()
        for field in read_only_fields:
            data[field] = 'test_value'
        serializer = TermsSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        for field in read_only_fields:
            self.assertNotIn(field, serializer.validated_data)

    def test_validate_pdf_content_valid(self):
        """Test pdf_content validator with valid file"""
        serializer = TermsSerializer(data=self.terms_data)
        self.assertTrue(serializer.is_valid())

    def test_validate_pdf_content_invalid(self):
        """Test pdf_content validator with invalid file"""
        data = self.terms_data.copy()
        data['pdf_content'] = SimpleUploadedFile(
            "test_terms.docx",
            b"This is a docx file, not PDF.",
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        serializer = TermsSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('pdf_content', serializer.errors)

    def test_tag_display_field(self):
        """Test tag_display field is correctly generated"""
        terms = Terms.objects.create(
            name='Test Terms',
            author=self.user,
            pdf_content=self.pdf_content,
            version='1.0',
            tag='terms'
        )
        serializer = TermsSerializer(terms)
        self.assertEqual(serializer.data['tag_display'], 'Terms and Conditions of Use')


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class TermsViewSetTests(APITestCase):
    """Tests for the TermsViewSet"""

    @classmethod
    def teardown_class(cls):
        """Remove only test-generated PDF files from MEDIA_ROOT/terms/"""
        terms_dir = os.path.join(settings.MEDIA_ROOT, 'terms')
        if os.path.isdir(terms_dir):
            for fname in os.listdir(terms_dir):
                if fname.endswith('.pdf') and fname.split('_')[0] in [
                  'test', 'create', 'duplicate', 'updated', 'extra', 'new', 'searchable', 'license', 'Temp']:
                    try:
                        os.remove(os.path.join(terms_dir, fname))
                    except Exception:
                        pass
        super().teardown_class()

    def setUp(self):
        self.client = APIClient()

        # Create a regular user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password=TEST_PASSWORD,
            name='Test',
            surname='User',
            company='Test Company'
        )

        # Create an admin user
        self.admin = User.objects.create_user(
            username='adminuser',
            email='admin@example.com',
            password=TEST_PASSWORD,
            is_staff=True,
            is_superuser=True,
            name='Admin',
            surname='User',
            company='Admin Company'
        )

    # Create test PDF file for terms
        self.pdf_content = SimpleUploadedFile(
            "test_terms.pdf",
            b"%PDF-1.5\n%Test PDF content",
            content_type="application/pdf"
        )

        # Define terms_data for create tests
        self.terms_data = {
            'name': 'Test Terms',
            'pdf_content': SimpleUploadedFile(
                "create_terms.pdf",
                b"%PDF-1.5\n%Create PDF content",
                content_type="application/pdf"
            ),
            'version': '1.0',
            'tag': 'test-tag'
        }

        # Create a default Terms object for tests that expect data
        self.terms = Terms.objects.create(
            name='Existing Terms',
            author=self.user,
            pdf_content=self.pdf_content,
            version='1.0',
            tag='privacy'
        )

        self.list_url = reverse('terms-list')
        self.detail_url = reverse('terms-detail', kwargs={'pk': self.terms.pk})

    def tearDown(self):
        """Clean up database objects"""
        Terms.objects.all().delete()
        super().tearDown()

    def test_list_terms_unauthenticated(self):
        """Test listing terms without authentication"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # One terms object created in setUp

    def test_retrieve_terms_unauthenticated(self):
        """Test retrieving a specific terms object without authentication"""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Existing Terms')

    def test_create_terms_unauthenticated(self):
        """Test creating terms without authentication should fail"""
        response = self.client.post(self.list_url, self.terms_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_terms_authenticated_non_admin(self):
        """Test creating terms as non-admin user should fail"""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.list_url, self.terms_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_terms_admin_success(self):
        """Test creating terms as admin user should succeed"""
        self.client.force_authenticate(user=self.admin)

        # Use new PDF file since the old one was consumed
        terms_data = self.terms_data.copy()
        terms_data['pdf_content'] = SimpleUploadedFile(
            "new_terms.pdf",
            b"%PDF-1.5\n%New PDF content",
            content_type="application/pdf"
        )
        terms_data['tag'] = 'cookies'  # Different tag from existing one

        response = self.client.post(self.list_url, terms_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Test Terms')
        self.assertEqual(response.data['tag'], 'cookies')
        self.assertEqual(response.data['author'], self.admin.id)

    def test_create_terms_duplicate_tag(self):
        """Test creating terms with duplicate tag should fail"""
        self.client.force_authenticate(user=self.admin)

        # Use new PDF file since the old one was consumed
        terms_data = self.terms_data.copy()
        terms_data['pdf_content'] = SimpleUploadedFile(
            "duplicate_terms.pdf",
            b"%PDF-1.5\n%Duplicate PDF content",
            content_type="application/pdf"
        )
        terms_data['tag'] = 'privacy'  # Same tag as existing one

        response = self.client.post(self.list_url, terms_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('tag', response.data)

    def test_update_terms_unauthenticated(self):
        """Test updating terms without authentication should fail"""
        response = self.client.put(self.detail_url, {'version': '1.1'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_terms_authenticated_non_admin(self):
        """Test updating terms as non-admin user should fail"""
        self.client.force_authenticate(user=self.user)
        response = self.client.put(self.detail_url, {'version': '1.1'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_terms_admin_success(self):
        """Test updating terms as admin user should succeed"""
        self.client.force_authenticate(user=self.admin)

        # Use new PDF file since the old one was consumed
        update_data = {
            'name': 'Updated Terms',
            'pdf_content': SimpleUploadedFile(
                "updated_terms.pdf",
                b"%PDF-1.5\n%Updated PDF content",
                content_type="application/pdf"
            ),
            'version': '1.1',
            'tag': 'privacy'  # Same tag as before
        }

        response = self.client.put(self.detail_url, update_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Terms')
        self.assertEqual(response.data['version'], '1.1')

    def test_delete_terms_unauthenticated(self):
        """Test deleting terms without authentication should fail"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_terms_authenticated_non_admin(self):
        """Test deleting terms as non-admin user should fail"""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_terms_admin_success(self):
        """Test deleting terms as admin user should succeed"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Terms.objects.count(), 0)

    def test_filter_terms_by_tag(self):
        """Test filtering terms by tag"""
        # Create another terms with a different tag
        Terms.objects.create(
            name='License Terms',
            author=self.admin,
            pdf_content=SimpleUploadedFile(
                "license_terms.pdf",
                b"%PDF-1.5\n%License PDF content",
                content_type="application/pdf"
            ),
            version='1.0',
            tag='license'
        )

        # Filter by privacy tag
        response = self.client.get(f'{self.list_url}?tag=privacy')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['tag'], 'privacy')

        # Filter by license tag
        response = self.client.get(f'{self.list_url}?tag=license')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['tag'], 'license')

    def test_search_terms(self):
        """Test searching terms by name"""
        # Create another terms with a different name
        Terms.objects.create(
            name='Searchable Terms',
            author=self.admin,
            pdf_content=SimpleUploadedFile(
                "searchable_terms.pdf",
                b"%PDF-1.5\n%Searchable PDF content",
                content_type="application/pdf"
            ),
            version='1.0',
            tag='license'
        )

        # Search for 'Searchable'
        response = self.client.get(f'{self.list_url}?search=Searchable')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Searchable Terms')

        # Search for 'Existing'
        response = self.client.get(f'{self.list_url}?search=Existing')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Existing Terms')


class TermsViewSetExtraTests(APITestCase):
    @classmethod
    def teardown_class(cls):
        """Remove only test-generated PDF files from MEDIA_ROOT/terms/"""
        terms_dir = os.path.join(settings.MEDIA_ROOT, 'terms')
        if os.path.isdir(terms_dir):
            for fname in os.listdir(terms_dir):
                if fname.endswith('.pdf') and fname.split('_')[0] in [
                  'test', 'create', 'duplicate', 'updated', 'extra', 'new', 'searchable', 'license', 'Temp']:
                    try:
                        os.remove(os.path.join(terms_dir, fname))
                    except Exception:
                        pass
        super().teardown_class()

    """Extra tests for TermsViewSet custom actions and error handling"""
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.admin_password = TEST_PASSWORD or 'adminpass123'
        cls.user_password = TEST_PASSWORD or 'userpass123'

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='adminuser2',
            email='admin2@example.com',
            password=self.admin_password,
            is_staff=True,
            is_superuser=True,
            name='Admin2',
            surname='User',
            company='Admin Company'
        )
        self.user = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password=self.user_password,
            name='User2',
            surname='User',
            company='User Company'
        )
        self.terms = Terms.objects.create(
            name='Extra Terms',
            author=self.admin,
            pdf_content=SimpleUploadedFile(
                "extra_terms.pdf",
                b"%PDF-1.5\n%Extra PDF content",
                content_type="application/pdf"
            ),
            version='1.0',
            tag='extra-tag'
        )
        self.detail_url = reverse('terms-detail', kwargs={'pk': self.terms.pk})
        self.available_tags_url = reverse('terms-available-tags')
        self.download_url = reverse('terms-download', kwargs={'pk': self.terms.pk})

    def tearDown(self):
        Terms.objects.all().delete()
        User.objects.all().delete()
        super().tearDown()

    def test_available_tags_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.available_tags_url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('available_tags', response.data)

    def test_available_tags_non_admin(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.available_tags_url)
        self.assertEqual(response.status_code, 403)

    def test_download_success(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.download_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertIn('Content-Disposition', response)

    def test_download_no_file(self):
        self.client.force_authenticate(user=self.admin)
        self.terms.pdf_content.delete(save=True)
        response = self.client.get(self.download_url)
        self.assertEqual(response.status_code, 404)
        self.assertIn('detail', response.data)

    def test_download_file_missing_on_disk(self):
        self.client.force_authenticate(user=self.admin)
        # Remove file from disk but keep DB reference
        file_path = self.terms.pdf_content.path
        os.remove(file_path)
        response = self.client.get(self.download_url)
        self.assertEqual(response.status_code, 404)
        self.assertIn('detail', response.data)

    def test_download_error(self):
        self.client.force_authenticate(user=self.admin)
        with patch('terms.views.TermsViewSet.get_object', side_effect=Exception('fail')):
            response = self.client.get(self.download_url)
            self.assertEqual(response.status_code, 500)
            self.assertIn('detail', response.data)

    def test_partial_update_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(self.detail_url, {'version': '2.0'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['version'], '2.0')

    def test_partial_update_non_admin(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(self.detail_url, {'version': '2.0'}, format='json')
        self.assertEqual(response.status_code, 403)

    def test_partial_update_error(self):
        self.client.force_authenticate(user=self.admin)
        with patch('rest_framework.viewsets.ModelViewSet.partial_update', side_effect=Exception('fail')):
            with patch('terms.views.logger') as mock_logger:
                response = self.client.patch(self.detail_url, {'version': '2.0'}, format='json')
                self.assertEqual(response.status_code, 500)
                self.assertIn('detail', response.data)
                mock_logger.error.assert_called()

    def test_update_error(self):
        self.client.force_authenticate(user=self.admin)
        with patch('rest_framework.viewsets.ModelViewSet.update', side_effect=Exception('fail')):
            with patch('terms.views.logger') as mock_logger:
                response = self.client.put(self.detail_url, {'version': '2.0'}, format='json')
                self.assertEqual(response.status_code, 500)
                self.assertIn('detail', response.data)
                mock_logger.error.assert_called()

    def test_destroy_error(self):
        self.client.force_authenticate(user=self.admin)
        with patch('terms.views.TermsViewSet.get_object', side_effect=Exception('fail')):
            with patch('terms.views.logger') as mock_logger:
                response = self.client.delete(self.detail_url)
                self.assertEqual(response.status_code, 500)
                self.assertIn('detail', response.data)
                mock_logger.error.assert_called()
