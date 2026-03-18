"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import Alert from "@/components/ui/alert";
import DeleteAccountModal from "@/components/ui/delete-account-modal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProfileInfoTab from "@/components/profile/profile-info-tab";
import ProfileCoursesTab from "@/components/profile/profile-courses-tab";
import { User, BookOpen } from "lucide-react";
import type { Course } from "@/hooks/useCourses";
import Footer from "@/components/ui/footer";
import { useParams } from "next/navigation";
import {
  DELETE_ACCOUNT_COOLDOWN_KEY,
  setEmailCooldown,
  VERIFY_EMAIL_COOLDOWN_KEY,
} from "@/lib/email-confirmation";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  // Also support backend field names
  name?: string;
  surname?: string;
  company: string | null;
  region: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
  pending_email?: string | null;
  course_email_notifications?: boolean;
  allow_notifications?: boolean;
  is_google_authenticated?: boolean;
}

interface Enrollment {
  id: number;
  user: number;
  course: number;
  enrolled_at: string;
}

export default function ProfilePage() {


  const t = useTranslations("profile");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
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
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [courseEmailNotifications, setCourseEmailNotifications] = useState(true);
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "courses">("profile");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const { locale } = useParams();


  // Track changes to form fields
  const handleFieldChange = (field: string, value: string | boolean) => {
    if (field === 'course_email_notifications') {
      void persistNotificationPreferences(Boolean(value), newsletterConsent);
      return;
    }

    if (field === 'allow_notifications') {
      void persistNotificationPreferences(courseEmailNotifications, Boolean(value));
      return;
    }

    switch (field) {
      case 'firstName':
        setFirstName(value as string);
        break;
      case 'lastName':
        setLastName(value as string);
        break;
      case 'username':
        setUsername(value as string);
        break;
      case 'email':
        setEmail(value as string);
        break;
      case 'company':
        setCompany(value as string);
        break;
      case 'region':
        setRegion(value as string);
        break;
      case 'city':
        setCity(value as string);
        break;
    }
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
  }, [
    profile,
    firstName,
    lastName,
    username,
    email,
    company,
    region,
    city,
  ]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const nextTab = tabParam === "courses" ? "courses" : "profile";
    setActiveTab(nextTab);

    if (tabParam !== nextTab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", nextTab);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, pathname, router]);

  const handleTabChange = (tabId: "profile" | "courses") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`);
    setActiveTab(tabId);
  };

  const profileTabs = [
    { id: "profile" as const, label: t("tabs.profile"), icon: User },
    { id: "courses" as const, label: t("tabs.courses"), icon: BookOpen },
  ];

  const fetchEnrolledCourses = useCallback(async (token?: string, userId?: number) => {
    const authTokenToUse = token || authToken;
    if (!authTokenToUse) return;
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
      const enrollmentsResponse = await fetch(`${apiUrl}/api/courses/enrollments/`, {
        headers: {
          Authorization: `Token ${authTokenToUse}`,
          'Content-Type': 'application/json',
        },
      });

      if (enrollmentsResponse.status === 401) {
        window.location.href = "/auth/signin";
        return;
      }

      if (!enrollmentsResponse.ok) {
        setCoursesError(t("courses.loadError"));
        return;
      }

      let enrollmentsData = await enrollmentsResponse.json();
      if (enrollmentsData?.results) {
        enrollmentsData = enrollmentsData.results;
      }
      const scopedEnrollments = userId
        ? (enrollmentsData as Enrollment[]).filter((enrollment) => enrollment.user === userId)
        : (enrollmentsData as Enrollment[]);
      setEnrollments(scopedEnrollments);
      const enrolledIds = new Set(scopedEnrollments.map((enrollment) => enrollment.course));

      const coursesResponse = await fetch(`${apiUrl}/api/courses/courses/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!coursesResponse.ok) {
        setCoursesError(t("courses.loadError"));
        return;
      }

      let coursesData = await coursesResponse.json();
      if (coursesData?.results) {
        coursesData = coursesData.results;
      }
      const filteredCourses = (coursesData as Course[]).filter((course) => enrolledIds.has(course.id));
      setEnrolledCourses(filteredCourses);
    } catch {
      setCoursesError(t("courses.loadError"));
    } finally {
      setCoursesLoading(false);
    }
  }, [authToken, t]);

  const persistNotificationPreferences = async (nextCourseEmailNotifications: boolean, nextNewsletterConsent: boolean) => {
    if (!authToken) return;

    const previousCourseEmailNotifications = courseEmailNotifications;
    const previousNewsletterConsent = newsletterConsent;

    setCourseEmailNotifications(nextCourseEmailNotifications);
    setNewsletterConsent(nextNewsletterConsent);
    setIsUpdatingNotifications(true);
    setAlert(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
      const response = await fetch(`${apiUrl}/api/users/update_profile/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_email_notifications: nextCourseEmailNotifications,
          allow_notifications: nextNewsletterConsent,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setProfile((currentProfile) => currentProfile ? { ...currentProfile, ...data } : currentProfile);
        setCourseEmailNotifications(data.course_email_notifications ?? nextCourseEmailNotifications);
        setNewsletterConsent(!!data.allow_notifications);
        setAlert({ type: 'success', message: t("messages.notificationUpdateSuccess") });
        return;
      }

      setCourseEmailNotifications(previousCourseEmailNotifications);
      setNewsletterConsent(previousNewsletterConsent);

      if (response.status === 401) {
        setTimeout(() => {
          window.location.href = "/auth/signin";
        }, 2000);
      }

      const errorMessage =
        (Array.isArray(data.detail) ? data.detail[0] : data.detail) ||
        (Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors) ||
        t("messages.notificationUpdateError");
      setAlert({ type: 'error', message: errorMessage });
    } catch {
      setCourseEmailNotifications(previousCourseEmailNotifications);
      setNewsletterConsent(previousNewsletterConsent);
      setAlert({ type: 'error', message: t("messages.notificationUpdateError") });
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const fetchProfile = useCallback(async (token?: string): Promise<UserProfile | null> => {
    const authTokenToUse = token || authToken;
    if (!authTokenToUse) return null;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
      const response = await fetch(`${apiUrl}/api/users/profile/`, {
        headers: {
          Authorization: `Token ${authTokenToUse}`,
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
        setCourseEmailNotifications(data.course_email_notifications ?? true);
        setNewsletterConsent(!!data.allow_notifications);
        return data;
      } else if (response.status === 401) {
        // Token is invalid
        window.location.href = "/auth/signin";
      } else {
        setAlert({ type: 'error', message: t("messages.networkError") });
      }
    } catch {
      setAlert({ type: 'error', message: t("messages.networkError") });
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [authToken, t]);

  useEffect(() => {
    const token =
      localStorage.getItem("auth_token");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    setAuthToken(token);
    setIsAuthenticated(true);


    const loadProfileAndCourses = async () => {
      const profileData = await fetchProfile(token);
      await fetchEnrolledCourses(token, profileData?.id);
    };

    loadProfileAndCourses();
  }, [fetchEnrolledCourses, fetchProfile]);

  useEffect(() => {
    if (isAuthenticated === false) {
      window.location.href = "/auth/signin";
    }
  }, [isAuthenticated]);



  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) newErrors.firstName = t("messages.validation.firstNameRequired");
    if (!lastName.trim()) newErrors.lastName = t("messages.validation.lastNameRequired");
    if (!username.trim()) newErrors.username = t("messages.validation.usernameRequired");
    if (!email.trim()) newErrors.email = t("messages.validation.emailRequired");
    if (!email.includes("@")) newErrors.email = t("messages.validation.emailInvalid");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getLocalizedProfileFieldError = (field: string, value: unknown) => {
    if (!value) return null;

    const rawValue = Array.isArray(value) ? value[0] : value;
    if (typeof rawValue !== "string") return null;

    const normalized = rawValue.toLowerCase();

    if (field === "email" && normalized === "email_taken") {
      return t("messages.validation.emailTaken");
    }

    if (field === "username" && normalized === "username_taken") {
      return t("messages.validation.usernameTaken");
    }

    return rawValue;
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
        company: company.trim() || null,
        region: region.trim() || null,
        city: city.trim() || null,
        course_email_notifications: courseEmailNotifications,
        allow_notifications: newsletterConsent,
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
      const response = await fetch(`${apiUrl}/api/users/update_profile/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${authToken}`,
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
        setCourseEmailNotifications(data.course_email_notifications ?? true);
        setNewsletterConsent(!!data.allow_notifications);

        if (data.email_change_requires_verification) {
          const pendingEmail = data.pending_email || email.trim();
          localStorage.setItem("pending_email", pendingEmail);
          localStorage.setItem("pending_email_requires_confirmation", "true");
          setEmailCooldown(VERIFY_EMAIL_COOLDOWN_KEY);
          setAlert({ type: 'info', message: t("messages.emailChangeVerificationRequired") });
          setHasChanges(false);
          window.location.href = `/${locale}/verify-email`;
          return;
        }

        setAlert({ type: 'success', message: t("messages.updateSuccess") });
        setHasChanges(false);
      } else {
        const data = await response.json();
        let priorityAlertMessage: string | null = null;

        // Handle validation errors from Django
        if (data.username) {
          const usernameMessage = getLocalizedProfileFieldError("username", data.username);
          if (usernameMessage) {
            setErrors(prev => ({ ...prev, username: usernameMessage }));
          }
        }
        if (data.email) {
          const emailMessage = getLocalizedProfileFieldError("email", data.email);
          if (emailMessage) {
            setErrors(prev => ({ ...prev, email: emailMessage }));
            priorityAlertMessage = emailMessage;
          }
        }
        if (data.first_name || data.name) {
          const nameError = data.first_name || data.name;
          setErrors(prev => ({ ...prev, firstName: Array.isArray(nameError) ? nameError[0] : nameError }));
        }
        if (data.last_name || data.surname) {
          const surnameError = data.last_name || data.surname;
          setErrors(prev => ({ ...prev, lastName: Array.isArray(surnameError) ? surnameError[0] : surnameError }));
        }
        if (data.company) {
          setErrors(prev => ({ ...prev, company: Array.isArray(data.company) ? data.company[0] : data.company }));
        }
        if (priorityAlertMessage) {
          setAlert({ type: 'error', message: priorityAlertMessage });
        } else if (data.non_field_errors) {
          setAlert({ type: 'error', message: Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors });
        } else if (data.detail) {
          setAlert({ type: 'error', message: data.detail });
        }

        // If no specific errors, show generic error
        if (!data.username && !data.email && !data.first_name && !data.name && !data.last_name && !data.surname && !data.company && !data.non_field_errors && !data.detail) {
          setAlert({ type: 'error', message: t("messages.updateError") });
        }

        if (response.status === 401) {
          // Token expired, redirect to sign in
          setTimeout(() => {
            window.location.href = "/auth/signin";
          }, 2000);
        }
      }
    } catch {
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

  const allOptionalNotificationsEnabled = courseEmailNotifications && newsletterConsent;

  const handleToggleAllNotifications = () => {
    if (isUpdatingNotifications) return;
    const nextValue = !allOptionalNotificationsEnabled;
    void persistNotificationPreferences(nextValue, nextValue);
  };

  const handleDeleteAccount = async () => {
  setIsDeleting(true);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';

    const response = await fetch(`${apiUrl}/auth/delete/request/`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      localStorage.setItem('deletion_requested', 'true');
      setEmailCooldown(DELETE_ACCOUNT_COOLDOWN_KEY);
      window.location.href = `/${locale}/delete_account/email-sent`;
      return;
    }

    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      setAlert({ type: 'error', message: t("messages.unauthorizedError") });
    } else {
      setAlert({ type: 'error', message: data.error || data.detail || t("messages.deleteError") });
    }

  } catch {
    setAlert({ type: 'error', message: t("messages.networkError") });
  } finally {
    setIsDeleting(false);
    setShowDeleteModal(false);
  }
};



  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0255D5] dark:border-[#7DB5FF] mx-auto mb-4"></div>
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

      <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-20 pt-8 md:px-6 lg:px-8">
        {/* Header Panel */}
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-4 shadow-sm dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)] dark:backdrop-blur-md sm:px-10">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#0255D5] dark:text-[#7DB5FF]">
              {t("kicker")}
            </p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white md:text-4xl">
              {t("title")}
            </h1>
          </div>

          {/* Pill-shaped tabs */}
          <div className="mt-4 flex flex-wrap gap-3">
            {profileTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`group inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? "border-[#0255D5]/60 bg-[#0255D5]/15 text-[#0255D5] dark:text-[#7DB5FF] shadow-[0_8px_20px_rgba(2,85,213,0.12)]"
                      : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:border-[#0255D5] hover:bg-[#0255D5]/5 dark:hover:border-[#7DB5FF]/30 dark:hover:bg-[#7DB5FF]/10 dark:hover:text-[#7DB5FF]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" ? (
          <ProfileInfoTab
            firstName={firstName}
            lastName={lastName}
            username={username}
            email={email}
            company={company}
            region={region}
            city={city}
            isGoogleAuthenticated={Boolean(profile?.is_google_authenticated)}
            errors={errors}
            hasChanges={hasChanges}
            isSaving={isSaving}
            isUpdatingNotifications={isUpdatingNotifications}
            courseEmailNotifications={courseEmailNotifications}
            newsletterConsent={newsletterConsent}
            allOptionalNotificationsEnabled={allOptionalNotificationsEnabled}
            onFieldChange={handleFieldChange}
            onToggleAllNotifications={handleToggleAllNotifications}
            onSave={handleSaveChanges}
            onCancel={handleCancelChanges}
            onDeleteAccount={() => setShowDeleteModal(true)}
          />
        ) : (
          <ProfileCoursesTab
            enrolledCourses={enrolledCourses}
            enrollments={enrollments}
            isLoading={coursesLoading}
            error={coursesError}
          />
        )}
      </div>

      <Footer />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
      />
    </div>
  );
}
