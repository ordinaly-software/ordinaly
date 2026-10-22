"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Euro, Users, User, XCircle, Calendar, MapPin, Clock, Copy, Edit, Trash2 } from "lucide-react";
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import SharePostButtons from '@/components/blog/share-post-buttons';
import { Modal, ModalFooter } from "@/components/ui/modal";
import EnrolledMembers from "@/components/admin/enrolled-members";
import { HeroVideoDialog } from "@/components/home/hero-video-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Course {
  id: number;
  slug?: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  youtube_video_url?: string | null;
  price?: string | null;
  location: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  periodicity: string;
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
  next_occurrences?: string[];
  draft?: boolean;
}

interface Enrollment {
  id: number;
  user: number;
  enrolled_at: string;
  user_details?: {
    name?: string;
    surname?: string;
    email?: string;
    company?: string;
  };
}

interface CourseVisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  enrollments: Enrollment[];
  isLoadingEnrollments: boolean;
  t: (key: string, params?: Record<string, string | number | Date>) => string;
  dateLocale: string;
  formatWeekdays: (weekdays: number[]) => string;
  /** Admin actions; hidden for finished courses. */
  canManage: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

// Custom image loader to handle potential URL issues
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src || src === 'undefined' || src === 'null') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xMiA2LTItMiA0IDRoNCIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
  }
  return `${src}?w=${width}&q=${quality || 75}`;
};

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex justify-between gap-4 text-sm">
    <span className="flex-shrink-0 text-slate-light dark:text-cloud-medium">{label}:</span>
    <span className="min-w-0 break-words text-right font-medium text-slate-dark dark:text-white">{children}</span>
  </div>
);

const SectionTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-dark dark:text-white">
    {icon}
    {children}
  </h3>
);

