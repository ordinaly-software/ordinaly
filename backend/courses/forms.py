from django import forms
from .models import Course, Enrollment
from django.utils import timezone


class CourseAdminForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = [
            'slug', 'title', 'subtitle', 'description', 'bonified_course_link',
            'youtube_video_url', 'image', 'price', 'location', 'draft',
            'start_date', 'end_date', 'start_time', 'end_time', 'periodicity', 'timezone',
            'weekdays', 'week_of_month', 'interval', 'exclude_dates',
            'max_attendants',
        ]

    def clean_start_date(self):
        start_date = self.cleaned_data['start_date']
        return start_date

    def clean_end_date(self):
        end_date = self.cleaned_data['end_date']
        start_date = self.cleaned_data.get('start_date')
        if start_date and end_date and end_date < start_date:
            raise forms.ValidationError('End date cannot be before start date.')
        return end_date


class EnrollmentAdminForm(forms.ModelForm):
    class Meta:
        model = Enrollment
        fields = ['user', 'course', 'stripe_payment_intent_id']

    def save(self, commit=True):
        instance = super().save(commit=False)
        if commit:
            instance.save(skip_full_clean=True)
        return instance
