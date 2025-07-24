from rest_framework import serializers
from .models import Course, Enrollment
from users.models import CustomUser


class CourseSerializer(serializers.ModelSerializer):
    enrolled_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'subtitle', 'description', 'image', 'price',
                  'location', 'date', 'max_attendants', 'enrolled_count',
                  'created_at', 'updated_at']

    def get_enrolled_count(self, obj):
        return obj.enrollments.count()


class EnrollmentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())

    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'course', 'enrolled_at']
