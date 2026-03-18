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
      {/* Draft badge */}
      {course.draft && (
        <>
          {/* Mobile and up to md: top-right */}
          <span className="absolute top-2 right-2 md:hidden bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
            {tAdmin("labels.draft")}
          </span>
          {/* Desktop md and up: bottom-right, next to action buttons */}
          <span className="hidden md:flex items-center absolute bottom-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded shadow z-10">
            {tAdmin("labels.draft")}
          </span>
        </>
      )}
      <CardContent className="p-4">
        {/* Mobile layout */}
        <div className="block sm:hidden">
          <div className="flex flex-row items-start gap-2 mb-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect(course.id)}
              disabled={isFinished}
              className="mt-1 rounded border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] text-[var(--swatch--clay)] focus:ring-[var(--swatch--clay)] flex-shrink-0"
            />
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--swatch--oat)] dark:bg-[var(--swatch--slate-dark)] relative">
              {course.image && course.image !== 'undefined' && course.image !== 'null' ? (
                <Image
                  loader={imageLoader}
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="64px"
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
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-base font-semibold text-slate-dark dark:text-ivory-light truncate max-w-[10rem]">
                  {course.title}
                </h3>
              </div>
              {course.subtitle && (
                <p className="text-xs text-slate-medium dark:text-cloud-medium mb-1 truncate max-w-[12rem]">{course.subtitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-light dark:text-cloud-medium mt-1">
                <span className="truncate max-w-[8rem]">{tAdmin("labels.price")}: {course.price ? `€${course.price}` : t("contactForQuote")}</span>
                <span className="truncate max-w-[7rem]">{tAdmin("labels.location")}: {typeof course.location === 'string' && course.location.trim() !== '' && course.location !== 'null' ? course.location : t('locationSoon')}</span>
              </div>
            </div>
          </div>
          {/* Action buttons row for mobile */}
          <div className="flex flex-row gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(course)}
              className="text-[var(--swatch--clay)] hover:bg-[var(--swatch--clay)]/10 w-full"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {!isFinished && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDuplicate(course)}
                  className="text-slate-medium dark:text-cloud-medium hover:bg-[var(--swatch--ivory-medium)] dark:hover:bg-[var(--swatch--slate-dark)]/40 w-full"
                  aria-label={t("duplicate")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(course)}
                  style={{ color: 'var(--swatch--cobalt)' }}
                  className="hover:bg-opacity-10 w-full"
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--swatch--cobalt)' + '10';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '';
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(course)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        {/* Desktop layout */}
        <div className="hidden sm:flex items-start space-x-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(course.id)}
            disabled={isFinished}
            className="mt-1 rounded border-gray-300 text-[var(--swatch--clay)] focus:ring-[var(--swatch--clay)]"
          />
          <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0 bg-[var(--swatch--oat)] dark:bg-[var(--swatch--slate-dark)]">
            {course.image && course.image !== 'undefined' && course.image !== 'null' ? (
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
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div
                className="flex-1 cursor-pointer hover:bg-[var(--swatch--ivory-medium)] dark:hover:bg-[var(--swatch--slate-dark)]/50 rounded-lg p-2 -m-2 transition-colors duration-200"
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
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-slate-dark dark:text-ivory-light">
                    {course.title}
                  </h3>
                </div>
                {course.subtitle && (
                  <p className="text-sm text-slate-medium dark:text-cloud-medium mb-2">{course.subtitle}</p>
                )}
                <div className="hidden md:block">
                  <MarkdownRenderer>
                    {course.description.length > 200 ? `${course.description.substring(0, 200)}...` : course.description}
                  </MarkdownRenderer>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-light dark:text-cloud-medium mt-2">
                  <span>{tAdmin("labels.price")}: {course.price ? `€${course.price}` : t("contactForQuote")}</span>
                  <span>{tAdmin("labels.location")}: {typeof course.location === 'string' && course.location.trim() !== '' && course.location !== 'null' ? course.location : t('locationSoon')}</span>
                  <span>{tAdmin("labels.schedule")}: {formatCourseSchedule(course)}</span>
                  <span className={`flex items-center space-x-1 ${availableSpots === 0 ? 'text-red-600 font-medium' : ''}`}>
                    <Users className="h-3 w-3" />
                    <span>{availableSpots} {t("courseCard.spotsAvailable")}</span>
                  </span>
                  <span>{tAdmin("labels.created")}: {new Date(course.created_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-light dark:text-cloud-medium mb-1 mt-2">
                  <span>{t("courseCard.enrollments")}: {course.enrolled_count || 0}/{course.max_attendants}</span>
                  <span>{Math.round(enrollmentPercentage)}% {t("courseCard.full")}</span>
                </div>
                <div className="w-full bg-[var(--swatch--oat)] dark:bg-[var(--swatch--slate-dark)] rounded-full h-2 mb-2">
                  <div className={`h-2 rounded-full transition-all duration-300 ${enrollmentPercentage >= 100 ? 'bg-red-500' : enrollmentPercentage >= 80 ? 'bg-orange-500' : 'bg-[var(--swatch--clay)]'}`} style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-0 md:ml-4 mt-2 md:mt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(course)}
                  className="text-[var(--swatch--clay)] hover:bg-[var(--swatch--clay)]/10"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {!isFinished && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicate(course)}
                      className="text-slate-medium dark:text-cloud-medium hover:bg-[var(--swatch--ivory-medium)] dark:hover:bg-[var(--swatch--slate-dark)]/40"
                      aria-label={t("duplicate")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(course)}
                      style={{ color: 'var(--swatch--cobalt)' }}
                      className="hover:bg-opacity-10"
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--swatch--cobalt)' + '10';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = '';
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(course)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(AdminCourseCard);
