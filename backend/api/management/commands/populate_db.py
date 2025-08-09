from datetime import date, time
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from users.models import CustomUser
from terms.models import Terms
from courses.models import Course
from services.models import Service
from courses.models import Enrollment
import os
from django.conf import settings
import random
from datetime import datetime, timedelta


User = get_user_model()

# Try to import optional dependencies
try:
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


class Command(BaseCommand):
    help = 'Populate the database with sample data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            self.clear_data()

        self.stdout.write('Creating sample data...')

        # Create users
        users = self.create_users()
        self.stdout.write(f'Created {len(users)} users')

        # Create terms (only if the model exists)
        try:
            terms = self.create_terms(users[0])  # Use admin as author
            self.stdout.write(f'Created {len(terms)} terms')
        except Exception as e:
            self.stdout.write(f'Skipped terms creation: {e}')

        # Create courses
        courses = self.create_courses()
        self.stdout.write(f'Created {len(courses)} courses')

        # Create enrollments for realistic user engagement
        enrollments = self.create_enrollments(users, courses)
        self.stdout.write(f'Created {len(enrollments)} enrollments')

        # Create services (only if the model exists)
        try:
            services = self.create_services()
            self.stdout.write(f'Created {len(services)} services')
        except Exception as e:
            self.stdout.write(f'Skipped services creation: {e}')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated database with sample data!')
        )

    def clear_data(self):
        """Clear existing data and associated media files"""
        # First, get references to files before deleting objects
        try:
            # Get all terms files for later cleanup
            terms_files = []
            for term in Terms.objects.all():
                if term.content and hasattr(term.content, 'path'):
                    terms_files.append(term.content.path)
                if term.pdf_content and hasattr(term.pdf_content, 'path'):
                    terms_files.append(term.pdf_content.path)

            # Get all course images for later cleanup
            course_images = []
            for course in Course.objects.all():
                if course.image and hasattr(course.image, 'path'):
                    course_images.append(course.image.path)

            # Now delete the objects (models' delete methods will be called)
            Enrollment.objects.all().delete()
            self.stdout.write("Deleted all enrollments")

            Course.objects.all().delete()
            self.stdout.write("Deleted all courses")

            Service.objects.all().delete()
            self.stdout.write("Deleted all services")

            Terms.objects.all().delete()
            self.stdout.write("Deleted all terms")

            CustomUser.objects.filter(is_staff=False).delete()
            self.stdout.write("Deleted non-staff users")

            # Additional cleanup for any files that might not have been deleted
            for file_path in terms_files + course_images:
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        self.stdout.write(f"Deleted file: {file_path}")
                    except Exception as e:
                        self.stdout.write(f"Error deleting file {file_path}: {e}")

        except Exception as e:
            self.stdout.write(f"Error during data cleanup: {e}")

        try:
            Enrollment.objects.all().delete()
            self.stdout.write("Deleted all enrollments")
        except Exception as e:
            self.stdout.write(f"Error deleting enrollments: {e}")

        try:
            Course.objects.all().delete()
            self.stdout.write("Deleted all courses")
        except Exception as e:
            self.stdout.write(f"Error deleting courses: {e}")

        try:
            Service.objects.all().delete()
            self.stdout.write("Deleted all services")
        except Exception as e:
            self.stdout.write(f"Error deleting services: {e}")

        try:
            # Make sure to delete all terms
            Terms.objects.all().delete()
            self.stdout.write("Deleted all terms")
        except Exception as e:
            self.stdout.write(f"Error deleting terms: {e}")

        try:
            CustomUser.objects.filter(is_staff=False).delete()
            self.stdout.write("Deleted non-staff users")
        except Exception as e:
            self.stdout.write(f"Error deleting users: {e}")

    def create_users(self):
        """Create sample users with diverse backgrounds"""
        users = []

        # Create admin user (or use existing one)
        admin, created = CustomUser.objects.get_or_create(
            username='demo_admin',
            email='admin@ordinaly.ai',
            defaults={
                'name': 'Demo Admin',
                'surname': 'User',
                'company': 'Ordinaly Software',
                'region': 'Andalusia',
                'city': 'Seville',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
        users.append(admin)

        # Create diverse regular users from different sectors and regions
        sample_users = [
            {
                'username': 'ana_rodriguez',
                'email': 'ana.rodriguez@healthtech.es',
                'name': 'Ana',
                'surname': 'Rodríguez',
                'company': 'HealthTech Solutions',
                'region': 'Madrid',
                'city': 'Madrid',
            },
            {
                'username': 'miguel_fernandez',
                'email': 'miguel.fernandez@ecomarket.com',
                'name': 'Miguel',
                'surname': 'Fernández',
                'company': 'EcoMarket España',
                'region': 'Catalonia',
                'city': 'Barcelona',
            },
            {
                'username': 'laura_gonzalez',
                'email': 'laura.gonzalez@finnovation.es',
                'name': 'Laura',
                'surname': 'González',
                'company': 'FinNovation Bank',
                'region': 'Valencia',
                'city': 'Valencia',
            },
            {
                'username': 'david_martin',
                'email': 'david.martin@smartedu.es',
                'name': 'David',
                'surname': 'Martín',
                'company': 'SmartEdu Academy',
                'region': 'Andalusia',
                'city': 'Córdoba',
            },
            {
                'username': 'sofia_jimenez',
                'email': 'sofia.jimenez@tourisminnovate.com',
                'name': 'Sofía',
                'surname': 'Jiménez',
                'company': 'Tourism Innovate',
                'region': 'Canary Islands',
                'city': 'Las Palmas',
            },
            {
                'username': 'elena_morales',
                'email': 'elena.morales@retailinnovation.com',
                'name': 'Elena',
                'surname': 'Morales',
                'company': 'Retail Innovation Hub',
                'region': 'Basque Country',
                'city': 'Bilbao',
            },
            {
                'username': 'javier_castro',
                'email': 'javier.castro@techstartup.es',
                'name': 'Javier',
                'surname': 'Castro',
                'company': 'TechStartup Incubator',
                'region': 'Murcia',
                'city': 'Murcia',
            },
            {
                'username': 'carmen_herrera',
                'email': 'carmen.herrera@energygreen.es',
                'name': 'Carmen',
                'surname': 'Herrera',
                'company': 'Energy Green Solutions',
                'region': 'Extremadura',
                'city': 'Badajoz',
            },
            {
                'username': 'raul_vega',
                'email': 'raul.vega@digitalmarketing.es',
                'name': 'Raúl',
                'surname': 'Vega',
                'company': 'Digital Marketing Pro',
                'region': 'Asturias',
                'city': 'Oviedo',
            },
            {
                'username': 'lucia_mendez',
                'email': 'lucia.mendez@consulting.es',
                'name': 'Lucía',
                'surname': 'Méndez',
                'company': 'Business Consulting 360',
                'region': 'Castilla-La Mancha',
                'city': 'Toledo',
            },
            {
                'username': 'sergio_pena',
                'email': 'sergio.pena@cybersecurity.es',
                'name': 'Sergio',
                'surname': 'Peña',
                'company': 'CyberSecurity Plus',
                'region': 'La Rioja',
                'city': 'Logroño',
            },
            {
                'username': 'natalia_ramos',
                'email': 'natalia.ramos@biotech.es',
                'name': 'Natalia',
                'surname': 'Ramos',
                'company': 'BioTech Innovations',
                'region': 'Navarra',
                'city': 'Pamplona',
            }
        ]

        for user_data in sample_users:
            user, created = CustomUser.objects.get_or_create(
                username=user_data['username'],
                email=user_data['email'],
                defaults=user_data
            )
            if created:
                user.set_password('password123')
                user.save()
            users.append(user)

        return users

    def create_terms(self, author):
        terms_dir = os.path.join(settings.BASE_DIR, 'media', 'test_media', 'terms')
        # Create the directory if it doesn't exist
        os.makedirs(terms_dir, exist_ok=True)

        # Map of tag to (name, version)
        term_files = [
            ('terms', 'Términos y Condiciones de Uso v1.0', '1.0'),
            ('privacy', 'Política de Privacidad v1.0', '1.0'),
            ('cookies', 'Política de Cookies v1.0', '1.0'),
            ('license', 'Acuerdo de Licencia de Software v1.0', '1.0'),
        ]
        terms = []
        for tag, name, version in term_files:
            md_path = os.path.join(terms_dir, f'{tag}_ordinaly.md')
            pdf_path = os.path.join(terms_dir, f'{tag}_ordinaly.pdf')

            # Check if files exist and print debug info
            if not os.path.exists(md_path):
                self.stdout.write(f"Warning: Markdown file not found at {md_path}")
                continue
            if not os.path.exists(pdf_path):
                self.stdout.write(f"Warning: PDF file not found at {pdf_path}")
                continue

            # Delete existing terms with the same tag to avoid uniqueness constraint errors
            # The model's delete method will handle file deletion
            Terms.objects.filter(tag=tag).delete()

            with open(md_path, 'rb') as f:
                md_content = f.read()
            with open(pdf_path, 'rb') as f:
                pdf_content = f.read()

            try:
                term = Terms.objects.create(
                    tag=tag,
                    name=name,
                    version=version,
                    author=author,
                    content=ContentFile(md_content, name=f"{tag}.md"),
                    pdf_content=ContentFile(pdf_content, name=f"{tag}.pdf"),
                )
                terms.append(term)
                self.stdout.write(f"Created term: {name}")
            except Exception as e:
                self.stdout.write(f"Error creating term {tag}: {e}")

        return terms

    def create_courses(self):
        """Create sample courses and load images from media/test_media/course_images/"""
        images_dir = os.path.join(settings.BASE_DIR, 'media', 'test_media', 'course_images')

        courses_data = [
            {
                'title': 'Taller gratuito "La Inteligencia Artificial sin complicaciones"',
                'subtitle': (
                    'Familiarízate con las webs y apps de IA del momento y aprende los conceptos básicos '
                    'con ejemplos prácticos.'
                ),
                'description': (
                    'Este taller va orientado a profesionales que busquen introducirse en el mundo de la IA '
                    'y quieran aprender los conceptos básicos de la *Inteligencia Artificial Generativa*.\n'
                    'En este taller se abordarán temas como:\n'
                    '- Introducción a la IA y sus aplicaciones\n'
                    '- Herramientas y recursos para trabajar con IA\n'
                    '- Ejemplos prácticos de uso de IA en negocios\n'
                    '- Consideraciones de seguridad y privacidad en el uso de IA\n'
                    'Taller impartido por: \n'
                    '- 👨‍💻 *Antonio Macías* - joven ingeniero del software de Ordinaly \n'
                    '- 🧪 *Guillermo Montero* - ingeniero de calidad en Proinca y experto en IA \n\n'
                    'Organizado por **Ordinaly Software** en colaboración con '
                    '[Proinca Consultores](https://www.proincaconsultores.es) y '
                    '[Aviva Publicidad](https://avivapublicidad.es).\n'
                ),
                'price': None,
                'location': 'C. Aviación 39, Polígono Calonge, Sevilla 41007',
                'start_date': date(2025, 6, 18),
                'end_date': date(2025, 6, 18),
                'start_time': time(9, 30),
                'end_time': time(11, 30),
                'periodicity': 'once',
                'timezone': 'Europe/Madrid',
                'max_attendants': 25,
            },
            {
                'title': 'Sesión formativa "La Inteligencia Artificial en la inmobiliaria"',
                'subtitle': (
                    'Abordaremos los principales casos de uso de la IA generativa enfocados al sector inmobiliario.'
                ),
                'description': (
                    '**¡IMPORTANTE!**. Esta sesión va orientada a profesionales adscritos al grupo *Alianza Sevilla*.\n'
                    'En esta sesión se abordarán temas como:\n'
                    '- Casos de uso de la IA generativa en el sector inmobiliario\n'
                    '- Herramientas y recursos para trabajar con IA\n'
                    '- Ejemplos prácticos de uso de IA en negocios\n'
                    '- Consideraciones de seguridad y privacidad en el uso de IA\n'
                    '- Impacto de la IA en la industria inmobiliaria\n'
                    '- Futuro de la IA en la inmobiliaria\n'
                    'Taller impartido por: \n'
                    '- 👨‍💻 *Antonio Macías* - ingeniero del software de Ordinaly \n'
                    '- 🧪 *Guillermo Montero* - ingeniero de calidad en Proinca y experto en IA \n\n'
                    'Organizado por **Ordinaly Software** en colaboración con '
                    '[Alianza Sevilla](https://alianzasevilla.com) y '
                    '[Aviva Publicidad](https://avivapublicidad.es).\n'
                ),
                'price': None,
                'location': 'Edif. Galia, Sala de Conferencias 1. C. José Delgado Brackenbury 11, Sevilla, 41007',
                'start_date': date(2025, 7, 8),
                'end_date': date(2025, 7, 8),
                'start_time': time(9, 30),
                'end_time': time(11, 30),
                'periodicity': 'once',
                'timezone': 'Europe/Madrid',
                'max_attendants': 90,
            },
            {
                'title': 'Curso / Bootcamp "La Inteligencia Artificial en la inmobiliaria"',
                'subtitle': (
                    'En este curso partiremos de la base de los casos de uso básicos de las herramientas de IA '
                    'más conocidas e iremos escalando hasta dominar herramientas específicas para el sector '
                    'inmobiliario.'
                ),
                'description': (
                    'Este curso  está diseñado específicamente para profesionales del sector inmobiliario que '
                    'deseen aprovechar el potencial de la Inteligencia Artificial generativa en su trabajo diario.\n\n'
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
                    '- Profesionales del marketing inmobiliario\n'
                    'Taller impartido por: \n'
                    '- 👨‍💻 *Antonio Macías* - ingeniero del software de Ordinaly\n'
                    '- 🧪 *Guillermo Montero* - ingeniero de calidad en Proinca y experto en IA\n\n'
                    '**Incluye**: Material didáctico, certificado de finalización, '
                    'TODAS LAS HERRAMIENTAS DEL CURSO SERÁN GRATUITAS.'
                ),
                'price': None,
                'location': 'Por confirmar',
                'periodicity': 'weekly',
                'timezone': 'Europe/Madrid',
                'max_attendants': 90,
            },
        ]
        courses = []
        for i, course_data in enumerate(courses_data):
            image_path = os.path.join(images_dir, f'test_course_{i+1}.jpg')
            if not os.path.exists(image_path):
                image_content = None
            else:
                with open(image_path, 'rb') as f:
                    image_content = f.read()
            defaults = {**course_data}
            if image_content:
                defaults['image'] = ContentFile(image_content, name=f"course_{i+1}.jpg")
            course, created = Course.objects.get_or_create(
                title=course_data['title'],
                defaults=defaults
            )
            if created:
                courses.append(course)
        return courses

    def create_enrollments(self, users, courses):
        """Create realistic enrollments with positive use cases showing course completions.
        Only enroll in courses with non-null start_date, end_date, start_time, and end_time.
        """
        enrollments = []

        # Filter courses with all date/time fields not None
        eligible_courses = [
            c for c in courses
            if getattr(c, 'start_date', None) and getattr(c, 'end_date', None)
            and getattr(c, 'start_time', None) and getattr(c, 'end_time', None)
        ]
        if not eligible_courses:
            return enrollments

        # Skip admin user for enrollments (first user)
        regular_users = users[1:]  # Skip the admin user

        # Create realistic enrollment patterns
        enrollment_patterns = [
            # Fill first eligible course to max capacity (25 attendants)
            {
                'user_indices': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                'courses_per_user': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            },
            # Some users also enroll in second eligible course
            {'user_indices': [2, 4, 6, 8], 'courses_per_user': [2, 2, 2, 2]},
        ]

        for pattern in enrollment_patterns:
            for i, user_index in enumerate(pattern['user_indices']):
                if user_index >= len(regular_users):
                    continue

                user = regular_users[user_index]
                num_courses = pattern['courses_per_user'][i]

                # Select courses for this user
                available_courses = list(eligible_courses)
                selected_courses = []

                # Give preference to popular courses
                if random.random() < 0.7:  # 70% chance to take a popular course
                    popular_courses = [eligible_courses[i] for i in range(2) if i < len(eligible_courses)]
                    if popular_courses:
                        selected_courses.append(random.choice(popular_courses))
                        available_courses.remove(selected_courses[0])
                        num_courses -= 1

                # Fill remaining slots with random courses
                while num_courses > 0 and available_courses:
                    course = random.choice(available_courses)
                    selected_courses.append(course)
                    available_courses.remove(course)
                    num_courses -= 1

                # Create enrollments for selected courses
                for course in selected_courses:
                    try:
                        enrollment, created = Enrollment.objects.get_or_create(
                            user=user,
                            course=course,
                            defaults={
                                'enrolled_at': datetime.now() - timedelta(
                                    days=random.randint(1, 90)  # Enrolled 1-90 days ago
                                )
                            }
                        )
                        if created:
                            enrollments.append(enrollment)
                    except Exception:
                        # Handle any unique constraint violations gracefully
                        continue

        # Ensure popular courses have good enrollment numbers
        for course_index in range(2):
            if course_index >= len(eligible_courses):
                continue

            course = eligible_courses[course_index]
            current_enrollments = Enrollment.objects.filter(course=course).count()

            # Aim for 8-15 enrollments per popular course
            target_enrollments = random.randint(8, 12)

            if current_enrollments < target_enrollments:
                needed = target_enrollments - current_enrollments
                available_users = [u for u in regular_users
                                   if not Enrollment.objects.filter(user=u, course=course).exists()]

                for _ in range(min(needed, len(available_users))):
                    if not available_users:
                        break
                    user = random.choice(available_users)
                    available_users.remove(user)

                    try:
                        enrollment, created = Enrollment.objects.get_or_create(
                            user=user,
                            course=course,
                            defaults={
                                'enrolled_at': datetime.now() - timedelta(
                                    days=random.randint(1, 60)
                                )
                            }
                        )
                        if created:
                            enrollments.append(enrollment)
                    except Exception:
                        continue

        return enrollments

    def create_services(self):
        """Crea servicios de ejemplo detallados en español, con Markdown enriquecido."""
        services_data = [
            {
                'title': 'Chatbot de WhatsApp',
                'subtitle': 'Automatiza atención al cliente 24/7 con IA conversacional avanzada',
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
                'color': '29BF12',
                'icon': 'Phone',
                'duration': 30,
                'requisites': (
                    "- Documento tipo FAQ en formato pdf sobre tódo lo que debe saber el asisitente.   "
                    "- Número de teñefóno con cuenta de Whatsapp Business.    "
                    "- Disponibilidad para consultas.     "
                ),
                # 'price': Decimal('300.00'),
                'price': None,
                'is_featured': True,
            },
            {
                'title': 'Automatizaciones a Medida',
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
                'duration': 45,
                'requisites': None,
                # 'price': Decimal('300.00'),
                'price': None,
                'is_featured': True,
            },
            {
                'title': 'Accesibilidad Global (WCAG)',
                'subtitle': 'Garantiza la inclusión digital según WCAG 2.1',
                'description': '''
♿ Auditamos e implementamos las mejores prácticas de accesibilidad para que tu web o app cumpla con\
 **WCAG 2.1** y llegue a todo tipo de usuarios.

## 👓 Servicios Incluidos

| 1. Auditoría                 | 2. Implementación con WCAG DOCK               |
|------------------------------|-----------------------------------------------|
| Test de contraste de colores | **Implementación de ADD ON de accesibilidad** |
| Navegación por teclado       | Guía de accesibilidad + Tutorial de uso       |
| Lectores de pantalla         | **EXTRA: ** Implementación de mejoras de accesibilidad global (consultar)  |

## 🏆 Resultados

- ✅ Cumplimiento nivel AA (o AAA)
- 🌍 Alcance a usuarios con discapacidad
- 💼 Evita sanciones legales
- 📈 +Satisfacción y retención
''',
                'color': '623CEA',
                'icon': 'Accessibility',
                'duration': 25,
                'requisites': (
                    "- Acceso al código fuente o CMS.     "
                    "- Colaboración de tu equipo de desarrollo y diseño.     "
                    "- Disponibilidad para llamadas y videoconferencias para probar el resultado.     "
                ),
                # 'price': Decimal('300.00'),
                'price': None,
                'is_featured': True,
            },
            {
                'title': 'Chatbot web',
                'subtitle': 'Chatbot personalizado para la web de tu negocio',
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
                'duration': 15,
                'requisites': (
                    "- Documentación o datos necesarios que el chatbot deba 'saber' para atender a los usuarios.    "
                    "- Acceso al código fuente de la web.    "
                    "- Disponibilidad para consultas.    "
                ),
                # 'price': Decimal('300.00'),
                'price': None,
                'is_featured': False,
            },
            {
                'title': 'Automatización de Redes Sociales',
                'subtitle': 'Automatización la publicación de tu contenidos en distintas redes sociales',
                'description': '''
Estas automatizaciones te permitirán centrarte en la creación de contenido dejando toda la gestión y subida de los "
"mismos a la Inteligencia Artificial.

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
                    "- Acceso a una cuenta de Google Drive con espacio suficiente para alamacenar el contenido.    "
                ),
                'price': Decimal('1299.00'),
                'is_featured': False,
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
