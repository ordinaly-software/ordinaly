"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import { ShieldCheck, Mail, RefreshCw, Clock3 } from "lucide-react";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  email: string;
}

export default function EmailVerificationModal({
  isOpen,
  onClose,
  onVerified,
  email,
}: EmailVerificationModalProps) {
  const t = useTranslations("emailVerificationModal");
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(120);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://api.ordinaly.ai";
  const autoSentRef = useRef(false);

  // Reset state and auto-send OTP when modal opens.
  // This ensures legacy users (who signed in before verification was required)
  // immediately receive a code without having to wait for the resend cooldown.
  useEffect(() => {
    if (isOpen) {
      setCode("");
      setError("");
      setSeconds(120);

      if (!autoSentRef.current && email) {
        autoSentRef.current = true;
        fetch(`${apiUrl}/auth/resend-verification/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }).catch(() => {
          // Silently ignore – the user can manually resend later
        });
      }
    } else {
      autoSentRef.current = false;
    }
  }, [isOpen, email, apiUrl]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (!isOpen || seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [isOpen, seconds]);

  const handleVerify = useCallback(async () => {
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

      if (!res.ok) {
        const msg =
          data.non_field_errors?.[0] ||
          data.code?.[0] ||
          data.email?.[0] ||
          data.detail ||
          data.error ||
          t("error");
        setError(msg);
        setLoading(false);
        return;
      }

      // Update verification state
      document.cookie = "email_verified=true; path=/;";
      localStorage.removeItem("pending_email");

      setLoading(false);
      onVerified();
    } catch {
      setLoading(false);
      setError(t("networkError"));
    }
  }, [apiUrl, email, code, t, onVerified]);

  const handleResend = useCallback(async () => {
    setError("");

    try {
      const res = await fetch(`${apiUrl}/auth/resend-verification/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.non_field_errors?.[0] ||
          data.email?.[0] ||
          data.detail ||
          data.error ||
          t("resendError");
        setError(msg);
        return;
      }

      setSeconds(120);
    } catch {
      setError(t("networkError"));
    }
  }, [apiUrl, email, t]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6 sm:p-8">
        {/* Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          <ShieldCheck className="h-8 w-8" />
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h2>

        {/* Description */}
        <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {t("description")}
        </p>

        {/* Email badge */}
        <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate">{email}</span>
        </div>

        {/* OTP Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("codeLabel")}
          </label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 text-center text-lg tracking-widest bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white transition-all ${
              error
                ? "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/20"
                : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#1F8A0D] dark:focus:ring-[#3FBD6F]"
            }`}
            placeholder="------"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-3 text-sm font-medium text-red-500 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Resend cooldown */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
          <Clock3 className="h-4 w-4" />
          {seconds > 0 ? t("resendIn", { seconds }) : t("resend")}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleVerify}
            disabled={loading || code.length < 6}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F8A0D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4D08] disabled:opacity-50 dark:bg-[#3FBD6F] dark:text-[#1A1924] dark:hover:bg-[#2EA55E]"
          >
            <ShieldCheck className="h-4 w-4" />
            {loading ? t("verifying") : t("verify")}
          </button>

          {seconds <= 0 && (
            <button
              onClick={handleResend}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              {t("resend")}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
