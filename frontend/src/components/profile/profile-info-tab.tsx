"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Slider from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Building2,
  MapPin,
  Globe,
  AlertTriangle,
  Lock,
  Bell,
  Link2,
  Check,
  type LucideIcon,
} from "lucide-react";

interface ProfileInfoTabProps {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  company: string;
  region: string;
  city: string;
  isGoogleAuthenticated: boolean;
  hasUsablePassword: boolean;
  isUpdatingGoogle: boolean;
  isSendingPasswordLink: boolean;
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
  onSendPasswordLink: () => void;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
}

const cardShell =
  "rounded-3xl border border-[--color-border-subtle] bg-white/75 shadow-[0_20px_80px_-55px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/[0.04]";

// One tint per card: the icon chip carries the colour, the title stays neutral.
const chipTones = {
  clay: "bg-[var(--swatch--clay)]/15 text-[var(--swatch--clay)]",
  cobalt: "bg-cobalt/15 text-cobalt dark:bg-cobalt-light/20 dark:text-cobalt-light",
  danger: "bg-red-500/12 text-red-600 dark:bg-red-400/20 dark:text-red-400",
} as const;

const ghostActionClass = "active:scale-[0.98]";

interface CardHeadingProps {
  icon: LucideIcon;
  tone: keyof typeof chipTones;
  children: React.ReactNode;
}

const CardHeading = ({ icon: Icon, tone, children }: CardHeadingProps) => (
  <CardHeader className="px-6 pb-3 pt-5">
    <CardTitle className="flex items-center gap-3 text-base font-semibold tracking-[-0.01em] text-slate-dark dark:text-ivory-light">
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", chipTones[tone])}>
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      {children}
    </CardTitle>
  </CardHeader>
);

// Cards in the bottom grid stretch to the same height; their actions sit on the bottom edge.
const cardBodyClass = "flex flex-1 flex-col gap-3 px-6 pb-5 pt-0";
const mutedText = "text-sm leading-snug text-slate-medium dark:text-cloud-medium";

