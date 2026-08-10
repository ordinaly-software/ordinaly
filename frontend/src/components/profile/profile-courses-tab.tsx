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
      return {
        label: t("courses.status.inProgress"),
        className: "border-transparent bg-clay/15 text-[--swatch--flame-dark] dark:text-clay",
      };
    }
    if (endDateTime && endDateTime <= now) {
      return {
        label: t("courses.status.finished"),
        className: "border-transparent bg-slate-dark/85 text-ivory-light dark:bg-white/15 dark:text-ivory-light",
      };
    }
    return {
      label: t("courses.status.startsSoon"),
      className: "border-transparent bg-cobalt/12 text-[--swatch--cobalt-dark] dark:bg-[#7DB5FF]/20 dark:text-[#7DB5FF]",
    };
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

  const renderCourseRow = (course: Course, dateField: "start_date" | "end_date") => {
    const status = getCourseStatus(course);
    const enrollment = enrollmentByCourseId.get(course.id);
    return (
      <div
        key={course.id}
        className="group flex flex-col gap-4 rounded-[1.5rem] border border-[--color-border-subtle] bg-white/60 px-4 py-3 transition hover:-translate-y-0.5 hover:border-clay/35 hover:shadow-[0_16px_40px_-28px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[1rem] bg-oat/60 dark:bg-white/10 sm:h-20 sm:w-20">
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
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="text-base font-semibold text-slate-dark dark:text-ivory-light">
                {course.title}
              </h4>
              <Badge className={status.className}>{status.label}</Badge>
            </div>
            {course.subtitle && (
              <p className="text-sm text-slate-medium dark:text-cloud-medium">
                {course.subtitle}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-xs text-cloud-dark dark:text-cloud-medium">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatCourseDate(course[dateField])}
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
          onClick={() => router.push(`/formacion/${course.slug ?? course.id}`)}
          className="self-start active:scale-[0.98] sm:self-auto"
        >
          {t("courses.viewDetails")}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <Card className="rounded-[2rem] border border-[--color-border-subtle] bg-white/75 shadow-[0_20px_80px_-55px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/[0.04]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tracking-[-0.03em] text-cobalt dark:text-[#7DB5FF]">
            <BookOpen className="h-6 w-6" strokeWidth={1.8} />
            {t("courses.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {isLoading ? (
            <div className="flex items-center gap-3 text-sm text-slate-medium dark:text-cloud-medium">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-cobalt dark:border-[#7DB5FF]" />
              {t("courses.loading")}
            </div>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cloud-dark dark:text-cloud-medium">
                  {t("courses.current")}
                </h3>
                {currentCourses.length === 0 ? (
                  <p className="text-sm text-slate-medium dark:text-cloud-medium">
                    {t("courses.emptyCurrent")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {currentCourses.map((course) => renderCourseRow(course, "start_date"))}
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t border-[--color-border-subtle] pt-8 dark:border-white/10">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cloud-dark dark:text-cloud-medium">
                  {t("courses.past")}
                </h3>
                {pastCourses.length === 0 ? (
                  <p className="text-sm text-slate-medium dark:text-cloud-medium">
                    {t("courses.emptyPast")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pastCourses.map((course) => renderCourseRow(course, "end_date"))}
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  onClick={() => router.push("/formacion")}
                  className="rounded-full bg-[--swatch--cobalt-dark] px-6 py-3 font-semibold text-white shadow-[0_15px_40px_-15px_rgba(2,85,213,0.55)] transition-all duration-200 hover:bg-[#01388A] hover:shadow-[0_20px_50px_-15px_rgba(2,85,213,0.6)] active:scale-[0.98] dark:bg-[#7DB5FF] dark:text-black dark:hover:bg-[#60A5FA]"
                >
                  {t("courses.enrollCta")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCoursesTab;
