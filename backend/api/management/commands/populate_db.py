import os
import random
from datetime import date, time, timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from courses.models import Course, Enrollment
from services.models import Service
from terms.models import Terms
from users.models import CustomUser

User = get_user_model()

PASSWORD = os.environ.get("ORDINALY_TEST_PASSWORD")

# Demo accounts are tagged with this email domain so they can be told apart
# from real users when clearing data.
DEMO_EMAIL_DOMAIN = "example.com"
DEMO_USER_COUNT = 10
DEMO_ADMIN_USERNAME = "admin_test"


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

        self.run_step('terms', self.create_terms)
        courses = self.run_step('courses', self.create_courses)
        self.run_step('enrollments', self.create_enrollments, courses)
        self.run_step('services', self.create_services)

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
            terms_files = [
                term.pdf_content.path for term in Terms.objects.all()
                if term.pdf_content and hasattr(term.pdf_content, 'path')
            ]
            course_images = [
                course.image.path for course in Course.objects.all()
                if course.image and hasattr(course.image, 'path')
            ]

            Enrollment.objects.all().delete()
            self.stdout.write("Deleted all enrollments")

            Course.objects.all().delete()
            self.stdout.write("Deleted all courses")

            Service.objects.all().delete()
            self.stdout.write("Deleted all services")

            Terms.objects.all().delete()
            self.stdout.write("Deleted all terms")

            deleted_users, _ = CustomUser.objects.filter(
                email__iendswith=f"@{DEMO_EMAIL_DOMAIN}"
            ).delete()
            self.stdout.write(f"Deleted {deleted_users} demo users")

            for file_path in terms_files + course_images:
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        self.stdout.write(f"Deleted file: {file_path}")
                    except OSError as e:
                        self.stdout.write(f"Error deleting file {file_path}: {e}")

        except Exception as e:
            self.stdout.write(f"Error during data cleanup: {e}")

    def create_terms(self):
        admin_user = CustomUser.objects.filter(is_staff=True, is_superuser=True).first()
        if not admin_user:
            return []

        terms_dir = os.path.join(settings.BASE_DIR, 'media', 'test_media', 'terms')
        os.makedirs(terms_dir, exist_ok=True)

        term_files = [
            ('terms', 'Términos y Condiciones de Uso v1.0', '1.0'),
            ('privacy', 'Política de Privacidad v1.0', '1.0'),
            ('cookies', 'Política de Cookies v1.0', '1.0'),
            ('license', 'Acuerdo de Licencia de Software v1.0', '1.0'),
        ]
        terms = []
        for tag, name, version in term_files:
            pdf_path = os.path.join(terms_dir, f'{tag}_ordinaly.pdf')
            if not os.path.exists(pdf_path):
                self.stdout.write(f"Warning: PDF file not found at {pdf_path}")
                continue

            # Recreate terms with the same tag to avoid uniqueness constraint errors
            Terms.objects.filter(tag=tag).delete()

            with open(pdf_path, 'rb') as f:
                pdf_content = f.read()

            try:
                term = Terms.objects.create(
                    tag=tag,
                    name=name,
                    version=version,
                    author=admin_user,
                    pdf_content=ContentFile(pdf_content, name=f"{tag}.pdf"),
                )
                terms.append(term)
            except Exception as e:
                self.stdout.write(f"Error creating term {tag}: {e}")

        return terms

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
                'timezone': 'Europe/Madrid',
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
                'timezone': 'Europe/Madrid',
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
                'location': None,
                'start_date': bootcamp_start,
                'end_date': bootcamp_end,
                'start_time': time(9, 30),
                'end_time': time(11, 30),
                'periodicity': 'weekly',
                'weekdays': [bootcamp_start.weekday()],
                'timezone': 'Europe/Madrid',
                'max_attendants': 90,
                'draft': False
            },
        ]
        courses = []
        for i, course_data in enumerate(courses_data):
            image_path = os.path.join(images_dir, f'test_course_{i + 1}.jpg')
            defaults = {**course_data}
            if os.path.exists(image_path):
                with open(image_path, 'rb') as f:
                    defaults['image'] = ContentFile(f.read(), name=f"course_{i + 1}.jpg")
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
            course = random.choice(eligible_courses)
            try:
                enrollment, created = Enrollment.objects.get_or_create(user=user, course=course)
            except Exception:
                continue
            if created:
                # enrolled_at is auto_now_add, so it must be backdated via update() after creation.
                days_ago = random.randint(1, 90)
                Enrollment.objects.filter(pk=enrollment.pk).update(
                    enrolled_at=timezone.now() - timedelta(days=days_ago)
                )
                enrollments.append(enrollment)

        return enrollments

    def create_services(self):
        """Crea servicios de ejemplo detallados en español, con Markdown enriquecido."""
        services_data = [
            {
                'title': 'Chatbot de WhatsApp',
                'subtitle': 'Automatiza atención al cliente 24/7 con IA conversacional avanzada',
                'type': 'SERVICE',
                'description': '''
Automatiza la atención al cliente y las ventas a través de **WhatsApp Business API** de Meta con nuestra solución
 de chatbot inteligente. Proporciona respuestas instantáneas, gestiona consultas frecuentes y mejora la
 experiencia de usuario.

## ⚙️ Características Principales

| Funcionalidad               | Descripción                                                                 |
|-----------------------------|-----------------------------------------------------------------------------|
| 📊 **Personalización sencilla** | **Sólo necesitamos un teléfono y pdf con la información para el asistente.** |
| 💬 Respuestas Automáticas   | Atención 24/7 a preguntas frecuentes.                                       |
| 🤝 Transferencia a Operador | Deriva consultas complejas a tu equipo cuando sea necesario.                |

## 🚀 Beneficios

- 🔍 +30% en resolución en primer contacto
- ⏱️ -80% en tiempo de espera
''',
                'color': '141413',
                'icon': 'Phone',
                'duration': 5,
                'requisites': (
                    "- Documento tipo FAQ en formato pdf sobre tódo lo que debe saber el asisitente.   "
                    "- Número de teñefóno con cuenta de Whatsapp Business.    "
                    "- Disponibilidad para consultas.     "
                ),
                'price': None,
                'is_featured': True,
                'draft': False
            },
            {
                'title': 'Automatizaciones a Medida',
                'type': 'SERVICE',
                'subtitle': 'Integración con Odoo, Slack y herramientas empresariales',
                'description': '''
⚡ Conecta tus sistemas y optimiza procesos internos para ahorrar tiempo y eliminar errores manuales.

## 🔗 Integraciones Disponibles

| Herramienta       | Uso Típico                          |
|-------------------|-------------------------------------|
| Odoo           | Gestión de inventario y facturación |
| N8N               | Conexión con miles de apps          |
| Zapier         | Conexión con miles de apps          |
| Bases de Datos  | Sincronización de datos            |

## 📈 Impacto

- ⏱️ -50% tiempo en tareas repetitivas
- 🔄 Flujos más fiables y trazables
- 💡 Equipo centrado en lo estratégico
- 📊 +Productividad general
''',
                'color': '46B1C9',
                'icon': 'Bot',
                'duration': 10,
                'requisites': None,
                'price': None,
                'is_featured': True,
                'draft': False
            },
            {
                'title': 'Accesibilidad Global (WCAG)',
                'subtitle': 'Garantiza la inclusión digital según WCAG 2.1',
                'type': 'SERVICE',
                'description': '''
♿ Auditamos e implementamos las mejores prácticas de accesibilidad para que tu web o app cumpla con\
 **WCAG 2.1** y llegue a todo tipo de usuarios.

## 👓 Servicios Incluidos

| 1. Auditoría                 | 2. Implementación con WCAG DOCK               |
|------------------------------|-----------------------------------------------|
| Test de contraste de colores | **Implementación de ADD ON de accesibilidad** |
| Navegación por teclado       | Guía de accesibilidad + Tutorial de uso       |
| Lectores de pantalla         | **EXTRA:** Implementación de mejoras de accesibilidad global (consultar)  |

## 🏆 Resultados

- ✅ Cumplimiento nivel AA (o AAA)
- 🌍 Alcance a usuarios con discapacidad
- 💼 Evita sanciones legales
- 📈 +Satisfacción y retención
''',
                'color': '623CEA',
                'icon': 'Accessibility',
                'duration': 2,
                'requisites': (
                    "- Acceso al código fuente o CMS.     "
                    "- Colaboración de tu equipo de desarrollo y diseño.     "
                    "- Disponibilidad para llamadas y videoconferencias para probar el resultado.     "
                ),
                'price': None,
                'is_featured': True,
                'draft': False
            },
            {
                'title': 'Chatbot web',
                'subtitle': 'Chatbot personalizado para la web de tu negocio',
                'type': 'SERVICE',
                'description': '''
Este chatbot te ayudará a mejorar la interacción con tus clientes ayudándoles a navegar por tu sistema,\n\
 ofrecerles asistencia técnica o ponerles en contacto con quién necesiten.

## 🎯 Beneficios
- 🔍 Mejora la interacción con tus clientes
- 💻 Chatbot personalizado para tu web
- 24/7 Disponibilidad

''',
                'color': 'E4572E',
                'icon': 'MessageSquare',
                'duration': 4,
                'requisites': (
                    "- Documentación o datos necesarios que el chatbot deba 'saber' para atender a los usuarios.    "
                    "- Acceso al código fuente de la web.    "
                    "- Disponibilidad para consultas.    "
                ),
                'price': None,
                'is_featured': False,
                'draft': True
            },
            {
                'title': 'Automatización de Redes Sociales',
                'subtitle': 'Automatización la publicación de tu contenidos en distintas redes sociales',
                'type': 'SERVICE',
                'description': '''
Estas automatizaciones te permitirán centrarte en la creación de contenido dejando toda la gestión y subida de los
 mismos a la Inteligencia artificial.

## 🎯 Beneficios

- 📈 Eficiencia y ahorro de tiempo
- 💸 Reducción de costes de personal
- 🗂️ Priorización en la creación de contenido de calidad para redes sociales
- 👥 El equipo se centra en relizar tareas que de verdad necesitan de una persona

''',
                'color': '1A1924',
                'icon': 'TrendingUp',
                'duration': None,
                'requisites': (
                     "- Acceso a las (temporalmente) a las redes sociales que se quieran automatizar.    "
                     "- Acceso a una cuenta de Google Drive para alamacenar el contenido.    "
                ),
                'price': None,
                'is_featured': False,
                'draft': False
            },
            {
                'title': 'Implantación de CRM/ERP con Odoo',
                'subtitle': 'Consultoría, despliegue y personalización de Odoo para la gestión empresarial',
                'type': 'SERVICE',
                'description': '''
Odoo es un potente software de gestión empresarial (**ERP**) de código abierto. Nuestro servicio abarca desde la
consultoría inicial hasta el despliegue y personalización completa de Odoo en la empresa.

## 📝 Alcance del Servicio

1. **Análisis de requerimientos:**
    - Evaluamos las necesidades del negocio y definimos qué módulos de Odoo serán útiles.
    - Odoo es modular: CRM, ventas (incluyendo e-commerce), facturación, contabilidad, inventarios, proyectos, etc.
    - Identificamos áreas prioritarias para la empresa cliente.

2. **Configuración y personalización:**
    - Instalamos Odoo y configuramos los módulos seleccionados para reflejar los procesos de la empresa.

3. **Migración de datos:**
    - Si el cliente viene de otro sistema, migramos datos existentes (clientes, productos, facturas, históricos, etc.).
    - Permite comenzar a usar la nueva plataforma sin perder información previa.

4. **Formación y arranque:**
    - Capacitamos al equipo en el uso de los distintos módulos de Odoo (ventas, administración, logística, etc.).
    - Acompañamos en el go-live, supervisando el uso correcto en operaciones diarias.

5. **Soporte post-implementación:**
    - Tras la implantación, brindamos soporte para resolver dudas o incidencias.
    - Podemos desarrollar funcionalidades adicionales a medida que el cliente expanda sus requerimientos,
    gracias a la naturaleza modular de Odoo.

## 🚀 Beneficios

- Automatización y centralización de procesos empresariales en una única plataforma.
- Ventas desde diferentes canales registradas automáticamente en CRM y facturación.
- Inventario actualizado en tiempo real.
- Informes gerenciales en tiempo real de todas las áreas.
- Mayor eficiencia operativa y reducción de tareas manuales duplicadas.
- Mejor toma de decisiones gracias a datos unificados.
''',
                'color': '623CEA',
                'icon': 'Settings',
                'duration': 15,
                'requisites': (
                     "- Acceso a información sobre los procesos actuales de la empresa.    "
                     "- Disponibilidad para entrevistas y talleres de requerimientos.    "
                     "- Acceso a datos históricos si se requiere migración.    "
                     "- Colaboración del equipo para formación y pruebas.    "
                ),
                'price': None,
                'is_featured': True,
                'draft': False
            },
        ]

        servicios = []
        for data in services_data:
            svc, created = Service.objects.get_or_create(
                title=data['title'],
                defaults=data
            )
            if created:
                servicios.append(svc)
        return servicios
