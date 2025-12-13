'use client';

import { useEffect } from 'react';
import { initializeAnalytics } from '@/utils/cookieManager';

export default function AnalyticsBootstrap() {
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return null;
}