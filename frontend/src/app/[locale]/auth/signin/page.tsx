"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import Alert from "@/components/ui/alert";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import StyledButton from "@/components/ui/styled-button";
import GoogleSignInButton from '@/components/auth/google-signin-button';
import Link from "next/link";

export default function LoginPage() {
  const t = useTranslations("signin");
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Redirect to home if already authenticated
      window.location.href = '/';
      return;
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      setAlert({type: 'error', message: t('messages.fillAllFields')});
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ordinaly.duckdns.org';
      const response = await fetch(`${apiUrl}/api/users/signin/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        localStorage.setItem('authToken', data.token);
        
        setAlert({type: 'success', message: t('messages.success')});
        
        // Redirect to home after 1 second
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setAlert({type: 'error', message: t('messages.invalidCredentials')});
      }
    } catch {
      setAlert({type: 'error', message: t('messages.networkError')});
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
    
    // Redirect based on profile completion
    setTimeout(() => {
      if (data.profile_complete) {
        window.location.href = '/';
      } else {
        window.location.href = '/users/complete-profile';
      }
    }, 1000);
  };


  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      {/* Alert Component */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={alert.type === 'success' ? 2000 : 5000}
        />
      )}
      
      {/* Navigation */}
      <Navbar />

      {/* Login Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-[#22A60D]/10 dark:via-[#46B1C9]/10 dark:to-[#623CEA]/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left side: Title + Illustration (hidden on mobile) */}
            <div className="scroll-animate slide-in-left">
              <h1 className="text-5xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#22A60D] via-[#46B1C9] to-[#623CEA] bg-clip-text text-transparent leading-tight pb-2">
                {t("title")}
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-12 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>

            {/* Right side: Login Card */}
            <div className="scroll-animate slide-in-right">
              <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#22A60D] transition-all duration-300 hover:shadow-xl hover:shadow-[#22A60D]/10">
              <br></br>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-800 dark:text-gray-200">
                        {t("form.emailLabel")}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#22A60D] dark:focus:border-[#22A60D]"
                          placeholder={t("form.emailPlaceholder")}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-800 dark:text-gray-200">
                        {t("form.passwordLabel")}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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
                    </div>
                    <div className="flex items-center justify-between">
                      <Link href="/forgot-password" className="text-sm text-[#46B1C9] hover:underline">
                        {t("form.forgotPassword")}
                      </Link>
                    </div>

                    {/* Centered and smaller sign-in button */}
                    <div className="flex justify-center">
                      <StyledButton
                        text={isLoading ? t("form.submitButtonLoading") : t("form.submitButton")}
                        onClick={handleButtonClick}
                      />
                    </div>
                  </form>

                  <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t("form.signupPrompt")}{" "}
                    <Link href="/auth/signup" className="text-[#46B1C9] hover:underline">
                      {t("form.signupLink")}
                    </Link>
                  </p>

                   {/* Add Google Sign-In */}
                   <div className="mt-6">
                     <div className="relative">
                       <div className="absolute inset-0 flex items-center">
                         <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                       </div>
                       <div className="relative flex justify-center text-sm">
                         <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                           {t("form.orContinueWith")}
                         </span>
                       </div>
                     </div>
                                   
                     <div className="mt-6">
                       <GoogleSignInButton
                         onSuccess={handleGoogleSuccess}
                         className="border-gray-300 dark:border-gray-600 hover:border-[#22A60D] dark:hover:border-[#22A60D]"
                       >
                         {t("form.continueWithGoogle")}
                       </GoogleSignInButton>
                     </div>
                   </div>

                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}