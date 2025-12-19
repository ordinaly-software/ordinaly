"use client";

import { useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/hooks/useServices";
import type { Course } from "@/hooks/useCourses";
import { HomeHero } from "@/components/home/home-hero";
import { ServicesSection } from "@/components/home/services-section";
import { BenefitsSection } from "@/components/home/benefits-section";
import { CtaSection } from "@/components/home/cta-section";
import { FaqSection } from "@/components/home/faq-section";
import { LocalSeoSection } from "@/components/home/local-seo-section";
import { PartnersSection } from "@/components/home/partners-section";
import { ProcessSection } from "@/components/home/process-section";
import { UseCasesSection } from "@/components/home/use-cases-section";
import ContactForm from "@/components/ui/contact-form.client";
import { WorkWithUsSection } from "@/components/ui/work-with-us";

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

export default function HomePage({
  initialServices = [],
  initialCourses = [],
}: {
  initialServices?: Service[];
  initialCourses?: Course[];
}) {
  const t = useTranslations("home");
  const servicesSectionRef = useRef<HTMLElement | null>(null);
  const deferredSectionStyle = {
    contentVisibility: "auto",
    containIntrinsicSize: "1000px",
  } as const;

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
    const message = encodeURIComponent(
      `Hola! Estoy interesado en el servicio "${service.title}". ¿Podrían proporcionarme más información?`
    );
    const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }, []);

  const handleWhatsAppChat = useCallback(() => {
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER;
    const message = encodeURIComponent(t('defaultWhatsAppMessage'));
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
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

    return () => {
      clearTimeout(observerTimeout);
      observer.disconnect();
    };
  }, [services]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      <HomeHero t={t} onWhatsApp={handleWhatsAppChat} />
      <CoursesShowcase limit={3} showUpcomingOnly={false} initialCourses={initialCourses} />
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
      <div style={deferredSectionStyle}>
        <BenefitsSection t={t} />
      </div>
      <div style={deferredSectionStyle}>
        <WorkWithUsSection />
      </div>
      <div style={deferredSectionStyle}>
        <ProcessSection t={t} />
      </div>
      <div style={deferredSectionStyle}>
        <UseCasesSection t={t} />
      </div>
      {/* <TestimonialsSection t={t} /> */}
      <div style={deferredSectionStyle}>
        <FaqSection t={t} />
      </div>
      <div style={deferredSectionStyle}>
        <LocalSeoSection t={t} />
      </div>
      <div style={deferredSectionStyle}>
        <PartnersSection t={t} />
      </div>
      <div style={deferredSectionStyle}>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <ContactForm />
        </section>
      </div>
      <div style={deferredSectionStyle}>
        <CtaSection t={t} onWhatsApp={handleWhatsAppChat} />
      </div>
      <Footer />
    </div>
  );
}
