import base64
from datetime import timedelta

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Count, Q
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import Newsletter, NewsletterSubscriber
from .services import newsletter_sending

EDITABLE_STATUSES = {Newsletter.STATUS_DRAFT, Newsletter.STATUS_SCHEDULED}
DELETABLE_STATUSES = {Newsletter.STATUS_DRAFT, Newsletter.STATUS_CANCELLED}
MAX_SERIES_COUNT = 52

_PIXEL = base64.b64decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")


class NewsletterSerializer(serializers.ModelSerializer):
    stats = serializers.SerializerMethodField()

    class Meta:
        model = Newsletter
        fields = (
            "id", "subject", "html_body", "status", "scheduled_for",
            "started_at", "sent_at", "created_at", "updated_at", "stats",
        )
        read_only_fields = ("status", "started_at", "sent_at", "created_at", "updated_at")

    def get_stats(self, obj):
        # Annotated by the viewset (one query for the whole list).
        recipients = getattr(obj, "recipients", 0)
        sent = getattr(obj, "sent_count", 0)
        return {
            "recipients": recipients,
            "sent": sent,
            "opened": getattr(obj, "opened_count", 0),
            "clicked": getattr(obj, "clicked_count", 0),
            # Meaningful once the newsletter is closed; while it is sending these are just "still pending".
            "undelivered": recipients - sent,
        }


class NewsletterViewSet(viewsets.ModelViewSet):
    serializer_class = NewsletterSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Newsletter.objects.annotate(
            recipients=Count("deliveries"),
            sent_count=Count("deliveries", filter=Q(deliveries__sent_at__isnull=False)),
            opened_count=Count("deliveries", filter=Q(deliveries__opened_at__isnull=False)),
            clicked_count=Count("deliveries", filter=Q(deliveries__clicked_at__isnull=False)),
        )

    def _respond(self, newsletter, http_status=status.HTTP_200_OK):
        newsletter = self.get_queryset().get(pk=newsletter.pk)
        return Response(self.get_serializer(newsletter).data, status=http_status)

    def perform_update(self, serializer):
        if serializer.instance.status not in EDITABLE_STATUSES:
            raise ValidationError({"detail": "locked"})
        serializer.save()

    def perform_destroy(self, instance):
        if instance.status not in DELETABLE_STATUSES:
            raise ValidationError({"detail": "locked"})
        instance.delete()

    @action(detail=True, methods=["post"])
    def schedule(self, request, pk=None):
        newsletter = self.get_object()
        if newsletter.status not in EDITABLE_STATUSES:
            raise ValidationError({"detail": "locked"})

        raw = request.data.get("scheduled_for")
        scheduled_for = parse_datetime(raw) if isinstance(raw, str) else newsletter.scheduled_for
        if scheduled_for is None:
            raise ValidationError({"scheduled_for": "required"})
        if timezone.is_naive(scheduled_for):
            scheduled_for = timezone.make_aware(scheduled_for)
        if not newsletter.subject.strip() or not newsletter.html_body.strip():
            raise ValidationError({"detail": "empty_newsletter"})

        newsletter.scheduled_for = scheduled_for
        newsletter.status = Newsletter.STATUS_SCHEDULED
        newsletter.save(update_fields=["scheduled_for", "status", "updated_at"])
        return self._respond(newsletter)

    @action(detail=True, methods=["post"])
    def unschedule(self, request, pk=None):
        newsletter = self.get_object()
        if newsletter.status != Newsletter.STATUS_SCHEDULED:
            raise ValidationError({"detail": "not_scheduled"})
        newsletter.status = Newsletter.STATUS_DRAFT
        newsletter.save(update_fields=["status", "updated_at"])
        return self._respond(newsletter)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        newsletter = self.get_object()
        if newsletter.status != Newsletter.STATUS_SENDING:
            raise ValidationError({"detail": "not_sending"})
        newsletter_sending.cancel_sending(newsletter)
        return self._respond(newsletter)

    @action(detail=True, methods=["post"])
    def duplicate(self, request, pk=None):
        """Copy as drafts. With `start` and `every_days`, the copies get proposed dates (one per interval)."""
        source = self.get_object()
        try:
            count = int(request.data.get("count", 1))
            every_days = request.data.get("every_days")
            every_days = int(every_days) if every_days not in (None, "") else None
        except (TypeError, ValueError):
            raise ValidationError({"detail": "invalid_series"})
        if not 1 <= count <= MAX_SERIES_COUNT or (every_days is not None and every_days < 1):
            raise ValidationError({"detail": "invalid_series"})

        start = request.data.get("start")
        start = parse_datetime(start) if isinstance(start, str) else None
        if start is not None and timezone.is_naive(start):
            start = timezone.make_aware(start)

        copies = []
        for index in range(count):
            proposed = start + timedelta(days=every_days * index) if start and every_days else (start if count == 1 else None)
            copies.append(
                Newsletter.objects.create(
                    subject=source.subject, html_body=source.html_body, scheduled_for=proposed
                )
            )
        return Response(
            [self.get_serializer(self.get_queryset().get(pk=c.pk)).data for c in copies],
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def test(self, request, pk=None):
        newsletter = self.get_object()
        to_email = (request.data.get("email") or request.user.email or "").strip()
        try:
            from django.core.validators import validate_email

            validate_email(to_email)
        except DjangoValidationError:
            raise ValidationError({"email": "invalid_email"})
        newsletter_sending.send_test(newsletter, to_email)
        return Response({"ok": True, "sent_to": to_email})

    @action(detail=False, methods=["post"])
    def preview(self, request):
        """Render unsaved editor content exactly as subscribers will get it."""
        draft = Newsletter(subject=str(request.data.get("subject", "")), html_body=str(request.data.get("html_body", "")))
        html_body, _ = newsletter_sending.render_newsletter(
            draft, name="Nombre", unsubscribe_link="#"
        )
        return Response({"html": html_body})

    @action(detail=False, methods=["get"])
    def subscribers(self, request):
        subs = NewsletterSubscriber.objects.order_by("-created_at").values(
            "id", "email", "name", "status", "source", "user_id", "confirmed_at", "unsubscribed_at", "created_at"
        )
        return Response(list(subs))


# --- public tracking endpoints (opened from inside emails) -----------------------------------

@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def newsletter_open_pixel(request, token):
    newsletter_sending.record_open(token)
    response = HttpResponse(_PIXEL, content_type="image/gif")
    response["Cache-Control"] = "no-store, max-age=0"
    return response


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def newsletter_click(request, token):
    url = newsletter_sending.resolve_click(token)
    if not url:
        return HttpResponse(status=404)
    return HttpResponseRedirect(url)
