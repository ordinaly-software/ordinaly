from rest_framework import serializers
from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    created_by_username = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Service
        fields = [
            'id', 'title', 'subtitle', 'description', 'icon',
            'duration', 'requisites', 'price', 'is_featured',
            'created_by', 'created_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def validate(self, data):
        # Add any custom validation here if needed
        return data
