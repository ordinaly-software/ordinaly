from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal


class Service(models.Model):
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=200)
    description = models.TextField(max_length=500)
    icon = models.CharField(max_length=50, help_text="Font Awesome icon name or similar")
    duration = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Duration in hours",
        null=True,
        blank=True
    )
    requisites = models.TextField(null=True, blank=True, max_length=500)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])

    is_featured = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_services'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-is_featured', 'title']
        verbose_name = "Service"
        verbose_name_plural = "Services"
