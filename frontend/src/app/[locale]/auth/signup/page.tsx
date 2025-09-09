"use client";

import { useState, useEffect } from "react";
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
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import Link from "next/link";

export default function SignupPage() {
  const t = useTranslations("signup");
  const { completeGoogleProfile } = useGoogleAuth();
  const [isDark, setIsDark] = useState(false);
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
  const [googleData, setGoogleData] = useState<{
    google_id: string;
    email: string;
    first_name: string;
    last_name: string;
    picture?: string;
  } | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [showGoogleProfileForm, setShowGoogleProfileForm] = useState(false);

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
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
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
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setAlert(null);

    try {
      // Generate username from email prefix
      const username = email.split('@')[0];
      
      const signupData = {
        name: name.trim(),
        surname: surname.trim(),
        username: username.trim(),
        email: email.trim(),
        company: company.trim(),
        region: region.trim() || null,
        city: city.trim() || null,
        password: password,
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ordinaly.duckdns.org';
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
        if (data.username) setErrors(prev => ({...prev, username: data.username[0] || data.username}));
        if (data.email) setErrors(prev => ({...prev, email: data.email[0] || data.email}));
        if (data.password) setErrors(prev => ({...prev, password: data.password[0] || data.password}));
        if (data.company) setErrors(prev => ({...prev, company: data.company[0] || data.company}));
        if (data.non_field_errors) setAlert({type: 'error', message: data.non_field_errors[0]});
        if (data.detail) setAlert({type: 'error', message: data.detail});
      }
    } catch {
      setAlert({type: 'error', message: t("messages.networkError")});
    } finally {
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
    
    // Redirect to home
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  const handleGoogleProfileCompletion = (data: {
    requires_completion: boolean;
    google_data: {
      google_id: string;
      email: string;
      first_name: string;
      last_name: string;
      picture?: string;
    };
    google_token: string;
  }) => {
    // Store Google data for profile completion
    setGoogleData(data.google_data);
    setGoogleToken(data.google_token);
    setShowGoogleProfileForm(true);
    
    setAlert({
      type: 'info', 
      message: `Welcome ${data.google_data.first_name}! Please complete your profile to continue.`
    });
  };

  const handleGoogleError = (error: string) => {
    setAlert({type: 'error', message: error});
  };

  const handleCompleteGoogleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!googleToken || !googleData) {
      setAlert({type: 'error', message: 'Missing Google authentication data'});
      return;
    }

    // Validate required fields
    if (!company.trim()) {
      setErrors({company: t("messages.validation.companyRequired")});
      return;
    }

    // Generate username from Google email if not provided
    const username = googleData.email.split('@')[0];

    setIsLoading(true);
    setErrors({});
    setAlert(null);

    try {
      const result = await completeGoogleProfile(googleToken, {
        username: username,
        company: company.trim(),
        region: region.trim() || undefined,
        city: city.trim() || undefined,
      });

      // Store token
      localStorage.setItem('authToken', result.token);
      
      setAlert({type: 'success', message: result.message});
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      console.error('Google profile completion error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete profile';
      setAlert({type: 'error', message: errorMessage});
    } finally {
      setIsLoading(false);
    }
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-[#22A60D]/10 dark:via-[#46B1C9]/10 dark:to-[#623CEA]/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side: Title + Illustration (hidden on mobile) */}
            <div className="scroll-animate slide-in-left">
              <h1 className="text-5xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#22A60D] via-[#46B1C9] to-[#623CEA] bg-clip-text text-transparent">
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
                />
              </div>
            </div>

            {/* Right side: Signup Card */}
            <div className="scroll-animate slide-in-right">
              <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#22A60D] transition-all duration-300 hover:shadow-xl hover:shadow-[#22A60D]/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-[#22A60D] text-center">
                    {t("form.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>

                  {/* Google Profile Completion Form */}
                  {showGoogleProfileForm && googleData ? (
                    <div>
                      <div className="mb-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Welcome, {googleData.first_name}!
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Please complete your profile to finish signing up
                        </p>
                      </div>

                      <form onSubmit={handleCompleteGoogleProfile} className="space-y-6">
                        {/* Display user info from Google */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <strong>Email:</strong> {googleData.email}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Name:</strong> {googleData.first_name} {googleData.last_name}
                          </p>
                        </div>

                        {/* Company Field (Required) */}
                        <div className="space-y-2">
                          <Label htmlFor="google-company" className="text-gray-800 dark:text-gray-200">
                            {t("form.companyLabel")} <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="google-company"
                              type="text"
                              value={company}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
                              className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#29BF12] dark:focus:border-[#29BF12]"
                              placeholder={t("form.companyPlaceholder")}
                              required
                            />
                          </div>
                          {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
                        </div>

                        {/* Region and City Fields (Optional) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="google-region" className="text-gray-800 dark:text-gray-200">
                              {t("form.regionLabel")} <span className="text-gray-400 text-sm">(optional)</span>
                            </Label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                id="google-region"
                                type="text"
                                value={region}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegion(e.target.value)}
                                className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#29BF12] dark:focus:border-[#29BF12]"
                                placeholder={t("form.regionPlaceholder")}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="google-city" className="text-gray-800 dark:text-gray-200">
                              {t("form.cityLabel")} <span className="text-gray-400 text-sm">(optional)</span>
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                id="google-city"
                                type="text"
                                value={city}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                                className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#29BF12] dark:focus:border-[#29BF12]"
                                placeholder={t("form.cityPlaceholder")}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <StyledButton
                            text={isLoading ? "Completing Profile..." : "Complete Profile"}
                            onClick={() => {
                              const form = document.querySelector('form');
                              if (form) {
                                form.requestSubmit();
                              }
                            }}
                          />
                        </div>
                      </form>

                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setShowGoogleProfileForm(false);
                            setGoogleData(null);
                            setGoogleToken(null);
                            setCompany("");
                            setRegion("");
                            setCity("");
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Cancel and use email signup instead
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                  {/* Regular signup form */}

                  {/* Add Google Sign-Up at the top */}
                  <div className="mb-6">
                    <GoogleSignInButton
                      onSuccess={handleGoogleSuccess}
                      onProfileCompletion={handleGoogleProfileCompletion}
                      onError={handleGoogleError}
                      className="border-gray-300 dark:border-gray-600 hover:border-[#29BF12] dark:hover:border-[#29BF12]"
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
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#22A60D] dark:focus:border-[#22A60D]"
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
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#22A60D] dark:focus:border-[#22A60D]"
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
                          className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#22A60D] dark:focus:border-[#22A60D]"
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
                          className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#22A60D] dark:focus:border-[#22A60D]"
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
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#22A60D] dark:focus:border-[#22A60D]"
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
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#22A60D] dark:focus:border-[#22A60D]"
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
                          className="pl-10 pr-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#22A60D] dark:focus:border-[#22A60D]"
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
                          className="pl-10 pr-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#22A60D] dark:focus:border-[#22A60D]"
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
                          className="w-4 h-4 mt-1 rounded border-gray-300 text-[#22A60D] focus:ring-[#22A60D] focus:ring-offset-0"
                          required
                        />
                        <Label htmlFor="acceptTerms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {t("form.acceptTerms")}{" "}
                          <a 
                            href="/legal?tab=terms" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green hover:text-green-600 underline font-medium"
                          >
                            {t("form.termsLink")}
                          </a>
                          {" "}{t("form.and")}{" "}
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

                    <div className="flex justify-center">
                      <StyledButton
                      text={isLoading ? "Creating Account..." : t("form.submitButton")}
                      onClick={handleButtonClick}
                      />
                    </div>
                  </form>

                  <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t("form.loginPrompt")}{" "}
                    <Link href="/auth/signin" className="text-[#46B1C9] hover:underline">
                      {t("form.loginLink")}
                    </Link>
                  </p>
                  </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}