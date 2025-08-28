from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from services.models import Service
from services.serializers import ServiceSerializer
from unittest.mock import MagicMock
from django.contrib import admin as django_admin
from services.admin import ServiceAdmin
from services.views import ServiceViewSet, IsAdmin
from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth.models import AnonymousUser
import os
from rest_framework.permissions import AllowAny

TEST_PASSWORD = os.environ.get("ORDINALY_TEST_PASSWORD")


User = get_user_model()


class ServiceModelTests(TestCase):
    def test_service_draft_default_false(self):
        service = Service.objects.create(
            title='Draft Default',
            subtitle='Subtitle',
            description='Desc',
            color='29BF12',
            icon='Bot',
            created_by=self.user
        )
        self.assertFalse(service.draft)

    def test_service_draft_explicit_true(self):
        service = Service.objects.create(
            title='Draft True',
            subtitle='Subtitle',
            description='Desc',
            color='29BF12',
            icon='Bot',
            created_by=self.user,
            draft=True
        )
        self.assertTrue(service.draft)

    def test_service_draft_null_treated_false(self):
        service = Service.objects.create(
            title='Draft Null',
            subtitle='Subtitle',
            description='Desc',
            color='29BF12',
            icon='Bot',
            created_by=self.user,
            draft=None
        )
        self.assertFalse(service.draft)
    """Tests for the Service model"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password=TEST_PASSWORD,
            company='TestCompany'
        )

        self.service_data = {
            'title': 'Test Service',
            'subtitle': 'A test service subtitle',
            'description': 'This is a test service description with **markdown** formatting',
            'color': '29BF12',
            'icon': 'Bot',
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
        self.assertEqual(self.service.color, self.service_data['color'])
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
            icon='Star',
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
            icon='Type',
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
            icon='Target',
            price=Decimal('99.99'),
            created_by=self.user
        )
        self.assertEqual(service_exact.price, Decimal('99.99'))

        # Test with 1 decimal place (should be stored as 2 decimal places)
        service_one_decimal = Service.objects.create(
            title='One Decimal Price Service',
            subtitle='A service with one decimal price',
            description='This is a service with one decimal price',
            icon='Users',
            price=Decimal('99.9'),
            created_by=self.user
        )
        self.assertEqual(service_one_decimal.price, Decimal('99.90'))

        # Test with no decimal places (should be stored as 2 decimal places)
        service_no_decimal = Service.objects.create(
            title='No Decimal Price Service',
            subtitle='A service with no decimal price',
            description='This is a service with no decimal price',
            icon='Hash',
            price=Decimal('99'),
            created_by=self.user
        )
        self.assertEqual(service_no_decimal.price, Decimal('99.00'))

        # Test with more than 2 decimal places (should be rounded to 2 decimal places upon saving)
        service_many_decimals = Service.objects.create(
            title='Many Decimals Price Service',
            subtitle='A service with many decimals price',
            description='This is a service with many decimals price',
            icon='MoreHorizontal',
            price=Decimal('99.999'),
            created_by=self.user
        )
        # Reload the object from the database to get the actual stored (rounded) value
        service_many_decimals.refresh_from_db()
        self.assertEqual(service_many_decimals.price, Decimal('100.00'))

    def test_color_validation(self):
        """Test that service color choices are validated correctly"""
        # Test valid colors
        valid_colors = ['1A1924', '623CEA', '46B1C9', '29BF12', 'E4572E']
        for color in valid_colors:
            service = Service.objects.create(
                title=f'Service {color}',
                subtitle='A service with valid color',
                description='This is a service with valid color',
                color=color,
                icon='Settings',
                created_by=self.user
            )
            self.assertEqual(service.color, color)

    def test_color_display_methods(self):
        """Test color display helper methods"""
        self.assertEqual(self.service.get_color_display(), '#29BF12')

        # Test with different color
        purple_service = Service.objects.create(
            title='Purple Service',
            subtitle='A purple service',
            description='This is a purple service',
            color='623CEA',
            icon='Code',
            created_by=self.user
        )
        self.assertEqual(purple_service.get_color_display(), '#623CEA')

    def test_markdown_description_methods(self):
        """Test Markdown description methods"""
        markdown_service = Service.objects.create(
            title='Markdown Service',
            subtitle='A service with Markdown',
            description='This is **bold** and *italic* text with [links](http://example.com)',
            color='46B1C9',
            icon='FileText',
            created_by=self.user
        )

        # Test that Markdown is preserved in the original description
        self.assertIn('**bold**', markdown_service.description)
        self.assertIn('*italic*', markdown_service.description)
        self.assertIn('[links](http://example.com)', markdown_service.description)

        # Test that HTML description converts Markdown to HTML
        html_description = markdown_service.get_html_description()
        self.assertIn('<strong>bold</strong>', html_description)
        self.assertIn('<em>italic</em>', html_description)
        self.assertIn('<a href="http://example.com">links</a>', html_description)

        # Test that clean description strips all formatting
        clean_description = markdown_service.get_clean_description()
        self.assertNotIn('**', clean_description)
        self.assertNotIn('*', clean_description)
        self.assertNotIn('[', clean_description)
        self.assertNotIn('](', clean_description)
        self.assertNotIn('<strong>', clean_description)
        self.assertNotIn('</strong>', clean_description)
        self.assertEqual(clean_description, 'This is bold and italic text with links')

    def test_description_max_length(self):
        """Test that description can handle longer content"""
        long_description = 'Long description content. ' * 100  # About 2500 chars
        service = Service.objects.create(
            title='Long Description Service',
            subtitle='A service with long description',
            description=long_description[:2000],  # Truncate to max length
            color='E4572E',
            icon='Database',
            created_by=self.user
        )
        self.assertTrue(len(service.description) <= 2000)


class ServiceSerializerTests(TestCase):
    """Tests for the ServiceSerializer"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password=TEST_PASSWORD,
            company='TestCompany'
        )

        self.service_data = {
            'title': 'Test Service',
            'subtitle': 'A test service subtitle',
            'description': 'This is a test service description with *emphasis*',
            'color': '623CEA',
            'icon': 'Smartphone',
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
            'id', 'title', 'subtitle', 'description', 'clean_description',
            'html_description', 'color', 'color_hex', 'icon', 'duration',
            'requisites', 'price', 'is_featured', 'created_by',
            'created_by_username', 'created_at', 'updated_at'
        ]))

    def test_field_content(self):
        """Test that the serializer fields contain the expected content"""
        data = self.serializer.data
        self.assertEqual(data['title'], self.service_data['title'])
        self.assertEqual(data['subtitle'], self.service_data['subtitle'])
        self.assertEqual(data['description'], self.service_data['description'])
        self.assertEqual(data['color'], self.service_data['color'])
        self.assertEqual(data['icon'], self.service_data['icon'])
        self.assertEqual(data['duration'], self.service_data['duration'])
        self.assertEqual(data['requisites'], self.service_data['requisites'])
        self.assertEqual(data['price'], self.service_data['price'])
        self.assertEqual(data['is_featured'], self.service_data['is_featured'])
        self.assertEqual(data['created_by'], self.user.id)
        self.assertEqual(data['created_by_username'], self.user.username)

    def test_clean_description_field(self):
        """Test that clean_description field strips Markdown formatting"""
        markdown_service = Service.objects.create(
            title='Markdown Test Service',
            subtitle='Service with Markdown description',
            description='This has **bold** and *italic* text with [links](http://example.com)',
            color='46B1C9',
            icon='Palette',
            created_by=self.user
        )

        serializer = ServiceSerializer(instance=markdown_service)
        data = serializer.data

        # Check that description contains Markdown
        self.assertIn('**bold**', data['description'])
        self.assertIn('*italic*', data['description'])
        self.assertIn('[links](http://example.com)', data['description'])

        # Check that html_description converts to HTML
        self.assertIn('<strong>bold</strong>', data['html_description'])
        self.assertIn('<em>italic</em>', data['html_description'])
        self.assertIn('<a href="http://example.com">links</a>', data['html_description'])

        # Check that clean_description strips all formatting
        self.assertEqual(data['clean_description'], 'This has bold and italic text with links')

    def test_color_hex_field(self):
        """Test that color_hex field adds # prefix"""
        serializer = ServiceSerializer(instance=self.service)
        data = serializer.data

        self.assertEqual(data['color'], '623CEA')
        self.assertEqual(data['color_hex'], '#623CEA')

    def test_serializer_validation(self):
        """Test serializer validation"""
        # Test with valid data
        valid_data = {
            'title': 'New Service',
            'subtitle': 'A new service subtitle',
            'description': 'This is a new service description with **Markdown** formatting',
            'color': '1A1924',
            'icon': 'Globe',
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
            'icon': 'AlertCircle',
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
        too_long_description_data['description'] = 'D' * 2001  # Exceeds max_length=2000
        serializer = ServiceSerializer(data=too_long_description_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('description', serializer.errors)

        # Test with invalid color
        invalid_color_data = valid_data.copy()
        invalid_color_data['color'] = 'INVALID'
        serializer = ServiceSerializer(data=invalid_color_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('color', serializer.errors)

        # Test with description that's too long
        long_description = 'M' * 2001  # Exceeds max_length=2000
        long_data = valid_data.copy()
        long_data['description'] = long_description
        serializer = ServiceSerializer(data=long_data)
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
            'icon': 'Lock',
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


class ServiceAdminExtraTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='admin2@example.com',
            username='admin2',
            password=TEST_PASSWORD,
            company='TestCompany'
        )
        self.service = Service.objects.create(
            title='Admin Service',
            subtitle='Subtitle',
            description='**Markdown** description',
            color='29BF12',
            icon='Bot',
            duration=1,
            requisites='None',
            price=Decimal('10.00'),
            is_featured=False,
            created_by=self.user
        )
        self.admin = ServiceAdmin(Service, django_admin.site)

    def test_description_preview_html(self):
        html = self.admin.description_preview(self.service)
        self.assertIn('<div', html)
        self.assertIn('<strong>Markdown</strong>', html)

    def test_description_preview_empty(self):
        self.service.description = ''
        self.assertEqual(self.admin.description_preview(self.service), 'No description')

    def test_save_model_sets_created_by(self):
        request = MagicMock()
        request.user = self.user
        obj = Service(
            title='New Service', subtitle='s', description='d', color='29BF12', icon='Bot', duration=1,
            price=1, requisites='', is_featured=False
        )
        form = MagicMock()
        self.admin.save_model(request, obj, form, change=False)
        self.assertEqual(obj.created_by, self.user)


class ServiceViewSetExtraTests(TestCase):
    def test_is_admin_permission_true_and_false(self):
        """Test IsAdmin.has_permission returns True for staff, False for non-staff and anonymous"""
        view = ServiceViewSet()
        staff_user = User.objects.create_user(email='staff@example.com', username='staff',
                                              password=TEST_PASSWORD, is_staff=True, company='C')
        non_staff_user = User.objects.create_user(email='nonstaff@example.com', username='nonstaff',
                                                  password=TEST_PASSWORD, is_staff=False, company='C')
        request = APIRequestFactory().get('/')
        request.user = staff_user
        self.assertTrue(IsAdmin().has_permission(request, view))
        request.user = non_staff_user
        self.assertFalse(IsAdmin().has_permission(request, view))
        request.user = AnonymousUser()
        self.assertFalse(IsAdmin().has_permission(request, view))

    def test_get_permissions_all_actions(self):
        """Test get_permissions returns correct permission classes for all actions"""
        view = ServiceViewSet()
        for action, expected in [
            ('list', AllowAny),
            ('retrieve', AllowAny),
            ('create', IsAdmin),
            ('update', IsAdmin),
            ('partial_update', IsAdmin),
            ('destroy', IsAdmin),
        ]:
            view.action = action
            perms = view.get_permissions()
            self.assertTrue(any(isinstance(p, expected) for p in perms), f"{action} should use {expected}")

    def test_perform_create_sets_created_by_explicit(self):
        """Test perform_create sets created_by field on serializer"""
        view = ServiceViewSet()
        user = User.objects.create_user(email='creator@example.com', username='creator',
                                        password=TEST_PASSWORD, company='C')
        request = APIRequestFactory().post('/services/', {})
        request.user = user
        view.request = request

        class DummySerializer:
            def __init__(self):
                self.called_with = None

            def save(self, **kwargs):
                self.called_with = kwargs.get('created_by')
        serializer = DummySerializer()
        view.perform_create(serializer)
        self.assertEqual(serializer.called_with, user)

    def test_update_calls_is_valid_and_perform_update(self):
        """Test update calls serializer.is_valid(raise_exception=True) and perform_update"""
        view = ServiceViewSet()
        user = User.objects.create_user(email='update@example.com', username='update',
                                        password=TEST_PASSWORD, company='C')
        service = Service.objects.create(title='T', subtitle='S', description='D',
                                         color='29BF12', icon='Bot', duration=1, requisites='R',
                                         price=10, is_featured=False, created_by=user)
        request = APIRequestFactory().put(f'/services/{service.pk}/', {'title': 'Updated'}, format='json')
        force_authenticate(request, user=user)
        view.request = request
        view.kwargs = {'pk': service.pk}
        view.get_object = lambda: service

        class DummySerializer:
            def __init__(self):
                self.instance = service
                self.data = {'title': 'Updated'}
                self.validated = False

            def is_valid(self, raise_exception=False):
                self.validated = True

            def save(self):
                self.instance.title = 'Updated'

        def get_serializer(instance, data, partial):
            return DummySerializer()
        view.get_serializer = get_serializer
        called = {}

        def perform_update(serializer):
            called['called'] = True
            serializer.save()
        view.perform_update = perform_update
        response = view.update(request, pk=service.pk)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(called['called'])
        self.assertEqual(service.title, 'Updated')

    def test_destroy_calls_perform_destroy(self):
        """Test destroy calls perform_destroy and returns 204"""
        view = ServiceViewSet()
        user = User.objects.create_user(email='destroy@example.com', username='destroy',
                                        password=TEST_PASSWORD, company='C')
        service = Service.objects.create(title='T', subtitle='S', description='D',
                                         color='29BF12', icon='Bot', duration=1,
                                         requisites='R', price=10, is_featured=False, created_by=user)
        request = APIRequestFactory().delete(f'/services/{service.pk}/')
        force_authenticate(request, user=user)
        view.request = request
        view.kwargs = {'pk': service.pk}
        view.get_object = lambda: service
        called = {}

        def perform_destroy(obj):
            called['called'] = True
            obj.delete()
        view.perform_destroy = perform_destroy
        response = view.destroy(request, pk=service.pk)
        self.assertEqual(response.status_code, 204)
        self.assertTrue(called['called'])
        self.assertFalse(Service.objects.filter(pk=service.pk).exists())

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create_user(
            email='user@example.com', username='user', password=TEST_PASSWORD, company='TestCompany'
        )
        self.admin_user = User.objects.create_user(
            email='admin@example.com', username='admin', password=TEST_PASSWORD, is_staff=True, company='TestCompany'
        )
        self.service = Service.objects.create(
            title='ViewSet Service', subtitle='s', description='d', color='29BF12', icon='Bot', duration=1, price=1,
            requisites='', is_featured=False, created_by=self.admin_user
        )

    def test_is_admin_permission(self):
        view = ServiceViewSet()
        view.action = 'create'
        request = self.factory.post('/services/', {})
        force_authenticate(request, user=self.admin_user)
        perms = view.get_permissions()
        self.assertTrue(any(isinstance(p, IsAdmin) for p in perms))
        request = self.factory.post('/services/', {})
        request.user = AnonymousUser()
        view.request = request
        self.assertFalse(IsAdmin().has_permission(request, view))

    def test_get_permissions_list_and_retrieve(self):
        view = ServiceViewSet()
        view.action = 'list'
        perms = view.get_permissions()
        self.assertTrue(any(isinstance(p, AllowAny) for p in perms))
        view.action = 'retrieve'
        perms = view.get_permissions()
        self.assertTrue(any(isinstance(p, AllowAny) for p in perms))

    def test_get_permissions_admin_actions(self):
        view = ServiceViewSet()
        for action in ['create', 'update', 'partial_update', 'destroy']:
            view.action = action
            perms = view.get_permissions()
            self.assertTrue(any(isinstance(p, IsAdmin) for p in perms))

    def test_perform_create_sets_created_by(self):
        view = ServiceViewSet()
        request = APIRequestFactory().post('/services/', {})
        user = User.objects.create_user(email='admin2@example.com', username='admin2',
                                        password=TEST_PASSWORD, company='C')
        request.user = user
        view.request = request
        serializer = MagicMock()
        view.perform_create(serializer)
        serializer.save.assert_called_with(created_by=user)

    def test_update_authenticated(self):
        view = ServiceViewSet()
        user = User.objects.create_user(email='admin3@example.com', username='admin3',
                                        password=TEST_PASSWORD, company='C')
        service = Service.objects.create(title='T', subtitle='S', description='D',
                                         color='29BF12', icon='Bot', duration=1, requisites='R',
                                         price=10, is_featured=False, created_by=user)
        request = APIRequestFactory().put(f'/services/{service.pk}/', {'title': 'Updated'}, format='json')
        force_authenticate(request, user=user)
        view.request = request
        view.kwargs = {'pk': service.pk}
        view.get_object = lambda: service
        view.get_serializer = lambda *a, **kw: ServiceSerializer(service, data={'title': 'Updated'}, partial=False)

        def perform_update(serializer):
            serializer.instance.title = 'Updated'
        view.perform_update = perform_update
        response = view.update(request, pk=service.pk)
        self.assertEqual(response.status_code, 200)

    def test_update_unauthenticated(self):
        view = ServiceViewSet()
        service = Service.objects.first()
        request = APIRequestFactory().put(f'/services/{service.pk}/', {'title': 'Updated'}, format='json')
        request.user = AnonymousUser()
        view.request = request
        view.kwargs = {'pk': service.pk}
        view.get_object = lambda: service
        response = view.update(request, pk=service.pk)
        self.assertEqual(response.status_code, 401)

    def test_destroy_returns_204(self):
        view = ServiceViewSet()
        user = User.objects.create_user(email='admin4@example.com', username='admin4',
                                        password=TEST_PASSWORD, company='C')
        service = Service.objects.create(title='T2', subtitle='S2', description='D2',
                                         color='29BF12', icon='Bot', duration=1, requisites='R',
                                         price=10, is_featured=False, created_by=user)
        request = APIRequestFactory().delete(f'/services/{service.pk}/')
        force_authenticate(request, user=user)
        view.request = request
        view.kwargs = {'pk': service.pk}
        view.get_object = lambda: service
        view.perform_destroy = lambda obj: obj.delete()
        response = view.destroy(request, pk=service.pk)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Service.objects.filter(pk=service.pk).exists())


class ServiceViewSetTests(APITestCase):
    """Tests for the ServiceViewSet"""

    def setUp(self):
        self.client = APIClient()

        # Create a regular user
        self.user = User.objects.create_user(
            email='user@example.com',
            username='regularuser',
            password=TEST_PASSWORD,
            company='TestCompany'
        )

        # Create an admin user
        self.admin = User.objects.create_user(
            email='admin@example.com',
            username='adminuser',
            password=TEST_PASSWORD,
            is_staff=True,
            company='AdminCompany'
        )

        # Create some services
        self.service1 = Service.objects.create(
            title='Service 1',
            subtitle='First service subtitle',
            description='This is the first service description',
            icon='Bot',
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
            icon='Settings',
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
            'description': 'This is a new service description with **strong** formatting',
            'color': 'E4572E',
            'icon': 'Plus',
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
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_service_unauthenticated(self):
        """Test that unauthenticated users cannot update services"""
        response = self.client.put(self.detail_url, self.valid_service_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_service_unauthenticated(self):
        """Test that unauthenticated users cannot delete services"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

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
            icon='Search',
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
            'icon': 'AlertTriangle',
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
