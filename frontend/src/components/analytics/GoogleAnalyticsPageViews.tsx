'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID) return;

    const url =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    const w = window as unknown as { gtag?: (...args: any[]) => void };

    if (typeof w.gtag === 'function') {
      w.gtag('config', GA_ID, { page_path: url });
    }
  }, [pathname, searchParams]);

  return null;
}