"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/ui/navbar";
import Alert from "@/components/ui/alert";
import { Building2, MapPin, Globe } from "lucide-react";
import StyledButton from "@/components/ui/styled-button";

export default function CompleteProfilePage() {
  const t = useTranslations("completeProfile");
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    company?: string;
    region?: string;
    city?: string;
  } | null>(null);
  const [company, setCompany] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
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

  const fetchUserData = useCallback(async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/users/profile/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        
        // Pre-fill form if user has existing data
        setCompany(data.company || "");
        setRegion(data.region || "");
        setCity(data.city || "");
      } else {
        setAlert({ type: 'error', message: t("messages.errorGeneric") });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setAlert({ type: 'error', message: t("messages.networkError") });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
    setIsAuthenticated(!!token);

    // Fetch user data if authenticated
    if (token) {
      fetchUserData(token);
    } else {
      // Redirect to signin if not authenticated
      router.push("/users/signin");
    }
  }, [router, fetchUserData]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!company.trim()) newErrors.company = t("validation.companyRequired");

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
      const profileData = {
        company: company.trim(),
        region: region.trim() || null,
        city: city.trim() || null,
      };

      // Send to your backend API to complete the profile
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/users/complete-profile/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({type: 'success', message: t("messages.success")});
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        if (data.company) setErrors((prev: {[key: string]: string}) => ({...prev, company: data.company[0] || data.company}));
        if (data.non_field_errors) setAlert({type: 'error', message: data.non_field_errors[0]});
        if (data.detail) setAlert({type: 'error', message: data.detail});
      }
    } catch (err) {
      console.error('Submit error:', err);
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

  if (!isAuthenticated || !userData) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29BF12] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

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
      
      {/* Navigation */}
      <Navbar isDark={isDark} setIsDark={setIsDark} />

      {/* Complete Profile Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-[#29BF12]/10 dark:via-[#46B1C9]/10 dark:to-[#623CEA]/10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#29BF12] via-[#46B1C9] to-[#623CEA] bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
              {t("subtitle")}
            </p>
            {userData && (
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                {t("welcome", { 
                  name: userData.first_name 
                    ? `${userData.first_name} ${userData.last_name || ''}`.trim()
                    : userData.username || userData.email || "User" 
                })}
              </p>
            )}
          </div>

          <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#29BF12] transition-all duration-300 hover:shadow-xl hover:shadow-[#29BF12]/10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#29BF12] text-center">
                {t("form.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Field */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-800 dark:text-gray-200">
                    {t("form.companyLabel")} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="company"
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

                {/* Region and City Fields - Same Row (Optional) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-gray-800 dark:text-gray-200">
                      {t("form.regionLabel")} <span className="text-gray-400 text-sm">({t("form.optional")})</span>
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="region"
                        type="text"
                        value={region}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegion(e.target.value)}
                        className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#29BF12] dark:focus:border-[#29BF12]"
                        placeholder={t("form.regionPlaceholder")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-800 dark:text-gray-200">
                      {t("form.cityLabel")} <span className="text-gray-400 text-sm">({t("form.optional")})</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="city"
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
                    text={isLoading ? t("form.submitButtonLoading") : t("form.submitButton")}
                    onClick={handleButtonClick}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}