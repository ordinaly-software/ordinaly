"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";

const GA_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function PageViewTracker() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // The initial gtag('config', ...) call already reports the first page_view.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", { page_path: pathname });
  }, [pathname]);

  return null;
}

export default function GoogleAnalyticsLoader() {
  const preferences = useCookiePreferences();
  const analyticsAllowed = useMemo(() => Boolean(preferences?.analytics), [preferences?.analytics]);
  const marketingAllowed = Boolean(preferences?.marketing);
  const functionalAllowed = preferences?.functional !== false;

  if (!analyticsAllowed || !GA_TAG_ID) {
    return null;
  }

  const adConsent = marketingAllowed ? "granted" : "denied";

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TAG_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: '${adConsent}',
            ad_user_data: '${adConsent}',
            ad_personalization: '${adConsent}',
            functionality_storage: '${functionalAllowed ? "granted" : "denied"}',
            security_storage: 'granted',
          });
          gtag('config','${GA_TAG_ID}')
        `}
      </Script>
      <PageViewTracker />
    </>
  );
}
