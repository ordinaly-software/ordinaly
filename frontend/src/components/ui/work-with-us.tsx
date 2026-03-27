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
  backgroundSrc = "/static/about/work_with_us.webp",
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
        className="object-cover object-center brightness-[.82] dark:brightness-[.56] blur-[2px]"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(115deg,rgba(20,20,19,0.18),rgba(20,20,19,0.08),rgba(20,20,19,0.22))] dark:bg-[linear-gradient(115deg,rgba(8,12,18,0.66),rgba(8,12,18,0.44),rgba(8,12,18,0.58))]"
        aria-hidden
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 lg:px-12 py-6 w-full">
        <div className="max-w-3xl rounded-[2rem] border border-white/45 bg-white/14 p-6 text-white shadow-[0_24px_80px_-38px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(15,22,34,0.78)] md:p-8">
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-3xl md:text-4xl font-bold leading-tight text-white">
              {t("cta.title")}
            </h3>
            <p className="text-white/88 md:text-lg leading-relaxed">
              <span className="rounded-md bg-clay px-1.5 py-0.5 text-white">
                {t("cta.body").split(" ").slice(0, 7).join(" ")}
              </span>
              {" " + t("cta.body").split(" ").slice(7).join(" ")}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="bg-clay hover:bg-flame text-white gap-2 shadow-lg shadow-clay/20" asChild>
              <a href={mailHref} target="_blank" rel="noreferrer">
                <Send className="h-4 w-4" />
                {t("cta.primary")}
              </a>
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-white/25 bg-white/10 text-white hover:bg-white/18 dark:border-white/12 dark:bg-white/5 dark:hover:bg-white/10"
              asChild
            >
              <a href={`/${locale}/contact`}>
                <ArrowRight className="h-4 w-4" />
                {t("cta.secondary")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
