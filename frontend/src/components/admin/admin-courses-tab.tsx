"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Alert from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import { getApiEndpoint, API_ENDPOINTS } from "@/lib/api-config";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Upload,
  FileText,
  Eye,
  Users,
  Calendar,
  Clock,
  MapPin,
  Euro,
  User,
  ArrowUpDown,
  CheckCircle,
  XCircle
} from "lucide-react";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { Dropdown, DropdownOption } from "@/components/ui/dropdown";
import Image from "next/image";
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';


interface Course {
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

// Custom image loader to handle potential URL issues
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src || src === 'undefined' || src === 'null') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xMiA2LTItMiA0IDRoNCIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
  }
  return `${src}?w=${width}&q=${quality || 75}`;
};

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

  // Timezone options
  const timezoneOptions: DropdownOption[] = [
    { value: 'Europe/Madrid', label: 'Europe/Madrid (CET)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
    { value: 'UTC', label: 'UTC' }
  ];

  // Week of month options
  const weekOfMonthOptions: DropdownOption[] = [
    { value: '', label: t("form.weekOfMonth.any") },
    { value: '1', label: t("form.weekOfMonth.first") },
    { value: '2', label: t("form.weekOfMonth.second") },
    { value: '3', label: t("form.weekOfMonth.third") },
    { value: '4', label: t("form.weekOfMonth.fourth") },
    { value: '-1', label: t("form.weekOfMonth.last") }
  ];

  // Periodicity options for recurrence pattern
  const periodicityOptions: DropdownOption[] = [
    { value: 'once', label: t("form.periodicity.once") },
    { value: 'daily', label: t("form.periodicity.daily") },
    { value: 'weekly', label: t("form.periodicity.weekly") },
    { value: 'biweekly', label: t("form.periodicity.biweekly") },
    { value: 'monthly', label: t("form.periodicity.monthly") }
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
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
    max_attendants: ""
  });

  const fetchCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiEndpoint(API_ENDPOINTS.courses), {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
      } else {
        setAlert({type: 'error', message: t('messages.fetchError')});
      }
    } catch {
      
      setAlert({type: 'error', message: t('messages.networkError')});
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
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
      max_attendants: ""
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
      price: course.price || "",
      location: course.location,
      start_date: course.start_date,
      end_date: course.end_date,
      start_time: course.start_time,
      end_time: course.end_time,
      periodicity: course.periodicity,
      timezone: course.timezone,
      weekdays: course.weekdays || [],
      week_of_month: course.week_of_month || null,
      interval: course.interval || 1,
      exclude_dates: course.exclude_dates || [],
      max_attendants: course.max_attendants.toString()
    });
    setPreviewUrl(course.image);
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
      if (!formData.title.trim()) {
        setAlert({type: 'error', message: t('messages.validation.titleRequired')});
        return;
      }
      if (!formData.description.trim()) {
        setAlert({type: 'error', message: t('messages.validation.descriptionRequired')});
        return;
      }
      if (!formData.location.trim()) {
        setAlert({type: 'error', message: t('messages.validation.locationRequired')});
        return;
      }
      if (!formData.start_date.trim()) {
        setAlert({type: 'error', message: t('messages.validation.startDateRequired')});
        return;
      }
      if (!formData.end_date.trim()) {
        setAlert({type: 'error', message: t('messages.validation.endDateRequired')});
        return;
      }
      if (!formData.max_attendants || parseInt(formData.max_attendants) < 1) {
        setAlert({type: 'error', message: t('messages.validation.maxAttendantsInvalid')});
        return;
      }
      if (formData.price && parseFloat(formData.price) < 0.01) {
        setAlert({type: 'error', message: t('messages.validation.priceInvalid')});
        return;
      }
      if (!isEdit && !selectedFile) {
        setAlert({type: 'error', message: t('messages.validation.imageRequired')});
        return;
      }

      const token = localStorage.getItem('authToken');
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('description', formData.description);
      if (formData.price) {
        formDataToSend.append('price', formData.price);
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
      formDataToSend.append('max_attendants', formData.max_attendants);
      
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      // Prevent lowering max_attendants below enrolled_count on frontend
      if (isEdit && currentCourse) {
        const newMax = parseInt(formData.max_attendants, 10);
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
        
        fetchCourses();
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
          return course && isCourseFinished(course);
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

      fetchCourses();
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
    (courses || []).filter(course =>
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

      {/* Header Actions - sticky on small screens */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-2 py-3 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
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
          <div className="flex items-center justify-center space-x-3 w-full sm:w-auto">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
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
        <div className="flex items-center gap-2 w-full sm:w-auto">
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
            <Card key={course.id} className={`${isFinished 
              ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 opacity-75' 
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            } cursor-pointer hover:shadow-md transition-shadow duration-200`}
            onClick={() => handleViewCourse(course)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleCourseSelection(course.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    disabled={isFinished}
                    className="mt-1 rounded border-gray-300 text-green focus:ring-green disabled:opacity-50"
                  />
                  
                  {/* Course Image */}
                  <div className={`w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0 ${
                    isFinished ? 'grayscale' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {course.image && course.image !== 'undefined' && course.image !== 'null' ? (
                      <Image
                        loader={imageLoader}
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                        onError={(e) => {
                          
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {isFinished && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`text-lg font-semibold ${
                            isFinished ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {course.title}
                          </h3>
                          {isFinished && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                              {t("details.finished")}
                            </span>
                          )}
                        </div>
                        {course.subtitle && (
                          <div className={`text-sm mb-1 ${
                            isFinished ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {course.subtitle}
                          </div>
                        )}
                          {/* Hide description on small screens, show on md+ */}
                          <div className={`hidden md:block text-sm mb-2 ${
                            isFinished ? 'text-gray-600 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            <MarkdownRenderer>
                              {course.description.length > 200 
                                ? `${course.description.substring(0, 200)}...` 
                                : course.description}
                            </MarkdownRenderer>
                          </div>
                        
                        {/* Enrollment Progress Bar */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>{t("courseCard.enrollments")}: {course.enrolled_count || 0}/{course.max_attendants}</span>
                            <span>{Math.round(enrollmentPercentage)}% {t("courseCard.full")}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                enrollmentPercentage >= 100 
                                  ? 'bg-red-500' 
                                  : enrollmentPercentage >= 80 
                                    ? 'bg-orange-500' 
                                    : 'bg-[#22A60D]'
                              }`}
                              style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className={`flex flex-wrap items-center gap-4 text-xs ${
                          isFinished ? 'text-gray-500 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          <span>{tAdmin("labels.price")}: {course.price ? `€${course.price}` : t("contactForQuote")}</span>
                          <span>{tAdmin("labels.location")}: {course.location}</span>
                          <span>{tAdmin("labels.schedule")}: {formatCourseSchedule(course)}</span>
                          <span className={`flex items-center space-x-1 ${
                            availableSpots === 0 ? 'text-red-600 font-medium' : ''
                          }`}>
                            <Users className="h-3 w-3" />
                            <span>{availableSpots} {t("courseCard.spotsAvailable")}</span>
                          </span>
                          <span>{tAdmin("labels.created")}: {new Date(course.created_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:space-x-2 ml-0 md:ml-4 mt-2 md:mt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCourse(course);
                          }}
                          className="text-[#22A60D] hover:text-[#22A010] hover:bg-[#22A60D]/10 w-full md:w-auto"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!isFinished && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(course);
                              }}
                              className="text-blue hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-full md:w-auto"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(course);
                              }}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 w-full md:w-auto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}


      {/* Create/Edit Course Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
        title={showEditModal ? t("editCourse") : t("createCourse")}
        showHeader={true}
        className="max-w-[95vw] xl:max-w-[85vw] 2xl:max-w-[80vw]"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Course Title */}
          <div className="space-y-3">
            <Label htmlFor="title" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-[#22A60D]/10 rounded flex items-center justify-center">
                <FileText className="w-3 h-3 text-[#22A60D]" />
              </div>
              <span>{t("form.titleRequired")}</span>
            </Label>
            <Input
              id="title"
              value={formData.title ?? ""}
              onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
              placeholder={t("form.titlePlaceholder")}
              className="h-12 border-gray-300 focus:border-[#22A60D] focus:ring-[#22A60D]/20 rounded-lg transition-all duration-200"
              required
            />
          </div>
          
          {/* Course Subtitle */}
          <div className="space-y-3">
            <Label htmlFor="subtitle" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-blue">S</span>
              </div>
              <span>{t("form.subtitleOptional")}</span>
            </Label>
            <Input
              id="subtitle"
              value={formData.subtitle ?? ""}
              onChange={(e) => setFormData(prev => ({...prev, subtitle: e.target.value}))}
              placeholder={t("form.subtitlePlaceholder")}
              className="h-12 border-gray-300 focus:border-blue focus:ring-blue/20 rounded-lg transition-all duration-200"
            />
          </div>

          {/* Course Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                <Edit className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
              <span>{t("form.descriptionRequired")}</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({...prev, description: e.target.value}))}
              placeholder={t("form.descriptionPlaceholder")}
              rows={4}
              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg transition-all duration-200 resize-none"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label htmlFor="image" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center">
                <Upload className="w-3 h-3 text-orange-600 dark:text-orange-400" />
              </div>
              <span>{!showEditModal ? t("form.imageRequired") : t("form.imageOptional")}</span>
            </Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 transition-all duration-200 hover:border-orange-500 hover:bg-orange-500/5">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {selectedFile.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image')?.click()}
                        className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-200"
                      >
                        {t("form.chooseImageText")}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">{t("form.imageRecommendation")}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {previewUrl && previewUrl !== 'undefined' && previewUrl !== 'null' && (
                <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    loader={imageLoader}
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="128px"
                    onError={() => {
                      
                      setPreviewUrl("");
                    }}
                  />
                  <ModalCloseButton
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl("");
                    }}
                    variant="light"
                    size="sm"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Price and Max Attendants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="price" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">€</span>
                </div>
                <span>{t("form.price")}</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price ?? ""}
                onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                placeholder={t("form.pricePlaceholder")}
                className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500/20 rounded-lg transition-all duration-200"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="max_attendants" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">#</span>
                </div>
                <span>{t("form.maxAttendantsRequired")}</span>
              </Label>
              <Input
                id="max_attendants"
                type="number"
                min="1"
                value={formData.max_attendants ?? ""}
                onChange={(e) => setFormData(prev => ({...prev, max_attendants: e.target.value}))}
                placeholder={t("form.maxAttendantsPlaceholder")}
                className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label htmlFor="location" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-red-600 dark:text-red-400">📍</span>
              </div>
              <span>{t("form.locationRequired")}</span>
            </Label>
            <Input
              id="location"
              value={formData.location ?? ""}
              onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
              placeholder={t("form.locationPlaceholder")}
              className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500/20 rounded-lg transition-all duration-200"
              required
            />
          </div>

          {/* Professional Scheduling Section */}
          <div className="space-y-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-blue rounded flex items-center justify-center">
                <span className="text-sm font-bold text-white">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("form.scheduleSettings")}
              </h3>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("form.startDateRequired")}
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date ?? ""}
                  onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                  className="h-11 border-gray-300 focus:border-blue focus:ring-blue/20 rounded-lg transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("form.endDateRequired")}
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date ?? ""}
                  onChange={(e) => setFormData(prev => ({...prev, end_date: e.target.value}))}
                  className="h-11 border-gray-300 focus:border-blue focus:ring-blue/20 rounded-lg transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("form.startTimeRequired")}
                </Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time ?? ""}
                  onChange={(e) => setFormData(prev => ({...prev, start_time: e.target.value}))}
                  className="h-11 border-gray-300 focus:border-blue focus:ring-blue/20 rounded-lg transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("form.endTimeRequired")}
                </Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time ?? ""}
                  onChange={(e) => setFormData(prev => ({...prev, end_time: e.target.value}))}
                  className="h-11 border-gray-300 focus:border-blue focus:ring-blue/20 rounded-lg transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Periodicity */}
            <div className="space-y-2">
              <Label htmlFor="periodicity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("form.periodicityRequired")}
              </Label>
              <Dropdown
                options={periodicityOptions}
                value={formData.periodicity}
                onChange={(value) => setFormData(prev => ({...prev, periodicity: value as Course['periodicity']}))}
                minWidth="100%"
                theme="orange"
                placeholder={t("form.periodicity.once")}
              />
            </div>

            {/* Weekdays Selection (for weekly/biweekly patterns) */}
            {(formData.periodicity === 'weekly' || formData.periodicity === 'biweekly') && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("form.weekdaysOptional")}
                </Label>
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day, idx) => (
                    <label key={day.key} className="flex flex-col items-center space-y-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.weekdays.includes(idx)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({...prev, weekdays: [...prev.weekdays, idx]}));
                          } else {
                            setFormData(prev => ({...prev, weekdays: prev.weekdays.filter(d => d !== idx)}));
                          }
                        }}
                        className="rounded border-gray-300 text-blue focus:ring-blue/20"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400" title={day.full}>
                        {day.short}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Pattern Settings */}
            {formData.periodicity === 'monthly' && (
              <div className="space-y-2">
                <Label htmlFor="week_of_month" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("form.weekOfMonthOptional")}
                </Label>
                <Dropdown
                  options={weekOfMonthOptions}
                  value={formData.week_of_month?.toString() || ''}
                  onChange={(value) => setFormData(prev => ({...prev, week_of_month: value ? parseInt(value) : null}))}
                  placeholder={t("form.weekOfMonth.any")}
                  theme="orange"
                  width="100%"
                />
              </div>
            )}

            {/* Custom Interval */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interval" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("form.intervalOptional")}
                </Label>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  max="52"
                  value={formData.interval ?? ""}
                  onChange={(e) => setFormData(prev => ({...prev, interval: parseInt(e.target.value) || 1}))}
                  placeholder={t("form.intervalPlaceholder")}
                  className="h-11 border-gray-300 focus:border-blue focus:ring-blue/20 rounded-lg transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("form.timezoneOptional")}
                </Label>
                <Dropdown
                  options={timezoneOptions}
                  value={formData.timezone}
                  onChange={(value) => setFormData(prev => ({...prev, timezone: value}))}
                  theme="orange"
                  width="100%"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
              }}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-500 transition-all duration-200"
            >
              {t("form.cancel")}
            </Button>
            <Button
              onClick={() => submitCourse(showEditModal)}
              className="px-6 py-2 bg-[#22A60D] hover:bg-[#22A010] text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <span>{showEditModal ? t("form.update") : t("form.create")}</span>
              {showEditModal ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Modal>

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
      <Modal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setSelectedCourseForModal(null);
          setCourseEnrollments([]);
        }}
        title={selectedCourseForModal ? t("details.title") : t("details.title")}
        showHeader={true}
        className="max-w-[95vw] xl:max-w-[85vw] 2xl:max-w-[80vw]"
      >
        {selectedCourseForModal && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1 sm:px-0">
            {/* Course Header */}
            <div className="flex flex-col sm:flex-row landscape:flex-col-reverse items-start sm:space-x-6 space-y-4 sm:space-y-0 landscape:space-y-4 landscape:sm:space-x-0">
              {/* Course Image */}
              <div className="w-full sm:w-32 h-32 relative rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 mx-auto sm:mx-0">
                {selectedCourseForModal.image && selectedCourseForModal.image !== 'undefined' && selectedCourseForModal.image !== 'null' ? (
                  <Image
                    loader={imageLoader}
                    src={selectedCourseForModal.image}
                    alt={selectedCourseForModal.title}
                    fill
                    className="object-cover"
                    sizes="128px"
                    onError={(e) => {
                      
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                {isCourseFinished(selectedCourseForModal) && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-white text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-1" />
                      <span className="text-xs font-medium">{t("details.finished")}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0 w-full">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words">
                  {selectedCourseForModal.title}
                </h2>
                {selectedCourseForModal.subtitle && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-3 break-words">
                    {selectedCourseForModal.subtitle}
                  </p>
                )}
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-4 break-words">
                  <MarkdownRenderer>
                    {selectedCourseForModal.description}
                  </MarkdownRenderer>
                </div>

                {/* Key Metrics - stack vertically on mobile */}
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-[#22A60D]/10 rounded-lg p-4 flex-1 min-w-0">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-between w-full mb-2">
                        <Users className="h-6 w-6 text-[#22A60D] flex-shrink-0" />
                        <p className="text-lg font-bold text-[#22A60D]">
                          {selectedCourseForModal.enrolled_count || 0}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                        {t("details.enrolled")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 flex-1 min-w-0">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-between w-full mb-2">
                        <User className="h-6 w-6 text-blue flex-shrink-0" />
                        <p className="text-lg font-bold text-blue">
                          {selectedCourseForModal.max_attendants}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                        {t("details.capacity")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4 flex-1 min-w-0">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-between w-full mb-2">
                        <XCircle className="h-6 w-6 text-orange-600 flex-shrink-0" />
                        <p className="text-lg font-bold text-orange-600">
                          {selectedCourseForModal.max_attendants - (selectedCourseForModal.enrolled_count || 0)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                        {t("details.vacant")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 flex-1 min-w-0">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-between w-full mb-2">
                        <Euro className="h-6 w-6 text-purple-600 flex-shrink-0" />
                        <p className="text-lg font-bold text-purple-600 break-words text-right">
                          {selectedCourseForModal.price ? `${Math.round(Number(selectedCourseForModal.price))}` : t("contactForQuote")}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                        {t("details.price")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Details Grid - stack vertically on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Schedule Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 min-w-0">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-5 w-5 text-blue" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("details.schedule")}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("details.startDate")}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedCourseForModal.start_date && selectedCourseForModal.start_date !== "0000-00-00"
                        ? new Date(selectedCourseForModal.start_date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })
                        : t('noSpecificDate')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("details.endDate")}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedCourseForModal.end_date && selectedCourseForModal.end_date !== "0000-00-00"
                        ? new Date(selectedCourseForModal.end_date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })
                        : t('noSpecificDate')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("details.time")}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedCourseForModal.start_time ? selectedCourseForModal.start_time.substring(0, 5) : "-"} - {selectedCourseForModal.end_time ? selectedCourseForModal.end_time.substring(0, 5) : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("details.duration")}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedCourseForModal.duration_hours?.toFixed(1)} {t("details.hours")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("details.frequency")}:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {t(`form.periodicity.${selectedCourseForModal.periodicity}`)}
                    </span>
                  </div>
                  {selectedCourseForModal.weekdays && selectedCourseForModal.weekdays.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t("details.weekdays")}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatWeekdays(selectedCourseForModal.weekdays)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location & Logistics */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 min-w-0">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("details.locationInfo")}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("details.location")}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedCourseForModal.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("details.timezone")}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedCourseForModal.timezone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("details.created")}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedCourseForModal.created_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("details.lastUpdated")}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedCourseForModal.updated_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Progress */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("details.enrollmentStatus")}</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {((selectedCourseForModal.enrolled_count || 0) / selectedCourseForModal.max_attendants * 100).toFixed(1)}% {t("details.fullStatus")}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    (selectedCourseForModal.enrolled_count || 0) >= selectedCourseForModal.max_attendants
                      ? 'bg-red-500' 
                      : (selectedCourseForModal.enrolled_count || 0) / selectedCourseForModal.max_attendants >= 0.8
                        ? 'bg-orange-500' 
                        : 'bg-[#22A60D]'
                  }`}
                  style={{ 
                    width: `${Math.min(((selectedCourseForModal.enrolled_count || 0) / selectedCourseForModal.max_attendants * 100), 100)}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{selectedCourseForModal.enrolled_count || 0} {t("details.enrolled").toLowerCase()}</span>
                <span>{selectedCourseForModal.max_attendants - (selectedCourseForModal.enrolled_count || 0)} {t("details.spotsRemaining")}</span>
              </div>
            </div>

            {/* Enrolled Members */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>{t("details.enrolledMembers")}</span>
                </h3>
                <span className="bg-[#22A60D]/10 text-[#22A60D] px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                  {courseEnrollments.length} {t("details.members")}
                </span>
              </div>
              
              {isLoadingEnrollments ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#22A60D]"></div>
                </div>
              ) : courseEnrollments.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>{t("details.noEnrollments")}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {courseEnrollments.map((enrollment, idx) => {
                    // More robust name handling
                    const userName = enrollment.user_details?.name?.trim();
                    const userSurname = enrollment.user_details?.surname?.trim();
                    const userEmail = enrollment.user_details?.email;
                    
                    let displayName = '';
                    if (userName && userSurname) {
                      displayName = `${userName} ${userSurname}`;
                    } else if (userName) {
                      displayName = userName;
                    } else if (userSurname) {
                      displayName = userSurname;
                    } else if (userEmail) {
                      displayName = userEmail.split('@')[0];
                    } else {
                      displayName = `User #${enrollment.user}`;
                    }
                    
                    return (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#22A60D]/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-[#22A60D]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {displayName}
                          </p>
                          {enrollment.user_details?.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {enrollment.user_details.email}
                            </p>
                          )}
                          {enrollment.user_details?.company && (
                            <p className="text-xs text-blue">
                              {enrollment.user_details.company}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("details.enrolledOn")} {new Date(enrollment.enrolled_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {t("details.member")} #{idx + 1}
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Next Occurrences */}
            {selectedCourseForModal.next_occurrences && selectedCourseForModal.next_occurrences.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-5 min-w-0">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("details.upcomingSessions")}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedCourseForModal.next_occurrences.slice(0, 6).map((occurrence, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(occurrence).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedCourseForModal.start_time.substring(0, 5)} - {selectedCourseForModal.end_time.substring(0, 5)}
                      </p>
                    </div>
                  ))}
                </div>
                {selectedCourseForModal.next_occurrences.length > 6 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
                    +{selectedCourseForModal.next_occurrences.length - 6} {t("details.moreSessions")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCoursesTab;
