"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Alert from "@/components/ui/alert";
import { User, Mail, Lock, Building2, Eye, EyeOff, Globe, MapPin } from "lucide-react";
import StyledButton from "@/components/ui/styled-button";
import Image from "next/image";
import GoogleSignInButton from '@/components/auth/google-signin-button';
import Link from "next/link";
import { getCookiePreferences } from "@/utils/cookieManager";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function SignupPage() {
  const t = useTranslations("signup");
  const { isDark } = useTheme();
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
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showImage, setShowImage] = useState(true);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Redirect to home if already authenticated
      window.location.href = '/';
      return;
    }

    const handleResize = () => {
      if (window.innerWidth >= 1025 ) {
        setShowImage(true);
      } else {
        setShowImage(false);
      }
    };

  handleResize(); // Check on mount
  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    try {
      const preferences = getCookiePreferences();
      const canPersistTheme = Boolean(preferences?.functional);
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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!name.trim()) newErrors.name = t("messages.validation.nameRequired");
    if (!surname.trim()) newErrors.surname = t("messages.validation.surnameRequired");
    if (!email.trim()) newErrors.email = t("messages.validation.emailRequired");
    if (!email.includes("@")) newErrors.email = t("messages.validation.emailInvalid");
    if (!company.trim()) newErrors.company = t("messages.validation.companyRequired");
    if (!password) newErrors.password = t("messages.validation.passwordRequired");
    if (password.length < 8) newErrors.password = t("messages.validation.passwordTooShort");
    if (password !== confirmPassword) newErrors.confirmPassword = t("messages.validation.passwordMismatch");
    if (!acceptedTerms) newErrors.terms = t("messages.validation.termsRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlert({ type: 'error', message: t("messages.validation.formIncomplete") });
      return;
    }

    setIsLoading(true);
    setErrors({});
    setAlert(null);

    try {
      let captchaToken: string | null = null;
      if (RECAPTCHA_SITE_KEY) {
        captchaToken = (await recaptchaRef.current?.executeAsync()) ?? null;
        if (!captchaToken) {
          setAlert({ type: 'error', message: t("messages.captchaRequired") });
          return;
        }
      }

      // Generate username from email prefix
      const username = email.split('@')[0];
      
      const signupData: Record<string, unknown> = {
        name: name.trim(),
        surname: surname.trim(),
        username: username.trim(),
        email: email.trim(),
        company: company.trim(),
        region: region.trim() || null,
        city: city.trim() || null,
        password: password,
      };

      if (captchaToken) {
        signupData.captchaToken = captchaToken;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
      const response = await fetch(`${apiUrl}/api/users/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token if provided
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        
        setAlert({type: 'success', message: t("messages.success")});
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        if (data.captcha) {
          setAlert({ type: 'error', message: t("messages.captchaFailed") });
          return;
        }
        let duplicateAlertMessage: string | null = null;
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
            return { message, inline: true, alert: false };
          }

          return { message: rawValue, inline: true, alert: false };
        };

        const usernameError = data.username ? getFieldError('username', data.username) : null;
        if (usernameError?.inline) setErrors(prev => ({...prev, username: usernameError.message}));
        if (usernameError?.alert) duplicateAlertMessage = usernameError.message;

        const emailError = data.email ? getFieldError('email', data.email) : null;
        if (emailError?.inline) setErrors(prev => ({...prev, email: emailError.message}));
        if (emailError?.alert) duplicateAlertMessage = emailError.message;

        if (data.password) setErrors(prev => ({...prev, password: data.password[0] || data.password}));
        if (data.company) setErrors(prev => ({...prev, company: data.company[0] || data.company}));
        if (duplicateAlertMessage) {
          setAlert({type: 'error', message: duplicateAlertMessage});
        } else if (data.non_field_errors) {
          setAlert({type: 'error', message: Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors});
        } else if (data.detail) {
          setAlert({type: 'error', message: data.detail});
        }
      }
    } catch {
      setAlert({type: 'error', message: t("messages.networkError")});
    } finally {
      if (RECAPTCHA_SITE_KEY) {
        recaptchaRef.current?.reset();
      }
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    const form = document.querySelector('form');
    if (form) {
      form.requestSubmit();
    }
  };

    const handleGoogleSuccess = (data: {
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      first_name?: string;
      last_name?: string;
    };
    profile_complete: boolean;
    message: string;
  }) => {
    // Store token
    localStorage.setItem('authToken', data.token);
    
    setAlert({type: 'success', message: data.message});
    
    // Redirect based on profile completion
    setTimeout(() => {
      if (data.profile_complete) {
        window.location.href = '/';
      } else {
        window.location.href = '/users/complete-profile';
      }
    }, 2000);
  };


  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-[#7CFC00]/10 dark:via-[#46B1C9]/10 dark:to-[#623CEA]/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side: Title + Illustration (hidden on mobile) */}
            <div className="scroll-animate slide-in-left">
              <h1 className="text-5xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#1F8A0D] dark:from-[#7CFC00] via-[#46B1C9] to-[#623CEA] bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-12 leading-relaxed">
                {t("subtitle")}
              </p>
              <div
                className={`relative overflow-hidden rounded-2xl ${
                  showImage ? "block" : "hidden"
                }`}
              >
                <Image
                  src="/static/signup_illustration.webp"
                  alt="Signup Illustration"
                  width={600}
                  height={300}
                  className="w-full h-full object-cover"
                  loading="eager"
                  priority
                />
              </div>
            </div>

            {/* Right side: Signup Card */}
            <div className="scroll-animate slide-in-right">
              <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#1F8A0D] dark:hover:border-[#7CFC00] transition-all duration-300 hover:shadow-xl hover:shadow-[#1F8A0D]/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-[#1F8A0D] dark:text-[#7CFC00] text-center">
                    {t("form.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>

                  {/* Add Google Sign-Up at the top */}
                  <div className="mb-6">
                    <GoogleSignInButton
                      onSuccess={handleGoogleSuccess}
                      className="border-gray-300 dark:border-gray-600 hover:border-[#1F8A0D] dark:hover:border-[#7CFC00]"
                    >
                      {t("form.signupWithGoogle")}
                    </GoogleSignInButton>
                        
                    <div className="relative mt-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                          {t("form.orSignupWithEmail")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name and Surname Fields - Same Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-800 dark:text-gray-200">
                          {t("form.nameLabel")}
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#1F8A0D] dark:focus:border-[#7CFC00]"
                            placeholder={t("form.namePlaceholder")}
                            required
                          />
                        </div>
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="surname" className="text-gray-800 dark:text-gray-200">
                          {t("form.surnameLabel")}
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="surname"
                            type="text"
                            value={surname}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSurname(e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#1F8A0D] dark:focus:border-[#7CFC00]"
                            placeholder={t("form.surnamePlaceholder")}
                            required
                          />
                        </div>
                        {errors.surname && <p className="text-red-500 text-sm">{errors.surname}</p>}
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-800 dark:text-gray-200">
                        {t("form.emailLabel")}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                          className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#1F8A0D] dark:focus:border-[#7CFC00]"
                          placeholder={t("form.emailPlaceholder")}
                          required
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    {/* Company Field */}
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-gray-800 dark:text-gray-200">
                        {t("form.companyLabel")}
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="company"
                          type="text"
                          value={company}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
                          className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#1F8A0D] dark:focus:border-[#7CFC00]"
                          placeholder={t("form.companyPlaceholder")}
                          required
                        />
                      </div>
                      {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
                    </div>

                    {/* Region and City Fields - Same Row (Optional) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="region" className="text-gray-800 dark:text-gray-200">
                          {t("form.regionLabel")}
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="region"
                            type="text"
                            value={region}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegion(e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#1F8A0D] dark:focus:border-[#7CFC00]"
                            placeholder={t("form.regionPlaceholder")}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-gray-800 dark:text-gray-200">
                          {t("form.cityLabel")}
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="city"
                            type="text"
                            value={city}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#1F8A0D] dark:focus:border-[#7CFC00]"
                            placeholder={t("form.cityPlaceholder")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-800 dark:text-gray-200">
                        {t("form.passwordLabel")}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#1F8A0D] dark:focus:border-[#7CFC00]"
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
                      {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-800 dark:text-gray-200">
                        {t("form.confirmPasswordLabel")}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                          className="pl-10 pr-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#1F8A0D] dark:focus:border-[#7CFC00]"
                          placeholder={t("form.confirmPasswordPlaceholder")}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                    </div>

                    {/* Terms and Conditions Acceptance */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="acceptTerms"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="w-4 h-4 mt-1 rounded border-gray-300 text-[#1F8A0D] dark:text-[#7CFC00] focus:ring-[#1F8A0D] focus:ring-offset-0"
                          required
                        />
                        <Label htmlFor="acceptTerms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {t("form.acceptTerms")}
                          <a 
                            href="/legal?tab=terms" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green hover:text-green-600 underline font-medium"
                          >
                            {t("form.termsLink")}
                          </a>
                          {t("form.and")}
                          <a 
                            href="/legal?tab=privacy" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green hover:text-green-600 underline font-medium"
                          >
                            {t("form.privacyLink")}
                          </a>
                        </Label>
                      </div>
                      {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
                    </div>

                    {RECAPTCHA_SITE_KEY && (
                      <ReCAPTCHA
                        sitekey={RECAPTCHA_SITE_KEY}
                        size="invisible"
                        ref={recaptchaRef}
                      />
                    )}

                    <div className="flex justify-center">
                      <StyledButton
                        text={isLoading ? "Creating Account..." : t("form.submitButton")}
                        onClick={handleButtonClick}
                      />
                    </div>
                  </form>

                  <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t("form.loginPrompt")}
                    <Link href="/auth/signin" className="text-[#46B1C9] hover:underline">
                      {t("form.loginLink")}
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
