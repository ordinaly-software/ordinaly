"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type Action = "confirm" | "unsubscribe";

// Both links are opened from an email. They only act on a button press, never on page load,
// so mail scanners that prefetch links can neither subscribe nor unsubscribe anyone.
export function NewsletterTokenAction({ action }: { action: Action }) {
  const t = useTranslations(`newsletterAction.${action}`);
  const token = useSearchParams().get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(token ? "idle" : "error");

  const run = async () => {
    setStatus("loading");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";
    try {
      const res = await fetch(`${apiUrl}/api/newsletter/${action}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  const Icon = status === "success" ? CheckCircle2 : status === "error" ? XCircle : Loader2;
  const iconColor = status === "error" ? "text-red-600 dark:text-red-400" : "text-clay dark:text-[#F6D2C5]";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-ivory-light px-4 py-10 text-gray-800 dark:bg-slate-dark dark:text-white">
      <article className="w-full max-w-xl rounded-[2rem] border border-gray-200/80 bg-white/90 p-8 shadow-[0_35px_100px_rgba(15,23,42,0.16)] dark:border-gray-700/60 dark:bg-gray-900/65 sm:p-10">
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/70 bg-white/70 shadow dark:border-white/35 dark:bg-white/25 ${iconColor}`}>
          <Icon className={`h-8 w-8 ${status === "loading" ? "animate-spin" : ""}`} />
        </div>
        <h1 className="mt-6 text-3xl font-bold leading-tight text-gray-900 dark:text-white">{t(`${status}Title`)}</h1>
        <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-300">{t(`${status}Desc`)}</p>
        <div className="mt-8">
          {status === "idle" || status === "loading" ? (
            <button
              type="button"
              onClick={run}
              disabled={status === "loading"}
              className="inline-flex items-center justify-center rounded-xl bg-clay-fill px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#9A3C1A] disabled:opacity-60"
            >
              {t("button")}
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {t("home")}
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}
