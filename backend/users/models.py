from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError


# Since we have a custom user model, we need a custom user manager
# that inherits from BaseUserManager. This custom user manager will handle creating
# users and superusers. This saves us a lot of work, and it can be seen that everything is much simpler
# at the admin interface (e.g., http://yourdomain.com/admin/)

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, username, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    username_validator = RegexValidator(
        regex=r'^[a-zA-Z0-9_]{3,30}$',
        message='Username must be 3-30 characters long and contain only letters, numbers, and underscores.'
    )

    email = models.EmailField(unique=True, max_length=255)
    username = models.CharField(
        max_length=30,
        unique=True,
        validators=[username_validator]
    )
    name = models.CharField(max_length=30)
    surname = models.CharField(max_length=30)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    region = models.CharField(max_length=50, null=True, blank=True, default=None)
    city = models.CharField(max_length=50, null=True, blank=True, default=None)

    company = models.CharField(max_length=50, null=False, blank=False, default=None)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    class Meta:
        ordering = ['username']

    def __str__(self):
        return self.email

    def clean(self):
        super().clean()
        # Check for XSS attempts in username
        if '<script>' in self.username.lower():
            raise ValidationError({
                'username': 'Username cannot contain potentially harmful script tags.'
            })
