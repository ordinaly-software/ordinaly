from django.db import models
from django.core.validators import MinValueValidator
from users.models import CustomUser
from decimal import Decimal
import os
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError
from django.utils.text import slugify


class Course(models.Model):

    PERIODICITY_CHOICES = [
        ('once', 'One-time event'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('biweekly', 'Biweekly'),
        ('monthly', 'Monthly'),
        ('custom', 'Custom schedule'),
    ]

    WEEKDAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    WEEK_OF_MONTH_CHOICES = [
        (1, 'First week'),
        (2, 'Second week'),
        (3, 'Third week'),
        (4, 'Fourth week'),
        (-1, 'Last week'),
    ]

    title = models.CharField(max_length=100)
    slug = models.SlugField(max_length=110, unique=True, blank=True, null=True,
                            help_text="URL-friendly identifier generated from the title")
    draft = models.BooleanField(
        default=False,
        null=False,
        help_text=(
            "If true, this course is a draft and not visible to non-admin users."
        )
    )
    subtitle = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(max_length=2000)
    image = models.ImageField(upload_to='course_images/')
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    def clean(self):
        # Validate image size (max 1MB)
        max_size = 1024 * 1024  # 1MB
        if self.image and hasattr(self.image, 'size'):
            if self.image.size > max_size:
                raise ValidationError({
                    'image': 'Course image must be 1MB or less.'
                })
        # Custom price validation
        if self.price is not None:
            if self.price < 0 or self.price > Decimal('999999.99'):
                raise ValidationError({'price': 'Price must be between 0 and 999999.99.'})
            if Decimal('0.01') <= self.price <= Decimal('0.49'):
                raise ValidationError({'price': 'Price cannot be between 0.01 and 0.49 (inclusive).'})
        super().clean()
    location = models.CharField(max_length=100, null=True, blank=True)

    # New professional scheduling fields
    start_date = models.DateField(
        help_text="Start date of the course",
        null=True,
        blank=True
    )
    end_date = models.DateField(
        help_text="End date of the course (for recurring events)",
        null=True,
        blank=True
    )
    start_time = models.TimeField(
        help_text="Time when the course starts",
        null=True,
        blank=True
    )
    end_time = models.TimeField(
        help_text="Time when the course ends",
        null=True,
        blank=True
    )
    periodicity = models.CharField(
        max_length=10,
        choices=PERIODICITY_CHOICES,
        default='once',
        help_text="How often the course repeats"
    )
    timezone = models.CharField(
        max_length=50,
        default='Europe/Madrid',
        help_text="Timezone for the course schedule"
    )

    # Advanced scheduling fields for custom patterns
    weekdays = models.JSONField(
        default=list,
        blank=True,
        help_text="List of weekdays (0=Monday, 6=Sunday) for weekly/biweekly patterns"
    )
    week_of_month = models.IntegerField(
        choices=WEEK_OF_MONTH_CHOICES,
        null=True,
        blank=True,
        help_text="Which week of the month (for monthly patterns)"
    )
    interval = models.PositiveIntegerField(
        default=1,
        help_text="Interval between occurrences (e.g., every 2 weeks, every 3 months)"
    )
    exclude_dates = models.JSONField(
        default=list,
        blank=True,
        help_text="List of dates to exclude from the schedule (holidays, etc.)"
    )

    max_attendants = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    @property
    def duration_hours(self):
        """Calculate course duration in hours"""
        if not self.start_time or not self.end_time:
            return None
        start_datetime = datetime.combine(datetime.today(), self.start_time)
        end_datetime = datetime.combine(datetime.today(), self.end_time)
        if end_datetime < start_datetime:
            end_datetime += timedelta(days=1)
        duration = end_datetime - start_datetime
        return duration.total_seconds() / 3600

    @property
    def formatted_schedule(self):
        """Return a human-readable schedule string"""
        if not self.start_date or not self.end_date or not self.start_time or not self.end_time:
            return None
        start_time_str = self.start_time.strftime('%H:%M')
        end_time_str = self.end_time.strftime('%H:%M')

        if self.periodicity == 'once':
            start_date_str = self.start_date.strftime('%B %d, %Y')
            return f"{start_date_str} from {start_time_str} to {end_time_str}"

        # For recurring events
        start_date_str = self.start_date.strftime('%B %d, %Y')
        end_date_str = self.end_date.strftime('%B %d, %Y')

        schedule_parts = []

        # Add periodicity information
        if self.periodicity == 'daily':
            if self.interval == 1:
                schedule_parts.append("Daily")
            else:
                schedule_parts.append(f"Every {self.interval} days")

        elif self.periodicity in ['weekly', 'biweekly']:
            if self.weekdays:
                weekday_names = [self.WEEKDAY_CHOICES[wd][1] for wd in self.weekdays]
                if self.periodicity == 'weekly':
                    if self.interval == 1:
                        schedule_parts.append(f"Every {', '.join(weekday_names)}")
                    else:
                        schedule_parts.append(f"Every {self.interval} weeks on {', '.join(weekday_names)}")
                else:  # biweekly
                    schedule_parts.append(f"Every other week on {', '.join(weekday_names)}")
            else:
                if self.periodicity == 'weekly':
                    schedule_parts.append("Weekly" if self.interval == 1 else f"Every {self.interval} weeks")
                else:
                    schedule_parts.append("Biweekly")

        elif self.periodicity == 'monthly':
            if self.week_of_month is not None and self.weekdays:
                weekday_name = self.WEEKDAY_CHOICES[self.weekdays[0]][1]
                week_name = dict(self.WEEK_OF_MONTH_CHOICES)[self.week_of_month]
                schedule_parts.append(f"{week_name} {weekday_name} of every month")
            else:
                if self.interval == 1:
                    schedule_parts.append("Monthly")
                else:
                    schedule_parts.append(f"Every {self.interval} months")

        elif self.periodicity == 'custom':
            if self.weekdays:
                weekday_names = [self.WEEKDAY_CHOICES[wd][1] for wd in self.weekdays]
                schedule_parts.append(f"Custom schedule: {', '.join(weekday_names)}")
            else:
                schedule_parts.append("Custom schedule")

        # Combine all parts
        schedule_str = ' '.join(schedule_parts)
        return (f"{schedule_str} from {start_date_str} to {end_date_str}, "
                f"{start_time_str} - {end_time_str}")

    def get_schedule_description(self):
        """Get a detailed description of the schedule for admin purposes"""
        description = [f"Period: {self.get_periodicity_display()}"]

        if self.interval > 1:
            description.append(f"Interval: Every {self.interval}")

        if self.weekdays:
            weekday_names = [self.WEEKDAY_CHOICES[wd][1] for wd in self.weekdays]
            description.append(f"Weekdays: {', '.join(weekday_names)}")

        if self.week_of_month is not None:
            week_name = dict(self.WEEK_OF_MONTH_CHOICES)[self.week_of_month]
            description.append(f"Week of month: {week_name}")

        if self.exclude_dates:
            description.append(f"Excluded dates: {len(self.exclude_dates)} dates")

        return ' | '.join(description)

    def get_calendar_export_data(self, format_type='ics'):
        """Generate calendar export data in various formats"""
        from urllib.parse import quote

        # If start_time or end_time is missing, cannot generate calendar events
        if not self.start_time or not self.end_time:
            return [] if format_type in ['google', 'outlook'] else None

        # Get next occurrences for calendar events
        occurrences = self.get_next_occurrences(limit=50)

        if format_type == 'google':
            # Google Calendar URL format
            events = []
            for occurrence in occurrences:
                start_datetime = f"{occurrence.strftime('%Y%m%d')}T{self.start_time.strftime('%H%M%S')}"
                end_datetime = f"{occurrence.strftime('%Y%m%d')}T{self.end_time.strftime('%H%M%S')}"

                url = (f"https://calendar.google.com/calendar/render?"
                       f"action=TEMPLATE&"
                       f"text={quote(self.title)}&"
                       f"dates={start_datetime}/{end_datetime}&"
                       f"details={quote(self.description)}&"
                       f"location={quote(self.location)}")
                events.append({
                    'date': occurrence,
                    'url': url
                })
            return events

        elif format_type == 'outlook':
            # Outlook/Office 365 URL format
            events = []
            for occurrence in occurrences:
                start_datetime = f"{occurrence.strftime('%Y-%m-%d')}T{self.start_time.strftime('%H:%M:%S')}"
                end_datetime = f"{occurrence.strftime('%Y-%m-%d')}T{self.end_time.strftime('%H:%M:%S')}"

                url = (f"https://outlook.live.com/calendar/0/deeplink/compose?"
                       f"subject={quote(self.title)}&"
                       f"startdt={start_datetime}&"
                       f"enddt={end_datetime}&"
                       f"body={quote(self.description)}&"
                       f"location={quote(self.location)}")
                events.append({
                    'date': occurrence,
                    'url': url
                })
            return events

        elif format_type == 'ics':
            # iCalendar format for Apple Calendar and others
            ics_content = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Ordinaly//Course Calendar//EN",
                "CALSCALE:GREGORIAN",
            ]

            for i, occurrence in enumerate(occurrences):
                start_datetime = f"{occurrence.strftime('%Y%m%d')}T{self.start_time.strftime('%H%M%S')}"
                end_datetime = f"{occurrence.strftime('%Y%m%d')}T{self.end_time.strftime('%H%M%S')}"

                ics_content.extend([
                    "BEGIN:VEVENT",
                    f"UID:course-{self.id}-{i}@ordinaly.ai",
                    f"DTSTART:{start_datetime}",
                    f"DTEND:{end_datetime}",
                    f"SUMMARY:{self.title}",
                    f"DESCRIPTION:{self.description}",
                    f"LOCATION:{self.location}",
                    "END:VEVENT"
                ])

            ics_content.append("END:VCALENDAR")
            return '\n'.join(ics_content)

        return None

    def get_next_occurrences(self, limit=10):
        """Get the next occurrences of this course with advanced scheduling support"""
        # If start_date or end_date is missing, or if start_time or end_time is missing, return []
        if not self.start_date or not self.end_date or not self.start_time or not self.end_time:
            return []

        occurrences = []
        current_date = self.start_date
        exclude_dates = ([datetime.strptime(d, '%Y-%m-%d').date()
                         for d in self.exclude_dates] if self.exclude_dates else [])

        while current_date <= self.end_date and len(occurrences) < limit:
            should_include = False

            if self.periodicity == 'once':
                should_include = current_date == self.start_date

            elif self.periodicity == 'daily':
                days_diff = (current_date - self.start_date).days
                should_include = days_diff % self.interval == 0

            elif self.periodicity in ['weekly', 'biweekly']:
                # Check if current date matches any of the specified weekdays
                if self.weekdays and current_date.weekday() in self.weekdays:
                    weeks_diff = (current_date - self.start_date).days // 7
                    interval_weeks = 2 if self.periodicity == 'biweekly' else 1
                    interval_weeks *= self.interval
                    should_include = weeks_diff % interval_weeks == 0
                elif not self.weekdays:
                    # Fallback to original start date weekday
                    if current_date.weekday() == self.start_date.weekday():
                        weeks_diff = (current_date - self.start_date).days // 7
                        interval_weeks = 2 if self.periodicity == 'biweekly' else 1
                        interval_weeks *= self.interval
                        should_include = weeks_diff % interval_weeks == 0

            elif self.periodicity == 'monthly':
                if self.week_of_month is not None and self.weekdays:
                    # Complex monthly pattern: e.g., "First Monday of every month"
                    target_weekday = self.weekdays[0] if self.weekdays else current_date.weekday()
                    should_include = self._is_nth_weekday_of_month(
                        current_date, target_weekday, self.week_of_month
                    )
                else:
                    # Simple monthly: same day of month
                    if current_date.day == self.start_date.day:
                        months_diff = ((current_date.year - self.start_date.year) * 12 +
                                       current_date.month - self.start_date.month)
                        should_include = months_diff % self.interval == 0

            elif self.periodicity == 'custom':
                # For custom patterns, you might want to implement more complex logic
                # For now, we'll use the basic weekly pattern as fallback
                if self.weekdays and current_date.weekday() in self.weekdays:
                    should_include = True

            # Include if criteria met, not in exclude list, and in the future
            if (should_include and
                current_date not in exclude_dates and
                    current_date >= datetime.now().date()):
                occurrences.append(current_date)

            # Move to next day
            current_date += timedelta(days=1)

            # Safety break for one-time events
            if self.periodicity == 'once':
                break

        return occurrences

    def _is_nth_weekday_of_month(self, date, target_weekday, week_of_month):
        """Check if date is the nth occurrence of target_weekday in its month"""
        import calendar

        if date.weekday() != target_weekday:
            return False

        # Get all occurrences of this weekday in the month
        year, month = date.year, date.month
        first_day = datetime(year, month, 1).date()
        last_day = datetime(year, month, calendar.monthrange(year, month)[1]).date()

        weekday_dates = []
        current = first_day
        while current <= last_day:
            if current.weekday() == target_weekday:
                weekday_dates.append(current)
            current += timedelta(days=1)

        if week_of_month == -1:  # Last occurrence
            return date == weekday_dates[-1] if weekday_dates else False
        elif 1 <= week_of_month <= len(weekday_dates):
            return date == weekday_dates[week_of_month - 1]

        return False

    def save(self, *args, **kwargs):
        # Ensure draft default
        if self.draft is None:
            self.draft = False
        # Auto-generate slug from title if not provided
        if not self.slug and self.title:
            base_slug = slugify(self.title)[:100]
            slug_candidate = base_slug
            i = 1
            # Ensure uniqueness
            while Course.objects.filter(slug=slug_candidate).exclude(pk=self.pk).exists():
                slug_candidate = f"{base_slug}-{i}"
                # ensure slug max length
                if len(slug_candidate) > 110:
                    slug_candidate = slug_candidate[:110]
                i += 1
            self.slug = slug_candidate
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
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True,
                                                help_text="Stripe PaymentIntent ID for paid enrollments.")

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"
