from .models import CustomUser
from rest_framework import serializers
from django.utils import timezone


class CustomUserSerializer(serializers.ModelSerializer):
    # Add computed fields that the frontend expects
    first_name = serializers.CharField(source='name', required=False)
    last_name = serializers.CharField(source='surname', required=False)
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'password', 'name', 'surname',
            'first_name', 'last_name',  # Add alias fields for frontend compatibility
            'region', 'city', 'company', 'is_staff', 'is_superuser',
            'allow_notifications',
            'created_at', 'updated_at'
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'region': {'required': False, 'allow_null': True},
            'city': {'required': False, 'allow_null': True},
            'company': {'required': True, 'allow_null': False},
            'is_staff': {'read_only': True},
            'is_superuser': {'read_only': True},
            'allow_notifications': {'required': False},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True}
        }

    def get_created_at(self, obj):
        """Return the date the user was created (using date_joined if available)"""
        if hasattr(obj, 'date_joined'):
            return obj.date_joined.isoformat()
        return timezone.now().isoformat()

    def get_updated_at(self, obj):
        """Return the last modified date (using last_login as a proxy)"""
        if hasattr(obj, 'last_login') and obj.last_login:
            return obj.last_login.isoformat()
        return timezone.now().isoformat()

    def create(self, validated_data):
        # Handle the alias fields
        if 'first_name' in validated_data:
            validated_data['name'] = validated_data.pop('first_name')
        if 'last_name' in validated_data:
            validated_data['surname'] = validated_data.pop('last_name')

        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            surname=validated_data['surname'],
            region=validated_data.get('region'),
            city=validated_data.get('city'),
            company=validated_data.get('company'),
            allow_notifications=validated_data.get('allow_notifications', True)
        )
        return user

    def update(self, instance, validated_data):
        # Handle the alias fields
        if 'first_name' in validated_data:
            validated_data['name'] = validated_data.pop('first_name')
        if 'last_name' in validated_data:
            validated_data['surname'] = validated_data.pop('last_name')

        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        return super().update(instance, validated_data)
