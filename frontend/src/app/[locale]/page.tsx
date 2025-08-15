"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState, lazy, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from 'next/image';
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Navbar = dynamic(() => import("@/components/ui/navbar"), { ssr: false });
import { usePreloadResources } from "@/hooks/usePreloadResources";
import { useServices } from "@/hooks/useServices";
const ServiceShowcase = dynamic(() => import("@/components/home/service-showcase").then(mod => mod.ServiceShowcase), { ssr: false });
const ServiceDetailsModal = dynamic(() => import("@/components/services/service-details-modal").then(mod => mod.ServiceDetailsModal), { ssr: false });


interface Service {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  duration?: number;
  requisites?: string;
  price?: string | null;
  is_featured: boolean;
  created_by?: number;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
  clean_description: string;
  color: string;
  color_hex: string;
}

// Lazy load heavy components that are below the fold
const DemoModal = lazy(() => import("@/components/home/demo-modal"));
const Footer = lazy(() => import("@/components/ui/footer"));
// const PricingPlans = lazy(() => import("@/components/home/pricing-plans"));
const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble").then(mod => mod.default), { ssr: false });
const StyledButton = dynamic(() => import("@/components/ui/styled-button").then(mod => mod.default), { ssr: false });
const ColourfulText = dynamic(() => import("@/components/ui/colourful-text").then(mod => mod.default), { ssr: false });
const CoursesShowcase = dynamic(() => import("@/components/home/courses-showcase").then(mod => mod.default), { ssr: false });

