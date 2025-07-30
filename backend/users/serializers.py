from .models import CustomUser
from rest_framework import serializers


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'password', 'name', 'surname',
            'region', 'city', 'company', 'is_staff', 'is_superuser'
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'region': {'required': False, 'allow_null': True},
            'city': {'required': False, 'allow_null': True},
            'company': {'required': True, 'allow_null': False},
            'is_staff': {'read_only': True},
            'is_superuser': {'read_only': True}
        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            surname=validated_data['surname'],
            region=validated_data.get('region'),
            city=validated_data.get('city'),
            company=validated_data.get('company'),
        )
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        return super().update(instance, validated_data)
