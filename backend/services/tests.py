from decimal import Decimal
import json
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.test import override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status, serializers as drf_serializers
from services.models import Service
from services.serializers import ServiceSerializer
from unittest.mock import MagicMock, patch
from django.contrib import admin as django_admin
from services.admin import ServiceAdmin
from services.views import ServiceViewSet, IsAdmin
from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth.models import AnonymousUser
from django.test.client import RequestFactory
import os
from rest_framework.permissions import AllowAny
import tempfile
from io import BytesIO
from rest_framework.exceptions import NotFound
from types import SimpleNamespace

TEST_PASSWORD = os.environ.get("ORDINALY_TEST_PASSWORD") or "test-password"


User = get_user_model()

try:
    from PIL import Image
except Exception:  # pragma: no cover
    Image = None


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ServiceModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='servicemodel@example.com',
            username='servicemodel',
            password=TEST_PASSWORD,
            company='TestCompany'
        )

    def _base_service_data(self, **overrides):
        data = {
            'type': Service.SERVICE,
            'title': 'Test Service',
            'subtitle': 'Test Subtitle',
            'description': 'Test **markdown** description',
            'color': '29BF12',
            'icon': 'Bot',
            'created_by': self.user,
        }
        data.update(overrides)
        return data

    def _create_service(self, **overrides):
        return Service.objects.create(**self._base_service_data(**overrides))

    def test_delete_removes_image_file(self):
        service = self._create_service(image=get_test_image_file('model_delete.png'))
        image_name = service.image.name
        self.assertTrue(default_storage.exists(image_name))

        service.delete()
        self.assertFalse(default_storage.exists(image_name))

    def test_str_returns_title(self):
        service = self._create_service(title='Readable Service')
        self.assertEqual(str(service), 'Readable Service')

    def test_save_truncates_overlong_title(self):
        service = self._create_service(title='A' * 180)
        self.assertEqual(len(service.title), 100)
        self.assertLessEqual(len(service.slug), 100)

    def test_save_generates_unique_slug_suffix(self):
        first = self._create_service(title='Slug Collision Service')
        second = self._create_service(title='Slug Collision Service')
        self.assertEqual(first.slug, 'slug-collision-service')
        self.assertEqual(second.slug, 'slug-collision-service-1')

    def test_save_preserves_custom_slug_and_normalizes_draft_none(self):
        service = self._create_service(slug='custom-service-slug', draft=None)
        self.assertEqual(service.slug, 'custom-service-slug')
        self.assertFalse(service.draft)

    def test_save_tolerates_title_length_check_error(self):
        service = Service(**self._base_service_data(title='Safe Title'))
        original_get_field = service._meta.get_field

        def fail_only_for_title(field_name):
            if field_name == 'title':
                raise Exception('boom')
            return original_get_field(field_name)

        with patch.object(service._meta, 'get_field', side_effect=fail_only_for_title):
            service.save()

        self.assertIsNotNone(service.pk)

    def test_save_ignores_image_cleanup_storage_errors(self):
        service = self._create_service(image=get_test_image_file('cleanup_old.png'))
        service.image = None

        with patch.object(
            service._meta.get_field('image').storage,
            'exists',
            side_effect=Exception('storage failure'),
        ):
            service.save()

        self.assertTrue(Service.objects.filter(pk=service.pk).exists())

    def test_delete_ignores_storage_errors(self):
        service = self._create_service(image=get_test_image_file('delete_error.png'))
        service_pk = service.pk

        with patch.object(service.image.storage, 'exists', side_effect=Exception('storage failure')):
            service.delete()

        self.assertFalse(Service.objects.filter(pk=service_pk).exists())

    def test_clean_rejects_oversized_image(self):
        oversized_image = SimpleUploadedFile(
            'too_big.png',
            b'a' * ((1024 * 1024) + 1),
            content_type='image/png',
        )
        service = Service(**self._base_service_data(image=oversized_image))

        with self.assertRaises(ValidationError) as exc:
            service.clean()

        self.assertIn('image', exc.exception.message_dict)

    def test_clean_rejects_non_youtube_url(self):
        service = Service(**self._base_service_data(youtube_video_url='https://vimeo.com/12345'))

        with self.assertRaises(ValidationError) as exc:
            service.clean()

        self.assertIn('youtube_video_url', exc.exception.message_dict)

    def test_clean_accepts_youtube_url(self):
        service = Service(**self._base_service_data(youtube_video_url='https://youtu.be/video123'))
        service.clean()

    def test_description_and_html_helpers(self):
        service = self._create_service(
            description='# Title\n\n**bold** text',
            requisites='* one',
        )

        clean_description = service.get_clean_description()
        self.assertIn('Title', clean_description)
        self.assertIn('bold text', clean_description)
        self.assertNotIn('<', clean_description)

        self.assertIn('<strong>bold</strong>', service.get_html_description())
        self.assertIn('<li>one</li>', service.get_html_requisites())

        service.requisites = ''
        self.assertEqual(service.get_html_requisites(), '')

    def test_color_display_and_description_preview(self):
        long_description = 'x' * 150
        service = self._create_service(
            color='E4572E',
            description=long_description,
        )
        self.assertEqual(service.get_color_display(), '#E4572E')
        self.assertEqual(service.description_preview(), long_description[:100] + '...')


