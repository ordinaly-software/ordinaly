from django.db import models
from django.core.validators import FileExtensionValidator
import os
from django.core.exceptions import ValidationError
from django.conf import settings


class Terms(models.Model):
    TAG_CHOICES = [
        ('terms', 'Terms and Conditions of Use'),
        ('cookies', 'Cookie Policy'),
        ('privacy', 'Privacy Policy'),
        ('license', 'License'),
    ]

    name = models.CharField(max_length=127)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='authored_terms'
    )
    pdf_content = models.FileField(
        upload_to='terms/',
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf']),
        ],
        null=True,
        blank=True
    )
    version = models.CharField(max_length=20)
    tag = models.CharField(max_length=20, choices=TAG_CHOICES, default='terms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def clean(self):
        # Check if there's already a document with the same tag
        existing_terms = Terms.objects.filter(tag=self.tag)
        if self.pk:  # This is an update
            existing_terms = existing_terms.exclude(pk=self.pk)
        if existing_terms.exists():
            tag_display = dict(self.TAG_CHOICES).get(self.tag, self.tag)
            raise ValidationError(
                f'A "{tag_display}" document already exists. '
                f'Each document type can only be created once.'
            )

        # Only require both files on creation
        if not self.pk:
            if not self.pdf_content:
                raise ValidationError("PDF file must be provided.")

        max_size = 1024 * 1024  # 1MB

        if self.pdf_content:
            if not self.pdf_content.name.endswith('.pdf'):
                raise ValidationError("The PDF content file must be a .pdf file.")
            if (hasattr(self.pdf_content.file, 'content_type') and
               self.pdf_content.file.content_type != "application/pdf"):
                raise ValidationError("The uploaded PDF file must have a valid PDF content type.")
            if self.pdf_content.size > max_size:
                raise ValidationError("The PDF file must be 1MB or less.")

        super().clean()

    def save(self, *args, **kwargs):
        # Handle file replacement on update
        if self.pk:  # This is an update
            try:
                old_instance = Terms.objects.get(pk=self.pk)
                # Delete old files if they're being replaced
                if old_instance.pdf_content and old_instance.pdf_content != self.pdf_content:
                    if os.path.isfile(old_instance.pdf_content.path):
                        os.remove(old_instance.pdf_content.path)
            except Terms.DoesNotExist:
                pass  # This shouldn't happen, but handle gracefully

        self.clean()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Delete the files from filesystem when model is deleted
        if self.pdf_content and os.path.isfile(self.pdf_content.path):
            os.remove(self.pdf_content.path)
        super().delete(*args, **kwargs)

    class Meta:
        verbose_name = "Term"
        verbose_name_plural = "Terms"
        constraints = [
            models.UniqueConstraint(fields=['tag'], name='unique_tag_per_terms')
        ]
