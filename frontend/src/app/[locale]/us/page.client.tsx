"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const Footer = dynamic(() => import("@/components/ui/footer"), {
  ssr: false,
  loading: () => (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924] animate-pulse">
      <div className="max-w-7xl mx-auto h-10 bg-gray-200 dark:bg-gray-700 rounded" />
    </footer>
  ),
});

export default function UsPage() {
  const t = useTranslations("usPage");

  return (
    <div className="bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-900 dark:text-white min-h-screen">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-6">
        <p className="text-sm uppercase tracking-[0.2em] text-[#22A60D] font-semibold">
          {t("eyebrow")}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          {t("title")}
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl">
          {t("description")}
        </p>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 p-8 shadow-lg">
          <p className="text-lg text-gray-800 dark:text-gray-200">{t("comingSoon")}</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
