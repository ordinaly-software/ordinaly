import { useState, useEffect, useCallback } from 'react';

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
  created_at: string;
  updated_at: string;
}

interface UseCoursesOptions {
  limit?: number;
  featured?: boolean;
  upcoming?: boolean;
}

interface UseCoursesReturn {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCourses = (options: UseCoursesOptions = {}): UseCoursesReturn => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the base URL for the API
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (options.limit) {
        queryParams.append('limit', options.limit.toString());
      }

      const url = `${baseUrl}/api/courses/courses/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
      }

      let data = await response.json();
      
      // Handle paginated response
      if (data.results) {
        data = data.results;
      }

      // Filter courses based on options
      let filteredCourses = data;

      if (options.upcoming) {
        const now = new Date();
        filteredCourses = filteredCourses.filter((course: Course) => {
          const startDate = new Date(course.start_date);
          return startDate >= now;
        });
      }

      // Sort courses by start date (upcoming first)
      filteredCourses.sort((a: Course, b: Course) => {
        const dateA = new Date(a.start_date);
        const dateB = new Date(b.start_date);
        return dateA.getTime() - dateB.getTime();
      });

      // Apply limit after filtering and sorting
      if (options.limit && options.limit > 0) {
        filteredCourses = filteredCourses.slice(0, options.limit);
      }

      setCourses(filteredCourses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching courses';
      setError(errorMessage);
      console.error('Error fetching courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options.limit, options.upcoming]);

  const refetch = useCallback(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    isLoading,
    error,
    refetch,
  };
};

export default useCourses;
