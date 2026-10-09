import os
import random
from datetime import date, time, timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from courses.models import Course, Enrollment
from users.models import CustomUser

User = get_user_model()

PASSWORD = os.environ.get("ORDINALY_TEST_PASSWORD")

# Demo accounts are tagged with this email domain so they can be told apart
# from real users when clearing data.
DEMO_EMAIL_DOMAIN = "example.com"
DEMO_USER_COUNT = 10
DEMO_ADMIN_USERNAME = "admin_test"
DEMO_TIMEZONE = "Europe/Madrid"


class Command(BaseCommand):
    help = 'Populate the database with sample data for testing'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing data before populating')
        parser.add_argument('--seed', type=int, help='Seed for reproducible pseudo-random data')

    def handle(self, *args, **options):
        if not PASSWORD:
            raise CommandError(
                'ORDINALY_TEST_PASSWORD is not set. Add it to your .env before running populate_db.'
            )

        if options.get('seed') is not None:
            random.seed(options['seed'])

        if options.get('clear'):
            self.stdout.write('Clearing existing data...')
            self.clear_data()

        created_users = self.create_mock_users()
        self.stdout.write(f'Created {created_users} demo users')

        courses = self.run_step('courses', self.create_courses)
        self.run_step('enrollments', self.create_enrollments, courses)

        self.stdout.write(self.style.SUCCESS('Successfully populated database with sample data!'))

    def run_step(self, label, func, *args):
        """Run a creation step, reporting how many objects were made or why it was skipped."""
        try:
            created = func(*args)
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Skipped {label} creation: {e}'))
            return []
        self.stdout.write(f'Created {len(created)} {label}')
        return created

    def create_mock_users(self):
        """Create demo users and an admin account, idempotently, if they don't already exist."""
        created = 0
        for i in range(1, DEMO_USER_COUNT + 1):
            _, was_created = CustomUser.objects.get_or_create(
                username=f"user{i}",
                defaults={
                    'email': f"user{i}@{DEMO_EMAIL_DOMAIN}",
                    'password': PASSWORD,
                    'name': f"User{i}",
                    'surname': "Demo",
                    'company': "DemoCorp",
                    'allow_notifications': False,
                    'status': 'active',
                    'email_verified_at': timezone.now(),
                },
            )
            if was_created:
                user = CustomUser.objects.get(username=f"user{i}")
                user.set_password(PASSWORD)
                user.save(update_fields=['password'])
                created += 1

        if not CustomUser.objects.filter(username=DEMO_ADMIN_USERNAME).exists():
            CustomUser.objects.create_superuser(  # type: ignore
                username=DEMO_ADMIN_USERNAME,
                email=f"admin@{DEMO_EMAIL_DOMAIN}",
                password=PASSWORD,
                name="Admin",
                surname="User",
                company="DemoCorp",
                allow_notifications=False,
                status='active',
                email_verified_at=timezone.now(),
            )
            created += 1

        return created

    def clear_data(self):
        """Clear existing demo data, associated media files, and demo user accounts."""
        try:
            # image is a plain FileField, not a relation, so
            # select_related/prefetch_related do not apply here.
            course_images = [
                course.image.path for course in Course.objects.only('image')  # NOSONAR
                if course.image and hasattr(course.image, 'path')
            ]

            Enrollment.objects.all().delete()
            self.stdout.write("Deleted all enrollments")

            Course.objects.all().delete()
            self.stdout.write("Deleted all courses")

            deleted_users, _ = CustomUser.objects.filter(
                email__iendswith=f"@{DEMO_EMAIL_DOMAIN}"
            ).delete()
            self.stdout.write(f"Deleted {deleted_users} demo users")

            for file_path in course_images:
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        self.stdout.write(f"Deleted file: {file_path}")
                    except OSError as e:
                        self.stdout.write(f"Error deleting file {file_path}: {e}")

        except Exception as e:
            self.stdout.write(f"Error during data cleanup: {e}")

    def create_courses(self):
        """Create sample courses with schedules relative to today, so seeded data never looks stale."""
        images_dir = os.path.join(settings.BASE_DIR, 'media', 'test_media', 'course_images')
        today = date.today()

        workshop_date = today + timedelta(days=14)
        session_date = today + timedelta(days=30)
        bootcamp_start = today + timedelta(days=60)
        # 4 weekly sessions starting on bootcamp_start's weekday
        bootcamp_end = bootcamp_start + timedelta(weeks=3)

        courses_data = [
            {
                'title': 'Taller gratuito "La Inteligencia artificial sin complicaciones"',
                'slug': 'taller-ia-sin-complicaciones',
                'subtitle': (
                    'Familiarízate con las webs y apps de IA del momento y aprende los conceptos básicos '
                    'con ejemplos prácticos.'
                ),
                'description': (
                    'Este taller va orientado a profesionales que busquen introducirse en el mundo de la IA '
                    'y quieran aprender los conceptos básicos de la *Inteligencia artificial Generativa*.\n'
                    'En este taller se abordarán temas como:\n'
                    '- Introducción a la IA y sus aplicaciones\n'
                    '- Herramientas y recursos para trabajar con IA\n'
                    '- Ejemplos prácticos de uso de IA en negocios\n'
                    '- Consideraciones de seguridad y privacidad en el uso de IA\n'
                    'Taller impartido por: \n'
                    '- 👨‍💻 *Antonio Macías* - joven ingeniero del software de Ordinaly \n'
                    '- 🧪 *Guillermo Montero* - ingeniero de calidad en Proinca Consultores \n\n'
                    'Organizado por **Ordinaly Software** en colaboración con '
                    '[Proinca Consultores](https://www.proincaconsultores.es) y '
                    '[Aviva Publicidad](https://avivapublicidad.es).\n'
                ),
                'price': None,
                'location': 'C. Aviación 39, Polígono Calonge, Sevilla 41007',
                'start_date': workshop_date,
                'end_date': workshop_date,
                'start_time': time(9, 30),
                'end_time': time(11, 30),
                'periodicity': 'once',
                'timezone': DEMO_TIMEZONE,
                'max_attendants': 25,
                'draft': False
            },
            {
                'title': 'Sesión formativa "La Inteligencia artificial en la inmobiliaria"',
                'slug': 'sesion-ia-en-la-inmobiliaria',
                'subtitle': (
                    'Sesión práctica de IA para inmobiliarias con automatización, captación y atención al cliente.'
                ),
                'description': (
                    '**¡IMPORTANTE!** Esta sesión está orientada a profesionales del sector inmobiliario '
                    'que quieran aplicar IA de forma práctica desde el primer día.\n\n'
                    'Trabajaremos casos reales como la atención de leads por WhatsApp, el seguimiento automático '
                    'de contactos, los resúmenes de visitas y la preparación de respuestas asistidas por IA.\n\n'
                    'También veremos:\n'
                    '- Casos de uso de la IA generativa en inmobiliarias\n'
                    '- Herramientas y recursos para trabajar con IA\n'
                    '- Automatizaciones para ventas, soporte y posventa\n'
                    '- Consideraciones de seguridad y privacidad en el uso de IA\n'
                    '- Impacto real de la IA en la operativa del negocio\n'
                    '- Próximos pasos para implantar flujos útiles en el equipo\n'
                    'Taller impartido por: \n'
                    '- 👨‍💻 *Antonio Macías* - ingeniero del software de Ordinaly \n'
                    '- 🧪 *Guillermo Montero* - ingeniero de calidad en Proinca Consultores \n\n'
                    'Organizado por **Ordinaly Software** en colaboración con '
                    '[Alianza Sevilla](https://alianzasevilla.com) y '
                    '[Aviva Publicidad](https://avivapublicidad.es).\n'
                ),
                'price': None,
                'location': 'Edif. Galia, Sala de Conferencias 1. C. José Delgado Brackenbury 11, Sevilla, 41007',
                'start_date': session_date,
                'end_date': session_date,
                'start_time': time(9, 30),
                'end_time': time(11, 30),
                'periodicity': 'once',
                'timezone': DEMO_TIMEZONE,
                'max_attendants': 90,
                'draft': False
            },
            {
                'title': 'Bootcamp "La Inteligencia artificial en la inmobiliaria"',
                'slug': 'bootcamp-ia-en-la-inmobiliaria',
                'subtitle': (
                    'En este curso partiremos de la base de los casos de uso básicos de las herramientas de IA '
                    'más conocidas e iremos escalando hasta dominar herramientas específicas para el sector '
                    'inmobiliario.'
                ),
                'description': (
                    'Este curso  está diseñado específicamente para profesionales del sector inmobiliario que '
                    'deseen aprovechar el potencial de la Inteligencia artificial generativa en su trabajo diario.\n\n'
                    'A lo largo de 4 sesiones, aprenderás desde los conceptos básicos hasta aplicaciones avanzadas, '
                    'con un enfoque práctico y casos de uso reales del sector inmobiliario.\n\n'
                    '## 📚 Programa del Curso\n\n'
                    '| Sesión | Contenido | Duración |\n'
                    '|---------|-----------|----------|\n'
                    '| **Sesión 1** | • Introducción a la IA y herramientas básicas<br>• ChatGPT y Copilot<br>'
                    '• Generación de descripciones de propiedades<br>• Ejercicios prácticos | 2.5h |\n'
                    '| **Sesión 2** | • Herramientas de edición de imágenes con IA<br>'
                    '• Mejora y retoque de fotografías inmobiliarias<br>• Generación de renders y visualizaciones<br>'
                    '• Taller práctico de edición | 2.5h |\n'
                    '| **Sesión 3** | • Marketing inmobiliario con IA<br>• Automatización de redes sociales. | 2.5h |\n'
                    '| **Sesión 4** | • Herramientas específicas del sector<br>• Análisis de mercado con IA<br>'
                    '• Búsqueda profunda. <br>• Creación de modelos personalizados. | 2.5h |\n\n'
                    '## 🎯 Objetivos del Curso\n\n'
                    '- Dominar las principales herramientas de IA aplicables al sector inmobiliario\n'
                    '- Mejorar la calidad y la cantidad del contenido y material promocional\n'
                    '- Incrementar la eficiencia en tareas repetitivas\n\n'
                    '## 👥 Dirigido a\n\n'
                    '- Agentes inmobiliarios\n'
                    '- Gestores de propiedades\n'
                    '- Profesionales del marketing inmobiliario\n\n'
                    '**Taller impartido por**: \n'
                    '- 👨‍💻 *Antonio Macías* - ingeniero del software de Ordinaly\n'
                    '- 🧪 *Guillermo Montero* - ingeniero de calidad en Proinca Consultores\n\n'
                    '**Incluye**: Material didáctico, certificado de finalización, '
                    'TODAS LAS HERRAMIENTAS DEL CURSO SERÁN GRATUITAS.'
                ),
                'price': 0.50,
                'location': '',
                'start_date': bootcamp_start,
                'end_date': bootcamp_end,
                'start_time': time(9, 30),
                'end_time': time(11, 30),
                'periodicity': 'weekly',
                'weekdays': [bootcamp_start.weekday()],
                'timezone': DEMO_TIMEZONE,
                'max_attendants': 90,
                'draft': False
            },
        ]

        # Already finished courses (spread over the last ~year) to exercise the
        # "past" cards and the show-more grid on the formation page.
        past_topics = [
            ('Taller "Automatización con n8n para pymes"', 'taller-n8n-pymes', None, 'C. Aviación 39, Polígono Calonge, Sevilla 41007'),
            ('Curso "Chatbots con IA para atención al cliente"', 'curso-chatbots-ia', 0.50, ''),
            ('Sesión "IA generativa para equipos comerciales"', 'sesion-ia-comerciales', None, 'Edif. Galia, Sala de Conferencias 1, Sevilla, 41007'),
            ('Bootcamp "Odoo desde cero"', 'bootcamp-odoo-desde-cero', 0.50, ''),
            ('Taller "Facturación automática con IA"', 'taller-facturacion-ia', None, 'C. Aviación 39, Polígono Calonge, Sevilla 41007'),
            ('Sesión "Ciberseguridad básica para pymes"', 'sesion-ciberseguridad-pymes', None, ''),
            ('Curso "Agentes de voz con IA"', 'curso-agentes-voz-ia', 0.50, ''),
            ('Taller "Redes sociales en piloto automático"', 'taller-redes-sociales-ia', None, 'Edif. Galia, Sala de Conferencias 1, Sevilla, 41007'),
        ]
        for n, (title, slug, price, location) in enumerate(past_topics, start=1):
            start = today - timedelta(days=35 * n)
            courses_data.append({
                'title': title,
                'slug': slug,
                'subtitle': 'Formación ya celebrada, creada como dato de prueba.',
                'description': f'{title}. Formación de ejemplo ya finalizada.',
                'price': price,
                'location': location,
                'start_date': start,
                'end_date': start,
                'start_time': time(9, 30),
                'end_time': time(11, 30),
                'periodicity': 'once',
                'timezone': DEMO_TIMEZONE,
                'max_attendants': 30,
                'draft': False,
            })

        courses = []
        for i, course_data in enumerate(courses_data):
            image_path = os.path.join(images_dir, f'test_course_{i % 3 + 1}.jpg')
            defaults = {**course_data}
            if os.path.exists(image_path):
                with open(image_path, 'rb') as f:
                    defaults['image'] = ContentFile(f.read(), name=f"course_{i % 3 + 1}.jpg")
            course, created = Course.objects.get_or_create(
                title=course_data['title'],
                defaults=defaults
            )
            if created:
                courses.append(course)
        return courses

    def create_enrollments(self, courses):
        """Create enrollments for existing demo users in eligible courses. No users are created or modified."""
        enrollments = []

        eligible_courses = [
            c for c in courses
            if c.start_date and c.end_date and c.start_time and c.end_time
        ]
        if not eligible_courses:
            return enrollments

        regular_users = list(CustomUser.objects.filter(is_staff=False))

        for user in regular_users:
            # Non-security demo data; reproducible via the --seed option.
            course = random.choice(eligible_courses)  # NOSONAR
            try:
                enrollment, created = Enrollment.objects.get_or_create(user=user, course=course)
            except Exception:
                continue
            if created:
                # enrolled_at is auto_now_add, so it must be backdated via update() after creation.
                # Non-security demo data; reproducible via the --seed option.
                days_ago = random.randint(1, 90)  # NOSONAR
                Enrollment.objects.filter(pk=enrollment.pk).update(
                    enrolled_at=timezone.now() - timedelta(days=days_ago)
                )
                enrollments.append(enrollment)

        return enrollments
