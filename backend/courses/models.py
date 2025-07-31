from django.db import models
from django.core.validators import MinValueValidator
from users.models import CustomUser
from decimal import Decimal
import os


class Course(models.Model):
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(max_length=500)
    image = models.ImageField(upload_to='course_images/')
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        null=True,
        blank=True
    )
    location = models.CharField(max_length=100)
    date = models.CharField(max_length=100)
    max_attendants = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Handle image replacement on update
        if self.pk:  # This is an update
            try:
                old_instance = Course.objects.get(pk=self.pk)
                # Delete old image if it's being replaced
                if old_instance.image and old_instance.image != self.image:
                    if os.path.isfile(old_instance.image.path):
                        os.remove(old_instance.image.path)
            except Course.DoesNotExist:
                pass  # This shouldn't happen, but handle gracefully
        
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Delete the image file from filesystem when model is deleted
        if self.image and os.path.isfile(self.image.path):
            os.remove(self.image.path)
        super().delete(*args, **kwargs)

    class Meta:
        verbose_name_plural = 'Courses'


class Enrollment(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"