interface FieldProps {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

const Field = ({ id, label, icon: Icon, value, onChange, placeholder, type = "text", required, error, className }: FieldProps) => (
  <div className={cn("space-y-1", className)}>
    <Label htmlFor={id} className="text-xs font-medium text-slate-medium dark:text-cloud-medium">
      {label}
    </Label>
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-light dark:text-cloud-medium" />
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="h-9 pl-9 text-sm"
        placeholder={placeholder}
        required={required}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const ProfileInfoTab: React.FC<ProfileInfoTabProps> = ({
  firstName,
  lastName,
  username,
  email,
  company,
  region,
  city,
  isGoogleAuthenticated,
  hasUsablePassword,
  isUpdatingGoogle,
  isSendingPasswordLink,
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
  onSendPasswordLink,
  onConnectGoogle,
  onDisconnectGoogle,
}) => {
  const t = useTranslations("profile");

  const notificationToggles = [
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
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Personal information: one dense grid instead of a tall column of rows */}
      <Card className={cardShell}>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 px-6 pb-3 pt-5">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-[-0.02em] text-slate-dark dark:text-ivory-light">
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", chipTones.cobalt)}>
              <User className="h-4 w-4" strokeWidth={1.9} />
            </span>
            {t("personalInfo")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-medium dark:text-cloud-medium">
              {t("authProvider.label")}:
            </span>
            <Badge
              variant={isGoogleAuthenticated ? "secondary" : "outline"}
              className={isGoogleAuthenticated
                ? "border-transparent bg-cobalt/12 text-cobalt-dark dark:bg-cobalt-light/20 dark:text-cobalt-light"
                : "border-[--color-border-subtle] text-slate-medium dark:border-white/10 dark:text-cloud-medium"}
            >
              {isGoogleAuthenticated
                ? hasUsablePassword ? t("authProvider.both") : t("authProvider.google")
                : t("authProvider.credentials")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-6">
              <Field
                id="firstName"
                label={t("form.firstName")}
                icon={User}
                value={firstName}
                onChange={(v) => onFieldChange("firstName", v)}
                placeholder={t("form.firstNamePlaceholder")}
                error={errors.firstName}
                required
                className="lg:col-span-2"
              />
              <Field
                id="lastName"
                label={t("form.lastName")}
                icon={User}
                value={lastName}
                onChange={(v) => onFieldChange("lastName", v)}
                placeholder={t("form.lastNamePlaceholder")}
                error={errors.lastName}
                required
                className="lg:col-span-2"
              />
              <Field
                id="username"
                label={t("form.username")}
                icon={User}
                value={username}
                onChange={(v) => onFieldChange("username", v)}
                placeholder={t("form.usernamePlaceholder")}
                error={errors.username}
                required
                className="sm:col-span-2 lg:col-span-2"
              />
              <Field
                id="email"
                label={t("form.email")}
                icon={Mail}
                type="email"
                value={email}
                onChange={(v) => onFieldChange("email", v)}
                placeholder={t("form.emailPlaceholder")}
                error={errors.email}
                required
                className="sm:col-span-2 lg:col-span-3"
              />
              <Field
                id="company"
                label={t("form.company")}
                icon={Building2}
                value={company}
                onChange={(v) => onFieldChange("company", v)}
                placeholder={t("form.companyPlaceholder")}
                error={errors.company}
                className="sm:col-span-2 lg:col-span-3"
              />
              <Field
                id="region"
                label={t("form.region")}
                icon={Globe}
                value={region}
                onChange={(v) => onFieldChange("region", v)}
                placeholder={t("form.regionPlaceholder")}
                className="lg:col-span-3"
              />
              <Field
                id="city"
                label={t("form.city")}
                icon={MapPin}
                value={city}
                onChange={(v) => onFieldChange("city", v)}
                placeholder={t("form.cityPlaceholder")}
                className="lg:col-span-3"
              />
            </div>

            {hasChanges && (
              <div className="flex flex-col-reverse gap-2 border-t border-[--color-border-subtle] pt-4 dark:border-white/10 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSaving}
                  className={ghostActionClass}
                >
                  {t("form.cancel")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
                  className="bg-cobalt-dark text-white shadow-[0_12px_30px_-12px_rgba(2,85,213,0.55)] hover:bg-cobalt-dark active:scale-[0.98] dark:bg-cobalt-light dark:text-black dark:hover:bg-cobalt-light"
                >
                  {isSaving ? t("form.saveChangesLoading") : t("form.saveChanges")}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Preferences and account: 2 x 2 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Notifications */}
        <Card className={cn("flex h-full flex-col", cardShell)}>
          <CardHeading icon={Bell} tone="clay">
            {t("form.allowNotificationsTitle")}
          </CardHeading>
          <CardContent className={cardBodyClass}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleAllNotifications}
              disabled={isUpdatingNotifications}
              className="self-start border-[var(--swatch--clay)]/30 text-[var(--swatch--clay)] hover:bg-[var(--swatch--clay)]/10 active:scale-[0.98]"
            >
              {allOptionalNotificationsEnabled ? t("form.disableAllOptionalNotifications") : t("form.enableAllOptionalNotifications")}
            </Button>

            <div className="grid gap-3 border-t border-[--color-border-subtle] pt-3 dark:border-white/10">
              {notificationToggles.map((item) => (
                <div key={item.key} className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-dark dark:text-ivory-light">{item.label}</p>
                    <p className="text-xs leading-snug text-slate-medium dark:text-cloud-medium">{item.description}</p>
                  </div>
                  <Slider
                    checked={item.checked}
                    onChange={() => onFieldChange(item.key, !item.checked)}
                    disabled={isUpdatingNotifications}
                    color="clay"
                    className="[&_.slider-track]:bg-[var(--swatch--clay)]/20 [&_.slider-thumb]:bg-[var(--swatch--clay)] [&_.slider-thumb]:border-[var(--swatch--clay)] [&_.slider-track]:border-[var(--swatch--clay)] [&_.slider-track]:shadow [&_.slider-thumb]:shadow-lg [&_.slider-thumb]:shadow-[#D9775740]"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Connected accounts */}
        <Card className={cn("flex h-full flex-col", cardShell)}>
          <CardHeading icon={Link2} tone="cobalt">
            {t("connectedAccounts.title")}
          </CardHeading>
          <CardContent className={cardBodyClass}>
            <p className={mutedText}>{t("connectedAccounts.description")}</p>
            <div className="rounded-2xl border border-[--color-border-subtle] p-3 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-dark dark:text-ivory-light">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    className="h-4 w-4"
                    alt=""
                  />
                  {t("connectedAccounts.googleName")}
                </div>
                <Badge
                  variant={isGoogleAuthenticated ? "secondary" : "outline"}
                  className={isGoogleAuthenticated
                    ? "gap-1 border-transparent bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                    : "border-[--color-border-subtle] text-slate-medium dark:border-white/10 dark:text-cloud-medium"}
                >
                  {isGoogleAuthenticated && <Check className="h-3 w-3" />}
                  {isGoogleAuthenticated ? t("connectedAccounts.connectedBadge") : t("connectedAccounts.notConnectedBadge")}
                </Badge>
              </div>
              <p className="mt-1.5 text-xs leading-snug text-slate-medium dark:text-cloud-medium">
                {isGoogleAuthenticated ? t("connectedAccounts.connectedHint") : t("connectedAccounts.connectHint")}
              </p>
              {isGoogleAuthenticated && !hasUsablePassword && (
                <p className="mt-1.5 text-xs leading-snug text-slate-medium dark:text-cloud-medium">
                  {t("connectedAccounts.disconnectBlocked")}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUpdatingGoogle || (isGoogleAuthenticated && !hasUsablePassword)}
              onClick={isGoogleAuthenticated ? onDisconnectGoogle : onConnectGoogle}
              className="mt-auto w-full border-cobalt text-cobalt hover:bg-cobalt/10 active:scale-[0.98] dark:border-cobalt-light dark:text-cobalt-light dark:hover:bg-cobalt-light/10"
            >
              {isGoogleAuthenticated ? t("connectedAccounts.disconnect") : t("connectedAccounts.connect")}
            </Button>
          </CardContent>
        </Card>

        {/* Security: change the password, or create one when the account only signs in with Google */}
        <Card className={cn("flex h-full flex-col", cardShell)}>
          <CardHeading icon={Lock} tone="cobalt">
            {t("security.title")}
          </CardHeading>
          <CardContent className={cardBodyClass}>
            <p className={mutedText}>
              {hasUsablePassword ? t("security.description") : t("security.createDescription")}
            </p>
            <div className="mt-auto space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSendingPasswordLink}
                className="w-full border-cobalt text-cobalt hover:bg-cobalt/10 active:scale-[0.98] dark:border-cobalt-light dark:text-cobalt-light dark:hover:bg-cobalt-light/10"
                onClick={onSendPasswordLink}
              >
                <Lock className="mr-2 h-4 w-4" />
                {hasUsablePassword ? t("security.changePassword") : t("security.createPassword")}
              </Button>
              <p className="text-xs text-slate-medium dark:text-cloud-medium">
                {t("security.emailNote", { email })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className={cn("flex h-full flex-col", cardShell, "border-red-300/50 dark:border-red-800/40")}>
          <CardHeading icon={AlertTriangle} tone="danger">
            {t("dangerZone")}
          </CardHeading>
          <CardContent className={cardBodyClass}>
            <p className={mutedText}>{t("deleteAccount.description")}</p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDeleteAccount}
              className="mt-auto w-full active:scale-[0.98]"
            >
              {t("deleteAccount.button")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileInfoTab;
