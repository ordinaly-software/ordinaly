"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/ui/navbar";
import Alert from "@/components/ui/alert";
import DeleteAccountModal from "@/components/ui/delete-account-modal";
import { User, Mail, Building2, MapPin, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  // Also support backend field names
  name?: string;
  surname?: string;
  company: string;
  region: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const [isDark, setIsDark] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  // Form states
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes to form fields
  const handleFieldChange = (field: string, value: string) => {
    // Set the field value
    switch (field) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'username':
        setUsername(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'company':
        setCompany(value);
        break;
      case 'region':
        setRegion(value);
        break;
      case 'city':
        setCity(value);
        break;
    }
    
    // Mark that there are changes
    setHasChanges(true);
  };

  // Check if current form values match the original profile data
  useEffect(() => {
    if (!profile) return;
    
    const originalFirstName = profile.first_name || profile.name || '';
    const originalLastName = profile.last_name || profile.surname || '';
    const originalUsername = profile.username || '';
    const originalEmail = profile.email || '';
    const originalCompany = profile.company || '';
    const originalRegion = profile.region || '';
    const originalCity = profile.city || '';
    
    const hasAnyChanges = 
      firstName !== originalFirstName ||
      lastName !== originalLastName ||
      username !== originalUsername ||
      email !== originalEmail ||
      company !== originalCompany ||
      region !== originalRegion ||
      city !== originalCity;
    
    setHasChanges(hasAnyChanges);
  }, [profile, firstName, lastName, username, email, company, region, city]);

    const fetchProfile = useCallback(async (token?: string) => {
    const authTokenToUse = token || authToken;
    if (!authTokenToUse) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/users/profile/`, {
        headers: {
          'Authorization': `Token ${authTokenToUse}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        
        // Set form values - handle both frontend and backend field names
        setFirstName(data.first_name || data.name || "");
        setLastName(data.last_name || data.surname || "");
        setUsername(data.username || "");
        setEmail(data.email || "");
        setCompany(data.company || "");
        setRegion(data.region || "");
        setCity(data.city || "");
      } else if (response.status === 401) {
        // Token is invalid
        window.location.href = "/users/signin";
      } else {
        setAlert({ type: 'error', message: t("messages.networkError") });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setAlert({ type: 'error', message: t("messages.networkError") });
    } finally {
      setIsLoading(false);
    }
  }, [authToken, t]);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
    setIsAuthenticated(!!token);

    // Redirect if not authenticated
    if (!token) {
      window.location.href = "/users/signin";
      return;
    }

    // Fetch profile data
    fetchProfile(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!firstName.trim()) newErrors.firstName = t("messages.validation.firstNameRequired");
    if (!lastName.trim()) newErrors.lastName = t("messages.validation.lastNameRequired");
    if (!username.trim()) newErrors.username = t("messages.validation.usernameRequired");
    if (!email.trim()) newErrors.email = t("messages.validation.emailRequired");
    if (!email.includes("@")) newErrors.email = t("messages.validation.emailInvalid");
    if (!company.trim()) newErrors.company = t("messages.validation.companyRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setErrors({});
    setAlert(null);

    try {
      const updateData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        company: company.trim(),
        region: region.trim() || null,
        city: city.trim() || null,
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/users/update_profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        
        // Update form fields with returned data
        setFirstName(data.first_name || data.name || "");
        setLastName(data.last_name || data.surname || "");
        setUsername(data.username || "");
        setEmail(data.email || "");
        setCompany(data.company || "");
        setRegion(data.region || "");
        setCity(data.city || "");
        
        setAlert({ type: 'success', message: t("messages.updateSuccess") });
        setHasChanges(false);
      } else {
        const data = await response.json();
        
        // Handle validation errors from Django
        if (data.username) {
          setErrors(prev => ({...prev, username: Array.isArray(data.username) ? data.username[0] : data.username}));
        }
        if (data.email) {
          setErrors(prev => ({...prev, email: Array.isArray(data.email) ? data.email[0] : data.email}));
        }
        if (data.first_name || data.name) {
          const nameError = data.first_name || data.name;
          setErrors(prev => ({...prev, firstName: Array.isArray(nameError) ? nameError[0] : nameError}));
        }
        if (data.last_name || data.surname) {
          const surnameError = data.last_name || data.surname;
          setErrors(prev => ({...prev, lastName: Array.isArray(surnameError) ? surnameError[0] : surnameError}));
        }
        if (data.company) {
          setErrors(prev => ({...prev, company: Array.isArray(data.company) ? data.company[0] : data.company}));
        }
        if (data.non_field_errors) {
          setAlert({ type: 'error', message: Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors });
        }
        if (data.detail) {
          setAlert({ type: 'error', message: data.detail });
        }
        
        // If no specific errors, show generic error
        if (!data.username && !data.email && !data.first_name && !data.name && !data.last_name && !data.surname && !data.company && !data.non_field_errors && !data.detail) {
          setAlert({ type: 'error', message: t("messages.updateError") });
        }
        
        if (response.status === 401) {
          // Token expired, redirect to sign in
          setTimeout(() => {
            window.location.href = "/users/signin";
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlert({ type: 'error', message: t("messages.networkError") });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    if (profile) {
      setFirstName(profile.first_name || profile.name || "");
      setLastName(profile.last_name || profile.surname || "");
      setUsername(profile.username || "");
      setEmail(profile.email || "");
      setCompany(profile.company || "");
      setRegion(profile.region || "");
      setCity(profile.city || "");
      setErrors({});
      setAlert(null);
      setHasChanges(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/users/delete_profile/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok || response.status === 204) {
        setAlert({ type: 'success', message: t("messages.deleteSuccess") });
        
        // Call signout API and then redirect after 2 seconds
        setTimeout(async () => {
          try {
            // Call signout API if needed (optional since we're deleting the account)
            if (authToken) {
              await fetch(`${apiUrl}/api/users/signout/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Token ${authToken}`,
                  'Content-Type': 'application/json',
                },
              }).catch(() => {
                // Ignore errors, account is being deleted anyway
              });
            }
          } catch {
            // Ignore errors, account is being deleted anyway
          }

          // Remove token and redirect to home
          localStorage.removeItem('authToken');
          window.location.href = '/';
        }, 2000);
      } else {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          setAlert({ type: 'error', message: t("messages.unauthorizedError") });
        } else {
          setAlert({ type: 'error', message: data.detail || t("messages.deleteError") });
        }
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setAlert({ type: 'error', message: t("messages.networkError") });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
        <Navbar isDark={isDark} setIsDark={setIsDark} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29BF12] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t("loading")}</p>
          </div>
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

      {/* Profile Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#29BF12] via-[#46B1C9] to-[#623CEA] bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Personal Information */}
            <div className="lg:col-span-2">
              <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-[#29BF12] flex items-center">
                    <User className="h-6 w-6 mr-2" />
                    {t("personalInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    {/* First Name and Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-gray-800 dark:text-gray-200">
                          {t("form.firstName")}
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('firstName', e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#29BF12] dark:focus:border-[#29BF12]"
                            placeholder={t("form.firstNamePlaceholder")}
                            required
                          />
                        </div>
                        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-800 dark:text-gray-200">
                          {t("form.lastName")}
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('lastName', e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#29BF12] dark:focus:border-[#29BF12]"
                            placeholder={t("form.lastNamePlaceholder")}
                            required
                          />
                        </div>
                        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                      </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-800 dark:text-gray-200">
                        {t("form.username")}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('username', e.target.value)}
                          className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#29BF12] dark:focus:border-[#29BF12]"
                          placeholder={t("form.usernamePlaceholder")}
                          required
                        />
                      </div>
                      {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-800 dark:text-gray-200">
                        {t("form.email")}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('email', e.target.value)}
                          className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#29BF12] dark:focus:border-[#29BF12]"
                          placeholder={t("form.emailPlaceholder")}
                          required
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    {/* Company */}
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-gray-800 dark:text-gray-200">
                        {t("form.company")}
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="company"
                          type="text"
                          value={company}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('company', e.target.value)}
                          className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#29BF12] dark:focus:border-[#29BF12]"
                          placeholder={t("form.companyPlaceholder")}
                          required
                        />
                      </div>
                      {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
                    </div>

                    {/* Region and City */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="region" className="text-gray-800 dark:text-gray-200">
                          {t("form.region")}
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="region"
                            type="text"
                            value={region}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('region', e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#29BF12] dark:focus:border-[#29BF12]"
                            placeholder={t("form.regionPlaceholder")}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-gray-800 dark:text-gray-200">
                          {t("form.city")}
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="city"
                            type="text"
                            value={city}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('city', e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#29BF12] dark:focus:border-[#29BF12]"
                            placeholder={t("form.cityPlaceholder")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {hasChanges && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={handleSaveChanges}
                          disabled={isSaving}
                          className="flex-1 bg-[#29BF12] hover:bg-[#22A010] text-white"
                        >
                          {isSaving ? t("form.saveChangesLoading") : t("form.saveChanges")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelChanges}
                          disabled={isSaving}
                          className="flex-1"
                        >
                          {t("form.cancel")}
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Account Settings and Danger Zone */}
            <div className="space-y-6">
              {/* Account Settings */}
              <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {t("accountSettings")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <strong className="text-gray-800 dark:text-gray-200">Account Created:</strong>
                      <br />
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                    </div>
                    <div>
                      <strong className="text-gray-800 dark:text-gray-200">Last Updated:</strong>
                      <br />
                      {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-white dark:bg-gray-800/50 border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {t("dangerZone")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("deleteAccount.description")}
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      {t("deleteAccount.button")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
        username={profile?.username || username || ""}
      />
    </div>
  );
}
