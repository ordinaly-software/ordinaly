'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getCookiePreferences } from '@/utils/cookieManager';

function applyConsentUpdate() {
  const prefs = getCookiePreferences();
  const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
  if (!prefs || typeof gtag !== 'function') return;

  gtag('consent', 'update', {
    analytics_storage: prefs.analytics ? 'granted' : 'denied',
    ad_storage: prefs.marketing ? 'granted' : 'denied',
    functionality_storage: prefs.functional ? 'granted' : 'denied',
    security_storage: 'granted',
  });
}

export default function AnalyticsManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    const handler = () => applyConsentUpdate();
    handler();

    window.addEventListener('cookieConsentChange', handler as any);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('cookieConsentChange', handler as any);
      window.removeEventListener('storage', handler);
    };
  }, []);

  // Pageviews SPA (solo si analytics está granted)
  useEffect(() => {
    const prefs = getCookiePreferences();
    const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
    if (!GA_ID || typeof gtag !== 'function') return;
    if (!prefs?.analytics) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    gtag('event', 'page_view', { page_path: url, page_location: url });
  }, [pathname, searchParams, GA_ID]);

  return null;
}
