import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Calendar, MapPin, Users, UserCheck, UserX, ArrowRight, GraduationCap } from "lucide-react";
import type { Course } from "@/utils/pdf-generator";

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

  return (
    <Card
      className={`group relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${variant === "upcoming" ? `hover:border-[#1F8A0D] dark:hover:border-[#7CFC00] hover:shadow-2xl hover:shadow-[#1F8A0D]/10 transform hover:-translate-y-2${highlightUpcoming ? ' ring-4 ring-[#FFB800] border-[#FFB800] shadow-2xl scale-[1.025] z-10' : ''}` : "opacity-75 hover:opacity-100"} transition-all duration-500 w-full max-w-2xl mx-auto${onViewDetails ? ' cursor-pointer' : ''}`}
      style={variant === "upcoming" ? { minHeight: "520px", ...(highlightUpcoming ? { boxShadow: '0 0 0 4px #FFB80033, 0 8px 32px 0 #FFB80044' } : {}) } : {}}
      onClick={onViewDetails ? () => onViewDetails() : undefined}
      role={onViewDetails ? 'button' : undefined}
      tabIndex={onViewDetails ? 0 : undefined}
      onKeyDown={onViewDetails ? (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); onViewDetails(); } } : undefined}
    >
      <div className="relative">
        {/* Course Image */}
        <div className={variant === "upcoming" ? "relative h-72 md:h-80 lg:h-96 overflow-hidden" : "relative h-48 overflow-hidden"}>
          <Image
            loader={imageLoader}
            src={course.image}
            alt={course.title}
            fill
            sizes={variant === "upcoming" ? "(max-width: 768px) 100vw, (max-width: 1024px) 70vw, 50vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"}
            className={`object-cover ${variant === "upcoming" ? "group-hover:scale-110 transition-transform duration-500" : ""}`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Only show badges if not finished */}
          {variant === "past" ? (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {t("finished")}
              </div>
            </div>
          ) : (
            <>
              {/* In Progress Badge */}
              {inProgress && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-[#FFB800] text-white px-4 py-1 rounded-full text-base font-bold shadow-lg border-2 border-[#FFB800]">
                    {t('inProgress')}
                  </div>
                </div>
              )}
              {/* Upcoming Badge */}
              {!inProgress && highlightUpcoming && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-[#FFB800] text-white px-4 py-1 rounded-full text-base font-bold shadow-lg border-2 border-[#FFB800]">
                    {t('startsSoon')}
                  </div>
                </div>
              )}
              {/* Enrollment Status Badge */}
              {enrolled && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-[#1F8A0D] dark:bg-[#7CFC00] text-white dark:text-black px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
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
            </>
          )}
        </div>

        <CardContent className={variant === "upcoming" ? "p-8" : "p-6"}>
          {/* Course Title */}
          <h3 className={`font-bold text-gray-900 dark:text-white mb-3 break-words whitespace-pre-line ${variant === "upcoming" ? "text-2xl group-hover:text-[#1F8A0D] dark:hover:text-[#B8FF9A] transition-colors duration-300" : "text-xl"}`}>
            {course.title}
          </h3>

          {/* Course Subtitle */}
          {course.subtitle && (
            <p className={`text-gray-600 dark:text-gray-200 break-words whitespace-pre-line ${variant === "upcoming" ? "text-base mb-4" : "text-sm mb-3"}`}>
              {course.subtitle}
            </p>
          )}

          {/* Course Meta Information */}
          <div className={`mb-8 ${variant === "upcoming" ? "space-y-3" : "space-y-2 mb-6"}`}>
            <div className={`flex items-center gap-2 text-gray-600 dark:text-gray-200 ${variant === "upcoming" ? "text-base" : "text-sm"}`}>
              <Calendar className="w-5 h-5 text-[#1F8A0D] dark:text-[#7CFC00]" />
              <span>
                {course.start_date && course.start_date !== "0000-00-00" 
                  ? new Date(course.start_date).toLocaleDateString()
                  : t('noSpecificDate')}
              </span>
            </div>
            <div className={`flex items-center gap-2 text-gray-600 dark:text-gray-200 ${variant === "upcoming" ? "text-base" : "text-sm"}`}>
              <MapPin className="w-5 h-5 text-[#1F8A0D] dark:text-[#7CFC00]" />
                    {typeof course.location === 'string' && course.location.trim() !== '' && course.location !== 'null' ? (
                      /online|virtual/i.test(course.location)
                        ? <span className="underline cursor-default text-[#1F8A0D] dark:text-[#7CFC00]">{course.location}</span>
                        : <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-[#1F8A0D] dark:hover:text-[#7CFC00] dark:text-[#7CFC00] transition"
                            title={course.location}
                          >
                            {course.location}
                          </a>
                    ) : (
                      <span>{t('locationSoon')}</span>
                    )}
            </div>
            <div className={`flex items-center gap-2 text-gray-600 dark:text-gray-200 ${variant === "upcoming" ? "text-base" : "text-sm"}`}>
              <Users className="w-5 h-5 text-[#1F8A0D] dark:text-[#7CFC00]" />
              <span>{t("maxAttendeesCount", { count: course.max_attendants })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            {variant === "upcoming" && (
              enrolled ? (
                <Button
                  onClick={(e) => { e.stopPropagation(); if (!disableUnenroll && onCancel) onCancel(); }}
                  variant="outline"
                  className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 h-14 text-lg"
                  disabled={disableUnenroll}
                  title={disableUnenroll && unenrollRestrictionReason ? unenrollRestrictionReason : undefined}
                >
                  <UserX className="w-5 h-5 mr-2" />
                  {t("cancelEnrollment")}
                </Button>
              ) : (
                <Button
                  onClick={(e) => { e.stopPropagation(); if (onEnroll) onEnroll(); }}
                  className="w-full bg-[#0d6e0c] hover:bg-[#0A4D08] dark:bg-[#7CFC00] dark:hover:bg-[#6BFF52] text-white dark:text-[#0B1B17] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-14 text-lg"
                  disabled={disableEnroll || isIncompleteSchedule}
                  title={isIncompleteSchedule ? t('noSpecificDate') : undefined}
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  {t("enroll")}
                </Button>
              )
            )}
            <Button
              variant={variant === "upcoming" ? "outline" : "outline"}
              onClick={(e) => { e.stopPropagation(); if (onViewDetails) onViewDetails(); }}
              className={`w-full ${variant === "upcoming" ? "border-[#1F8A0D] dark:border-[#7CFC00] text-[#1F8A0D] dark:text-white hover:bg-[#0d6e0c] dark:hover:bg-[#7CFC00] dark:hover:text-[#0B1B17] hover:text-white h-14 text-lg" : "border-gray-400 text-gray-600 hover:bg-gray-100 hover:text-gray-800 h-12"} transition-all duration-300`}
            >
              {t("viewDetails")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </div>
      {/* Hover Effect Background */}
      {variant === "upcoming" && <div className="absolute inset-0 bg-gradient-to-br from-[#2BCB5C]/5 to-[#9333EA]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>}
    </Card>
  );
};

export default CourseCard;
