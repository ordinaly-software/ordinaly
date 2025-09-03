"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getApiEndpoint } from "@/lib/api-config";
import Footer from "@/components/ui/footer";
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
  Calendar,
  MapPin,
  BookOpen,
  Award,
  Mail,
  ChevronDown,
} from "lucide-react";
import type { Course } from "@/utils/pdf-generator";
import { Dropdown } from "@/components/ui/dropdown";
import { generateCoursesCatalogPDF } from "@/utils/pdf-generator";
import BonificationInfo from "@/components/formation/bonification-info";



interface Enrollment {
  id: number;
  course: number;
  user: number;
  enrolled_at: string;
}

const FormationPage = () => {
  const t = useTranslations("formation");
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [pastCourses, setPastCourses] = useState<Course[]>([]);
  const [showPastCourses, setShowPastCourses] = useState(false);
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
  const [successCourseTitle, setSuccessCourseTitle] = useState<string | undefined>(undefined);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  // Show success modal after Stripe redirect if ?enrolled=1 is present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const enrolledParam = url.searchParams.get('enrolled');
      if (enrolledParam === '1') {
        // Try to get course title from state or fallback
        setShowSuccessModal(true);
        // Optionally, you could get the course title from localStorage or another source
        // Remove the param from the URL
        url.searchParams.delete('enrolled');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
    }
  }, []);

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
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);

    fetchCourses();
    if (token) {
      fetchEnrollments();
    }
  }, [fetchCourses]);

  useEffect(() => {
    const now = new Date();
    const upcoming = courses.filter(course => 
      course.start_date && course.start_date !== "0000-00-00" 
        ? new Date(course.start_date) >= now 
        : true // Consider courses with no dates as upcoming
    );
    const past = courses.filter(course => 
      course.start_date && course.start_date !== "0000-00-00" 
        ? new Date(course.start_date) < now 
        : false // Don't consider courses with no dates as past
    );

    // Sort upcoming courses by start date (most imminent first)
    upcoming.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    
    // Sort past courses by start date (most recent first)
    past.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

    setPastCourses(past);

    let filtered = upcoming;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.subtitle && course.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by location
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

    // Filter by price
    if (filterPrice === 'free') {
      filtered = filtered.filter(course => !course.price || course.price === 0);
    } else if (filterPrice === 'paid') {
      filtered = filtered.filter(course => course.price && course.price > 0);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, filterLocation, filterPrice]);

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('authToken');
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
      const token = localStorage.getItem('authToken');
      if (!token) {
        setAlert({type: 'error', message: t('alerts.signInRequired')});
        return;
      }
      const response = await fetch(getApiEndpoint(`/api/courses/courses/${courseToCancel.id}/unenroll/`), {
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
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22A60D]"></div>
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

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E8F5E8] via-[#E6F7E6] to-[#F3E8FF] dark:from-[#22C55E]/5 dark:via-[#10B981]/5 dark:to-[#9333EA]/5 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm scale-110"
            style={{
              backgroundImage: "url('/static/backgrounds/formation_background.webp')"
            }}
          />
        </div>
        {/* Background blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/20 via-[#10B981]/20 to-[#9333EA]/20 blur-3xl transform scale-150"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-black to-[#22C55E] dark:from-white dark:to-[#22A60D] bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="max-w-5xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#22A60D] dark:focus:border-[#22A60D]"
                />
              </div>

              {/* Location Filter */}
              <Dropdown
                options={locationOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                value={filterLocation}
                onChange={(value) => setFilterLocation(value as 'all' | 'online' | 'onsite')}
                icon={MapPin}
                minWidth="240px"
                placeholder={getLocationLabel(filterLocation)}
              />

              {/* Price Filter */}
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
        </div>
      </section>


      {/* Funding/Bonification Info Dropdown */}
      <section className="max-w-4xl mx-auto mt-8 mb-2 px-4">
        <BonificationInfo />
      </section>

      {/* Courses Grid */}
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
              <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-10">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    variant="upcoming"
                    enrolled={isEnrolled(course.id)}
                    onEnroll={() => handleEnrollCourse(course)}
                    onCancel={() => handleCancelEnrollment(course.id)}
                    onViewDetails={() => handleViewDetails(course)}
                    disableEnroll={!course.start_date || course.start_date === "0000-00-00" || !course.end_date || course.end_date === "0000-00-00" || !course.start_time || !course.end_time}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Past Courses Section */}
      {pastCourses.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <Button
                onClick={() => setShowPastCourses(!showPastCourses)}
                variant="outline"
                className="border-[#22A60D] text-[#22A60D] hover:bg-[#22A60D] hover:text-white transition-all duration-300 px-6 py-3 text-lg font-semibold flex items-center gap-2"
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
                
                {pastCourses.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {t("noPastCourses")}
                    </h3>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#22A60D] to-[#22A010] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-white text-[#22A60D] hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-semibold"
              onClick={() => {
                const subject = encodeURIComponent(t("cta.emailSubject"));
                const body = encodeURIComponent(t("cta.emailBody"));
                window.location.href = `mailto:ordinalysoftware@gmail.com?subject=${subject}&body=${body}`;
              }}
            >
              <Mail className="w-5 h-5 mr-2" />
              {t("cta.contact")}
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadCatalog}
              className="bg-white text-[#623CEA] hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-semibold"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {t("cta.catalog")}
            </Button>
          </div>
        </div>
      </section>

      {/* Enrollment Confirmation Modal */}
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
      {/* Enrollment Success Modal after Stripe redirect */}
      <CourseEnrollmentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        courseTitle={successCourseTitle}
        t={t}
      />

      {/* Enrollment Cancellation Modal */}
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

      {/* Cancel Enrollment Success Modal */}
      <CourseCancelEnrollmentSuccessModal
        isOpen={showCancelSuccessModal}
        onClose={() => setShowCancelSuccessModal(false)}
        t={t}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        courseTitle={courseForAuth?.title}
      />

      {/* Course Details Modal */}
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FormationPage;
