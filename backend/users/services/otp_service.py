import hashlib
import random
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from ..models import EmailVerificationOTP

def generate_otp_code():
    return f"{random.randint(0, 999999):06d}"

def hash_code(code: str):
    return hashlib.sha256(code.encode()).hexdigest()

def create_otp_for_user(user):
    # invalidate previous
    EmailVerificationOTP.objects.filter(user=user, invalidated_at__isnull=True).update(
        invalidated_at=timezone.now()
    )

    code = generate_otp_code()
    code_hash = hash_code(code)

    otp = EmailVerificationOTP.objects.create(
        user=user,
        code_hash=code_hash,
        expires_at=timezone.now() + timedelta(minutes=settings.EMAIL_OTP_TTL_MINUTES),
        resend_count=0,
        attempts=0,
        last_sent_at=timezone.now()
    )

    return code, otp

def validate_otp(user, code):
    otp = EmailVerificationOTP.objects.filter(
        user=user,
        invalidated_at__isnull=True
    ).order_by("-created_at").first()

    if not otp:
        return False, "NO_OTP"

    if otp.is_expired():
        return False, "EXPIRED"

    if otp.attempts >= settings.EMAIL_OTP_MAX_ATTEMPTS:
        return False, "TOO_MANY_ATTEMPTS"

    if hash_code(code) != otp.code_hash:
        otp.attempts += 1
        otp.save()
        return False, "INVALID"

    otp.invalidated_at = timezone.now()
    otp.save()
    return True, "OK"
