import { useState, useEffect, useCallback } from 'react';

export interface Course {
  id: number;
  slug?: string;
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
  periodicity: string;
  timezone: string;
  weekdays: number[];
  week_of_month?: number;
  interval: number;
  exclude_dates: string[];
  max_attendants: number;
  enrolled_count: number;
  duration_hours: number;
  formatted_schedule: string;
  schedule_description: string;
  next_occurrences: string[];
  weekday_display: string[];
  draft?: boolean;
  created_at: string;
  updated_at: string;
}

interface UseCoursesOptions {
  limit?: number;
  featured?: boolean;
  upcoming?: boolean;
  enabled?: boolean;
  initialData?: Course[];
}

interface UseCoursesReturn {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCourses = (options: UseCoursesOptions = {}, isAdmin: boolean = false): UseCoursesReturn => {
  const [courses, setCourses] = useState<Course[]>(() => options.initialData ?? []);
  const [isLoading, setIsLoading] = useState(() => !(options.initialData && options.initialData.length > 0));
  const [error, setError] = useState<string | null>(null);
  const enabled = options.enabled ?? true;

  const fetchCourses = useCallback(async () => {
    if (!enabled) return;
    try {
      setIsLoading(true);
      setError(null);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const queryParams = new URLSearchParams();
      if (options.limit) {
        queryParams.append('limit', options.limit.toString());
      }
      const url = `${baseUrl}/api/courses/courses/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAdmin) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (token) headers['Authorization'] = `Token ${token}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
      }
      let data = await response.json();
      if (data.results) {
        data = data.results;
      }
      let filteredCourses = data;
      // Filter out draft courses for non-admins
      if (!isAdmin) {
        filteredCourses = filteredCourses.filter((course: Course) => !course.draft);
      }
      if (options.upcoming) {
        const now = new Date();
        filteredCourses = filteredCourses.filter((course: Course) => {
          const startDate = new Date(course.start_date);
          return startDate >= now;
        });
      }
      const now = new Date();
      filteredCourses.sort((a: Course, b: Course) => {
        const aStart = new Date(a.start_date);
        const bStart = new Date(b.start_date);
        const aEnd = new Date(a.end_date);
        const bEnd = new Date(b.end_date);

        const aHasStarted = aStart <= now;
        const bHasStarted = bStart <= now;

        if (!aHasStarted && !bHasStarted) {
          // Both upcoming: order by closest start date
          return aStart.getTime() - bStart.getTime();
        } else if (aHasStarted && bHasStarted) {
          // Both started: order by closest end date
          return aEnd.getTime() - bEnd.getTime();
        } else if (!aHasStarted && bHasStarted) {
          // a upcoming, b started: a comes first
          return -1;
        } else {
          // b upcoming, a started: b comes first
          return 1;
        }
      });
      if (options.limit && options.limit > 0) {
        filteredCourses = filteredCourses.slice(0, options.limit);
      }
      setCourses(filteredCourses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching courses';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options.limit, options.upcoming, enabled, isAdmin]);

  const refetch = useCallback(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (!enabled) return;
    fetchCourses();
  }, [fetchCourses, enabled]);

  return {
    courses,
    isLoading,
    error,
    refetch,
  };
};

export default useCourses;
