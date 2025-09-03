from rest_framework.routers import DefaultRouter
from courses.views import CourseViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet)

for url in router.urls:
    print(url)
