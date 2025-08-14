import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FileText, Edit, Trash2, Eye, Users, CheckCircle } from "lucide-react";
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

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
}
interface AdminCourseCardProps {
  course: Course;
  isFinished: boolean;
  selected: boolean;
  onSelect: (id: number) => void;
  onView: (course: Course) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
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
  t,
  tAdmin,
  dateLocale,
  formatCourseSchedule,
  availableSpots,
  enrollmentPercentage,
}) => {
  return (
    <Card
      className={`${isFinished 
        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 opacity-75' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      } cursor-pointer hover:shadow-md transition-shadow duration-200`}
      onClick={() => onView(course)}
    >
      <CardContent className="p-4">
        {/* Mobile layout */}
        <div className="block md:hidden">
          <div className="relative w-full">
            <input
              type="checkbox"
              checked={selected}
              onChange={e => {
                e.stopPropagation();
                onSelect(course.id);
              }}
              onClick={e => e.stopPropagation()}
              disabled={isFinished}
              className="absolute top-2 left-2 z-10 rounded border-gray-300 text-green focus:ring-green disabled:opacity-50 bg-white/80"
            />
            <div className={`w-full h-40 relative rounded-lg overflow-hidden ${isFinished ? 'grayscale' : 'bg-gray-100 dark:bg-gray-700'}`}>
              {course.image && course.image !== 'undefined' && course.image !== 'null' ? (
                <Image
                  loader={imageLoader}
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              )}
              {/* Finished icon overlay for finished courses */}
              {isFinished && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                  <CheckCircle className="h-10 w-10 text-white opacity-90" />
                </div>
              )}
            </div>
            {/* Buttons below image for better usability */}
            <div className="flex flex-row gap-2 mt-2 justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={e => {
                  e.stopPropagation();
                  onView(course);
                }}
                className="text-[#22A60D] hover:text-[#22A010] hover:bg-[#22A60D]/10 w-8 h-8"
                tabIndex={0}
                aria-label={t('view')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {!isFinished && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={e => {
                      e.stopPropagation();
                      onEdit(course);
                    }}
                    className="text-blue hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-8 h-8"
                    tabIndex={0}
                    aria-label={t('edit')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(course);
                    }}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 w-8 h-8"
                    tabIndex={0}
                    aria-label={t('delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-xl font-bold ${isFinished ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{course.title}</h3>
            {course.subtitle && (
              <div className={`text-base mb-1 ${isFinished ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>{course.subtitle}</div>
            )}
            {/* Description hidden on small screens */}
          </div>
        </div>
        {/* Desktop layout */}
        <div className="hidden md:flex items-start space-x-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={e => {
              e.stopPropagation();
              onSelect(course.id);
            }}
            onClick={e => e.stopPropagation()}
            disabled={isFinished}
            className="mt-1 rounded border-gray-300 text-green focus:ring-green disabled:opacity-50"
          />
          <div className={`w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0 ${isFinished ? 'grayscale' : 'bg-gray-100 dark:bg-gray-700'}`}>
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
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            )}
            {isFinished && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className={`text-lg font-semibold ${isFinished ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{course.title}</h3>
                </div>
                {course.subtitle && (
                  <div className={`text-sm mb-1 ${isFinished ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>{course.subtitle}</div>
                )}
                <div className={`text-sm mb-2 ${isFinished ? 'text-gray-600 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  <MarkdownRenderer>
                    {course.description.length > 200 ? `${course.description.substring(0, 200)}...` : course.description}
                  </MarkdownRenderer>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{t("courseCard.enrollments")}: {course.enrolled_count || 0}/{course.max_attendants}</span>
                    <span>{Math.round(enrollmentPercentage)}% {t("courseCard.full")}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-300 ${enrollmentPercentage >= 100 ? 'bg-red-500' : enrollmentPercentage >= 80 ? 'bg-orange-500' : 'bg-[#22A60D]'}`} style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}></div>
                  </div>
                </div>
                <div className={`flex flex-wrap items-center gap-4 text-xs ${isFinished ? 'text-gray-500 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  <span>{tAdmin("labels.price")}: {course.price ? `€${course.price}` : t("contactForQuote")}</span>
                  <span>{tAdmin("labels.location")}: {typeof course.location === 'string' && course.location.trim() !== '' && course.location !== 'null' ? course.location : t('locationSoon')}</span>
                  <span>{tAdmin("labels.schedule")}: {formatCourseSchedule(course)}</span>
                  <span className={`flex items-center space-x-1 ${availableSpots === 0 ? 'text-red-600 font-medium' : ''}`}>
                    <Users className="h-3 w-3" />
                    <span>{availableSpots} {t("courseCard.spotsAvailable")}</span>
                  </span>
                  <span>{tAdmin("labels.created")}: {new Date(course.created_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-0 md:ml-4 mt-2 md:mt-0 items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    onView(course);
                  }}
                  className="text-[#22A60D] hover:text-[#22A010] hover:bg-[#22A60D]/10"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {!isFinished && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(course);
                      }}
                      className="text-blue hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(course);
                      }}
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
