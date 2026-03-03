"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  setEmailCooldown,
  VERIFY_EMAIL_COOLDOWN_KEY,
} from "@/lib/email-confirmation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations("oauthCallback");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorMessages = useMemo(
    () => ({
      cancelled: t("errors.cancelled"),
      invalid_token: t("errors.invalidToken"),
      account_conflict: t("errors.accountConflict"),
    }),
    [t]
  );

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    if (token) {
      localStorage.setItem("auth_token", token);

      const emailVerified = params.get("email_verified");
      const emailParam = params.get("email");

      if (emailVerified === "false") {
        // Unverified user: redirect to verify-email
        if (emailParam) {
          localStorage.setItem("pending_email", emailParam);
        }
        setEmailCooldown(VERIFY_EMAIL_COOLDOWN_KEY);
        document.cookie = `email_verified=false; path=/;`;
        window.location.href = "/verify-email";
      } else {
        document.cookie = `email_verified=true; path=/;`;
        router.push("/profile");
      }
      return;
    }

    if (error) {
      const normalizedError = error.toLowerCase();
      const mappedError = errorMessages[normalizedError as keyof typeof errorMessages];
      setErrorMessage(mappedError ?? errorDescription ?? t("errors.generic"));
      return;
    }

    setErrorMessage(t("errors.generic"));
  }, [params, router, t, errorMessages]);

  if (!errorMessage) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-[#3FBD6F]/10 dark:via-[#46B1C9]/10 dark:to-[#623CEA]/10 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-8 text-center shadow-xl">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-[#1F8A0D] dark:border-gray-600 dark:border-t-[#3FBD6F]" />
                <p className="mt-4 text-base font-medium text-gray-700 dark:text-gray-300">{t("processing")}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <p className="text-base text-gray-700">{errorMessage}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => router.push("/auth/signin")}
            className="rounded-md bg-[#1F8A0D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#176708]"
          >
            {t("actions.goToSignIn")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {t("actions.goHome")}
          </button>
        </div>
      </div>
    </div>
  );
}
