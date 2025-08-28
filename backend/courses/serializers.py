from rest_framework import serializers
from .models import Course, Enrollment
from users.models import CustomUser


class CourseSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Image is required only on creation (no instance)
        self.fields['image'].required = self.instance is None

    image = serializers.ImageField(required=False, allow_null=True)
    location = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def validate_image(self, value):
        # Only require image on creation
        if self.instance is None and (value is None or value == ''):
            raise serializers.ValidationError("Course image is required.")
        max_size = 1024 * 1024  # 1MB
        if value and hasattr(value, 'size'):
            if value.size > max_size:
                raise serializers.ValidationError("Course image must be 1MB or less.")
        return value

    def validate(self, data):
        # Convert empty strings to None for nullable date/time fields
        for field in ['start_date', 'end_date', 'start_time', 'end_time']:
            if field in data and data[field] == '':
                data[field] = None

        # On update, prevent lowering max_attendants below enrolled_count
        instance = getattr(self, 'instance', None)
        new_max = data.get('max_attendants', None)
        if instance and new_max is not None:
            enrolled = instance.enrollments.count()
            if new_max < enrolled:
                raise serializers.ValidationError({
                    'max_attendants': (
                        f"Cannot set max attendants below the current number of enrolled users ({enrolled})."
                    )
                })
        return data
    enrolled_count = serializers.SerializerMethodField()
    duration_hours = serializers.ReadOnlyField()
    formatted_schedule = serializers.ReadOnlyField()
    schedule_description = serializers.SerializerMethodField()
    next_occurrences = serializers.SerializerMethodField()
    weekday_display = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'subtitle', 'description', 'image', 'price',
                  'location', 'start_date', 'end_date', 'start_time', 'end_time',
                  'periodicity', 'timezone', 'weekdays', 'week_of_month', 'interval',
                  'exclude_dates', 'max_attendants', 'enrolled_count',
                  'duration_hours', 'formatted_schedule', 'schedule_description',
                  'next_occurrences', 'weekday_display', 'draft', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        # Make data mutable (QueryDict is immutable)
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        # Ensure draft is always set to False if not provided or null
        if 'draft' not in data or data.get('draft') is None:
            data['draft'] = False
        return super().to_internal_value(data)

    def get_enrolled_count(self, obj):
        return obj.enrollments.count()

    def get_next_occurrences(self, obj):
        try:
            return obj.get_next_occurrences(limit=5)
        except Exception:
            return []

    def get_schedule_description(self, obj):
        try:
            return obj.get_schedule_description()
        except Exception:
            return None

    def get_weekday_display(self, obj):
        """Return human-readable weekday names"""
        try:
            if not obj.weekdays:
                return []
            return [dict(Course.WEEKDAY_CHOICES)[wd] for wd in obj.weekdays]
        except Exception:
            return []


class EnrollmentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'course', 'enrolled_at', 'user_details']

    def get_user_details(self, obj):
        """Return limited user details for privacy and security"""
        user = obj.user
        return {
            'name': user.name if user.name else '',
            'surname': user.surname if user.surname else '',
            'email': user.email,
            'company': user.company if user.company else '',
        }
