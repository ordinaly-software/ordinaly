'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getCookiePreferences } from '@/utils/cookieManager';

type GtagConsentUpdate = {
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  functionality_storage: 'granted' | 'denied';
  security_storage: 'granted';
};

function updateConsentFromPrefs() {
  const prefs = getCookiePreferences();
  const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
  if (!prefs || typeof gtag !== 'function') return;

  const consent: GtagConsentUpdate = {
    analytics_storage: prefs.analytics ? 'granted' : 'denied',
    ad_storage: prefs.marketing ? 'granted' : 'denied',
    functionality_storage: prefs.functional ? 'granted' : 'denied',
    security_storage: 'granted',
  };

  gtag('consent', 'update', consent);
}

function isAnalyticsGranted(): boolean {
  const prefs = getCookiePreferences();
  return Boolean(prefs?.analytics);
}

export default function AnalyticsManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1) Aplicar consentimiento al montar y cuando cambie (misma pestaña o otra)
  useEffect(() => {
    const handler = () => updateConsentFromPrefs();

    handler();
    window.addEventListener('cookieConsentChange', handler as any);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('cookieConsentChange', handler as any);
      window.removeEventListener('storage', handler);
    };
  }, []);

  // 2) Page views SPA (solo si analytics está granted)
  useEffect(() => {
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
    const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
    if (!GA_ID || typeof gtag !== 'function') return;
    if (!isAnalyticsGranted()) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    gtag('event', 'page_view', { page_location: url, page_path: url });

  }, [pathname, searchParams]);

  return null;
}