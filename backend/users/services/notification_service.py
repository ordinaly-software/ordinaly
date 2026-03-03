import logging
from datetime import datetime, time, timedelta, timezone as dt_timezone
from typing import Optional
from zoneinfo import ZoneInfo

from django.conf import settings
from django.db import IntegrityError
from django.utils import timezone

from users.models import CustomUser, EmailNotificationJob


logger = logging.getLogger(__name__)

NOTIFICATION_ACCOUNT_CREATED = "account_created"
NOTIFICATION_EMAIL_UPDATED = "email_updated"
NOTIFICATION_PASSWORD_RESET_COMPLETED = "password_reset_completed"
NOTIFICATION_COURSE_ENROLLED = "course_enrolled"
NOTIFICATION_COURSE_UNENROLLED = "course_unenrolled"
NOTIFICATION_COURSE_PUBLISHED = "course_published"
NOTIFICATION_COURSE_STARTS_SOON = "course_starts_soon"
NOTIFICATION_COURSE_REMINDER_24H = "course_reminder_24h"

COMPULSORY_NOTIFICATION_TYPES = {
    NOTIFICATION_ACCOUNT_CREATED,
    NOTIFICATION_EMAIL_UPDATED,
    NOTIFICATION_PASSWORD_RESET_COMPLETED,
    NOTIFICATION_COURSE_ENROLLED,
    NOTIFICATION_COURSE_UNENROLLED,
    NOTIFICATION_COURSE_REMINDER_24H,
}

OPTIONAL_NOTIFICATION_FIELDS = {
    NOTIFICATION_COURSE_PUBLISHED: "course_email_notifications",
    NOTIFICATION_COURSE_STARTS_SOON: "course_email_notifications",
}


def _display_name(user) -> str:
    return (getattr(user, "name", "") or getattr(user, "username", "") or "").strip()


def user_allows_notification(user, notification_type: str) -> bool:
    if not user or not getattr(user, "email", None):
        return False
    if notification_type in COMPULSORY_NOTIFICATION_TYPES:
        return True
    field_name = OPTIONAL_NOTIFICATION_FIELDS.get(notification_type)
    if not field_name:
        return False
    return bool(getattr(user, field_name, True))


def queue_email_notification(
    user,
    notification_type: str,
    *,
    scheduled_for=None,
    unique_key: Optional[str] = None,
    force: bool = False,
    **payload,
):
    if not force and not user_allows_notification(user, notification_type):
        return None

    recipient_email = payload.pop("recipient_email", None) or getattr(user, "email", None)
    if not recipient_email:
        return None

    job_data = {
        "user": user,
        "notification_type": notification_type,
        "recipient_email": recipient_email,
        "payload": payload,
        "scheduled_for": scheduled_for or timezone.now(),
    }

    if unique_key:
        try:
            job, _ = EmailNotificationJob.objects.get_or_create(unique_key=unique_key, defaults=job_data)
            return job
        except IntegrityError:
            return EmailNotificationJob.objects.filter(unique_key=unique_key).first()

    return EmailNotificationJob.objects.create(**job_data)


def queue_account_created_notification(user):
    return queue_email_notification(
        user,
        NOTIFICATION_ACCOUNT_CREATED,
        user_name=_display_name(user),
    )


def queue_and_dispatch_account_created_notification(user):
    job = queue_account_created_notification(user)
    dispatch_email_job_now(job)
    return job


def queue_email_updated_notification(user, previous_email: str):
    if not previous_email or previous_email.strip().lower() == (user.email or "").strip().lower():
        return None
    return queue_email_notification(
        user,
        NOTIFICATION_EMAIL_UPDATED,
        user_name=_display_name(user),
        previous_email=previous_email,
        new_email=user.email,
    )


def queue_and_dispatch_email_updated_notification(user, previous_email: str):
    job = queue_email_updated_notification(user, previous_email)
    dispatch_email_job_now(job)
    return job


def queue_password_reset_completed_notification(user):
    return queue_email_notification(
        user,
        NOTIFICATION_PASSWORD_RESET_COMPLETED,
        user_name=_display_name(user),
    )


def queue_and_dispatch_password_reset_completed_notification(user):
    job = queue_password_reset_completed_notification(user)
    dispatch_email_job_now(job)
    return job


def queue_course_enrollment_notification(user, course):
    return queue_email_notification(
        user,
        NOTIFICATION_COURSE_ENROLLED,
        user_name=_display_name(user),
        course_id=course.id,
    )


def queue_course_unenrollment_notification(user, course):
    return queue_email_notification(
        user,
        NOTIFICATION_COURSE_UNENROLLED,
        user_name=_display_name(user),
        course_id=course.id,
    )


