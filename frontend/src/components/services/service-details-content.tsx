"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { renderIcon } from "@/components/ui/icon-select";
import type { Service } from "@/hooks/useServices";

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

const extractYoutubeId = (url?: string | null) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (host === "youtu.be") {
      return parts[0] || null;
    }
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      if (parts[0] === "embed" && parts[1]) return parts[1];
      if (parts[0] === "shorts" && parts[1]) return parts[1];
      if (parts[0] === "live" && parts[1]) return parts[1];
    }
  } catch {
    return null;
  }
  return null;
};

export function ServiceDetailsContent({
  service,
  labels,
  onSelect,
  onContact,
  showContact = true,
  showViewDetails = true,
}: ServiceDetailsContentProps) {
  const accent = service.color_hex || service.color || "#22A60D";
  const hero = service.image || FALLBACK_CARD_IMAGE;
  const description = service.clean_description || service.description || "";
  const priceLabel = formatPrice(service, labels.contactForQuote);
  const category =
    service.type === "PRODUCT" ? labels.productType || "Product" : labels.serviceType || "Service";

  const youtubeId = useMemo(() => extractYoutubeId(service.youtube_video_url), [service.youtube_video_url]);
  const youtubeEmbed = youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null;
  const youtubeThumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;

  const [playVideo, setPlayVideo] = useState(false);
  useEffect(() => setPlayVideo(false), [service.id]);

  return (
    <div className="space-y-6 text-neutral-800 dark:text-neutral-100">
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100/70 ring-1 ring-white/40 backdrop-blur dark:bg-neutral-800/70"
          style={{ boxShadow: `0 10px 30px -20px ${accent}` }}
        >
          {renderIcon(service.icon, "h-6 w-6 text-neutral-900 dark:text-white")}
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
            <Badge
              variant="outline"
              className="border-white/40 text-neutral-700 dark:text-neutral-200"
            >
              {category}
            </Badge>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/40 shadow-lg backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/60">
        <img
          src={hero}
          alt={service.title}
          className="h-40 w-full object-cover md:h-56"
          loading="lazy"
        />
      </div>

      {youtubeEmbed && (
        <YoutubePreview
          title={service.title}
          embedUrl={youtubeEmbed}
          thumbnailUrl={youtubeThumbnail}
          label={labels.video ?? "Video"}
          playLabel={labels.playVideo ?? "Play video"}
          play={playVideo}
          onPlay={() => setPlayVideo(true)}
        />
      )}

      <div className="space-y-3 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-neutral-900/60 dark:ring-white/5">
        {service.html_description ? (
          <div
            className="prose prose-neutral max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: service.html_description }}
          />
        ) : (
          <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-200">{description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {service.requisites ? (
          <div className="md:row-span-2">
            <InfoTile
              label={labels.requisites ?? "Requisites"}
              value={
                service.requisites_html ? (
                  <div
                    className="prose prose-neutral max-w-none text-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: service.requisites_html }}
                  />
                ) : (
                  service.requisites
                )
              }
            />
          </div>
        ) : null}
        <InfoTile label={labels.price ?? labels.contactForQuote} value={priceLabel} />
        {service.duration ? (
          <InfoTile label={labels.duration ?? "Duration"} value={formatDuration(service.duration, labels)} />
        ) : null}
      </div>

      {(onSelect || onContact) && (
        <div className="flex flex-wrap gap-3">
          {onContact && showContact && (
            <Button
              size="lg"
              className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-gray-100"
              onClick={() => onContact(service)}
            >
              {labels.contactNow ?? labels.contactForQuote}
            </Button>
          )}
          {onSelect && showViewDetails && (
            <Button
              size="lg"
              variant="outline"
              className="border-neutral-300 bg-white/70 text-neutral-900 hover:bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              onClick={() => onSelect(service)}
            >
              {labels.viewDetails ?? labels.contactForQuote}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

const InfoTile = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-xl bg-white/70 p-3 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-neutral-900/60 dark:ring-white/5">
    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{label}</p>
    <div className="text-base text-neutral-900 dark:text-white">{value}</div>
  </div>
);

const YoutubePreview = ({
  title,
  embedUrl,
  thumbnailUrl,
  label,
  playLabel,
  play,
  onPlay,
}: {
  title: string;
  embedUrl: string;
  thumbnailUrl: string | null;
  label: string;
  playLabel: string;
  play: boolean;
  onPlay: () => void;
}) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{label}</p>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/30 bg-white/40 shadow-lg backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/60">
        {play ? (
          <iframe
            src={`${embedUrl}?autoplay=1&rel=0`}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="group absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden"
            onClick={onPlay}
            aria-label={playLabel}
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full bg-neutral-200 dark:bg-neutral-800" />
            )}
            <div className="absolute inset-0 bg-black/45 transition group-hover:bg-black/55" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-xl ring-2 ring-white/50 transition group-hover:scale-105 group-hover:ring-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="h-7 w-7 fill-current">
                <path d="M25 18l22 14-22 14z" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

