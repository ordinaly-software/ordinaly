from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import CustomUserSerializer, GoogleUserProfileCompletionSerializer
from .google_auth import verify_google_token


class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.action in ['signup', 'signin']:
            permission_classes = [AllowAny]
            if self.request.user.is_authenticated:
                permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def signup(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return Response({'detail': 'You are already signed in.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        response_data['token'] = token.key
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated])
    def update_user(self, request, pk=None):
        user = self.get_object()
        if request.user != user and not request.user.is_staff and not request.user.is_superuser:
            return Response(
                {'detail': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if 'password' in request.data:
            old_password = request.data.get('oldPassword')
            if not user.check_password(old_password):
                return Response({'oldPassword': 'Wrong password.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_user(self, request, pk=None):
        user = self.get_object()
        if request.user != user and not request.user.is_staff and not request.user.is_superuser:
            return Response(
                {'detail': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        self.perform_destroy(user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def signin(self, request):
        if request.user.is_authenticated:
            return Response({'detail': 'You are already signed in.'}, status=status.HTTP_400_BAD_REQUEST)

        email_or_username = request.data.get('emailOrUsername')
        password = request.data.get('password')

        if not email_or_username or not password:
            return Response({'detail': 'Email/Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Use our custom authentication backend
        user = authenticate(request, username=email_or_username, password=password)

        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            serializer = self.get_serializer(user)
            response_data = serializer.data
            response_data['token'] = token.key
            return Response(response_data, status=status.HTTP_200_OK)

        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def signout(self, request):
        try:
            token = request.user.auth_token
            if token:
                token.delete()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def check_role(self, request):
        user = request.user
        is_admin = user.is_staff or user.is_superuser

        return Response({
            'user_role': 'admin' if is_admin else 'user',
            'is_admin': is_admin
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        """Get current user's profile information"""
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """Update current user's profile information"""
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def complete_profile(self, request):
        """Complete user's profile information (specifically for required fields like company)"""
        user = request.user

        # Validate required fields for profile completion
        required_fields = ['company']
        for field in required_fields:
            if not request.data.get(field):
                return Response({field: f"{field.capitalize()} is required"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_profile(self, request):
        """Delete current user's account"""
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def google_oauth(self, request):
        """Authenticate user with Google OAuth token"""
        google_token = request.data.get('google_token')

        if not google_token:
            return Response(
                {'error': 'Google token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify the Google token
        google_user_data = verify_google_token(google_token)
        if not google_user_data:
            return Response(
                {'error': 'Invalid Google token'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        email = google_user_data['email']
        google_id = google_user_data['google_id']

        try:
            # Try to find existing user by email
            user = CustomUser.objects.get(email=email)

            # Update Google ID if not set
            if not user.google_id:
                user.google_id = google_id
                user.save()

            # Create or get token
            token, created = Token.objects.get_or_create(user=user)
            serializer = CustomUserSerializer(user)
            response_data = serializer.data
            response_data['token'] = token.key

            return Response(response_data, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            # User doesn't exist, return data for profile completion
            return Response({
                'requires_completion': True,
                'google_data': {
                    'google_id': google_id,
                    'email': email,
                    'first_name': google_user_data.get('first_name', ''),
                    'last_name': google_user_data.get('last_name', ''),
                    'picture': google_user_data.get('picture', ''),
                }
            }, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def complete_google_profile(self, request):
        """Complete Google OAuth user profile and create account"""
        google_token = request.data.get('google_token')

        if not google_token:
            return Response(
                {'error': 'Google token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify the Google token again
        google_user_data = verify_google_token(google_token)
        if not google_user_data:
            return Response(
                {'error': 'Invalid Google token'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if user already exists
        email = google_user_data['email']
        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {'error': 'User with this email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate the profile completion data
        serializer = GoogleUserProfileCompletionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Create the user
        user_data = {
            'email': email,
            'username': serializer.validated_data['username'],
            'name': google_user_data.get('first_name', ''),
            'surname': google_user_data.get('last_name', ''),
            'region': serializer.validated_data.get('region'),
            'city': serializer.validated_data.get('city'),
            'company': serializer.validated_data['company'],
            'google_id': google_user_data['google_id'],
        }

        # Create user without password (OAuth user)
        user = CustomUser.objects.create_user(
            email=user_data['email'],
            username=user_data['username'],
            password=None,  # No password for OAuth users
            name=user_data['name'],
            surname=user_data['surname'],
            region=user_data['region'],
            city=user_data['city'],
            company=user_data['company'],
        )
        user.google_id = user_data['google_id']
        user.save()

        # Create token
        token, created = Token.objects.get_or_create(user=user)

        # Return user data with token
        user_serializer = CustomUserSerializer(user)
        response_data = user_serializer.data
        response_data['token'] = token.key

        return Response(response_data, status=status.HTTP_201_CREATED)
