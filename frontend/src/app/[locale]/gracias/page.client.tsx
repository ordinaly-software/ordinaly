"use client";

import { useMessages } from "next-intl";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { CampaignFooter, CampaignHeader } from "@/components/campaign/campaign-chrome";

export default function GraciasPage({ origen }: { origen?: string }) {
  const messages = useMessages() as any;
  const content = messages.landings?.["gracias"];
  const related: { label: string; href: string } | undefined = origen ? content.related[origen] : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-900">
      <CampaignHeader />
      <section className="flex flex-1 items-center px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <CircleCheck className="mx-auto h-14 w-14 text-clay" aria-hidden />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-4xl">
            {content.title}
          </h1>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">{content.text}</p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {related && (
              <Link
                href={related.href}
                className="rounded-full bg-clay-fill px-6 py-3 font-semibold text-white transition hover:brightness-110"
              >
                {related.label}
              </Link>
            )}
            <Link
              href="/"
              className="rounded-full border border-[--color-border-subtle] px-6 py-3 font-semibold text-neutral-800 transition hover:border-clay dark:border-white/20 dark:text-white"
            >
              {content.homeLabel}
            </Link>
          </div>
        </div>
      </section>
      <CampaignFooter />
    </div>
  );
}
