import { Suspense } from "react";
import type { Metadata } from "next";
import { NewsletterTokenAction } from "@/components/ui/newsletter-token-action.client";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function NewsletterConfirmPage() {
  return (
    <Suspense>
      <NewsletterTokenAction action="confirm" />
    </Suspense>
  );
}
