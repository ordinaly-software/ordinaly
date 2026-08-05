"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useSiteData } from "@/contexts/site-data-context";
import type { Course } from "@/hooks/useCourses";
import { HomeHero } from "@/components/home/home-hero";
import { ServicesHighlightCarousel } from "@/components/home/services-highlight-carousel";
import Footer from "@/components/ui/footer";
import ReCaptchaWrapper from "@/app/[locale]/recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import { ShieldCheck, Code2, Users } from "lucide-react";
import { PartnerShowcase } from "@/components/ui/partner-showcase";
import { HeroVideoDialog } from "@/components/home/hero-video-dialog";
import { FaqAccordion, type FaqAccordionItem } from "@/components/ui/faq-accordion";
import { NewsletterBanner } from "@/components/ui/newsletter-banner";

const CoursesShowcase = dynamic(
  () => import("@/components/home/courses-showcase").then((mod) => mod.default),
  {
    loading: () => (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6 max-w-md mx-auto"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse max-w-2xl mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800/50 rounded-xl p-6">
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
  },
);
const SectionSkeleton = ({ id }: { id?: string }) => (
  <section
    id={id}
    aria-hidden="true"
    className="mx-auto my-6 w-full max-w-6xl animate-pulse rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-900/10 dark:bg-white/[0.04] dark:shadow-black/30"
  >
    <div className="h-6 w-40 rounded-full bg-slate-200 dark:bg-slate-700 mb-6" />
    <div className="space-y-3">
      {[1, 2, 3].map((line) => (
        <div
          key={line}
          className="h-3 rounded-full bg-slate-200 dark:bg-slate-700"
          style={{ width: `${90 - line * 10}%` }}
        />
      ))}
      <div className="mt-6 flex flex-wrap gap-3">
        {[1, 2, 3].map((pill) => (
          <div key={pill} className="h-3 min-w-[5rem] flex-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    </div>
  </section>
);

const whyUsItems = [
  {
    titleKey: "whyUs.items.0.title",
    descriptionKey: "whyUs.items.0.description",
    Icon: ShieldCheck,
  },
  {
    titleKey: "whyUs.items.1.title",
    descriptionKey: "whyUs.items.1.description",
    Icon: Code2,
  },
  {
    titleKey: "whyUs.items.2.title",
    descriptionKey: "whyUs.items.2.description",
    Icon: Users,
  },
];

const TestimonialsSection = dynamic(
  () => import("@/components/home/testimonials-section").then((mod) => mod.TestimonialsSection),
  { loading: () => null, ssr: false },
);
const ContactForm = dynamic(() => import("@/components/ui/contact-form.client"), {
  loading: () => null,
  ssr: false,
});
const WhatsAppBubble = dynamic(
  () => import("@/components/home/whatsapp-bubble").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <WhatsAppBubbleSkeleton />,
  },
);
function DeferredSection({
  children,
  className,
  rootMargin = "300px 0px",
  id,
}: {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
  id?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const deferredSectionStyle = {
    contentVisibility: "auto",
    containIntrinsicSize: "1000px",
  } as const;

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let cancelled = false;
    const handleVisible = () => {
      if (!cancelled) {
        setShouldRender(true);
      }
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              handleVisible();
              observer.disconnect();
            }
          });
        },
        { rootMargin },
      );
      observer.observe(node);
      return () => {
        cancelled = true;
        observer.disconnect();
      };
    }

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(handleVisible);
    } else {
      timeoutId = globalThis.setTimeout(handleVisible, 1);
    }

    return () => {
      cancelled = true;
      if (idleId !== null) {
        idleWindow.cancelIdleCallback?.(idleId);
      }
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, [rootMargin]);

  useEffect(() => {
    if (shouldRender) {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("scroll-animate:refresh"));
      });
    }
  }, [shouldRender]);

  return (
    <div id={id} ref={containerRef} style={deferredSectionStyle} className={className}>
      {shouldRender ? children : null}
    </div>
  );
}

