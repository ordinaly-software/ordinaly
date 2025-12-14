'use client';

import AnalyticsManager from '@/utils/analyticsManager';

export default function AnalyticsBootstrap() {
  // Delegate analytics bootstrapping to AnalyticsManager
  return <AnalyticsManager />;
}