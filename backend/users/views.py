from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import CustomUserSerializer


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
        self.perform_destroy(user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def signin(self, request):
        if request.user.is_authenticated:
            return Response({'detail': 'You are already signed in.'}, status=status.HTTP_400_BAD_REQUEST)

        email_or_username = request.data.get('emailOrUsername')
        password = request.data.get('password')

        # Try to authenticate with email
        user = None
        if '@' in email_or_username:
            user = authenticate(request, email=email_or_username, password=password)

        # If email authentication failed, try username
        if not user:
            try:
                user_obj = CustomUser.objects.get(username=email_or_username)
                user = authenticate(request, email=user_obj.email, password=password)
            except CustomUser.DoesNotExist:
                pass

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
