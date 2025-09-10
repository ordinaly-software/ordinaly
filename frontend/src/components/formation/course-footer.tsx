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
  t: ReturnType<typeof useTranslations>;
}

const CourseFooter: React.FC<Props> = ({ shouldShowAuth, canEnroll, handleEnrollClick, onEnroll, t }) => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 lg:hidden">
      <div className="max-w-4xl mx-auto">
        {shouldShowAuth ? (
          <Button
            onClick={handleEnrollClick}
            className="w-full"
            style={{ backgroundColor: '#46B1C9', color: '#fff' }}
          >
            {t('signInToEnroll')}
          </Button>
        ) : canEnroll ? (
          <Button
            onClick={onEnroll}
            className="w-full bg-gradient-to-r from-[#22A60D] to-[#22A010] hover:from-[#22A010] hover:to-[#1E8B0C] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-14 text-lg"
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
