"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { getApiEndpoint } from "@/lib/api-config";
import Footer from "@/components/ui/footer";
import Banner from '@/components/ui/banner';
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/formation/course-card";
import { Input } from "@/components/ui/input";
import Alert from "@/components/ui/alert";
import AuthModal from "@/components/auth/auth-modal";
import CourseDetailsModal from "@/components/formation/course-details-modal";
import EnrollmentConfirmationModal from "@/components/formation/enrollment-confirmation-modal";
import EnrollmentCancellationModal from "@/components/formation/enrollment-cancellation-modal";
import CourseEnrollmentSuccessModal from "@/components/formation/enrollment-success-modal";
import CourseCancelEnrollmentSuccessModal from "@/components/formation/enrollment-cancellation-success-modal";
import {
  Search,
  MapPin,
  BookOpen,
  Award,
  Mail,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import type { Course } from "@/utils/pdf-generator";
import { Dropdown } from "@/components/ui/dropdown";
import { generateCoursesCatalogPDF } from "@/utils/pdf-generator";
import BonificationInfo from "@/components/formation/bonification-info";
import { FaqSection } from "@/components/formation/faq-section";

interface Enrollment {
  id: number;
  course: number;
  user: number;
  enrolled_at: string;
}

interface FormationPageClientProps {
  initialCourseSlug?: string;
}

export default function FormationPageClient({ initialCourseSlug }: FormationPageClientProps) {
  const t = useTranslations("formation");
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [pastCourses, setPastCourses] = useState<Course[]>([]);
  const [showPastCourses, setShowPastCourses] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState<'all' | 'online' | 'onsite'>('all');
  const [filterPrice, setFilterPrice] = useState<'all' | 'free' | 'paid'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseToCancel, setCourseToCancel] = useState<Course | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCourseDetailsModal, setShowCourseDetailsModal] = useState(false);
  const [courseForAuth, setCourseForAuth] = useState<Course | null>(null);
  const [courseForDetails, setCourseForDetails] = useState<Course | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successCourseTitle] = useState<string | undefined>(undefined);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      // Handle Stripe payment return
      const paymentStatus = url.searchParams.get('payment');
      if (paymentStatus === 'success') {
        setAlert({ type: 'success', message: t('enrollment.successMessage') });
        fetchEnrollments();
        // Remove the query param from the URL
        url.searchParams.delete('payment');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      } else if (paymentStatus === 'cancel') {
        setAlert({ type: 'error', message: t('enrollment.cancelledMessage') });
        url.searchParams.delete('payment');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
      // Retain old logic for enrolled param (for free courses)
      const enrolledParam = url.searchParams.get('enrolled');
      if (enrolledParam === '1') {
        setShowSuccessModal(true);
        url.searchParams.delete('enrolled');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
    }
  }, [t]);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch(getApiEndpoint('/api/courses/courses/'));
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        setAlert({type: 'error', message: t('alerts.failedToLoadCourses')});
      }
    } catch {
      setAlert({type: 'error', message: t('alerts.networkErrorLoadingCourses')});
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    setIsAuthenticated(!!token);

    fetchCourses();
    if (token) {
      fetchEnrollments();
    }
  }, [fetchCourses]);

  useEffect(() => {
    const now = new Date();
    // Helper to get Date from date+time
    const getDateTime = (dateStr: string, timeStr: string): Date | null => {
      if (!dateStr || dateStr === "0000-00-00" || !timeStr) return null;
      return new Date(`${dateStr}T${timeStr}`);
    };

    // Only finished courses go to past
    const past = courses.filter(course => {
      const end = getDateTime(course.end_date, course.end_time);
      return end && end < now;
    });

    // All others (not finished) are main/upcoming
    const upcoming = courses.filter(course => {
      const end = getDateTime(course.end_date, course.end_time);
      return !(end && end < now);
    });

    upcoming.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    past.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

    setPastCourses(past);

    let filtered = upcoming;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.subtitle && course.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterLocation === 'online') {
      filtered = filtered.filter(course => {
        const loc = course.location ? course.location.toLowerCase() : '';
        return loc.includes('online') || loc.includes('virtual');
      });
    } else if (filterLocation === 'onsite') {
      filtered = filtered.filter(course => {
        const loc = course.location ? course.location.toLowerCase() : '';
        return !loc.includes('online') && !loc.includes('virtual');
      });
    }

    if (filterPrice === 'free') {
      filtered = filtered.filter(course => !course.price || course.price === 0);
    } else if (filterPrice === 'paid') {
      filtered = filtered.filter(course => course.price && course.price > 0);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, filterLocation, filterPrice, t]);

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(getApiEndpoint('/api/courses/enrollments/'), {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch {
      // ignore
    }
  };

  const handleEnrollCourse = (course: Course) => {
    if (!isAuthenticated) {
      setCourseForAuth(course);
      setShowAuthModal(true);
      return;
    }

    setSelectedCourse(course);
    setShowEnrollModal(true);
  };

  const handleCancelEnrollment = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setCourseToCancel(course);
      setShowCancelModal(true);
    }
  };

  const handleCancelEnrollmentConfirm = async () => {
    if (!courseToCancel) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setAlert({type: 'error', message: t('alerts.signInRequired')});
        return;
      }
      // Prefer slug if present and non-empty, otherwise use id if it's a positive number
      let identifier: string | number | undefined;
      if (courseToCancel.slug && typeof courseToCancel.slug === 'string' && courseToCancel.slug.trim() !== '') {
        identifier = courseToCancel.slug;
      } else if (typeof courseToCancel.id === 'number' && courseToCancel.id > 0) {
        identifier = courseToCancel.id;
      }
      if (identifier === undefined) {
        setAlert({type: 'error', message: t('alerts.invalidCourseIdentifier')});
        return;
      }
      const response = await fetch(getApiEndpoint(`/api/courses/courses/${identifier}/unenroll/`), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setAlert({type: 'success', message: t('alerts.enrollmentCancelled')});
        setShowCancelModal(false);
        setCourseToCancel(null);
        fetchEnrollments();
        fetchCourses();
        setShowCancelSuccessModal(true);
      } else {
        await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        if (response.status === 400) {
          setAlert({type: 'warning', message: t('alerts.notEnrolled')});
        } else if (response.status === 401) {
          setAlert({type: 'error', message: t('alerts.authenticationFailed')});
        } else {
          setAlert({type: 'error', message: t('alerts.cancelEnrollmentFailed')});
        }
      }
    } catch {
      setAlert({type: 'error', message: t('alerts.networkError')});
    }
  };

  const isEnrolled = (courseId: number) => {
    return enrollments.some(enrollment => enrollment.course === courseId);
  };

  const handleViewDetails = (course: Course) => {
    setCourseForDetails(course);
    setShowCourseDetailsModal(true);
    // Push a clean URL for the course slug so sharing works
    if (typeof window !== 'undefined' && course.slug) {
      const url = new URL(window.location.href);
      // Build localized path only if the first segment is a locale
      const parts = url.pathname.split('/').filter(Boolean);
      const maybeLocale = parts[0] ?? "";
      const localePrefix = routing.locales.includes(maybeLocale as Locale) ? `/${maybeLocale}` : "";
      // Replace or append formation/<slug>
      const newPath = `${localePrefix}/formation/${course.slug}`;
      window.history.replaceState({}, document.title, newPath + url.search);
    }
  };

  const handleDetailsEnroll = () => {
    if (courseForDetails) {
      setShowCourseDetailsModal(false);
      if (!isAuthenticated) {
        setCourseForAuth(courseForDetails);
        setShowAuthModal(true);
      } else {
        setSelectedCourse(courseForDetails);
        setShowEnrollModal(true);
      }
    }
  };

  const handleDetailsCancel = () => {
    if (courseForDetails) {
      setShowCourseDetailsModal(false);
      handleCancelEnrollment(courseForDetails.id);
    }
  };

  const handleDetailsAuthRequired = () => {
    if (courseForDetails) {
      setCourseForAuth(courseForDetails);
      setShowCourseDetailsModal(false);
      setShowAuthModal(true);
    }
  };

  useEffect(() => {
    // If the component was mounted with an initialCourseSlug, try to open it after courses load
    if (!initialCourseSlug) return;
    if (courses.length === 0) return;

    const tryOpen = async () => {
      const matched = courses.find(c => c.slug === initialCourseSlug);
      if (matched) {
        setCourseForDetails(matched);
        setShowCourseDetailsModal(true);
        return;
      }
      // Fallback: try fetching the single course by slug
      try {
        const res = await fetch(getApiEndpoint(`/api/courses/courses/${initialCourseSlug}/`));
        if (res.ok) {
          const data = await res.json();
          setCourseForDetails(data);
          setShowCourseDetailsModal(true);
        }
      } catch {
        // ignore
      }
    };

    tryOpen();
  }, [initialCourseSlug, courses]);

  const handleDownloadCatalog = async () => {
    try {
      setAlert({type: 'info', message: t('alerts.generatingCatalog')});
      await generateCoursesCatalogPDF(courses, t);
      setAlert({type: 'success', message: t('alerts.catalogDownloaded')});
    } catch {
      setAlert({type: 'error', message: t('alerts.catalogError')});
    }
  };

  const getLocationLabel = (value: 'all' | 'online' | 'onsite') => {
    switch (value) {
      case 'all':
        return t("filters.location.all");
      case 'online':
        return t("filters.location.online");
      case 'onsite':
        return t("filters.location.onsite");
      default:
        return t("filters.location.all");
    }
  };

  const getPriceLabel = (value: 'all' | 'free' | 'paid') => {
    switch (value) {
      case 'all':
        return t("filters.price.all");
      case 'free':
        return t("filters.price.free");
      case 'paid':
        return t("filters.price.paid");
      default:
        return t("filters.price.all");
    }
  };

  const locationOptions = [
    { value: 'all' as const, label: t("filters.location.all") },
    { value: 'online' as const, label: t("filters.location.online") },
    { value: 'onsite' as const, label: t("filters.location.onsite") }
  ];

  const priceOptions = [
    { value: 'all' as const, label: t("filters.price.all") },
    { value: 'free' as const, label: t("filters.price.free") },
    { value: 'paid' as const, label: t("filters.price.paid") }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
        <div className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="h-56 rounded-3xl bg-gray-200/80 dark:bg-gray-800/80 animate-pulse" />
            <div className="grid gap-4 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-12 rounded-xl bg-gray-200/80 dark:bg-gray-800/80 animate-pulse" />
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-80 rounded-2xl bg-gray-200/80 dark:bg-gray-800/80 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={alert.type === 'success' ? 3000 : 5000}
        />
      )}

      <Banner
        title={t('title')}
        subtitle={t('subtitle')}
        backgroundImage={'/static/backgrounds/formation_background.webp'}
      >
        <div className="max-w-5xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#0255D5] dark:focus:border-[#7DB5FF]"
              />
            </div>

            <Dropdown
              options={locationOptions.map(opt => ({ value: opt.value, label: opt.label }))}
              value={filterLocation}
              onChange={(value) => setFilterLocation(value as 'all' | 'online' | 'onsite')}
              icon={MapPin}
              minWidth="240px"
              placeholder={getLocationLabel(filterLocation)}
            />

            <Dropdown
              options={priceOptions.map(opt => ({ value: opt.value, label: opt.label }))}
              value={filterPrice}
              onChange={(value) => setFilterPrice(value as 'all' | 'free' | 'paid')}
              icon={Award}
              minWidth="240px"
              placeholder={getPriceLabel(filterPrice)}
            />
          </div>
        </div>
      </Banner>

      <section className="max-w-4xl mx-auto mt-8 mb-2 px-4">
        <BonificationInfo />
      </section>

      <section className="pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("noResults.title")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("noResults.description")}
              </p>
            </div>
          ) : (
            <>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10">
                {filteredCourses.map((course) => {
                  // Compute unenroll restriction
                  let disableUnenroll = false;
                  let unenrollRestrictionReason: string | null = null;
                  const now = new Date();
                  const startDateTime = course.start_date && course.start_time
                    ? new Date(`${course.start_date}T${course.start_time}`)
                    : null;
                  const endDateTime = course.end_date && course.end_time
                    ? new Date(`${course.end_date}T${course.end_time}`)
                    : null;
                  if (isEnrolled(course.id)) {
                    if (startDateTime) {
                      const diffMs = startDateTime.getTime() - now.getTime();
                      const diffHours = diffMs / (1000 * 60 * 60);
                      if (diffHours <= 24 && diffHours > 0) {
                        disableUnenroll = true;
                        unenrollRestrictionReason = t('alerts.unenroll24hRestriction');
                      } else if (diffHours <= 0) {
                        disableUnenroll = true;
                        unenrollRestrictionReason = t('alerts.unenrollStartedRestriction');
                      }
                    }
                    if (endDateTime && endDateTime < now) {
                      disableUnenroll = true;
                      unenrollRestrictionReason = t('alerts.unenrollEndedRestriction');
                    }
                  }
                  const highlightUpcoming = !!(startDateTime && startDateTime > now);
                  const inProgress = !!(startDateTime && endDateTime && startDateTime <= now && endDateTime > now);
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      variant="upcoming"
                      enrolled={isEnrolled(course.id)}
                      onEnroll={() => handleEnrollCourse(course)}
                      onCancel={() => handleCancelEnrollment(course.id)}
                      onViewDetails={() => handleViewDetails(course)}
                      disableEnroll={!course.start_date || course.start_date === "0000-00-00" || !course.end_date || course.end_date === "0000-00-00" || !course.start_time || !course.end_time}
                      disableUnenroll={disableUnenroll}
                      unenrollRestrictionReason={unenrollRestrictionReason}
                      highlightUpcoming={highlightUpcoming}
                      inProgress={inProgress}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {pastCourses.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <Button
                onClick={() => setShowPastCourses(!showPastCourses)}
                variant="outline"
                className="border-[#0255D5] dark:border-[#7DB5FF] text-[#0255D5] dark:text-[#7DB5FF] hover:bg-[#0144AA] dark:hover:bg-[#7DB5FF]/20 hover:text-white dark:hover:text-back transition-all duration-300 px-6 py-3 text-lg font-semibold flex items-center gap-2"
              >
                {showPastCourses ? (
                  <>
                    <ChevronDown className="w-5 h-5" />
                    {t("hidePastCourses")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5 rotate-180" />
                    {t("viewPastCourses")} ({pastCourses.length})
                  </>
                )}
              </Button>
            </div>

            {showPastCourses && (
              <>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  {t("pastCourses")}
                </h3>
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {pastCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      variant="past"
                      onViewDetails={() => handleViewDetails(course)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <FaqSection t={t} />
    
      <section className="px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-[--color-border-subtle] bg-[linear-gradient(135deg,rgba(217,119,87,0.10),rgba(250,249,245,0.96),rgba(2,85,213,0.08))] shadow-[0_28px_90px_-60px_rgba(20,20,19,0.22)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(217,119,87,0.16),rgba(20,20,19,0.96),rgba(2,85,213,0.18))]">
            <div className="pointer-events-none absolute -left-16 top-8 h-40 w-40 rounded-full bg-clay/15 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-cobalt/10 blur-3xl dark:bg-cobalt/20" />
            <div className="pointer-events-none absolute -bottom-12 right-16 h-36 w-36 rounded-full bg-oat/70 blur-3xl dark:bg-white/10" />

            <div className="relative grid gap-8 p-8 md:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-clay/15 bg-white/70 px-4 py-2 text-sm font-semibold text-clay shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.05] dark:text-[#F1B29D]">
                  <Award className="h-4 w-4" />
                  {t("title")}
                </div>

                <h2 className="mt-5 text-4xl font-bold leading-[0.98] tracking-[-0.04em] text-slate-dark dark:text-ivory-light md:text-5xl">
                  {t("cta.title")}
                </h2>

                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-medium dark:text-cloud-medium">
                  {t("cta.description")}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-black/5 bg-white/80 p-4 shadow-[0_24px_60px_-42px_rgba(20,20,19,0.24)] backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
                <div className="grid gap-3">
                  <Button
                    variant="accent"
                    size="lg"
                    className="h-auto w-full justify-between rounded-[1.25rem] px-5 py-4 text-left shadow-[0_18px_36px_-24px_rgba(217,119,87,0.55)]"
                    onClick={() => {
                      const subject = encodeURIComponent(t("cta.emailSubject"));
                      const body = encodeURIComponent(t("cta.emailBody"));
                      window.location.href = `mailto:info@ordinaly.ai?subject=${subject}&body=${body}`;
                    }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                        <Mail className="h-5 w-5" />
                      </span>
                      <span>{t("cta.contact")}</span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0" />
                  </Button>

                  <Button
                    size="lg"
                    onClick={handleDownloadCatalog}
                    className="h-auto w-full justify-between rounded-[1.25rem] border border-[--color-border-subtle] bg-[--swatch--ivory-light]/90 px-5 py-4 text-[--swatch--slate-dark] shadow-sm hover:bg-white dark:border-white/10 dark:bg-[--swatch--slate-medium] dark:text-[--swatch--ivory-light] dark:hover:bg-[--swatch--slate-light]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cobalt/10 text-cobalt ring-1 ring-cobalt/10 dark:bg-white/10 dark:text-[#7DB5FF] dark:ring-white/10">
                        <BookOpen className="h-5 w-5" />
                      </span>
                      <span>{t("cta.catalog")}</span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-clay" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnrollmentConfirmationModal
        isOpen={showEnrollModal}
        onClose={() => {
          setShowEnrollModal(false);
          setSelectedCourse(null);
          fetchEnrollments();
          fetchCourses();
        }}
        selectedCourse={selectedCourse}
      />
      <CourseEnrollmentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        courseTitle={successCourseTitle}
        t={t}
      />

      <EnrollmentCancellationModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCourseToCancel(null);
          fetchEnrollments();
          fetchCourses();
        }}
        courseToCancel={courseToCancel}
        onConfirm={handleCancelEnrollmentConfirm}
      />

      <CourseCancelEnrollmentSuccessModal
        isOpen={showCancelSuccessModal}
        onClose={() => setShowCancelSuccessModal(false)}
        t={t}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        courseTitle={courseForAuth?.title}
      />

      {courseForDetails && (
        <CourseDetailsModal
          isOpen={showCourseDetailsModal}
          onClose={() => setShowCourseDetailsModal(false)}
          course={courseForDetails}
          isEnrolled={isEnrolled(courseForDetails.id)}
          isAuthenticated={isAuthenticated}
          onEnroll={handleDetailsEnroll}
          onCancel={handleDetailsCancel}
          onAuthRequired={handleDetailsAuthRequired}
        />
      )}

      <Footer />
    </div>
  );
}
