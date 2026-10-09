from datetime import datetime

from django.conf import settings
from django.utils import timezone

from .mail import send_branded_email


class EmailServiceError(Exception):
    pass


def _send(email: str, subject: str, template: str, error: str, **context):
    try:
        send_branded_email(to=email, subject=subject, template_name=template, **context)
    except Exception as e:
        raise EmailServiceError(error) from e


def _frontend_url(path: str) -> str:
    return f"{settings.FRONTEND_BASE_URL.rstrip('/')}{path}"


def _date_range(course) -> str:
    if not course.start_date:
        return ""
    text = course.start_date.strftime("%d/%m/%Y")
    if course.end_date and course.end_date != course.start_date:
        text += f" - {course.end_date.strftime('%d/%m/%Y')}"
    return text


def _time_range(course) -> str:
    if not course.start_time:
        return ""
    text = course.start_time.strftime("%H:%M")
    if course.end_time:
        text += f" - {course.end_time.strftime('%H:%M')}"
    return text


def _session_text(session_start_iso: str) -> str:
    """'2026-10-20T10:00:00+02:00' -> '20/10/2026 a las 10:00' (project time zone)."""
    if not session_start_iso:
        return session_start_iso
    try:
        session_dt = datetime.fromisoformat(session_start_iso)
        if timezone.is_aware(session_dt):
            session_dt = timezone.localtime(session_dt)
        return session_dt.strftime("%d/%m/%Y a las %H:%M")
    except Exception:
        return session_start_iso


def send_verification_email(email: str, code: str):
    _send(
        email, "Código de verificación - Ordinaly", "verification",
        "Could not send the verification email",
        code=code, ttl_minutes=settings.EMAIL_OTP_TTL_MINUTES,
    )


def send_welcome_email(email: str, user_name: str):
    _send(
        email, "Bienvenido a Ordinaly", "welcome",
        "Could not send the welcome email",
        user_name=user_name,
    )


def send_newsletter_confirmation_email(email: str, token: str):
    _send(
        email, "Confirma tu suscripción a la newsletter - Ordinaly", "newsletter_confirmation",
        "Could not send the newsletter confirmation email",
        confirm_url=_frontend_url(f"/newsletter/confirm?token={token}"),
    )


def send_password_reset_email(email: str, token: str, user_name: str):
    _send(
        email, "Restablecer contraseña - Ordinaly", "password_reset",
        "Could not send the password reset email",
        user_name=user_name,
        reset_url=_frontend_url(f"/reset-password/confirm?token={token}"),
    )


def send_email_updated_email(email: str, user_name: str, previous_email: str, new_email: str):
    _send(
        email, "Correo actualizado - Ordinaly", "email_updated",
        "Could not send the email update notice",
        user_name=user_name, previous_email=previous_email, new_email=new_email,
    )


def send_password_reset_completed_email(email: str, user_name: str):
    _send(
        email, "Contraseña restablecida - Ordinaly", "password_reset_completed",
        "Could not send the password reset confirmation email",
        user_name=user_name,
    )


def send_delete_confirmation_email(email: str, token: str, user_name: str):
    """Send the account-deletion confirmation email (double opt-in for account removal)."""
    _send(
        email, "Confirmar eliminación de cuenta - Ordinaly", "delete_confirmation",
        "Could not send the account deletion confirmation email",
        user_name=user_name,
        confirm_url=_frontend_url(f"/delete_account/confirm?token={token}"),
        keep_url=_frontend_url("/profile"),
    )


def send_enrollment_confirmation_email(email: str, user_name: str, course):
    """Send a confirmation email when a user successfully enrolls in a course."""
    image_url = f"{settings.BACKEND_BASE_URL.rstrip('/')}{course.image.url}" if course.image else ""
    _send(
        email, f"Inscripción confirmada - {course.title}", "enrollment",
        "Could not send the enrollment confirmation email",
        user_name=user_name,
        course=course,
        course_url=_frontend_url(f"/formacion/{course.slug}"),
        image_url=image_url,
        date_str=_date_range(course),
        time_str=_time_range(course),
        max_seats=course.max_attendants or "—",
    )


def send_unenrollment_confirmation_email(email: str, user_name: str, course):
    """Send a confirmation email when a user unenrolls from a course."""
    _send(
        email, f"Inscripción cancelada - {course.title}", "unenrollment",
        "Could not send the unenrollment confirmation email",
        user_name=user_name,
        course=course,
        formation_url=_frontend_url("/formacion"),
        date_str=_date_range(course),
    )


def send_course_published_email(email: str, user_name: str, course):
    _send(
        email, f"Nueva formación - {course.title}", "course_published",
        "Could not send the new course email",
        user_name=user_name, course=course,
        course_url=_frontend_url(f"/formacion/{course.slug}"),
    )


def send_course_starts_soon_email(email: str, user_name: str, course, session_start_iso: str, days_before: int):
    _send(
        email, f"Empieza pronto - {course.title}", "course_starts_soon",
        "Could not send the course starting soon notice",
        user_name=user_name, course=course, days_before=days_before,
        course_url=_frontend_url(f"/formacion/{course.slug}"),
        session_text=_session_text(session_start_iso),
    )


def send_course_reminder_email(email: str, user_name: str, course, session_start_iso: str, hours_before: int):
    _send(
        email, f"Recordatorio {hours_before}h - {course.title}", "course_reminder",
        "Could not send the course reminder",
        user_name=user_name, course=course, hours_before=hours_before,
        course_url=_frontend_url(f"/formacion/{course.slug}"),
        session_text=_session_text(session_start_iso),
    )
