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
  UserX
} from "lucide-react";

interface Course {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  price?: number;
  location: string;
  date: string;
  max_attendants: number;
  created_at: string;
}

interface Enrollment {
  id: number;
  course: number;
  user: number;
  enrolled_at: string;
}

const FormationPage = () => {
  const t = useTranslations("formation");
  const [isDark, setIsDark] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState<'all' | 'online' | 'onsite'>('all');
  const [filterPrice, setFilterPrice] = useState<'all' | 'free' | 'paid'>('all');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);

  // Enrollment form state
  const [enrollmentForm, setEnrollmentForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    experience: '',
    motivation: ''
  });

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
    let filtered = courses;

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
      const response = await fetch(`${apiUrl}/api/courses/`);
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        console.error('Failed to load courses');
        setAlert({type: 'error', message: 'Failed to load courses'});
      }
    } catch (err) {
      console.error('Network error while loading courses:', err);
      setAlert({type: 'error', message: 'Network error while loading courses'});
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/enrollments/`, {
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
      setAlert({type: 'info', message: 'Please sign in to enroll in courses'});
      return;
    }

    setSelectedCourse(course);
    setShowEnrollModal(true);
  };

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) return;

    // Basic validation
    if (!enrollmentForm.name.trim() || !enrollmentForm.email.trim() || !enrollmentForm.motivation.trim()) {
      setAlert({type: 'error', message: 'Please fill in all required fields'});
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/enrollments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          course: selectedCourse.id,
          ...enrollmentForm
        }),
      });

      if (response.ok) {
        setAlert({type: 'success', message: `Successfully enrolled in ${selectedCourse.title}!`});
        setEnrollmentForm({
          name: '',
          email: '',
          phone: '',
          company: '',
          experience: '',
          motivation: ''
        });
        setShowEnrollModal(false);
        setSelectedCourse(null);
        fetchEnrollments(); // Refresh enrollments
      } else {
        const errorData = await response.json();
        setAlert({type: 'error', message: errorData.detail || 'Failed to enroll. Please try again.'});
      }
    } catch (err) {
      console.error('Network error during enrollment:', err);
      setAlert({type: 'error', message: 'Network error. Please check your connection.'});
    }
  };

  const handleCancelEnrollment = async (courseId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const enrollment = enrollments.find(e => e.course === courseId);
      if (!enrollment) return;

      const response = await fetch(`${apiUrl}/api/enrollments/${enrollment.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        setAlert({type: 'success', message: 'Enrollment cancelled successfully'});
        fetchEnrollments(); // Refresh enrollments
      } else {
        setAlert({type: 'error', message: 'Failed to cancel enrollment'});
      }
    } catch (err) {
      console.error('Network error during cancellation:', err);
      setAlert({type: 'error', message: 'Network error. Please check your connection.'});
    }
  };

  const isEnrolled = (courseId: number) => {
    return enrollments.some(enrollment => enrollment.course === courseId);
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
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
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
                            <span>{course.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4 text-[#29BF12]" />
                            <span>{course.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4 text-[#29BF12]" />
                            <span>{t("maxAttendants", { count: course.max_attendants })}</span>
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
          )}
        </div>
      </section>

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

      {/* Enrollment Modal */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => {
          setShowEnrollModal(false);
          setSelectedCourse(null);
          setEnrollmentForm({
            name: '',
            email: '',
            phone: '',
            company: '',
            experience: '',
            motivation: ''
          });
        }}
        title={selectedCourse ? `${t("enrollment.title")} - ${selectedCourse.title}` : t("enrollment.title")}
        showHeader={true}
      >
        <form onSubmit={handleEnrollmentSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("enrollment.name")} *
              </label>
              <Input
                value={enrollmentForm.name}
                onChange={(e) => setEnrollmentForm(prev => ({...prev, name: e.target.value}))}
                placeholder={t("enrollment.namePlaceholder")}
                required
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("enrollment.email")} *
              </label>
              <Input
                type="email"
                value={enrollmentForm.email}
                onChange={(e) => setEnrollmentForm(prev => ({...prev, email: e.target.value}))}
                placeholder={t("enrollment.emailPlaceholder")}
                required
                className="h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("enrollment.phone")}
              </label>
              <Input
                type="tel"
                value={enrollmentForm.phone}
                onChange={(e) => setEnrollmentForm(prev => ({...prev, phone: e.target.value}))}
                placeholder={t("enrollment.phonePlaceholder")}
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("enrollment.company")}
              </label>
              <Input
                value={enrollmentForm.company}
                onChange={(e) => setEnrollmentForm(prev => ({...prev, company: e.target.value}))}
                placeholder={t("enrollment.companyPlaceholder")}
                className="h-12"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("enrollment.experience")}
            </label>
            <Textarea
              value={enrollmentForm.experience}
              onChange={(e) => setEnrollmentForm(prev => ({...prev, experience: e.target.value}))}
              placeholder={t("enrollment.experiencePlaceholder")}
              rows={3}
              className="resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("enrollment.motivation")} *
            </label>
            <Textarea
              value={enrollmentForm.motivation}
              onChange={(e) => setEnrollmentForm(prev => ({...prev, motivation: e.target.value}))}
              placeholder={t("enrollment.motivationPlaceholder")}
              rows={4}
              required
              className="resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowEnrollModal(false)}
              className="px-6"
            >
              {t("enrollment.cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-[#29BF12] hover:bg-[#22A010] text-white px-6"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              {t("enrollment.submit")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Footer */}
      <Footer isDark={isDark} />
    </div>
  );
};

export default FormationPage;
