"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";
import { allowsThirdParty, openCookieSettings } from "@/utils/cookie-manager";
import {
  extractYoutubeData,
  getYoutubeEmbedUrl,
  getYoutubeThumbnail,
  getYoutubeWatchUrl,
} from "@/utils/youtube";

export default function YoutubeEmbed({
  url,
  title,
  caption,
}: {
  url?: string;
  title?: string;
  caption?: string;
}) {
  const t = useTranslations("blog.video");
  const preferences = useCookiePreferences();
  const [playing, setPlaying] = useState(false);
  const data = extractYoutubeData(url);
  if (!data) return null;

  const label = title || caption || t("play");
  const canLoad = allowsThirdParty(preferences);
  const showPlayer = playing && canLoad;

  return (
    <figure className="mx-auto my-8 max-w-3xl">
      <div
        className={`relative overflow-hidden rounded-2xl bg-slate-dark shadow-lg ring-1 ring-black/5 ${
          data.isShort ? "mx-auto aspect-[9/16] max-w-xs" : "aspect-video"
        }`}
      >
        {showPlayer ? (
          <iframe
            src={`${getYoutubeEmbedUrl(data)}?autoplay=1&playsinline=1&rel=0`}
            title={label}
            className="absolute inset-0 size-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getYoutubeThumbnail(data)}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`${t("play")}: ${label}`}
              className="group absolute inset-0 flex items-center justify-center focus-visible:outline-none"
            >
              {/* Translucent material; responds on press, not on release */}
              <span className="flex size-16 items-center justify-center rounded-full bg-white/25 text-white shadow-lg ring-1 ring-white/40 backdrop-blur-xl transition-transform duration-150 ease-out group-hover:scale-105 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-white motion-reduce:transition-none">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
            {playing && !canLoad && (
              <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/60 p-3 text-sm text-white backdrop-blur-xl sm:inset-x-4 sm:bottom-4 sm:p-4">
                <p className="mb-2">{t("consentNotice")}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-medium">
                  <button type="button" onClick={openCookieSettings} className="underline underline-offset-2">
                    {t("openCookieSettings")}
                  </button>
                  <a
                    href={getYoutubeWatchUrl(data)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {t("watchOnYoutube")}
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm leading-snug tracking-[0.005em] text-slate-medium dark:text-cloud-medium">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
