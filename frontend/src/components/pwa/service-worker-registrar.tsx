"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // ⛔ NO registrar SW en Sanity Studio
    if (window.location.pathname.startsWith("/studio")) {
      navigator.serviceWorker.getRegistrations().then(regs =>
        regs.forEach(r => r.unregister())
      );
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {});
  }, []);

  return null;
}