export default function HomePage() {
  const t = useTranslations("home");
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // Fetch services (up to 6, featured first) - ensure fresh fetch on mount
  const { services, isLoading: servicesLoading, isOnVacation, error: servicesError, refetch } = useServices(6);

  // Preload critical resources for better performance
  usePreloadResources();

  // useEffect(() => {
  //   const preloadHeroImage = () => {
  //     const existingPreload = document.querySelector('link[rel="preload"][href="/static/main_home_ilustration.webp"]');
  //     if (!existingPreload) {
  //       const link = document.createElement('link');
  //       link.rel = 'preload';
  //       link.href = '/static/main_home_ilustration.webp';
  //       link.as = 'image';
  //       link.type = 'image/webp';
  //       (link as HTMLLinkElement & { fetchPriority?: string }).fetchPriority = 'high';
  //       document.head.appendChild(link);
  //     }
  //   };
    
  //   preloadHeroImage();
  // }, []);

  // Service modal handlers - optimize with useCallback
  const handleServiceClick = useCallback((service: Service) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  }, []);

  const handleServiceContact = useCallback(() => {
    setIsServiceModalOpen(false);
    // Open WhatsApp with a service-specific message
    const message = selectedService 
      ? `Hello, I'm interested in your "${selectedService.title}" service. Could you provide more information?`
      : t("defaultWhatsAppMessage");
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/34658977045?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }, [selectedService, t]);

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

  // Optimize intersection observer setup with debounced scroll handler
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      // Use requestAnimationFrame to batch DOM updates
      requestAnimationFrame(() => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            // Stop observing this element once animated
            observer.unobserve(entry.target);
          }
        });
      });
    }, observerOptions);

    // Delayed observation setup to avoid interfering with initial render
    const setupObserver = () => {
      const animateElements = document.querySelectorAll(".scroll-animate");
      animateElements.forEach((el) => observer.observe(el));
    };

    // Setup observer after a small delay to ensure services are rendered
    const observerTimeout = setTimeout(setupObserver, 100);

    // Cleanup function
    return () => {
      clearTimeout(observerTimeout);
      observer.disconnect();
    };
  }, [services]); // Re-run when services change

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      {/* Navigation - now using the Navbar component (dynamically loaded) */}
      <Suspense fallback={<nav className="h-16 w-full bg-white dark:bg-[#1A1924]" />}> 
        <Navbar />
      </Suspense>

      {/* Hero Section */}
  <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-[#23272F] dark:via-[#23272F] dark:to-[#23272F]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-animate slide-in-left">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#22A60D] via-[#46B1C9] to-[#623CEA] bg-clip-text text-transparent">
                <Suspense fallback={<span>Ordinaly</span>}>
                  <ColourfulText text={t("hero.title")} />
                </Suspense>
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 text-gray-900 dark:text-white">{t("hero.subtitle")}</h2>
              <p className="text-xl text-gray-800 dark:text-gray-200 mb-12 leading-relaxed">
                {t("hero.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative inline-flex items-center justify-center gap-4 group">
                  <Button variant="special" size="lg" asChild>
                    <a href="#process">
                      {t("hero.discoverButton")}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 10 10"
                        height="10"
                        width="10"
                        fill="none"
                        className={cn("mt-0.5 ml-2 -mr-1 stroke-[#1A1924] stroke-2", "dark:stroke-white")}
                      >
                        <path
                          d="M0 5h7"
                          className="transition opacity-0 group-hover:opacity-100"
                        ></path>
                        <path
                          d="M1 1l4 4-4 4"
                          className="transition group-hover:translate-x-[3px]"
                        ></path>
                      </svg>
                    </a>
                  </Button>
                </div>
                <Button
                  size="lg"
                  variant="special"
                  className="border-[#46B1C9] text-[#46B1C9] hover:bg-[#46B1C9] hover:text-white text-lg px-8 py-4"
                  onClick={() => setIsDemoModalOpen(true)}
                >
                  {t("hero.demoButton")}
                </Button>
              </div>
            </div>
            <div className="scroll-animate slide-in-right">
                <Image
                  src="/static/main_home_ilustration.webp"
                  alt="AI Automation Dashboard"
                  width={450}
                  height={450}
                  className="rounded-2xl"
                  style={{ width: '100%', height: 'auto' }}
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA="
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                />
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal - Lazy loaded */}
      <Suspense fallback={null}>
        <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
      </Suspense>

      {/* Services Section */}
      <Suspense fallback={<div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>}>
        <ServiceShowcase
          services={services}
          isLoading={servicesLoading}
          isOnVacation={isOnVacation}
          error={servicesError}
          t={t}
          refetch={refetch}
          onServiceClick={handleServiceClick}
          onServiceContact={handleServiceContact}
        />
      </Suspense>

      {/* Partners Section */}
  <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#22A60D] text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">{t("partners.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center justify-items-center">
            {[
              { src: "/static/logos/logo_aviva_publicidad.webp", alt: "Aviva Publicidad Partner", delay: "0.1s", url: "https://avivapublicidad.es" },
              { src: "/static/logos/logo_grupo_addu.webp", alt: "Grupo Addu Partner", delay: "0.2s", url: "https://grupoaddu.com" },
              { src: "/static/logos/logo_proinca_consultores.webp", alt: "Proinca Consultores Partner", delay: "0.3s", url: "https://www.proincaconsultores.es" },
            ].map(({ src, alt, delay, url }, i) => (
              <div
                key={i}
                className="scroll-animate fade-in-up w-full flex justify-center"
                style={{ animationDelay: delay }}
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform duration-300 hover:scale-105 hover:opacity-80 cursor-pointer"
                  aria-label={`Visit ${alt} website`}
                >
                  <Image
                    src={src}
                    alt={alt}
                    width={300}
                    height={120}
                    className="h-24 w-auto object-contain filter dark:invert dark:brightness-0 dark:contrast-100"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA="
                  />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Showcase Section */}
      <Suspense fallback={
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
      }>
        <CoursesShowcase 
          limit={3} 
          showUpcomingOnly={false}
        />
      </Suspense>

      {/* About Section */}
  <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#23272F]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-animate slide-in-left">
              <Image
                src="/static/cta_ilustration.webp"
                width={600}
                height={500}
                alt="Andalusian Business Transformation"
                className="rounded-2xl shadow-2xl"
                style={{ width: '100%', height: 'auto' }}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA="
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              />
            </div>
            <div className="scroll-animate slide-in-right">
              <h2 className="text-2xl md:text-4xl font-bold mb-8 text-[#22A60D] dark:text-[#22A60D]">
                {t("about.title")}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">
                {t("about.description1")}
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-200 mb-8 leading-relaxed">
                {t("about.description2")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
  <section id="technologies" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#23272F]">
        <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 scroll-animate fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#E4572E] dark:text-[#FF7043]">{t("technologies.title")}</h2>
            <p className="text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
              {t("technologies.description")}
            </p>
          </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-[#22A60D]/10 dark:bg-[#174d0c] rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/odoo_logo.webp"
              alt="Odoo"
              width={80}
              height={40}
              className="h-14 w-auto mb-2 dark:invert"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA=" />
              <div className="text-lg font-semibold text-[#22A60D] dark:text-[#7CFC00] mb-1">{t("technologies.odoo.title")}</div>
              <div className="text-gray-800 dark:text-gray-200 text-sm">{t("technologies.odoo.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#46B1C9]/10 dark:bg-[#1a3a40] rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/whatsapp_logo.webp" 
              alt="WhatsApp Business" 
              width={80}
              height={40}
              className="mb-2 dark:invert"
              style={{ height: '2.5rem', width: 'auto' }}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA=" />
              <div className="text-lg font-semibold text-[#46B1C9] dark:text-[#00E5FF] mb-1">{t("technologies.whatsapp.title")}</div>
              <div className="text-gray-800 dark:text-gray-200 text-sm">{t("technologies.whatsapp.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#623CEA]/10 dark:bg-[#2a1a4d] rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/chatgpt_logo.webp"
              alt="ChatGPT"
              width={80}
              height={40}
              className="mb-2 dark:invert"
              style={{ height: '2.5rem', width: 'auto' }}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA=" />
              <div className="text-lg font-semibold text-[#623CEA] dark:text-[#B388FF] mb-1">{t("technologies.chatgpt.title")}</div>
              <div className="text-gray-800 dark:text-gray-200 text-sm">{t("technologies.chatgpt.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#00BFAE]/10 dark:bg-[#0d4740] rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/gemini_logo.webp"
              alt="Gemini"
              width={80}
              height={40}
              className="mb-2"
              style={{ height: '2.5rem', width: 'auto' }}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA=" />
              <div className="text-lg font-semibold text-[#00BFAE] dark:text-[#1DE9B6] mb-1">{t("technologies.gemini.title")}</div>
              <div className="text-gray-800 dark:text-gray-200 text-sm">{t("technologies.gemini.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#4285F4]/10 dark:bg-[#1a2a4d] rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/looker_studio_logo.webp"
              alt="Looker Studio"
              width={80}
              height={40}
              className="mb-2"
              style={{ height: '2.5rem', width: 'auto' }}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA=" />
              <div className="text-lg font-semibold text-[#4285F4] dark:text-[#82B1FF] mb-1">{t("technologies.looker.title")}</div>
              <div className="text-gray-800 dark:text-gray-200 text-sm">{t("technologies.looker.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#4285F4]/10 dark:bg-[#1a2a4d] rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/meta_logo.webp"
              width={80}
              height={40}
              alt="Meta"
              className="mb-2"
              style={{ height: '2.5rem', width: 'auto' }}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA=" />
              <div className="text-lg font-semibold text-[#4285F4] dark:text-[#82B1FF] mb-1">{t("technologies.meta.title")}</div>
              <div className="text-gray-800 dark:text-gray-200 text-sm">{t("technologies.meta.description")}</div>
            </div>
            </div>
        </div>
      </section>

      {/* Process Section */}
      {/* <section id="process" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#623CEA]">{t("process.title")}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t("process.description")}
            </p>
            <Suspense fallback={<div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>}>
              <PricingPlans />
            </Suspense>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section
        id="contact"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#22A60D] via-[#46B1C9] to-[#623CEA] text-white"
      >
        <div className="max-w-4xl mx-auto text-center scroll-animate fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            {t("cta.title1")}
            <Suspense fallback={<span>{t("cta.title2")}</span>}>
              <span>{t("cta.title2")}</span>
            </Suspense>
            {t("cta.title3")}
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Suspense fallback={
                  <Button 
                    className="bg-white text-[#22A60D] hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                    onClick={handleWhatsAppChat}
                  >
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      {t("cta.button")}
                    </div>
                  </Button>
                }>
                  <StyledButton 
                    text={
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {t("cta.button")}
                      </div>
                    } 
                    onClick={handleWhatsAppChat}
                  />
                </Suspense>
              </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Suspense fallback={
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
      }>
        <Footer />
      </Suspense>

      <Suspense fallback={null}>
        <WhatsAppBubble />
      </Suspense>

      {/* Service Details Modal */}
      <Suspense fallback={null}>
        <ServiceDetailsModal
          service={selectedService}
          isOpen={isServiceModalOpen}
          onClose={closeServiceModal}
          onContact={handleServiceContact}
        />
      </Suspense>
    </div>
  );
}
