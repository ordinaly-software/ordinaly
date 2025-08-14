from rest_framework import serializers
from .models import Terms


class TermsSerializer(serializers.ModelSerializer):
    tag_display = serializers.CharField(source='get_tag_display', read_only=True)
    name = serializers.CharField(required=False)
    pdf_content = serializers.FileField(required=False, allow_null=True)
    version = serializers.CharField(required=True)

    def validate_pdf_content(self, value):
        # Only require PDF on create, not on update
        if self.instance is None and not value:
            raise serializers.ValidationError("PDF file is required.")
        if value:
            if not value.name.endswith('.pdf'):
                raise serializers.ValidationError("PDF content must be a PDF file")
            max_size = 1024 * 1024  # 1MB
            if value.size > max_size:
                raise serializers.ValidationError("PDF file must be 1MB or less.")
        return value

    class Meta:
        model = Terms
        fields = ['id', 'name', 'tag', 'tag_display', 'pdf_content',
                  'version', 'author', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'author']

    def validate(self, data):
        # Require pdf_content on creation
        if self.instance is None and not data.get('pdf_content'):
            raise serializers.ValidationError({'pdf_content': 'PDF file is required.'})
        if not data.get('name'):
            data['name'] = f"{data.get('tag', '').capitalize()} v{data.get('version', '')}"
        return data
