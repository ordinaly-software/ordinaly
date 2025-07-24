from django.contrib import admin
from .models import Course, Enrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'location', 'date', 'max_attendants', 'get_enrolled_count')
    search_fields = ('title', 'description', 'location')
    list_filter = ('date', 'price')

    def get_enrolled_count(self, obj):
        return obj.enrollments.count()
    get_enrolled_count.short_description = 'Enrolled'


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'enrolled_at')
    list_filter = ('enrolled_at',)
    search_fields = ('user__username', 'user__email', 'course__title')
