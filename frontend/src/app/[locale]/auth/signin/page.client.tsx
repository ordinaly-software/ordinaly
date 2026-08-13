"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Footer from "@/components/ui/footer";
import Alert from "@/components/ui/alert";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { isFunctionalAllowed } from "@/utils/cookie-manager";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { getApiUrl } from "@/lib/api-config";
import {
  setEmailCooldown,
  VERIFY_EMAIL_COOLDOWN_KEY,
} from "@/lib/email-confirmation";



type AuthResponse = {
  id: number;
  username: string;
  email: string;
  token: string;
  email_verified?: boolean;
  message?: string;
};

type AuthErrorPayload = Record<string, unknown> | null;

export default function LoginPage() {
  const t = useTranslations("signin");
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);
  const { executeRecaptcha } = useGoogleReCaptcha();


  useEffect(() => {
    const token =
      localStorage.getItem('auth_token');
    if (token) {
      window.location.href = '/';
      return;
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    try {
      const canPersistTheme = isFunctionalAllowed();
      if (canPersistTheme) {
        localStorage.setItem("theme", isDark ? "dark" : "light");
      } else {
        localStorage.removeItem("theme");
      }
    } catch {
      // Ignore storage failures
    }
  }, [isDark]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    const animateElements = document.querySelectorAll(".scroll-animate");
    animateElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  const extractAuthErrorMessage = (value: unknown): string | null => {
    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        const nestedMessage = extractAuthErrorMessage(entry);
        if (nestedMessage) {
          return nestedMessage;
        }
      }
      return null;
    }

    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      const prioritizedKeys = ["detail", "error", "message", "non_field_errors", "emailOrUsername", "password"];

      for (const key of prioritizedKeys) {
        if (key in record) {
          const nestedMessage = extractAuthErrorMessage(record[key]);
          if (nestedMessage) {
            return nestedMessage;
          }
        }
      }

      for (const nestedValue of Object.values(record)) {
        const nestedMessage = extractAuthErrorMessage(nestedValue);
        if (nestedMessage) {
          return nestedMessage;
        }
      }
    }

    return null;
  };

  const getLocalizedAuthError = (payload: AuthErrorPayload, statusCode: number) => {
    if (statusCode === 401) {
      return t("messages.invalidCredentials");
    }

    const rawMessage = extractAuthErrorMessage(payload);
    if (!rawMessage) return null;

    const normalized = rawMessage.trim().toLowerCase();

    if (
      normalized === "invalid credentials" ||
      normalized === "invalid credentials payload" ||
      normalized === "no active account found with the given credentials" ||
      normalized === "credenciales inválidas" ||
      normalized === "credenciales invalidas"
    ) {
      return t("messages.invalidCredentials");
    }

    if (
      normalized === "email/username and password are required" ||
      normalized === "email y contraseña son obligatorios"
    ) {
      return t("messages.fillAllFields");
    }

    return rawMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setAlert({ type: "error", message: t("messages.fillAllFields") });
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      // reCAPTCHA (optional — skip if not loaded)
      const recaptchaToken = executeRecaptcha ? await executeRecaptcha("login_form") : "";
      const response = await fetch("/api/auth/signin/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailOrUsername: email.trim(),
          password: password,
          recaptchaToken,
        }),
      });


      const data = (await response.json().catch(() => null)) as AuthResponse | AuthErrorPayload;

      if (response.ok) {
        const successData = data as AuthResponse;
        localStorage.setItem("auth_token", successData.token);
        document.cookie = `email_verified=${successData.email_verified}; path=/`;
        window.dispatchEvent(new Event("auth-state-changed"));

        setAlert({ type: "success", message: t("messages.success") });

        if (!successData.email_verified) {
          localStorage.setItem("pending_email", successData.email);
          setEmailCooldown(VERIFY_EMAIL_COOLDOWN_KEY);
          setTimeout(() => {
            window.location.href = "/verify-email";
          }, 1000);
        } else {
          setTimeout(() => {
            window.location.href = "/profile";
          }, 1000);
        }
      }
      else {
        const message = getLocalizedAuthError(data as AuthErrorPayload, response.status) || t("messages.invalidCredentials");
        setAlert({ type: "error", message });
      }
    } catch {
      setAlert({ type: "error", message: t("messages.networkError") });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[--color-bg-primary] text-slate-dark dark:bg-[--color-bg-inverted] dark:text-ivory-light">
      {alert && (
        <Alert
          key={`${alert.type}:${alert.message}`}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={alert.type === 'success' ? 2000 : 5000}
        />
      )}

      {/* Login Section */}
      <section className="bg-[--swatch--ivory-medium] px-4 py-16 dark:bg-[--swatch--slate-dark] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left side: Title + Illustration (hidden on mobile) */}
            <div className="scroll-animate slide-in-left">
              <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-medium dark:text-cloud-medium sm:text-xl">
                {t("subtitle")}
              </p>
            </div>

            {/* Right side: Login Card */}
            <div className="scroll-animate slide-in-right">
              <Card className="rounded-[2rem] border border-[--color-border-subtle] bg-white/80 shadow-[0_20px_80px_-55px_rgba(15,23,42,0.25)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
                <CardContent className="pt-8">
                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Google Sign-In */}
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-3 active:scale-[0.98]"
                        onClick={() => {
                          const apiBaseUrl = getApiUrl().replace(/\/$/, "");
                          window.location.href = `${apiBaseUrl}/auth/google/login/`;
                        }}
                      >
                        <img
                          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                          className="h-5 w-5"
                          alt=""
                        />
                        {t("form.continueWithGoogle")}
                      </Button>

                      <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-[--color-border-subtle] dark:border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-[--swatch--ivory-light] px-2 text-cloud-medium dark:bg-[--swatch--slate-dark]">
                            {t("form.orContinueWith")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t("form.emailLabel")}</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                        <Input
                          id="email"
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          placeholder={t("form.emailPlaceholder")}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{t("form.passwordLabel")}</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          placeholder={t("form.passwordPlaceholder")}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-cloud-medium transition-colors hover:text-slate-medium dark:hover:text-cloud-light"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-start">
                      <Link
                        href="/reset-password"
                        className="text-sm text-cobalt hover:underline"
                      >
                        {t("form.forgotPassword")}
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      variant="accent"
                      size="lg"
                      disabled={isLoading}
                      className="w-full active:scale-[0.98]"
                    >
                      {isLoading ? t("form.submitButtonLoading") : t("form.submitButton")}
                    </Button>
                  </form>

                  <p className="mt-6 text-center text-sm text-slate-medium dark:text-cloud-medium">
                    {t("form.signupPrompt")}{" "}
                    <Link href="/auth/signup" className="text-cobalt hover:underline">
                      {t("form.signupLink")}
                    </Link>
                  </p>

                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}
