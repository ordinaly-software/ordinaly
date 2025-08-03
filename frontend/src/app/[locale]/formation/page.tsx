"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/home/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import Alert from "@/components/ui/alert";
import AuthModal from "@/components/auth-modal";
import CourseDetailsModal from "@/components/course-details-modal";
import Image from "next/image";
import {
  Search,
  Calendar,
  MapPin,
  Users,
  BookOpen,
  Award,
  ArrowRight,
  Mail,
  ChevronDown,
  Check,
  GraduationCap,
  UserCheck,
  UserX,
  CalendarDays,
  Euro
} from "lucide-react";

interface Course {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  price?: number;
  location: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  periodicity: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  timezone: string;
  weekdays: number[];
  week_of_month?: number | null;
  interval: number;
  exclude_dates: string[];
  max_attendants: number;
  created_at: string;
  updated_at: string;
  duration_hours?: number;
  formatted_schedule?: string;
  schedule_description?: string;
  next_occurrences?: string[];
  weekday_display?: string[];
}

interface Enrollment {
  id: number;
  course: number;
  user: number;
  enrolled_at: string;
}

// Custom image loader to handle potential URL issues
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src || src === 'undefined' || src === 'null') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xMiA2LTItMiA0IDRoNCIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
  }
  return `${src}?w=${width}&q=${quality || 75}`;
};

