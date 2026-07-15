"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { FaqAccordion, type FaqAccordionItem } from "@/components/ui/faq-accordion";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface SectionProps {
  t: TranslateFn;
}

const faqKeys = [
  { questionKey: "faq.items.0.q", answerKey: "faq.items.0.a", extraKey: "faq.items.0.extra" },
  { questionKey: "faq.items.1.q", answerKey: "faq.items.1.a", extraKey: "faq.items.1.extra" },
  { questionKey: "faq.items.2.q", answerKey: "faq.items.2.a", extraKey: "faq.items.2.extra" },
  { questionKey: "faq.items.3.q", answerKey: "faq.items.3.a", extraKey: "faq.items.3.extra" },
  { questionKey: "faq.items.4.q", answerKey: "faq.items.4.a", extraKey: "faq.items.4.extra" },
  { questionKey: "faq.items.5.q", answerKey: "faq.items.5.a", extraKey: "faq.items.5.extra" },
];

export function FaqSection({ t, titleTag = "h2" }: SectionProps & { titleTag?: "h2" | "h3" }) {
  const items: FaqAccordionItem[] = faqKeys.map(({ questionKey, answerKey, extraKey }) => ({
    question: t(questionKey),
    answer: (
      <>
        <p className="mb-3">{t(answerKey)}</p>
        <p>{t(extraKey)}</p>
      </>
    ),
  }));

  return (
    <div className="bg-white dark:bg-[--color-bg-inverted]">
      <FaqAccordion
        titleTag={titleTag}
        title={t("faq.title")}
        description={t("faq.subtitle")}
        items={items}
        footer={
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-clay text-clay font-semibold hover:bg-clay hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-clay/20 group"
          >
            {t("faq.viewAllLabel")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        }
      />
    </div>
  );
}
