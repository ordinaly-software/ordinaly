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
}) => {
  const t = useTranslations("formation");
  const isIncompleteSchedule = !course.start_date || course.start_date === "0000-00-00" || !course.end_date || course.end_date === "0000-00-00" || !course.start_time || !course.end_time;

  return (
    <Card
      className={`group relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${variant === "upcoming" ? "hover:border-[#22A60D] hover:shadow-2xl hover:shadow-[#22A60D]/10 transform hover:-translate-y-2" : "opacity-75 hover:opacity-100"} transition-all duration-500 w-full max-w-2xl mx-auto`}
      style={variant === "upcoming" ? { minHeight: "520px" } : {}}
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

          {/* Enrollment Status Badge */}
          {variant === "upcoming" && enrolled && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-[#22A60D] text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                {t("enrolled")}
              </div>
            </div>
          )}

          {/* Past Course Badge */}
          {variant === "past" && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {t("finished")}
              </div>
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white px-3 py-1 rounded-full text-sm font-semibold">
              {course.price ? `€${course.price}` : t("free")}
            </div>
          </div>
        </div>

        <CardContent className={variant === "upcoming" ? "p-8" : "p-6"}>
          {/* Course Title */}
          <h3 className={`font-bold text-gray-900 dark:text-white mb-3 break-words whitespace-pre-line ${variant === "upcoming" ? "text-2xl group-hover:text-[#22A60D] transition-colors duration-300" : "text-xl"}`}>
            {course.title}
          </h3>

          {/* Course Subtitle */}
          {course.subtitle && (
            <p className={`text-gray-600 dark:text-gray-400 break-words whitespace-pre-line ${variant === "upcoming" ? "text-base mb-4" : "text-sm mb-3"}`}>
              {course.subtitle}
            </p>
          )}

          {/* Course Meta Information */}
          <div className={`mb-8 ${variant === "upcoming" ? "space-y-3" : "space-y-2 mb-6"}`}>
            <div className={`flex items-center gap-2 text-gray-600 dark:text-gray-400 ${variant === "upcoming" ? "text-base" : "text-sm"}`}>
              <Calendar className="w-5 h-5 text-[#22A60D]" />
              <span>
                {course.start_date && course.start_date !== "0000-00-00" 
                  ? new Date(course.start_date).toLocaleDateString()
                  : t('noSpecificDate')}
              </span>
            </div>
            <div className={`flex items-center gap-2 text-gray-600 dark:text-gray-400 ${variant === "upcoming" ? "text-base" : "text-sm"}`}>
              <MapPin className="w-5 h-5 text-[#22A60D]" />
              {typeof course.location === 'string' && course.location.trim() !== '' && course.location !== 'null' ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#22A60D]"
                  title={course.location}
                >
                  {course.location}
                </a>
              ) : (
                <span>{t('locationSoon')}</span>
              )}
            </div>
            <div className={`flex items-center gap-2 text-gray-600 dark:text-gray-400 ${variant === "upcoming" ? "text-base" : "text-sm"}`}>
              <Users className="w-5 h-5 text-[#22A60D]" />
              <span>{t("maxAttendeesCount", { count: course.max_attendants })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            {variant === "upcoming" && (
              enrolled ? (
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 h-14 text-lg"
                >
                  <UserX className="w-5 h-5 mr-2" />
                  {t("cancelEnrollment")}
                </Button>
              ) : (
                <Button
                  onClick={onEnroll}
                  className="w-full bg-gradient-to-r from-[#22A60D] to-[#22A010] hover:from-[#22A010] hover:to-[#1E8B0C] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-14 text-lg"
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
              onClick={onViewDetails}
              className={`w-full ${variant === "upcoming" ? "border-[#22A60D] text-[#22A60D] hover:bg-[#22A60D] hover:text-white h-14 text-lg" : "border-gray-400 text-gray-600 hover:bg-gray-100 hover:text-gray-800 h-12"} transition-all duration-300`}
            >
              {t("viewDetails")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </div>
      {/* Hover Effect Background */}
      {variant === "upcoming" && <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/5 to-[#9333EA]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>}
    </Card>
  );
};

export default CourseCard;
