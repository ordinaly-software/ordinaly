"use client";

import Image from "next/image";
import heroImage from "../../../public/static/home/main_home_ilustration.webp";
import Link from "next/link";
import { ArrowRight, Book, Bot, Building2, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
import { useEffect, useMemo, useRef, useState } from "react";
type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

const secondaryHeroImages = ["/static/home/3.png", "/static/home/4.png"];

interface HeroProps {
  t: TranslateFn;
  onWhatsApp: () => void;
}

export function HomeHero({ t, onWhatsApp }: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [hasPreloadedSecondary, setHasPreloadedSecondary] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const { isDark } = useTheme();
  const primaryGreen = "#1F8A0D";
  // heroImage imported statically above to enable placeholder blur and optimal loading
  const sectionTextColor = isDark ? "text-white" : "text-[#0B1B17]";
  const subtitleColor = isDark ? "#B8FF9A" : "#1F7A12";
  const bulletTextColor = isDark ? "#FFFFFF" : "#0B1B17";
  const bulletBg = isDark ? "rgba(124,252,0,0.12)" : "rgba(31,138,13,0.06)";
  const bulletBorder = isDark ? "rgba(124,252,0,0.35)" : "rgba(31,138,13,0.18)";

  const heroImages = useMemo(() => {
    const primary = {
      src: heroImage.src,
      width: heroImage.width ?? 516,
      height: heroImage.height ?? 640,
      blurDataURL: heroImage.blurDataURL,
    };

    const secondary = secondaryHeroImages.map((src) => ({ src, width: primary.width, height: primary.height, blurDataURL: undefined }));

    return [primary, ...secondary];
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setShouldAnimate(!media.matches);

    updateMotionPreference();
    media.addEventListener("change", updateMotionPreference);

    return () => media.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsHeroVisible(entry.isIntersecting));
      },
      { threshold: 0.22 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isHeroVisible || heroImages.length <= 1 || !shouldAnimate) return;

    const intervalId = window.setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 6500);

    return () => window.clearInterval(intervalId);
  }, [heroImages.length, isHeroVisible, shouldAnimate]);

  useEffect(() => {
    if (!isHeroVisible || hasPreloadedSecondary || heroImages.length <= 1) return;

    const preloadSecondary = () => {
      heroImages.slice(1).forEach((image) => {
        const img = new window.Image();
        img.decoding = "async";
        img.loading = "eager";
        img.src = image.src;
      });

      setHasPreloadedSecondary(true);
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
        preloadSecondary,
        { timeout: 1400 },
      );

      return () => (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idleId);
    }

    const timeoutId = (window as Window).setTimeout(preloadSecondary, 400);
    return () => (window as Window).clearTimeout(timeoutId);
  }, [hasPreloadedSecondary, heroImages, isHeroVisible]);

  const bulletPoints = [
    {
      icon: Building2,
      text: t("hero.trust1"),
    },
    {
      icon: Bot,
      text: t("hero.trust2"),
    },
    {
      icon: Workflow,
      text: t("hero.trust3"),
    },
    {
      icon: Book,
      text: t("hero.trust4"),
    },
  ];

  const clientLogos = [
    {
      src: "/static/logos/logo_grupo_addu_small.webp",
      alt: "Grupo Addu",
      width: 130,
      height: 42,
    },
    {
      src: "/static/logos/logo_aviva_publicidad_small.webp",
      alt: "Aviva Publicidad",
      width: 140,
      height: 42,
    },
    {
      src: "/static/logos/logo_proinca_consultores_small.webp",
      alt: "Proinca Consultores",
      width: 120,
      height: 42,
    },
    {
      src: "/static/logos/logo_guadalquivir_fincas_small.webp",
      alt: "Guadalquivir Fincas",
      width: 150,
      height: 42,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden ${sectionTextColor}`}
      style={{ backgroundColor: isDark ? "#030B13" : "#F7FCF9" }}
    >
      <div className="absolute inset-0">
        {isDark ? (
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 15% 20%, rgba(31,138,13,0.15), transparent 35%), radial-gradient(circle at 80% 15%, rgba(0,204,255,0.12), transparent 35%), linear-gradient(135deg, #040a11 0%, #05141f 40%, #040a11 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(120deg, rgba(31,138,13,0.08), transparent 40%, rgba(0,210,255,0.12) 70%, transparent 90%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: "radial-gradient(circle at 50% 110%, rgba(31,138,13,0.22), transparent 55%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.04), transparent 45%)",
              }}
            />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 20% 25%, rgba(31,138,13,0.08), transparent 35%), radial-gradient(circle at 80% 10%, rgba(0,175,115,0.08), transparent 35%), linear-gradient(135deg, #ffffff 0%, #f7fcf9 55%, #e9f8ed 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  "linear-gradient(120deg, rgba(31,138,13,0.05), transparent 45%, rgba(0,175,115,0.07) 75%, transparent 90%)",
              }}
            />
          </>
        )}
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(180deg, rgba(3,11,19,0.74) 0%, rgba(3,11,19,0.64) 60%, rgba(3,11,19,0.78) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.72) 60%, rgba(247,252,249,0.85) 100%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 scroll-animate slide-in-left space-y-4">
            <div className="relative lg:hidden -mx-4 sm:-mx-6 overflow-hidden">
              <div className="relative h-[220px] sm:h-[220px] md:h-[240px] w-full overflow-hidden">
                {heroImages.map((image, index) => (
                  <Image
                    key={`hero-mobile-${image.src}`}
                    src={image.src}
                    alt={t("hero.imageAlt")}
                    fill
                    className={`object-cover transition-opacity duration-700 ease-out ${index === currentHeroIndex ? "opacity-100" : "opacity-0"}`}
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "low"}
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 1024px) 100vw, 0px"
                    quality={45}
                    placeholder={index === 0 && image.blurDataURL ? "blur" : "empty"}
                    blurDataURL={index === 0 ? image.blurDataURL : undefined}
                    aria-hidden="true"
                  />
                ))}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-black/5 to-transparent" />
              </div>
            </div>

            <div className="space-y-4 pt-6 lg:pt-0">
              <h1 className="text-4xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight">
                <span className="block">{t("hero.titleLine1")}</span>
                <span
                  className="block text-transparent bg-clip-text drop-shadow-[0_12px_35px_rgba(31,138,13,0.35)]"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${primaryGreen}, #4BBE59FF, #9978fdff)`,
                  }}
                >
                  {t("hero.titleLine2")}
                </span>
              </h1>
              <p className="text-xl md:text-2xl font-semibold" style={{ color: subtitleColor }}>
                {t("hero.subtitle")}
              </p>
              <p className={`text-lg max-w-2xl leading-relaxed ${isDark ? "text-gray-200/90" : "text-[#1C2A25]"}`}>
                {t("hero.description1")}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {bulletPoints.map(({ icon: Icon, text }, index) => {
                const targetId = index < 3 ? "#services" : "#courses";
                return (
                  <Link
                    key={`bullet-${index}`}
                    href={targetId}
                    scroll
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1F8A0D] focus-visible:ring-offset-transparent rounded-2xl"
                  >
                    <div
                      className="flex items-center gap-3 rounded-2xl px-4 py-3"
                      style={{
                        backgroundColor: bulletBg,
                        border: `1px solid ${bulletBorder}`,
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <div
                        className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl ring-1"
                        style={{
                          backgroundColor: isDark ? "rgba(124,252,0,0.18)" : "rgba(31,138,13,0.12)",
                          color: isDark ? "#3FBD6F" : primaryGreen,
                          borderColor: isDark ? "rgba(124,252,0,0.5)" : "rgba(31,138,13,0.35)",
                        }}
                      >
                        <Icon className="h-6 w-6 flex-shrink-0" strokeWidth={1.5} />
                      </div>
                      <p className="text-base md:text-lg" style={{ color: bulletTextColor }}>
                        {text}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="px-8 py-4 text-lg text-white shadow-[0_20px_60px_-25px_rgba(31,138,13,0.8)] hover:shadow-[0_20px_70px_-28px_rgba(31,138,13,0.95)]"
                style={{ backgroundColor: primaryGreen }}
                onClick={onWhatsApp}
              >
                {t("hero.ctaDemo")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border px-8 py-4 text-lg"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.35)" : "rgba(31,138,13,0.5)",
                  backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                  color: isDark ? "rgba(255,255,255,0.92)" : "rgba(31,138,13,0.85)",
                }}
                asChild
              >
                <Link href="/services" className="flex items-center">
                  {t("hero.ctaServices")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="space-y-5">
              <div
                className="flex items-center gap-3 text-xs uppercase tracking-[0.18em]"
                style={{ color: isDark ? "rgba(167,243,208,0.9)" : "#1F7A12" }}
              >
                <div
                  className="h-px flex-1"
                  style={{
                    background: `linear-gradient(to right, rgba(31,138,13,0.4), rgba(255,255,255,0.1), transparent)`,
                  }}
                />
                <span>{t("hero.clientsTitle")}</span>
                <div
                  className="h-px flex-1"
                  style={{
                    background: `linear-gradient(to left, rgba(31,138,13,0.4), rgba(255,255,255,0.1), transparent)`,
                  }}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-center">
                {clientLogos.map((logo) => (
                  <div
                    key={logo.alt}
                    className="flex items-center justify-center rounded-xl px-3 py-2"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(31,138,13,0.04)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(31,138,13,0.12)"}`,
                    }}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.width}
                      height={logo.height}
                      className="w-auto max-h-14 opacity-90"
                      style={{
                        filter: isDark ? "none" : "invert(1) brightness(0.2)",
                      }}
                      loading="lazy"
                      sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
                      quality={60}
                    />
                  </div>
                ))}
              </div>
              <div className={`flex flex-col sm:flex-row sm:items-center gap-2 ${sectionTextColor}`}>
                <span className="text-3xl md:text-4xl font-black tracking-tight">{t("hero.statHeadline")}</span>
                <span className={`text-base md:text-lg ${isDark ? "text-gray-200/90" : "text-[#1C2A25]"}`}>
                  {t("hero.statCaption")}
                </span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block scroll-animate slide-in-right">
            <div className="relative">
              <div
                className="absolute -left-24 -top-16 h-72 w-72 rounded-full blur-3xl"
                style={{ backgroundColor: "rgba(31,138,13,0.2)" }}
              />
              <div className="absolute -right-10 -bottom-24 h-80 w-80 rounded-full bg-cyan-400/25 blur-3xl" />
              <div
                className="absolute inset-0 scale-105"
                style={{
                  background: "radial-gradient(circle at 70% 40%, rgba(31,138,13,0.18), transparent 45%)",
                }}
              />
              <div className="relative mx-auto h-full w-full max-w-[640px] overflow-hidden rounded-[28px] aspect-[516/640]">
                {heroImages.map((image, index) => (
                  <Image
                    key={`hero-desktop-${image.src}`}
                    src={image.src}
                    alt={t("hero.imageAlt")}
                    fill
                    className={`object-cover transition-opacity duration-700 ease-out ${index === currentHeroIndex ? "opacity-100" : "opacity-0"}`}
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "low"}
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 1024px) 0px, (max-width: 1200px) 50vw, 560px"
                    quality={45}
                    placeholder={index === 0 && image.blurDataURL ? "blur" : "empty"}
                    blurDataURL={index === 0 ? image.blurDataURL : undefined}
                    aria-hidden="true"
                  />
                ))}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
