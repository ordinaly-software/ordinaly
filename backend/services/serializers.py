from urllib.parse import urlparse
from rest_framework import serializers
from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    created_by_username = serializers.ReadOnlyField(source='created_by.username')
    clean_description = serializers.SerializerMethodField()
    html_description = serializers.SerializerMethodField()
    requisites_html = serializers.SerializerMethodField()
    color_hex = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)
    youtube_video_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Service
        fields = [
            'id', 'type', 'title', 'slug', 'subtitle', 'description', 'clean_description',
            'html_description', 'requisites_html', 'color', 'color_hex', 'icon', 'duration', 'image',
            'remove_image', 'youtube_video_url', 'requisites', 'price', 'is_featured', 'draft', 'created_by',
            'created_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_by', 'created_at', 'updated_at',
            'clean_description', 'html_description', 'requisites_html', 'color_hex'
        ]

    def to_internal_value(self, data):
        # Work on a mutable copy because incoming `data` can be a QueryDict
        # (e.g. when coming from a request) which may be immutable.
        if hasattr(data, 'copy'):
            mutable = data.copy()
        else:
            mutable = dict(data)

        # Ensure draft is always set to False if not provided or null
        if 'draft' not in mutable or mutable.get('draft') is None:
            mutable['draft'] = False
        # Normalize empty strings to None for optional URL field
        if mutable.get('youtube_video_url') == '':
            mutable['youtube_video_url'] = None
        # Normalize empty strings to None for optional image (used to clear existing image)
        if mutable.get('image') in ['', 'null', 'None']:
            mutable['image'] = None
        return super().to_internal_value(mutable)

    def get_clean_description(self, obj):
        """Return description with Markdown formatting removed for plain text display"""
        return obj.get_clean_description()

    def get_html_description(self, obj):
        """Return description converted from Markdown to HTML"""
        return obj.get_html_description()

    def get_requisites_html(self, obj):
        """Return requisites converted from Markdown to HTML"""
        return obj.get_html_requisites()

    def get_color_hex(self, obj):
        """Return the color value prefixed with # for CSS usage"""
        return obj.get_color_display()

    def validate(self, data):
        # Support clearing the image via an explicit flag
        if data.pop('remove_image', False):
            data['image'] = None
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
        """Validate description length for Markdown content"""
        if len(value) > 2000:
            raise serializers.ValidationError(
                "Description content cannot exceed 2000 characters."
            )
        return value

    def validate_image(self, value):
        """Ensure uploaded image respects the 1MB limit"""
        max_size = 1024 * 1024  # 1MB
        if value and hasattr(value, 'size') and value.size > max_size:
            raise serializers.ValidationError("Service image must be 1MB or less.")
        return value

    def validate_youtube_video_url(self, value):
        """Validate that the video URL points to YouTube"""
        if not value:
            return value
        if isinstance(value, str):
            value = value.strip()
        if not value:
            return None
        parsed = urlparse(value)
        allowed_hosts = {
            'youtube.com',
            'www.youtube.com',
            'm.youtube.com',
            'youtu.be',
            'www.youtu.be',
        }
        if parsed.hostname is None or parsed.hostname.lower() not in allowed_hosts:
            raise serializers.ValidationError("Service video must be a YouTube link.")
        return value
