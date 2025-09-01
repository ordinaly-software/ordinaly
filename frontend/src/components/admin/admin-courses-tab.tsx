"use client";

import { useState } from "react";
import { useCourses } from "@/hooks/useCourses";
import type { CourseFormData } from "./admin-course-edit-modal";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminCourseCard from "./admin-course-card";
import Alert from "@/components/ui/alert";
import { getApiEndpoint, API_ENDPOINTS } from "@/lib/api-config";
import { 
  Plus, 
  Trash2, 
  Search,
  ArrowUpDown,
} from "lucide-react";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { Dropdown, DropdownOption } from "@/components/ui/dropdown";
import CourseEditModal from "./admin-course-edit-modal";
import CourseVisualizationModal from "./admin-course-modal";

export interface Course {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  price?: string | null;
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
  enrolled_count: number;
  created_at: string;
  updated_at: string;
  duration_hours?: number;
  formatted_schedule?: string;
  schedule_description?: string;
  next_occurrences?: string[];
  weekday_display?: string[];
  draft?: boolean;
}

interface Enrollment {
  id: number;
  user: number;
  course: number;
  enrolled_at: string;
  user_details?: {
    name: string;
    surname: string;
    email: string;
    company: string;
  };
}

type SortOption = 'title' | 'start_date' | 'end_date' | 'enrolled_count' | 'max_attendants' | 'created_at';
type SortOrder = 'asc' | 'desc';

