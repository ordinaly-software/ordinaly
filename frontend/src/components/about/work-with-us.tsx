"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Send, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkWithUsSectionProps {
  id?: string;
  className?: string;
  email?: string;
  backgroundSrc?: string;
}

export function WorkWithUsSection({
  id,
  className,
  email = "antonio.macias@ordinaly.ai",
  backgroundSrc = "/static/nosotros/work_with_us.webp",
}: WorkWithUsSectionProps) {
  const t = useTranslations("usPage");
  const locale = useLocale();

  const mailHref = useMemo(() => {
    const subject = encodeURIComponent(t("cta.mailSubject"));
    const body = encodeURIComponent(t("cta.mailBody"));
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }, [t, email]);

  return (
    <section
      id={id}
      className={cn(
        "relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center overflow-hidden rounded-[2rem] px-6 py-20 text-center md:py-24",
        className,
      )}
    >
      <Image
        src={backgroundSrc}
        alt=""
        aria-hidden
        fill
        priority={false}
        sizes="(max-width: 768px) 100vw, 1152px"
        className="object-cover object-center brightness-[.7] blur-sm scale-105 dark:brightness-[.5]"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(115deg,rgba(20,20,19,0.4),rgba(20,20,19,0.15),rgba(20,20,19,0.45))] dark:bg-[linear-gradient(115deg,rgba(8,12,18,0.7),rgba(8,12,18,0.35),rgba(8,12,18,0.72))]"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center">
        <h3 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-4xl">
          {t("cta.title")}
        </h3>
        <div className="my-4 h-[3px] w-32 bg-gradient-to-l from-transparent to-clay" aria-hidden />
        <p className="max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
          {t("cta.body")}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            variant="accent"
            className="gap-2 rounded-full px-8 shadow-lg shadow-clay/30 transition-transform duration-300 hover:scale-105"
            asChild
          >
            <a href={mailHref} target="_blank" rel="noreferrer">
              <Send className="h-4 w-4" />
              {t("cta.primary")}
            </a>
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-full border-white/30 bg-white/10 text-white transition-transform duration-300 hover:scale-105 hover:bg-white/20 dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            asChild
          >
            <a href={`/${locale}/contacto`}>
              <ArrowRight className="h-4 w-4" />
              {t("cta.secondary")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