const FormationPage = () => {
  const t = useTranslations("formation");
  const [isDark, setIsDark] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [pastCourses, setPastCourses] = useState<Course[]>([]);
  const [showPastCourses, setShowPastCourses] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState<'all' | 'online' | 'onsite'>('all');
  const [filterPrice, setFilterPrice] = useState<'all' | 'free' | 'paid'>('all');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
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

    // Check authentication
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);

    fetchCourses();
    if (token) {
      fetchEnrollments();
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
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showLocationDropdown && !target.closest('.location-dropdown-container')) {
        setShowLocationDropdown(false);
      }
      if (showPriceDropdown && !target.closest('.price-dropdown-container')) {
        setShowPriceDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLocationDropdown, showPriceDropdown]);

  useEffect(() => {
    const now = new Date();
    const upcoming = courses.filter(course => new Date(course.start_date) >= now);
    const past = courses.filter(course => new Date(course.start_date) < now);

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
      filtered = filtered.filter(course => 
        course.location.toLowerCase().includes('online') || 
        course.location.toLowerCase().includes('virtual')
      );
    } else if (filterLocation === 'onsite') {
      filtered = filtered.filter(course => 
        !course.location.toLowerCase().includes('online') && 
        !course.location.toLowerCase().includes('virtual')
      );
    }

    // Filter by price
    if (filterPrice === 'free') {
      filtered = filtered.filter(course => !course.price || course.price === 0);
    } else if (filterPrice === 'paid') {
      filtered = filtered.filter(course => course.price && course.price > 0);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, filterLocation, filterPrice]);

  const fetchCourses = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/courses/courses/`);
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        console.error('Failed to load courses');
        setAlert({type: 'error', message: t('alerts.failedToLoadCourses')});
      }
    } catch (err) {
      console.error('Network error while loading courses:', err);
      setAlert({type: 'error', message: t('alerts.networkErrorLoadingCourses')});
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/courses/enrollments/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
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

  const handleEnrollmentConfirm = async () => {
    if (!selectedCourse) return;

    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/courses/courses/${selectedCourse.id}/enroll/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        setAlert({type: 'success', message: t('alerts.enrollmentSuccess', { courseTitle: selectedCourse.title })});
        setShowEnrollModal(false);
        setSelectedCourse(null);
        fetchEnrollments(); // Refresh enrollments
      } else {
        const errorData = await response.json();
        setAlert({type: 'error', message: t('alerts.enrollmentFailed')});
      }
    } catch (err) {
      console.error('Network error during enrollment:', err);
      setAlert({type: 'error', message: t('alerts.networkError')});
    }
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/courses/courses/${courseToCancel.id}/unenroll/`, {
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
        fetchEnrollments(); // Refresh enrollments
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        console.error('Unenroll error:', response.status, errorData);
        
        if (response.status === 400) {
          setAlert({type: 'warning', message: t('alerts.notEnrolled')});
        } else if (response.status === 401) {
          setAlert({type: 'error', message: t('alerts.authenticationFailed')});
        } else {
          setAlert({type: 'error', message: t('alerts.cancelEnrollmentFailed')});
        }
      }
    } catch (err) {
      console.error('Network error during cancellation:', err);
      setAlert({type: 'error', message: t('alerts.networkError')});
    }
  };

  const isEnrolled = (courseId: number) => {
    return enrollments.some(enrollment => enrollment.course === courseId);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
    
    // If there was a course waiting for authentication, proceed with enrollment
    if (courseForAuth) {
      setSelectedCourse(courseForAuth);
      setShowEnrollModal(true);
      setCourseForAuth(null);
    }
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
        <Navbar isDark={isDark} setIsDark={setIsDark} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29BF12]"></div>
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

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-[#29BF12]/10 dark:via-[#46B1C9]/10 dark:to-[#623CEA]/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#29BF12] via-[#46B1C9] to-[#623CEA] bg-clip-text text-transparent">
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
                  className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#29BF12] dark:focus:border-[#29BF12]"
                />
              </div>

              {/* Location Filter */}
              <div className="relative location-dropdown-container">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <button
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    className="h-12 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#29BF12] dark:focus:border-[#29BF12] text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-between min-w-[160px] focus:outline-none focus:ring-2 focus:ring-[#29BF12]/20"
                  >
                    <span className="truncate">{getLocationLabel(filterLocation)}</span>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        showLocationDropdown ? 'rotate-180' : 'rotate-0'
                      }`} 
                    />
                  </button>
                </div>

                {showLocationDropdown && (
                  <div className="absolute top-full left-6 mt-2 w-[160px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {locationOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterLocation(option.value);
                          setShowLocationDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-150 flex items-center justify-between ${
                          filterLocation === option.value 
                            ? 'bg-[#29BF12]/10 text-[#29BF12] dark:bg-[#29BF12]/20' 
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        <span className="font-medium">{option.label}</span>
                        {filterLocation === option.value && (
                          <Check className="h-4 w-4 text-[#29BF12]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Filter */}
              <div className="relative price-dropdown-container">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-gray-400" />
                  <button
                    onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                    className="h-12 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#29BF12] dark:focus:border-[#29BF12] text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-between min-w-[140px] focus:outline-none focus:ring-2 focus:ring-[#29BF12]/20"
                  >
                    <span className="truncate">{getPriceLabel(filterPrice)}</span>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        showPriceDropdown ? 'rotate-180' : 'rotate-0'
                      }`} 
                    />
                  </button>
                </div>

                {showPriceDropdown && (
                  <div className="absolute top-full left-6 mt-2 w-[140px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {priceOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterPrice(option.value);
                          setShowPriceDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-150 flex items-center justify-between ${
                          filterPrice === option.value 
                            ? 'bg-[#29BF12]/10 text-[#29BF12] dark:bg-[#29BF12]/20' 
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        <span className="font-medium">{option.label}</span>
                        {filterPrice === option.value && (
                          <Check className="h-4 w-4 text-[#29BF12]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
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
              {filteredCourses.length > 0 && (
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  {t("upcomingCourses")}
                </h3>
              )}
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCourses.map((course) => {
                  const enrolled = isEnrolled(course.id);
                return (
                  <Card
                    key={course.id}
                    className="group relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#29BF12] transition-all duration-500 hover:shadow-2xl hover:shadow-[#29BF12]/10 transform hover:-translate-y-2"
                  >
                    <div className="relative">
                      {/* Course Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          loader={imageLoader}
                          src={course.image}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            console.error('Course image failed to load:', course.image);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Enrollment Status Badge */}
                        {enrolled && (
                          <div className="absolute top-4 right-4 z-10">
                            <div className="bg-[#29BF12] text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              {t("enrolled")}
                            </div>
                          </div>
                        )}

                        {/* Price Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {course.price ? `€${course.price}` : t("free")}
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        {/* Course Title */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#29BF12] transition-colors duration-300 line-clamp-2">
                          {course.title}
                        </h3>

                        {/* Course Subtitle */}
                        {course.subtitle && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
                            {course.subtitle}
                          </p>
                        )}

                        {/* Course Description */}
                        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-3">
                          {course.description}
                        </p>

                        {/* Course Meta Information */}
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4 text-[#29BF12]" />
                            <span>{new Date(course.start_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4 text-[#29BF12]" />
                            <span>{course.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4 text-[#29BF12]" />
                            <span>{t("maxAttendeesCount", { count: course.max_attendants })}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                          {enrolled ? (
                            <Button
                              onClick={() => handleCancelEnrollment(course.id)}
                              variant="outline"
                              className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 h-12"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              {t("cancelEnrollment")}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleEnrollCourse(course)}
                              className="w-full bg-gradient-to-r from-[#29BF12] to-[#22A010] hover:from-[#22A010] hover:to-[#1E8B0C] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-12"
                            >
                              <GraduationCap className="w-4 h-4 mr-2" />
                              {t("enroll")}
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            onClick={() => handleViewDetails(course)}
                            className="w-full border-[#29BF12] text-[#29BF12] hover:bg-[#29BF12] hover:text-white transition-all duration-300 h-12"
                          >
                            {t("viewDetails")}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </div>

                    {/* Hover Effect Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#29BF12]/5 to-[#623CEA]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </Card>
                );
              })}
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
                className="border-[#29BF12] text-[#29BF12] hover:bg-[#29BF12] hover:text-white transition-all duration-300 px-6 py-3 text-lg font-semibold flex items-center gap-2"
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
                  {pastCourses.map((course) => {
                    const enrolled = isEnrolled(course.id);
                    return (
                      <Card
                        key={course.id}
                        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75 hover:opacity-100 transition-all duration-500"
                      >
                        <div className="relative">
                          {/* Course Image */}
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              loader={imageLoader}
                              src={course.image}
                              alt={course.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover"
                              onError={(e) => {
                                console.error('Course image failed to load:', course.image);
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            
                            {/* Past Course Badge */}
                            <div className="absolute top-4 right-4 z-10">
                              <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {t("finished")}
                              </div>
                            </div>

                            {/* Price Badge */}
                            <div className="absolute top-4 left-4 z-10">
                              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {course.price ? `€${course.price}` : t("free")}
                              </div>
                            </div>
                          </div>

                          <CardContent className="p-6">
                            {/* Course Title */}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                              {course.title}
                            </h3>

                            {/* Course Subtitle */}
                            {course.subtitle && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
                                {course.subtitle}
                              </p>
                            )}

                            {/* Course Description */}
                            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-3">
                              {course.description}
                            </p>

                            {/* Course Meta Information */}
                            <div className="space-y-2 mb-6">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="w-4 h-4 text-[#29BF12]" />
                                <span>{new Date(course.start_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="w-4 h-4 text-[#29BF12]" />
                                <span>{course.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Users className="w-4 h-4 text-[#29BF12]" />
                                <span>{t("maxAttendeesCount", { count: course.max_attendants })}</span>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex flex-col gap-3">
                              <Button
                                onClick={() => handleViewDetails(course)}
                                variant="outline"
                                className="w-full border-gray-400 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300 h-12"
                              >
                                {t("viewDetails")}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    );
                  })}
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#29BF12] to-[#22A010] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-white text-[#29BF12] hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-semibold"
            >
              <Mail className="w-5 h-5 mr-2" />
              {t("cta.contact")}
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#29BF12] transition-all duration-300 px-8 py-3 text-lg font-semibold"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {t("cta.catalog")}
            </Button>
          </div>
        </div>
      </section>

      {/* Enrollment Confirmation Modal */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => {
          setShowEnrollModal(false);
          setSelectedCourse(null);
        }}
        title={selectedCourse ? `${t("enrollment.confirm")} - ${selectedCourse.title}` : t("enrollment.confirm")}
        showHeader={true}
      >
        {selectedCourse && (
          <div className="space-y-6">
            {/* Course Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("enrollment.courseDetails")}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarDays className="w-4 h-4 mr-2 text-[#29BF12]" />
                    <span className="font-medium">{t("date")}:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{new Date(selectedCourse.start_date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-[#29BF12]" />
                    <span className="font-medium">{t("location")}:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedCourse.location}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Euro className="w-4 h-4 mr-2 text-[#29BF12]" />
                    <span className="font-medium">{t("price")}:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {selectedCourse.price ? `€${selectedCourse.price}` : t("free")}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-[#29BF12]" />
                    <span className="font-medium">{t("maxAttendants")}:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedCourse.max_attendants}</span>
                  </div>
                </div>
              </div>
              
              {selectedCourse.description && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedCourse.description}
                  </p>
                </div>
              )}
            </div>

            {/* Confirmation Message */}
            <div className="text-center py-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {t("enrollment.confirmMessage")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("enrollment.paymentNote")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowEnrollModal(false)}
                className="px-6 h-10"
              >
                {t("enrollment.cancel")}
              </Button>
              <Button
                onClick={handleEnrollmentConfirm}
                className="bg-[#29BF12] hover:bg-[#22A010] text-white px-6 h-10 flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                {t("enrollment.confirmEnroll")}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Enrollment Cancellation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCourseToCancel(null);
        }}
        title={t("cancellation.title")}
        showHeader={true}
      >
        {courseToCancel && (
          <div className="space-y-6">
            {/* Warning Message */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <UserX className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    {t("cancellation.warning")}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {t("cancellation.warningMessage", { courseTitle: courseToCancel.title })}
                  </p>
                </div>
              </div>
            </div>

            {/* Course Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {courseToCancel.title}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 text-[#29BF12]" />
                    <span className="font-medium">{t("date")}:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{new Date(courseToCancel.start_date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-[#29BF12]" />
                    <span className="font-medium">{t("location")}:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{courseToCancel.location}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Euro className="w-4 h-4 mr-2 text-[#29BF12]" />
                    <span className="font-medium">{t("price")}:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {courseToCancel.price ? `€${courseToCancel.price}` : t("free")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="text-center py-2">
              <p className="text-gray-700 dark:text-gray-300">
                {t("cancellation.confirmMessage")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCancelModal(false)}
                className="px-6 h-10"
              >
                {t("cancellation.keepEnrollment")}
              </Button>
              <Button
                onClick={handleCancelEnrollmentConfirm}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white px-6 h-10 flex items-center gap-2"
              >
                <UserX className="w-4 h-4" />
                {t("cancellation.confirmCancel")}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
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
      <Footer isDark={isDark} />
    </div>
  );
};

export default FormationPage;
