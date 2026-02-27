"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MailCheck, Clock3, Home } from "lucide-react";
import { useMemo } from "react";

export default function ResetPasswordEmailSent() {
  const t = useTranslations("resetPassword");
  const params = useParams<{ locale?: string | string[] }>();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const localeParam = params?.locale;
  const locale = Array.isArray(localeParam) ? localeParam[0] : localeParam;
  const homeHref = useMemo(() => (locale ? `/${locale}` : "/"), [locale]);

  useEffect(() => {
    const requested = localStorage.getItem("password_reset_requested");
    if (!requested) {
      router.replace(homeHref);
      return;
    }
    setAllowed(true);
  }, [homeHref, router]);

  if (!allowed) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F9FAFB] text-gray-800 transition-colors duration-300 dark:bg-[#1A1924] dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-20 h-96 w-96 rounded-full bg-[#46B1C9]/20 blur-3xl dark:bg-[#46B1C9]/15" />
        <div className="absolute top-20 right-0 h-[24rem] w-[24rem] rounded-full bg-[#3FBD6F]/20 blur-3xl dark:bg-[#3FBD6F]/15" />
        <div className="absolute bottom-[-10rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#623CEA]/15 blur-3xl dark:bg-[#623CEA]/10" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <article className="w-full overflow-hidden rounded-[2rem] border border-gray-200/80 bg-white/90 shadow-[0_35px_100px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-900/65 dark:shadow-[0_35px_100px_rgba(2,6,23,0.55)]">
          <div className="grid lg:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.2fr)]">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#46B1C9]/20 via-[#3FBD6F]/20 to-[#623CEA]/10 px-7 py-10 dark:from-[#46B1C9]/18 dark:via-[#3FBD6F]/18 dark:to-[#623CEA]/12 sm:px-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.35),transparent_58%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),transparent_58%)]" />
              <div className="relative flex h-full flex-col justify-between gap-10">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-white/70 bg-white/70 text-[#1A1924] shadow-lg dark:border-white/35 dark:bg-white/25 dark:text-white">
                  <MailCheck className="h-10 w-10" />
                </div>

                <div className="space-y-4">
                  <h2 className="max-w-xs text-2xl font-semibold leading-tight text-[#1A1924] dark:text-slate-100">
                    {t("emailSent.title")}
                  </h2>
                </div>
              </div>
            </div>

            <div className="px-7 py-10 sm:px-10 lg:px-12">
              <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-4xl">
                {t("emailSent.title")}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
                {t("emailSent.description")}
              </p>

              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
                {t("emailSent.description")}
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100/80 px-4 py-2 text-sm font-medium text-amber-900 dark:border-amber-300/40 dark:bg-amber-300/12 dark:text-amber-200">
                <Clock3 className="h-4 w-4" />
                {t("emailSent.expiry")}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={homeHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F8A0D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4D08] dark:bg-[#3FBD6F] dark:text-[#1A1924] dark:hover:bg-[#2EA55E]"
                >
                  <Home className="h-4 w-4" />
                  {t("emailSent.backHome")}
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
