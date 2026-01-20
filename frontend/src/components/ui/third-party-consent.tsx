"use client";

import { ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { openCookieSettings } from "@/utils/cookieManager";

type ThirdPartyConsentProps = {
  className?: string;
  onAction?: () => void;
};

export default function ThirdPartyConsent({ className, onAction }: ThirdPartyConsentProps) {
  const t = useTranslations("cookie");
  const handleAction = onAction ?? openCookieSettings;

  return (
    <div className={cn("flex h-full w-full items-center justify-center px-6 py-8", className)}>
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1F8A0D]/15 text-[#1F8A0D] dark:text-[#3FBD6F]">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          {t("thirdPartyTitle")}
        </p>
        <p className="text-xs text-muted-foreground">{t("thirdPartyDescription")}</p>
        <Button size="sm" className="bg-[#0d6e0c] text-white dark:bg-[#3FBD6F] dark:text-black" onClick={handleAction}>
          {t("openCookieSettings")}
        </Button>
      </div>
    </div>
  );
}
