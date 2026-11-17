"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Footer from "@/components/ui/footer";

/** Routes that render without the site navbar and popups, so the form is the only way forward. */
const CAMPAIGN_PATHS = ["/automatizaciones", "/auditoria", "/odoo", "/gracias"];

export function isCampaignPath(pathname: string | null) {
  const path = (pathname ?? "").replace(/^\/(es|en)(?=\/|$)/, "").replace(/\/$/, "");
  return CAMPAIGN_PATHS.includes(path);
}

/** Renders its children everywhere except on the campaign landings. */
export function HideOnCampaign({ children }: { children: ReactNode }) {
  return isCampaignPath(usePathname()) ? null : <>{children}</>;
}

/** Logo-only navbar: no links, so visitors stay on the page. */
export function CampaignNavbar() {
  return (
    <header className="border-b border-[--color-border-subtle] bg-[--swatch--ivory-light] dark:border-[--color-border-strong] dark:bg-[--swatch--slate-dark]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-center gap-2.5 px-6">
        <Image src="/logo_80.webp" alt="" width={36} height={36} priority />
        <span className="text-lg font-bold tracking-wide text-slate-dark dark:text-ivory-light">ORDINALY</span>
      </div>
    </header>
  );
}

/** Same footer as the rest of the site, without the links to other pages. */
export function CampaignFooter() {
  return <Footer hidePageLinks />;
}
