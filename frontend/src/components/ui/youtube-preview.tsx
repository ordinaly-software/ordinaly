"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { openCookieSettings } from "@/utils/cookieManager";
import { cn } from "@/lib/utils";

const extractYoutubeData = (url?: string | null): { id: string; isShort: boolean } | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (host === "youtu.be") {
      if (!parts[0]) return null;
      return { id: parts[0], isShort: false };
    }
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return { id: v, isShort: false };
      if (parts[0] === "embed" && parts[1]) return { id: parts[1], isShort: false };
      if (parts[0] === "shorts" && parts[1]) return { id: parts[1], isShort: true };
      if (parts[0] === "live" && parts[1]) return { id: parts[1], isShort: false };
    }
  } catch {
    return null;
  }
  return null;
};

type YoutubePreviewProps = {
  url?: string | null;
  title: string;
  label: string;
  playLabel: string;
  canLoad: boolean;
  className?: string;
};

const YoutubePreview = ({
  url,
  title,
  label,
  playLabel,
  canLoad,
  className,
}: YoutubePreviewProps) => {
  const t = useTranslations("cookie");
  const youtubeData = useMemo(() => extractYoutubeData(url), [url]);
  const youtubeId = youtubeData?.id ?? null;
  const isShort = youtubeData?.isShort ?? false;
  const youtubeEmbed = youtubeId ? `https://www.youtube-nocookie.com/embed/${youtubeId}` : null;
  const youtubeThumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;
  const youtubeWatchUrl = youtubeId
    ? isShort
      ? `https://www.youtube.com/shorts/${youtubeId}`
      : `https://www.youtube.com/watch?v=${youtubeId}`
    : null;
  const isBlocked = !canLoad;
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [detectedAspectRatio, setDetectedAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    setDetectedAspectRatio(null);
    if (!youtubeThumbnail || typeof window === "undefined") return;

    let isCancelled = false;
    const probeImage = new window.Image();
    probeImage.onload = () => {
      if (isCancelled) return;
      const width = probeImage.naturalWidth;
      const height = probeImage.naturalHeight;
      if (width > 0 && height > 0) {
        setDetectedAspectRatio(width / height);
      }
    };
    probeImage.onerror = () => {
      if (!isCancelled) setDetectedAspectRatio(null);
    };
    probeImage.src = youtubeThumbnail;

    return () => {
      isCancelled = true;
    };
  }, [youtubeThumbnail]);

  useEffect(() => {
    if (!frameRef.current || typeof ResizeObserver === "undefined") return;

    const node = frameRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      setFrameSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hasDetectedAspectRatio = detectedAspectRatio !== null && Number.isFinite(detectedAspectRatio);
  const isPortraitMedia = hasDetectedAspectRatio ? (detectedAspectRatio as number) < 1 : false;
  const mediaAspectRatio = isPortraitMedia ? 9 / 16 : 16 / 9;
  const frameRatio = frameSize.width > 0 && frameSize.height > 0
    ? frameSize.width / frameSize.height
    : mediaAspectRatio;
  const isPortraitFrame = frameRatio < 1;
  const isNarrowFrame = frameSize.width > 0 && frameSize.width < 420;
  const isShortFrame = frameSize.height > 0 && frameSize.height < 220;
  const stackActions = isPortraitFrame || isNarrowFrame;
  const compactLayout = isNarrowFrame || isShortFrame;
  const hideDescription = isShortFrame && isPortraitFrame;
  const youtubeLinkAriaLabel = `${playLabel}: ${title}`;

  if (!youtubeEmbed) return null;

  return (
    <div className={cn("flex h-full w-full flex-col gap-2", className)}>
      <div
        ref={frameRef}
        className={cn(
          "relative w-full flex-1 min-h-0 overflow-hidden rounded-2xl border border-white/30 bg-black shadow-lg dark:border-neutral-700",
          isPortraitMedia ? "mx-auto max-w-[380px] sm:max-w-[440px]" : "",
        )}
        style={{ aspectRatio: `${mediaAspectRatio}` }}
      >
        {isBlocked ? (
          <>
            {youtubeThumbnail && (
              <Image
                src={youtubeThumbnail}
                alt={title}
                fill
                sizes="100vw"
                className="object-cover blur-sm brightness-90"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-black/70" />
            <div className={cn("absolute inset-0 flex items-center justify-center px-4 text-center", compactLayout ? "py-3" : "py-6")}>
              <div className={cn("mx-auto flex w-full max-w-[34rem] flex-col items-center text-white", compactLayout ? "gap-2" : "gap-3")}>
                <p className={cn("font-semibold", compactLayout ? "text-xs sm:text-sm" : "text-sm sm:text-base")}>
                  {t("thirdPartyTitle")}
                </p>
                {!hideDescription && (
                  <p className={cn("text-white/90", compactLayout ? "text-[11px] leading-snug sm:text-xs" : "text-xs sm:text-sm")}>
                    {t("thirdPartyDescription")}
                  </p>
                )}
                <div className={cn("mt-1 flex w-full items-center justify-center gap-2", stackActions ? "flex-col" : "flex-wrap")}>
                  <button
                    type="button"
                    onClick={openCookieSettings}
                    className={cn(
                      "inline-flex items-center justify-center rounded-full bg-white font-semibold text-neutral-900",
                      compactLayout
                        ? "w-full max-w-[260px] px-3 py-1.5 text-[11px] uppercase tracking-[0.12em]"
                        : "px-4 py-2 text-xs uppercase tracking-[0.2em]",
                    )}
                  >
                    {t("openCookieSettings")}
                  </button>
                  {youtubeWatchUrl && (
                    <a
                      href={youtubeWatchUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={youtubeLinkAriaLabel}
                      className={cn(
                        "inline-flex items-center justify-center rounded-full border border-white/60 font-semibold text-white",
                        compactLayout
                          ? "w-full max-w-[260px] px-3 py-1.5 text-[11px] uppercase tracking-[0.12em]"
                          : "px-4 py-2 text-xs uppercase tracking-[0.2em]",
                      )}
                    >
                      {t("openOnYoutube")}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <iframe
            src={`${youtubeEmbed}?rel=0`}
            title={title}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

export default YoutubePreview;
