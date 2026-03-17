"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Slider from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { User, Mail, Building2, MapPin, Globe, AlertTriangle, Lock } from "lucide-react";
import { useParams } from "next/navigation";

interface ProfileInfoTabProps {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  company: string;
  region: string;
  city: string;
  isGoogleAuthenticated: boolean;
  errors: Record<string, string>;
  hasChanges: boolean;
  isSaving: boolean;
  isUpdatingNotifications: boolean;
  courseEmailNotifications: boolean;
  newsletterConsent: boolean;
  allOptionalNotificationsEnabled: boolean;
  onFieldChange: (field: string, value: string | boolean) => void;
  onToggleAllNotifications: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDeleteAccount: () => void;
}

const ProfileInfoTab: React.FC<ProfileInfoTabProps> = ({
  firstName,
  lastName,
  username,
  email,
  company,
  region,
  city,
  isGoogleAuthenticated,
  errors,
  hasChanges,
  isSaving,
  isUpdatingNotifications,
  courseEmailNotifications,
  newsletterConsent,
  allOptionalNotificationsEnabled,
  onFieldChange,
  onToggleAllNotifications,
  onSave,
  onCancel,
  onDeleteAccount,
}) => {
  const t = useTranslations("profile");
  const { locale } = useParams();

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Personal Information */}
      <div className="lg:col-span-2">
        <Card className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)] dark:backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center">
              <User className="h-6 w-6 mr-2 text-[#46B1C9]" />
              <span className="text-[#46B1C9]">
                {t("personalInfo")}
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("authProvider.label")}:
              </span>
              <Badge
                variant={isGoogleAuthenticated ? "secondary" : "outline"}
                className={isGoogleAuthenticated
                  ? "border-transparent bg-[#DBEAFE] text-[#1D4ED8] dark:bg-[#1E3A8A]/40 dark:text-[#93C5FD]"
                  : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"}
              >
                {isGoogleAuthenticated ? t("authProvider.google") : t("authProvider.credentials")}
              </Badge>
            </div>
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("firstName", e.target.value)}
                      className="pl-10 bg-gray-50/80 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:border-[#0255D5] dark:focus:border-[#7DB5FF]"
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("lastName", e.target.value)}
                      className="pl-10 bg-gray-50/80 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:border-[#0255D5] dark:focus:border-[#7DB5FF]"
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("username", e.target.value)}
                    className="pl-10 bg-gray-50/80 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:border-[#0255D5] dark:focus:border-[#7DB5FF]"
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("email", e.target.value)}
                    className="pl-10 bg-gray-50/80 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:border-[#0255D5] dark:focus:border-[#7DB5FF]"
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("company", e.target.value)}
                    className="pl-10 bg-gray-50/80 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:border-[#0255D5] dark:focus:border-[#7DB5FF]"
                    placeholder={t("form.companyPlaceholder")}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("region", e.target.value)}
                      className="pl-10 bg-gray-50/80 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:border-[#0255D5] dark:focus:border-[#7DB5FF]"
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("city", e.target.value)}
                      className="pl-10 bg-gray-50/80 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:border-[#0255D5] dark:focus:border-[#7DB5FF]"
                      placeholder={t("form.cityPlaceholder")}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {hasChanges && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={onSave}
                    disabled={isSaving}
                    className="flex-1 bg-[#0144AA] dark:bg-[#7DB5FF] text-white dark:text-black shadow-[0_15px_40px_rgba(2,85,213,0.35)] hover:shadow-[0_20px_50px_rgba(2,85,213,0.4)] hover:bg-[#01388A] font-semibold"
                  >
                    {isSaving ? t("form.saveChangesLoading") : t("form.saveChanges")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCancel}
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

      {/* Notification Toggle Below Danger Zone */}
      <div className="space-y-6">
        <Card className="rounded-3xl border-[1.5px] border-[#623CEA]/30 dark:border-[#623CEA]/25 bg-white dark:bg-white/5 shadow-sm dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)] dark:backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#623CEA] dark:text-[#623CEA] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" style={{ color: "#623CEA" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {t("form.allowNotificationsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                  type="button"
                  variant="outline"
                  onClick={onToggleAllNotifications}
                  disabled={isUpdatingNotifications}
                  className="border-[#623CEA]/30 text-[#623CEA] hover:bg-[#623CEA]/10"
                >
                  {allOptionalNotificationsEnabled ? t("form.disableAllOptionalNotifications") : t("form.enableAllOptionalNotifications")}
              </Button>

              <div className="grid gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
                {[
                  {
                    key: "course_email_notifications",
                    checked: courseEmailNotifications,
                    label: t("form.courseEmailNotifications"),
                    description: t("form.courseEmailNotificationsDesc"),
                  },
                  {
                    key: "allow_notifications",
                    checked: newsletterConsent,
                    label: t("form.newsletterConsent"),
                    description: t("form.newsletterConsentDesc"),
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    <Slider
                      checked={item.checked}
                      onChange={() => onFieldChange(item.key, !item.checked)}
                      disabled={isUpdatingNotifications}
                      color="purple"
                      className="[&_.slider-track]:bg-[#623cea33] [&_.slider-thumb]:bg-[#623CEA] [&_.slider-thumb]:border-[#623CEA] [&_.slider-track]:border-[#623CEA] [&_.slider-track]:shadow [&_.slider-thumb]:shadow-lg [&_.slider-thumb]:shadow-[#623CEA40]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Danger Zone */}
        <div className="pt-6 lg:pt-0 space-y-6 lg:row-span-1">
         {!isGoogleAuthenticated && (
          <Card className="rounded-3xl border-[1.5px] border-[#46B1C9]/40 dark:border-[#46B1C9]/30 bg-white dark:bg-white/5 shadow-sm dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)] dark:backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#46B1C9] flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                {t("security.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("security.description")}
                </p>
                <Button
                  variant="outline"
                  className="w-full border-[#46B1C9] text-[#46B1C9] hover:bg-[#46B1C9]/10"
                  onClick={() => {
                    window.location.href = `/${locale}/reset-password?email=${encodeURIComponent(email)}`;
                  }}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {t("security.changePassword")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-3xl border border-red-200 dark:border-red-800/40 bg-white dark:bg-white/5 shadow-sm dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)] dark:backdrop-blur-md">
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
                onClick={onDeleteAccount}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {t("deleteAccount.button")}
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
    </div>
  );
};

export default ProfileInfoTab;
