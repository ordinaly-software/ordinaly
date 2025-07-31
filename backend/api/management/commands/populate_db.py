from io import BytesIO
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model

from users.models import CustomUser
from terms.models import Terms
from courses.models import Course
from services.models import Service

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
        
        # Create terms
        terms = self.create_terms(users[0])  # Use admin as author
        self.stdout.write(f'Created {len(terms)} terms')
        
        # Create courses
        courses = self.create_courses()
        self.stdout.write(f'Created {len(courses)} courses')
        
        # Create services
        services = self.create_services()
        self.stdout.write(f'Created {len(services)} services')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully populated database with sample data!')
        )

    def clear_data(self):
        """Clear existing data"""
        Course.objects.all().delete()
        Service.objects.all().delete()
        Terms.objects.all().delete()
        CustomUser.objects.filter(is_superuser=False).delete()

    def create_users(self):
        """Create sample users"""
        users = []
        
        # Create admin user
        admin, created = CustomUser.objects.get_or_create(
            username='admin',
            email='admin@ordinaly.com',
            defaults={
                'name': 'Admin',
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
In no event shall our company or its suppliers be liable for any damages arising out of the use or inability to use our services.

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

    def create_sample_image(self, width=800, height=400, color=(70, 191, 18)):
        """Create a sample image"""
        if not PIL_AVAILABLE:
            # Create a simple placeholder file
            placeholder = b"PLACEHOLDER IMAGE DATA"
            return placeholder
        
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
                'date': '2025-03-15',
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
                'date': '2025-04-10',
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
                'date': '2025-05-20',
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
                'date': '2025-06-05',
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
                'date': '2025-07-12',
                'max_attendants': 15,
            },
        ]
        
        courses = []
        for course_data in courses_data:
            # Create sample image
            image_content = self.create_sample_image()
            
            course, created = Course.objects.get_or_create(
                title=course_data['title'],
                defaults={
                    **course_data,
                    'image': ContentFile(image_content, name=f"course_{len(courses)}.jpg"),
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
                'description': (
                    'Professional web development services tailored to your business needs. '
                    'We create responsive, modern websites using the latest technologies.'
                ),
                'featured': True,
            },
            {
                'title': 'Mobile App Development',
                'description': (
                    'Native and cross-platform mobile application development for iOS and Android. '
                    'From concept to deployment.'
                ),
                'featured': True,
            },
            {
                'title': 'UI/UX Design',
                'description': (
                    'User-centered design services that create intuitive and engaging '
                    'digital experiences for your customers.'
                ),
                'featured': False,
            },
            {
                'title': 'Cloud Migration Services',
                'description': (
                    'Seamlessly migrate your applications and data to the cloud '
                    'with our expert cloud migration services.'
                ),
                'featured': True,
            },
            {
                'title': 'Technical Consulting',
                'description': (
                    'Strategic technology consulting to help you make informed decisions '
                    'about your digital transformation.'
                ),
                'featured': False,
            },
            {
                'title': 'DevOps Implementation',
                'description': (
                    'Implement DevOps practices to improve your development workflow, '
                    'deployment process, and system reliability.'
                ),
                'featured': False,
            },
            {
                'title': 'API Development',
                'description': (
                    'Design and develop robust, scalable APIs that integrate '
                    'seamlessly with your existing systems.'
                ),
                'featured': False,
            },
            {
                'title': 'Database Optimization',
                'description': (
                    'Optimize your database performance and ensure data integrity '
                    'with our database management services.'
                ),
                'featured': False,
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
