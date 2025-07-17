// components/AnalyticsManager.tsx
'use client';

import { useEffect } from 'react';
import { initializeAnalytics, initializeMarketing } from '@/utils/cookieManager';

export default function AnalyticsManager() {
  useEffect(() => {
    // Listen for cookie consent changes
    const handleConsentChange = () => {
      initializeAnalytics();
      initializeMarketing();
    };

    // Initialize on mount
    handleConsentChange();

    // Listen for storage changes (when user changes preferences)
    window.addEventListener('storage', handleConsentChange);

    // Listen for same-tab cookie consent changes
    window.addEventListener('cookieConsentChange', handleConsentChange);
    
    return () => {
      window.removeEventListener('storage', handleConsentChange);
      window.removeEventListener('cookieConsentChange', handleConsentChange);
    };
  }, []);

  return null;
}