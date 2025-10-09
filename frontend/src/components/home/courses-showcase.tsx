"use client";

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ErrorCard from "@/components/ui/error-card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar, Euro, ArrowRight, BookOpen } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import AuthModal from "@/components/auth/auth-modal";

interface Course {
  id: number;
  slug?: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  price?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  periodicity: string;
  max_attendants: number;
  enrolled_count: number;
  duration_hours: number;
  formatted_schedule: string;
  weekday_display: string[];
  next_occurrences: string[];
}

interface CoursesShowcaseProps {
  limit?: number;
  showUpcomingOnly?: boolean;
  onCourseClick?: (course: Course) => void;
  onViewAllClick?: () => void;
}

export default function CoursesShowcase(props: CoursesShowcaseProps) {
  const { limit = 3, showUpcomingOnly = true, onCourseClick } = props;
  const t = useTranslations("home.courses");
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on mount
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    setIsAuthenticated(!!token);
  }, []);
  // Removed enrollments and authentication state for homepage

  const { courses, isLoading, error, refetch } = useCourses({
    limit: limit,
    upcoming: showUpcomingOnly,
  });

  // Removed enrollments fetching effect for homepage

  const handleImageError = useCallback((courseId: number) => {
    setImageErrors(prev => new Set(prev).add(courseId));
  }, []);

  const handleCourseClick = useCallback((course: Course) => {
    if (onCourseClick) {
      onCourseClick(course);
    } else {
    // Navigate to formation page with course highlighted/modal opened
  router.push(`/formation/${course.slug ?? course.id}`);
    }
  }, [onCourseClick, router]);

  const handleSignUpClick = useCallback((e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    if (isAuthenticated) {
    router.push(`/formation/${course.slug ?? course.id}`);
      } else {
      setSelectedCourse(course);
      setIsAuthModalOpen(true);
    }
  }, [isAuthenticated, router]);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0000-00-00") {
      return t('noSpecificDate');
    }
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch {
      return t('noSpecificDate');
    }
  };

  const getAvailabilityBadge = (course: Course) => {
    // If any required field is missing, show 'in progress'
    const missing = !course.start_date || course.start_date === "0000-00-00" ||
      !course.end_date || course.end_date === "0000-00-00" ||
      !course.start_time || !course.end_time ||
      !course.location || !course.description;
    const now = new Date();
    const endDate = course.end_date && course.end_date !== "0000-00-00" ? new Date(course.end_date) : null;
    if (missing) {
      return { text: t('inProgress', { defaultValue: 'In Progress' }), variant: 'default' as const };
    }
    if (endDate && endDate < now) {
      return { text: t('finished', { defaultValue: 'Finished' }), variant: 'finished' as const };
    }
    const percentage = (course.enrolled_count / course.max_attendants) * 100;
    if (percentage >= 90) return { text: t('almostFull'), variant: 'destructive' as const };
    if (percentage >= 70) return { text: t('fillingFast'), variant: 'default' as const };
    return { text: t('available'), variant: 'secondary' as const };
  };

  if (error) {
    return (
      <ErrorCard
        title={t('errorTitle', { defaultValue: 'Error Loading Courses' })}
        message={t('errorMessage', { defaultValue: 'Failed to load courses' })}
        buttonText={t('retryButton', { defaultValue: 'Try Again' })}
        onRetry={refetch}
      />
    );
  }

  if (courses.length === 0 && !isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#22A60D] dark:text-[#7CFC00]">
              {t('upcomingTitle', { defaultValue: 'Upcoming Courses' })}
            </h2>
            <p className="text-xl text-gray-800 dark:text-gray-200 max-w-3xl mx-auto">
              {t('upcomingDescription', { defaultValue: 'Discover our upcoming professional training courses' })}
            </p>
          </div>
          <div className="text-center">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('noCoursesTitle', { defaultValue: 'No Upcoming Courses' })}
              </h3>
              <p className="text-gray-800 dark:text-gray-200 mb-6">
                {t('noCoursesMessage', { defaultValue: 'Stay tuned for new course announcements!' })}
              </p>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/formation')}
                  className="flex items-center gap-2"
                >
                  {t('notifyButton', { defaultValue: 'Get Notified' })}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#22A60D] dark:text-[#7CFC00]">
            {t('showcaseTitle', { defaultValue: 'Featured Courses' })}
          </h2>
          <p className="text-xl text-gray-800 dark:text-gray-200 max-w-3xl mx-auto">
            {t('showcaseDescription', { defaultValue: 'Join our upcoming professional training courses and advance your career' })}
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {Array.from({ length: limit }).map((_, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {courses.map((course) => {
              const availabilityBadge = getAvailabilityBadge(course);
              const isInProgress = availabilityBadge.text === t('inProgress', { defaultValue: 'In Progress' }) && availabilityBadge.variant === 'default';
              // Removed isUserEnrolled logic for homepage
              
              return (
                <Card 
                  key={course.id} 
                  className={
                    `bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl cursor-pointer group w-full ` +
                    (isInProgress ? 'ring-4 ring-[#FFB800] border-[#FFB800] shadow-2xl scale-[1.025] z-10' : '')
                  }
                  style={isInProgress ? { boxShadow: '0 0 0 4px #FFB80033, 0 8px 32px 0 #FFB80044' } : {}}
                  onClick={() => handleCourseClick(course)}
                >
                  <CardHeader className="pb-4">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-[#22A60D]/10 to-[#46B1C9]/10">
                      {!imageErrors.has(course.id) ? (
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={() => handleImageError(course.id)}
                        />
                      ) : (
                        // Fallback content when image fails
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 bg-[#22A60D]/20 rounded-full flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-[#22A60D]" />
                            </div>
                            <p className="text-sm font-medium px-4">
                              {course.title.replace(/🌐 |🐍 |📊 |📱 |☁️ |🎨 |🤖 |🔒 |🔗 |💻 |📈 |🔧 /g, '').split(' ').slice(0, 3).join(' ')}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge variant={availabilityBadge.variant}>
                          {availabilityBadge.text}
                        </Badge>
                      </div>

                      {course.price && (
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-1">
                          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                            <Euro className="w-4 h-4" />
                            {/* {Math.round(Number(course.price))} */}
                            {course.price}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                        <CardTitle className="text-xl text-gray-900 dark:text-white group-hover:text-[#22A60D] transition-colors break-words whitespace-pre-line">
                        {course.title.replace(/🌐 |🐍 |📊 |📱 |☁️ |🎨 |🤖 |🔒 |🔗 |💻 |📈 |🔧 /g, '')}
                      </CardTitle>
                      {course.subtitle && (
                        <CardDescription className="text-gray-800 dark:text-gray-200 line-clamp-2">
                          {course.subtitle}
                        </CardDescription>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Course Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {course.start_date ? formatDate(course.start_date) : t('datesSoon', { defaultValue: 'Dates coming soon' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {course.duration_hours ? `${course.duration_hours}h` : t('durationSoon', { defaultValue: 'Duration TBA' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 col-span-2">                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          {typeof course.location === 'string' && course.location.trim() !== '' && course.location !== 'null' ? (
                            (/online|virtual/i.test(course.location)
                              ? <span className="truncate underline" title={course.location}>{course.location}</span>
                              : <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.location)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="truncate underline hover:text-[#22A60D]"
                                  title={course.location}
                                >
                                  {course.location}
                                </a>
                            )
                          ) : (
                            <span className="truncate">
                              {t('locationSoon')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Weekdays */}
                      {course.weekday_display.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {course.weekday_display.map((day) => (
                            <Badge key={day} variant="outline" className="text-xs">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Progress Bar */}
                      {new Date(course.start_date) > new Date() && new Date(course.end_date) > new Date() && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-800 dark:text-gray-200">
                            <span>{course.enrolled_count} {t('enrolled')}</span>
                            <span>{course.max_attendants} {t('max')}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-[#22A60D] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((course.enrolled_count / course.max_attendants) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        className="w-full bg-[#22A60D] hover:bg-[#1e8f0a] dark:bg-[#22A60D] dark:hover:bg-[#1a7d08] text-white dark:text-white transition-all duration-300 group shadow-sm hover:shadow-md"
                        onClick={(e) => handleSignUpClick(e, course)}
                      >
                        <>
                          <span>{t('moreInfo', { defaultValue: 'More Info' })}</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* View All Courses Button */}
        {courses.length > 0 && (
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/formation')}
              className="bg-transparent border-2 border-[#22A60D] text-[#22A60D] hover:bg-[#22A60D] hover:text-white dark:border-[#22A60D] dark:text-[#22A60D] dark:hover:bg-[#22A60D] dark:hover:text-white transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:shadow-[#22A60D]/20 group"
            >
              {t('viewAllCourses')}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        courseTitle={selectedCourse?.title.replace(/🌐 |🐍 |📊 |📱 |☁️ |🎨 |🤖 |🔒 |🔗 |💻 |📈 |🔧 /g, '')}
      />
    </section>
  );
}
