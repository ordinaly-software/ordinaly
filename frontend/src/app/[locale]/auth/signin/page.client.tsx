"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/ui/footer";
import Alert from "@/components/ui/alert";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import StyledButton from "@/components/ui/styled-button";
import Link from "next/link";
import { isFunctionalAllowed } from "@/utils/cookieManager";
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
    <div className="min-h-screen bg-[var(--swatch--ivory-light)] dark:bg-[var(--swatch--slate-dark)] text-[var(--swatch--slate-dark)] dark:text-[var(--swatch--ivory-light)] transition-colors duration-300">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--swatch--ivory-medium)] dark:bg-[var(--swatch--slate-medium)]/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* Left side: Title + Illustration (hidden on mobile) */}
            <div className="scroll-animate slide-in-left">
              <h1 className="text-5xl md:text-5xl font-bold mb-6 text-[var(--swatch--slate-dark)] dark:text-[var(--swatch--ivory-light)] leading-tight pb-2">
                {t("title")}
              </h1>
              <p className="text-xl text-[var(--swatch--slate-medium)] dark:text-[var(--swatch--cloud-medium)] mb-12 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>

            {/* Right side: Login Card */}
            <div className="scroll-animate slide-in-right">
              <Card className="bg-[var(--swatch--ivory-light)] dark:bg-[var(--swatch--slate-medium)]/50 border-[var(--swatch--oat)] dark:border-[var(--swatch--slate-light)] hover:border-[var(--swatch--clay)] transition-all duration-300 hover:shadow-xl">
                <br></br>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Google Sign-In */}
                    <div className="mt-6">
                      <div className="relative mb-6">
                        <button
                          type="button"
                          onClick={() => {
                            const apiBaseUrl = getApiUrl().replace(/\/$/, "");
                            window.location.href = `${apiBaseUrl}/auth/google/login/`;
                          }}
                          className="
                              w-full flex items-center justify-center gap-3
                              bg-[var(--swatch--ivory-light)] dark:bg-[var(--swatch--slate-dark)]
                              border border-[var(--swatch--oat)] dark:border-[var(--swatch--slate-light)]
                              rounded-lg py-3 px-4
                              shadow hover:shadow-md
                              transition-all
                              hover:border-[var(--swatch--clay)]
                              hover:bg-[var(--swatch--clay)]/10
                              dark:hover:bg-[var(--swatch--clay)]/20
                              "
                        >
                          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            className="w-5 h-5" alt="Google" />
                          <span className="font-medium">{t("form.continueWithGoogle")}</span>
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-[var(--swatch--oat)] dark:border-[var(--swatch--slate-light)]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-[var(--swatch--ivory-light)] dark:bg-[var(--swatch--slate-medium)] text-[var(--swatch--cloud-medium)]">
                            {t("form.orContinueWith")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[var(--swatch--slate-dark)] dark:text-[var(--swatch--cloud-medium)]">
                        {t("form.emailLabel")}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-[var(--swatch--ivory-medium)] dark:bg-[var(--swatch--slate-medium)] border-[var(--swatch--oat)] dark:border-[var(--swatch--slate-light)] focus:border-[var(--swatch--clay)]"
                          placeholder={t("form.emailPlaceholder")}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-[var(--swatch--slate-dark)] dark:text-[var(--swatch--cloud-medium)]">
                        {t("form.passwordLabel")}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-[var(--swatch--ivory-medium)] dark:bg-[var(--swatch--slate-medium)] border-[var(--swatch--oat)] dark:border-[var(--swatch--slate-light)] focus:border-[var(--swatch--clay)]"
                          placeholder={t("form.passwordPlaceholder")}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                        className="text-sm text-[var(--swatch--cobalt)] hover:underline"
                      >
                        {t("form.forgotPassword")}
                      </Link>
                    </div>

                    {/* Centered and smaller sign-in button */}
                    <div className="flex justify-center">
                      <StyledButton
                        text={isLoading ? t("form.submitButtonLoading") : t("form.submitButton")}
                        type="submit"
                      />
                    </div>
                  </form>

                  <p className="mt-6 text-center text-sm text-[var(--swatch--slate-medium)] dark:text-[var(--swatch--cloud-medium)]">
                    {t("form.signupPrompt")}
                    <Link href="/auth/signup" className="text-[var(--swatch--cobalt)] hover:underline">
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
