#!/bin/sh
set -e

# Las migraciones están en .gitignore (solo se versiona __init__.py), así que
# en un clon limpio hay que generarlas antes de aplicarlas. Con el bind mount
# quedan en ./backend/*/migrations, igual que en un entorno local sin Docker.
python manage.py makemigrations --noinput
python manage.py migrate --noinput

exec "$@"