class ServiceSerializerTests(TestCase):
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
            'requisites': 'Test requisites with **markdown**',
            'price': '99.99',
            'is_featured': False,
            'youtube_video_url': 'https://youtu.be/testvideo'
        }

        self.service = Service.objects.create(
            **self.service_data,
            created_by=self.user
        )

        self.serializer = ServiceSerializer(instance=self.service)

    def _valid_payload(self, **overrides):
        payload = {
            'title': 'Payload Service',
            'subtitle': 'Payload subtitle',
            'description': 'Payload description',
            'color': '29BF12',
            'icon': 'Bot',
        }
        payload.update(overrides)
        return payload

    def test_serializer_method_fields_use_model_helpers(self):
        data = self.serializer.data
        self.assertEqual(data['clean_description'], self.service.get_clean_description())
        self.assertEqual(data['html_description'], self.service.get_html_description())
        self.assertEqual(data['requisites_html'], self.service.get_html_requisites())
        self.assertEqual(data['color_hex'], self.service.get_color_display())

    def test_to_internal_value_normalizes_no_copy_mapping_input(self):
        class NoCopyMapping:
            def __init__(self, source):
                self.source = source

            def keys(self):
                return self.source.keys()

            def __iter__(self):
                return iter(self.source)

            def __getitem__(self, key):
                return self.source[key]

            def __len__(self):
                return len(self.source)

        serializer = ServiceSerializer(data=NoCopyMapping(self._valid_payload(
            draft=None,
            youtube_video_url='',
            image='null',
        )))
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertFalse(serializer.validated_data['draft'])
        self.assertIsNone(serializer.validated_data['youtube_video_url'])
        self.assertIsNone(serializer.validated_data['image'])

    def test_validate_color_rejects_invalid_choice(self):
        serializer = ServiceSerializer(data=self._valid_payload(color='FFFFFF'))
        self.assertFalse(serializer.is_valid())
        self.assertIn('color', serializer.errors)

    def test_validate_color_method_rejects_invalid_value(self):
        serializer = ServiceSerializer()
        with self.assertRaises(drf_serializers.ValidationError):
            serializer.validate_color('FFFFFF')

    def test_validate_color_accepts_valid_choice(self):
        serializer = ServiceSerializer()
        self.assertEqual(serializer.validate_color('29BF12'), '29BF12')

    def test_validate_description_rejects_too_long_value(self):
        serializer = ServiceSerializer(data=self._valid_payload(description='x' * 2001))
        self.assertFalse(serializer.is_valid())
        self.assertIn('description', serializer.errors)

    def test_validate_description_accepts_boundary_length(self):
        serializer = ServiceSerializer()
        description = 'x' * 2000
        self.assertEqual(serializer.validate_description(description), description)

    def test_validate_description_method_rejects_too_long_value(self):
        serializer = ServiceSerializer()
        with self.assertRaises(drf_serializers.ValidationError):
            serializer.validate_description('x' * 2001)

    def test_validate_remove_image_sets_image_to_none(self):
        serializer = ServiceSerializer()
        validated = serializer.validate({'remove_image': True, 'image': object()})
        self.assertIsNone(validated['image'])
        self.assertNotIn('remove_image', validated)

    def test_validate_image_rejects_oversized_and_accepts_valid(self):
        serializer = ServiceSerializer()

        class DummyFile:
            def __init__(self, size):
                self.size = size

        with self.assertRaises(drf_serializers.ValidationError):
            serializer.validate_image(DummyFile((1024 * 1024) + 1))

        small_file = DummyFile(1024)
        self.assertIs(serializer.validate_image(small_file), small_file)

    def test_validate_youtube_video_url_variants(self):
        serializer = ServiceSerializer()

        self.assertIsNone(serializer.validate_youtube_video_url(None))
        self.assertIsNone(serializer.validate_youtube_video_url('   '))

        with self.assertRaises(drf_serializers.ValidationError):
            serializer.validate_youtube_video_url('https://vimeo.com/123')

        self.assertEqual(
            serializer.validate_youtube_video_url('  https://youtu.be/video123  '),
            'https://youtu.be/video123',
        )


