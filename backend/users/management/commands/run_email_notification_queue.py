from django.core.management.base import BaseCommand

from users.services.notification_service import (
    enqueue_due_course_notifications,
    process_pending_email_jobs,
)


class Command(BaseCommand):
    help = (
        "Enqueue due course notification jobs and process pending "
        "email notification jobs."
    )

    def add_arguments(self, parser):
        parser.add_argument("--skip-reminders", action="store_true")
        parser.add_argument("--skip-send", action="store_true")
        parser.add_argument("--limit", type=int, default=100)
        parser.add_argument("--lookahead-minutes", type=int, default=1)

    def handle(self, *args, **options):
        reminder_count = 0
        if not options["skip_reminders"]:
            reminder_count = enqueue_due_course_notifications(
                lookahead_minutes=options["lookahead_minutes"]
            )

        result = {"processed": 0, "sent": 0, "failed": 0}
        if not options["skip_send"]:
            result = process_pending_email_jobs(limit=options["limit"])

        self.stdout.write(
            self.style.SUCCESS(
                "email_notification_queue reminders_enqueued={reminders} "
                "processed={processed} sent={sent} failed={failed}".format(
                    reminders=reminder_count,
                    processed=result["processed"],
                    sent=result["sent"],
                    failed=result["failed"],
                )
            )
        )