def _course_notification_recipients():
    return CustomUser.objects.filter(
        is_active=True,
        course_email_notifications=True,
    ).exclude(email="")


def queue_course_published_notifications(course):
    if getattr(course, "draft", True):
        return 0

    queued = 0
    for user in _course_notification_recipients():
        unique_key = f"course-published:{course.pk}:{user.pk}"
        job = queue_email_notification(
            user,
            NOTIFICATION_COURSE_PUBLISHED,
            unique_key=unique_key,
            user_name=_display_name(user),
            course_id=course.id,
        )
        if job:
            queued += 1
    return queued


def _course_session_start(course, occurrence_date):
    session_time = course.start_time or time(0, 0)
    tz_name = getattr(course, "timezone", None) or settings.TIME_ZONE
    try:
        tzinfo = ZoneInfo(tz_name)
    except Exception:
        tzinfo = timezone.get_current_timezone()

    naive = datetime.combine(occurrence_date, session_time)
    return timezone.make_aware(naive, tzinfo)


def _course_initial_start(course):
    if not getattr(course, "start_date", None):
        return None
    return _course_session_start(course, course.start_date)


def _queue_course_reminder(user, course, session_start):
    unique_key = (
        f"course-reminder:{user.pk}:{course.pk}:"
        f"{session_start.astimezone(dt_timezone.utc).isoformat()}:24"
    )
    return queue_email_notification(
        user,
        NOTIFICATION_COURSE_REMINDER_24H,
        unique_key=unique_key,
        user_name=_display_name(user),
        course_id=course.id,
        session_start=session_start.isoformat(),
        hours_before=24,
    )


def enqueue_due_course_notifications(*, now=None, lookahead_minutes: int = 1):
    from courses.models import Course, Enrollment

    now = now or timezone.now()
    window_end = now + timedelta(minutes=lookahead_minutes)
    enqueued = 0

    courses = Course.objects.filter(draft=False)
    recipients = list(_course_notification_recipients())

    for course in courses:
        initial_start = _course_initial_start(course)
        if initial_start:
            starts_soon_at = initial_start - timedelta(days=7)
            if now <= starts_soon_at < window_end:
                for user in recipients:
                    unique_key = f"course-starts-soon:{course.pk}:{user.pk}"
                    job = queue_email_notification(
                        user,
                        NOTIFICATION_COURSE_STARTS_SOON,
                        unique_key=unique_key,
                        user_name=_display_name(user),
                        course_id=course.id,
                        session_start=initial_start.isoformat(),
                        days_before=7,
                    )
                    if job:
                        enqueued += 1

    enrollments = Enrollment.objects.select_related("user", "course").all()
    for enrollment in enrollments:
        user = enrollment.user
        course = enrollment.course
        if not course.start_date or not course.end_date or not course.start_time:
            continue

        for occurrence in course.get_next_occurrences(limit=366):
            session_start = _course_session_start(course, occurrence)
            reminder_at = session_start - timedelta(hours=24)
            if not (now <= reminder_at < window_end):
                continue
            job = _queue_course_reminder(user, course, session_start)
            if job:
                enqueued += 1

    return enqueued


def enqueue_due_course_reminders(*, now=None, lookahead_minutes: int = 1):
    return enqueue_due_course_notifications(
        now=now,
        lookahead_minutes=lookahead_minutes,
    )


