from django.contrib import admin
from .models import Course, Enrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'location', 'start_date', 'start_time',
                    'periodicity', 'get_weekdays_display', 'max_attendants', 'get_enrolled_count')
    search_fields = ('title', 'description', 'location')
    list_filter = ('start_date', 'periodicity', 'price', 'weekdays')
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'subtitle', 'description', 'image', 'price', 'location')
        }),
        ('Basic Schedule', {
            'fields': ('start_date', 'end_date', 'start_time', 'end_time', 'periodicity', 'timezone')
        }),
        ('Advanced Schedule', {
            'fields': ('weekdays', 'week_of_month', 'interval', 'exclude_dates'),
            'classes': ('collapse',),
            'description': 'Advanced scheduling options for complex patterns'
        }),
        ('Enrollment', {
            'fields': ('max_attendants',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

    def get_enrolled_count(self, obj):
        return obj.enrollments.count()
    get_enrolled_count.short_description = 'Enrolled'

    def get_weekdays_display(self, obj):
        """Display selected weekdays in a readable format"""
        if not obj.weekdays:
            return '-'
        weekday_names = [dict(obj.WEEKDAY_CHOICES)[wd] for wd in obj.weekdays]
        return ', '.join(weekday_names)
    get_weekdays_display.short_description = 'Weekdays'

    def get_form(self, request, obj=None, **kwargs):
        """Customize the form to add help text for complex fields"""
        form = super().get_form(request, obj, **kwargs)

        # Add help text for weekdays field
        if 'weekdays' in form.base_fields:
            form.base_fields['weekdays'].help_text = (
                'Select specific weekdays for weekly/biweekly patterns. '
                'Format: [0,1,2] for Mon,Tue,Wed. Leave empty for default behavior.'
            )

        # Add help text for exclude_dates field
        if 'exclude_dates' in form.base_fields:
            form.base_fields['exclude_dates'].help_text = (
                'Dates to exclude from schedule (holidays, etc.). '
                'Format: ["2024-12-25", "2024-01-01"]'
            )

        return form


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'enrolled_at')
    list_filter = ('enrolled_at',)
    search_fields = ('user__username', 'user__email', 'course__title')
