"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Minimal typing for the global injected by the reCAPTCHA v3 script.
type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

const SCRIPT_ID = "google-recaptcha-v3";
// recaptcha.net is a drop-in mirror for regions where google.com is blocked.
const USE_RECAPTCHA_NET = process.env.NEXT_PUBLIC_RECAPTCHA_USE_NET === "true";
const SCRIPT_HOST = USE_RECAPTCHA_NET ? "https://www.recaptcha.net" : "https://www.google.com";

type ExecuteRecaptcha = ((action: string) => Promise<string>) | null;

type ReCaptchaContextValue = {
  /** Null when no site key is configured — callers should treat this as "not available". */
  executeRecaptcha: ExecuteRecaptcha;
  ready: boolean;
};

const ReCaptchaContext = createContext<ReCaptchaContextValue>({
  executeRecaptcha: null,
  ready: false,
});

export function useReCaptcha(): ReCaptchaContextValue {
  return useContext(ReCaptchaContext);
}

function resolveSiteKey(): string {
  const raw = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
  const trimmed = raw.trim();
  // Valid reCAPTCHA v3 site keys are ~40 chars starting with "6L".
  return trimmed.length >= 20 ? trimmed : "";
}

type ReCaptchaWrapperProps = {
  children: ReactNode;
  badgeContainerId?: string;
};

export default function ReCaptchaWrapper({ children, badgeContainerId }: ReCaptchaWrapperProps) {
  const siteKey = resolveSiteKey();
  const [ready, setReady] = useState(false);
  const movedRef = useRef(false);
  const warnedRef = useRef(false);

  // Load the v3 script exactly once. The getElementById guard makes this safe
  // under React 18/19 StrictMode double-invocation — we never remove the script.
  useEffect(() => {
    if (!siteKey) {
      if (!warnedRef.current) {
        console.warn(
          "[recaptcha] NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set at build time — " +
            "reCAPTCHA is disabled and forms will submit without a token.",
        );
        warnedRef.current = true;
      }
      return;
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.grecaptcha?.execute) {
        setReady(true);
      } else {
        existing.addEventListener("load", () => setReady(true), { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `${SCRIPT_HOST}/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    script.onerror = () => {
      console.error(`[recaptcha] failed to load the reCAPTCHA script from ${SCRIPT_HOST}`);
    };
    document.head.appendChild(script);
  }, [siteKey]);

  // Relocate the floating badge into the desired container once it appears.
  useEffect(() => {
    if (!badgeContainerId || !siteKey) return;

    const moveBadge = () => {
      const target = document.getElementById(badgeContainerId);
      const badge = document.querySelector(".grecaptcha-badge");
      if (!target || !badge || movedRef.current) return;
      if (target.contains(badge)) return;
      target.appendChild(badge);
      movedRef.current = true;
    };

    moveBadge();
    if (movedRef.current) return;

    const observer = new MutationObserver(() => {
      moveBadge();
      if (movedRef.current) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [badgeContainerId, siteKey]);

  const executeRecaptcha = useCallback<NonNullable<ExecuteRecaptcha>>(
    async (action: string) => {
      if (!siteKey) {
        throw new Error("reCAPTCHA site key is not configured");
      }
      const grecaptcha = window.grecaptcha;
      if (!grecaptcha?.execute) {
        throw new Error("reCAPTCHA has not finished loading");
      }
      await new Promise<void>((resolve) => grecaptcha.ready(resolve));
      const token = await grecaptcha.execute(siteKey, { action });
      if (!token) {
        throw new Error("reCAPTCHA returned an empty token");
      }
      return token;
    },
    [siteKey],
  );

  return (
    <ReCaptchaContext.Provider
      value={{ executeRecaptcha: siteKey ? executeRecaptcha : null, ready }}
    >
      {children}
    </ReCaptchaContext.Provider>
  );
}
