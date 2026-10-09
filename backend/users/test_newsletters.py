import os
import re
from datetime import timedelta

from django.core import mail
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import EmailNotificationJob, CustomUser, Newsletter, NewsletterDelivery, NewsletterSubscriber
from .services import newsletter_sending
from .services.notification_service import process_pending_email_jobs

TEST_PASSWORD = os.environ.get("ORDINALY_TEST_PASSWORD")

BODY = (
    '<h1>Hola {{name}}</h1><p>Lee <a href="https://ordinaly.ai/blog/post">el post</a> '
    'o <a href="mailto:info@ordinaly.ai">escríbenos</a>. <a href="{{unsubscribe_url}}">Baja</a></p>'
)


def make_subscriber(email, status_=NewsletterSubscriber.STATUS_ACTIVE, name="Ana"):
    return NewsletterSubscriber.objects.create(email=email, name=name, status=status_)


def make_newsletter(**overrides):
    data = {"subject": "Número 1", "html_body": BODY}
    data.update(overrides)
    return Newsletter.objects.create(**data)


class NewsletterSendingTests(TestCase):
    def setUp(self):
        self.active = make_subscriber("active@example.com")
        self.other = make_subscriber("other@example.com", name="Beto")
        self.gone = make_subscriber("gone@example.com", NewsletterSubscriber.STATUS_UNSUBSCRIBED)
        self.pending = make_subscriber("pending@example.com", NewsletterSubscriber.STATUS_PENDING)

    def _run_queue(self):
        newsletter_sending.enqueue_due_newsletters()
        process_pending_email_jobs()
        newsletter_sending.enqueue_due_newsletters()

    def test_only_due_newsletters_are_started(self):
        past = make_newsletter(status=Newsletter.STATUS_SCHEDULED, scheduled_for=timezone.now() - timedelta(minutes=1))
        future = make_newsletter(status=Newsletter.STATUS_SCHEDULED, scheduled_for=timezone.now() + timedelta(days=1))
        draft = make_newsletter(scheduled_for=timezone.now() - timedelta(minutes=1))

        self.assertEqual(newsletter_sending.enqueue_due_newsletters(), 1)

        past.refresh_from_db(); future.refresh_from_db(); draft.refresh_from_db()
        self.assertEqual(past.status, Newsletter.STATUS_SENDING)
        self.assertEqual(future.status, Newsletter.STATUS_SCHEDULED)
        self.assertEqual(draft.status, Newsletter.STATUS_DRAFT)

    def test_fan_out_targets_only_active_subscribers_once(self):
        nl = make_newsletter(status=Newsletter.STATUS_SCHEDULED, scheduled_for=timezone.now())
        newsletter_sending.enqueue_due_newsletters()
        newsletter_sending.enqueue_due_newsletters()
        self.assertEqual(
            sorted(nl.deliveries.values_list("subscriber__email", flat=True)),
            ["active@example.com", "other@example.com"],
        )
        self.assertEqual(EmailNotificationJob.objects.filter(unique_key__startswith=f"newsletter:{nl.pk}:").count(), 2)

    def test_full_send_marks_newsletter_sent_and_personalises_each_email(self):
        nl = make_newsletter(status=Newsletter.STATUS_SCHEDULED, scheduled_for=timezone.now())
        self._run_queue()

        nl.refresh_from_db()
        self.assertEqual(nl.status, Newsletter.STATUS_SENT)
        self.assertIsNotNone(nl.sent_at)
        self.assertEqual(sorted(m.to[0] for m in mail.outbox), ["active@example.com", "other@example.com"])
        self.assertEqual(nl.deliveries.filter(sent_at__isnull=False).count(), 2)

        message = next(m for m in mail.outbox if m.to == ["other@example.com"])
        html = message.alternatives[0][0]
        self.assertEqual(message.subject, "Número 1")
        self.assertIn("Hola Beto", html)
        self.assertIn("/newsletter/unsubscribe?token=", html)
        self.assertIn("/api/newsletter/track/o/", html)
        self.assertNotIn("{{", html)
        # Real links are tracked; mailto and the unsubscribe link are left alone.
        self.assertNotIn('href="https://ordinaly.ai/blog/post"', html)
        self.assertIn("/api/newsletter/track/c/", html)
        self.assertIn('href="mailto:info@ordinaly.ai"', html)
        # Plain-text part keeps the link target.
        self.assertIn("el post (https://ordinaly.ai/blog/post)", message.body)

    def test_list_unsubscribe_headers_allow_one_click_unsubscribe(self):
        make_newsletter(status=Newsletter.STATUS_SCHEDULED, scheduled_for=timezone.now())
        self._run_queue()
        message = mail.outbox[0]
        self.assertEqual(message.extra_headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click")
        url = re.search(r"<(http[^>]+)>", message.extra_headers["List-Unsubscribe"]).group(1)
        path = url.split("/api/", 1)[1]
        response = self.client.post(f"/api/{path}", data="List-Unsubscribe=One-Click",
                                    content_type="application/x-www-form-urlencoded")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(NewsletterSubscriber.objects.get(email=message.to[0]).status,
                         NewsletterSubscriber.STATUS_UNSUBSCRIBED)

    def test_subscriber_who_unsubscribes_before_their_turn_gets_nothing(self):
        nl = make_newsletter(status=Newsletter.STATUS_SCHEDULED, scheduled_for=timezone.now())
        newsletter_sending.enqueue_due_newsletters()
        NewsletterSubscriber.objects.filter(pk=self.other.pk).update(status=NewsletterSubscriber.STATUS_UNSUBSCRIBED)
        process_pending_email_jobs()
        self.assertEqual([m.to[0] for m in mail.outbox], ["active@example.com"])
        self.assertIsNone(nl.deliveries.get(subscriber=self.other).sent_at)

    def test_newsletter_with_no_audience_closes_immediately(self):
        NewsletterSubscriber.objects.all().delete()
        nl = make_newsletter(status=Newsletter.STATUS_SCHEDULED, scheduled_for=timezone.now())
        newsletter_sending.enqueue_due_newsletters()
        nl.refresh_from_db()
        self.assertEqual(nl.status, Newsletter.STATUS_SENT)

    def test_cancel_sending_drops_unsent_jobs_and_stops_sending(self):
        nl = make_newsletter(status=Newsletter.STATUS_SCHEDULED, scheduled_for=timezone.now())
        newsletter_sending.enqueue_due_newsletters()
        nl.refresh_from_db()
        self.assertEqual(newsletter_sending.cancel_sending(nl), 2)
        process_pending_email_jobs()
        self.assertEqual(len(mail.outbox), 0)
        nl.refresh_from_db()
        self.assertEqual(nl.status, Newsletter.STATUS_CANCELLED)


class NewsletterTrackingTests(APITestCase):
    def setUp(self):
        self.nl = make_newsletter()
        self.sub = make_subscriber("t@example.com")
        self.delivery = NewsletterDelivery.objects.create(newsletter=self.nl, subscriber=self.sub)

    def test_open_pixel_counts_every_open_but_keeps_first_timestamp(self):
        url = f"/api/newsletter/track/o/{newsletter_sending.make_open_token(self.delivery)}/"
        first = self.client.get(url)
        self.assertEqual(first["Content-Type"], "image/gif")
        opened_at = NewsletterDelivery.objects.get(pk=self.delivery.pk).opened_at
        self.client.get(url)
        self.delivery.refresh_from_db()
        self.assertEqual(self.delivery.open_count, 2)
        self.assertEqual(self.delivery.opened_at, opened_at)

    def test_open_pixel_with_bad_token_still_returns_an_image_and_counts_nothing(self):
        response = self.client.get("/api/newsletter/track/o/garbage/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(NewsletterDelivery.objects.get().open_count, 0)

    def test_click_redirects_and_is_counted(self):
        token = newsletter_sending.make_click_token(self.delivery, "https://ordinaly.ai/formacion")
        response = self.client.get(f"/api/newsletter/track/c/{token}/")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response["Location"], "https://ordinaly.ai/formacion")
        self.delivery.refresh_from_db()
        self.assertEqual(self.delivery.click_count, 1)
        self.assertIsNotNone(self.delivery.clicked_at)

    def test_click_endpoint_is_not_an_open_redirect(self):
        self.assertEqual(self.client.get("/api/newsletter/track/c/garbage/").status_code, 404)
        forged = newsletter_sending.make_click_token(self.delivery, "javascript:alert(1)")
        self.assertEqual(self.client.get(f"/api/newsletter/track/c/{forged}/").status_code, 404)


class NewsletterAdminApiTests(APITestCase):
    URL = "/api/newsletters/"

    def setUp(self):
        self.staff = CustomUser.objects.create_user(
            email="staff@example.com", username="staffer", password=TEST_PASSWORD,
            name="Staff", surname="S", is_staff=True,
        )
        self.regular = CustomUser.objects.create_user(
            email="regular@example.com", username="regular", password=TEST_PASSWORD,
            name="Regular", surname="R",
        )

    def _auth(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_only_staff_can_use_the_api(self):
        self.assertEqual(self.client.get(self.URL).status_code, status.HTTP_401_UNAUTHORIZED)
        self._auth(self.regular)
        self.assertEqual(self.client.get(self.URL).status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.post(self.URL, {"subject": "x"}, format="json").status_code, 403)
        self.assertEqual(self.client.get(self.URL + "subscribers/").status_code, status.HTTP_403_FORBIDDEN)

    def test_create_schedule_and_unschedule(self):
        self._auth(self.staff)
        created = self.client.post(self.URL, {"subject": "S", "html_body": "<p>x</p>"}, format="json")
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.json()["status"], "draft")
        pk = created.json()["id"]

        when = (timezone.now() + timedelta(days=3)).isoformat()
        scheduled = self.client.post(f"{self.URL}{pk}/schedule/", {"scheduled_for": when}, format="json")
        self.assertEqual(scheduled.status_code, 200)
        self.assertEqual(scheduled.json()["status"], "scheduled")

        back = self.client.post(f"{self.URL}{pk}/unschedule/")
        self.assertEqual(back.json()["status"], "draft")

    def test_cannot_schedule_empty_newsletter_or_without_a_date(self):
        self._auth(self.staff)
        empty = make_newsletter(subject="", html_body="")
        when = (timezone.now() + timedelta(days=1)).isoformat()
        self.assertEqual(self.client.post(f"{self.URL}{empty.pk}/schedule/", {"scheduled_for": when}, format="json").status_code, 400)
        no_date = make_newsletter()
        self.assertEqual(self.client.post(f"{self.URL}{no_date.pk}/schedule/", {}, format="json").status_code, 400)

    def test_sent_newsletter_is_locked(self):
        self._auth(self.staff)
        sent = make_newsletter(status=Newsletter.STATUS_SENT)
        self.assertEqual(self.client.patch(f"{self.URL}{sent.pk}/", {"subject": "new"}, format="json").status_code, 400)
        self.assertEqual(self.client.delete(f"{self.URL}{sent.pk}/").status_code, 400)
        self.assertTrue(Newsletter.objects.filter(pk=sent.pk).exists())

    def test_draft_can_be_edited_and_deleted(self):
        self._auth(self.staff)
        draft = make_newsletter()
        self.assertEqual(self.client.patch(f"{self.URL}{draft.pk}/", {"subject": "new"}, format="json").status_code, 200)
        self.assertEqual(self.client.delete(f"{self.URL}{draft.pk}/").status_code, 204)

    def test_duplicate_series_proposes_dates_as_drafts(self):
        self._auth(self.staff)
        source = make_newsletter()
        start = timezone.now() + timedelta(days=7)
        response = self.client.post(
            f"{self.URL}{source.pk}/duplicate/",
            {"count": 3, "every_days": 7, "start": start.isoformat()}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        copies = Newsletter.objects.exclude(pk=source.pk).order_by("scheduled_for")
        self.assertEqual(copies.count(), 3)
        self.assertTrue(all(c.status == Newsletter.STATUS_DRAFT and c.html_body == BODY for c in copies))
        gaps = [(b.scheduled_for - a.scheduled_for).days for a, b in zip(copies, copies[1:])]
        self.assertEqual(gaps, [7, 7])

    def test_duplicate_rejects_absurd_series(self):
        self._auth(self.staff)
        source = make_newsletter()
        self.assertEqual(self.client.post(f"{self.URL}{source.pk}/duplicate/", {"count": 500}, format="json").status_code, 400)

    def test_test_send_goes_to_the_admin_without_tracking_or_real_unsubscribe(self):
        self._auth(self.staff)
        nl = make_newsletter()
        response = self.client.post(f"{self.URL}{nl.pk}/test/", format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(mail.outbox[0].to, ["staff@example.com"])
        self.assertTrue(mail.outbox[0].subject.startswith("[PRUEBA]"))
        html = mail.outbox[0].alternatives[0][0]
        self.assertNotIn("/track/", html)
        self.assertFalse(NewsletterDelivery.objects.exists())

    def test_preview_renders_unsaved_content(self):
        self._auth(self.staff)
        response = self.client.post(f"{self.URL}preview/", {"subject": "S", "html_body": "<p>Hola {{name}}</p>"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Hola Nombre", response.json()["html"])

    def test_stats_are_reported_per_newsletter(self):
        self._auth(self.staff)
        nl = make_newsletter(status=Newsletter.STATUS_SENT)
        now = timezone.now()
        for i, (opened, clicked) in enumerate([(True, True), (True, False), (False, False)]):
            sub = make_subscriber(f"s{i}@example.com")
            NewsletterDelivery.objects.create(
                newsletter=nl, subscriber=sub, sent_at=now if i < 2 else None,
                opened_at=now if opened else None, clicked_at=now if clicked else None,
            )
        stats = self.client.get(f"{self.URL}{nl.pk}/").json()["stats"]
        self.assertEqual(stats, {"recipients": 3, "sent": 2, "opened": 2, "clicked": 1, "undelivered": 1})

    def test_subscribers_listing_includes_anonymous_and_every_status(self):
        self._auth(self.staff)
        make_subscriber("a@example.com")
        make_subscriber("b@example.com", NewsletterSubscriber.STATUS_PENDING)
        rows = self.client.get(self.URL + "subscribers/").json()
        self.assertEqual({r["email"]: r["status"] for r in rows},
                         {"a@example.com": "active", "b@example.com": "pending"})

    def test_newsletter_routes_do_not_collide_with_the_user_routes(self):
        self._auth(self.staff)
        self.assertEqual(self.client.get("/api/users/").status_code, 200)
        self.assertEqual(self.client.get(self.URL).status_code, 200)
