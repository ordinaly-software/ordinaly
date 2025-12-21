"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import Alert from "@/components/ui/alert";
import DeleteAccountModal from "@/components/ui/delete-account-modal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProfileInfoTab from "@/components/profile/profile-info-tab";
import ProfileCoursesTab from "@/components/profile/profile-courses-tab";
import { AdminTabs, type AdminTabsTab } from "@/components/admin/admin-tabs";
import { User, BookOpen } from "lucide-react";
import type { Course } from "@/hooks/useCourses";
import Footer from "@/components/ui/footer";

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
  allow_notifications?: boolean;
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
  const [allowNotifications, setAllowNotifications] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [pendingNotificationValue, setPendingNotificationValue] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "courses">("profile");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // Track changes to form fields
  const handleFieldChange = (field: string, value: string | boolean) => {
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
      case 'allow_notifications':
        // Show confirmation modal before changing
        setPendingNotificationValue(!!value);
        setShowNotificationModal(true);
        return;
    }
    setHasChanges(true);
  };

  // Confirm notification toggle and update immediately
  const handleConfirmNotificationChange = async () => {
    if (pendingNotificationValue !== null) {
      setAllowNotifications(pendingNotificationValue);
      setShowNotificationModal(false);
      setPendingNotificationValue(null);

      // Immediately update notification preference in backend
      setIsSaving(true);
      setAlert(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
        const response = await fetch(`${apiUrl}/api/users/update_profile/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ allow_notifications: pendingNotificationValue }),
        });
        if (response.ok) {
          const data = await response.json();
          setProfile((prev) => prev ? { ...prev, allow_notifications: data.allow_notifications } : prev);
          setAlert({ type: 'success', message: t("messages.updateSuccess") });
        } else {
          setAlert({ type: 'error', message: t("messages.updateError") });
        }
      } catch {
        setAlert({ type: 'error', message: t("messages.networkError") });
      } finally {
        setIsSaving(false);
      }
    } else {
      setShowNotificationModal(false);
      setPendingNotificationValue(null);
    }
  };

  const handleCancelNotificationChange = () => {
    setShowNotificationModal(false);
    setPendingNotificationValue(null);
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
    const originalAllowNotifications = profile.allow_notifications ?? false;
    const hasAnyChanges = 
      firstName !== originalFirstName ||
      lastName !== originalLastName ||
      username !== originalUsername ||
      email !== originalEmail ||
      company !== originalCompany ||
      region !== originalRegion ||
      city !== originalCity ||
      allowNotifications !== originalAllowNotifications;
    setHasChanges(hasAnyChanges);
  }, [profile, firstName, lastName, username, email, company, region, city, allowNotifications]);

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

  const profileTabs: AdminTabsTab[] = [
    { id: "profile", name: t("tabs.profile"), icon: User, accentColor: "#1F8A0D" },
    { id: "courses", name: t("tabs.courses"), icon: BookOpen, accentColor: "#1F8A0D" },
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
          'Authorization': `Token ${authTokenToUse}`,
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

  const fetchProfile = useCallback(async (token?: string): Promise<UserProfile | null> => {
    const authTokenToUse = token || authToken;
    if (!authTokenToUse) return null;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
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
        setAllowNotifications(!!data.allow_notifications);
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
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
    setIsAuthenticated(!!token);

    // Redirect if not authenticated
    if (!token) {
      window.location.href = "/auth/signin";
      return;
    }

    const loadProfileAndCourses = async () => {
      const profileData = await fetchProfile(token);
      await fetchEnrolledCourses(token, profileData?.id);
    };
    loadProfileAndCourses();
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
        allow_notifications: allowNotifications,
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
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
        setAllowNotifications(!!data.allow_notifications);
        
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
      setAllowNotifications(profile.allow_notifications ?? false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
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
    } catch {
      setAlert({ type: 'error', message: t("messages.networkError") });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F8A0D] dark:border-[#7CFC00] mx-auto mb-4"></div>
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

      {/* Profile Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#1F8A0D] dark:from-[#7CFC00] via-[#46B1C9] to-[#623CEA] bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              {t("subtitle")}
            </p>
          </div>

          <AdminTabs
            tabs={profileTabs}
            activeTab={activeTab}
            onTabChange={(tabId) => handleTabChange(tabId as "profile" | "courses")}
            storageKey="profileActiveTab"
            className="mb-10"
            style={{ top: 0 }}
          />

          {activeTab === "profile" ? (
            <ProfileInfoTab
              firstName={firstName}
              lastName={lastName}
              username={username}
              email={email}
              company={company}
              region={region}
              city={city}
              errors={errors}
              hasChanges={hasChanges}
              isSaving={isSaving}
              allowNotifications={allowNotifications}
              onFieldChange={handleFieldChange}
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
      </section>

      <Footer />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
        username={profile?.username || username || ""}
      />

      {/* Notification Confirmation Modal */}
      <ConfirmationModal
        isOpen={showNotificationModal}
        onClose={handleCancelNotificationChange}
        onConfirm={handleConfirmNotificationChange}
        title={t("form.allowNotificationsModalTitle")}
        message={pendingNotificationValue === true ? t("form.allowNotificationsModalOn") : t("form.allowNotificationsModalOff")}
        confirmText={t("form.allowNotificationsModalConfirm")}
        cancelText={t("form.allowNotificationsModalCancel")}
        isLoading={false}
      />
    </div>
  );
}
