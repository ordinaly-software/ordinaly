"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, Mail, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const t = useTranslations("resetPassword");
  const searchParams = useSearchParams();
  const { locale } = useParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError(t("request.emailRequired"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";
      const response = await fetch(`${apiUrl}/auth/password/reset/request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        localStorage.setItem("password_reset_requested", "true");
        window.location.href = `/${locale}/reset-password/email-sent`;
      } else {
        setError(t("request.error"));
      }
    } catch {
      setError(t("request.networkError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F9FAFB] text-gray-800 transition-colors duration-300 dark:bg-[#1A1924] dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-20 h-96 w-96 rounded-full bg-[#46B1C9]/20 blur-3xl dark:bg-[#46B1C9]/15" />
        <div className="absolute top-20 right-0 h-[24rem] w-[24rem] rounded-full bg-[#7DB5FF]/20 blur-3xl dark:bg-[#7DB5FF]/15" />
        <div className="absolute bottom-[-10rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#623CEA]/15 blur-3xl dark:bg-[#623CEA]/10" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <article className="w-full overflow-hidden rounded-[2rem] border border-gray-200/80 bg-white/90 shadow-[0_35px_100px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-900/65 dark:shadow-[0_35px_100px_rgba(2,6,23,0.55)]">
          <div className="grid lg:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.2fr)]">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#46B1C9]/20 via-[#7DB5FF]/20 to-[#623CEA]/10 px-7 py-10 dark:from-[#46B1C9]/18 dark:via-[#7DB5FF]/18 dark:to-[#623CEA]/12 sm:px-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.35),transparent_58%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),transparent_58%)]" />
              <div className="relative flex h-full flex-col justify-between gap-10">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-white/70 bg-white/70 text-[#1A1924] shadow-lg dark:border-white/35 dark:bg-white/25 dark:text-white">
                  <KeyRound className="h-10 w-10" />
                </div>

                <div className="space-y-4">
                  <h2 className="max-w-xs text-2xl font-semibold leading-tight text-[#1A1924] dark:text-slate-100">
                    {t("request.title")}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("request.subtitle")}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-7 py-10 sm:px-10 lg:px-12">
              <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-4xl">
                {t("request.title")}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
                {t("request.subtitle")}
              </p>

              <form onSubmit={handleSubmit} className="mt-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("request.emailLabel")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-base text-gray-900 transition-all focus:ring-2 focus:ring-[#D97757] dark:border-gray-600 dark:bg-gray-800/50 dark:text-white dark:focus:ring-[#E15D31]"
                      placeholder={t("request.emailPlaceholder")}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-3 text-sm font-medium text-red-500 dark:text-red-400">
                    {error}
                  </p>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D97757] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C6613F] disabled:opacity-50 dark:bg-[#E15D31] dark:text-white dark:hover:bg-[#C6613F]"
                  >
                    <KeyRound className="h-4 w-4" />
                    {isLoading ? t("request.submitLoading") : t("request.submit")}
                  </button>

                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("request.backToSignin")}
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
