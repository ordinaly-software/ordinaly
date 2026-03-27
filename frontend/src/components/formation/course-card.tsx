import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Calendar, MapPin, Users, UserCheck, UserX, ArrowRight, GraduationCap } from "lucide-react";
import type { Course } from "@/utils/pdf-generator";
import { openPastCourseWhatsApp } from "@/utils/past-course";

interface CourseCardProps {
  course: Course;
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
}

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src || src === 'undefined' || src === 'null') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xMiA2LTItMiA0IDRoNCIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
  }
  return `${src}?w=${width}&q=${quality || 75}`;
};

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
  inProgress = false,
}) => {
  const t = useTranslations("formation");
  const isIncompleteSchedule = !course.start_date || course.start_date === "0000-00-00" || !course.end_date || course.end_date === "0000-00-00" || !course.start_time || !course.end_time;
  const isPastVariant = variant === "past";

  const handleRequestEdition = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    openPastCourseWhatsApp(course, t);
  };

  const handleViewDetailsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (onViewDetails) onViewDetails();
  };

  return (
    <div
      className={[
        `group relative overflow-hidden rounded-3xl w-full mx-auto transition-all duration-500`,
        "bg-[--swatch--ivory-light] dark:bg-[--swatch--slate-medium]",
        "border border-[--color-border-subtle] dark:border-[--color-border-strong]",
        variant === "upcoming"
          ? `flex flex-col sm:flex-row hover:border-clay/40 dark:hover:border-clay/40 hover:shadow-2xl hover:shadow-clay/10 hover:-translate-y-2${highlightUpcoming ? " ring-2 ring-clay shadow-2xl scale-[1.025] z-10" : ""}`
          : "opacity-75 hover:opacity-100",
        onViewDetails ? "cursor-pointer" : "",
      ].join(" ")}
      style={highlightUpcoming ? { boxShadow: "0 0 0 3px var(--swatch--clay), 0 8px 32px 0 var(--swatch--clay)44" } : {}}
      onClick={onViewDetails ? () => onViewDetails() : undefined}
      role={onViewDetails ? "button" : undefined}
      tabIndex={onViewDetails ? 0 : undefined}
      onKeyDown={onViewDetails ? (e) => { if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); onViewDetails(); } } : undefined}
    >
      {/* Course Image */}
      <div className={variant === "upcoming" ? "relative h-52 sm:h-auto sm:w-2/5 sm:shrink-0 overflow-hidden sm:rounded-l-3xl" : "relative h-48 overflow-hidden"}>
        <Image
          loader={imageLoader}
          src={course.image}
          alt={course.title}
          fill
          sizes={variant === "upcoming" ? "(max-width: 768px) 100vw, (max-width: 1024px) 70vw, 50vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          className={`object-cover ${variant === "upcoming" ? "group-hover:scale-110 transition-transform duration-500" : ""}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {variant === "past" ? (
          <div className="absolute inset-x-4 top-4 z-10 flex justify-end">
            <span className="bg-[--swatch--slate-light] text-white px-3 py-1 rounded-full text-sm font-medium">
              {t("finished")}
            </span>
          </div>
        ) : (
          <div className="absolute inset-x-4 top-4 z-20 flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[--swatch--ivory-light] dark:bg-[--swatch--slate-dark] text-slate-dark dark:text-ivory-light px-3 py-1 rounded-full text-sm font-semibold">
                {course.price ? `€${course.price}` : t("free")}
              </span>

              {inProgress && (
                <span className="bg-clay text-white px-4 py-1 rounded-full text-sm sm:text-base font-bold shadow-lg">
                  {t("inProgress")}
                </span>
              )}

              {!inProgress && highlightUpcoming && (
                <span className="bg-clay text-white px-4 py-1 rounded-full text-sm sm:text-base font-bold shadow-lg">
                  {t("startsSoon")}
                </span>
              )}
            </div>

            {enrolled && (
              <span className="bg-clay text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                {t("enrolled")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={variant === "upcoming" ? "p-5 sm:p-6" : "p-6"}>
        <h3 className={`font-bold text-slate-dark dark:text-ivory-light mb-3 break-words whitespace-pre-line ${variant === "upcoming" ? "text-xl group-hover:text-clay transition-colors duration-300" : "text-xl"}`}>
          {course.title}
        </h3>

        {course.subtitle && (
          <p className={`text-slate-medium dark:text-cloud-medium break-words whitespace-pre-line ${variant === "upcoming" ? "text-sm mb-3" : "text-sm mb-3"}`}>
            {course.subtitle}
          </p>
        )}

        <div className={`${variant === "upcoming" ? "space-y-3 mb-8" : "space-y-2 mb-6"}`}>
          <div className={`flex items-center gap-2 text-slate-medium dark:text-cloud-medium ${variant === "upcoming" ? "text-sm" : "text-sm"}`}>
            <Calendar className="w-5 h-5 text-clay shrink-0" />
            <span>
              {course.start_date && course.start_date !== "0000-00-00"
                ? new Date(course.start_date).toLocaleDateString()
                : t("noSpecificDate")}
            </span>
          </div>
          <div className={`flex items-center gap-2 text-slate-medium dark:text-cloud-medium ${variant === "upcoming" ? "text-sm" : "text-sm"}`}>
            <MapPin className="w-5 h-5 text-clay shrink-0" />
            {typeof course.location === "string" && course.location.trim() !== "" && course.location !== "null" ? (
              /online|virtual/i.test(course.location)
                ? <span className="underline cursor-default text-clay">{course.location}</span>
                : <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-clay text-clay transition"
                    title={course.location}
                  >
                    {course.location}
                  </a>
            ) : (
              <span>{t("locationSoon")}</span>
            )}
          </div>
          <div className={`flex items-center gap-2 text-slate-medium dark:text-cloud-medium ${variant === "upcoming" ? "text-sm" : "text-sm"}`}>
            <Users className="w-5 h-5 text-clay shrink-0" />
            <span>{t("maxAttendeesCount", { count: course.max_attendants })}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          {isPastVariant ? (
            <>
              <Button
                onClick={handleRequestEdition}
                variant="flame"
                className="w-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-14 text-lg"
              >
                {t("wantNewEdition")}
              </Button>
              <Button
                variant="outline"
                onClick={handleViewDetailsClick}
                className="w-full border-[--color-border-subtle] dark:border-[--color-border-strong] text-slate-medium dark:text-cloud-medium hover:bg-[--swatch--ivory-medium] dark:hover:bg-[--swatch--slate-dark] h-12 transition-all duration-300"
              >
                {t("viewDetails")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </>
          ) : (
            <>
              {enrolled ? (
                <Button
                  onClick={(e) => { e.stopPropagation(); if (!disableUnenroll && onCancel) onCancel(); }}
                  variant="outline"
                  className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 h-11 text-base"
                  disabled={disableUnenroll}
                  title={disableUnenroll && unenrollRestrictionReason ? unenrollRestrictionReason : undefined}
                >
                  <UserX className="w-5 h-5 mr-2" />
                  {t("cancelEnrollment")}
                </Button>
              ) : (
                <Button
                  onClick={(e) => { e.stopPropagation(); if (onEnroll) onEnroll(); }}
                  variant="flame"
                  className="w-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-11 text-base"
                  disabled={disableEnroll || isIncompleteSchedule}
                  title={isIncompleteSchedule ? t("noSpecificDate") : undefined}
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  {t("enroll")}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleViewDetailsClick}
                className="w-full border-clay text-clay hover:bg-clay hover:text-white h-11 text-base transition-all duration-300"
              >
                {t("viewDetails")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Hover gradient overlay */}
      {variant === "upcoming" && (
        <div className="absolute inset-0 bg-gradient-to-br from-clay/5 to-cobalt/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />
      )}
    </div>
  );
};

export default CourseCard;
