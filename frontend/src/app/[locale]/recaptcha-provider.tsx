"use client";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import type { ReactNode } from "react";

export default function ReCaptchaWrapper({ children }: { children: ReactNode }) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
