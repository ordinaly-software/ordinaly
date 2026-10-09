from django.core.management.base import BaseCommand

from users.models import CustomUser, NewsletterSubscriber
from users.services.newsletter_service import sync_user_subscription


class Command(BaseCommand):
    help = (
        "Link existing newsletter rows to their users and refresh emails/names. "
        "Account-sourced rows left without a user (e.g. old addresses after an email change) are orphans."
    )

    def add_arguments(self, parser):
        parser.add_argument("--purge-orphans", action="store_true", help="Delete orphaned account rows.")

    def handle(self, *args, **options):
        for user in CustomUser.objects.iterator():
            sync_user_subscription(user)

        orphans = NewsletterSubscriber.objects.filter(
            user__isnull=True, source=NewsletterSubscriber.SOURCE_ACCOUNT
        )
        for sub in orphans:
            self.stdout.write(f"orphan: {sub.email}")
        if options["purge_orphans"]:
            deleted, _ = orphans.delete()
            self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} orphan(s)."))
        else:
            self.stdout.write(f"{orphans.count()} orphan(s); rerun with --purge-orphans to delete.")
