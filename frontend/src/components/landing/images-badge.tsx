"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImagesBadgeImage {
  src: string;
  alt?: string;
}

export interface ImagesBadgeProps {
  text: string;
  /** Up to 3 preview images are shown; extras are ignored. */
  images: ImagesBadgeImage[];
  href?: string;
  className?: string;
  folderSize?: number;
  teaserImageSize?: number;
  hoverImageSize?: number;
  hoverTranslateY?: number;
  hoverSpread?: number;
  hoverRotation?: number;
}

/**
 * Recreates Aceternity's "Images Badge": a folder icon with teaser images
 * peeking out that fan into an enlarged, rotated spread on hover. Aceternity
 * only ships this as a paid registry install with no published source, so
 * this is a from-scratch rebuild matching the documented visual behavior.
 */
export function ImagesBadge({
  text,
  images,
  href,
  className,
  folderSize = 56,
  teaserImageSize = 28,
  hoverImageSize = 64,
  hoverTranslateY = 36,
  hoverSpread = 22,
  hoverRotation = 10,
}: ImagesBadgeProps) {
  const [hovered, setHovered] = useState(false);
  const visibleImages = images.slice(0, 3);

  const badge = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative inline-flex items-center gap-3 rounded-full border border-[--color-border-subtle] bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm transition hover:shadow-md dark:border-white/10 dark:bg-neutral-900/90",
        className,
      )}
    >
      <div className="relative shrink-0" style={{ width: folderSize, height: folderSize }}>
        <Folder className="h-full w-full text-clay" strokeWidth={1.5} fill="currentColor" fillOpacity={0.12} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {visibleImages.map((image, i) => {
            const centerOffset = i - (visibleImages.length - 1) / 2;
            const teaserOffset = centerOffset * (teaserImageSize * 0.35);
            const hoverOffset = centerOffset * hoverSpread;
            const rotation = centerOffset * hoverRotation;
            return (
              <motion.div
                key={image.src}
                className="absolute overflow-hidden rounded-md border border-white shadow-md dark:border-neutral-800"
                initial={false}
                animate={{
                  width: hovered ? hoverImageSize : teaserImageSize,
                  height: hovered ? hoverImageSize : teaserImageSize,
                  x: hovered ? hoverOffset : teaserOffset,
                  y: hovered ? -hoverTranslateY : 0,
                  rotate: hovered ? rotation : 0,
                  zIndex: hovered ? 10 + i : i,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Image src={image.src} alt={image.alt ?? ""} fill className="object-cover" />
              </motion.div>
            );
          })}
        </div>
      </div>
      <span className="text-sm font-semibold text-slate-dark dark:text-ivory-light">{text}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {badge}
      </Link>
    );
  }

  return badge;
}
