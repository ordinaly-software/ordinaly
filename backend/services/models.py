from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from decimal import Decimal
from urllib.parse import urlparse
from django.utils.text import slugify
import markdown


class Service(models.Model):
    # Color choices for service theming
    COLOR_CHOICES = [
        ('1A1924', 'Dark Purple (#1A1924)'),
        ('623CEA', 'Purple (#623CEA)'),
        ('46B1C9', 'Cyan (#46B1C9)'),
        ('29BF12', 'Green (#29BF12)'),
        ('E4572E', 'Orange (#E4572E)'),
    ]
    # Common Lucide React icons for services
    ICON_CHOICES = [
        ('Bot', 'Bot'),
        ('Workflow', 'Workflow'),
        ('Zap', 'Zap'),
        ('Users', 'Users'),
        ('TrendingUp', 'TrendingUp'),
        ('Accessibility', 'Accessibility'),
        ('MessageSquare', 'MessageSquare'),
        ('Brain', 'Brain'),
        ('Smartphone', 'Smartphone'),
        ('Globe', 'Globe'),
        ('Shield', 'Shield'),
        ('Settings', 'Settings'),
        ('Code', 'Code'),
        ('Database', 'Database'),
        ('Cloud', 'Cloud'),
        ('Lightbulb', 'Lightbulb'),
        ('Target', 'Target'),
        ('Rocket', 'Rocket'),
        ('Monitor', 'Monitor'),
        ('Headphones', 'Headphones'),
        ('BarChart', 'BarChart'),
        ('PieChart', 'PieChart'),
        ('Activity', 'Activity'),
        ('Briefcase', 'Briefcase'),
        ('Camera', 'Camera'),
        ('Video', 'Video'),
        ('Mic', 'Mic'),
        ('Speaker', 'Speaker'),
        ('Wifi', 'Wifi'),
        ('Lock', 'Lock'),
        ('Unlock', 'Unlock'),
        ('Key', 'Key'),
        ('Mail', 'Mail'),
        ('Phone', 'Phone'),
        ('Search', 'Search'),
        ('Filter', 'Filter'),
        ('Download', 'Download'),
        ('Upload', 'Upload'),
        ('Share', 'Share'),
        ('Heart', 'Heart'),
        ('Star', 'Star'),
        ('Award', 'Award'),
        ('Gift', 'Gift'),
        ('ShoppingCart', 'ShoppingCart'),
        ('CreditCard', 'CreditCard'),
        ('DollarSign', 'DollarSign'),
        ('Euro', 'Euro'),
        ('Calculator', 'Calculator'),
        ('Calendar', 'Calendar'),
        ('Clock', 'Clock'),
        ('Timer', 'Timer'),
        ('MapPin', 'MapPin'),
        ('Navigation', 'Navigation'),
        ('Compass', 'Compass'),
        ('Home', 'Home'),
        ('Building', 'Building'),
        ('Factory', 'Factory'),
        ('Store', 'Store'),
        ('Truck', 'Truck'),
        ('Car', 'Car'),
        ('Plane', 'Plane'),
        ('Ship', 'Ship'),
        ('Gamepad2', 'Gamepad2'),
        ('Music', 'Music'),
        ('Film', 'Film'),
        ('Image', 'Image'),
        ('FileText', 'FileText'),
        ('File', 'File'),
        ('Folder', 'Folder'),
        ('Archive', 'Archive'),
        ('Book', 'Book'),
        ('BookOpen', 'BookOpen'),
        ('GraduationCap', 'GraduationCap'),
        ('Palette', 'Palette'),
        ('Brush', 'Brush'),
        ('Scissors', 'Scissors'),
        ('Wrench', 'Wrench'),
        ('Hammer', 'Hammer'),
        ('Cog', 'Cog'),
        ('LifeBuoy', 'LifeBuoy'),
        ('HelpCircle', 'HelpCircle'),
        ('Info', 'Info'),
        ('AlertTriangle', 'AlertTriangle'),
        ('CheckCircle', 'CheckCircle'),
        ('XCircle', 'XCircle'),
        ('Plus', 'Plus'),
        ('Minus', 'Minus'),
        ('X', 'X'),
        ('Check', 'Check'),
        ('ArrowRight', 'ArrowRight'),
        ('ArrowLeft', 'ArrowLeft'),
        ('ArrowUp', 'ArrowUp'),
        ('ArrowDown', 'ArrowDown'),
        ('ChevronRight', 'ChevronRight'),
        ('ChevronLeft', 'ChevronLeft'),
        ('ChevronUp', 'ChevronUp'),
        ('ChevronDown', 'ChevronDown'),
        ('Menu', 'Menu'),
        ('MoreHorizontal', 'MoreHorizontal'),
        ('MoreVertical', 'MoreVertical'),
        ('Grid', 'Grid'),
        ('List', 'List'),
        ('Layout', 'Layout'),
        ('Layers', 'Layers'),
        ('Move', 'Move'),
        ('Copy', 'Copy'),
        ('Edit', 'Edit'),
        ('Edit2', 'Edit2'),
        ('Edit3', 'Edit3'),
        ('Trash', 'Trash'),
        ('Trash2', 'Trash2'),
        ('Save', 'Save'),
        ('RotateCw', 'RotateCw'),
        ('RotateCcw', 'RotateCcw'),
        ('RefreshCw', 'RefreshCw'),
        ('RefreshCcw', 'RefreshCcw'),
        ('Repeat', 'Repeat'),
        ('Shuffle', 'Shuffle'),
        ('SkipBack', 'SkipBack'),
        ('SkipForward', 'SkipForward'),
        ('Play', 'Play'),
        ('Pause', 'Pause'),
        ('Stop', 'Stop'),
        ('Square', 'Square'),
        ('Circle', 'Circle'),
        ('Triangle', 'Triangle'),
        ('Hexagon', 'Hexagon'),
        ('Octagon', 'Octagon'),
        ('Diamond', 'Diamond'),
    ]

    SERVICE = "SERVICE"
    PRODUCT = "PRODUCT"
    TYPE_CHOICES = [
        (SERVICE, "Service"),
        (PRODUCT, "Product"),
    ]
    type = models.CharField(max_length=16, choices=TYPE_CHOICES, default=SERVICE)
    title = models.CharField(max_length=100)
    slug = models.SlugField(
        max_length=100,
        unique=True,
        blank=True,
        null=False,
        help_text="URL-friendly identifier generated from the title"
    )
    draft = models.BooleanField(
        default=False,
        null=False,
        help_text="If true, this service is a draft and not visible to non-admin users."
    )
    subtitle = models.CharField(max_length=200)
    description = models.TextField(
        max_length=2000,
        help_text="Markdown content that will be converted to HTML for display"
    )
    image = models.ImageField(upload_to='service_images/', null=True, blank=True)
    youtube_video_url = models.URLField(
        max_length=255,
        null=True,
        blank=True,
        help_text="YouTube link with a service or product explanation"
    )
    color = models.CharField(
        max_length=6,
        choices=COLOR_CHOICES,
        default='29BF12',
        help_text="Theme color for the service card"
    )
    icon = models.CharField(max_length=50, choices=ICON_CHOICES, help_text="Lucide React icon name")
    duration = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Duration in days",
        null=True,
        blank=True
    )
    requisites = models.TextField(null=True, blank=True, max_length=500)
    price = models.DecimalField(max_digits=10, decimal_places=2,
                                validators=[MinValueValidator(Decimal('0.01'))], null=True, blank=True)

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

    def save(self, *args, **kwargs):
        old_image = None
        if self.pk:
            old_image = (
                Service.objects.filter(pk=self.pk)
                .only('image')
                .values_list('image', flat=True)
                .first()
            )
        # Truncate title to avoid DB-level DataError
        try:
            title_max = self._meta.get_field('title').max_length
            if self.title and title_max and len(self.title) > title_max:
                self.title = self.title[:title_max]
        except Exception:
            pass
        # Auto-generate slug from title if not provided
        if not self.slug and self.title:
            max_slug_length = 100
            max_suffix_length = len("-99999")
            base_slug = slugify(self.title)[:max_slug_length - max_suffix_length]
            slug_candidate = base_slug
            i = 1
            while Service.objects.filter(slug=slug_candidate).exclude(pk=self.pk).exists():
                suffix = f"-{i}"
                allowed_base_length = max_slug_length - len(suffix)
                truncated_base = base_slug[:allowed_base_length]
                slug_candidate = f"{truncated_base}{suffix}"
                i += 1
            self.slug = slug_candidate
        # Ensure draft is never None
        if self.draft is None:
            self.draft = False
        super().save(*args, **kwargs)
        # Remove previous image file when it gets replaced/cleared
        if old_image and (not self.image or self.image.name != old_image):
            try:
                storage = self.image.storage if self.image else None
                # If image was cleared, use default storage via the field
                storage = storage or self._meta.get_field('image').storage
                if storage.exists(old_image):
                    storage.delete(old_image)
            except Exception:
                # File cleanup should never block saving the model
                pass

    def delete(self, *args, **kwargs):
        image_name = self.image.name if self.image else None
        storage = self.image.storage if self.image else self._meta.get_field('image').storage
        super().delete(*args, **kwargs)
        if image_name:
            try:
                if storage.exists(image_name):
                    storage.delete(image_name)
            except Exception:
                pass

    def clean(self):
        max_size = 1024 * 1024  # 1MB
        if self.image and hasattr(self.image, 'size') and self.image.size > max_size:
            raise ValidationError({'image': 'Service image must be 1MB or less.'})

        if self.youtube_video_url:
            parsed = urlparse(self.youtube_video_url)
            allowed_hosts = {
                'youtube.com',
                'www.youtube.com',
                'm.youtube.com',
                'youtu.be',
                'www.youtu.be',
            }
            if parsed.netloc.lower() not in allowed_hosts:
                raise ValidationError({
                    'youtube_video_url': 'Service video must be a YouTube link.'
                })
        super().clean()

    def get_clean_description(self):
        """Return description with Markdown formatting removed for plain text display"""
        # Convert markdown to HTML first, then strip HTML tags
        html_content = markdown.markdown(self.description)
        # Remove HTML tags using regex as strip_tags is not available
        import re
        clean_text = re.sub('<[^<]+?>', '', html_content)
        return clean_text.strip()

    def get_html_description(self):
        """Convert Markdown description to HTML for display"""
        return markdown.markdown(
            self.description,
            extensions=['codehilite', 'tables', 'fenced_code', 'nl2br'],
            extension_configs={
                'codehilite': {
                    'css_class': 'highlight',
                    'use_pygments': True
                }
            }
        )

    def get_html_requisites(self):
        """Convert Markdown requisites to HTML for display"""
        if not self.requisites:
            return ""
        return markdown.markdown(
            self.requisites,
            extensions=['codehilite', 'tables', 'fenced_code', 'nl2br'],
            extension_configs={
                'codehilite': {
                    'css_class': 'highlight',
                    'use_pygments': True
                }
            }
        )

    def get_color_display(self):
        """Return the color value prefixed with # for CSS usage"""
        return f"#{self.color}"

    class Meta:
        ordering = ['-is_featured', 'title']
        verbose_name = "Service"
        verbose_name_plural = "Services"