const AdminCoursesTab = () => {
  const t = useTranslations("admin.courses");
  const tAdmin = useTranslations("admin");
  const locale = useLocale();

  // Helper function to get proper date locale
  const getDateLocale = (locale: string): string => {
    switch (locale) {
      case 'es':
        return 'es-ES';
      case 'en':
        return 'en-US';
      default:
        return 'en-US';
    }
  };

  const dateLocale = getDateLocale(locale);

  // Sort options for dropdown
  const sortOptions: DropdownOption[] = [
    { value: 'start_date', label: t("sorting.startDate") },
    { value: 'title', label: t("sorting.title") },
    { value: 'end_date', label: t("sorting.endDate") },
    { value: 'enrolled_count', label: t("sorting.enrollments") },
    { value: 'max_attendants', label: t("sorting.capacity") },
    { value: 'created_at', label: t("sorting.created") }
  ];

  // Days of the week with internationalization
  const daysOfWeek = [
    { key: 'monday', short: t("form.weekdays.monday.short"), full: t("form.weekdays.monday.full") },
    { key: 'tuesday', short: t("form.weekdays.tuesday.short"), full: t("form.weekdays.tuesday.full") },
    { key: 'wednesday', short: t("form.weekdays.wednesday.short"), full: t("form.weekdays.wednesday.full") },
    { key: 'thursday', short: t("form.weekdays.thursday.short"), full: t("form.weekdays.thursday.full") },
    { key: 'friday', short: t("form.weekdays.friday.short"), full: t("form.weekdays.friday.full") },
    { key: 'saturday', short: t("form.weekdays.saturday.short"), full: t("form.weekdays.saturday.full") },
    { key: 'sunday', short: t("form.weekdays.sunday.short"), full: t("form.weekdays.sunday.full") }
  ];

  // Helper function to convert weekday indices to internationalized names
  const formatWeekdays = (weekdays: number[]): string => {
    if (!weekdays || weekdays.length === 0) return '';
    return weekdays
      .sort((a, b) => a - b) // Sort weekdays to display in order
  .map(idx => daysOfWeek[idx]?.short || '')
      .filter(day => day !== '') // Remove any invalid indices
      .join(', ');
  };
  // Use admin mode to see drafts
  const { courses, isLoading, refetch } = useCourses({}, true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);
  const [courseEnrollments, setCourseEnrollments] = useState<Enrollment[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('start_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);

  const [formData, setFormData] = useState<CourseFormData>({
  title: "",
  subtitle: "",
  description: "",
  image: "",
  price: "",
  location: "",
  start_date: "",
  end_date: "",
  start_time: "09:00",
  end_time: "17:00",
  periodicity: "once",
  timezone: "Europe/Madrid",
  weekdays: [],
  week_of_month: null,
  interval: 1,
  exclude_dates: [],
  max_attendants: "",
  draft: false
  });

  const resetForm = () => {
  setFormData({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    price: "",
    location: "",
    start_date: "",
    end_date: "",
    start_time: "09:00",
    end_time: "17:00",
    periodicity: "once" as 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom',
    timezone: "Europe/Madrid",
    weekdays: [] as number[],
    week_of_month: null as number | null,
    interval: 1,
    exclude_dates: [] as string[],
    max_attendants: "",
    draft: false
  });
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEdit = (course: Course) => {
    setCurrentCourse(course);
  setFormData({
    title: course.title,
    subtitle: course.subtitle || "",
    description: course.description,
    image: course.image || "",
    price: course.price == null ? "" : String(course.price),
    location: course.location,
    start_date: course.start_date == null ? "" : course.start_date,
    end_date: course.end_date == null ? "" : course.end_date,
    start_time: course.start_time == null ? "" : course.start_time,
    end_time: course.end_time == null ? "" : course.end_time,
    periodicity: course.periodicity || "once",
    timezone: course.timezone || "Europe/Madrid",
    weekdays: course.weekdays || [],
    week_of_month: course.week_of_month == null ? null : course.week_of_month,
    interval: course.interval == null ? 1 : course.interval,
    exclude_dates: course.exclude_dates || [],
    max_attendants: course.max_attendants != null ? String(course.max_attendants) : "",
    draft: typeof course.draft === 'boolean' ? course.draft : false
  });
    setPreviewUrl(course.image);
    setSelectedFile(null); // Ensure no file is selected by default when editing
    setShowEditModal(true);
  };

  const handleDelete = (course: Course) => {
    setCurrentCourse(course);
    setShowDeleteModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedCourses.length === 0) {
      setAlert({type: 'warning', message: t('messages.selectToDelete')});
      return;
    }
    setShowDeleteModal(true);
  };

  const handleViewCourse = async (course: Course) => {
    setSelectedCourseForModal(course);
    setShowCourseModal(true);
    setIsLoadingEnrollments(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiEndpoint('/api/courses/enrollments/'), {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const enrollments = await response.json();
        const courseEnrollments = enrollments.filter((enrollment: Enrollment) => 
          enrollment.course === course.id
        );
        setCourseEnrollments(courseEnrollments);
      } else {
        setAlert({type: 'error', message: 'Failed to fetch course enrollments'});
        setCourseEnrollments([]);
      }
    } catch {
      
      setAlert({type: 'error', message: 'Network error while fetching enrollments'});
      setCourseEnrollments([]);
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  const isCourseFinished = (course: Course) => {
    // If no end_date or invalid, course is NOT finished
    if (!course.end_date || course.end_date === "0000-00-00") return false;
    const endDate = new Date(course.end_date);
    if (isNaN(endDate.getTime())) return false;
    const now = new Date();
    return endDate < now;
  };

  const sortCourses = (courses: Course[]) => {
    const sorted = [...courses].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'start_date':
          aValue = new Date(a.start_date);
          bValue = new Date(b.start_date);
          break;
        case 'end_date':
          aValue = new Date(a.end_date);
          bValue = new Date(b.end_date);
          break;
        case 'enrolled_count':
          aValue = a.enrolled_count || 0;
          bValue = b.enrolled_count || 0;
          break;
        case 'max_attendants':
          aValue = a.max_attendants;
          bValue = b.max_attendants;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Separate finished and active courses
    const activeCourses = sorted.filter(course => !isCourseFinished(course));
    const finishedCourses = sorted.filter(course => isCourseFinished(course));

    // Return active courses first, then finished courses
    return [...activeCourses, ...finishedCourses];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        setAlert({type: 'error', message: t('messages.imageSizeLimit1MB')});
        return;
      }
      if (!file.type.startsWith('image/')) {
        setAlert({type: 'error', message: t('messages.imageFileOnly')});
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const submitCourse = async (isEdit: boolean) => {
    try {
      // Basic validation
      const today = new Date();
      today.setHours(0,0,0,0);
      if (!formData.title.trim()) {
        setAlert({type: 'error', message: t('messages.validation.titleRequired')});
        return;
      }
      if (!formData.description.trim()) {
        setAlert({type: 'error', message: t('messages.validation.descriptionRequired')});
        return;
      }
      if (!formData.max_attendants || parseInt(String(formData.max_attendants)) < 1) {
        setAlert({type: 'error', message: t('messages.validation.maxAttendantsInvalid')});
        return;
      }
      if (formData.price && parseFloat(String(formData.price)) < 0.01) {
        setAlert({type: 'error', message: t('messages.validation.priceInvalid')});
        return;
      }
      if (!isEdit && !selectedFile) {
        setAlert({type: 'error', message: t('messages.validation.imageRequired')});
        return;
      }
      // Prevent start_date or end_date in the past
      if (formData.start_date) {
        const startDate = new Date(formData.start_date);
        startDate.setHours(0,0,0,0);
        if (startDate < today) {
          setAlert({type: 'error', message: t('messages.validation.startDatePast') || 'Start date cannot be in the past.'});
          return;
        }
      }
      if (formData.end_date) {
        const endDate = new Date(formData.end_date);
        endDate.setHours(0,0,0,0);
        if (endDate < today) {
          setAlert({type: 'error', message: t('messages.validation.endDatePast') || 'End date cannot be in the past.'});
          return;
        }
        if (formData.start_date) {
          const startDate = new Date(formData.start_date);
          startDate.setHours(0,0,0,0);
          if (endDate < startDate) {
            setAlert({type: 'error', message: t('messages.validation.endDateBeforeStart') || 'End date cannot be before start date.'});
            return;
          }
        }
      }

      const token = localStorage.getItem('authToken');
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('description', formData.description);
      if (formData.price) {
        formDataToSend.append('price', String(formData.price));
      }
      formDataToSend.append('location', formData.location);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('end_date', formData.end_date);
      formDataToSend.append('start_time', formData.start_time);
      formDataToSend.append('end_time', formData.end_time);
      formDataToSend.append('periodicity', formData.periodicity);
      formDataToSend.append('timezone', formData.timezone);
      formDataToSend.append('weekdays', JSON.stringify(formData.weekdays));
      if (formData.week_of_month) {
        formDataToSend.append('week_of_month', formData.week_of_month.toString());
      }
      formDataToSend.append('interval', formData.interval.toString());
      formDataToSend.append('exclude_dates', JSON.stringify(formData.exclude_dates));
      formDataToSend.append('max_attendants', String(formData.max_attendants));
      formDataToSend.append('draft', formData.draft ? 'true' : 'false');
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      // Prevent lowering max_attendants below enrolled_count on frontend
      if (isEdit && currentCourse) {
  const newMax = parseInt(String(formData.max_attendants), 10);
        if (!isNaN(newMax) && newMax < currentCourse.enrolled_count) {
          setAlert({
            type: 'error',
            message: t('messages.validation.maxAttendantsBelowEnrolled', { count: currentCourse.enrolled_count })
          });
          return;
        }
      }

      const url = isEdit 
        ? `${getApiEndpoint(API_ENDPOINTS.courses)}${currentCourse?.id}/`
        : getApiEndpoint(API_ENDPOINTS.courses);
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const courseTitle = formData.title;
        const successMessage = isEdit 
          ? t('messages.updateSuccess', { title: courseTitle })
          : t('messages.createSuccess', { title: courseTitle });
        
        setAlert({type: 'success', message: successMessage});
        
  refetch();
        setShowCreateModal(false);
        setShowEditModal(false);
        resetForm();
      } else {
        // Don't use errorData variable to avoid unused var lint error
        setAlert({type: 'error', message: t(isEdit ? 'messages.updateError' : 'messages.createError')});
      }
    } catch {
      setAlert({type: 'error', message: t('messages.networkError')});
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('authToken');

      if (selectedCourses.length > 0) {
        // Bulk delete
        const finishedSelectedCourses = selectedCourses.filter(id => {
          const course = courses.find(c => c.id === id);
          if (!course) return false;
          // Ensure periodicity is typed correctly for isCourseFinished
          const safeCourse = {
            ...course,
            periodicity: ([
              "once",
              "daily",
              "weekly",
              "biweekly",
              "monthly",
              "custom"
            ].includes(course.periodicity)
              ? course.periodicity
              : "once") as Course["periodicity"]
          };
          return isCourseFinished(safeCourse);
        });

        if (finishedSelectedCourses.length > 0) {
          setAlert({type: 'error', message: t('messages.cannotDeleteFinishedBulk')});
          setIsDeleting(false);
          setShowDeleteModal(false);
          return;
        }

        const deletePromises = selectedCourses.map(id =>
          fetch(`${getApiEndpoint(API_ENDPOINTS.courses)}${id}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Token ${token}`,
            },
          })
        );

        const results = await Promise.all(deletePromises);
        const failedCount = results.filter(r => !r.ok).length;
        
        if (failedCount === 0) {
          setAlert({type: 'success', message: `${selectedCourses.length} ${t('messages.bulkDeleteSuccess')}`});
        } else {
          setAlert({type: 'warning', message: `${selectedCourses.length - failedCount} ${t('messages.bulkDeleteSuccess')}, ${failedCount} failed`});
        }
        
        setSelectedCourses([]);
      } else if (currentCourse) {
        // Single delete
        if (isCourseFinished(currentCourse)) {
          setAlert({type: 'error', message: t('messages.cannotDeleteFinished')});
          setIsDeleting(false);
          setShowDeleteModal(false);
          return;
        }

        const response = await fetch(`${getApiEndpoint(API_ENDPOINTS.courses)}${currentCourse.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        if (response.ok) {
          setAlert({type: 'success', message: t('messages.deleteSuccess')});
        } else {
          setAlert({type: 'error', message: t('messages.deleteError')});
        }
      }

      refetch();
      setShowDeleteModal(false);
    } catch {
      setAlert({type: 'error', message: t('messages.networkError')});
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleCourseSelection = (id: number) => {
    setSelectedCourses(prev =>
      prev.includes(id)
        ? prev.filter(courseId => courseId !== id)
        : [...prev, id]
    );
  };

  // Helper function to format course schedule for display
  const formatCourseSchedule = (course: Course): string => {
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    };

    const isValidStartDate = course.start_date && course.start_date !== "0000-00-00";
    const isValidEndDate = course.end_date && course.end_date !== "0000-00-00";

    const startDate = isValidStartDate
      ? new Date(course.start_date).toLocaleDateString(dateLocale, dateOptions)
      : t('noSpecificDate');
    const endDate = isValidEndDate
      ? new Date(course.end_date).toLocaleDateString(dateLocale, dateOptions)
      : t('noSpecificDate');

    const startTime = course.start_time ? course.start_time.substring(0, 5) : '';
    const endTime = course.end_time ? course.end_time.substring(0, 5) : '';
    const timeRange = (startTime && endTime) ? `${startTime} - ${endTime}` : '';

    if (!isValidStartDate && !isValidEndDate) {
      return t('noSpecificDate');
    } else if (isValidStartDate && isValidEndDate) {
      return `${startDate} - ${endDate} • ${timeRange}`;
    } else if (isValidStartDate) {
      return `${startDate} • ${timeRange}`;
    } else {
      return `${endDate} • ${timeRange}`;
    }
  };

  const toggleSelectAll = () => {
    const filteredCourses = (courses || []).filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map(course => course.id));
    }
  };

  const filteredCourses = sortCourses(
    (courses || [])
      .map(course => ({
        ...course,
        periodicity: (
          [
            "once",
            "daily",
            "weekly",
            "biweekly",
            "monthly",
            "custom"
          ].includes(course.periodicity)
            ? course.periodicity
            : "once"
        ) as Course["periodicity"]
      }))
      .filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green"></div>
      </div>
    );
  }

  return (
  <div>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={5000}
        />
      )}

      {/* Header Actions - sticky on small screens, transparent or card color */}
  <div className="sticky top-0 z-30 bg-transparent dark:bg-transparent flex flex-col md:flex-row flex-wrap justify-between items-start md:items-center gap-x-6 gap-y-3 mb-6 px-2 py-3">
  <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-2 w-full md:w-auto min-w-0">
          <div className="relative w-full sm:w-64 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchTerm ?? ""}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full min-w-0"
            />
          </div>
          {/* Sort Controls */}
          <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-2 w-full md:w-auto min-w-0">
            <Label className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {t("sorting.sortBy")}:
            </Label>
            <Dropdown
              options={sortOptions}
              value={sortBy}
              onChange={(value) => setSortBy(value as SortOption)}
              minWidth="240px"
              width="240px"
              theme="orange"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
  <div className="flex items-center flex-wrap gap-2 w-full md:w-auto min-w-0">
          {selectedCourses.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center gap-1 whitespace-nowrap px-2 sm:px-3 min-w-[140px] justify-center w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden xs:inline">{t("deleteSelected")} ({selectedCourses.length})</span>
            </Button>
          )}
          <Button
            onClick={handleCreate}
            size="sm"
            className="bg-[#22A60D] hover:bg-[#22A010] text-white flex items-center gap-1 whitespace-nowrap px-2 sm:px-3 min-w-[140px] justify-center w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">{t("addCourse")}</span>
          </Button>
        </div>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {searchTerm ? t('noCoursesFound') : t('noCourses')}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="checkbox"
              checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-green focus:ring-green"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("selectAll")} ({filteredCourses.length} {t("courses")})
            </span>
          </div>

          {filteredCourses.map((course) => {
            const isFinished = isCourseFinished(course);
            const enrollmentPercentage = (course.enrolled_count || 0) / course.max_attendants * 100;
            const availableSpots = course.max_attendants - (course.enrolled_count || 0);
            return (
              <AdminCourseCard
                key={course.id}
                course={course}
                isFinished={isFinished}
                selected={selectedCourses.includes(course.id)}
                onSelect={toggleCourseSelection}
                onView={handleViewCourse}
                onEdit={handleEdit}
                onDelete={handleDelete}
                t={t}
                tAdmin={tAdmin}
                dateLocale={dateLocale}
                formatCourseSchedule={formatCourseSchedule}
                availableSpots={availableSpots}
                enrollmentPercentage={enrollmentPercentage}
              />
            );
          })}
        </div>
      )}


      {/* Create/Edit Course Modal */}
      <CourseEditModal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
        onSubmit={() => submitCourse(showEditModal)}
        showEditModal={showEditModal}
        formData={formData}
        setFormData={setFormData}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        handleFileSelect={handleFileSelect}
        t={t}
        resetForm={resetForm}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t("confirmDelete.title")}
        message={
          selectedCourses.length > 0
            ? t("confirmDelete.multiple", { count: selectedCourses.length })
            : t("confirmDelete.single", { title: currentCourse?.title ?? "" })
        }
        confirmText={t("confirmDelete.delete")}
        cancelText={t("confirmDelete.cancel")}
        isLoading={isDeleting}
      />

      {/* Course Visualization Modal */}
      {selectedCourseForModal && (
        <CourseVisualizationModal
          isOpen={showCourseModal}
          onClose={() => {
            setShowCourseModal(false);
            setSelectedCourseForModal(null);
            setCourseEnrollments([]);
          }}
          course={selectedCourseForModal}
          enrollments={courseEnrollments}
          isLoadingEnrollments={isLoadingEnrollments}
          t={t}
          dateLocale={dateLocale}
          formatWeekdays={formatWeekdays}
        />
      )}
      
    </div>
  );
};

export default AdminCoursesTab;
