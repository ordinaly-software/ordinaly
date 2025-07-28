from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from services.models import Service
from services.serializers import ServiceSerializer

User = get_user_model()


class ServiceModelTests(TestCase):
    """Tests for the Service model"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpassword123',
            company='TestCompany'
        )

        self.service_data = {
            'title': 'Test Service',
            'subtitle': 'A test service subtitle',
            'description': 'This is a test service description',
            'icon': 'test-icon',
            'duration': 2,
            'requisites': 'Test requisites',
            'price': Decimal('99.99'),
            'is_featured': False,
            'created_by': self.user
        }

        self.service = Service.objects.create(**self.service_data)

    def test_service_creation(self):
        """Test that a service can be created with valid data"""
        self.assertEqual(self.service.title, self.service_data['title'])
        self.assertEqual(self.service.subtitle, self.service_data['subtitle'])
        self.assertEqual(self.service.description, self.service_data['description'])
        self.assertEqual(self.service.icon, self.service_data['icon'])
        self.assertEqual(self.service.duration, self.service_data['duration'])
        self.assertEqual(self.service.requisites, self.service_data['requisites'])
        self.assertEqual(self.service.price, self.service_data['price'])
        self.assertEqual(self.service.is_featured, self.service_data['is_featured'])
        self.assertEqual(self.service.created_by, self.service_data['created_by'])

    def test_service_str_method(self):
        """Test the string representation of a service"""
        self.assertEqual(str(self.service), self.service_data['title'])

    def test_service_ordering(self):
        """Test that services are ordered by is_featured (desc) and title"""
        featured_service = Service.objects.create(
            title='Featured Service',
            subtitle='A featured service',
            description='This is a featured service',
            icon='featured-icon',
            price=Decimal('149.99'),
            is_featured=True,
            created_by=self.user
        )

        services = list(Service.objects.all())
        self.assertEqual(services[0], featured_service)
        self.assertEqual(services[1], self.service)

        # Test with same featured status but different titles
        service_a = Service.objects.create(
            title='A Service',
            subtitle='A service with A title',
            description='This is a service with A title',
            icon='a-icon',
            price=Decimal('49.99'),
            is_featured=False,
            created_by=self.user
        )

        services = list(Service.objects.filter(is_featured=False).order_by('title'))
        self.assertEqual(services[0], service_a)  # 'A Service' should come before 'Test Service'

    def test_price_decimal_places(self):
        """Test that price handles decimal places correctly"""
        # Test with exactly 2 decimal places
        service_exact = Service.objects.create(
            title='Exact Price Service',
            subtitle='A service with exact price',
            description='This is a service with exact price',
            icon='exact-icon',
            price=Decimal('99.99'),
            created_by=self.user
        )
        self.assertEqual(service_exact.price, Decimal('99.99'))

        # Test with 1 decimal place (should be stored as 2 decimal places)
        service_one_decimal = Service.objects.create(
            title='One Decimal Price Service',
            subtitle='A service with one decimal price',
            description='This is a service with one decimal price',
            icon='one-decimal-icon',
            price=Decimal('99.9'),
            created_by=self.user
        )
        self.assertEqual(service_one_decimal.price, Decimal('99.90'))

        # Test with no decimal places (should be stored as 2 decimal places)
        service_no_decimal = Service.objects.create(
            title='No Decimal Price Service',
            subtitle='A service with no decimal price',
            description='This is a service with no decimal price',
            icon='no-decimal-icon',
            price=Decimal('99'),
            created_by=self.user
        )
        self.assertEqual(service_no_decimal.price, Decimal('99.00'))

        # Test with more than 2 decimal places (should be rounded to 2 decimal places upon saving)
        service_many_decimals = Service.objects.create(
            title='Many Decimals Price Service',
            subtitle='A service with many decimals price',
            description='This is a service with many decimals price',
            icon='many-decimals-icon',
            price=Decimal('99.999'),
            created_by=self.user
        )
        # Reload the object from the database to get the actual stored (rounded) value
        service_many_decimals.refresh_from_db()
        self.assertEqual(service_many_decimals.price, Decimal('100.00'))


class ServiceSerializerTests(TestCase):
    """Tests for the ServiceSerializer"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpassword123',
            company='TestCompany'
        )

        self.service_data = {
            'title': 'Test Service',
            'subtitle': 'A test service subtitle',
            'description': 'This is a test service description',
            'icon': 'test-icon',
            'duration': 2,
            'requisites': 'Test requisites',
            'price': '99.99',
            'is_featured': False
        }

        self.service = Service.objects.create(
            **self.service_data,
            created_by=self.user
        )

        self.serializer = ServiceSerializer(instance=self.service)

    def test_contains_expected_fields(self):
        """Test that the serializer contains the expected fields"""
        data = self.serializer.data
        self.assertEqual(set(data.keys()), set([
            'id', 'title', 'subtitle', 'description', 'icon',
            'duration', 'requisites', 'price', 'is_featured',
            'created_by', 'created_by_username', 'created_at', 'updated_at'
        ]))

    def test_field_content(self):
        """Test that the serializer fields contain the expected content"""
        data = self.serializer.data
        self.assertEqual(data['title'], self.service_data['title'])
        self.assertEqual(data['subtitle'], self.service_data['subtitle'])
        self.assertEqual(data['description'], self.service_data['description'])
        self.assertEqual(data['icon'], self.service_data['icon'])
        self.assertEqual(data['duration'], self.service_data['duration'])
        self.assertEqual(data['requisites'], self.service_data['requisites'])
        self.assertEqual(data['price'], self.service_data['price'])
        self.assertEqual(data['is_featured'], self.service_data['is_featured'])
        self.assertEqual(data['created_by'], self.user.id)
        self.assertEqual(data['created_by_username'], self.user.username)

    def test_serializer_validation(self):
        """Test serializer validation"""
        # Test with valid data
        valid_data = {
            'title': 'New Service',
            'subtitle': 'A new service subtitle',
            'description': 'This is a new service description',
            'icon': 'new-icon',
            'duration': 3,
            'requisites': 'New requisites',
            'price': '149.99',
            'is_featured': True
        }
        serializer = ServiceSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())

        # Test with missing required fields
        invalid_data = {
            'subtitle': 'Missing title',
            'description': 'This service is missing a title',
            'icon': 'missing-title-icon',
            'price': '49.99'
        }
        serializer = ServiceSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)

        # Test with invalid price format
        invalid_price_data = valid_data.copy()
        invalid_price_data['price'] = 'not-a-price'
        serializer = ServiceSerializer(data=invalid_price_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('price', serializer.errors)

        # Test with negative price
        negative_price_data = valid_data.copy()
        negative_price_data['price'] = '-10.00'
        serializer = ServiceSerializer(data=negative_price_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('price', serializer.errors)

        # Test with zero price
        zero_price_data = valid_data.copy()
        zero_price_data['price'] = '0.00'
        serializer = ServiceSerializer(data=zero_price_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('price', serializer.errors)

        # Test with negative duration
        negative_duration_data = valid_data.copy()
        negative_duration_data['duration'] = -1
        serializer = ServiceSerializer(data=negative_duration_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('duration', serializer.errors)

        # Test with zero duration
        zero_duration_data = valid_data.copy()
        zero_duration_data['duration'] = 0
        serializer = ServiceSerializer(data=zero_duration_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('duration', serializer.errors)

        # Test with too long fields
        too_long_title_data = valid_data.copy()
        too_long_title_data['title'] = 'T' * 101  # Exceeds max_length=100
        serializer = ServiceSerializer(data=too_long_title_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)

        too_long_subtitle_data = valid_data.copy()
        too_long_subtitle_data['subtitle'] = 'S' * 201  # Exceeds max_length=200
        serializer = ServiceSerializer(data=too_long_subtitle_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('subtitle', serializer.errors)

        too_long_description_data = valid_data.copy()
        too_long_description_data['description'] = 'D' * 501  # Exceeds max_length=500
        serializer = ServiceSerializer(data=too_long_description_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('description', serializer.errors)

        too_long_icon_data = valid_data.copy()
        too_long_icon_data['icon'] = 'i' * 51  # Exceeds max_length=50
        serializer = ServiceSerializer(data=too_long_icon_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('icon', serializer.errors)

        too_long_requisites_data = valid_data.copy()
        too_long_requisites_data['requisites'] = 'R' * 501  # Exceeds max_length=500
        serializer = ServiceSerializer(data=too_long_requisites_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('requisites', serializer.errors)

    def test_read_only_fields(self):
        """Test that read-only fields cannot be set"""
        data = {
            'title': 'Read Only Test Service',
            'subtitle': 'A service to test read-only fields',
            'description': 'This is a service to test read-only fields',
            'icon': 'read-only-icon',
            'price': '199.99',
            'created_by': 999,  # This should be ignored as it's read-only
            'created_at': '2023-01-01T00:00:00Z',  # This should be ignored as it's read-only
            'updated_at': '2023-01-01T00:00:00Z'   # This should be ignored as it's read-only
        }

        serializer = ServiceSerializer(data=data)
        self.assertTrue(serializer.is_valid())

        # Save the serializer with a user
        service = serializer.save(created_by=self.user)

        # Check that the read-only fields were not set from the input data
        self.assertEqual(service.created_by, self.user)  # Should be set from the save method
        self.assertNotEqual(service.created_at.isoformat(), '2023-01-01T00:00:00+00:00')  # Should be auto-set
        self.assertNotEqual(service.updated_at.isoformat(), '2023-01-01T00:00:00+00:00')  # Should be auto-set


class ServiceViewSetTests(APITestCase):
    """Tests for the ServiceViewSet"""

    def setUp(self):
        self.client = APIClient()

        # Create a regular user
        self.user = User.objects.create_user(
            email='user@example.com',
            username='regularuser',
            password='userpassword123',
            company='TestCompany'
        )

        # Create an admin user
        self.admin = User.objects.create_user(
            email='admin@example.com',
            username='adminuser',
            password='adminpassword123',
            is_staff=True,
            company='AdminCompany'
        )

        # Create some services
        self.service1 = Service.objects.create(
            title='Service 1',
            subtitle='First service subtitle',
            description='This is the first service description',
            icon='service1-icon',
            duration=1,
            requisites='Service 1 requisites',
            price=Decimal('49.99'),
            is_featured=True,
            created_by=self.admin
        )

        self.service2 = Service.objects.create(
            title='Service 2',
            subtitle='Second service subtitle',
            description='This is the second service description',
            icon='service2-icon',
            duration=2,
            requisites='Service 2 requisites',
            price=Decimal('99.99'),
            is_featured=False,
            created_by=self.admin
        )

        # Define URLs
        self.list_url = reverse('service-list')
        self.detail_url = reverse('service-detail', kwargs={'pk': self.service1.pk})

        # Define valid service data for creation/update tests
        self.valid_service_data = {
            'title': 'New Service',
            'subtitle': 'New service subtitle',
            'description': 'This is a new service description',
            'icon': 'new-service-icon',
            'duration': 3,
            'requisites': 'New service requisites',
            'price': '149.99',
            'is_featured': False
        }

    def test_list_services_unauthenticated(self):
        """Test that unauthenticated users can list services"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Should return both services

    def test_retrieve_service_unauthenticated(self):
        """Test that unauthenticated users can retrieve a service"""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.service1.title)

    def test_create_service_unauthenticated(self):
        """Test that unauthenticated users cannot create services"""
        response = self.client.post(self.list_url, self.valid_service_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_service_unauthenticated(self):
        """Test that unauthenticated users cannot update services"""
        response = self.client.put(self.detail_url, self.valid_service_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_service_unauthenticated(self):
        """Test that unauthenticated users cannot delete services"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Verify the service still exists
        self.assertTrue(Service.objects.filter(pk=self.service1.pk).exists())

    def test_delete_service_authenticated_non_admin(self):
        """Test that authenticated non-admin users cannot delete services"""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Verify the service still exists
        self.assertTrue(Service.objects.filter(pk=self.service1.pk).exists())

    def test_delete_service_admin(self):
        """Test that admin users can delete services"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify the service was actually deleted
        self.assertFalse(Service.objects.filter(pk=self.service1.pk).exists())

    def test_search_services(self):
        """Test searching services"""
        # Create a service with a specific term to search for
        Service.objects.create(
            title='Searchable Service',
            subtitle='This service is searchable',
            description='This service contains the term FINDME',
            icon='search-icon',
            price=Decimal('59.99'),
            created_by=self.admin
        )

        # Search for the term
        response = self.client.get(f'{self.list_url}?search=FINDME')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Should only find one service
        self.assertEqual(response.data[0]['description'], 'This service contains the term FINDME')

        # Search for a term that should match multiple services
        response = self.client.get(f'{self.list_url}?search=service')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 1)  # Should find multiple services

        # Search for a term that shouldn't match any services
        response = self.client.get(f'{self.list_url}?search=nonexistentterm')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)  # Should find no services

    def test_ordering_services(self):
        """Test ordering services"""
        # Order by title ascending
        response = self.client.get(f'{self.list_url}?ordering=title')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['title'], 'Service 1')  # Should be first alphabetically

        # Order by title descending
        response = self.client.get(f'{self.list_url}?ordering=-title')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['title'], 'Service 2')  # Should be last alphabetically

        # Order by price ascending
        response = self.client.get(f'{self.list_url}?ordering=price')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['price'], '49.99')  # Should be lowest price

        # Order by price descending
        response = self.client.get(f'{self.list_url}?ordering=-price')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['price'], '99.99')  # Should be highest price

        # Order by duration ascending
        response = self.client.get(f'{self.list_url}?ordering=duration')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['duration'], 1)  # Should be shortest duration

        # Order by duration descending
        response = self.client.get(f'{self.list_url}?ordering=-duration')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['duration'], 2)  # Should be longest duration

        # Order by created_at ascending
        response = self.client.get(f'{self.list_url}?ordering=created_at')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # First service created should be first

        # Order by created_at descending
        response = self.client.get(f'{self.list_url}?ordering=-created_at')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Last service created should be first

    def test_invalid_service_data(self):
        """Test creating a service with invalid data"""
        self.client.force_authenticate(user=self.admin)

        # Test with missing required fields
        invalid_data = {
            'subtitle': 'Missing title',
            'description': 'This service is missing a title',
            'icon': 'missing-title-icon',
            'price': '49.99'
        }
        response = self.client.post(self.list_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

        # Test with invalid price
        invalid_price_data = self.valid_service_data.copy()
        invalid_price_data['price'] = 'not-a-price'
        response = self.client.post(self.list_url, invalid_price_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('price', response.data)

        # Test with negative price
        negative_price_data = self.valid_service_data.copy()
        negative_price_data['price'] = '-10.00'
        response = self.client.post(self.list_url, negative_price_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('price', response.data)

        # Test with too long fields
        too_long_title_data = self.valid_service_data.copy()
        too_long_title_data['title'] = 'T' * 101  # Exceeds max_length=100
        response = self.client.post(self.list_url, too_long_title_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    def test_nonexistent_service(self):
        """Test accessing a nonexistent service"""
        nonexistent_url = reverse('service-detail', kwargs={'pk': 9999})
        response = self.client.get(nonexistent_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
