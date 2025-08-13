from django.test import TestCase
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import CustomUser
from .authentication import EmailOrUsernameModelBackend
import os


TEST_PASSWORD = os.environ.get("ORDINALY_TEST_PASSWORD")


class EmailOrUsernameAuthBackendTests(TestCase):
    """Tests for the EmailOrUsernameModelBackend"""

    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'password': TEST_PASSWORD,
            'name': 'Test',
            'surname': 'User',
            'company': 'Test Company'
        }
        self.user = CustomUser.objects.create_user(**self.user_data)
        self.backend = EmailOrUsernameModelBackend()

    def test_authenticate_with_email_success(self):
        """Test authentication with email"""
        user = self.backend.authenticate(
            None,
            username='test@example.com',
            password=TEST_PASSWORD
        )
        self.assertEqual(user, self.user)

    def test_authenticate_with_username_success(self):
        """Test authentication with username"""
        user = self.backend.authenticate(
            None,
            username='testuser',
            password=TEST_PASSWORD
        )
        self.assertEqual(user, self.user)

    def test_authenticate_with_email_case_insensitive(self):
        """Test authentication with email is case insensitive"""
        user = self.backend.authenticate(
            None,
            username='TEST@EXAMPLE.COM',
            password=TEST_PASSWORD
        )
        self.assertEqual(user, self.user)

    def test_authenticate_with_username_case_insensitive(self):
        """Test authentication with username is case insensitive"""
        user = self.backend.authenticate(
            None,
            username='TESTUSER',
            password=TEST_PASSWORD
        )
        self.assertEqual(user, self.user)

    def test_authenticate_wrong_password(self):
        """Test authentication with wrong password"""
        user = self.backend.authenticate(
            None,
            username='test@example.com',
            password=TEST_PASSWORD+"abcd"
        )
        self.assertIsNone(user)

    def test_authenticate_nonexistent_user(self):
        """Test authentication with nonexistent user"""
        user = self.backend.authenticate(
            None,
            username='nonexistent@example.com',
            password=TEST_PASSWORD
        )
        self.assertIsNone(user)

    def test_authenticate_no_username(self):
        """Test authentication without username"""
        user = self.backend.authenticate(
            None,
            username=None,
            password=TEST_PASSWORD
        )
        self.assertIsNone(user)

    def test_authenticate_no_password(self):
        """Test authentication without password"""
        user = self.backend.authenticate(
            None,
            username='test@example.com',
            password=None
        )
        self.assertIsNone(user)

    def test_get_user_success(self):
        """Test get_user method with valid user ID"""
        retrieved_user = self.backend.get_user(self.user.id)
        self.assertEqual(retrieved_user, self.user)

    def test_get_user_nonexistent(self):
        """Test get_user method with nonexistent user ID"""
        retrieved_user = self.backend.get_user(99999)
        self.assertIsNone(retrieved_user)


