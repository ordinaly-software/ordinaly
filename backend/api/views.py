from django.http import JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def home(request):
    return JsonResponse({"msg": "API OK"})
