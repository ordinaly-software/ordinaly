import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FileText, Edit, Trash2, Eye, Users, CheckCircle, Copy } from "lucide-react";
import dynamic from "next/dynamic";
const MarkdownRenderer = dynamic(() => import("@/components/ui/markdown-renderer").then(mod => mod.MarkdownRenderer), { ssr: false });

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
  draft?: boolean;
}
interface AdminCourseCardProps {
  course: Course;
  isFinished: boolean;
  selected: boolean;
  onSelect: (id: number) => void;
  onView: (course: Course) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  onDuplicate: (course: Course) => void;
  t: (key: string, params?: Record<string, string | number | Date>) => string;
  tAdmin: (key: string, params?: Record<string, string | number | Date>) => string;
  dateLocale: string;
  formatCourseSchedule: (course: Course) => string;
  availableSpots: number;
  enrollmentPercentage: number;
}

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src || src === 'undefined' || src === 'null') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xMiA2LTItMiA0IDRoNCIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
  }
  return `${src}?w=${width}&q=${quality || 75}`;
};

const AdminCourseCard: React.FC<AdminCourseCardProps> = ({
  course,
  isFinished,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  t,
  tAdmin,
  dateLocale,
  formatCourseSchedule,
  availableSpots,
  enrollmentPercentage,
}) => {
  // Color for hover border/shadow (use clay for courses)
  const courseColor = "var(--swatch--clay)";
  const hasImage = course.image && course.image !== 'undefined' && course.image !== 'null';
  const hasLocation = typeof course.location === 'string' && course.location.trim() !== '' && course.location !== 'null';
  const actionButtonClass = "active:scale-[0.97] transition-transform motion-reduce:transition-none";

  const actions = (className: string, buttonClassName = "") => (
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onView(course)}
        className={`text-[var(--swatch--clay)] hover:bg-[color-mix(in_srgb,var(--swatch--clay)_10%,transparent)] ${actionButtonClass} ${buttonClassName}`}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {!isFinished && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(course)}
            className={`text-slate-medium dark:text-cloud-medium hover:bg-black/5 dark:hover:bg-white/10 ${actionButtonClass} ${buttonClassName}`}
            aria-label={t("duplicate")}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(course)}
            className={`text-cobalt dark:text-cobalt-light hover:bg-[color-mix(in_srgb,var(--swatch--cobalt)_10%,transparent)] ${actionButtonClass} ${buttonClassName}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(course)}
            className={`text-red-600 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 ${actionButtonClass} ${buttonClassName}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Card
      className={
        `bg-[var(--swatch--ivory-light)] dark:bg-[var(--swatch--slate-medium)] border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] transition-all duration-300 hover:shadow-lg relative rounded-2xl` +
        (isFinished ? ' opacity-75 grayscale' : '')
      }
      style={{
        '--hover-border-color': courseColor,
        '--hover-shadow-color': `${courseColor}10`,
      } as React.CSSProperties}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = courseColor;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 10px 25px -12px ${courseColor}15`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
      }}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(course.id)}
            disabled={isFinished}
            className="mt-1 rounded border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] text-[var(--swatch--clay)] focus:ring-[var(--swatch--clay)] flex-shrink-0"
          />
          <div className="w-16 h-16 sm:w-20 sm:h-20 relative rounded-xl overflow-hidden flex-shrink-0 bg-[var(--swatch--oat)] dark:bg-[var(--swatch--slate-dark)]">
            {hasImage ? (
              <Image
                loader={imageLoader}
                src={course.image}
                alt={course.title}
                fill
                className="object-cover"
                sizes="80px"
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-[var(--swatch--cloud-dark)]" />
              </div>
            )}
            {isFinished && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                <CheckCircle className="h-8 w-8 text-white opacity-90" />
              </div>
            )}
          </div>
          <div
            className="flex-1 min-w-0 cursor-pointer hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-xl p-2 -m-2 transition-colors duration-200"
            onClick={() => onView(course)}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onView(course);
              }
            }}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-slate-dark dark:text-ivory-light break-words min-w-0">
                {course.title}
              </h3>
              {course.draft && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm flex-shrink-0">
                  {tAdmin("labels.draft")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm sm:text-base text-slate-light dark:text-cloud-medium mt-2">
              <span>{tAdmin("labels.price")}: {course.price ? `€${course.price}` : t("contactForQuote")}</span>
              <span className="break-words min-w-0">{tAdmin("labels.location")}: {hasLocation ? course.location : t('locationSoon')}</span>
              <span>{tAdmin("labels.schedule")}: {formatCourseSchedule(course)}</span>
              <span className={`flex items-center gap-1 ${availableSpots === 0 ? 'text-red-600 font-medium' : ''}`}>
                <Users className="h-4 w-4" />
                <span>{availableSpots} {t("courseCard.spotsAvailable")}</span>
              </span>
              <span>{tAdmin("labels.created")}: {new Date(course.created_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm text-slate-light dark:text-cloud-medium mb-1 mt-3">
              <span>{t("courseCard.enrollments")}: {course.enrolled_count || 0}/{course.max_attendants}</span>
              <span>{Math.round(enrollmentPercentage)}% {t("courseCard.full")}</span>
            </div>
            <div className="w-full bg-[var(--swatch--oat)] dark:bg-[var(--swatch--slate-dark)] rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-300 ${enrollmentPercentage >= 100 ? 'bg-red-500' : enrollmentPercentage >= 80 ? 'bg-orange-500' : 'bg-[var(--swatch--clay)]'}`} style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}></div>
            </div>
          </div>
          {/* Actions: column at the right from sm up */}
          {actions("hidden sm:flex flex-col gap-2 flex-shrink-0")}
        </div>
        {/* Actions: full-width row below the content on mobile */}
        {actions("flex sm:hidden gap-2 mt-3 pt-3 border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]", "flex-1")}
      </CardContent>
    </Card>
  );
};

export default React.memo(AdminCourseCard);
