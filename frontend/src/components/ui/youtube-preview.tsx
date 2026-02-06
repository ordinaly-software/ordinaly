"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { openCookieSettings } from "@/utils/cookieManager";
import { cn } from "@/lib/utils";

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
  playLabel: _playLabel,
  canLoad,
  className,
}: YoutubePreviewProps) => {
  const t = useTranslations("cookie");
  const youtubeId = useMemo(() => extractYoutubeId(url), [url]);
  const youtubeEmbed = youtubeId ? `https://www.youtube-nocookie.com/embed/${youtubeId}` : null;
  const youtubeThumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;
  const youtubeWatchUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null;
  const isBlocked = !canLoad;

  if (!youtubeEmbed) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{label}</p>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/30 bg-black shadow-lg dark:border-neutral-700">
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
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-semibold text-white">{t("thirdPartyTitle")}</p>
            <p className="text-xs text-white/90">{t("thirdPartyDescription")}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={openCookieSettings}
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900"
              >
                {t("openCookieSettings")}
              </button>
              {youtubeWatchUrl && (
                <a
                  href={youtubeWatchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                >
                  {t("openOnYoutube")}
                </a>
              )}
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