class CustomUserModelTests(TestCase):
    """Tests for the CustomUser model"""

    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'password': TEST_PASSWORD,
            'name': 'Test',
            'surname': 'User',
            'company': 'Test Company'
        }

    def test_create_user_success(self):
        """Test creating a user with valid data"""
        user = CustomUser.objects.create_user(**self.user_data)
        self.assertEqual(user.email, self.user_data['email'])
        self.assertEqual(user.username, self.user_data['username'])
        self.assertEqual(user.name, self.user_data['name'])
        self.assertEqual(user.surname, self.user_data['surname'])
        self.assertEqual(user.company, self.user_data['company'])
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.check_password(self.user_data['password']))

    def test_create_user_no_email(self):
        """Test creating a user without email should raise ValueError"""
        user_data = self.user_data.copy()
        user_data.pop('email')
        with self.assertRaises(TypeError):
            CustomUser.objects.create_user(**user_data)

    def test_create_superuser_success(self):
        """Test creating a superuser with valid data"""
        user = CustomUser.objects.create_superuser(**self.user_data)
        self.assertEqual(user.email, self.user_data['email'])
        self.assertEqual(user.username, self.user_data['username'])
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.check_password(self.user_data['password']))

    def test_username_validator_too_short(self):
        """Test username validator with too short username"""
        user = CustomUser(email='test@example.com', username='ab', password=TEST_PASSWORD,
                          name='Test', surname='User', company='Test Company')
        with self.assertRaises(ValidationError):
            user.full_clean()

    def test_username_validator_too_long(self):
        """Test username validator with too long username"""
        long_username = 'a' * 31
        user = CustomUser(email='test@example.com', username=long_username, password=TEST_PASSWORD,
                          name='Test', surname='User', company='Test Company')
        with self.assertRaises(ValidationError):
            user.full_clean()

    def test_username_validator_invalid_chars(self):
        """Test username validator with invalid characters"""
        user = CustomUser(email='test@example.com', username='test-user', password=TEST_PASSWORD,
                          name='Test', surname='User', company='Test Company')
        with self.assertRaises(ValidationError):
            user.full_clean()

    def test_username_validator_valid(self):
        """Test username validator with valid username"""
        user = CustomUser(email='test@example.com', username='test_user123', password=TEST_PASSWORD,
                          name='Test', surname='User', company='Test Company')
        try:
            user.full_clean()
        except ValidationError:
            self.fail("Username validator raised ValidationError unexpectedly!")

    def test_clean_method_xss_protection(self):
        """Test clean method protects against XSS in username"""
        user = CustomUser(email='test@example.com', username='test<script>alert(1)</script>',
                          password=TEST_PASSWORD, name='Test', surname='User', company='Test Company')
        with self.assertRaises(ValidationError):
            user.clean()

    def test_str_method(self):
        """Test the __str__ method returns email"""
        user = CustomUser.objects.create_user(**self.user_data)
        self.assertEqual(str(user), self.user_data['email'])

    def test_email_unique(self):
        """Test that email must be unique"""
        CustomUser.objects.create_user(**self.user_data)
        duplicate_user = self.user_data.copy()
        duplicate_user['username'] = 'another_user'
        with self.assertRaises(Exception):
            CustomUser.objects.create_user(**duplicate_user)

    def test_username_unique(self):
        """Test that username must be unique"""
        CustomUser.objects.create_user(**self.user_data)
        duplicate_user = self.user_data.copy()
        duplicate_user['email'] = 'another@example.com'
        with self.assertRaises(Exception):
            CustomUser.objects.create_user(**duplicate_user)

    def test_optional_fields(self):
        """Test that region and city are optional"""
        user_data = self.user_data.copy()
        user_data['region'] = 'Test Region'
        user_data['city'] = 'Test City'
        user = CustomUser.objects.create_user(**user_data)
        self.assertEqual(user.region, 'Test Region')
        self.assertEqual(user.city, 'Test City')


