"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Slider from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { User, Mail, Building2, MapPin, Globe, AlertTriangle, Lock, Bell } from "lucide-react";
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

const cardShell =
  "rounded-[2rem] border border-[--color-border-subtle] bg-white/75 shadow-[0_20px_80px_-55px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/[0.04]";

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
    <div className="flex flex-col gap-6">
      {/* Personal Information */}
      <Card className={cardShell}>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tracking-[-0.03em] text-cobalt dark:text-[#7DB5FF]">
            <User className="h-6 w-6" strokeWidth={1.8} />
            {t("personalInfo")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-medium dark:text-cloud-medium">
              {t("authProvider.label")}:
            </span>
            <Badge
              variant={isGoogleAuthenticated ? "secondary" : "outline"}
              className={isGoogleAuthenticated
                ? "border-transparent bg-cobalt/12 text-[--swatch--cobalt-dark] dark:bg-[#7DB5FF]/20 dark:text-[#7DB5FF]"
                : "border-[--color-border-subtle] text-slate-medium dark:border-white/10 dark:text-cloud-medium"}
            >
              {isGoogleAuthenticated ? t("authProvider.google") : t("authProvider.credentials")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("form.firstName")}</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("firstName", e.target.value)}
                    className="pl-10"
                    placeholder={t("form.firstNamePlaceholder")}
                    required
                  />
                </div>
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">{t("form.lastName")}</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("lastName", e.target.value)}
                    className="pl-10"
                    placeholder={t("form.lastNamePlaceholder")}
                    required
                  />
                </div>
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">{t("form.username")}</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("username", e.target.value)}
                  className="pl-10"
                  placeholder={t("form.usernamePlaceholder")}
                  required
                />
              </div>
              {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("form.email")}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("email", e.target.value)}
                  className="pl-10"
                  placeholder={t("form.emailPlaceholder")}
                  required
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">{t("form.company")}</Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                <Input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("company", e.target.value)}
                  className="pl-10"
                  placeholder={t("form.companyPlaceholder")}
                />
              </div>
              {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
            </div>

            {/* Region and City */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="region">{t("form.region")}</Label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                  <Input
                    id="region"
                    type="text"
                    value={region}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("region", e.target.value)}
                    className="pl-10"
                    placeholder={t("form.regionPlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t("form.city")}</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cloud-medium" />
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange("city", e.target.value)}
                    className="pl-10"
                    placeholder={t("form.cityPlaceholder")}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {hasChanges && (
              <div className="flex flex-col gap-3 border-t border-[--color-border-subtle] pt-5 dark:border-white/10 sm:flex-row">
                <Button
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex-1 bg-[--swatch--cobalt-dark] text-white shadow-[0_15px_40px_-15px_rgba(2,85,213,0.55)] hover:bg-[#01388A] active:scale-[0.98] dark:bg-[#7DB5FF] dark:text-black dark:hover:bg-[#60A5FA]"
                >
                  {isSaving ? t("form.saveChangesLoading") : t("form.saveChanges")}
                </Button>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSaving}
                  className="flex-1 active:scale-[0.98]"
                >
                  {t("form.cancel")}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Notifications + Security + Danger Zone row */}
      <div className={`grid items-start gap-6 ${isGoogleAuthenticated ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        <Card className={`self-start ${cardShell} border-heather/50 dark:border-heather/25`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-[-0.02em] text-[#623CEA]">
              <Bell className="h-5 w-5" strokeWidth={1.8} />
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
                className="border-[#623CEA]/30 text-[#623CEA] hover:bg-[#623CEA]/10 active:scale-[0.98]"
              >
                {allOptionalNotificationsEnabled ? t("form.disableAllOptionalNotifications") : t("form.enableAllOptionalNotifications")}
              </Button>

              <div className="grid gap-3 border-t border-[--color-border-subtle] pt-4 dark:border-white/10">
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
                      <p className="text-sm font-semibold text-slate-dark dark:text-ivory-light">
                        {item.label}
                      </p>
                      <p className="text-sm text-slate-medium dark:text-cloud-medium">
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

        {/* Security */}
        {!isGoogleAuthenticated && (
          <Card className={`self-start ${cardShell} border-cobalt/25 dark:border-[#7DB5FF]/25`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-[-0.02em] text-cobalt dark:text-[#7DB5FF]">
                <Lock className="h-5 w-5" strokeWidth={1.8} />
                {t("security.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-medium dark:text-cloud-medium">
                  {t("security.description")}
                </p>
                <Button
                  variant="outline"
                  className="w-full border-cobalt text-cobalt hover:bg-cobalt/10 active:scale-[0.98] dark:border-[#7DB5FF] dark:text-[#7DB5FF] dark:hover:bg-[#7DB5FF]/10"
                  onClick={() => {
                    window.location.href = `/${locale}/reset-password?email=${encodeURIComponent(email)}`;
                  }}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {t("security.changePassword")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className={`self-start ${cardShell} border-red-300/50 dark:border-red-800/40`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-[-0.02em] text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.8} />
              {t("dangerZone")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-medium dark:text-cloud-medium">
                {t("deleteAccount.description")}
              </p>
              <Button
                variant="destructive"
                onClick={onDeleteAccount}
                className="w-full active:scale-[0.98]"
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