def _send_job(job: EmailNotificationJob):
    from courses.models import Course
    from users.services.email_service import (
        send_course_published_email,
        send_course_reminder_email,
        send_course_starts_soon_email,
        send_email_updated_email,
        send_password_reset_completed_email,
        send_unenrollment_confirmation_email,
        send_enrollment_confirmation_email,
        send_welcome_email,
    )

    payload = job.payload or {}

    if job.notification_type == NOTIFICATION_ACCOUNT_CREATED:
        send_welcome_email(job.recipient_email, payload.get("user_name", ""))
        return

    if job.notification_type == NOTIFICATION_EMAIL_UPDATED:
        send_email_updated_email(
            job.recipient_email,
            payload.get("user_name", ""),
            payload.get("previous_email", ""),
            payload.get("new_email", job.recipient_email),
        )
        return

    if job.notification_type == NOTIFICATION_PASSWORD_RESET_COMPLETED:
        send_password_reset_completed_email(job.recipient_email, payload.get("user_name", ""))
        return

    if job.notification_type in {NOTIFICATION_COURSE_ENROLLED, NOTIFICATION_COURSE_UNENROLLED}:
        course = Course.objects.get(pk=payload["course_id"])
        user_name = payload.get("user_name", "")
        if job.notification_type == NOTIFICATION_COURSE_ENROLLED:
            send_enrollment_confirmation_email(job.recipient_email, user_name, course)
        else:
            send_unenrollment_confirmation_email(job.recipient_email, user_name, course)
        return

    if job.notification_type == NOTIFICATION_COURSE_PUBLISHED:
        course = Course.objects.get(pk=payload["course_id"])
        send_course_published_email(
            job.recipient_email,
            payload.get("user_name", ""),
            course,
        )
        return

    if job.notification_type == NOTIFICATION_COURSE_STARTS_SOON:
        course = Course.objects.get(pk=payload["course_id"])
        send_course_starts_soon_email(
            job.recipient_email,
            payload.get("user_name", ""),
            course,
            payload.get("session_start"),
            int(payload.get("days_before", 7)),
        )
        return

    if job.notification_type == NOTIFICATION_COURSE_REMINDER_24H:
        course = Course.objects.get(pk=payload["course_id"])
        send_course_reminder_email(
            job.recipient_email,
            payload.get("user_name", ""),
            course,
            payload.get("session_start"),
            24,
        )
        return

    raise ValueError(f"Unsupported notification type: {job.notification_type}")


def dispatch_email_job_now(job: Optional[EmailNotificationJob]) -> bool:
    if not job:
        return False

    claimed = EmailNotificationJob.objects.filter(
        pk=job.pk,
        status=EmailNotificationJob.STATUS_PENDING,
    ).update(
        status=EmailNotificationJob.STATUS_PROCESSING,
        last_error="",
    )
    if not claimed:
        current_status = EmailNotificationJob.objects.filter(pk=job.pk).values_list("status", flat=True).first()
        return current_status == EmailNotificationJob.STATUS_SENT

    job.refresh_from_db()

    try:
        _send_job(job)
    except Exception as exc:
        attempts = job.attempts + 1
        update_fields = {
            "attempts": attempts,
            "last_error": str(exc)[:2000],
        }
        if attempts < job.max_attempts:
            retry_delay = min(30, 2 ** max(attempts - 1, 0))
            update_fields["status"] = EmailNotificationJob.STATUS_PENDING
            update_fields["scheduled_for"] = timezone.now() + timedelta(minutes=retry_delay)
        else:
            update_fields["status"] = EmailNotificationJob.STATUS_FAILED
        EmailNotificationJob.objects.filter(pk=job.pk).update(**update_fields)
        raise

    EmailNotificationJob.objects.filter(pk=job.pk).update(
        attempts=job.attempts + 1,
        status=EmailNotificationJob.STATUS_SENT,
        sent_at=timezone.now(),
        last_error="",
    )
    return True


def process_pending_email_jobs(*, limit: int = 100, now=None):
    now = now or timezone.now()
    processed = 0
    sent = 0
    failed = 0

    candidates = EmailNotificationJob.objects.filter(
        status=EmailNotificationJob.STATUS_PENDING,
        scheduled_for__lte=now,
    ).order_by("scheduled_for", "id")[:limit]

    for job in candidates:
        claimed = EmailNotificationJob.objects.filter(
            pk=job.pk,
            status=EmailNotificationJob.STATUS_PENDING,
        ).update(status=EmailNotificationJob.STATUS_PROCESSING)
        if not claimed:
            continue

        job.refresh_from_db()
        processed += 1
        try:
            _send_job(job)
            job.attempts += 1
            job.status = EmailNotificationJob.STATUS_SENT
            job.sent_at = timezone.now()
            job.last_error = ""
            job.save(update_fields=["attempts", "status", "sent_at", "last_error", "updated_at"])
            sent += 1
        except Exception as exc:
            job.attempts += 1
            job.last_error = str(exc)[:2000]
            if job.attempts < job.max_attempts:
                retry_delay = min(30, 2 ** max(job.attempts - 1, 0))
                job.status = EmailNotificationJob.STATUS_PENDING
                job.scheduled_for = timezone.now() + timedelta(minutes=retry_delay)
                job.save(
                    update_fields=[
                        "attempts",
                        "last_error",
                        "status",
                        "scheduled_for",
                        "updated_at",
                    ]
                )
            else:
                job.status = EmailNotificationJob.STATUS_FAILED
                job.save(update_fields=["attempts", "last_error", "status", "updated_at"])
                failed += 1
            logger.exception("Failed to process email notification job %s", job.pk)

    return {
        "processed": processed,
        "sent": sent,
        "failed": failed,
    }
