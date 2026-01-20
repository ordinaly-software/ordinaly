"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { GraduationCap } from 'lucide-react';

interface Props {
  shouldShowAuth: boolean;
  canEnroll: boolean;
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
  handleEnrollClick,
  onEnroll,
  showRequestEdition,
  hasEnded,
  onRequestEdition,
  requestEditionLabel,
  t,
}) => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 lg:hidden">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        {showRequestEdition && hasEnded && (
          <Button
            onClick={onRequestEdition}
            className="w-full bg-[#0d6e0c] hover:bg-[#0A4D08] dark:bg-[#3FBD6F] dark:hover:bg-[#2EA55E] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-14 text-lg"
          >
            <GraduationCap className="w-5 h-5 mr-2" />
            {requestEditionLabel}
          </Button>
        )}
        {shouldShowAuth ? (
          <Button
            onClick={handleEnrollClick}
            className="w-full"
            style={{ backgroundColor: '#217093', color: '#fff' }}
          >
            {t('signInToEnroll')}
          </Button>
        ) : canEnroll ? (
          <Button
            onClick={onEnroll}
            className="w-full bg-[#0d6e0c] hover:bg-[#0A4D08] dark:bg-[#3FBD6F] dark:hover:bg-[#2EA55E] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-14 text-lg"
          >
            <GraduationCap className="w-5 h-5 mr-2" />
            {t('enrollNow')}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default CourseFooter;
