from rest_framework import serializers
from django.utils.html import strip_tags
from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    created_by_username = serializers.ReadOnlyField(source='created_by.username')
    clean_description = serializers.SerializerMethodField()
    color_hex = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id', 'title', 'subtitle', 'description', 'clean_description', 
            'color', 'color_hex', 'icon', 'duration', 'requisites', 'price', 
            'is_featured', 'created_by', 'created_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'clean_description', 'color_hex']

    def get_clean_description(self, obj):
        """Return description with HTML tags stripped for plain text display"""
        return obj.get_clean_description()

    def get_color_hex(self, obj):
        """Return the color value prefixed with # for CSS usage"""
        return obj.get_color_display()

    def validate(self, data):
        # Add any custom validation here if needed
        return data

    def validate_color(self, value):
        """Validate that the color is one of the allowed choices"""
        valid_colors = [choice[0] for choice in Service.COLOR_CHOICES]
        if value not in valid_colors:
            raise serializers.ValidationError(
                f"Invalid color. Must be one of: {', '.join(valid_colors)}"
            )
        return value

    def validate_description(self, value):
        """Validate description length after stripping HTML tags"""
        clean_text = strip_tags(value)
        if len(clean_text) > 2000:
            raise serializers.ValidationError(
                "Description text content (excluding HTML tags) cannot exceed 2000 characters."
            )
        return value
