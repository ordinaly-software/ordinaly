"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/hooks/useServices";
import {
  HomeHero,
  BenefitsSection,
  ServicesSection,
  ProcessSection,
  UseCasesSection,
  // TestimonialsSection,
  FaqSection,
  LocalSeoSection,
  PartnersSection,
  CtaSection,
  SeoArticleSection,
} from "@/components/home/home-sections";

const ServiceShowcase = dynamic(() => import("@/components/home/service-showcase").then(mod => mod.default), { ssr: false, loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div> });
const ServiceDetailsModal = dynamic(() => import("@/components/services/service-details-modal").then(mod => mod.ServiceDetailsModal), { ssr: false, loading: () => null });
const Footer = dynamic(() => import("@/components/ui/footer"), { ssr: false, loading: () => <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924]"><div className="max-w-7xl mx-auto"><div className="grid md:grid-cols-4 gap-8"><div className="col-span-2"><div className="h-24 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div></div></div></div></footer> });
const CoursesShowcase = dynamic(() => import("@/components/home/courses-showcase").then(mod => mod.default), { ssr: false, loading: () => <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50"><div className="max-w-7xl mx-auto"><div className="text-center mb-16"><div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6 max-w-md mx-auto"></div><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse max-w-2xl mx-auto"></div></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{Array.from({ length: 3 }).map((_, index) => (<div key={index} className="bg-white dark:bg-gray-800/50 rounded-xl p-6"><div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div><div className="space-y-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div></div></div>))}</div></div></section> });

export default function HomePage() {
  const t = useTranslations("home");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const servicesSectionRef = useRef<HTMLElement | null>(null);
  const [servicesEnabled, setServicesEnabled] = useState(false);

  const { services, isLoading: servicesLoading, isOnVacation, error: servicesError, refetch } = useServices(6, false, servicesEnabled);
  const servicesLoadingState = !servicesEnabled || servicesLoading;
  const servicesErrorState = servicesEnabled ? servicesError : null;
  const servicesVacationState = servicesEnabled ? isOnVacation : false;

  const handleServiceClick = useCallback((service: Service) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  }, []);

  const closeServiceModal = useCallback(() => {
    setIsServiceModalOpen(false);
    setSelectedService(null);
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

  useEffect(() => {
    if (servicesEnabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setServicesEnabled(true);
          }
        });
      },
      { threshold: 0.2, rootMargin: '200px' }
    );

    const target = servicesSectionRef.current;
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [servicesEnabled]);

  // Schema markup for SEO
  useEffect(() => {
    const schemaOrganization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Ordinaly",
      "url": "https://ordinaly.ai",
      "logo": "https://ordinaly.ai/logo.png",
      "description": "Agentes de IA y automatización empresarial en Sevilla. Transformamos negocios con inteligencia artificial: chatbots, CRMs, workflows y formación para empresas.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Plaza del Duque 1",
        "addressLocality": "Sevilla",
        "addressRegion": "Andalucía",
        "postalCode": "41002",
        "addressCountry": "ES"
      },
      "telephone": "+34626270806",
      "email": "info@ordinaly.ai",
      "areaServed": ["Sevilla", "Andalucía", "España"],
      "sameAs": [
        "https://www.linkedin.com/company/ordinaly",
        "https://www.instagram.com/ordinaly",
        "https://www.tiktok.com/@ordinaly",
        "https://www.youtube.com/@ordinaly"
      ]
    };

    const schemaLocalBusiness = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Ordinaly - Automatización Empresarial con IA",
      "image": "https://ordinaly.ai/static/main_home_ilustration.webp",
      "@id": "https://ordinaly.ai",
      "url": "https://ordinaly.ai",
      "telephone": "+34626270806",
      "priceRange": "€€",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Plaza del Duque 1",
        "addressLocality": "Sevilla",
        "addressRegion": "Andalucía",
        "postalCode": "41002",
        "addressCountry": "ES"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 37.3890924,
        "longitude": -5.9844589
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    };

    const schemaService = {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Automatización Empresarial con IA",
      "provider": {
        "@type": "Organization",
        "name": "Ordinaly"
      },
      "areaServed": {
        "@type": "City",
        "name": "Sevilla"
      },
      "description": "Servicios de agentes de IA, automatización de procesos, chatbots inteligentes, CRM/ERP con Odoo y formación en inteligencia artificial para empresas en Sevilla"
    };

    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.text = JSON.stringify(schemaOrganization);
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.text = JSON.stringify(schemaLocalBusiness);
    document.head.appendChild(script2);

    const script3 = document.createElement('script');
    script3.type = 'application/ld+json';
    script3.text = JSON.stringify(schemaService);
    document.head.appendChild(script3);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
      document.head.removeChild(script3);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      <HomeHero t={t} onWhatsApp={handleWhatsAppChat} />
      <BenefitsSection t={t} />
      <CoursesShowcase limit={3} showUpcomingOnly={false} />
      <ServicesSection
        t={t}
        onWhatsApp={handleWhatsAppChat}
        sectionRef={servicesSectionRef}
        servicesContent={
          <ServiceShowcase
            services={servicesEnabled ? services : []}
            isLoading={servicesLoadingState}
            isOnVacation={servicesVacationState}
            error={servicesErrorState}
            t={t}
            refetch={refetch}
            onServiceClick={handleServiceClick}
          />
        }
      />
      <ProcessSection t={t} />
      <UseCasesSection t={t} />
      {/* <TestimonialsSection t={t} /> */}
      <FaqSection t={t} />
      <LocalSeoSection t={t} onWhatsApp={handleWhatsAppChat} />
      <PartnersSection t={t} />
      <SeoArticleSection t={t} onWhatsApp={handleWhatsAppChat} />
      <CtaSection t={t} onWhatsApp={handleWhatsAppChat} />
      <Footer />
      <ServiceDetailsModal service={selectedService} isOpen={isServiceModalOpen} onClose={closeServiceModal} />
    </div>
  );
}
