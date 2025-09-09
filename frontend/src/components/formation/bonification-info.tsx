
"use client";

import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { useState as useLocalState } from "react";
import dynamic from "next/dynamic";
const MarkdownRenderer = dynamic(() => import("../ui/markdown-renderer").then(mod => mod.MarkdownRenderer), { ssr: false });
import { useTranslations } from "next-intl";


const BonificationInfo = () => {
  const [open, setOpen] = useLocalState(false);
  const t = useTranslations("bonificationTexts");
  
  return (
    <div className="rounded-2xl shadow-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 transition-colors">
      <button
        className="w-full flex items-center justify-between gap-3 px-6 py-5 text-left focus:outline-none group"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
      <span className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
        <Star className="w-7 h-7 min-w-7 min-h-7 text-[#623CEA]" />
        {t("summary")}
      </span>
        <span className="ml-2">
          {open ? (
            <ChevronUp className="w-6 h-6 text-[#623CEA] group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronDown className="w-6 h-6 text-[#623CEA] group-hover:scale-110 transition-transform" />
          )}
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 text-gray-700 dark:text-gray-200 text-base animate-fade-in">
          <div className="prose dark:prose-invert max-w-none">
            <MarkdownRenderer>{t("details")}</MarkdownRenderer>
          </div>
        </div>
      )}
    </div>
  );
}

export default BonificationInfo;