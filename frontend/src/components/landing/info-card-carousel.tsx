"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Carousel } from "@/components/ui/carousel";
import { IconWhatsApp } from "@/components/ui/brand-icons";
import { cn } from "@/lib/utils";

export type InfoCardSize = "sm" | "md" | "lg" | "xl";

export interface InfoCardItem {
  key: string;
  size?: InfoCardSize;
  /** Whether the card shows its border/ring. Defaults to true. */
  border?: boolean;
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  image?: string;
  video?: string;
  /** Playback speed multiplier for `video`. Defaults to 1 (normal speed). */
  videoPlaybackRate?: number;
  ctaLabel?: ReactNode;
  /** Icon(s) shown next to `ctaLabel`. Defaults to a single WhatsApp icon. */
  ctaIcons?: ReactNode[];
  href?: string;
  onClick?: () => void;
}

const DEFAULT_CTA_ICONS: ReactNode[] = [<IconWhatsApp key="whatsapp" size={16} className="shrink-0" />];

// Only width is parametrized per size — every card shares the same height
// so the carousel row stays visually aligned.
const CARD_HEIGHT_CLASS = "h-[520px] sm:h-[580px]";

const WIDTH_CLASSES: Record<InfoCardSize, string> = {
  sm: "w-[300px] sm:w-[340px]",
  md: "w-[380px] sm:w-[440px]",
  lg: "w-[460px] sm:w-[560px]",
  xl: "w-[620px] sm:w-[780px]",
};

function hasCardCopy(item: InfoCardItem) {
  return Boolean(item.title || item.description);
}

function InfoCardMedia({ item }: { item: InfoCardItem }) {
  const showHoverEffect = hasCardCopy(item) && Boolean(item.href || item.onClick);

  if (item.video) {
    return (
      <video
        src={item.video}
        autoPlay
        muted
        loop
        playsInline
        ref={(el) => {
          if (el) el.playbackRate = item.videoPlaybackRate ?? 1;
        }}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  if (item.image) {
    return (
      <Image
        src={item.image}
        alt=""
        fill
        className={cn(
          "object-cover",
          showHoverEffect && "transition-transform duration-500 group-hover:scale-105",
        )}
        sizes="(max-width: 768px) 80vw, 420px"
      />
    );
  }
  return null;
}

// No image/video: the text itself fills the card — top-left aligned, bold
// title, italic description — instead of pinning to the bottom over a backdrop.
function InfoCardTextContent({ item }: { item: InfoCardItem }) {
  return (
    <div className="relative z-10 flex h-full flex-col items-start justify-start gap-4 p-8 text-left">
      {item.eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-clay">{item.eyebrow}</p>
      )}
      {item.title && (
        <h3 className="text-2xl sm:text-3xl font-bold leading-snug text-slate-dark dark:text-ivory-light">
          {item.title}
        </h3>
      )}
      {item.description && (
        <div className="text-lg italic leading-relaxed text-slate-medium dark:text-cloud-medium">
          {item.description}
        </div>
      )}
      {item.ctaLabel && (
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold not-italic text-clay">
          {item.ctaIcons ?? DEFAULT_CTA_ICONS}
          {item.ctaLabel}
        </span>
      )}
    </div>
  );
}

function InfoCardMediaContent({ item }: { item: InfoCardItem }) {
  const showOverlay = hasCardCopy(item);

  return (
    <>
      <div className="absolute inset-0">
        <InfoCardMedia item={item} />
        {showOverlay && <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />}
      </div>
      {showOverlay && (
        <div className="relative z-10 flex h-full flex-col justify-end p-5">
          {item.eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-white/80">{item.eyebrow}</p>}
          {item.title && <h3 className="mt-1 text-lg font-bold leading-snug text-white">{item.title}</h3>}
          {item.description && (
            <div className="mt-2 text-sm leading-relaxed text-white/85">{item.description}</div>
          )}
          {item.ctaLabel && (
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              {item.ctaIcons ?? DEFAULT_CTA_ICONS}
              {item.ctaLabel}
            </span>
          )}
        </div>
      )}
    </>
  );
}

function InfoCardContent({ item }: { item: InfoCardItem }) {
  const hasMedia = Boolean(item.image || item.video);
  return hasMedia ? <InfoCardMediaContent item={item} /> : <InfoCardTextContent item={item} />;
}

export function InfoCard({ item }: { item: InfoCardItem }) {
  const isInteractive = Boolean(item.href || item.onClick);
  const showBorder = item.border ?? true;
  const showOverlay = hasCardCopy(item);
  const baseClassName = cn(
    "group relative overflow-hidden rounded-[2rem] transition duration-300",
    showOverlay ? "shadow-sm" : "shadow-none",
    showBorder && "border border-[--color-border-subtle] dark:border-white/10",
    isInteractive && showOverlay && "cursor-pointer hover:-translate-y-1 hover:shadow-xl",
    CARD_HEIGHT_CLASS,
    WIDTH_CLASSES[item.size ?? "md"],
  );

  if (item.href) {
    return (
      <Link href={item.href} className={baseClassName}>
        <InfoCardContent item={item} />
      </Link>
    );
  }

  if (item.onClick) {
    return (
      <button type="button" onClick={item.onClick} className={cn(baseClassName, "text-left")}>
        <InfoCardContent item={item} />
      </button>
    );
  }

  return (
    <div className={baseClassName}>
      <InfoCardContent item={item} />
    </div>
  );
}

export interface InfoCardCarouselProps {
  items: InfoCardItem[];
  className?: string;
  prevLabel?: string;
  nextLabel?: string;
}

/**
 * Reusable across service landing pages: a horizontally scrollable strip of
 * variable-size cards (parametrized per item via `size`), each optionally
 * backed by an image or looping video, and optionally clickable via
 * `href`/`onClick`. Reuses the shared Embla `Carousel` + arrow controls.
 */
export function InfoCardCarousel({ items, className, prevLabel, nextLabel }: InfoCardCarouselProps) {
  return (
    <Carousel
      items={items}
      getKey={(item) => item.key}
      slideClassName="shrink-0 grow-0 pl-4"
      renderItem={(item) => <InfoCard item={item} />}
      className={className}
      prevLabel={prevLabel}
      nextLabel={nextLabel}
      fixedWidthSlides
    />
  );
}
