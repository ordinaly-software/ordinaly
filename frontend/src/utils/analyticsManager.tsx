'use client';

import { useEffect } from 'react';
import { isAnalyticsAllowed, applyConsentMode } from '@/utils/cookieManager';

let analyticsLoaded = false;

export default function AnalyticsManager() {
  useEffect(() => {
    const loadAnalytics = () => {
      if (!isAnalyticsAllowed() || analyticsLoaded) return;

      analyticsLoaded = true;

      const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
      if (!GA_ID) return;

      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      script.async = true;

      script.onload = () => {
        (window as any).dataLayer = (window as any).dataLayer || [];
        const gtag = (...args: any[]) => { (window as any).dataLayer.push(args); };
        (window as any).gtag = gtag;

        (window as any).gtag?.('js', new Date());
        (window as any).gtag?.('config', GA_ID, { anonymize_ip: true } as any);
        applyConsentMode();
      };

      document.head.appendChild(script);
    };

    loadAnalytics();

    window.addEventListener('cookieConsentChange', loadAnalytics);
    window.addEventListener('storage', loadAnalytics);

    return () => {
      window.removeEventListener('cookieConsentChange', loadAnalytics);
      window.removeEventListener('storage', loadAnalytics);
    };
  }, []);

  return null;
}
