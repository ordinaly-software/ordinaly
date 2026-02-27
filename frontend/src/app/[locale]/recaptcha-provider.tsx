"use client";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { useEffect, useState, type ReactNode } from "react";

type ReCaptchaWrapperProps = {
  children: ReactNode;
  badgeContainerId?: string;
};

export default function ReCaptchaWrapper({ children, badgeContainerId }: ReCaptchaWrapperProps) {
  const raw = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
  // Valid reCAPTCHA v3 site keys are ~40 chars starting with "6L"
  const reCaptchaKey = raw.trim().length >= 20 ? raw.trim() : "";
  const [badgeContainerElement, setBadgeContainerElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!badgeContainerId) {
      setBadgeContainerElement(null);
      return;
    }

    const resolveElement = () => document.getElementById(badgeContainerId);
    const existingElement = resolveElement();
    if (existingElement) {
      setBadgeContainerElement(existingElement);
      return;
    }

    setBadgeContainerElement(null);
    const observer = new MutationObserver(() => {
      const foundElement = resolveElement();
      if (!foundElement) return;
      setBadgeContainerElement(foundElement);
      observer.disconnect();
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
    };
  }, [badgeContainerId]);

  if (!reCaptchaKey) return <>{children}</>;

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={reCaptchaKey}
      useRecaptchaNet
      container={
        badgeContainerId && badgeContainerElement
          ? {
              element: badgeContainerElement,
              parameters: {
                badge: "inline",
                theme: "light",
              },
            }
          : undefined
      }
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