export default function HomePage({
  renderedAt,
}: {
  renderedAt: number;
}) {
  const t = useTranslations("home");
  const servicesSectionRef = useRef<HTMLElement | null>(null);

  const { courses: allCourses } = useSiteData();

  const initialCourses = useMemo(() => {
    const getSortTime = (course: Course) => {
      const createdAt = Date.parse(course.created_at);
      if (!Number.isNaN(createdAt)) return createdAt;
      const startAt = Date.parse(course.start_date);
      if (!Number.isNaN(startAt)) return startAt;
      return 0;
    };
    return allCourses
      .filter((course) => {
        const startDate = Date.parse(course.start_date);
        return !Number.isNaN(startDate) && startDate >= renderedAt;
      })
      .sort((a, b) => getSortTime(b) - getSortTime(a))
      .slice(0, 3);
  }, [allCourses, renderedAt]);

  const homeFaqItems: FaqAccordionItem[] = useMemo(
    () =>
      [0, 1, 2, 3].map((index) => ({
        question: t(`faq.items.${index}.question`),
        answer: t(`faq.items.${index}.answer`),
      })),
    [t],
  );

  const trainingHighlight = t.rich("courses.trainingHighlight", {
    b: (chunks) => <strong>{chunks}</strong>,
  });

  const [shouldRenderDeferredSections, setShouldRenderDeferredSections] = useState(false);
  const [showWhatsAppBubble, setShowWhatsAppBubble] = useState(false);

  useEffect(() => {
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const scheduleRender = () => {
      setShouldRenderDeferredSections(true);
      setShowWhatsAppBubble(true);
    };
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(scheduleRender, { timeout: 1000 });
    } else {
      timeoutHandle = window.setTimeout(scheduleRender, 400);
    }

    return () => {
      if (idleHandle !== null) {
        idleWindow.cancelIdleCallback?.(idleHandle);
      }
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      requestAnimationFrame(() => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      });
    }, observerOptions);

    const setupObserver = () => {
      const animateElements = document.querySelectorAll(".scroll-animate");
      animateElements.forEach((el) => observer.observe(el));
    };

    const observerTimeout = setTimeout(setupObserver, 100);
    const handleRefresh = () => setupObserver();
    window.addEventListener("scroll-animate:refresh", handleRefresh);

    return () => {
      clearTimeout(observerTimeout);
      window.removeEventListener("scroll-animate:refresh", handleRefresh);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[--color-bg-primary] dark:bg-[--color-bg-inverted] text-slate-medium dark:text-cloud-medium transition-colors duration-300">
      <HomeHero t={t} />

      <PartnerShowcase
        title={t("partners.subtitle")}
        className="pt-10 pb-12"
        titleTag="h3"
      />

      {/* Why choose us: explainer video + USP cards */}
      <section id="why-us" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto space-y-16">
          {/* Section header */}
          <div className="text-center scroll-animate fade-in-up">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 text-slate-dark dark:text-ivory-light">
            {t("whyUs.title")}
          </h3>
          </div>

          <div className="max-w-4xl mx-auto">
            <HeroVideoDialog
              className="w-full"
              animationStyle="from-center"
              videoUrl="https://youtu.be/WPgLFodfAm8"
              thumbnailSrc="/static/home/why_us_video_thumbnail.webp"
              thumbnailAlt={t("whyUs.title")}
            />
            <div className="mt-4 text-center">
              <p className="font-semibold text-slate-dark dark:text-ivory-light">
                {t("whyUs.videoCaptionName")}
              </p>
              <p className="text-sm text-slate-medium dark:text-cloud-medium">
                {t("whyUs.videoCaptionRole")}
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mt-12">
            {whyUsItems.map(({ titleKey, descriptionKey, Icon }, index) => (
              <div
                key={titleKey}
                className="scroll-animate fade-in-up text-center p-5 bg-[--color-bg-card] dark:bg-[--swatch--slate-medium] rounded-a-l border border-[--color-border-subtle] dark:border-[--color-border-strong]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-10 h-10 bg-clay/15 dark:bg-clay/20 rounded-a-m flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-clay" strokeWidth={1.5} />
                </div>
                <h2 className="text-base font-semibold mb-1.5 text-slate-dark dark:text-ivory-light">
                  {t(titleKey)}
                </h2>
                <p className="text-sm text-slate-medium dark:text-cloud-medium">{t(descriptionKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" ref={servicesSectionRef} className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto space-y-16">

          {/* Section header */}
          <div className="text-center scroll-animate fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-dark dark:text-ivory-light">
              {t("services.title")}
            </h2>
            <p className="text-lg text-slate-medium dark:text-cloud-medium max-w-3xl mx-auto">
              {t("services.subtitle")}
            </p>
          </div>

          <ServicesHighlightCarousel />
        </div>
    </section>


      <CoursesShowcase
        limit={3}
        showUpcomingOnly={false}
        initialCourses={initialCourses}
        referenceNow={renderedAt}
        cardTitleTag="h4"
        titleOverride={t("courses.homeTitle")}
        descriptionOverride={t("courses.homeSubtitle")}
        trainingHighlight={trainingHighlight}
      />
      {shouldRenderDeferredSections ? (
        <>
          <DeferredSection>
            <FaqAccordion titleTag="h3" title={t("faq.title")} items={homeFaqItems} />
          </DeferredSection>
          <DeferredSection id="contacto" className="scroll-mt-24">
            <ReCaptchaWrapper badgeContainerId="recaptcha-badge-home-contact">
              <ContactForm
                recaptchaAction="home_contact_form"
                recaptchaBadgeId="recaptcha-badge-home-contact"
                showCommitmentNote
              />
            </ReCaptchaWrapper>
          </DeferredSection>
          <DeferredSection>
            <TestimonialsSection t={t} titleTag="h3" />
          </DeferredSection>
          <DeferredSection>
            <NewsletterBanner className="mx-auto w-full max-w-[1600px]" />
            <br />
          </DeferredSection>
        </>
      ) : (
        <>
          <SectionSkeleton />
          <SectionSkeleton id="contacto" />
          <SectionSkeleton />
          <SectionSkeleton />
        </>
      )}

      {showWhatsAppBubble ? <WhatsAppBubble /> : <WhatsAppBubbleSkeleton />}
      <Footer />
    </div>
  );
}
