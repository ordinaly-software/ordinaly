from rest_framework import serializers
from .models import Terms


class TermsSerializer(serializers.ModelSerializer):

    tag_display = serializers.CharField(source='get_tag_display', read_only=True)
    name = serializers.CharField(required=False)
    content = serializers.FileField(required=False)
    pdf_content = serializers.FileField(required=False)
    version = serializers.CharField(required=True)

    class Meta:
        model = Terms
        fields = ['id', 'name', 'tag', 'tag_display', 'content', 'pdf_content',
                  'version', 'author', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'author']

    def validate_content(self, value):
        if value:
            if not value.name.endswith('.md'):
                raise serializers.ValidationError("Content file must be a markdown (.md) file")
            max_size = 1024 * 1024  # 1MB
            if value.size > max_size:
                raise serializers.ValidationError("Markdown file must be 1MB or less.")
        return value

    def validate_pdf_content(self, value):
        if value:
            if not value.name.endswith('.pdf'):
                raise serializers.ValidationError("PDF content must be a PDF file")
            max_size = 1024 * 1024  # 1MB
            if value.size > max_size:
                raise serializers.ValidationError("PDF file must be 1MB or less.")
        return value

    def validate(self, data):
        if not data.get('name'):
            data['name'] = f"{data.get('tag', '').capitalize()} v{data.get('version', '')}"
        return data
