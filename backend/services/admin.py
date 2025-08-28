from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'subtitle', 'duration', 'price', 'is_featured', 'draft', 'created_by', 'created_at')
    list_filter = ('is_featured', 'draft', 'created_at', 'color')
    search_fields = ('title', 'subtitle', 'description')
    readonly_fields = ('created_at', 'updated_at', 'description_preview')

    fieldsets = (
        (None, {
            'fields': ('title', 'subtitle', 'description', 'description_preview', 'icon', 'draft')
        }),
        ('Styling', {
            'fields': ('color',)
        }),
        ('Additional Information', {
            'fields': ('duration', 'requisites', 'price', 'is_featured')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )

    def description_preview(self, obj):
        """Show a preview of the HTML rendered from Markdown"""
        if obj.description:
            html_content = obj.get_html_description()
            style = "border: 1px solid #ddd; padding: 10px; max-height: 200px; overflow-y: auto;"
            return mark_safe(f'<div style="{style}">{html_content}</div>')
        return "No description"
    description_preview.short_description = "Description Preview (HTML from Markdown)"

    def save_model(self, request, obj, form, change):
        """Set the created_by field to the current user if not already set"""
        if not change:  # Only set on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