const CourseVisualizationModal: React.FC<CourseVisualizationModalProps> = ({
  isOpen,
  onClose,
  course,
  enrollments,
  isLoadingEnrollments,
  t,
  dateLocale,
  formatWeekdays,
  canManage,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const [portraitCourseId, setPortraitCourseId] = useState<number | null>(null);
  if (!course) return null;

  const hasImage = !!course.image && course.image !== "undefined" && course.image !== "null";
  const enrolled = course.enrolled_count || 0;
  const vacant = course.max_attendants - enrolled;
  const percentage = (enrolled / course.max_attendants) * 100;
  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(dateLocale, { year: "numeric", month: "numeric", day: "numeric" });
  const hasValidDate = (value: string) => !!value && value !== "0000-00-00";
  const hasLocation = typeof course.location === "string" && course.location.trim() !== "" && course.location !== "null";

  const stats = [
    { icon: Users, value: enrolled, label: t("details.enrolled"), tone: "bg-[color-mix(in_srgb,var(--swatch--clay)_12%,transparent)] text-[var(--swatch--clay)]" },
    { icon: User, value: course.max_attendants, label: t("details.capacity"), tone: "bg-[color-mix(in_srgb,var(--swatch--cobalt)_10%,transparent)] dark:bg-[color-mix(in_srgb,var(--swatch--cobalt)_20%,transparent)] text-cobalt dark:text-cobalt-light" },
    { icon: XCircle, value: vacant, label: t("details.vacant"), tone: "bg-orange-100 dark:bg-orange-900/30 text-orange-600" },
    { icon: Euro, value: course.price ? `${Math.round(Number(course.price))}` : t("contactForQuote"), label: t("details.price"), tone: "bg-[color-mix(in_srgb,var(--swatch--cobalt)_10%,transparent)] dark:bg-[color-mix(in_srgb,var(--swatch--cobalt)_20%,transparent)] text-cobalt dark:text-cobalt-light" },
  ];

  const footer = canManage ? (
    <ModalFooter>
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        variant="ghost"
        onClick={onDelete}
        className="mr-auto text-red-600 hover:bg-red-50 hover:text-red-800 dark:hover:text-red-300 dark:hover:bg-red-900/20 active:scale-[0.97] transition-transform motion-reduce:transition-none"
      >
        <Trash2 className="h-4 w-4" />
        <span>{t("confirmDelete.delete")}</span>
      </Button>
      <Button
        variant="ghost"
        onClick={onDuplicate}
        className="text-slate-medium dark:text-cloud-medium hover:bg-[var(--swatch--ivory-medium)] dark:hover:bg-[var(--swatch--slate-medium)] active:scale-[0.97] transition-transform motion-reduce:transition-none"
      >
        <Copy className="h-4 w-4" />
        <span>{t("duplicate")}</span>
      </Button>
      <Button
        onClick={onEdit}
        className="bg-clay-fill dark:bg-clay-fill hover:bg-[var(--swatch--flame)] text-white dark:text-white active:scale-[0.97] transition-transform motion-reduce:transition-none"
      >
        <Edit className="h-4 w-4" />
        <span>{t("editCourse")}</span>
      </Button>
    </div>
    </ModalFooter>
  ) : undefined;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="md:max-w-5xl lg:max-w-6xl" footer={footer}>
      {/* Cover: shown whole at its natural proportions, never cropped */}
      {hasImage && (
        <div className="bg-slate-100 [container-type:inline-size] dark:bg-black/30">
          <Image
            loader={imageLoader}
            src={course.image}
            alt={course.title}
            width={1600}
            height={900}
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              setPortraitCourseId(naturalHeight > naturalWidth ? course.id : null);
            }}
            // Landscape: shown whole. Portrait: cropped to a square so it never towers over the text.
            className={cn(
              "mx-auto",
              portraitCourseId === course.id
                ? "h-[min(50dvh,100cqw)] w-[min(50dvh,100cqw)] object-cover"
                : "h-auto max-h-[50dvh] w-full object-contain"
            )}
            sizes="(max-width: 768px) 100vw, 1152px"
            priority
          />
        </div>
      )}

      <div className="px-5 pb-8 pt-5 sm:px-8 md:pt-6">
        <header className={cn("mb-6", !hasImage && "pr-10")}>
          <div className="mb-3 flex flex-wrap gap-2">
            {course.draft && (
              <span className="inline-flex items-center rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">
                {t("form.draftMode")}
              </span>
            )}
            {course.price !== null && course.price !== undefined && (
              <span className="inline-flex items-center rounded-full bg-clay-fill px-2.5 py-1 text-xs font-medium text-white dark:bg-clay-fill dark:text-white">
                €{course.price}
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-cobalt px-2.5 py-1 text-xs font-medium text-white">
              {t(`form.periodicity.${course.periodicity}`)}
            </span>
          </div>
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-slate-dark dark:text-ivory-light md:text-3xl">
            {course.title}
          </h2>
          {course.subtitle && (
            <p className="mt-2 break-words text-base text-slate-medium dark:text-cloud-medium">{course.subtitle}</p>
          )}
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
          {/* Main content */}
          <div className="min-w-0 space-y-6">
            {course.youtube_video_url && (
              <HeroVideoDialog
                videoUrl={course.youtube_video_url}
                thumbnailAlt={course.title}
                title={course.title}
                playLabel={t("details.playVideo")}
              />
            )}

            <div className="prose dark:prose-invert max-w-none break-words text-slate-medium dark:text-cloud-medium prose-a:break-all">
              <MarkdownRenderer>{course.description}</MarkdownRenderer>
            </div>

            {/* Next Occurrences */}
            {course.next_occurrences && course.next_occurrences.length > 0 && (
              <div>
                <SectionTitle icon={<Clock className="h-5 w-5 text-cobalt dark:text-cobalt-light" />}>
                  {t("details.upcomingSessions")}
                </SectionTitle>
                <div className="grid grid-cols-1 gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--swatch--cobalt)_10%,transparent)] p-4 dark:bg-[color-mix(in_srgb,var(--swatch--cobalt)_20%,transparent)] sm:grid-cols-2 xl:grid-cols-3">
                  {course.next_occurrences.slice(0, 6).map((occurrence: string, idx: number) => (
                    <div key={idx} className="rounded-xl bg-white p-3 dark:bg-white/[0.06]">
                      <p className="font-medium text-slate-dark dark:text-white">{formatDate(occurrence)}</p>
                      <p className="text-sm text-slate-light dark:text-cloud-medium">
                        {course.start_time.substring(0, 5)} - {course.end_time.substring(0, 5)}
                      </p>
                    </div>
                  ))}
                  {course.next_occurrences.length > 6 && (
                    <p className="text-sm italic text-slate-light dark:text-cloud-medium sm:col-span-2 xl:col-span-3">
                      +{course.next_occurrences.length - 6} {t("details.moreSessions")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Enrolled Members */}
            <EnrolledMembers
              enrollments={enrollments}
              isLoading={isLoadingEnrollments}
              t={t}
              dateLocale={dateLocale}
            />
          </div>

          {/* Sidebar */}
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-0 lg:self-start">
            {/* Enrollment */}
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
              <div className="mb-3 grid grid-cols-2 gap-2">
                {stats.map(({ icon: Icon, value, label, tone }) => (
                  <div key={label} className={cn("min-w-0 rounded-xl p-3", tone)}>
                    <div className="flex items-center justify-between gap-2">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <p className="truncate text-lg font-bold">{value}</p>
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-light dark:text-cloud-medium">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-dark dark:text-white">{t("details.enrollmentStatus")}</h3>
                <span className="text-xs text-slate-light dark:text-cloud-medium">
                  {percentage.toFixed(1)}% {t("details.fullStatus")}
                </span>
              </div>
              <div className="mb-2 h-2 w-full rounded-full bg-ivory-dark dark:bg-white/10">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    enrolled >= course.max_attendants
                      ? "bg-red-500"
                      : percentage >= 80
                        ? "bg-orange-500"
                        : "bg-[var(--swatch--clay)]"
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between gap-2 text-xs text-slate-light dark:text-cloud-medium">
                <span>{enrolled} {t("details.enrolled").toLowerCase()}</span>
                <span>{vacant} {t("details.spotsRemaining")}</span>
              </div>
            </div>

            {/* Schedule */}
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
              <SectionTitle icon={<Calendar className="h-5 w-5 text-cobalt dark:text-cobalt-light" />}>
                {t("details.schedule")}
              </SectionTitle>
              <div className="space-y-2">
                <InfoRow label={t("details.startDate")}>
                  {hasValidDate(course.start_date) ? formatDate(course.start_date) : t("noSpecificDate")}
                </InfoRow>
                <InfoRow label={t("details.endDate")}>
                  {hasValidDate(course.end_date) ? formatDate(course.end_date) : t("noSpecificDate")}
                </InfoRow>
                <InfoRow label={t("details.time")}>
                  {course.start_time ? course.start_time.substring(0, 5) : "-"} - {course.end_time ? course.end_time.substring(0, 5) : "-"}
                </InfoRow>
                <InfoRow label={t("details.duration")}>
                  {course.duration_hours?.toFixed(1)} {t("details.hours")}
                </InfoRow>
                <InfoRow label={t("details.frequency")}>{t(`form.periodicity.${course.periodicity}`)}</InfoRow>
                {course.weekdays && course.weekdays.length > 0 && (
                  <InfoRow label={t("details.weekdays")}>{formatWeekdays(course.weekdays)}</InfoRow>
                )}
              </div>
            </div>

            {/* Location & logistics */}
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
              <SectionTitle icon={<MapPin className="h-5 w-5 text-[var(--swatch--clay)]" />}>
                {t("details.locationInfo")}
              </SectionTitle>
              <div className="space-y-2">
                <InfoRow label={t("details.location")}>{hasLocation ? course.location : t("locationSoon")}</InfoRow>
                <InfoRow label={t("details.timezone")}>{course.timezone}</InfoRow>
                <InfoRow label={t("details.created")}>{formatDate(course.created_at)}</InfoRow>
                <InfoRow label={t("details.lastUpdated")}>{formatDate(course.updated_at)}</InfoRow>
              </div>
            </div>

            <SharePostButtons title={course.title} excerpt={course.subtitle} slug={course.slug} />
          </aside>
        </div>
      </div>
    </Modal>
  );
};

export default CourseVisualizationModal;
