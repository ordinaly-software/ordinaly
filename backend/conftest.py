# conftest.py
import os
import pytest
import dj_database_url

TEST_DB_URL = os.getenv("TEST_DATABASE_URL")


@pytest.fixture(scope="session")
def django_db_setup():
    """
    Indica a pytest-django qué DB usar en tests.
    Evita que coja la DATABASE_URL "real" del settings.
    """
    from django.conf import settings
    settings.DATABASES['default'] = dj_database_url.parse(
        TEST_DB_URL,
        conn_max_age=0,           # sin pooling en tests
        conn_health_checks=True,
    )
    # Opcionalmente puedes reducir verbosidad de constraints
    settings.DATABASES['default']['ATOMIC_REQUESTS'] = False
