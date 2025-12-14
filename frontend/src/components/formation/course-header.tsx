"use client";

import Image from 'next/image';
import { Euro, CheckCircle } from 'lucide-react';
import { ModalCloseButton } from "../ui/modal-close-button";
import { useTranslations } from 'next-intl';
import React from 'react';

import type { Course } from '@/utils/pdf-generator';

interface CourseHeaderProps {
  course: Course;
  isEnrolled: boolean;
  onClose: () => void;
}

// Custom image loader to handle potential URL issues (kept local to header)
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src || src === 'undefined' || src === 'null') {
    return `/api/placeholder/600/400`;
  }
  
  if (src.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
    return `${baseUrl}${src}?w=${width}&q=${quality || 75}`;
  }
  
  return `${src}?w=${width}&q=${quality || 75}`;
};

const getPeriodicityDisplay = (periodicity: string, t: (key: string, values?: Record<string, string | number | Date> | undefined) => string) => {
  try {
    return t(`periodicity.${periodicity}`);
  } catch {
    return periodicity;
  }
};

const CourseHeader = ({ course, isEnrolled, onClose }: CourseHeaderProps) => {
  const t = useTranslations('formation.courseDetails');

  // Compute hasStarted/hasEnded (same logic as in formation-root)
  const now = new Date();
  const getDateTime = (dateStr: string, timeStr: string): Date | null => {
    if (!dateStr || dateStr === "0000-00-00" || !timeStr) return null;
    return new Date(`${dateStr}T${timeStr}`);
  };
  const startDateTime = getDateTime(course.start_date, course.start_time);
  const endDateTime = getDateTime(course.end_date, course.end_time);
  const hasEnded = !!(endDateTime && endDateTime <= now);
  const inProgress = !!(startDateTime && endDateTime && startDateTime <= now && endDateTime > now);

  return (
    <div className="relative w-full min-h-[10rem] md:h-44 lg:h-52 bg-gray-200 overflow-hidden group">
      {/* Blurred background */}
      <Image
        loader={imageLoader}
        src={course.image}
        alt={course.title}
        fill
        className="object-cover scale-105 blur-sm opacity-95"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        priority
        aria-hidden="true"
      />
      {/* Main image on top, sharp (kept for potential layering) */}
      <Image
        loader={imageLoader}
        src={course.image}
        alt={course.title}
        fill
        className="object-cover hidden"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      <div className="absolute top-3 right-3 z-20">
        <ModalCloseButton onClick={onClose} variant="overlay" size="md" />
      </div>
      <div className="absolute left-4 right-4 top-8 md:bottom-4 md:top-auto z-30">
        <div className="flex items-center gap-2 mb-2 flex-wrap pt-1 md:pt-0">
          {course.price !== null && course.price !== undefined && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
              <Euro className="w-3 h-3 mr-1" />
              €{course.price}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue text-white">
            {getPeriodicityDisplay(course.periodicity, t)}
          </span>
          {hasEnded && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gray-400 text-white">
              {t('finished')}
            </span>
          )}
          {!hasEnded && inProgress && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-[#FFB800] text-white">
              {t('inProgress')}
            </span>
          )}
          {isEnrolled && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t('enrolled')}
            </span>
          )}
        </div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-0 leading-tight">{course.title}</h1>
      </div>
    </div>
  );
};

export default React.memo(CourseHeader);
