"use client";

import { useEffect, useState } from "react";
import { getCookiePreferences } from "@/utils/cookieManager";
import type { CookiePreferences } from "@/utils/cookieManager";

export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const update = () => setPreferences(getCookiePreferences());
    update();

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== "cookie-preferences") return;
      update();
    };

    window.addEventListener("cookieConsentChange", update as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("cookieConsentChange", update as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return preferences;
}
