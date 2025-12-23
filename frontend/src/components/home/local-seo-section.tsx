"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";
import ThirdPartyConsent from "@/components/ui/third-party-consent";
type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface LocalSeoProps {
  t: TranslateFn;
  sideContent?: ReactNode;
}

const LocalVideoPreview = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canLoadVideo, setCanLoadVideo] = useState(false);
  const cookiePreferences = useCookiePreferences();
  const canLoadMedia = Boolean(cookiePreferences?.thirdParty);

  useEffect(() => {
    if (!canLoadMedia) {
      setCanLoadVideo(false);
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    let observer: IntersectionObserver | null = null;

    const startObserving = () => {
      if (!containerRef.current || !mediaQuery.matches || canLoadVideo) return;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCanLoadVideo(true);
              observer?.disconnect();
            }
          });
        },
        { rootMargin: "200px 0px" }
      );
      observer.observe(containerRef.current);
    };

    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        startObserving();
      }
    };

    if (mediaQuery.matches) {
      startObserving();
    }

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      observer?.disconnect();
    };
  }, [canLoadVideo, canLoadMedia]);

  return (
    <div ref={containerRef} className="hidden lg:block">
      <div className="relative w-full max-w-lg ml-auto">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/40 dark:border-white/10 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
          {!canLoadMedia ? (
            <ThirdPartyConsent className="absolute inset-0" />
          ) : canLoadVideo ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube-nocookie.com/embed/13OwGUo4PJw?playsinline=1&modestbranding=1&rel=0"
              title="Ordinaly Software Software short"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-700 dark:text-gray-200">
              <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/80 px-4 py-3 rounded-xl shadow-lg border border-white/50 dark:border-gray-700">
                <div className="w-10 h-10 rounded-full bg-[#1F8A0D]/10 text-[#1F8A0D] dark:text-[#7CFC00] flex items-center justify-center">
                  ▶
                </div>
                <div>
                  <p className="font-semibold">Short de Ordinaly Software</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Se carga al llegar a la sección</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function LocalSeoSection({ t, sideContent }: LocalSeoProps) {
  const resolvedSideContent = sideContent ?? <LocalVideoPreview />;

  return (
    <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 z-0 lg:hidden bg-[url('/static/local_seo_section_light.webp')] dark:bg-[url('/static/local_seo_section_dark.webp')] bg-cover bg-center blur-sm opacity-30 scale-105" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="scroll-animate slide-in-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              {t("local.title")}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {t("local.description1")}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              {t("local.description2")}
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#1F8A0D] dark:bg-[#7CFC00] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {t("local.points.0.title")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    <Link
                      href="https://maps.app.goo.gl/oiHuuWtSsxdbdSTD6"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#1F8A0D] dark:hover:text-[#7CFC00] dark:text-[#7CFC00] underline underline-offset-4"
                    >
                      {t("local.points.0.description")}
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#46B1C9] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {t("local.points.1.title")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    <Link
                      href="/contact"
                      scroll={true}
                      className="hover:text-[#1F8A0D] dark:hover:text-[#7CFC00] dark:text-[#7CFC00] underline underline-offset-4"
                    >
                      {t("local.points.1.description")}
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#623CEA] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {t("local.points.2.title")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    <Link
                      href="/formation"
                      className="hover:text-[#1F8A0D] dark:hover:text-[#7CFC00] dark:text-[#7CFC00] underline underline-offset-4"
                    >
                      {t("local.points.2.description")}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            <Button size="lg" variant="special" asChild className="text-lg px-10 py-6">
              <Link href="/contact" scroll={true}>
                {t("local.cta")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
          <div className="scroll-animate slide-in-right">{resolvedSideContent}</div>
        </div>
      </div>
    </section>
  );
}
