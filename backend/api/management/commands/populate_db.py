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
from PIL import ImageDraw, ImageFont, Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter


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
        """Clear existing data"""
        # Clear enrollments first due to foreign key constraints
        try:
            from courses.models import Enrollment
            Enrollment.objects.all().delete()
        except Exception:
            pass
        
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
        
        # Define all user emails that should be deleted by this script
        sample_user_emails = [
            'admin@ordinaly.ai',
            'ana.rodriguez@healthtech.es',
            'miguel.fernandez@ecomarket.com',
            'laura.gonzalez@finnovation.es',
            'david.martin@smartedu.es',
            'sofia.jimenez@tourisminnovate.com',
            'carlos.ruiz@agritech.es',
            'maria.santos@creativestudio.es',
            'pablo.torres@logisticsplus.es',
            'elena.morales@retailinnovation.com',
            'javier.castro@techstartup.es',
            'carmen.herrera@energygreen.es',
            'raul.vega@digitalmarketing.es',
            'lucia.mendez@consulting.es',
            'sergio.pena@cybersecurity.es',
            'natalia.ramos@biotech.es'
        ]
        
        # Define all usernames that should be deleted by this script
        sample_usernames = [
            'demo_admin',
            'ana_rodriguez',
            'miguel_fernandez',
            'laura_gonzalez',
            'david_martin',
            'sofia_jimenez',
            'carlos_ruiz',
            'maria_santos',
            'pablo_torres',
            'elena_morales',
            'javier_castro',
            'carmen_herrera',
            'raul_vega',
            'lucia_mendez',
            'sergio_pena',
            'natalia_ramos'
        ]
        
        # Only delete users that were created by this script
        try:
            CustomUser.objects.filter(email__in=sample_user_emails).delete()
        except Exception:
            pass
        
        # Also delete by username to be safe
        try:
            CustomUser.objects.filter(username__in=sample_usernames).delete()
        except Exception:
            pass

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
                'username': 'carlos_ruiz',
                'email': 'carlos.ruiz@agritech.es',
                'name': 'Carlos',
                'surname': 'Ruiz',
                'company': 'AgriTech Solutions',
                'region': 'Castilla y León',
                'city': 'Valladolid',
            },
            {
                'username': 'maria_santos',
                'email': 'maria.santos@creativestudio.es',
                'name': 'María',
                'surname': 'Santos',
                'company': 'Creative Studio Pro',
                'region': 'Galicia',
                'city': 'A Coruña',
            },
            {
                'username': 'pablo_torres',
                'email': 'pablo.torres@logisticsplus.es',
                'name': 'Pablo',
                'surname': 'Torres',
                'company': 'Logistics Plus',
                'region': 'Aragón',
                'city': 'Zaragoza',
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
        """Create a sample image with vibrant colors and modern design"""
        if not PIL_AVAILABLE:
            # Create a simple SVG as fallback with better design
            svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgb({color[0]},{color[1]},{color[2]});stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb({min(255, color[0]+40)},{min(255, color[1]+40)},{min(255, color[2]+40)});stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="3" dy="3" stdDeviation="5" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad1)" rx="15" ry="15"/>
  <circle cx="90%" cy="20%" r="30" fill="white" opacity="0.1"/>
  <circle cx="10%" cy="80%" r="40" fill="white" opacity="0.08"/>
  <rect x="70%" y="75%" width="80" height="80" fill="white" opacity="0.05" rx="10"/>
  <text x="50%" y="45%" text-anchor="middle" dy=".3em" fill="white"
        font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" filter="url(#shadow)">
    {course_name}
  </text>
  <text x="50%" y="65%" text-anchor="middle" dy=".3em" fill="white"
        font-family="Arial, Helvetica, sans-serif" font-size="14" opacity="0.9">
    Professional Training Course
  </text>
</svg>'''
            return svg_content.encode('utf-8')

        try:
            # Create a proper JPEG image with modern gradient design
            # Create base image with gradient effect
            image = Image.new('RGB', (width, height), color)

            # Create a subtle gradient overlay
            overlay = Image.new('RGBA', (width, height), (255, 255, 255, 0))
            for y in range(height):
                alpha = int(30 * (1 - y / height))  # Fade from top to bottom
                for x in range(width):
                    overlay.putpixel((x, y), (255, 255, 255, alpha))

            # Composite the gradient
            image = Image.alpha_composite(image.convert('RGBA'), overlay)
            image = image.convert('RGB')

            draw = ImageDraw.Draw(image)

            # Try to use a font, fallback to default if not available
            try:
                title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
                subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
            except OSError:
                try:
                    title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
                    subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
                except OSError:
                    title_font = ImageFont.load_default()
                    subtitle_font = ImageFont.load_default()

            # Add decorative elements
            # Corner circles for modern look
            draw.ellipse([width*0.85, height*0.1, width*0.95, height*0.25], fill=(255, 255, 255, 30))
            draw.ellipse([width*0.05, height*0.7, width*0.2, height*0.9], fill=(255, 255, 255, 20))

            # Add main title with shadow
            title_bbox = draw.textbbox((0, 0), course_name, font=title_font)
            title_width = title_bbox[2] - title_bbox[0]
            title_height = title_bbox[3] - title_bbox[1]

            title_x = (width - title_width) // 2
            title_y = (height - title_height) // 2 - 20

            # Shadow for title
            draw.text((title_x+3, title_y+3), course_name, fill=(0, 0, 0, 80), font=title_font)
            # Main title
            draw.text((title_x, title_y), course_name, fill="white", font=title_font)

            # Add subtitle
            subtitle = "Professional Training Course"
            subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
            subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]

            subtitle_x = (width - subtitle_width) // 2
            subtitle_y = title_y + title_height + 10

            draw.text((subtitle_x, subtitle_y), subtitle, fill=(255, 255, 255, 200), font=subtitle_font)

            buffer = BytesIO()
            image.save(buffer, format='JPEG', quality=90, optimize=True)
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
        """Create comprehensive sample courses with diverse topics and schedules"""
        # Modern color palette for course images
        course_colors = [
            (34, 166, 13),    # Green - Web Development
            (98, 60, 234),    # Purple - Python
            (70, 177, 201),   # Cyan - Data Science
            (228, 87, 46),    # Orange - Mobile
            (26, 25, 36),     # Dark - DevOps
            (99, 60, 234),    # Purple - UX/UI
            (34, 166, 13),    # Green - AI/ML
            (70, 177, 201),   # Cyan - Cloud
            (228, 87, 46),    # Orange - Cybersecurity
            (98, 60, 234),    # Purple - Blockchain
            (34, 166, 13),    # Green - Full Stack
            (70, 177, 201),   # Cyan - Digital Marketing
        ]

        courses_data = [
            {
                'title': '🌐 Full Stack Web Development Bootcamp',
                'subtitle': 'Master modern web development from frontend to backend',
                'description': (
                    '⭐ **MOST POPULAR COURSE** ⭐\n\n'
                    'Become a full-stack developer in 12 weeks! Learn HTML5, CSS3, JavaScript ES6+, '
                    'React, Node.js, Express, MongoDB, and deployment strategies. Perfect for career changers '
                    'and beginners who want to enter the tech industry.\n\n'
                    '🎯 **What you\'ll build:**\n'
                    '• E-commerce website with payment integration\n'
                    '• Social media dashboard with real-time updates\n'
                    '• Personal portfolio with modern animations\n'
                    '• RESTful API with authentication'
                ),
                'price': Decimal('899.99'),
                'location': 'Madrid (Hybrid) + Online',
                'start_date': date(2024, 2, 15),
                'end_date': date(2024, 5, 15),
                'start_time': time(18, 30),
                'end_time': time(21, 30),
                'periodicity': 'weekly',
                'weekdays': [1, 3],  # Tuesday and Thursday
                'timezone': 'Europe/Madrid',
                'max_attendants': 25,
            },
            {
                'title': '🐍 Advanced Python & AI Development',
                'subtitle': 'Python mastery with artificial intelligence applications',
                'description': (
                    '🚀 **HIGH DEMAND SKILLS** 🚀\n\n'
                    'Master Python programming and dive into AI/ML development. Learn Django, FastAPI, '
                    'pandas, NumPy, scikit-learn, TensorFlow, and deployment on cloud platforms.\n\n'
                    '🤖 **AI Projects included:**\n'
                    '• Chatbot with natural language processing\n'
                    '• Image recognition system\n'
                    '• Predictive analytics dashboard\n'
                    '• Automated trading bot (educational purposes)'
                ),
                'price': Decimal('1299.99'),
                'location': 'Barcelona + Online',
                'start_date': date(2024, 3, 1),
                'end_date': date(2024, 6, 1),
                'start_time': time(19, 0),
                'end_time': time(22, 0),
                'periodicity': 'weekly',
                'weekdays': [0, 2],  # Monday and Wednesday
                'timezone': 'Europe/Madrid',
                'max_attendants': 20,
            },
            {
                'title': '📊 Data Science & Analytics Mastery',
                'subtitle': 'Transform data into actionable business insights',
                'description': (
                    '📈 **CAREER BOOSTER** 📈\n\n'
                    'Learn complete data science pipeline: collection, cleaning, analysis, visualization, '
                    'and machine learning. Use Python, R, SQL, Tableau, and cloud platforms.\n\n'
                    '💡 **Real business cases:**\n'
                    '• Customer churn prediction for telecoms\n'
                    '• Sales forecasting for retail\n'
                    '• Marketing campaign optimization\n'
                    '• Financial risk assessment models'
                ),
                'price': Decimal('1499.99'),
                'location': 'Valencia + Remote',
                'start_date': date(2024, 1, 20),
                'end_date': date(2024, 4, 20),
                'start_time': time(17, 30),
                'end_time': time(20, 30),
                'periodicity': 'weekly',
                'weekdays': [1, 4],  # Tuesday and Friday
                'timezone': 'Europe/Madrid',
                'max_attendants': 18,
            },
            {
                'title': '📱 Cross-Platform Mobile Development',
                'subtitle': 'Build iOS & Android apps with React Native & Flutter',
                'description': (
                    '📲 **MOBILE-FIRST WORLD** 📲\n\n'
                    'Create stunning mobile applications for both iOS and Android using React Native '
                    'and Flutter. Learn state management, navigation, APIs, push notifications, and app store deployment.\n\n'
                    '🏆 **Portfolio apps:**\n'
                    '• Food delivery app with real-time tracking\n'
                    '• Social fitness tracking application\n'
                    '• Expense manager with AI categorization\n'
                    '• Meditation app with custom audio'
                ),
                'price': Decimal('1199.99'),
                'location': 'Online (Live Sessions)',
                'start_date': date(2024, 4, 10),
                'end_date': date(2024, 7, 10),
                'start_time': time(18, 0),
                'end_time': time(21, 0),
                'periodicity': 'weekly',
                'weekdays': [2, 5],  # Wednesday and Saturday
                'timezone': 'Europe/Madrid',
                'max_attendants': 22,
            },
            {
                'title': '☁️ Cloud DevOps & Infrastructure',
                'subtitle': 'Modern deployment and scalable infrastructure management',
                'description': (
                    '⚡ **ENTERPRISE READY** ⚡\n\n'
                    'Master cloud platforms (AWS, Azure, GCP), containerization with Docker, '
                    'orchestration with Kubernetes, and CI/CD pipelines. Become a DevOps engineer!\n\n'
                    '🔧 **Infrastructure projects:**\n'
                    '• Auto-scaling web application on AWS\n'
                    '• Microservices architecture with Kubernetes\n'
                    '• Monitoring and logging with ELK stack\n'
                    '• Infrastructure as Code with Terraform'
                ),
                'price': Decimal('1699.99'),
                'location': 'Seville + Cloud Labs',
                'start_date': date(2024, 2, 1),
                'end_date': date(2024, 8, 1),
                'start_time': time(19, 30),
                'end_time': time(22, 30),
                'periodicity': 'weekly',
                'weekdays': [0, 3],  # Monday and Thursday
                'timezone': 'Europe/Madrid',
                'max_attendants': 15,
            },
            {
                'title': '🎨 UX/UI Design & Prototyping',
                'subtitle': 'Create exceptional user experiences that convert',
                'description': (
                    '🌟 **DESIGN THINKING** 🌟\n\n'
                    'Master user-centered design principles, prototyping tools (Figma, Adobe XD), '
                    'user research, accessibility, and design systems for web and mobile.\n\n'
                    '🎯 **Design portfolio:**\n'
                    '• Complete e-commerce redesign case study\n'
                    '• Mobile app for accessibility\n'
                    '• SaaS dashboard with complex workflows\n'
                    '• Design system for startup company'
                ),
                'price': Decimal('799.99'),
                'location': 'Bilbao + Online Studio',
                'start_date': date(2024, 3, 15),
                'end_date': date(2024, 6, 15),
                'start_time': time(18, 0),
                'end_time': time(21, 0),
                'periodicity': 'weekly',
                'weekdays': [1, 4],  # Tuesday and Friday
                'timezone': 'Europe/Madrid',
                'max_attendants': 20,
            },
            {
                'title': '🤖 AI & Machine Learning Engineering',
                'subtitle': 'Build and deploy production-ready AI systems',
                'description': (
                    '🧠 **CUTTING-EDGE AI** 🧠\n\n'
                    'Deep dive into machine learning algorithms, neural networks, deep learning with TensorFlow/PyTorch, '
                    'MLOps, and AI system deployment at scale.\n\n'
                    '🚀 **AI systems you\'ll build:**\n'
                    '• Computer vision for medical imaging\n'
                    '• Natural language processing chatbot\n'
                    '• Recommendation engine for e-commerce\n'
                    '• Real-time fraud detection system'
                ),
                'price': Decimal('1899.99'),
                'location': 'Madrid + GPU Labs',
                'start_date': date(2024, 5, 1),
                'end_date': date(2024, 9, 1),
                'start_time': time(19, 0),
                'end_time': time(22, 30),
                'periodicity': 'weekly',
                'weekdays': [2, 4],  # Wednesday and Friday
                'timezone': 'Europe/Madrid',
                'max_attendants': 12,
            },
            {
                'title': '🔒 Cybersecurity & Ethical Hacking',
                'subtitle': 'Protect systems and conduct security assessments',
                'description': (
                    '🛡️ **SECURITY FIRST** 🛡️\n\n'
                    'Learn penetration testing, network security, incident response, digital forensics, '
                    'and compliance frameworks. Hands-on labs with real-world scenarios.\n\n'
                    '🔍 **Security labs:**\n'
                    '• Penetration testing on virtual networks\n'
                    '• Digital forensics investigation\n'
                    '• Incident response simulation\n'
                    '• Vulnerability assessment and reporting'
                ),
                'price': Decimal('1399.99'),
                'location': 'Online Security Lab',
                'start_date': date(2024, 1, 15),
                'end_date': date(2024, 5, 15),
                'start_time': time(20, 0),
                'end_time': time(23, 0),
                'periodicity': 'weekly',
                'weekdays': [2, 5],  # Wednesday and Saturday
                'timezone': 'Europe/Madrid',
                'max_attendants': 16,
            },
            {
                'title': '🔗 Blockchain & Smart Contract Development',
                'subtitle': 'Build decentralized applications and cryptocurrency solutions',
                'description': (
                    '💎 **FUTURE TECHNOLOGY** 💎\n\n'
                    'Master blockchain technology, Ethereum development, Solidity programming, '
                    'DeFi protocols, NFT creation, and Web3 application development.\n\n'
                    '⛓️ **Blockchain projects:**\n'
                    '• Decentralized voting system\n'
                    '• NFT marketplace with smart contracts\n'
                    '• DeFi lending protocol\n'
                    '• Supply chain tracking DApp'
                ),
                'price': Decimal('1599.99'),
                'location': 'Online + Blockchain Testnet',
                'start_date': date(2024, 6, 1),
                'end_date': date(2024, 9, 1),
                'start_time': time(19, 30),
                'end_time': time(22, 30),
                'periodicity': 'weekly',
                'weekdays': [1, 3, 5],  # Tuesday, Thursday, Saturday
                'timezone': 'Europe/Madrid',
                'max_attendants': 14,
            },
            {
                'title': '💻 Complete Full Stack JavaScript',
                'subtitle': 'From beginner to advanced with MERN/MEAN stacks',
                'description': (
                    '🌐 **JAVASCRIPT ECOSYSTEM** 🌐\n\n'
                    'Comprehensive JavaScript training covering frontend, backend, databases, and deployment. '
                    'Learn React, Angular, Node.js, Express, MongoDB, and modern development workflows.\n\n'
                    '💡 **Full stack applications:**\n'
                    '• Task management SaaS platform\n'
                    '• Real-time chat application\n'
                    '• API-driven content management system\n'
                    '• Progressive Web App with offline support'
                ),
                'price': Decimal('999.99'),
                'location': 'A Coruña + Online',
                'start_date': date(2024, 2, 20),
                'end_date': date(2024, 6, 20),
                'start_time': time(18, 30),
                'end_time': time(21, 30),
                'periodicity': 'weekly',
                'weekdays': [0, 2, 4],  # Monday, Wednesday, Friday
                'timezone': 'Europe/Madrid',
                'max_attendants': 24,
            },
            {
                'title': '📈 Digital Marketing & Growth Hacking',
                'subtitle': 'Data-driven marketing strategies for digital growth',
                'description': (
                    '🚀 **GROWTH MINDSET** 🚀\n\n'
                    'Learn modern digital marketing: SEO/SEM, social media marketing, email automation, '
                    'analytics, conversion optimization, and growth hacking strategies.\n\n'
                    '📊 **Marketing campaigns:**\n'
                    '• Complete digital strategy for startup\n'
                    '• Multi-channel campaign optimization\n'
                    '• Marketing automation workflows\n'
                    '• Performance analytics dashboard'
                ),
                'price': Decimal('699.99'),
                'location': 'Online + Marketing Labs',
                'start_date': date(2024, 3, 10),
                'end_date': date(2024, 6, 10),
                'start_time': time(17, 0),
                'end_time': time(20, 0),
                'periodicity': 'weekly',
                'weekdays': [1, 3],  # Tuesday and Thursday
                'timezone': 'Europe/Madrid',
                'max_attendants': 30,
            },
            {
                'title': '🔧 DevOps Engineering Intensive',
                'subtitle': 'Production-ready deployment and infrastructure automation',
                'description': (
                    '⚙️ **PRODUCTION READY** ⚙️\n\n'
                    'Intensive hands-on DevOps training focusing on CI/CD, infrastructure automation, '
                    'monitoring, security, and cloud-native technologies.\n\n'
                    '🔄 **DevOps pipeline projects:**\n'
                    '• Complete CI/CD with GitLab/Jenkins\n'
                    '• Container orchestration with Kubernetes\n'
                    '• Infrastructure monitoring with Prometheus\n'
                    '• Security scanning and compliance automation'
                ),
                'price': Decimal('1549.99'),
                'location': 'Remote + Cloud Infrastructure',
                'start_date': date(2024, 4, 20),
                'end_date': date(2024, 8, 20),
                'start_time': time(19, 0),
                'end_time': time(22, 0),
                'periodicity': 'weekly',
                'weekdays': [0, 3],  # Monday and Thursday
                'timezone': 'Europe/Madrid',
                'max_attendants': 18,
            },
        ]

        courses = []
        for i, course_data in enumerate(courses_data):
            # Use vibrant colors for each course
            color = course_colors[i % len(course_colors)]

            # Create sample image with course title
            short_title = course_data['title'].replace('🌐 ', '').replace('🐍 ', '').replace('📊 ', '').replace('📱 ', '').replace('☁️ ', '').replace('🎨 ', '').replace('🤖 ', '').replace('🔒 ', '').replace('🔗 ', '').replace('💻 ', '').replace('📈 ', '').replace('🔧 ', '')
            image_content = self.create_sample_image(course_name=short_title[:25], color=color)

            course, created = Course.objects.get_or_create(
                title=course_data['title'],
                defaults={
                    **course_data,
                    'image': ContentFile(image_content, name=f"course_{i+1}.jpg"),
                }
            )
            if created:
                courses.append(course)

        return courses

    def create_enrollments(self, users, courses):
        """Create realistic enrollments with positive use cases showing course completions"""
        try:
            from courses.models import Enrollment
        except ImportError:
            self.stdout.write('Enrollment model not available, skipping enrollments')
            return []

        import random
        from datetime import datetime, timedelta

        enrollments = []

        # Skip admin user for enrollments (first user)
        regular_users = users[1:]  # Skip the admin user

        # Create realistic enrollment patterns
        enrollment_patterns = [
            # High engagement users (enroll in multiple courses)
            {'user_indices': [0, 1, 2], 'courses_per_user': [4, 5, 3]},
            # Medium engagement users
            {'user_indices': [3, 4, 5, 6], 'courses_per_user': [2, 3, 2, 2]},
            # Occasional learners
            {'user_indices': [7, 8, 9, 10], 'courses_per_user': [1, 1, 2, 1]},
            # Career changers (focused on specific tracks)
            {'user_indices': [11, 12, 13, 14], 'courses_per_user': [3, 2, 3, 2]},
        ]

        # Popular courses that should have more enrollments
        popular_course_indices = [0, 1, 2, 3, 6]  # Web Dev, Python, Data Science, Mobile, AI

        for pattern in enrollment_patterns:
            for i, user_index in enumerate(pattern['user_indices']):
                if user_index >= len(regular_users):
                    continue
 
                user = regular_users[user_index]
                num_courses = pattern['courses_per_user'][i]

                # Select courses for this user
                available_courses = list(courses)
                selected_courses = []

                # Give preference to popular courses
                if random.random() < 0.7:  # 70% chance to take a popular course
                    popular_courses = [courses[i] for i in popular_course_indices if i < len(courses)]
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
                    except Exception as e:
                        # Handle any unique constraint violations gracefully
                        continue

        # Ensure popular courses have good enrollment numbers
        for course_index in popular_course_indices:
            if course_index >= len(courses):
                continue

            course = courses[course_index]
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
        """Create comprehensive sample services with detailed markdown descriptions"""
        services_data = [
            {
                'title': '🌐 Custom Web Development',
                'subtitle': 'Modern responsive websites that drive results',
                'description': '''# 🚀 Transform Your Digital Presence

Professional web development services tailored to your business needs. We create **responsive**, modern websites using cutting-edge technologies that not only look stunning but also deliver exceptional performance and user experience.

## 🛠️ **Technologies We Master**

| Frontend | Backend | Database | DevOps |
|----------|---------|----------|--------|
| 🔥 **React 18** | 🐍 **Python/Django** | 🐘 **PostgreSQL** | ☁️ **AWS/Azure** |
| ⚡ **Next.js 14** | 🟢 **Node.js** | 🍃 **MongoDB** | 🐳 **Docker** |
| 💻 **TypeScript** | 🦀 **Rust** | 🔥 **Firebase** | 🔄 **CI/CD** |
| 🎨 **Tailwind CSS** | ⚡ **FastAPI** | 📊 **Redis** | 📊 **Analytics** |

## ✨ **What Makes Us Different**

> 💡 *"We don't just build websites, we craft digital experiences that convert visitors into customers."*

### 🎯 **Performance-First Approach**
- ⚡ **90+ PageSpeed** scores guaranteed
- 📱 **Mobile-first** responsive design
- 🔍 **SEO optimized** from the ground up
- ♿ **WCAG accessibility** compliant

### 🛡️ **Security & Reliability**
- 🔒 **SSL encryption** and security headers
- 🛡️ **Regular security audits** and updates
- 💾 **Automated backups** and disaster recovery
- 🚀 **99.9% uptime** with monitoring

## 📈 **Perfect For**

- 🏢 **Businesses** looking to establish online presence
- 🛒 **E-commerce** stores wanting to increase sales
- 🎓 **Educational institutions** needing modern platforms
- 💼 **Startups** requiring scalable solutions

### 🎁 **Bonus Features Included**
- 📊 Google Analytics setup
- 🔍 SEO optimization package
- 📱 Mobile app PWA conversion
- 🤝 3 months free support

*Ready to elevate your digital presence?*''',
                'color': '29BF12',
                'icon': 'Globe',
                'duration': 160,
                'price': Decimal('2899.00'),
                'is_featured': True,
            },
            {
                'title': '📱 Mobile App Development',
                'subtitle': 'Native iOS & Android applications that users love',
                'description': '''# 📲 Your App Idea, Our Expertise

Transform your innovative ideas into powerful mobile applications that millions will love to use. From *concept* to **App Store deployment**, we handle every aspect of mobile development with precision and creativity.

## 🌟 **Development Platforms**

### 📱 **Native Development**
- 🍎 **iOS Swift** - Pure performance and Apple ecosystem integration
- 🤖 **Android Kotlin** - Modern, concise, and fully Google-supported
- 💎 **Flutter** - Beautiful UIs with single codebase efficiency
- ⚛️ **React Native** - JavaScript expertise with native performance

## 🏆 **Our App Development Process**

> 🎯 *"Every great app starts with understanding your users' needs"*

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| 📋 **Discovery** | 1-2 weeks | User research, wireframes, technical specifications |
| 🎨 **Design** | 2-3 weeks | UI/UX mockups, interactive prototypes, design system |
| 💻 **Development** | 8-12 weeks | MVP, testing, performance optimization |
| 🚀 **Launch** | 1-2 weeks | App store submission, marketing assets, analytics |

## ✨ **Features We Integrate**

### 🔔 **Advanced Functionality**
- 📲 Push notifications with personalization
- 📍 Location-based services and geofencing
- 💳 Payment gateway integration (Stripe, PayPal)
- 📸 Camera, gallery, and media processing
- 🔄 Real-time synchronization and offline support
- 🔐 Biometric authentication (Face ID, Touch ID)

### 🤖 **AI-Powered Features**
- 🧠 Machine learning recommendations
- 🗣️ Voice recognition and commands
- 👁️ Computer vision and image processing
- 💬 Intelligent chatbots and virtual assistants

## 📊 **Success Metrics**
- 🌟 **4.8+ stars** average app rating
- 📈 **2M+ downloads** across our portfolio
- 🚀 **99% client satisfaction** rate
- ⏱️ **30% faster** time-to-market

### 🎁 **Package Includes**
- 📱 iOS & Android versions
- 🌐 Admin web dashboard
- 📊 Analytics integration
- 📚 Complete documentation
- 🛠️ 6 months maintenance

*Ready to build the next big app?*''',
                'color': '623CEA',
                'icon': 'Smartphone',
                'duration': 200,
                'price': Decimal('4299.00'),
                'is_featured': True,
            },
            {
                'title': '🎨 UI/UX Design Excellence',
                'subtitle': 'User-centered design that converts and delights',
                'description': '''# 🎯 Design That Drives Results

User-centered design services that create **intuitive** and engaging digital experiences. We don't just make things look pretty - we design experiences that convert visitors into loyal customers and drive measurable business growth.

## 🧠 **Our Design Philosophy**

> *"Good design is not just what it looks like - good design is how it works."* — **Steve Jobs**

### 🔍 **Research-Driven Approach**
- 👥 **User persona development** with real data
- 🧪 **A/B testing** for design decisions
- 📊 **Analytics review** to identify pain points
- 🗣️ **User interviews** and feedback sessions

## 🎨 **Design Process Excellence**

| Step | Focus | Outcome |
|------|-------|---------|
| 🔬 **Research** | Understanding users and business goals | User personas, journey maps |
| 💡 **Ideation** | Creative problem-solving sessions | Concept sketches, user flows |
| 🖼️ **Wireframing** | Structure and information architecture | Low/high-fidelity wireframes |
| 🎨 **Visual Design** | Brand alignment and aesthetics | Style guides, UI components |
| 🔄 **Prototyping** | Interactive user testing | Clickable prototypes |
| ✅ **Testing** | Validation and optimization | Usability reports, improvements |

## 🛠️ **Design Tools & Technologies**

### 🔧 **Professional Tools**
- 🎨 **Figma** - Collaborative design and prototyping
- 💎 **Adobe Creative Suite** - Advanced graphics and branding
- 📱 **Principle** - Micro-interactions and animations
- 🔍 **Maze** - User testing and feedback collection
- 📊 **Hotjar** - User behavior analysis
- ⚡ **Webflow** - No-code development platform

## 🏆 **Design Specializations**

### 💼 **Enterprise Solutions**
- 🏢 Complex SaaS dashboards
- 📊 Data visualization interfaces
- 🔐 Admin panels and workflows
- 📋 Form optimization and conversion

### 🛒 **E-commerce Excellence**
- 🛍️ Product catalog design
- 💳 Checkout flow optimization
- 📱 Mobile shopping experiences
- 🎁 Promotional campaign interfaces

### 📱 **Mobile-First Design**
- 📲 Progressive Web Apps (PWA)
- 🖥️ Responsive design systems
- 👆 Touch-friendly interactions
- ⚡ Performance-optimized interfaces

## 📈 **Impact Metrics**

> 📊 *Average improvements for our clients:*

- 🚀 **85% increase** in user engagement
- 💰 **60% boost** in conversion rates
- ⏱️ **40% reduction** in bounce rate
- 🌟 **95% improvement** in user satisfaction scores

## 🎁 **Complete Package Includes**

### 📋 **Deliverables**
- 🎨 Complete design system and style guide
- 📱 Mobile and desktop responsive designs
- 🔄 Interactive prototypes for testing
- 💻 Developer-ready assets and specifications
- 📊 Usability testing reports and recommendations

### 🔄 **Ongoing Support**
- 🛠️ 30 days of design revisions
- 📚 Design system documentation
- 👨‍💻 Developer handoff assistance
- 📈 Post-launch performance analysis

*Transform your digital presence with design that works.*''',
                'color': '46B1C9',
                'icon': 'Palette',
                'duration': 80,
                'price': Decimal('1899.00'),
                'is_featured': False,
            },
            {
                'title': '☁️ Cloud Migration & Optimization',
                'subtitle': 'Seamless cloud transformation for modern businesses',
                'description': '''# 🚀 Accelerate Your Digital Transformation

Seamlessly migrate your applications and data to the cloud with our expert cloud migration services. We ensure **zero downtime**, enhanced security, and significant cost savings while future-proofing your infrastructure.

## ☁️ **Multi-Cloud Expertise**

### 🔥 **Platform Specializations**
| Platform | Specialty | Benefits |
|----------|-----------|----------|
| 🟠 **AWS** | Enterprise scalability | Industry leader, extensive services |
| 🔵 **Microsoft Azure** | Hybrid cloud solutions | Perfect for Windows environments |
| 🔴 **Google Cloud** | AI/ML integration | Advanced analytics and BigQuery |
| 🟣 **Multi-Cloud** | Vendor independence | Risk mitigation and flexibility |

## 🛠️ **Migration Strategies**

### 📋 **The 7 R's of Cloud Migration**
1. 🔄 **Re-host** (Lift & Shift) - Quick cloud adoption
2. 🔧 **Re-platform** - Minor optimizations during migration
3. 🏗️ **Re-architect** - Cloud-native reconstruction
4. 🛒 **Re-purchase** - SaaS replacement solutions
5. 🏠 **Retain** - Keep on-premises when necessary
6. 🗑️ **Retire** - Eliminate redundant systems
7. 📍 **Relocate** - Hypervisor-level migration

## 🎯 **Migration Process Excellence**

> 🔍 *"Proper planning prevents poor performance"*

### Phase 1: 📊 **Assessment & Planning** (2-4 weeks)
- 🔍 Current infrastructure audit
- 💰 Cost-benefit analysis and ROI projections
- 🛡️ Security and compliance gap analysis
- 📋 Detailed migration roadmap creation

### Phase 2: 🏗️ **Architecture Design** (1-3 weeks)
- ☁️ Cloud architecture blueprint
- 🔐 Security framework implementation
- 📊 Performance optimization strategy
- 🔄 Disaster recovery planning

### Phase 3: 🚀 **Migration Execution** (4-12 weeks)
- 📦 Application containerization
- 🔄 Data synchronization and transfer
- ⚖️ Load balancing and auto-scaling setup
- 🧪 Comprehensive testing protocols

### Phase 4: 🎯 **Optimization & Support** (Ongoing)
- 📈 Performance monitoring and tuning
- 💰 Cost optimization recommendations
- 🛡️ Security updates and patches
- 📚 Team training and knowledge transfer

## ⚡ **Cloud-Native Technologies**

### 🐳 **Containerization & Orchestration**
- **Docker** containers for application packaging
- **Kubernetes** for container orchestration
- **Helm** charts for application deployment
- **Istio** service mesh for microservices

### 🔄 **CI/CD & DevOps**
- **GitLab CI/CD** for automated deployments
- **Terraform** for infrastructure as code
- **Ansible** for configuration management
- **Prometheus & Grafana** for monitoring

## 💰 **Cost Optimization Strategies**

### 📊 **Average Savings Achieved**
- 💵 **30-50% reduction** in infrastructure costs
- ⚡ **40% improvement** in application performance
- 🛡️ **99.9% uptime** with enhanced reliability
- 🔄 **60% faster** deployment cycles

### 🎯 **Optimization Techniques**
- 📏 Right-sizing instances based on actual usage
- 💾 Intelligent storage tiering and archiving
- 🕐 Scheduled scaling for predictable workloads
- 💡 Reserved instances and spot instance utilization

## 🛡️ **Security & Compliance**

### 🔐 **Security Best Practices**
- 🔑 Identity and Access Management (IAM)
- 🌐 Virtual Private Cloud (VPC) configuration
- 🛡️ Web Application Firewall (WAF) setup
- 📊 Security monitoring and incident response

### 📋 **Compliance Standards**
- ⚖️ **GDPR** - European data protection
- 🏥 **HIPAA** - Healthcare information security
- 💳 **PCI DSS** - Payment card industry standards
- 🏢 **SOC 2** - Service organization controls

## 🎁 **Complete Migration Package**

### 📦 **What's Included**
- 🔍 Comprehensive infrastructure assessment
- ☁️ Custom cloud architecture design
- 🚀 Full migration execution with zero downtime
- 📊 Performance monitoring and optimization
- 🛡️ Security hardening and compliance setup
- 📚 Team training and documentation
- 🤝 3 months post-migration support

*Ready to embrace the cloud advantage?*''',
                'color': '1A1924',
                'icon': 'Cloud',
                'duration': 120,
                'price': Decimal('5999.00'),
                'is_featured': True,
            },
            {
                'title': '🧠 AI/ML Technical Consulting',
                'subtitle': 'Strategic AI guidance for competitive advantage',
                'description': '''# 🤖 Unlock the Power of Artificial Intelligence

Strategic AI and Machine Learning consulting to help you make **informed decisions** about your digital transformation. We bridge the gap between cutting-edge AI technology and practical business applications.

## 🎯 **AI Strategy & Implementation**

### 🔍 **AI Readiness Assessment**
> 📊 *"Is your organization ready for AI transformation?"*

- 📋 **Data maturity evaluation** - Quality, volume, and accessibility
- 🏗️ **Infrastructure assessment** - Computing power and scalability
- 👥 **Team capability analysis** - Skills gap identification
- 📈 **Business case development** - ROI projections and KPIs

## 🛠️ **AI/ML Technologies We Master**

| Category | Technologies | Use Cases |
|----------|-------------|-----------|
| 🧠 **Machine Learning** | Scikit-learn, XGBoost, LightGBM | Predictive analytics, classification |
| 🔥 **Deep Learning** | TensorFlow, PyTorch, Keras | Computer vision, NLP, neural networks |
| 💬 **NLP & LLMs** | OpenAI GPT, BERT, Hugging Face | Chatbots, sentiment analysis, translation |
| 👁️ **Computer Vision** | OpenCV, YOLO, MediaPipe | Object detection, image recognition |
| 📊 **MLOps** | MLflow, Kubeflow, DVC | Model deployment, versioning, monitoring |

## 🚀 **AI Implementation Roadmap**

### Phase 1: 🔍 **Discovery & Strategy** (2-4 weeks)
- 🎯 Business objective alignment
- 📊 Data audit and preparation strategy
- 🛠️ Technology stack recommendations
- 💰 Budget and timeline planning

### Phase 2: 🧪 **Proof of Concept** (4-8 weeks)
- 📈 MVP model development
- 🧪 Algorithm testing and validation
- 📊 Performance metrics establishment
- 🎯 Business impact demonstration

### Phase 3: 🏗️ **Production Deployment** (8-16 weeks)
- ⚡ Scalable infrastructure setup
- 🔄 CI/CD pipeline implementation
- 📊 Monitoring and alerting systems
- 🛡️ Security and compliance measures

### Phase 4: 📈 **Optimization & Scaling** (Ongoing)
- 🔄 Model retraining and updates
- 📊 Performance monitoring and tuning
- 🚀 Feature expansion and enhancement
- 👨‍💼 Team training and knowledge transfer

## 🏆 **Industry-Specific AI Solutions**

### 🏥 **Healthcare**
- 🔬 Medical image analysis and diagnosis
- 💊 Drug discovery and development
- 📋 Electronic health record optimization
- 🤖 Virtual health assistants

### 🏦 **Financial Services**
- 🔍 Fraud detection and prevention
- 💰 Algorithmic trading strategies
- 📊 Risk assessment and credit scoring
- 🤝 Customer service chatbots

### 🛒 **E-commerce & Retail**
- 🎯 Personalized recommendation engines
- 📦 Inventory optimization
- 💰 Dynamic pricing strategies
- 📈 Customer lifetime value prediction

### 🏭 **Manufacturing**
- 🔧 Predictive maintenance systems
- 🏭 Quality control automation
- ⚡ Supply chain optimization
- 🤖 Robotic process automation

## 📊 **Success Metrics & ROI**

### 📈 **Typical Business Improvements**
- 💰 **25-40% cost reduction** through automation
- ⚡ **60% faster** decision-making processes
- 📊 **35% improvement** in prediction accuracy
- 🎯 **50% increase** in customer satisfaction

### 🎯 **Key Performance Indicators**
- 🔄 Model accuracy and performance metrics
- ⏱️ Time to insight and decision speed
- 💰 Cost savings and revenue generation
- 👥 User adoption and satisfaction rates

## 🛡️ **AI Ethics & Governance**

### ⚖️ **Responsible AI Practices**
- 🔍 **Bias detection and mitigation** strategies
- 🛡️ **Data privacy and security** compliance
- 📋 **Explainable AI** for transparency
- ⚖️ **Ethical AI governance** frameworks

## 🎁 **Consulting Package Includes**

### 📋 **Deliverables**
- 🔍 Comprehensive AI readiness assessment
- 📊 Custom AI strategy and roadmap
- 🧪 Proof of concept development
- 📚 Implementation guidelines and best practices
- 👨‍💼 Team training and capability building
- 🤝 3 months of ongoing support and guidance

### 🔧 **Technical Support**
- 🛠️ Architecture design and review
- 📦 Model development and deployment
- 📊 Performance monitoring setup
- 🔄 Continuous improvement recommendations

*Ready to lead with AI innovation?*''',
                'color': 'E4572E',
                'icon': 'Brain',
                'duration': 40,
                'price': Decimal('1299.00'),
                'is_featured': False,
            },
            {
                'title': '🔧 DevOps Transformation',
                'subtitle': 'Streamlined development workflows that scale',
                'description': '''# ⚡ Accelerate Your Development Velocity

Transform your development workflow with modern DevOps practices that improve deployment frequency, reduce lead times, and enhance system **reliability**. Build a culture of collaboration between development and operations teams.

## 🎯 **DevOps Maturity Assessment**

### 📊 **Current State Analysis**
> 🔍 *"Where are you in your DevOps journey?"*

| Maturity Level | Characteristics | Typical Metrics |
|---------------|----------------|-----------------|
| 🌱 **Initial** | Manual deployments, siloed teams | Monthly releases, 50% failure rate |
| 🚀 **Developing** | Basic automation, some collaboration | Weekly releases, 30% failure rate |
| 💪 **Optimized** | Full CI/CD, DevOps culture | Daily releases, 10% failure rate |
| 🏆 **Advanced** | Self-healing systems, chaos engineering | Multiple daily releases, <5% failure rate |

## 🛠️ **DevOps Technology Stack**

### 🔄 **CI/CD Pipeline Tools**
- **GitLab CI/CD** - Complete DevOps platform
- **Jenkins** - Flexible automation server
- **GitHub Actions** - Native GitHub integration
- **Azure DevOps** - Microsoft ecosystem integration

### 🐳 **Containerization & Orchestration**
- **Docker** - Application containerization
- **Kubernetes** - Container orchestration at scale
- **Helm** - Kubernetes package management
- **Istio** - Service mesh for microservices

### 🏗️ **Infrastructure as Code**
- **Terraform** - Multi-cloud infrastructure provisioning
- **Ansible** - Configuration management and automation
- **CloudFormation** - AWS-native infrastructure management
- **Pulumi** - Modern infrastructure as code

### 📊 **Monitoring & Observability**
- **Prometheus** - Metrics collection and alerting
- **Grafana** - Visualization and dashboards
- **ELK Stack** - Centralized logging solution
- **Jaeger** - Distributed tracing

## 🚀 **DevOps Implementation Roadmap**

### Phase 1: 🔍 **Assessment & Planning** (1-2 weeks)
- 📋 Current workflow analysis
- 🎯 Goal setting and KPI definition
- 🛠️ Technology stack selection
- 👥 Team structure optimization

### Phase 2: 🏗️ **Foundation Setup** (2-4 weeks)
- 🔧 Version control system optimization
- 🐳 Containerization strategy implementation
- ☁️ Cloud infrastructure provisioning
- 🔐 Security and compliance framework

### Phase 3: 🔄 **CI/CD Pipeline Development** (3-6 weeks)
- 🧪 Automated testing framework
- 📦 Build and deployment automation
- 🚀 Release management processes
- 🔍 Quality gates and approvals

### Phase 4: 📊 **Monitoring & Optimization** (2-4 weeks)
- 📈 Metrics and alerting setup
- 🔍 Performance monitoring implementation
- 📊 Dashboard and reporting creation
- 🔄 Continuous improvement processes

## 🏆 **DevOps Best Practices**

### 🧪 **Testing Strategies**
- **Unit Testing** - Code-level quality assurance
- **Integration Testing** - Component interaction validation
- **End-to-End Testing** - Full workflow verification
- **Performance Testing** - Load and stress testing
- **Security Testing** - Vulnerability scanning

### 🔐 **Security Integration (DevSecOps)**
- 🛡️ **Static Application Security Testing (SAST)**
- 🔍 **Dynamic Application Security Testing (DAST)**
- 📦 **Container security scanning**
- 🔐 **Secret management and rotation**
- ⚖️ **Compliance automation**

### 📊 **Monitoring & Alerting**
- ⚡ **Real-time performance monitoring**
- 🚨 **Intelligent alerting and escalation**
- 📈 **Capacity planning and forecasting**
- 🔍 **Root cause analysis automation**

## 📈 **DevOps Success Metrics**

### 🎯 **Key Performance Indicators**
| Metric | Before DevOps | After DevOps | Improvement |
|--------|---------------|---------------|-------------|
| 🚀 **Deployment Frequency** | Monthly | Multiple daily | 30x faster |
| ⏱️ **Lead Time** | 2-6 months | 1-7 days | 90% reduction |
| 🔧 **Mean Time to Recovery** | 2-24 hours | <1 hour | 95% reduction |
| ✅ **Change Failure Rate** | 30-60% | <10% | 80% improvement |

### 💰 **Business Impact**
- 🚀 **60% faster** time-to-market
- 💰 **35% reduction** in operational costs
- 📈 **50% improvement** in customer satisfaction
- 🛡️ **85% fewer** security incidents

## 🎁 **Complete DevOps Package**

### 🛠️ **Implementation Services**
- 🔍 DevOps maturity assessment
- 🏗️ Custom CI/CD pipeline development
- ☁️ Cloud infrastructure automation
- 📊 Monitoring and alerting setup
- 🔐 Security integration and compliance
- 👨‍💼 Team training and culture transformation

### 📚 **Documentation & Training**
- 📋 Process documentation and runbooks
- 🎓 Team training and certification paths
- 🔄 Best practices guidelines
- 🚨 Incident response procedures

### 🤝 **Ongoing Support**
- 🛠️ 6 months of implementation support
- 📞 24/7 monitoring and alerting
- 🔄 Monthly optimization reviews
- 📈 Quarterly performance assessments

*Ready to revolutionize your development process?*''',
                'color': '623CEA',
                'icon': 'Settings',
                'duration': 100,
                'price': Decimal('3499.00'),
                'is_featured': False,
            },
            {
                'title': '🔗 API Development & Integration',
                'subtitle': 'Robust system integrations that scale',
                'description': '''# 🌐 Connect Everything Seamlessly

Design and develop **robust**, scalable APIs that integrate seamlessly with your existing systems. Create the digital backbone that powers modern applications and enables business growth through intelligent connectivity.

## 🛠️ **API Technologies & Standards**

### 🔧 **API Architectures**
| Type | Best For | Benefits |
|------|----------|----------|
| 🔄 **REST** | Web applications, CRUD operations | Simple, stateless, cacheable |
| ⚡ **GraphQL** | Complex data requirements | Single endpoint, flexible queries |
| 🚀 **gRPC** | Microservices, high performance | Binary protocol, type safety |
| 🔌 **WebSocket** | Real-time applications | Bidirectional, low latency |
| 📡 **Webhook** | Event-driven integrations | Push notifications, automation |

## 🏗️ **API Development Process**

### Phase 1: 📋 **Planning & Design** (1-2 weeks)
- 🎯 **Requirements gathering** and use case analysis
- 📊 **Data modeling** and schema design
- 🔐 **Security architecture** planning
- 📚 **API specification** documentation (OpenAPI/Swagger)

### Phase 2: 💻 **Development** (3-8 weeks)
- 🏗️ **Core API implementation** with best practices
- 🧪 **Automated testing** suite development
- 🔐 **Authentication & authorization** implementation
- ⚡ **Performance optimization** and caching strategies

### Phase 3: 🧪 **Testing & Documentation** (1-2 weeks)
- 🔍 **Comprehensive testing** (unit, integration, load)
- 📚 **Interactive documentation** creation
- 🎯 **Developer experience** optimization
- 🚀 **Deployment pipeline** setup

### Phase 4: 🚀 **Deployment & Monitoring** (1 week)
- ☁️ **Production deployment** with zero downtime
- 📊 **Monitoring and analytics** implementation
- 🚨 **Alerting and incident response** setup
- 🔄 **Versioning strategy** implementation

## 🔐 **Security & Authentication**

### 🛡️ **Security Best Practices**
- **OAuth 2.0 / OpenID Connect** - Industry-standard authorization
- **JWT Tokens** - Stateless authentication
- **API Key Management** - Secure access control
- **Rate Limiting** - DDoS protection and fair usage
- **Input Validation** - SQL injection and XSS prevention
- **HTTPS Encryption** - Data in transit protection

### 🔒 **Advanced Security Features**
- 🔍 **API Gateway** - Centralized security and routing
- 🛡️ **WAF Integration** - Web application firewall
- 📊 **Audit Logging** - Complete request/response tracking
- 🔐 **Secret Management** - Secure credential storage
- ⚖️ **Compliance** - GDPR, HIPAA, SOX standards

## ⚡ **Performance & Scalability**

### 🚀 **Optimization Strategies**
- 💾 **Intelligent Caching** - Redis, CDN integration
- 📊 **Database Optimization** - Query optimization, indexing
- 🔄 **Asynchronous Processing** - Background jobs, queues
- ⚖️ **Load Balancing** - High availability and distribution
- 📈 **Auto-scaling** - Dynamic resource allocation

### 📊 **Performance Metrics**
- ⚡ **Response Time** - Sub-100ms for simple queries
- 🚀 **Throughput** - 1000+ requests per second capability
- ⏰ **Uptime** - 99.9% availability guarantee
- 📈 **Scalability** - Linear scaling with load

## 🧩 **Integration Capabilities**

### 🌐 **Popular Integrations**
- 💳 **Payment Gateways** - Stripe, PayPal, Square
- 📧 **Email Services** - SendGrid, Mailgun, AWS SES
- 📱 **SMS/Communication** - Twilio, WhatsApp Business
- ☁️ **Cloud Services** - AWS, Azure, Google Cloud
- 📊 **Analytics** - Google Analytics, Mixpanel
- 🗄️ **CRM Systems** - Salesforce, HubSpot, Pipedrive

### 🔄 **Legacy System Integration**
- 🏢 **Enterprise Systems** - SAP, Oracle, Microsoft Dynamics
- 🗃️ **Database Connectivity** - SQL Server, PostgreSQL, MongoDB
- 📁 **File Systems** - FTP, SFTP, cloud storage
- 🔌 **SOAP/XML Services** - Legacy web service integration

## 📚 **Documentation & Developer Experience**

### 📖 **Comprehensive Documentation**
- 🔧 **Interactive API Explorer** - Swagger/OpenAPI interface
- 💻 **Code Examples** - Multiple programming languages
- 🚀 **Quick Start Guides** - Get developers up and running fast
- 📋 **Use Case Tutorials** - Real-world implementation examples
- 🔍 **Troubleshooting Guide** - Common issues and solutions

### 🛠️ **Developer Tools**
- 📦 **SDKs and Libraries** - Popular programming languages
- 🧪 **Postman Collections** - Ready-to-use API testing
- 🔧 **CLI Tools** - Command-line integration utilities
- 📊 **Analytics Dashboard** - Usage metrics and insights

## 📈 **API Success Metrics**

### 🎯 **Key Performance Indicators**
- 📊 **API Adoption Rate** - Developer onboarding speed
- ⚡ **Response Time** - Average and 95th percentile
- 🚀 **Throughput** - Requests per second capacity
- ✅ **Success Rate** - Error rate minimization
- 👨‍💻 **Developer Satisfaction** - Ease of integration

### 💰 **Business Impact**
- 🚀 **50% faster** partner integrations
- 💰 **30% reduction** in integration costs
- 📈 **3x increase** in developer adoption
- 🔄 **40% improvement** in system interoperability

## 🎁 **Complete API Package**

### 🛠️ **Development Services**
- 🏗️ Custom API architecture and development
- 🔐 Security implementation and testing
- ⚡ Performance optimization and scaling
- 📚 Comprehensive documentation creation
- 🧪 Automated testing suite development
- 🚀 Deployment and monitoring setup

### 📋 **Documentation & Support**
- 📖 Interactive API documentation
- 💻 Code examples and SDKs
- 🎓 Developer onboarding materials
- 🔧 Testing tools and utilities

### 🤝 **Ongoing Maintenance**
- 🛠️ 3 months of bug fixes and updates
- 📊 Performance monitoring and optimization
- 🔄 Version management and migration support
- 🚨 24/7 monitoring and incident response

*Ready to unlock the power of connected systems?*''',
                'color': '46B1C9',
                'icon': 'Code',
                'duration': 80,
                'price': Decimal('2299.00'),
                'is_featured': False,
            },
            {
                'title': '🗄️ Database Design & Optimization',
                'subtitle': 'High-performance data architecture that scales',
                'description': '''# 📊 Your Data, Optimized for Success

Optimize your database performance and ensure data **integrity** with our comprehensive database management services. From design to deployment, we create data architectures that scale with your business.

## 🏗️ **Database Technologies**

### 🗃️ **Relational Databases**
| Database | Best For | Key Features |
|----------|----------|--------------|
| 🐘 **PostgreSQL** | Complex queries, analytics | ACID compliance, JSON support, extensibility |
| 🐬 **MySQL** | Web applications, read-heavy | High performance, replication, clustering |
| 🔷 **SQL Server** | Enterprise applications | Integration with Microsoft stack |
| 🔶 **Oracle** | Large enterprise systems | Advanced features, high availability |

### 🍃 **NoSQL Databases**
| Database | Best For | Key Features |
|----------|----------|--------------|
| 🍃 **MongoDB** | Document storage, rapid development | Flexible schema, horizontal scaling |
| 🔥 **Redis** | Caching, real-time analytics | In-memory speed, pub/sub messaging |
| ⚡ **Cassandra** | Big data, time-series | Linear scalability, fault tolerance |
| 📊 **InfluxDB** | Time-series data, IoT | Optimized for time-based data |

## 🎯 **Database Optimization Process**

### Phase 1: 🔍 **Performance Assessment** (1-2 weeks)
- 📊 **Query performance analysis** - Slow query identification
- 🗃️ **Schema review** - Table structure optimization
- 📈 **Capacity planning** - Current and future needs
- 🔍 **Bottleneck identification** - Hardware and software limits

### Phase 2: 🚀 **Optimization Implementation** (2-4 weeks)
- 📇 **Index optimization** - Strategic index creation and maintenance
- 🗂️ **Query tuning** - SQL optimization and rewriting
- 🏗️ **Schema normalization** - Data structure improvements
- 📊 **Partitioning strategy** - Large table management

### Phase 3: 📊 **Monitoring & Maintenance** (Ongoing)
- 📈 **Performance monitoring** - Real-time metrics and alerting
- 🔄 **Automated maintenance** - Index rebuilding, statistics updates
- 💾 **Backup strategies** - Point-in-time recovery capabilities
- 🛡️ **Security hardening** - Access control and encryption

## ⚡ **Performance Optimization Techniques**

### 📇 **Indexing Strategies**
- 🎯 **Primary indexes** - Optimized for frequent queries
- 🔍 **Composite indexes** - Multi-column query optimization
- 📊 **Partial indexes** - Condition-based indexing
- 🔄 **Covering indexes** - Query result optimization

### 🚀 **Query Optimization**
- 📋 **Execution plan analysis** - Query path optimization
- 🔄 **Join optimization** - Efficient table relationships
- 📊 **Subquery optimization** - Performance-focused rewrites
- 💾 **Caching strategies** - Query result caching

### 🏗️ **Architecture Improvements**
- 📊 **Read replicas** - Distribute read workload
- 🔄 **Database sharding** - Horizontal scaling strategies
- 💾 **Connection pooling** - Resource optimization
- 📈 **Auto-scaling** - Dynamic resource allocation

## 🛡️ **Data Security & Compliance**

### 🔐 **Security Features**
- 🔒 **Encryption at rest** - Data protection when stored
- 🌐 **Encryption in transit** - Secure data transmission
- 👤 **Role-based access** - Granular permission control
- 📊 **Audit logging** - Complete access tracking
- 🔑 **Multi-factor authentication** - Enhanced security

### ⚖️ **Compliance Standards**
- 🇪🇺 **GDPR** - European data protection compliance
- 🏥 **HIPAA** - Healthcare data security
- 💳 **PCI DSS** - Payment card data protection
- 🏢 **SOX** - Financial reporting compliance

## 💾 **Backup & Disaster Recovery**

### 🔄 **Backup Strategies**
- ⚡ **Real-time replication** - Zero data loss protection
- 📅 **Scheduled backups** - Regular automated backups
- 🌍 **Geographic redundancy** - Multi-region protection
- 🧪 **Backup testing** - Regular recovery validation

### 🚨 **Disaster Recovery**
- ⏱️ **RTO: <1 hour** - Recovery time objective
- 📊 **RPO: <15 minutes** - Recovery point objective
- 🔄 **Automated failover** - Seamless service continuity
- 🧪 **DR testing** - Regular disaster recovery drills

## 📊 **Database Performance Metrics**

### 📈 **Typical Improvements**
> 📊 *Average performance gains for our clients:*

- ⚡ **10x faster** query execution times
- 💰 **40% reduction** in infrastructure costs
- 📈 **99.9% uptime** with enhanced reliability
- 🚀 **5x increase** in concurrent user capacity

### 🎯 **Key Performance Indicators**
- ⚡ **Query response time** - Sub-second for complex queries
- 🔄 **Throughput** - Transactions per second
- 💾 **Storage efficiency** - Data compression and optimization
- 🛡️ **Availability** - 99.9%+ uptime guarantee

## 🌟 **Specialized Database Services**

### 📊 **Data Warehousing**
- 🏗️ **ETL pipeline development** - Data extraction and transformation
- 📈 **Analytics optimization** - Business intelligence support
- 🔄 **Real-time data streaming** - Live analytics capabilities
- 📊 **Reporting infrastructure** - Dashboard and report optimization

### 🔍 **Search & Analytics**
- 🔍 **Elasticsearch** - Full-text search optimization
- 📊 **Data lake architecture** - Big data analytics
- 🤖 **ML model integration** - Predictive analytics
- 📈 **Real-time analytics** - Stream processing

## 🎁 **Complete Database Package**

### 🛠️ **Design & Implementation**
- 🏗️ Database architecture design and review
- ⚡ Performance optimization and tuning
- 🔐 Security implementation and hardening
- 💾 Backup and disaster recovery setup
- 📊 Monitoring and alerting configuration
- 🚀 Migration and deployment services

### 📚 **Documentation & Training**
- 📋 Database documentation and procedures
- 🎓 Team training on best practices
- 🔧 Maintenance guides and runbooks
- 📊 Performance monitoring dashboards

### 🤝 **Ongoing Support**
- 🛠️ 6 months of optimization support
- 📞 24/7 monitoring and alerting
- 🔄 Monthly performance reviews
- 🚨 Emergency support and response

*Transform your data into a strategic advantage.*''',
                'color': '29BF12',
                'icon': 'Database',
                'duration': 60,
                'price': Decimal('1699.00'),
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
