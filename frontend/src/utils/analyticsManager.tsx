'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getCookiePreferences } from '@/utils/cookieManager';

function applyConsentUpdate() {
  const prefs = getCookiePreferences();
  type Gtag = (...args: unknown[]) => void;
  const w = window as unknown as { gtag?: Gtag };
  const gtag = w.gtag;
  if (!prefs || typeof gtag !== 'function') return;

  gtag('consent', 'update', {
    analytics_storage: prefs.analytics ? 'granted' : 'denied',
    ad_storage: prefs.marketing ? 'granted' : 'denied',
    functionality_storage: prefs.functional ? 'granted' : 'denied',
    security_storage: 'granted',
  } as Record<string, unknown>);
}

export default function AnalyticsManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    const handler = () => applyConsentUpdate();
    handler();

    window.addEventListener('cookieConsentChange', handler as EventListener);
    window.addEventListener('storage', handler as EventListener);

    return () => {
      window.removeEventListener('cookieConsentChange', handler as EventListener);
      window.removeEventListener('storage', handler as EventListener);
    };
  }, []);

  // Pageviews SPA (solo si analytics está granted)
  useEffect(() => {
    type Gtag = (...args: unknown[]) => void;
    const sendPageview = () => {
      const prefs = getCookiePreferences();
      const w = window as unknown as { gtag?: Gtag };
      const gtag = w.gtag;
      if (!GA_ID || typeof gtag !== 'function') return;
      if (!prefs?.analytics) return;

      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      gtag('event', 'page_view', { page_path: url, page_location: url } as Record<string, unknown>);
    };

    window.addEventListener('analyticsScriptLoaded', sendPageview);
    sendPageview();

    return () => {
      window.removeEventListener('analyticsScriptLoaded', sendPageview);
    };
  }, [pathname, searchParams, GA_ID]);

  return null;
}
