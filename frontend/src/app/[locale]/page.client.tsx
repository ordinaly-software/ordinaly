"use client";

import { useEffect, useCallback, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/hooks/useServices";
import type { Course } from "@/hooks/useCourses";
import { HomeHero } from "@/components/home/home-hero";
import { ServicesSection } from "@/components/home/services-section";
import Footer from "@/components/ui/footer";
import ReCaptchaWrapper from "@/app/[locale]/recaptcha-provider";
import { getWhatsAppUrl } from "@/utils/whatsapp";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import { Zap, SlidersHorizontal, Headphones } from "lucide-react";
import { LogoCarousel } from "@/components/ui/logo-carousel";
import { AiChatDemo } from "@/components/home/ai-chat-demo";

const ServiceShowcase = dynamic(
  () => import("@/components/home/service-showcase").then((mod) => mod.default),
  {
    loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>,
  },
);
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
const SectionSkeleton = () => (
  <section
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

const serviceBenefits = [
  {
    titleKey: "services.extra.0.title",
    descriptionKey: "services.extra.0.description",
    Icon: Zap,
  },
  {
    titleKey: "services.extra.1.title",
    descriptionKey: "services.extra.1.description",
    Icon: SlidersHorizontal,
  },
  {
    titleKey: "services.extra.2.title",
    descriptionKey: "services.extra.2.description",
    Icon: Headphones,
  },
];

// Partner logo image components for LogoCarousel
const partnerLogos: { name: string; id: number; img: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  "/static/logos/logo_aviva_publicidad_small.webp",
  "/static/logos/logo_grupo_addu_small.webp",
  "/static/logos/logo_proinca_consultores_small.webp",
  "/static/logos/logo_guadalquivir_fincas_small.webp",
  "/static/logos/logo_esau.webp",
  "/static/logos/logo_geesol.webp",
].map((src, i) => ({
  name: src,
  id: i + 1,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  img: ({ className }: React.SVGProps<SVGSVGElement>) => <img src={src} alt="" className={`object-contain invert brightness-0 contrast-100 ${className ?? ""}`} />,
}));

const UseCasesSection = dynamic(
  () => import("@/components/home/use-cases-section").then((mod) => mod.UseCasesSection),
  { loading: () => null, ssr: false },
);
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
const FaqSection = dynamic(
  () => import("@/components/formation/faq-section").then((mod) => mod.FaqSection),
  { loading: () => <SectionSkeleton />, ssr: false },
);
function DeferredSection({
  children,
  className,
  rootMargin = "300px 0px",
}: {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
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
    <div ref={containerRef} style={deferredSectionStyle} className={className}>
      {shouldRender ? children : null}
    </div>
  );
}

export default function HomePage({
  renderedAt,
  initialServices = [],
  initialCourses = [],
}: {
  renderedAt: number;
  initialServices?: Service[];
  initialCourses?: Course[];
}) {
  const t = useTranslations("home");
  const formationT = useTranslations("formation");
  const servicesSectionRef = useRef<HTMLElement | null>(null);

  const shouldFetchServices = initialServices.length === 0;
  const {
    services,
    isLoading: servicesLoading,
    isOnVacation,
    error: servicesError,
    refetch,
  } = useServices(6, false, shouldFetchServices, initialServices);
  const servicesLoadingState = shouldFetchServices && servicesLoading;
  const servicesErrorState = shouldFetchServices ? servicesError : null;
  const servicesVacationState = shouldFetchServices ? isOnVacation : false;

  const handleServiceContact = useCallback((service: Service) => {
    const message = `Hola! Estoy interesado en el servicio "${service.title}". ¿Podrían proporcionarme más información?`;
    const whatsappUrl = getWhatsAppUrl(message);
    if (!whatsappUrl) return;
    window.open(whatsappUrl, '_blank');
  }, []);

  const handleWhatsAppChat = useCallback(() => {
    const whatsappUrl = getWhatsAppUrl(t('defaultWhatsAppMessage'));
    if (!whatsappUrl) return;
    window.open(whatsappUrl, '_blank');
  }, [t]);

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
  }, [services]);

  return (
    <div className="min-h-screen bg-[--color-bg-primary] dark:bg-[--color-bg-inverted] text-slate-medium dark:text-cloud-medium transition-colors duration-300">
      <HomeHero t={t} onWhatsApp={handleWhatsAppChat} />
      
      {/* Benefits section */}
      <section id="benefits" className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-5">
          {serviceBenefits.map(({ titleKey, descriptionKey, Icon }, index) => (
            <div
              key={titleKey}
              className="scroll-animate fade-in-up text-center p-5 bg-[--color-bg-card] dark:bg-[--swatch--slate-medium] rounded-a-l border border-[--color-border-subtle] dark:border-[--color-border-strong]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-10 h-10 bg-clay/15 dark:bg-clay/20 rounded-a-m flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-clay" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-semibold mb-1.5 text-slate-dark dark:text-ivory-light">
                {t(titleKey)}
              </h3>
              <p className="text-sm text-slate-medium dark:text-cloud-medium">{t(descriptionKey)}</p>
            </div>
          ))}
        </div>
      </section>
      <ServicesSection
        t={t}
        onWhatsApp={handleWhatsAppChat}
        sectionRef={servicesSectionRef}
        featuredServices={services.slice(0, 3)}
        servicesContent={
          <ServiceShowcase
            services={services}
            isLoading={servicesLoadingState}
            isOnVacation={servicesVacationState}
            error={servicesErrorState}
            t={t}
            refetch={refetch}
            onContact={handleServiceContact}
          />
        }
      />
      <CoursesShowcase
        limit={3}
        showUpcomingOnly={false}
        initialCourses={initialCourses}
        referenceNow={renderedAt}
      />
      {shouldRenderDeferredSections ? (
        <>
          <DeferredSection rootMargin="2400px 0px">
            <UseCasesSection t={t} />
          </DeferredSection>
          <DeferredSection>
            <TestimonialsSection t={t} />
          </DeferredSection>
          <DeferredSection>
            {/* Partners */}
            <section className="u-container pb-12">
              <div className="rounded-[2rem] border border-[--color-border-subtle] bg-[--swatch--slate-dark] p-8 md:p-12 dark:border-white/10">
                <div className="flex flex-col lg:flex-row items-center gap-10">
                  <div className="flex-shrink-0 lg:max-w-xs text-white space-y-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/50">{t("partners.title")}</p>
                    <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                      {t("partners.subtitle")}
                    </h2>
                  </div>
                  <div className="flex-1 flex justify-center overflow-hidden">
                    <LogoCarousel logos={partnerLogos} columnCount={3} mobileColumnCount={2} />
                  </div>
                </div>
              </div>
            </section>
          </DeferredSection>
          <DeferredSection>
            <AiChatDemo t={t} />
          </DeferredSection>
          <DeferredSection>
            <FaqSection t={formationT} />
          </DeferredSection>
          <DeferredSection>
            <ReCaptchaWrapper badgeContainerId="recaptcha-badge-home-contact">
              <ContactForm
                recaptchaAction="home_contact_form"
                recaptchaBadgeId="recaptcha-badge-home-contact"
              />
            </ReCaptchaWrapper>
          </DeferredSection>
        </>
      ) : (
        <>
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
        </>
      )}

      {showWhatsAppBubble ? <WhatsAppBubble /> : <WhatsAppBubbleSkeleton />}
      <Footer />
    </div>
  );
}
