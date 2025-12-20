"use client";

import { useEffect } from "react";

const SW_PATH = "/sw.js";
const SW_SCOPE = "/";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register(SW_PATH, { scope: SW_SCOPE }).catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Service worker registration failed", error);
        }
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