class CustomUserSerializerTests(TestCase):
    """Tests for the CustomUserSerializer"""

    def setUp(self):
        from .serializers import CustomUserSerializer
        self.serializer_class = CustomUserSerializer
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': TEST_PASSWORD,
            'name': 'Test',
            'surname': 'User',
            'company': 'Test Company'
        }

    def test_serializer_with_valid_data(self):
        """Test serializer with valid data"""
        serializer = self.serializer_class(data=self.user_data)
        self.assertTrue(serializer.is_valid())

    def test_serializer_with_missing_required_field(self):
        """Test serializer with missing required field"""
        for field in ['username', 'email', 'password', 'name', 'surname', 'company']:
            data = self.user_data.copy()
            data.pop(field)
            serializer = self.serializer_class(data=data)
            self.assertFalse(serializer.is_valid())
            self.assertIn(field, serializer.errors)

    def test_serializer_with_optional_fields(self):
        """Test serializer with optional fields"""
        data = self.user_data.copy()
        data['region'] = 'Test Region'
        data['city'] = 'Test City'
        serializer = self.serializer_class(data=data)
        self.assertTrue(serializer.is_valid())

    def test_serializer_create_method(self):
        """Test serializer create method"""
        serializer = self.serializer_class(data=self.user_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.email, self.user_data['email'])
        self.assertEqual(user.username, self.user_data['username'])
        self.assertTrue(user.check_password(self.user_data['password']))

    def test_serializer_update_method(self):
        """Test serializer update method"""
        user = CustomUser.objects.create_user(**self.user_data)
        update_data = {
            'name': 'Updated',
            'surname': 'Name',
            'password': TEST_PASSWORD+"1a2b"
        }
        serializer = self.serializer_class(user, data=update_data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_user = serializer.save()
        self.assertEqual(updated_user.name, 'Updated')
        self.assertEqual(updated_user.surname, 'Name')
        self.assertTrue(updated_user.check_password(TEST_PASSWORD+"1a2b"))

    def test_password_write_only(self):
        """Test that password is write-only"""
        user = CustomUser.objects.create_user(**self.user_data)
        serializer = self.serializer_class(user)
        self.assertNotIn('password', serializer.data)

    def test_is_staff_read_only(self):
        """Test that is_staff is read-only"""
        data = self.user_data.copy()
        data['is_staff'] = True
        serializer = self.serializer_class(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertFalse(user.is_staff)  # Should still be False despite trying to set it to True


class UserViewSetTests(APITestCase):
    """Tests for the UserViewSet"""

    def setUp(self):
        self.client = APIClient()
        self.signup_url = '/api/users/signup/'
        self.signin_url = '/api/users/signin/'
        self.signout_url = '/api/users/signout/'
        self.check_role_url = '/api/users/check_role/'

        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': TEST_PASSWORD,
            'name': 'Test',
            'surname': 'User',
            'company': 'Test Company'
        }

        # Create a test user for authentication tests
        self.user = CustomUser.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password=TEST_PASSWORD,
            name='Existing',
            surname='User',
            company='Existing Company'
        )
        self.token = Token.objects.create(user=self.user)

        # Create an admin user for permission tests
        self.admin = CustomUser.objects.create_user(
            username='adminuser',
            email='admin@example.com',
            password=TEST_PASSWORD,
            name='Admin',
            surname='User',
            company='Admin Company',
            is_staff=True
        )
        self.admin_token = Token.objects.create(user=self.admin)

    def test_signup_success(self):
        """Test successful user signup"""
        response = self.client.post(self.signup_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['username'], self.user_data['username'])
        self.assertEqual(response.data['email'], self.user_data['email'])
        self.assertEqual(CustomUser.objects.count(), 3)  # 2 from setUp + 1 new

    def test_signup_duplicate_email(self):
        """Test signup with duplicate email"""
        duplicate_data = self.user_data.copy()
        duplicate_data['email'] = 'existing@example.com'  # Same as existing user
        duplicate_data['username'] = 'newusername'
        response = self.client.post(self.signup_url, duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_signup_duplicate_username(self):
        """Test signup with duplicate username"""
        duplicate_data = self.user_data.copy()
        duplicate_data['username'] = 'existinguser'  # Same as existing user
        duplicate_data['email'] = 'new@example.com'
        response = self.client.post(self.signup_url, duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_signup_invalid_username(self):
        """Test signup with invalid username"""
        invalid_data = self.user_data.copy()
        invalid_data['username'] = 'te'  # Too short
        response = self.client.post(self.signup_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_signup_missing_required_fields(self):
        """Test signup with missing required fields"""
        for field in ['username', 'email', 'password', 'name', 'surname', 'company']:
            data = self.user_data.copy()
            data.pop(field)
            response = self.client.post(self.signup_url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn(field, response.data)

    def test_signup_already_authenticated(self):
        """Test signup when already authenticated"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.post(self.signup_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    def test_signin_with_email_success(self):
        """Test successful signin with email"""
        data = {
            'emailOrUsername': 'existing@example.com',
            'password': TEST_PASSWORD
        }
        response = self.client.post(self.signin_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_signin_with_username_success(self):
        """Test successful signin with username"""
        data = {
            'emailOrUsername': 'existinguser',
            'password': TEST_PASSWORD
        }
        response = self.client.post(self.signin_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_signin_invalid_credentials(self):
        """Test signin with invalid credentials"""
        data = {
            'emailOrUsername': 'existing@example.com',
            'password': TEST_PASSWORD+"**"
        }
        response = self.client.post(self.signin_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)

    def test_signin_nonexistent_user(self):
        """Test signin with nonexistent user"""
        data = {
            'emailOrUsername': 'nonexistent@example.com',
            'password': TEST_PASSWORD
        }
        response = self.client.post(self.signin_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)

    def test_signin_already_authenticated(self):
        """Test signin when already authenticated"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        data = {
            'emailOrUsername': 'existing@example.com',
            'password': TEST_PASSWORD
        }
        response = self.client.post(self.signin_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    def test_signout_success(self):
        """Test successful signout"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.post(self.signout_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        # Verify token is deleted
        with self.assertRaises(Token.DoesNotExist):
            Token.objects.get(user=self.user)

    def test_signout_unauthenticated(self):
        """Test signout when not authenticated"""
        response = self.client.post(self.signout_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_user_success(self):
        """Test successful user update"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        update_data = {
            'name': 'Updated',
            'surname': 'Name'
        }
        response = self.client.put(f'/api/users/{self.user.id}/update_user/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated')
        self.assertEqual(response.data['surname'], 'Name')

    def test_update_user_password_success(self):
        """Test successful password update"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        update_data = {
            'password': TEST_PASSWORD+"1a2b",
            'oldPassword': TEST_PASSWORD
        }
        response = self.client.put(f'/api/users/{self.user.id}/update_user/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(TEST_PASSWORD+"1a2b"))

    def test_update_user_password_wrong_old_password(self):
        """Test password update with wrong old password"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        update_data = {
            'password': TEST_PASSWORD+"1a2b",
            'oldPassword': TEST_PASSWORD+"a"
        }
        response = self.client.put(f'/api/users/{self.user.id}/update_user/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('oldPassword', response.data)

    def test_update_user_unauthenticated(self):
        """Test user update when not authenticated"""
        update_data = {
            'name': 'Updated',
            'surname': 'Name'
        }
        response = self.client.put(f'/api/users/{self.user.id}/update_user/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_other_user_as_non_admin(self):
        """Test updating another user as non-admin"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        update_data = {
            'name': 'Updated',
            'surname': 'Name'
        }
        response = self.client.put(f'/api/users/{self.admin.id}/update_user/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_user_success(self):
        """Test successful user deletion"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.delete(f'/api/users/{self.user.id}/delete_user/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        # Verify user is deleted
        with self.assertRaises(CustomUser.DoesNotExist):
            CustomUser.objects.get(id=self.user.id)

    def test_delete_user_unauthenticated(self):
        """Test user deletion when not authenticated"""
        response = self.client.delete(f'/api/users/{self.user.id}/delete_user/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_other_user_as_non_admin(self):
        """Test deleting another user as non-admin"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.delete(f'/api/users/{self.admin.id}/delete_user/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_check_role_as_admin(self):
        """Test check_role endpoint as admin"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.get(self.check_role_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user_role'], 'admin')
        self.assertTrue(response.data['is_admin'])

    def test_check_role_as_regular_user(self):
        """Test check_role endpoint as regular user"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.get(self.check_role_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user_role'], 'user')
        self.assertFalse(response.data['is_admin'])

    def test_check_role_unauthenticated(self):
        """Test check_role endpoint when not authenticated"""
        response = self.client.get(self.check_role_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
