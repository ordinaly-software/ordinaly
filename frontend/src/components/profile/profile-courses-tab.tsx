"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Course } from "@/hooks/useCourses";
import Image from "next/image";

interface Enrollment {
  id: number;
  course: number;
  enrolled_at: string;
}

interface ProfileCoursesTabProps {
  enrolledCourses: Course[];
  enrollments: Enrollment[];
  isLoading: boolean;
  error: string | null;
}

const ProfileCoursesTab: React.FC<ProfileCoursesTabProps> = ({
  enrolledCourses,
  enrollments,
  isLoading,
  error,
}) => {
  const t = useTranslations("profile");
  const router = useRouter();

  const enrollmentByCourseId = useMemo(() => {
    return new Map(enrollments.map((enrollment) => [enrollment.course, enrollment]));
  }, [enrollments]);

  const parseCourseDateTime = (date: string, time?: string) => {
    if (!date || date === "0000-00-00") return null;
    if (time) return new Date(`${date}T${time}`);
    return new Date(date);
  };

  const getCourseStatus = (course: Course) => {
    const now = new Date();
    const startDateTime = parseCourseDateTime(course.start_date, course.start_time);
    const endDateTime = parseCourseDateTime(course.end_date, course.end_time);
    if (startDateTime && endDateTime && startDateTime <= now && endDateTime > now) {
      return { label: t("courses.status.inProgress"), variant: "default" as const };
    }
    if (endDateTime && endDateTime <= now) {
      return { label: t("courses.status.finished"), variant: "finished" as const };
    }
    return { label: t("courses.status.startsSoon"), variant: "secondary" as const };
  };

  const formatCourseDate = (date: string) => {
    if (!date || date === "0000-00-00") return t("courses.dateTbd");
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return t("courses.dateTbd");
    return parsed.toLocaleDateString();
  };

  const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
    if (!src || src === "undefined" || src === "null") {
      return "/api/placeholder/120/120";
    }
    if (src.startsWith("/")) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";
      return `${baseUrl}${src}?w=${width}&q=${quality || 75}`;
    }
    return `${src}?w=${width}&q=${quality || 75}`;
  };

  const now = new Date();
  const currentCourses = enrolledCourses
    .filter((course) => {
      const endDateTime = parseCourseDateTime(course.end_date, course.end_time);
      return !endDateTime || endDateTime >= now;
    })
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  const pastCourses = enrolledCourses
    .filter((course) => {
      const endDateTime = parseCourseDateTime(course.end_date, course.end_time);
      return !!endDateTime && endDateTime < now;
    })
    .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());

  return (
    <div className="space-y-8">
      <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-[#46B1C9]" />
            <span className="text-[#46B1C9]">
              {t("courses.title")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {isLoading ? (
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1F8A0D] dark:border-[#7CFC00]" />
              {t("courses.loading")}
            </div>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t("courses.current")}
                </h3>
                {currentCourses.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("courses.emptyCurrent")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {currentCourses.map((course) => {
                      const status = getCourseStatus(course);
                      const enrollment = enrollmentByCourseId.get(course.id);
                      return (
                        <div
                          key={course.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800/30"
                        >
                          <div className="flex items-start gap-4">
                            <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                              <Image
                                loader={imageLoader}
                                src={course.image}
                                alt={course.title}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                  {course.title}
                                </h4>
                                <Badge variant={status.variant}>{status.label}</Badge>
                              </div>
                              {course.subtitle && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {course.subtitle}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatCourseDate(course.start_date)}
                                </span>
                                {enrollment?.enrolled_at && (
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {t("courses.enrolledOn", { date: new Date(enrollment.enrolled_at).toLocaleDateString() })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/formation/${course.slug ?? course.id}`)}
                            className="self-start sm:self-auto"
                          >
                            {t("courses.viewDetails")}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t("courses.past")}
                </h3>
                {pastCourses.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("courses.emptyPast")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pastCourses.map((course) => {
                      const status = getCourseStatus(course);
                      const enrollment = enrollmentByCourseId.get(course.id);
                      return (
                        <div
                          key={course.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800/30"
                        >
                          <div className="flex items-start gap-4">
                            <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                              <Image
                                loader={imageLoader}
                                src={course.image}
                                alt={course.title}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                  {course.title}
                                </h4>
                                <Badge variant={status.variant}>{status.label}</Badge>
                              </div>
                              {course.subtitle && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {course.subtitle}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatCourseDate(course.end_date)}
                                </span>
                                {enrollment?.enrolled_at && (
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {t("courses.enrolledOn", { date: new Date(enrollment.enrolled_at).toLocaleDateString() })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/formation/${course.slug ?? course.id}`)}
                            className="self-start sm:self-auto"
                          >
                            {t("courses.viewDetails")}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCoursesTab;
