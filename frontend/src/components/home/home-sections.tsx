"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  homeBenefits,
  serviceBenefits,
  processSteps,
  useCases,
  testimonials,
  faqItems,
  partners,
  ctaBenefits,
  TranslateFn,
} from "./home-content";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  t: TranslateFn;
  onWhatsApp: () => void;
}

export function HomeHero({ t, onWhatsApp }: HeroProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-[#23272F] dark:via-[#23272F] dark:to-[#23272F]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="scroll-animate slide-in-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              <span className="text-green-500">
              {t("hero.title").split(" ")[0]}
              </span>
              {" "}
              {t("hero.title").slice(8, -7)}
              {" "}
              <span className="text-green-500">
              {t("hero.title").split(" ").slice(-1)}
              </span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
              {t("hero.subtitle")}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {t("hero.description1")}
            </p>
            <div className="flex flex-wrap gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-[#22A60D]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t("hero.trust1")}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-[#22A60D]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t("hero.trust2")}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-[#22A60D]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t("hero.trust3")}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative inline-flex items-center justify-center gap-4 group">
                <Button variant="special" size="lg" asChild>
                  <Link href="/services">
                    {t("hero.ctaServices")}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 10 10"
                      height="10"
                      width="10"
                      fill="none"
                      className={cn("mt-0.5 ml-2 -mr-1 stroke-[#1A1924] stroke-2", "dark:stroke-white")}
                    >
                      <path d="M0 5h7" className="transition opacity-0 group-hover:opacity-100"></path>
                      <path d="M1 1l4 4-4 4" className="transition group-hover:translate-x-[3px]"></path>
                    </svg>
                  </Link>
                </Button>
              </div>
              <Button
                size="lg"
                variant="special"
                className="border-[#46B1C9] text-[#46B1C9] hover:bg-[#46B1C9] hover:text-white text-lg px-8 py-4"
                onClick={onWhatsApp}
              >
                {t("hero.ctaDemo")}
              </Button>
            </div>
          </div>
          <div className="scroll-animate slide-in-right">
            <link rel="preload" as="image" href="/static/main_home_ilustration.webp" />
            <Image
              src="/static/main_home_ilustration.webp"
              alt={t("hero.imageAlt")}
              width={450}
              height={450}
              className="rounded-2xl"
              style={{ width: "100%", height: "auto" }}
              priority
              fetchPriority="high"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA="
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface SectionProps {
  t: TranslateFn;
}

export function BenefitsSection({ t }: SectionProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#23272F]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {t("benefits.title")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t("benefits.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {homeBenefits.map((item, index) => (
            <div
              key={item.titleKey}
              className="scroll-animate fade-in-up p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                {t(item.titleKey)}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{t(item.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface ServicesIntroProps extends HeroProps {
  servicesContent: React.ReactNode;
  sectionRef?: React.RefObject<HTMLElement | null>;
}

export function ServicesSection({ t, servicesContent, onWhatsApp, sectionRef }: ServicesIntroProps) {
  return (
    <section id="services" ref={sectionRef} className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 scroll-animate fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#22A60D] dark:text-[#7CFC00]">
            {t("services.title")}
          </h2>
          <p className="text-xl text-gray-800 dark:text-gray-200 max-w-3xl mx-auto mb-4">
            {t("services.subtitle")}
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {t("services.description")}
          </p>
        </div>
        {servicesContent}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {serviceBenefits.map((benefit, index) => (
            <div
              key={benefit.titleKey}
              className="scroll-animate fade-in-up text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${benefit.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={benefit.iconPath} />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {t(benefit.titleKey)}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{t(benefit.descriptionKey)}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button size="lg" variant="special" onClick={onWhatsApp} className="text-lg px-10 py-6">
            {t("services.cta")}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ProcessSection({ t }: SectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("process.title")}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {t("process.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, index) => (
            <div key={step.titleKey} className="scroll-animate fade-in-up relative" style={{ animationDelay: `${index * 0.1}s` }}>
              <div
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-8 h-full"
                style={{ borderColor: step.color }}
              >
                <div
                  className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ backgroundColor: step.color }}
                >
                  {step.badge}
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t(step.descriptionKey)}
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {step.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-[#22A60D]">→</span>
                        <span>{t(`${step.bulletKey ?? step.titleKey.replace(".title", "")}.bullets.${idx}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            {t("process.meta")}
          </p>
        </div>
      </div>
    </section>
  );
}

export function UseCasesSection({ t }: SectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("useCases.title")}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {t("useCases.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((item, index) => (
            <div
              key={item.titleKey}
              className="scroll-animate fade-in-up bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                {t(item.titleKey)}
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                {item.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#22A60D] mt-1">✓</span>
                    <span>{t(`${item.bulletKey ?? item.titleKey.replace(".title", "")}.bullets.${idx}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection({ t }: SectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("testimonials.title")}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {t("testimonials.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div
              key={item.nameKey}
              className="scroll-animate fade-in-up bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4`}
                >
                  {item.initials}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{t(item.nameKey)}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(item.roleKey)}
                  </p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                “{t(item.quoteKey)}”
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ t }: SectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("faq.title")}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {t("faq.subtitle")}
          </p>
        </div>
        <div className="space-y-6">
          {faqItems.map((item, index) => (
            <details
              key={item.questionKey}
              className="scroll-animate fade-in-up bg-gray-50 dark:bg-gray-800 rounded-xl p-6 cursor-pointer group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <summary className="text-xl font-bold text-gray-900 dark:text-white list-none flex items-center justify-between">
                {t(item.questionKey)}
                <svg className="w-6 h-6 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                <p className="mb-3">{t(item.answerKey)}</p>
                <p>{t(item.extraKey)}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PartnersSection({ t }: SectionProps) {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-4 bg-[#22A60D] text-[#176b0a]">
      <h2 className="text-3xl font-bold text-center mb-4 text-white">
        {t("partners.title")}
      </h2>
      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 py-6 px-4 items-center justify-items-center">
          {partners.map((partner, index) => (
            <div
              key={partner.src}
              className="scroll-animate fade-in-up w-full max-w-[220px] flex items-center justify-center"
              style={{ animationDelay: partner.delay || `${index * 0.1}s` }}
            >
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-300 hover:scale-105 hover:opacity-80 cursor-pointer flex items-center justify-center w-full"
                aria-label={t("partners.visit")}
              >
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={220}
                  height={88}
                  className="h-16 sm:h-20 md:h-24 w-auto object-contain filter dark:invert dark:brightness-0 dark:contrast-100"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA="
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 220px"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface LocalSeoProps extends HeroProps {
  sideContent?: React.ReactNode;
}

const LocalVideoPreview: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canLoadVideo, setCanLoadVideo] = useState(false);

  useEffect(() => {
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
  }, [canLoadVideo]);

  return (
    <div ref={containerRef} className="hidden lg:block">
      <div className="relative w-full max-w-xl ml-auto">
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/40 dark:border-white/10 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
          {canLoadVideo ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              muted
              loop
              autoPlay
              controls
              preload="none"
              poster="/static/main_home_ilustration.webp"
            >
              <source src="/static/office_video.mp4" type="video/mp4" />
              Tu navegador no soporta el vídeo.
            </video>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-700 dark:text-gray-200">
              <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/80 px-4 py-3 rounded-xl shadow-lg border border-white/50 dark:border-gray-700">
                <div className="w-10 h-10 rounded-full bg-[#22A60D]/10 text-[#22A60D] flex items-center justify-center">
                  ▶
                </div>
                <div>
                  <p className="font-semibold">Vídeo rápido de la oficina</p>
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

export function LocalSeoSection({ t, onWhatsApp, sideContent }: LocalSeoProps) {
  const resolvedSideContent = sideContent ?? <LocalVideoPreview />;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
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
                <div className="w-8 h-8 bg-[#22A60D] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                    {t("local.points.0.title")}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t("local.points.0.description")}
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
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                    {t("local.points.1.title")}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t("local.points.1.description")}
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
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                    {t("local.points.2.title")}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t("local.points.2.description")}
                  </p>
                </div>
              </div>
            </div>
            <Button size="lg" variant="special" onClick={() => window.location.href = "/contact"} className="text-lg px-10 py-6">
              {t("local.cta")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          <div className="scroll-animate slide-in-right">{resolvedSideContent}</div>
        </div>
      </div>
    </section>
  );
}

export function CtaSection({ t, onWhatsApp }: HeroProps) {
  return (
    <section
      id="contact"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#22A60D] via-[#46B1C9] to-[#623CEA] text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>
      <div className="max-w-4xl mx-auto text-center scroll-animate fade-in-up relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          {t("cta.title")}
        </h2>
        <p className="text-xl md:text-2xl mb-4 max-w-2xl mx-auto font-semibold">
          {t("cta.subtitle")}
        </p>
        <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
          {ctaBenefits.map((benefit, index) => (
            <div
              key={benefit.titleKey}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="text-3xl mb-3">{benefit.icon}</div>
              <h3 className="font-bold text-lg mb-2">
                {t(benefit.titleKey)}
              </h3>
              <p className="text-sm opacity-90">
                {t(benefit.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-white text-[#22A60D] hover:bg-gray-100 px-10 py-6 text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
            onClick={onWhatsApp}
          >
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>{t("cta.buttons.whatsapp")}</span>
            </div>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#22A60D] px-10 py-6 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            asChild
          >
            <Link href="/services">
              {t("cta.buttons.services")}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </Button>
        </div>
        <p className="text-sm mt-8 opacity-80">
          <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {t("cta.meta")}
        </p>
      </div>
    </section>
  );
}

export function SeoArticleSection({ t, onWhatsApp }: HeroProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#23272F]">
      <div className="max-w-4xl mx-auto">
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("seoArticle.title")}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {t("seoArticle.intro")}
          </p>
          <h3 className="text-2xl font-bold mb-4 mt-8 text-gray-900 dark:text-white">
            {t("seoArticle.section1.title")}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {t("seoArticle.section1.body")}
          </p>
          <h3 className="text-2xl font-bold mb-4 mt-8 text-gray-900 dark:text-white">
            {t("seoArticle.section2.title")}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {t("seoArticle.section2.body")}
          </p>
          <ul className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
            {[
              "Administradores de fincas: Automatización de incidencias, comunicación con comunidades y gestión de proveedores. Un administrador en Sevilla puede ahorrar hasta 20 horas semanales con nuestros sistemas.",
              "Inmobiliarias: Agentes conversacionales que cualifican leads, programan visitas y envían información de propiedades automáticamente. Ideal para agencias en Sevilla que gestionan decenas de inmuebles simultáneamente.",
              "Agencias de marketing: Automatización de publicaciones en redes sociales, generación de contenido con IA y análisis de campañas. Las agencias sevillanas que trabajan con nosotros gestionan 3x más clientes con el mismo equipo.",
              "Comercio retail: Gestión inteligente de inventario, predicción de demanda y atención al cliente automatizada vía WhatsApp Business.",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-[#22A60D] font-bold mt-1">→</span>
                <span>{t(`seoArticle.section2.list.${index}`)}</span>
              </li>
            ))}
          </ul>
          <h3 className="text-2xl font-bold mb-4 mt-8 text-gray-900 dark:text-white">
            {t("seoArticle.section3.title")}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {t("seoArticle.section3.body")}
          </p>
          <h3 className="text-2xl font-bold mb-4 mt-8 text-gray-900 dark:text-white">
            {t("seoArticle.section4.title")}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {t("seoArticle.section4.body")}
          </p>
          <ul className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
            {[
              "Conocimiento del mercado local: Entendemos las particularidades de las PYMEs andaluzas",
              "Disponibilidad presencial: Reuniones cara a cara en nuestra oficina de Sevilla centro",
              "Soluciones 100% personalizadas: No usamos plantillas. Cada proyecto se diseña específicamente para ti",
              "Formación incluida: Tu equipo aprende a gestionar y mejorar los sistemas que implementamos",
              "Soporte continuo: No desaparecemos después de la implementación",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-[#22A60D] font-bold mt-1">✓</span>
                <span>{t(`seoArticle.section4.list.${index}`)}</span>
              </li>
            ))}
          </ul>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-8 mt-8 border border-green-200 dark:border-green-800">
            <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {t("seoArticle.cta.title")}
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t("seoArticle.cta.body")}
            </p>
            <Button size="lg" variant="special" onClick={onWhatsApp}>
              <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t("seoArticle.cta.button")}
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}
