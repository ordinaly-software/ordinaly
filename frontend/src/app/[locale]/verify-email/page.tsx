"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ShieldCheck, Clock3, Mail, RefreshCw } from "lucide-react";
import {
  clearEmailCooldown,
  getEmailCooldownRemaining,
  parseCooldownSeconds,
  setEmailCooldown,
  VERIFY_EMAIL_COOLDOWN_KEY,
} from "@/lib/email-confirmation";

export default function VerifyEmailPage() {
  const t = useTranslations("verifyEmail");
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";

  // Guards: redirect if unauthenticated or already verified
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/auth/signin";
      return;
    }

    const cookies = document.cookie.split("; ").reduce<Record<string, string>>((acc, c) => {
      const [k, v] = c.split("=");
      acc[k] = v;
      return acc;
    }, {});

    const savedEmail = localStorage.getItem("pending_email");
    const hasPendingEmailConfirmation = localStorage.getItem("pending_email_requires_confirmation") === "true";

    if (cookies.email_verified === "true" && !hasPendingEmailConfirmation) {
      window.location.href = "/";
      return;
    }

    if (savedEmail) setEmail(savedEmail);
    setSeconds(getEmailCooldownRemaining(VERIFY_EMAIL_COOLDOWN_KEY));
    setReady(true);
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(`${apiUrl}/auth/verify-email/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        const msg =
          data.non_field_errors?.[0] ||
          data.code?.[0] ||
          data.email?.[0] ||
          data.detail ||
          data.error ||
          t("error");
        setError(msg);
        return;
      }

      document.cookie = "email_verified=true; path=/;";
      clearEmailCooldown(VERIFY_EMAIL_COOLDOWN_KEY);
      localStorage.removeItem("pending_email");
      localStorage.removeItem("pending_email_requires_confirmation");
      window.location.href = "/profile";
    } catch {
      setLoading(false);
      setError(t("networkError"));
    }
  };

  const handleResend = async () => {
    setError("");

    try {
      const res = await fetch(`${apiUrl}/auth/resend-verification/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        const apiMessage =
          data.non_field_errors?.[0] ||
          data.email?.[0] ||
          data.detail ||
          data.error ||
          t("resendError");
        const cooldownSeconds =
          parseCooldownSeconds(data.remaining_seconds) ||
          parseCooldownSeconds(apiMessage);

        if (cooldownSeconds) {
          setEmailCooldown(VERIFY_EMAIL_COOLDOWN_KEY, cooldownSeconds);
          setSeconds(cooldownSeconds);
          setError("");
          return;
        }

        setError(apiMessage);
        return;
      }

      setEmailCooldown(VERIFY_EMAIL_COOLDOWN_KEY);
      setSeconds(getEmailCooldownRemaining(VERIFY_EMAIL_COOLDOWN_KEY));
    } catch {
      setError(t("networkError"));
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] dark:bg-[#1A1924]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0255D5] dark:border-[#7DB5FF]" />
      </div>
    );
  }

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
                  <ShieldCheck className="h-10 w-10" />
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-4xl">
                    {t("title")}
                  </h1>
                </div>
              </div>
            </div>

            <div className="px-7 py-10 sm:px-10 lg:px-12">
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
                {t("subtitle")}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
                <Mail className="h-4 w-4" />
                {email}
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("codeLabel")}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-center text-lg tracking-widest transition-all bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white ${
                    error
                      ? "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#0255D5] dark:focus:ring-[#7DB5FF]"
                  }`}
                  placeholder="------"
                />
              </div>

              {error && (
                <p className="mt-3 text-sm font-medium text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100/80 px-4 py-2 text-sm font-medium text-amber-900 dark:border-amber-300/40 dark:bg-amber-300/12 dark:text-amber-200">
                <Clock3 className="h-4 w-4" />
                {seconds > 0
                  ? t("resendIn", { seconds })
                  : t("resendReady")}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleVerify}
                  disabled={loading || code.length < 6}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0255D5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#01388A] disabled:opacity-50 dark:bg-[#7DB5FF] dark:text-[#1A1924] dark:hover:bg-[#60A5FA]"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {loading ? t("verifying") : t("verify")}
                </button>

                {seconds === 0 && (
                  <button
                    onClick={handleResend}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t("resend")}
                  </button>
                )}
              </div>

              <div className="mt-6">
                <Link
                  href="/change-email"
                  className="text-sm font-medium text-[#46B1C9] hover:underline"
                >
                  {t("changeEmail")}
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
