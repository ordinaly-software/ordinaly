from io import BytesIO
from decimal import Decimal
from datetime import date, time
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model

from users.models import CustomUser
from terms.models import Terms
from courses.models import Course
from services.models import Service
from PIL import ImageDraw, ImageFont

User = get_user_model()

# Try to import optional dependencies
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
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
        """Clear existing data"""
        try:
            Course.objects.all().delete()
        except Exception:
            pass
        try:
            Service.objects.all().delete()
        except Exception:
            pass
        try:
            Terms.objects.all().delete()
        except Exception:
            pass
        # Only delete users that were created by this script (not manually created superusers)
        try:
            CustomUser.objects.filter(email__in=[
                'admin@ordinaly.ai',
                'john.doe@example.com',
                'jane.smith@example.com',
                'carlos.garcia@example.com',
                'maria.lopez@example.com'
            ]).delete()
        except Exception:
            pass
        # Also delete by username to be safe
        try:
            CustomUser.objects.filter(username__in=[
                'demo_admin',
                'john_doe',
                'jane_smith',
                'carlos_garcia',
                'maria_lopez'
            ]).delete()
        except Exception:
            pass

    def create_users(self):
        """Create sample users"""
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

        # Create regular users
        sample_users = [
            {
                'username': 'john_doe',
                'email': 'john.doe@example.com',
                'name': 'John',
                'surname': 'Doe',
                'company': 'Tech Solutions Inc',
                'region': 'Madrid',
                'city': 'Madrid',
            },
            {
                'username': 'jane_smith',
                'email': 'jane.smith@example.com',
                'name': 'Jane',
                'surname': 'Smith',
                'company': 'Digital Innovations',
                'region': 'Catalonia',
                'city': 'Barcelona',
            },
            {
                'username': 'carlos_garcia',
                'email': 'carlos.garcia@example.com',
                'name': 'Carlos',
                'surname': 'García',
                'company': 'Startup Labs',
                'region': 'Valencia',
                'city': 'Valencia',
            },
            {
                'username': 'maria_lopez',
                'email': 'maria.lopez@example.com',
                'name': 'María',
                'surname': 'López',
                'company': 'Creative Agency',
                'region': 'Andalusia',
                'city': 'Málaga',
            },
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

    def create_sample_pdf(self, title, content):
        """Create a sample PDF file"""
        if not REPORTLAB_AVAILABLE:
            # Create a simple text file as fallback
            pdf_content = f"{title}\n\n{content}"
            return pdf_content.encode('utf-8')

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Title
        p.setFont("Helvetica-Bold", 20)
        p.drawString(50, height - 50, title)

        # Content
        p.setFont("Helvetica", 12)
        lines = content.split('\n')
        y = height - 100
        for line in lines:
            if y < 50:  # Start new page if needed
                p.showPage()
                y = height - 50
            p.drawString(50, y, line[:80])  # Truncate long lines
            y -= 20

        p.save()
        buffer.seek(0)
        return buffer.getvalue()

    def create_sample_md(self, title, content):
        """Create a sample markdown file"""
        md_content = (
            f"# {title}\n\n{content}\n\n"
            "## Additional Information\n\n"
            "This is sample content for testing purposes."
        )
        return md_content.encode('utf-8')

    def create_terms(self, author):
        """Create sample terms"""
        terms_data = [
            {
                'name': 'Terms and Conditions of Use v1.0',
                'tag': 'terms',
                'version': '1.0',
                'content': '''These Terms and Conditions govern your use of our services.

## 1. Acceptance of Terms
By accessing and using our services, you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use License
Permission is granted to temporarily use our services for personal, non-commercial transitory viewing only.

## 3. Disclaimer
The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied.

## 4. Limitations
In no event shall our company be liable for any damages arising out of the use or inability to use our services.

## 5. Privacy Policy
Your privacy is important to us. Please review our Privacy Policy.

## 6. Contact Information
If you have any questions about these Terms and Conditions, please contact us.''',
            },
            {
                'name': 'Privacy Policy v1.0',
                'tag': 'privacy',
                'version': '1.0',
                'content': '''This Privacy Policy describes how we collect, use, and protect your information.

## Information We Collect
We collect information you provide directly to us, such as when you create an account or contact us.

## How We Use Your Information
We use the information we collect to provide, maintain, and improve our services.

## Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties.

## Data Security
We implement appropriate security measures to protect your personal information.

## Your Rights
You have the right to access, update, or delete your personal information.

## Changes to This Policy
We may update this Privacy Policy from time to time. We will notify you of any changes.

## Contact Us
If you have questions about this Privacy Policy, please contact us.''',
            },
            {
                'name': 'Cookie Policy v1.0',
                'tag': 'cookies',
                'version': '1.0',
                'content': '''This Cookie Policy explains how we use cookies and similar technologies.

## What Are Cookies
Cookies are small data files that are placed on your computer or mobile device when you visit a website.

## How We Use Cookies
We use cookies to enhance your experience, analyze site traffic, and personalize content.

## Types of Cookies We Use
- Essential cookies: Required for the website to function properly
- Analytics cookies: Help us understand how visitors interact with our website
- Functional cookies: Enable enhanced functionality and personalization

## Managing Cookies
You can control and manage cookies in various ways through your browser settings.

## Third-Party Cookies
We may also use third-party cookies for analytics and advertising purposes.

## Updates to This Policy
We may update this Cookie Policy to reflect changes in our practices.

## Contact Information
If you have questions about our use of cookies, please contact us.''',
            },
            {
                'name': 'Software License Agreement v1.0',
                'tag': 'license',
                'version': '1.0',
                'content': '''This Software License Agreement governs your use of our software.

## Grant of License
Subject to the terms of this Agreement, we grant you a limited, non-exclusive license to use our software.

## Restrictions
You may not modify, distribute, or create derivative works based on our software.

## Intellectual Property
All intellectual property rights in the software remain with us.

## Warranty Disclaimer
The software is provided "as is" without warranty of any kind.

## Limitation of Liability
Our liability for any damages shall not exceed the amount paid for the software.

## Termination
This license is effective until terminated by either party.

## Governing Law
This Agreement shall be governed by the laws of Spain.

## Contact Information
For questions about this license, please contact our legal department.''',
            },
        ]

        terms = []
        for term_data in terms_data:
            # Create markdown content
            md_content = self.create_sample_md(term_data['name'], term_data['content'])

            # Create PDF content
            pdf_content = self.create_sample_pdf(term_data['name'], term_data['content'])

            term, created = Terms.objects.get_or_create(
                tag=term_data['tag'],
                defaults={
                    'name': term_data['name'],
                    'version': term_data['version'],
                    'author': author,
                    'content': ContentFile(md_content, name=f"{term_data['tag']}.md"),
                    'pdf_content': ContentFile(pdf_content, name=f"{term_data['tag']}.pdf"),
                }
            )
            if created:
                terms.append(term)

        return terms

    def create_sample_image(self, width=800, height=400, color=(70, 191, 18), course_name="Course"):
        """Create a sample image"""
        if not PIL_AVAILABLE:
            # Create a simple SVG as fallback
            svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="rgb({color[0]},{color[1]},{color[2]})"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white"
        font-family="Arial, sans-serif" font-size="24" font-weight="bold">
    {course_name}
  </text>
</svg>'''
            return svg_content.encode('utf-8')

        try:
            # Create a proper JPEG image with text
            image = Image.new('RGB', (width, height), color)
            draw = ImageDraw.Draw(image)

            # Try to use a font, fallback to default if not available
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
            except OSError:
                try:
                    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
                except OSError:
                    font = ImageFont.load_default()

            # Add text to image
            text_bbox = draw.textbbox((0, 0), course_name, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]

            x = (width - text_width) // 2
            y = (height - text_height) // 2

            # Add shadow
            draw.text((x+2, y+2), course_name, fill=(0, 0, 0, 128), font=font)
            # Add main text
            draw.text((x, y), course_name, fill="white", font=font)

            buffer = BytesIO()
            image.save(buffer, format='JPEG', quality=85)
            buffer.seek(0)
            return buffer.getvalue()
        except Exception as e:
            print(f"Error creating image: {e}")
            # Fallback to simple colored rectangle
            image = Image.new('RGB', (width, height), color)
            buffer = BytesIO()
            image.save(buffer, format='JPEG')
            buffer.seek(0)
            return buffer.getvalue()

    def create_courses(self):
        """Create sample courses"""
        courses_data = [
            {
                'title': 'Introduction to Web Development',
                'subtitle': 'Learn the basics of HTML, CSS, and JavaScript',
                'description': (
                    'A comprehensive course covering the fundamentals of web development. '
                    'Perfect for beginners who want to start their journey in web development.'
                ),
                'price': Decimal('299.99'),
                'location': 'Online',
                'start_date': date(2025, 3, 15),
                'end_date': date(2025, 5, 15),
                'start_time': time(18, 0),
                'end_time': time(20, 0),
                'periodicity': 'weekly',
                'weekdays': [1, 3],  # Tuesday and Thursday
                'timezone': 'Europe/Madrid',
                'max_attendants': 30,
            },
            {
                'title': 'Advanced Python Programming',
                'subtitle': 'Master advanced Python concepts and frameworks',
                'description': (
                    'Take your Python skills to the next level with advanced topics including '
                    'decorators, metaclasses, async programming, and popular frameworks.'
                ),
                'price': Decimal('499.99'),
                'location': 'Madrid, Spain',
                'start_date': date(2025, 4, 10),
                'end_date': date(2025, 6, 10),
                'start_time': time(19, 0),
                'end_time': time(21, 30),
                'periodicity': 'weekly',
                'weekdays': [0, 2],  # Monday and Wednesday
                'timezone': 'Europe/Madrid',
                'max_attendants': 20,
            },
            {
                'title': 'Data Science Fundamentals',
                'subtitle': 'Introduction to data analysis and machine learning',
                'description': (
                    'Learn the basics of data science including statistical analysis, '
                    'data visualization, and machine learning algorithms using Python.'
                ),
                'price': Decimal('699.99'),
                'location': 'Barcelona, Spain',
                'start_date': date(2025, 5, 20),
                'end_date': date(2025, 8, 20),
                'start_time': time(17, 30),
                'end_time': time(20, 30),
                'periodicity': 'biweekly',
                'weekdays': [5],  # Saturday
                'timezone': 'Europe/Madrid',
                'max_attendants': 25,
            },
            {
                'title': 'Mobile App Development with React Native',
                'subtitle': 'Build cross-platform mobile applications',
                'description': (
                    'Create mobile apps for both iOS and Android using React Native. '
                    'Learn navigation, state management, and API integration.'
                ),
                'price': Decimal('599.99'),
                'location': 'Online',
                'start_date': date(2025, 6, 5),
                'end_date': date(2025, 6, 5),
                'start_time': time(9, 0),
                'end_time': time(17, 0),
                'periodicity': 'once',
                'timezone': 'Europe/Madrid',
                'max_attendants': 35,
            },
            {
                'title': 'DevOps and Cloud Computing',
                'subtitle': 'Modern deployment and infrastructure management',
                'description': (
                    'Master DevOps practices and cloud platforms including '
                    'Docker, Kubernetes, AWS, and CI/CD pipelines.'
                ),
                'price': Decimal('799.99'),
                'location': 'Seville, Spain',
                'start_date': date(2025, 7, 12),
                'end_date': date(2025, 12, 12),
                'start_time': time(10, 0),
                'end_time': time(12, 0),
                'periodicity': 'monthly',
                'weekdays': [0],  # Monday
                'week_of_month': 1,  # First Monday of each month
                'timezone': 'Europe/Madrid',
                'exclude_dates': ['2025-08-15', '2025-12-25'],  # Spanish holidays
                'max_attendants': 15,
            },
            {
                'title': 'UX/UI Design Workshop',
                'subtitle': 'Master user experience and interface design',
                'description': (
                    'Learn the principles of user experience and interface design. '
                    'Create compelling digital experiences that users love.'
                ),
                'price': Decimal('399.99'),
                'location': 'Valencia, Spain',
                'start_date': date(2025, 9, 1),
                'end_date': date(2025, 11, 30),
                'start_time': time(16, 0),
                'end_time': time(18, 30),
                'periodicity': 'weekly',
                'weekdays': [4],  # Friday
                'interval': 2,  # Every 2 weeks
                'timezone': 'Europe/Madrid',
                'max_attendants': 18,
            },
        ]

        courses = []
        for i, course_data in enumerate(courses_data):
            # Create sample image with course title
            image_content = self.create_sample_image(course_name=course_data['title'][:20])

            course, created = Course.objects.get_or_create(
                title=course_data['title'],
                defaults={
                    **course_data,
                    'image': ContentFile(image_content, name=f"course_{i}.jpg"),
                }
            )
            if created:
                courses.append(course)

        return courses

    def create_services(self):
        """Create sample services"""
        services_data = [
            {
                'title': 'Custom Web Development',
                'subtitle': 'Modern responsive websites',
                'description': (
                    'Professional web development services tailored to your business needs. '
                    'We create **responsive**, modern websites using the latest technologies.\n\n'
                    '### Technologies We Use:\n'
                    '- HTML5 & CSS3\n'
                    '- JavaScript & TypeScript\n'
                    '- React & Next.js\n\n'
                    '*Perfect for businesses looking to establish their online presence.*'
                ),
                'color': '29BF12',
                'icon': 'Globe',
                'duration': 160,
                'price': Decimal('2500.00'),
                'is_featured': True,
            },
            {
                'title': 'Mobile App Development',
                'subtitle': 'iOS and Android applications',
                'description': (
                    'Native and cross-platform mobile application development for iOS and Android. '
                    'From *concept* to deployment.\n\n'
                    '## What we offer:\n'
                    '1. **Native iOS & Android apps**\n'
                    '2. **React Native solutions**\n'
                    '3. **Flutter development**\n'
                    '4. **App Store submission**\n\n'
                    '> Transform your ideas into powerful mobile experiences.'
                ),
                'color': '623CEA',
                'icon': 'Smartphone',
                'duration': 200,
                'price': Decimal('3500.00'),
                'is_featured': True,
            },
            {
                'title': 'UI/UX Design',
                'subtitle': 'User-centered design solutions',
                'description': (
                    'User-centered design services that create **intuitive** and engaging '
                    'digital experiences for your customers.\n\n'
                    '> "Good design is not just what it looks like – good design is how it works."\n'
                    '> — *Steve Jobs*\n\n'
                    '### Our Design Process:\n'
                    '1. User research\n'
                    '2. Wireframing\n'
                    '3. Prototyping\n'
                    '4. Testing\n\n'
                    'Creating designs that **convert** and **delight** users.'
                ),
                'color': '46B1C9',
                'icon': 'Palette',
                'duration': 80,
                'price': Decimal('1200.00'),
                'is_featured': False,
            },
            {
                'title': 'Cloud Migration Services',
                'subtitle': 'Seamless cloud transformation',
                'description': (
                    'Seamlessly migrate your applications and data to the cloud '
                    'with our expert cloud migration services.\n\n'
                    '### Cloud Platforms:\n'
                    '- **AWS** - Amazon Web Services\n'
                    '- **Azure** - Microsoft Cloud\n'
                    '- **GCP** - Google Cloud Platform\n\n'
                    '*Security and scalability guaranteed.*\n\n'
                    '**Benefits:**\n'
                    '- Reduced infrastructure costs\n'
                    '- Enhanced security\n'
                    '- Improved scalability'
                ),
                'color': '1A1924',
                'icon': 'Cloud',
                'duration': 120,
                'price': Decimal('4000.00'),
                'is_featured': True,
            },
            {
                'title': 'Technical Consulting',
                'subtitle': 'Strategic technology guidance',
                'description': (
                    'Strategic technology consulting to help you make **informed decisions** '
                    'about your digital transformation.\n\n'
                    '### Our expertise covers:\n'
                    '- Architecture review\n'
                    '- Technology stack selection\n'
                    '- Performance optimization\n'
                    '- Security assessment\n\n'
                    '> Making technology work *for* your business, not against it.'
                ),
                'color': 'E4572E',
                'icon': 'Lightbulb',
                'duration': 40,
                'price': Decimal('800.00'),
                'is_featured': False,
            },
            {
                'title': 'DevOps Implementation',
                'subtitle': 'Streamlined development workflows',
                'description': (
                    'Implement DevOps practices to improve your development workflow, '
                    'deployment process, and system **reliability**.\n\n'
                    '### DevOps Services:\n'
                    '- CI/CD Pipeline setup\n'
                    '- Infrastructure as Code\n'
                    '- Monitoring & Logging\n'
                    '- Container orchestration\n\n'
                    '**Technologies:** `docker`, `kubernetes`, `terraform`\n\n'
                    '*Automate your way to success.*'
                ),
                'color': '623CEA',
                'icon': 'Settings',
                'duration': 100,
                'price': Decimal('2000.00'),
                'is_featured': False,
            },
            {
                'title': 'API Development',
                'subtitle': 'Robust system integrations',
                'description': (
                    'Design and develop **robust**, scalable APIs that integrate '
                    'seamlessly with your existing systems.\n\n'
                    '### API Technologies:\n'
                    '- RESTful APIs\n'
                    '- GraphQL\n'
                    '- gRPC\n'
                    '- WebSocket\n\n'
                    '*Documentation and testing included.*\n\n'
                    '**Features:**\n'
                    '- Comprehensive documentation\n'
                    '- Automated testing\n'
                    '- Rate limiting\n'
                    '- Authentication & authorization'
                ),
                'color': '46B1C9',
                'icon': 'Code',
                'duration': 80,
                'price': Decimal('1500.00'),
                'is_featured': False,
            },
            {
                'title': 'Database Optimization',
                'subtitle': 'Performance and reliability',
                'description': (
                    'Optimize your database performance and ensure data **integrity** '
                    'with our database management services.\n\n'
                    '### Database Expertise:\n'
                    '- PostgreSQL optimization\n'
                    '- MySQL tuning\n'
                    '- MongoDB scaling\n'
                    '- Redis caching\n\n'
                    '*24/7 monitoring and support available*\n\n'
                    '> **Performance improvements** up to 10x faster query execution.'
                ),
                'color': '29BF12',
                'icon': 'Database',
                'duration': 60,
                'price': Decimal('1000.00'),
                'is_featured': False,
            },
        ]

        services = []
        for service_data in services_data:
            service, created = Service.objects.get_or_create(
                title=service_data['title'],
                defaults=service_data
            )
            if created:
                services.append(service)

        return services
