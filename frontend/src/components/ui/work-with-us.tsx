"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Send, ArrowRight } from "lucide-react";

interface WorkWithUsSectionProps {
  id?: string;
  className?: string;
  email?: string;
  backgroundSrc?: string;
  fullBleed?: boolean;
}

export function WorkWithUsSection({
  id,
  className,
  email = "antonio.macias@ordinaly.ai",
  backgroundSrc = "/static/us/work_with_us.webp",
  fullBleed = true,
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
      className={`relative overflow-hidden min-h-[460px] md:min-h-[480px] flex items-center py-0 my-0 ${
        fullBleed
          ? "w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]"
          : ""
      } ${className || ""}`}
    >
      <Image
        src={backgroundSrc}
        alt=""
        aria-hidden
        fill
        priority={false}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
        className="object-cover object-center brightness-[.7] dark:brightness-[.5] blur-[2px]"
      />
      <div className="absolute inset-0 bg-black/20 dark:bg-black/55" aria-hidden />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 lg:px-12 py-6 w-full">
        <div className="space-y-3 max-w-2xl text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]">
          <p className="text-sm uppercase tracking-[0.3em] font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            {t("cta.eyebrow")}
          </p>
          <h3 className="text-3xl md:text-4xl font-bold drop-shadow-[0_3px_12px_rgba(0,0,0,0.7)]">{t("cta.title")}</h3>
            <p className="text-white/90 drop-shadow-[0_3px_12px_rgba(0,0,0,0.7)]">
            <span className="bg-green-500 text-white dark:bg-[#7CFC00] dark:text-[#0B1B17] px-1">
              {t("cta.body").split(" ").slice(0, 7).join(" ")}
            </span>
            {" " + t("cta.body").split(" ").slice(7).join(" ")}
            </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="bg-[#1F8A0D] dark:bg-[#7CFC00] hover:bg-[#1A740B] dark:hover:bg-[#6BFF52] text-white dark:text-[#0B1B17] gap-2" asChild>
            <a href={mailHref} target="_blank" rel="noreferrer">
              <Send className="h-4 w-4" />
              {t("cta.primary")}
            </a>
          </Button>
          <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 dark:border-white/40 dark:hover:bg-white/10 gap-2" asChild>
            <a href={`/${locale}/contact`}>
              <ArrowRight className="h-4 w-4" />
              {t("cta.secondary")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
