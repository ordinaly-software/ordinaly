
"use client";

import { BadgePercent, ChevronDown, ChevronUp } from "lucide-react";
import { useState as useLocalState } from "react";
import dynamic from "next/dynamic";
const MarkdownRenderer = dynamic(() => import("../ui/markdown-renderer").then(mod => mod.MarkdownRenderer), { ssr: false });
import { useTranslations } from "next-intl";


const BonificationInfo = () => {
  const [open, setOpen] = useLocalState(false);
  const t = useTranslations("bonificationTexts");
  
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-clay/15 bg-white/88 shadow-[0_24px_80px_-42px_rgba(20,20,19,0.18)] backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-[rgba(15,22,34,0.88)]">
      <div className="pointer-events-none absolute -right-16 -top-14 h-40 w-40 rounded-full bg-clay/12 blur-3xl dark:bg-clay/16" />
      <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-cobalt/10 blur-3xl dark:bg-cobalt/12" />
      <button
        className="group relative flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none md:px-8 md:py-6"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-clay/20 bg-clay/10 text-clay shadow-sm dark:border-clay/25 dark:bg-clay/15 dark:text-[#F6D2C5]">
            <BadgePercent className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-semibold text-slate-dark dark:text-ivory-light">
              {t("summary")}
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
              {t("details").split("\n")[0]}
            </span>
          </span>
        </span>
        <span className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[--color-border-subtle] bg-white/70 text-slate-medium transition-all duration-200 group-hover:border-clay/25 group-hover:text-clay dark:border-white/10 dark:bg-white/5 dark:text-cloud-medium dark:group-hover:text-[#F6D2C5]">
          {open ? (
            <ChevronUp className="h-5 w-5 transition-transform group-hover:scale-110" />
          ) : (
            <ChevronDown className="h-5 w-5 transition-transform group-hover:scale-110" />
          )}
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 text-base text-gray-700 animate-fade-in dark:text-gray-200 md:px-8 md:pb-8">
          <div className="rounded-[1.5rem] border border-[--color-border-subtle] bg-[--swatch--ivory-medium]/75 p-5 dark:border-white/10 dark:bg-[rgba(10,16,26,0.72)] md:p-6">
            <div className="prose max-w-none prose-p:text-slate-medium prose-strong:text-slate-dark prose-a:text-clay dark:prose-invert dark:prose-p:text-cloud-medium dark:prose-strong:text-ivory-light">
            <MarkdownRenderer>{t("details")}</MarkdownRenderer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BonificationInfo;
