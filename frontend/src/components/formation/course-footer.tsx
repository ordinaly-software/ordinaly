"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { GraduationCap } from 'lucide-react';

interface Props {
  shouldShowAuth: boolean;
  canEnroll: boolean;
  showFull: boolean;
  fullLabel: string;
  handleEnrollClick: () => void;
  onEnroll: () => void;
  showRequestEdition: boolean;
  hasEnded: boolean;
  onRequestEdition: () => void;
  requestEditionLabel: string;
  t: ReturnType<typeof useTranslations>;
}

const CourseFooter: React.FC<Props> = ({
  shouldShowAuth,
  canEnroll,
  showFull,
  fullLabel,
  handleEnrollClick,
  onEnroll,
  showRequestEdition,
  hasEnded,
  onRequestEdition,
  requestEditionLabel,
  t,
}) => {
  const showEdition = showRequestEdition && hasEnded;
  if (!showEdition && !shouldShowAuth && !canEnroll && !showFull) return null;

  return (
    <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--swatch--slate-medium)] px-5 sm:px-8 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.06)] lg:hidden">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        {showRequestEdition && hasEnded && (
          <Button
            onClick={onRequestEdition}
            className="w-full bg-clay-fill dark:bg-clay-fill hover:bg-clay/80 text-white dark:text-white shadow-lg transition-transform duration-100 active:scale-[0.98] h-12 text-base"
          >
            <GraduationCap className="w-5 h-5 mr-2" />
            {requestEditionLabel}
          </Button>
        )}
        {shouldShowAuth ? (
          <Button
            onClick={handleEnrollClick}
            className="w-full"
            style={{ backgroundColor: 'var(--swatch--cobalt)', color: '#fff' }}
          >
            {t('signInToEnroll')}
          </Button>
        ) : canEnroll ? (
          <Button
            onClick={onEnroll}
            className="w-full bg-clay-fill dark:bg-clay-fill hover:bg-clay/80 text-white dark:text-white shadow-lg transition-transform duration-100 active:scale-[0.98] h-12 text-base"
          >
            <GraduationCap className="w-5 h-5 mr-2" />
            {t('enrollNow')}
          </Button>
        ) : showFull ? (
          <Button disabled className="w-full h-12 text-base">
            {fullLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default CourseFooter;