class ServiceAdminTests(TestCase):
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

    def test_description_preview_renders_html_when_description_exists(self):
        preview = self.admin.description_preview(self.service)
        self.assertIn('<div style="', preview)
        self.assertIn('<strong>Markdown</strong>', preview)

    def test_description_preview_returns_fallback_when_description_is_empty(self):
        self.service.description = ''
        self.assertEqual(self.admin.description_preview(self.service), 'No description')

    def test_save_model_sets_created_by_on_create(self):
        request = RequestFactory().post('/admin/services/service/add/')
        request.user = self.user
        creator = User.objects.create_user(
            email='creator@example.com',
            username='creator',
            password=TEST_PASSWORD,
            company='TestCompany'
        )
        service = Service(
            title='Created in admin',
            subtitle='Subtitle',
            description='Description',
            color='29BF12',
            icon='Bot',
            created_by=creator,
        )

        self.admin.save_model(request, service, form=None, change=False)
        service.refresh_from_db()
        self.assertEqual(service.created_by, self.user)

    def test_save_model_keeps_created_by_on_change(self):
        request = RequestFactory().post('/admin/services/service/change/')
        request.user = User.objects.create_user(
            email='another@example.com',
            username='another',
            password=TEST_PASSWORD,
            company='TestCompany'
        )

        original_creator = self.service.created_by
        self.admin.save_model(request, self.service, form=None, change=True)
        self.service.refresh_from_db()
        self.assertEqual(self.service.created_by, original_creator)


class ServiceViewSetTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.raw_factory = RequestFactory()
        self.admin_user = User.objects.create_user(
            email='service-admin@example.com',
            username='serviceadmin',
            password=TEST_PASSWORD,
            is_staff=True,
            company='TestCompany'
        )
        self.user = User.objects.create_user(
            email='service-user@example.com',
            username='serviceuser',
            password=TEST_PASSWORD,
            is_staff=False,
            company='TestCompany'
        )
        self.published = Service.objects.create(
            title='Published Service',
            subtitle='Subtitle',
            description='Published description',
            color='29BF12',
            icon='Bot',
            created_by=self.admin_user,
            draft=False,
        )
        self.draft = Service.objects.create(
            title='Draft Service',
            subtitle='Subtitle',
            description='Draft description',
            color='29BF12',
            icon='Bot',
            created_by=self.admin_user,
            draft=True,
        )

    def tearDown(self):
        cleanup_service_test_images()
        super().tearDown()

    def _valid_service_payload(self, title):
        return {
            'title': title,
            'subtitle': 'Subtitle',
            'description': 'Description',
            'color': '29BF12',
            'icon': 'Bot',
        }

    def _validated_serializer(self, title):
        serializer = ServiceSerializer(data=self._valid_service_payload(title))
        self.assertTrue(serializer.is_valid(), serializer.errors)
        return serializer

    def test_is_admin_permission_true_and_false(self):
        view = ServiceViewSet()
        request = APIRequestFactory().get('/')
        request.user = self.admin_user
        self.assertTrue(IsAdmin().has_permission(request, view))
        request.user = self.user
        self.assertFalse(IsAdmin().has_permission(request, view))
        request.user = AnonymousUser()
        self.assertFalse(IsAdmin().has_permission(request, view))

    def test_get_permissions_for_public_and_admin_actions(self):
        view = ServiceViewSet()
        view.action = 'list'
        self.assertTrue(any(isinstance(p, AllowAny) for p in view.get_permissions()))

        view.action = 'retrieve'
        self.assertTrue(any(isinstance(p, AllowAny) for p in view.get_permissions()))

        view.action = 'create'
        self.assertTrue(any(isinstance(p, IsAdmin) for p in view.get_permissions()))

    def test_get_serializer_context_contains_request_format_and_view(self):
        view = ServiceViewSet()
        request = self.factory.get('/api/services/')
        view.request = request
        view.format_kwarg = 'json'
        context = view.get_serializer_context()

        self.assertEqual(context['request'], request)
        self.assertEqual(context['format'], 'json')
        self.assertEqual(context['view'], view)

    def test_get_queryset_filters_drafts_for_non_admin_and_allows_admin(self):
        view = ServiceViewSet()

        non_admin_request = self.factory.get('/api/services/')
        non_admin_request.user = self.user
        view.request = non_admin_request
        non_admin_ids = set(view.get_queryset().values_list('id', flat=True))
        self.assertIn(self.published.id, non_admin_ids)
        self.assertNotIn(self.draft.id, non_admin_ids)

        admin_request = self.factory.get('/api/services/')
        admin_request.user = self.admin_user
        view.request = admin_request
        admin_ids = set(view.get_queryset().values_list('id', flat=True))
        self.assertIn(self.published.id, admin_ids)
        self.assertIn(self.draft.id, admin_ids)

    def test_get_queryset_resolves_force_auth_and_raw_request_users(self):
        view = ServiceViewSet()

        view.request = SimpleNamespace(user=None, _force_auth_user=self.admin_user, _request=None)
        ids_force_auth = set(view.get_queryset().values_list('id', flat=True))
        self.assertIn(self.draft.id, ids_force_auth)

        raw_with_user = SimpleNamespace(user=self.admin_user, _force_auth_user=None)
        view.request = SimpleNamespace(user=None, _force_auth_user=None, _request=raw_with_user)
        ids_raw_user = set(view.get_queryset().values_list('id', flat=True))
        self.assertIn(self.draft.id, ids_raw_user)

        raw_with_force_auth = SimpleNamespace(user=None, _force_auth_user=self.admin_user)
        view.request = SimpleNamespace(user=None, _force_auth_user=None, _request=raw_with_force_auth)
        ids_raw_force_auth = set(view.get_queryset().values_list('id', flat=True))
        self.assertIn(self.draft.id, ids_raw_force_auth)

    def test_get_object_branches(self):
        view = ServiceViewSet()
        request = self.factory.get('/api/services/')
        request.user = self.admin_user
        view.request = request
        view.filter_queryset = lambda qs: qs
        view.check_object_permissions = lambda req, obj: None

        view.kwargs = {}
        with self.assertRaises(NotFound):
            view.get_object()

        view.kwargs = {'slug': self.published.slug}
        self.assertEqual(view.get_object().id, self.published.id)

        view.kwargs = {'slug': str(self.published.id)}
        self.assertEqual(view.get_object().id, self.published.id)

        view.kwargs = {'slug': '999999'}
        with self.assertRaises(NotFound):
            view.get_object()

        view.kwargs = {'slug': 'missing-service'}
        with self.assertRaises(NotFound):
            view.get_object()

    def test_perform_create_resolves_user_from_request_variants(self):
        view = ServiceViewSet()

        request = self.factory.post('/api/services/')
        request.user = self.admin_user
        view.request = request
        serializer = self._validated_serializer('Created from request.user')
        view.perform_create(serializer)
        created = Service.objects.get(title='Created from request.user')
        self.assertEqual(created.created_by, self.admin_user)

        request = self.factory.post('/api/services/')
        request.user = None
        request._force_auth_user = self.admin_user
        view.request = request
        serializer = self._validated_serializer('Created from force auth')
        view.perform_create(serializer)
        created = Service.objects.get(title='Created from force auth')
        self.assertEqual(created.created_by, self.admin_user)

        raw = SimpleNamespace(user=self.admin_user, _force_auth_user=None)
        view.request = SimpleNamespace(user=None, _force_auth_user=None, _request=raw)
        serializer = self._validated_serializer('Created from raw user')
        view.perform_create(serializer)
        created = Service.objects.get(title='Created from raw user')
        self.assertEqual(created.created_by, self.admin_user)

        raw = SimpleNamespace(user=None, _force_auth_user=self.admin_user)
        view.request = SimpleNamespace(user=None, _force_auth_user=None, _request=raw)
        serializer = self._validated_serializer('Created from raw force auth')
        view.perform_create(serializer)
        created = Service.objects.get(title='Created from raw force auth')
        self.assertEqual(created.created_by, self.admin_user)

    def test_update_returns_401_for_unauthenticated_user(self):
        request = self.factory.patch(f'/api/services/{self.published.slug}/', {'title': 'Nope'})
        request.user = AnonymousUser()

        view = ServiceViewSet()
        view.request = request
        view.kwargs = {'slug': self.published.slug}

        response = view.update(request, slug=self.published.slug)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_parses_json_body_and_forces_partial_serializer(self):
        request = self.raw_factory.put(
            f'/api/services/{self.published.slug}/',
            data=json.dumps({'title': 'Updated from JSON'}),
            content_type='application/json',
        )
        request.user = self.admin_user

        view = ServiceViewSet()
        view.request = request
        view.kwargs = {'slug': self.published.slug}
        view.get_object = lambda: self.published
        view.get_serializer = lambda instance, data, partial: ServiceSerializer(
            instance,
            data=data,
            partial=False,
        )

        response = view.update(request, slug=self.published.slug)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.published.refresh_from_db()
        self.assertEqual(self.published.title, 'Updated from JSON')

    def test_update_invalid_json_falls_back_to_req_data(self):
        request = self.raw_factory.put(
            f'/api/services/{self.published.slug}/',
            data='{"title": "Broken JSON"',
            content_type='application/json',
        )
        request.user = self.admin_user
        request.data = {'title': 'Updated from req.data'}

        view = ServiceViewSet()
        view.request = request
        view.kwargs = {'slug': self.published.slug}
        view.get_object = lambda: self.published
        view.get_serializer = lambda instance, data, partial: ServiceSerializer(instance, data=data, partial=partial)

        response = view.update(request, slug=self.published.slug)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.published.refresh_from_db()
        self.assertEqual(self.published.title, 'Updated from req.data')

    def test_update_form_post_fallback_uses_post_data(self):
        request = SimpleNamespace(
            content_type='application/x-www-form-urlencoded',
            META={'CONTENT_TYPE': 'application/x-www-form-urlencoded'},
            POST={'title': 'Updated from form'},
            user=self.admin_user,
            _force_auth_user=None,
            _request=None,
        )

        view = ServiceViewSet()
        view.request = request
        view.kwargs = {'slug': self.published.slug}
        view.get_object = lambda: self.published
        view.get_serializer = lambda instance, data, partial: ServiceSerializer(instance, data=data, partial=partial)

        response = view.update(request, slug=self.published.slug)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.published.refresh_from_db()
        self.assertEqual(self.published.title, 'Updated from form')

    def test_update_post_access_error_falls_back_to_request_data(self):
        class BrokenPostRequest:
            content_type = 'application/x-www-form-urlencoded'
            META = {'CONTENT_TYPE': 'application/x-www-form-urlencoded'}
            _force_auth_user = None
            _request = None

            @property
            def POST(self):
                raise Exception('broken post')

        req = BrokenPostRequest()
        req.user = self.admin_user
        incoming_request = SimpleNamespace(data={'title': 'Updated from request.data'})

        view = ServiceViewSet()
        view.request = req
        view.kwargs = {'slug': self.published.slug}
        view.get_object = lambda: self.published
        view.get_serializer = lambda instance, data, partial: ServiceSerializer(instance, data=data, partial=partial)

        response = view.update(incoming_request, slug=self.published.slug)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.published.refresh_from_db()
        self.assertEqual(self.published.title, 'Updated from request.data')

    def test_destroy_calls_perform_destroy_and_returns_204(self):
        request = self.factory.delete(f'/api/services/{self.published.slug}/')
        request.user = self.admin_user

        view = ServiceViewSet()
        view.request = request
        view.kwargs = {'slug': self.published.slug}
        view.get_object = lambda: self.published
        called = {'value': False}

        def perform_destroy(instance):
            called['value'] = True

        view.perform_destroy = perform_destroy
        response = view.destroy(request, slug=self.published.slug)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(called['value'])

    def test_duplicate_copies_image_and_sets_created_by_authenticated_user(self):
        source = Service.objects.create(
            title='Duplicate Source',
            subtitle='Subtitle',
            description='Description',
            color='29BF12',
            icon='Bot',
            created_by=self.admin_user,
            image=get_test_image_file('duplicate_source.png'),
        )
        request = self.factory.post(f'/api/services/{source.slug}/duplicate/')
        request.user = self.admin_user

        view = ServiceViewSet()
        view.request = request
        view.kwargs = {'slug': source.slug}
        view.get_object = lambda: source
        view.get_serializer = lambda obj: ServiceSerializer(obj)

        response = view.duplicate(request, slug=source.slug)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        duplicate = Service.objects.get(pk=response.data['id'])
        self.assertEqual(duplicate.created_by, self.admin_user)
        self.assertTrue(duplicate.title.endswith('(Copy)'))
        self.assertTrue(duplicate.draft)
        self.assertFalse(duplicate.is_featured)
        self.assertTrue(bool(duplicate.image))

    def test_duplicate_ignores_image_copy_errors_and_falls_back_creator(self):
        source = Service.objects.create(
            title='Duplicate Source Error',
            subtitle='Subtitle',
            description='Description',
            color='29BF12',
            icon='Bot',
            created_by=self.user,
            image=get_test_image_file('duplicate_source_error.png'),
        )
        request = self.factory.post(f'/api/services/{source.slug}/duplicate/')
        request.user = AnonymousUser()

        view = ServiceViewSet()
        view.request = request
        view.kwargs = {'slug': source.slug}
        view.get_object = lambda: source
        view.get_serializer = lambda obj: ServiceSerializer(obj)

        with patch.object(type(source.image), 'open', side_effect=Exception('copy failed')):
            response = view.duplicate(request, slug=source.slug)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        duplicate = Service.objects.get(pk=response.data['id'])
        self.assertEqual(duplicate.created_by, source.created_by)


def get_test_image_file(name: str = "test.png"):
    file = BytesIO()
    image = Image.new('RGB', (40, 40))
    image.save(file, 'png')
    file.seek(0)
    return SimpleUploadedFile(name, file.read(), content_type='image/png')


def cleanup_service_test_images():
    for service in Service.objects.exclude(image=''):
        image = getattr(service, 'image', None)
        if not image or not image.name:
            continue
        try:
            if image.storage.exists(image.name):
                image.storage.delete(image.name)
        except Exception:
            # File cleanup is best-effort for test isolation.
            pass
