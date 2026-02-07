"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { renderIcon } from "@/components/ui/icon-select";
import type { Service } from "@/hooks/useServices";
import Image from "next/image";
import ShareServiceButtons from "@/components/services/share-service-buttons";
import { cn } from "@/lib/utils";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import YoutubePreview from "@/components/ui/youtube-preview";

export type ServiceDetailsLabels = {
  featured: string;
  contactForQuote: string;
  viewDetails?: string;
  contactNow?: string;
  productType?: string;
  serviceType?: string;
  price?: string;
  duration?: string;
  durationDay?: string;
  durationDays?: string;
  requisites?: string;
  none?: string;
  video?: string;
  playVideo?: string;
};

export interface ServiceDetailsContentProps {
  service: Service;
  labels: ServiceDetailsLabels;
  onSelect?: (service: Service) => void;
  onContact?: (service: Service) => void;
  showContact?: boolean;
  showViewDetails?: boolean;
  showShareButtons?: boolean;
  density?: "default" | "compact";
}

const FALLBACK_CARD_IMAGE = "/static/main_service_home_ilustration.webp";

const formatPrice = (service: Service, contactLabel: string) => {
  if (service.price && !Number.isNaN(Number(service.price))) {
    return `€${Math.round(Number(service.price))}`;
  }
  return contactLabel;
};

const formatDuration = (duration: number, labels: ServiceDetailsLabels) => {
  if (!duration || Number.isNaN(duration)) return labels.none ?? "";
  if (duration === 1 && labels.durationDay) return labels.durationDay;
  if (labels.durationDays) {
    if (labels.durationDays.includes("{count}")) {
      return labels.durationDays.replace("{count}", String(duration));
    }
    return `${duration} ${labels.durationDays}`;
  }
  return `${duration}d`;
};

export function ServiceDetailsContent({
  service,
  labels,
  onSelect,
  onContact,
  showContact = true,
  showViewDetails = true,
  showShareButtons = false,
  density = "default",
}: ServiceDetailsContentProps) {
  const accent = service.color_hex || service.color || "#1F8A0D";
  const accentHex = accent.startsWith("#") ? accent : `#${accent}`;
  const accentSoft = `${accentHex}1a`;
  const hero = service.image || FALLBACK_CARD_IMAGE;
  const markdownDescription = service.description || service.clean_description || "";
  const priceLabel = formatPrice(service, labels.contactForQuote);
  const cookiePreferences = useCookiePreferences();
  const canLoadMedia = Boolean(cookiePreferences?.thirdParty);
  const isCompact = density === "compact";
  const hasCta = Boolean(onSelect || onContact);

  return (
    <div
      className={cn(
        "text-neutral-800 dark:text-neutral-100",
        isCompact ? "space-y-4" : "space-y-6",
        hasCta && (isCompact ? "pb-6" : "pb-8"),
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-white/40 backdrop-blur"
          style={{
            backgroundColor: accentSoft,
            color: accentHex,
            boxShadow: `0 10px 30px -20px ${accentHex}`,
          }}
        >
          {renderIcon(service.icon, "h-6 w-6 text-current")}
        </div>
        <div className="space-y-1">
          {service.subtitle && (
            <p className="text-base font-semibold text-neutral-800 dark:text-neutral-50">
              {service.subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="border border-white/30 bg-white/80 text-neutral-900 backdrop-blur dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              {priceLabel}
            </Badge>
            {service.is_featured && <Badge className="bg-emerald-600 text-white shadow">{labels.featured}</Badge>}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/40 shadow-lg backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/60">
        <Image
          src={hero}
          alt={service.title}
          className={cn(
        "w-full object-cover",
        isCompact ? "h-48 md:h-64" : "h-56 md:h-72",
          )}
          width={1200}
          height={560}
          loading="lazy"
          sizes="(min-width: 768px) 100vw, 100vw"
        />
      </div>

      {service.youtube_video_url && (
        <YoutubePreview
          url={service.youtube_video_url}
          title={service.title}
          label={labels.video ?? "Video"}
          playLabel={labels.playVideo ?? "Play video"}
          canLoad={canLoadMedia}
        />
      )}

      <div
        className={cn(
          "rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-neutral-900/60 dark:ring-white/5",
          isCompact ? "space-y-2 p-3" : "space-y-3 p-4",
        )}
      >
        {markdownDescription ? (
          <MarkdownRenderer
            color={accentHex}
            className="prose prose-neutral max-w-none dark:prose-invert text-base leading-relaxed text-neutral-700 dark:text-neutral-200 break-words"
          >
            {markdownDescription}
          </MarkdownRenderer>
        ) : (
          <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-200">{service.clean_description ?? ""}</p>
        )}
      </div>

      <div className={cn("grid grid-cols-1 md:grid-cols-2", isCompact ? "gap-2" : "gap-3")}>
        {service.requisites ? (
          <div className="md:row-span-2">
            <InfoTile
              label={labels.requisites ?? "Requisites"}
              value={
                <MarkdownRenderer
                  color={accentHex}
                  className="prose prose-neutral max-w-none text-sm dark:prose-invert text-gray-700 dark:text-gray-200 break-words"
                >
                  {service.requisites}
                </MarkdownRenderer>
              }
            />
          </div>
        ) : null}
        <InfoTile label={labels.price ?? labels.contactForQuote} value={priceLabel} />
        {service.duration ? (
          <InfoTile label={labels.duration ?? "Duration"} value={formatDuration(service.duration, labels)} />
        ) : null}
      </div>

      {showShareButtons && (
        <div
          className={cn(
            "rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-neutral-900/60 dark:ring-white/5",
            isCompact ? "p-2" : "p-3",
          )}
        >
          <ShareServiceButtons
            title={service.title}
            subtitle={service.subtitle}
            slug={service.slug ?? service.id}
            showLabel
          />
        </div>
      )}

      {hasCta && (
        <div
          className={cn(
            "sticky z-20 mx-auto w-[92%] max-w-[520px]",
            isCompact ? "bottom-3" : "bottom-4",
          )}
        >
          <div
            className={cn(
              "rounded-2xl bg-white/90 shadow-lg ring-1 ring-black/5 backdrop-blur dark:bg-neutral-900/90 dark:ring-white/10",
              isCompact ? "p-2" : "p-3",
            )}
          >
            <div className={cn("flex flex-col sm:flex-row", isCompact ? "gap-2" : "gap-3")}>
              {onContact && showContact && (
                <Button
                  size="lg"
                  className="w-full sm:flex-1 text-white hover:opacity-90 transition-opacity shadow-lg"
                  style={{
                    backgroundColor: accentHex,
                    boxShadow: `0 16px 30px -20px ${accentHex}`,
                  }}
                  onClick={() => onContact(service)}
                >
                  {labels.contactNow ?? labels.contactForQuote}
                </Button>
              )}
              {onSelect && showViewDetails && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:flex-1 border-neutral-300 bg-white/70 text-neutral-900 hover:bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  onClick={() => onSelect(service)}
                >
                  {labels.viewDetails ?? labels.contactForQuote}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const InfoTile = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="rounded-xl bg-white/70 p-3 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-neutral-900/60 dark:ring-white/5">
    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{label}</p>
    <div className="text-base text-neutral-900 dark:text-white">{value}</div>
  </div>
);
