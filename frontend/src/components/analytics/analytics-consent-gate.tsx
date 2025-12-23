"use client";

import { useMemo } from "react";
import GoogleAnalyticsScript from "@/components/analytics/GoogleAnalyticsScript";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";

export default function AnalyticsConsentGate() {
  const preferences = useCookiePreferences();
  const analyticsAllowed = useMemo(() => Boolean(preferences?.analytics), [preferences?.analytics]);

  return <GoogleAnalyticsScript enabled={analyticsAllowed} />;
}
