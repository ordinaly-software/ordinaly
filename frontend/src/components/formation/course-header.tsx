"use client";

import Image from 'next/image';
import { Euro, CheckCircle } from 'lucide-react';
import { ModalCloseButton } from "../ui/modal-close-button";
import { useTranslations } from 'next-intl';
import React from 'react';

interface CourseHeaderProps {
  course: {
    image: string;
    title: string;
    subtitle?: string;
    price?: number;
    periodicity: string;
  };
  isEnrolled: boolean;
  onClose: () => void;
}

// Custom image loader to handle potential URL issues (kept local to header)
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src || src === 'undefined' || src === 'null') {
    return `/api/placeholder/600/400`;
  }
  
  if (src.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ordinaly.duckdns.org';
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

  return (
  <div className="relative w-full min-h-[10rem] sm:min-h-[14rem] md:h-64 lg:h-72 bg-gray-200 overflow-hidden group">
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
          {isEnrolled && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t('enrolled')}
            </span>
          )}
        </div>
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 leading-tight">{course.title}</h1>
        {course.subtitle && (
          <p className="hidden sm:block text-gray-100 text-base md:text-sm max-w-none leading-relaxed">{course.subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default React.memo(CourseHeader);
