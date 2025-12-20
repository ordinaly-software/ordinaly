from django import forms
from .models import Course, Enrollment
from django.utils import timezone


class CourseAdminForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = '__all__'

    def clean_start_date(self):
        start_date = self.cleaned_data['start_date']
        if start_date < timezone.now().date():
            raise forms.ValidationError('Start date cannot be in the past.')
        return start_date

    def clean_end_date(self):
        end_date = self.cleaned_data['end_date']
        if end_date < timezone.now().date():
            raise forms.ValidationError('End date cannot be in the past.')
        start_date = self.cleaned_data.get('start_date')
        if start_date and end_date < start_date:
            raise forms.ValidationError('End date cannot be before start date.')
        return end_date


class EnrollmentAdminForm(forms.ModelForm):
    class Meta:
        model = Enrollment
        fields = '__all__'

    def save(self, commit=True):
        instance = super().save(commit=False)
        if commit:
            instance.save(skip_full_clean=True)
        return instance
