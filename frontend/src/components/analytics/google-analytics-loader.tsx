"use client";

import Script from "next/script";
import { useMemo } from "react";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";

const GA_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;

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
    </>
  );
}
