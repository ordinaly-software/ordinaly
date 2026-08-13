"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/contexts/theme-context";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Footer from "@/components/ui/footer";
import Alert from "@/components/ui/alert";
import { User, Mail, Lock, Building2, Eye, EyeOff, Globe, MapPin, ArrowLeft } from "lucide-react";
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

const TOTAL_STEPS = 3;

const stepVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -24 : 24, transition: { duration: 0.2 } }),
};

function SignupPageContent() {
  const t = useTranslations("signup");
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [allowNotifications, setAllowNotifications] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();


  useEffect(() => {
    const token =
      localStorage.getItem('auth_token');
    if (token) {
      // Redirect to home if already authenticated
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

  const validateStep1 = () => {
    const stepErrors: { [key: string]: string } = {};
    if (!name.trim()) stepErrors.name = t("messages.validation.nameRequired");
    if (!surname.trim()) stepErrors.surname = t("messages.validation.surnameRequired");
    if (!email.trim()) stepErrors.email = t("messages.validation.emailRequired");
    else if (!email.includes("@")) stepErrors.email = t("messages.validation.emailInvalid");

    setErrors(prev => ({
      ...prev,
      name: stepErrors.name ?? "",
      surname: stepErrors.surname ?? "",
      email: stepErrors.email ?? "",
    }));
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep3 = () => {
    const stepErrors: { [key: string]: string } = {};
    if (!password) stepErrors.password = t("messages.validation.passwordRequired");
    else if (password.length < 8) stepErrors.password = t("messages.validation.passwordTooShort");
    if (password !== confirmPassword) stepErrors.confirmPassword = t("messages.validation.passwordMismatch");
    if (!acceptedTerms) stepErrors.terms = t("messages.validation.termsRequired");

    setErrors(prev => ({
      ...prev,
      password: stepErrors.password ?? "",
      confirmPassword: stepErrors.confirmPassword ?? "",
      terms: stepErrors.terms ?? "",
    }));
    return Object.keys(stepErrors).length === 0;
  };

  const goToStep = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    goToStep(Math.min(step + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    goToStep(Math.max(step - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading || isRedirecting) return;

    // Steps 1 and 2 use the same "Continue" affordance as the form's submit
    // button, so pressing Enter on those steps should advance, not submit.
    if (step < TOTAL_STEPS) {
      handleNext();
      return;
    }

    const step1Valid = validateStep1();
    const step3Valid = validateStep3();
    if (!step1Valid || !step3Valid) {
      setAlert({ type: 'error', message: t("messages.validation.formIncomplete") });
      if (!step1Valid) goToStep(1);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setAlert(null);

    try {
      // reCAPTCHA (optional — skip if not loaded)
      const recaptchaToken = executeRecaptcha ? await executeRecaptcha("signup_form") : "";
      // Generate username from email prefix (sanitize to match ^[a-zA-Z0-9_]{3,30}$)
      let username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
      if (username.length < 3) username = `${username}user`.slice(0, 30);
      if (username.length > 30) username = username.slice(0, 30);

      const signupData: Record<string, unknown> = {
        name: name.trim(),
        surname: surname.trim(),
        username: username.trim(),
        email: email.trim(),
        company: company.trim() || null,
        region: region.trim() || null,
        city: city.trim() || null,
        password: password,
        allow_notifications: allowNotifications,
        recaptchaToken,
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";
      const response = await fetch(`${apiUrl}/api/users/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });


      const data = (await response.json()) as AuthResponse;

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }

        localStorage.setItem("pending_email", data.email);
        setEmailCooldown(VERIFY_EMAIL_COOLDOWN_KEY);
        document.cookie = `email_verified=false; path=/;`;

        setIsRedirecting(true);
        window.location.href = "/verify-email";
      } else {
        let duplicateAlertMessage: string | null = null;
        const errorData = data as Record<string, unknown>;

        const getFieldError = (field: string, value: unknown) => {
          if (!value) return null;
          const rawValue = Array.isArray(value) ? (value[0] as string) : (value as string);
          if (!rawValue) return null;
          const normalized = rawValue.toLowerCase();

          if (field === "email" && (normalized === "email_taken" || normalized.includes("custom user with this email"))) {
            const message = t("messages.validation.emailTaken");
            duplicateAlertMessage = message;
            return { message, inline: false, alert: true };
          }

          if (field === "username" && (normalized === "username_taken" || normalized.includes("custom user with this username"))) {
            const message = t("messages.validation.usernameTaken");
            // The username field isn't shown to the user (it's derived from
            // their email), so this can only be surfaced as a banner alert.
            return { message, inline: true, alert: true };
          }

          return { message: rawValue, inline: true, alert: false };
        };

        const usernameError = errorData.username ? getFieldError("username", errorData.username) : null;
        if (usernameError?.inline) setErrors(prev => ({ ...prev, username: usernameError.message }));
        if (usernameError?.alert) duplicateAlertMessage = usernameError.message;

        const emailError = errorData.email ? getFieldError("email", errorData.email) : null;
        if (emailError?.inline) setErrors(prev => ({ ...prev, email: emailError.message }));
        if (emailError?.alert) duplicateAlertMessage = emailError.message;

        if (errorData.password) {
          setErrors(prev => ({
            ...prev,
            password: Array.isArray(errorData.password)
              ? String(errorData.password[0] ?? "")
              : String(errorData.password),
          }));
        }
        if (errorData.company) {
          setErrors(prev => ({
            ...prev,
            company: Array.isArray(errorData.company)
              ? String(errorData.company[0] ?? "")
              : String(errorData.company),
          }));
        }

        // Jump back to the earliest step that actually has a visible error,
        // otherwise the user stays on step 3 and never sees why it failed.
        if (emailError?.inline || usernameError) {
          goToStep(1);
        } else if (errorData.company) {
          goToStep(2);
        }

        if (duplicateAlertMessage) {
          setAlert({ type: 'error', message: duplicateAlertMessage });
        } else if (errorData.non_field_errors) {
          setAlert({
            type: 'error',
            message: Array.isArray(errorData.non_field_errors)
              ? String(errorData.non_field_errors[0] ?? "")
              : String(errorData.non_field_errors)
          });
        } else if (errorData.detail) {
          setAlert({ type: 'error', message: String(errorData.detail) });
        } else if (errorData.error) {
          setAlert({ type: 'error', message: String(errorData.error) });
        }
      }
    } catch {
      setAlert({ type: 'error', message: t("messages.networkError") });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[--color-bg-primary] text-slate-dark dark:bg-[--color-bg-inverted] dark:text-ivory-light">
      {/* Fullscreen loading overlay during redirect */}
      {isRedirecting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[--color-bg-primary] dark:bg-[--color-bg-inverted]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-oat border-t-clay dark:border-[--swatch--slate-medium] dark:border-t-clay" />
          <p className="mt-4 text-lg font-medium text-slate-medium dark:text-cloud-medium">
            {t("messages.success")}
          </p>
        </div>
      )}

      {/* Alert Component */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={alert.type === 'success' ? 3000 : 5000}
        />
      )}

      {/* Signup Section */}
      <section className="bg-[--swatch--ivory-medium] px-4 py-16 dark:bg-[--swatch--slate-dark] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            {/* Left side: Title */}
            <div className="scroll-animate slide-in-left">
              <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-medium dark:text-cloud-medium sm:text-xl">
                {t("subtitle")}
              </p>
            </div>

            {/* Right side: Signup Card */}
            <div className="scroll-animate slide-in-right">
              <Card className="rounded-[2rem] border border-[--color-border-subtle] bg-white/80 shadow-[0_20px_80px_-55px_rgba(15,23,42,0.25)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
                <CardHeader className="space-y-4">
                  <div className="flex gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
                    {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${index < step ? "bg-clay" : "bg-oat dark:bg-white/10"
                          }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-xl font-semibold tracking-[-0.02em]">
                      {t(`form.step${step}Title` as "form.step1Title")}
                    </CardTitle>
                    <span className="whitespace-nowrap text-xs font-medium text-cloud-medium">
                      {t("form.stepIndicator", { current: step, total: TOTAL_STEPS })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>

                  {/* Google Sign-Up — only offered as a shortcut on the first step */}
                  {step === 1 && (
                    <div className="mb-6">
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
                        {t("form.signupWithGoogle")}
                      </Button>

                      <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-[--color-border-subtle] dark:border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-[--swatch--ivory-light] px-2 text-cloud-medium dark:bg-[--swatch--slate-dark]">
                            {t("form.orSignupWithEmail")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait" custom={direction} initial={false}>
                      {step === 1 && (
                        <motion.div
                          key="step1"
                          custom={direction}
                          variants={stepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-6"
                        >
                          {/* Name and Surname Fields - Same Row */}
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="name">{t("form.nameLabel")}</Label>
                              <div className="relative">
                                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                                <Input
                                  id="name"
                                  type="text"
                                  value={name}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                  className="pl-10"
                                  placeholder={t("form.namePlaceholder")}
                                  required
                                  autoFocus
                                />
                              </div>
                              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="surname">{t("form.surnameLabel")}</Label>
                              <div className="relative">
                                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                                <Input
                                  id="surname"
                                  type="text"
                                  value={surname}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSurname(e.target.value)}
                                  className="pl-10"
                                  placeholder={t("form.surnamePlaceholder")}
                                  required
                                />
                              </div>
                              {errors.surname && <p className="text-sm text-red-500">{errors.surname}</p>}
                            </div>
                          </div>

                          {/* Email Field */}
                          <div className="space-y-2">
                            <Label htmlFor="email">{t("form.emailLabel")}</Label>
                            <div className="relative">
                              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                              <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                className="pl-10"
                                placeholder={t("form.emailPlaceholder")}
                                required
                              />
                            </div>
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                          </div>

                          <Button
                            type="submit"
                            variant="accent"
                            size="lg"
                            className="w-full active:scale-[0.98]"
                          >
                            {t("form.nextButton")}
                          </Button>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div
                          key="step2"
                          custom={direction}
                          variants={stepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-6"
                        >
                          {/* Company Field */}
                          <div className="space-y-2">
                            <Label htmlFor="company">{t("form.companyLabel")}</Label>
                            <div className="relative">
                              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                              <Input
                                id="company"
                                type="text"
                                value={company}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
                                className="pl-10"
                                placeholder={t("form.companyPlaceholder")}
                                autoFocus
                              />
                            </div>
                            {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
                          </div>

                          {/* Region and City Fields - Same Row (Optional) */}
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="region">{t("form.regionLabel")}</Label>
                              <div className="relative">
                                <Globe className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                                <Input
                                  id="region"
                                  type="text"
                                  value={region}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegion(e.target.value)}
                                  className="pl-10"
                                  placeholder={t("form.regionPlaceholder")}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="city">{t("form.cityLabel")}</Label>
                              <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                                <Input
                                  id="city"
                                  type="text"
                                  value={city}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                                  className="pl-10"
                                  placeholder={t("form.cityPlaceholder")}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              onClick={handleBack}
                              className="gap-2 active:scale-[0.98]"
                            >
                              <ArrowLeft className="h-4 w-4" />
                              {t("form.backButton")}
                            </Button>
                            <Button
                              type="submit"
                              variant="accent"
                              size="lg"
                              className="flex-1 active:scale-[0.98]"
                            >
                              {t("form.nextButton")}
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      {step === 3 && (
                        <motion.div
                          key="step3"
                          custom={direction}
                          variants={stepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-6"
                        >
                          {/* Password Field */}
                          <div className="space-y-2">
                            <Label htmlFor="password">{t("form.passwordLabel")}</Label>
                            <div className="relative">
                              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                className="pl-10 pr-10"
                                placeholder={t("form.passwordPlaceholder")}
                                required
                                autoFocus
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
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                          </div>

                          {/* Confirm Password Field */}
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t("form.confirmPasswordLabel")}</Label>
                            <div className="relative">
                              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                className="pl-10 pr-10"
                                placeholder={t("form.confirmPasswordPlaceholder")}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-cloud-medium transition-colors hover:text-slate-medium dark:hover:text-cloud-light"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                          </div>

                          {/* Terms, Notifications and Select All */}
                          <div className="space-y-3">
                            {/* Select All */}
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                id="selectAll"
                                checked={acceptedTerms && allowNotifications}
                                onChange={(e) => {
                                  setAcceptedTerms(e.target.checked);
                                  setAllowNotifications(e.target.checked);
                                }}
                                className="mt-1 h-4 w-4 rounded border-oat text-clay focus:ring-clay focus:ring-offset-0 dark:border-[--swatch--slate-light]"
                              />
                              <Label htmlFor="selectAll" className="text-sm font-medium leading-relaxed">
                                {t("form.selectAll")}
                              </Label>
                            </div>

                            <div className="ml-1 space-y-3 border-l-2 border-[--color-border-subtle] pl-4 dark:border-white/10">
                              {/* Terms and Privacy */}
                              <div className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  id="acceptTerms"
                                  checked={acceptedTerms}
                                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-oat text-clay focus:ring-clay focus:ring-offset-0 dark:border-[--swatch--slate-light]"
                                  required
                                />
                                <Label htmlFor="acceptTerms" className="text-sm font-normal leading-relaxed text-slate-medium dark:text-cloud-medium">
                                  {t("form.acceptTerms")}{" "}
                                  <a
                                    href="/legal?tab=terms"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-cobalt underline hover:text-clay"
                                  >
                                    {t("form.termsLink")}
                                  </a>{" "}
                                  {t("form.and")}{" "}
                                  <a
                                    href="/legal?tab=privacy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-cobalt underline hover:text-clay"
                                  >
                                    {t("form.privacyLink")}
                                  </a>
                                </Label>
                              </div>

                              {/* Notifications */}
                              <div className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  id="allowNotifications"
                                  checked={allowNotifications}
                                  onChange={(e) => setAllowNotifications(e.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-oat text-clay focus:ring-clay focus:ring-offset-0 dark:border-[--swatch--slate-light]"
                                />
                                <Label htmlFor="allowNotifications" className="text-sm font-normal leading-relaxed text-slate-medium dark:text-cloud-medium">
                                  {t("form.allowNotifications")}
                                </Label>
                              </div>
                            </div>

                            {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}
                          </div>

                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              onClick={handleBack}
                              className="gap-2 active:scale-[0.98]"
                            >
                              <ArrowLeft className="h-4 w-4" />
                              {t("form.backButton")}
                            </Button>
                            <Button
                              type="submit"
                              variant="accent"
                              size="lg"
                              disabled={isLoading || isRedirecting}
                              className="flex-1 active:scale-[0.98]"
                            >
                              {isLoading ? t("form.submitButtonLoading") : t("form.submitButton")}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>

                  <p className="mt-6 text-center text-sm text-slate-medium dark:text-cloud-medium">
                    {t("form.loginPrompt")}{" "}
                    <Link href="/auth/signin" className="text-cobalt hover:underline">
                      {t("form.loginLink")}
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

export default function SignupPage() {
  return <SignupPageContent />;
}
