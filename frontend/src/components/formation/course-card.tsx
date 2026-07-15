"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Calendar, Euro, ArrowRight, BookOpen, UserCheck, UserX } from "lucide-react";
import { openPastCourseWhatsApp, cleanCourseTitle } from "@/utils/past-course";

// Structural shape only — kept independent from the Course type used by each
// caller (hooks/useCourses vs utils/pdf-generator) so both can pass their data as-is.
interface CourseCardData {
  id: number;
  slug?: string;
  title: string;
  subtitle?: string;
  image: string;
  price?: string | number | null;
  location: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  max_attendants: number;
  enrolled_count?: number;
  duration_hours?: number;
  weekday_display?: string[];
}

interface CourseCardProps {
  course: CourseCardData;
  variant: "upcoming" | "past";
  enrolled?: boolean;
  onEnroll?: () => void;
  onCancel?: () => void;
  onViewDetails?: () => void;
  disableEnroll?: boolean;
  disableUnenroll?: boolean;
  unenrollRestrictionReason?: string | null;
  highlightUpcoming?: boolean;
  inProgress?: boolean;
  cardTitleTag?: "h3" | "h4";
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  variant,
  enrolled = false,
  onEnroll,
  onCancel,
  onViewDetails,
  disableEnroll = false,
  disableUnenroll = false,
  unenrollRestrictionReason = null,
  highlightUpcoming = false,
  cardTitleTag = "h3",
}) => {
  const t = useTranslations("formation");
  const [imageError, setImageError] = useState(false);

  const nowDate = new Date();
  const isPastCourse = variant === "past";
  const isIncompleteSchedule = !course.start_date || course.start_date === "0000-00-00" || !course.end_date || course.end_date === "0000-00-00" || !course.start_time || !course.end_time;
  const startDate = course.start_date && course.start_date !== "0000-00-00" ? new Date(course.start_date) : null;
  const endDate = course.end_date && course.end_date !== "0000-00-00" ? new Date(course.end_date) : null;
  const cleanTitle = cleanCourseTitle(course.title);
  const fallbackTitle = cleanTitle.split(" ").slice(0, 3).join(" ");

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0000-00-00") return t("noSpecificDate");
    try {
      const [year, month, day] = dateString.split("-").map(Number);
      if (!year || !month || !day) return t("noSpecificDate");
      const date = new Date(Date.UTC(year, month - 1, day));
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
    } catch {
      return t("noSpecificDate");
    }
  };

  const availabilityBadge = (() => {
    if (isPastCourse || !startDate || !endDate) return null;
    if (startDate <= nowDate && endDate > nowDate) return { text: t("inProgress"), variant: "default" as const };
    if (endDate < nowDate) return { text: t("finished"), variant: "finished" as const };
    const percentage = ((course.enrolled_count ?? 0) / course.max_attendants) * 100;
    if (percentage >= 90) return { text: t("almostFull"), variant: "destructive" as const };
    if (percentage >= 70) return { text: t("fillingFast"), variant: "default" as const };
    return { text: t("available"), variant: "secondary" as const };
  })();

  const handleRequestEdition = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    openPastCourseWhatsApp(course, t);
  };

  const handleViewDetailsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onViewDetails?.();
  };

  return (
    <Card
      className={[
        "w-full h-full flex flex-col bg-[--swatch--ivory-light] dark:bg-[--swatch--slate-medium] border-[--color-border-subtle] dark:border-[--color-border-strong] transition-all duration-300 rounded-3xl group",
        onViewDetails ? "cursor-pointer hover:shadow-xl hover:border-clay/30 dark:hover:border-clay/30 hover:-translate-y-1" : "",
        highlightUpcoming ? "ring-2 ring-clay shadow-2xl z-10" : "",
        isPastCourse ? "opacity-70" : "",
      ].join(" ")}
      style={highlightUpcoming ? { boxShadow: "0 0 0 3px var(--swatch--clay), 0 8px 15px 0 var(--swatch--clay)44" } : {}}
      onClick={onViewDetails ? () => onViewDetails() : undefined}
    >
      <CardHeader className="pb-2">
        <div className="relative w-full h-36 rounded-lg overflow-hidden mb-4 bg-oat/40 dark:bg-[--swatch--slate-medium]/40">
          {!imageError ? (
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              quality={60}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--swatch--cloud-medium)]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-clay/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-clay" />
                </div>
                <p className="text-sm font-medium px-4">{fallbackTitle || course.title}</p>
              </div>
            </div>
          )}

          {isPastCourse ? (
            <div className="absolute top-3 left-3">
              <Badge variant="finished">{t("finished")}</Badge>
            </div>
          ) : (
            availabilityBadge && (
              <div className="absolute top-3 left-3">
                <Badge variant={availabilityBadge.variant}>{availabilityBadge.text}</Badge>
              </div>
            )
          )}

          {!isPastCourse && course.price != null && (
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-[--swatch--slate-medium]/90 backdrop-blur-sm rounded-lg px-3 py-1">
              <div className="flex items-center gap-1 text-sm font-semibold text-slate-dark dark:text-ivory-light">
                <Euro className="w-4 h-4" />
                {course.price}
              </div>
            </div>
          )}

          {enrolled && (
            <div className="absolute bottom-3 right-3">
              <span className="bg-clay text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                {t("enrolled")}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {cardTitleTag === "h4" ? (
            <h4 className="text-xl text-slate-dark dark:text-ivory-light group-hover:text-clay dark:group-hover:text-clay transition-colors line-clamp-2">
              {cleanTitle}
            </h4>
          ) : (
            <CardTitle className="text-xl text-slate-dark dark:text-ivory-light group-hover:text-clay dark:group-hover:text-clay transition-colors line-clamp-2">
              {cleanTitle}
            </CardTitle>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col flex-1">
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-medium dark:text-cloud-medium">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {course.start_date ? formatDate(course.start_date) : t("datesSoon")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-medium dark:text-cloud-medium">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {course.duration_hours ? `${course.duration_hours}h` : t("durationSoon")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-medium dark:text-cloud-medium col-span-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {typeof course.location === "string" && course.location.trim() !== "" && course.location !== "null" ? (
                /online|virtual/i.test(course.location) ? (
                  <span className="truncate underline" title={course.location}>
                    {course.location}
                  </span>
                ) : (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate underline hover:text-clay dark:hover:text-clay dark:text-clay"
                    title={course.location}
                  >
                    {course.location}
                  </a>
                )
              ) : (
                <span className="truncate">{t("locationSoon")}</span>
              )}
            </div>
          </div>

          {course.weekday_display && course.weekday_display.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {course.weekday_display.map((day) => (
                <Badge key={day} variant="outline" className="text-xs">
                  {day}
                </Badge>
              ))}
            </div>
          )}

          {startDate && endDate && startDate > nowDate && endDate > nowDate && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-medium dark:text-cloud-medium">
                <span>{course.max_attendants} {t("max")}</span>
              </div>
              <div className="w-full bg-oat dark:bg-[--swatch--slate-medium] rounded-full h-2">
                <div
                  className="bg-clay h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(((course.enrolled_count ?? 0) / course.max_attendants) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-6">
          {isPastCourse ? (
            <>
              <Button
                variant="flame"
                className="w-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                onClick={handleRequestEdition}
              >
                <span>{t("wantNewEdition")}</span>
              </Button>
              <Button
                variant="outline"
                className="w-full border-[--color-border-subtle] text-slate-medium dark:border-[--color-border-strong] dark:text-cloud-medium hover:bg-[--swatch--ivory-medium] dark:hover:bg-[--swatch--slate-dark]/70"
                onClick={handleViewDetailsClick}
              >
                {t("viewDetails")}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </>
          ) : enrolled ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (!disableUnenroll) onCancel?.();
              }}
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
              disabled={disableUnenroll}
              title={disableUnenroll && unenrollRestrictionReason ? unenrollRestrictionReason : undefined}
            >
              <UserX className="w-4 h-4 mr-2" />
              {t("cancelEnrollment")}
            </Button>
          ) : (
            <>
              <Button
                variant="flame"
                className="w-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnroll?.();
                }}
                disabled={disableEnroll || isIncompleteSchedule}
                title={isIncompleteSchedule ? t("noSpecificDate") : undefined}
              >
                <span>{t("enroll")}</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="w-full border-[--color-border-subtle] text-slate-medium dark:border-[--color-border-strong] dark:text-cloud-medium hover:bg-[--swatch--ivory-medium] dark:hover:bg-[--swatch--slate-dark]/70"
                onClick={handleViewDetailsClick}
              >
                {t("viewDetails")}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
