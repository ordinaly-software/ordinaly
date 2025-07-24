from django.contrib import admin
from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'subtitle', 'duration', 'price', 'is_featured', 'created_by', 'created_at')
    list_filter = ('is_featured', 'created_at')
    search_fields = ('title', 'subtitle', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'subtitle', 'description', 'icon')
        }),
        ('Additional Information', {
            'fields': ('duration', 'requisites', 'price', 'is_featured')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )
