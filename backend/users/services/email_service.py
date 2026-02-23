import requests
from django.conf import settings

class EmailServiceError(Exception):
    pass

def send_verification_email(email: str, code: str):
    #send email through BillionMail
    try:
        payload = {
            "to": email,
            "template_id": "template_sign_in_verification",  # template
            "variables": {
                "code": code
            }
        }
        headers = {
            "Authorization": f"Bearer {settings.BILLIONMAIL_API_KEY}",
            "Content-Type": "application/json"
        }
        response = requests.post(
            f"{settings.BILLIONMAIL_BASE_URL}/send",
            json=payload,
            headers=headers,
            timeout=10
        )

        if response.status_code >= 400:
            raise EmailServiceError("Error enviando correo de verificación")

    except Exception as e:
        raise EmailServiceError("No se pudo enviar el correo de verificación") from e


def send_welcome_email(email: str):
    #welcome email
    try:
        payload = {
            "to": email,
            "template_id": "template_sign_up",  # template
            "variables": {}
        }

        headers = {
            "Authorization": f"Bearer {settings.BILLIONMAIL_API_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(
            f"{settings.BILLIONMAIL_BASE_URL}/send",
            json=payload,
            headers=headers,
            timeout=10
        )

        if response.status_code >= 400:
            raise EmailServiceError("Error enviando correo de bienvenida")

    except Exception as e:
        raise EmailServiceError("No se pudo enviar el correo de bienvenida") from e
