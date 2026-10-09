"""Project conventions that are cheap to break by accident.

API responses, validation errors, model help texts and the Django admin are internal
and always English: the frontend translates the messages it shows to users. Only content
meant for end users (the emails and the demo seed data) may be in Spanish.
"""
import ast
import re
from pathlib import Path

from django.conf import settings
from django.test import SimpleTestCase

BACKEND_DIR = Path(settings.BASE_DIR)

# End-user content, Spanish by design: email subjects and the development seed data.
SPANISH_ALLOWED = {
    "users/services/email_service.py",
    "api/management/commands/populate_db.py",
}
SKIPPED_DIRS = {"migrations", ".venv", "venv", "__pycache__", "staticfiles", "media", "templates"}
SPANISH_MARKERS = re.compile(r"[áéíóúñÁÉÍÓÚÑ¿¡]")


def _source_files():
    for path in BACKEND_DIR.rglob("*.py"):
        relative = path.relative_to(BACKEND_DIR)
        if SKIPPED_DIRS.intersection(relative.parts):
            continue
        if path.name.startswith("test") or path.name.endswith("_tests.py"):
            continue
        yield relative


class EnglishInternalTextTests(SimpleTestCase):
    def test_django_always_runs_in_english(self):
        # Without LocaleMiddleware the language never follows the request's Accept-Language,
        # so DRF and the Django admin always answer in LANGUAGE_CODE.
        self.assertEqual(settings.LANGUAGE_CODE, "en-us")
        self.assertNotIn("django.middleware.locale.LocaleMiddleware", settings.MIDDLEWARE)

    def test_no_spanish_text_in_backend_code(self):
        offenders = []
        for relative in _source_files():
            if relative.as_posix() in SPANISH_ALLOWED:
                continue
            tree = ast.parse((BACKEND_DIR / relative).read_text(encoding="utf-8"))
            for node in ast.walk(tree):
                if isinstance(node, ast.Constant) and isinstance(node.value, (str, bytes)):
                    text = node.value if isinstance(node.value, str) else node.value.decode("utf-8", "ignore")
                    if SPANISH_MARKERS.search(text):
                        offenders.append(f"{relative}:{node.lineno}: {text[:70]!r}")
        self.assertEqual(offenders, [], "API/admin texts must be in English:\n" + "\n".join(offenders))
