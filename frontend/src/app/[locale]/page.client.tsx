"use client";

import { useEffect, useCallback, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/hooks/useServices";
import type { Course } from "@/hooks/useCourses";
import { HomeHero } from "@/components/home/home-hero";
import { ServicesSection } from "@/components/home/services-section";
import { LocalSeoSection } from "@/components/home/local-seo-section";
import { CtaSection } from "@/components/home/cta-section";
import { getWhatsAppUrl } from "@/utils/whatsapp";

const ServiceShowcase = dynamic(
  () => import("@/components/home/service-showcase").then((mod) => mod.default),
  {
    loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>,
  },
);
const Footer = dynamic(() => import("@/components/ui/footer"), {
  loading: () => (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="h-24 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    </footer>
  ),
});
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
const ProcessSection = dynamic(
  () => import("@/components/home/process-section").then((mod) => mod.ProcessSection),
  { loading: () => null },
);
const BenefitsSection = dynamic(
  () => import("@/components/home/benefits-section").then((mod) => mod.BenefitsSection),
  { loading: () => null },
);
const UseCasesSection = dynamic(
  () => import("@/components/home/use-cases-section").then((mod) => mod.UseCasesSection),
  { loading: () => null },
);
const WorkWithUsSection = dynamic(
  () => import("@/components/ui/work-with-us").then((mod) => mod.WorkWithUsSection),
  { loading: () => null },
);
const TestimonialsSection = dynamic(
  () => import("@/components/home/testimonials-section").then((mod) => mod.TestimonialsSection),
  { loading: () => null },
);
const PartnersSection = dynamic(
  () => import("@/components/home/partners-section").then((mod) => mod.PartnersSection),
  { loading: () => null },
);
const ContactForm = dynamic(() => import("@/components/ui/contact-form.client"), {
  loading: () => null,
});
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
  initialServices = [],
  initialCourses = [],
}: {
  initialServices?: Service[];
  initialCourses?: Course[];
}) {
  const t = useTranslations("home");
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

  useEffect(() => {
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const preloadSections = () => {
      void import("@/components/home/process-section");
      void import("@/components/home/benefits-section");
      void import("@/components/home/use-cases-section");
    };

    const idleId = idleWindow.requestIdleCallback?.(preloadSections) ?? null;
    const timeoutId = idleId ? null : window.setTimeout(preloadSections, 1200);
    return () => {
      if (idleId !== null) {
        idleWindow.cancelIdleCallback?.(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      <HomeHero t={t} onWhatsApp={handleWhatsAppChat} />
      <ServicesSection
        t={t}
        onWhatsApp={handleWhatsAppChat}
        sectionRef={servicesSectionRef}
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
      <LocalSeoSection t={t} />
      <DeferredSection>
        <CoursesShowcase limit={3} showUpcomingOnly={false} initialCourses={initialCourses} />
      </DeferredSection>
      <DeferredSection rootMargin="2000px 0px">
        <ProcessSection t={t} />
      </DeferredSection>
      <DeferredSection rootMargin="2000px 0px">
        <BenefitsSection t={t} />
      </DeferredSection>
      <DeferredSection rootMargin="2400px 0px">
        <UseCasesSection t={t} />
      </DeferredSection>
      <DeferredSection>
        <WorkWithUsSection />
      </DeferredSection>
      <DeferredSection>
        <TestimonialsSection t={t} />
      </DeferredSection>
      <DeferredSection>
        <PartnersSection t={t} />
      </DeferredSection>
      <DeferredSection>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <ContactForm />
        </section>
      </DeferredSection>
      <CtaSection t={t} onWhatsApp={handleWhatsAppChat} />
      <DeferredSection>
        <Footer />
      </DeferredSection>
    </div>
  );
}
