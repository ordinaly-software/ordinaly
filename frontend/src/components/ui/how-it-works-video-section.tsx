"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { HeroVideoDialog } from "@/components/home/hero-video-dialog";
import TimelineHorizontal from "@/components/ui/timeline-horizontal";

export type HowItWorksStep = {
  title: string;
  description: string;
};

const DEFAULT_VIDEO_URL = "https://youtu.be/WPgLFodfAm8";
const DEFAULT_THUMBNAIL_SRC = "/static/home/why-us-video-thumbnail.webp";

type HowItWorksVideoSectionProps = {
  title?: ReactNode;
  body?: ReactNode[];
  steps?: HowItWorksStep[];
  videoUrl?: string;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  className?: string;
  compactTimeline?: boolean;
};

export function HowItWorksVideoSection({
  title,
  body,
  steps,
  videoUrl = DEFAULT_VIDEO_URL,
  thumbnailSrc = DEFAULT_THUMBNAIL_SRC,
  thumbnailAlt,
  className,
  compactTimeline = true,
}: HowItWorksVideoSectionProps) {
  const locale = useLocale();
  const defaultTitle = locale === "en" ? "How we work" : "Cómo trabajamos";
  const resolvedTitle = title ?? defaultTitle;

  return (
    <section className={`py-20 md:py-24 px-6 bg-neutral-50 dark:bg-neutral-800 transition-colors ${className ?? ""}`}>
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-neutral-900 dark:text-white">
          {resolvedTitle}
        </h2>

        <div className="max-w-3xl mx-auto">
          <HeroVideoDialog
            className="w-full"
            animationStyle="from-center"
            videoUrl={videoUrl}
            thumbnailSrc={thumbnailSrc}
            thumbnailAlt={thumbnailAlt ?? (typeof resolvedTitle === "string" ? resolvedTitle : defaultTitle)}
          />
        </div>

        {body && body.length > 0 && (
          <div className="mx-auto mt-10 max-w-3xl space-y-4 text-center">
            {body}
          </div>
        )}

        {steps && steps.length > 0 && (
          <div className="mt-14">
            <TimelineHorizontal steps={steps} compact={compactTimeline} />
          </div>
        )}
      </div>
    </section>
  );
}

export { DEFAULT_THUMBNAIL_SRC, DEFAULT_VIDEO_URL };