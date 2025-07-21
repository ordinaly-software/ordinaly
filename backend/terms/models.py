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
    content = models.FileField(
        upload_to='terms/',
        validators=[
            FileExtensionValidator(allowed_extensions=['md']),
        ]
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
        if not self.pk:  # Only check on creation
            # Check if there's already a document with the same tag
            existing_terms = Terms.objects.filter(tag=self.tag)
            if existing_terms.exists():
                raise ValidationError(f'A "{self.tag}" document already exists.')

        # Ensure the uploaded files are valid
        if not self.content or not self.pdf_content:
            raise ValidationError("Both a markdown (.md) file and a PDF file must be provided.")

        if self.content:
            if not self.content.name.endswith('.md'):
                raise ValidationError("The content file must be a markdown (.md) file.")
            # Remove the strict content-type check for markdown files
            # as it's not consistently set across different systems

        if self.pdf_content:
            if not self.pdf_content.name.endswith('.pdf'):
                raise ValidationError("The PDF content file must be a .pdf file.")
            if (hasattr(self.pdf_content.file, 'content_type') and
               self.pdf_content.file.content_type != "application/pdf"):
                raise ValidationError("The uploaded PDF file must have a valid PDF content type.")

        super().clean()

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Delete the files from filesystem when model is deleted
        if self.content and os.path.isfile(self.content.path):
            os.remove(self.content.path)
        if self.pdf_content and os.path.isfile(self.pdf_content.path):
            os.remove(self.pdf_content.path)
        super().delete(*args, **kwargs)

    class Meta:
        verbose_name = "Term"
        verbose_name_plural = "Terms"
