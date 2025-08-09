"use client";

import { Bot, Workflow, Zap, Users, TrendingUp, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, lazy, Suspense, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from 'next/image';
import Link from 'next/link';
import Navbar from "@/components/ui/navbar";
import { usePreloadResources } from "@/hooks/usePreloadResources";
import { useServices } from "@/hooks/useServices";
import { ServiceDetailsModal } from "@/components/home/service-details-modal";
import { renderIcon } from "@/components/ui/icon-select";
import { truncateText } from "@/utils/text";


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
const Footer = lazy(() => import("@/components/home/footer"));
const PricingPlans = lazy(() => import("@/components/home/pricing-plans"));
const WhatsAppBubble = lazy(() => import("@/components/home/whatsapp-bubble"));
const StyledButton = lazy(() => import("@/components/ui/styled-button"));
const ColourfulText = lazy(() => import("@/components/ui/colourful-text"));
const CoursesShowcase = lazy(() => import("@/components/home/courses-showcase"));

export default function HomePage() {
  const t = useTranslations("home");
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // Fetch services (up to 6, featured first) - ensure fresh fetch on mount
  const { services, isLoading: servicesLoading, isOnVacation, error: servicesError, refetch } = useServices(6);

  // Preload critical resources for better performance
  usePreloadResources();

  // Preload hero image for home page only
  useEffect(() => {
    const preloadHeroImage = () => {
      const existingPreload = document.querySelector('link[rel="preload"][href="/static/girl_resting_transparent.webp"]');
      if (!existingPreload) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = '/static/girl_resting_transparent.webp';
        link.as = 'image';
        link.type = 'image/webp';
        (link as HTMLLinkElement & { fetchPriority?: string }).fetchPriority = 'high';
        document.head.appendChild(link);
      }
    };
    
    preloadHeroImage();
  }, []);

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
      {/* Navigation - now using the Navbar component */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-[#22A60D]/10 dark:via-[#46B1C9]/10 dark:to-[#623CEA]/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-animate slide-in-left">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#22A60D] via-[#46B1C9] to-[#623CEA] bg-clip-text text-transparent">
                <Suspense fallback={<span>Ordinaly</span>}>
                  <ColourfulText text={t("hero.title")} />
                </Suspense>
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 text-gray-800 dark:text-white">{t("hero.subtitle")}</h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-12 leading-relaxed">
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
                  src="/static/girl_resting_transparent.webp"
                  alt="AI Automation Dashboard"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl"
                  style={{ width: '100%', height: 'auto' }}
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA="
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
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
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#22A60D]">{t("services.title")}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t("services.description")}
            </p>
          </div>

          {servicesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mb-4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : isOnVacation ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#22A60D]/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#22A60D]">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('services.vacationTitle')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('services.vacationMessage')}
                </p>
                <Button
                  variant="outline"
                  onClick={refetch}
                  className="flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"/>
                    <polyline points="1 20 1 14 7 14"/>
                    <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                  {t('services.retryButton')}
                </Button>
              </div>
            </div>
          ) : servicesError ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Error Loading Services
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {servicesError}
                </p>
                <Button
                  variant="outline"
                  onClick={refetch}
                  className="flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"/>
                    <polyline points="1 20 1 14 7 14"/>
                    <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                  Try Again
                </Button>
              </div>
            </div>
          ) : services.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => {
                const localizedService = service; // Assuming service is already localized
                const getServiceColor = (service: Service) => {
                  const isDarkMode = document.documentElement.classList.contains('dark');
                  if (service.color === '1A1924' && isDarkMode) {
                    return '#efefefbb';
                  } else if (service.color === '623CEA' && isDarkMode) {
                    return '#8B5FF7';
                  }
                  return service.color_hex;
                };
                const serviceColor = getServiceColor(service);
                return (
                  <Card 
                    key={service.id} 
                    className={`bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl cursor-pointer opacity-100`}
                    onClick={() => handleServiceClick(service)}
                    style={{
                      '--hover-border-color': serviceColor,
                      '--hover-shadow-color': `${serviceColor}10`
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = serviceColor;
                      e.currentTarget.style.boxShadow = `0 25px 50px -12px ${serviceColor}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <CardHeader>
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${serviceColor}10` }}
                      >
                        <div style={{ color: serviceColor }}>
                          {service.icon && renderIcon(service.icon, `h-8 w-8`)}
                        </div>
                      </div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">{localizedService.title}</CardTitle>
                      {localizedService.subtitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{localizedService.subtitle}</p>
                      )}
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {truncateText(localizedService.clean_description, 120)}
                      </CardDescription>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col">
                          {service.price ? (
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">€{Math.round(Number(service.price))}</span>
                          ) : (
                            <span className="text-sm text-gray-600 dark:text-gray-400 italic">{t("services.contactForQuote")}</span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleServiceClick(service);
                          }}
                          className="transition-colors border-gray-300 text-gray-600 hover:text-white"
                          style={{
                            borderColor: serviceColor,
                            color: serviceColor
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = serviceColor;
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = serviceColor;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.color = serviceColor;
                            e.currentTarget.style.borderColor = serviceColor;
                          }}
                        >
                          {t("services.viewDetails")}
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          ) : (
            // Fallback to static services if no dynamic services are available
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card 
                className="scroll-animate slide-in-left bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#22A60D] transition-all duration-300 hover:shadow-xl hover:shadow-[#22A60D]/10 cursor-pointer"
                onClick={() => handleServiceContact()}
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-[#22A60D]/10 rounded-2xl flex items-center justify-center mb-4">
                    <Bot className="h-8 w-8 text-[#22A60D]" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{t("services.chatbots.title")}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {t("services.chatbots.description")}
                  </CardDescription>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400 italic">{t("services.contactForQuote")}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceContact();
                      }}
                      className="text-[#22A60D] border-[#22A60D] hover:bg-[#22A60D] hover:text-white hover:border-[#22A60D] transition-colors"
                    >
                      {t("services.contactNow")}
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <Card 
                className="scroll-animate fade-in-up bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#46B1C9] transition-all duration-300 hover:shadow-xl hover:shadow-[#46B1C9]/10 cursor-pointer"
                onClick={() => handleServiceContact()}
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-[#46B1C9]/10 rounded-2xl flex items-center justify-center mb-4">
                    <Workflow className="h-8 w-8 text-[#46B1C9]" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{t("services.workflows.title")}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {t("services.workflows.description")}
                  </CardDescription>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400 italic">{t("services.contactForQuote")}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceContact();
                      }}
                      className="text-[#46B1C9] border-[#46B1C9] hover:bg-[#46B1C9] hover:text-white hover:border-[#46B1C9] transition-colors"
                    >
                      {t("services.contactNow")}
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <Card 
                className="scroll-animate slide-in-right bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#E4572E] transition-all duration-300 hover:shadow-xl hover:shadow-[#E4572E]/10 cursor-pointer"
                onClick={() => handleServiceContact()}
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-[#E4572E]/10 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="h-8 w-8 text-[#E4572E]" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{t("services.whatsapp.title")}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {t("services.whatsapp.description")}
                  </CardDescription>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400 italic">{t("services.contactForQuote")}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceContact();
                      }}
                      className="text-[#E4572E] border-[#E4572E] hover:bg-[#E4572E] hover:text-white hover:border-[#E4572E] transition-colors"
                    >
                      {t("services.contactNow")}
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <Card 
                className="scroll-animate slide-in-left bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#623CEA] transition-all duration-300 hover:shadow-xl hover:shadow-[#623CEA]/10 cursor-pointer"
                onClick={() => handleServiceContact()}
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-[#623CEA]/10 rounded-2xl flex items-center justify-center mb-4">
                    <Accessibility className="h-8 w-8 text-[#623CEA]" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{t("services.accessibility.title")}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {t("services.accessibility.description")}
                  </CardDescription>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400 italic">{t("services.contactForQuote")}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceContact();
                      }}
                      className="text-[#623CEA] border-[#623CEA] hover:bg-[#623CEA] hover:text-white hover:border-[#623CEA] transition-colors"
                    >
                      {t("services.contactNow")}
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <Card 
                className="scroll-animate fade-in-up bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#22A60D] transition-all duration-300 hover:shadow-xl hover:shadow-[#22A60D]/10 cursor-pointer"
                onClick={() => handleServiceContact()}
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-[#22A60D]/10 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-[#22A60D]" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{t("services.consulting.title")}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {t("services.consulting.description")}
                  </CardDescription>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400 italic">{t("services.contactForQuote")}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceContact();
                      }}
                      className="text-[#22A60D] border-[#22A60D] hover:bg-[#22A60D] hover:text-white hover:border-[#22A60D] transition-colors"
                    >
                      {t("services.contactNow")}
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <Card 
                className="scroll-animate slide-in-right bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#46B1C9] transition-all duration-300 hover:shadow-xl hover:shadow-[#46B1C9]/10 cursor-pointer"
                onClick={() => handleServiceContact()}
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-[#46B1C9]/10 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="h-8 w-8 text-[#46B1C9]" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{t("services.optimization.title")}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {t("services.optimization.description")}
                  </CardDescription>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400 italic">{t("services.contactForQuote")}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceContact();
                      }}
                      className="text-[#46B1C9] border-[#46B1C9] hover:bg-[#46B1C9] hover:text-white hover:border-[#46B1C9] transition-colors"
                    >
                      {t("services.contactNow")}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}
          
          {/* View All Services Button */}
          <div className="text-center mt-12 scroll-animate fade-in-up">
            <Link href="/services">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-2 border-[#22A60D] text-[#22A60D] hover:bg-[#22A60D] hover:text-white transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:shadow-[#22A60D]/20"
              >
                {t("services.viewAllServices")}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 10 10"
                  height="16"
                  width="16"
                  fill="none"
                  className="ml-2 stroke-current stroke-2"
                >
                  <path
                    d="M0 5h7"
                    className="transition opacity-0 group-hover:opacity-100"
                  />
                  <path
                    d="M1 1l4 4-4 4"
                    className="transition group-hover:translate-x-[3px]"
                  />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
        
      </section>

      {/* Partners Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#22A60D] text-black">
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
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-animate slide-in-left">
              <Image
                src="/static/hand_shake_transparent.webp"
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
              <h2 className="text-2xl md:text-4xl font-bold mb-8 text-[#22A60D]">
                {t("about.title")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {t("about.description1")}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {t("about.description2")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section id="technologies" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 scroll-animate fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#E4572E]">{t("technologies.title")}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t("technologies.description")}
            </p>
          </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-[#22A60D]/10 rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/odoo_logo.webp"
              alt="Odoo"
              width={80}
              height={40}
              className="h-14 w-auto mb-2 dark:invert"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA=" />
              <div className="text-lg font-semibold text-[#22A60D] mb-1">{t("technologies.odoo.title")}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{t("technologies.odoo.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#46B1C9]/10 rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/whatsapp_logo.webp" 
              alt="WhatsApp Business" 
              width={80}
              height={40}
              className="mb-2 dark:invert"
              style={{ height: '2.5rem', width: 'auto' }}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA=" />
              <div className="text-lg font-semibold text-[#46B1C9] mb-1">{t("technologies.whatsapp.title")}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{t("technologies.whatsapp.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#623CEA]/10 rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/chatgpt_logo.webp"
              alt="ChatGPT"
              width={80}
              height={40}
              className="mb-2 dark:invert"
              style={{ height: '2.5rem', width: 'auto' }}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA=" />
              <div className="text-lg font-semibold text-[#623CEA] mb-1">{t("technologies.chatgpt.title")}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{t("technologies.chatgpt.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#00BFAE]/10 rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/gemini_logo.webp"
              alt="Gemini"
              width={80}
              height={40}
              className="mb-2"
              style={{ height: '2.5rem', width: 'auto' }}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA=" />
              <div className="text-lg font-semibold text-[#00BFAE] mb-1">{t("technologies.gemini.title")}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{t("technologies.gemini.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#4285F4]/10 rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/looker_studio_logo.webp"
              alt="Looker Studio"
              width={80}
              height={40}
              className="mb-2"
              style={{ height: '2.5rem', width: 'auto' }}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA=" />
              <div className="text-lg font-semibold text-[#4285F4] mb-1">{t("technologies.looker.title")}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{t("technologies.looker.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#4285F4]/10 rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/meta_logo.webp"
              width={80}
              height={40}
              alt="Meta"
              className="mb-2"
              style={{ height: '2.5rem', width: 'auto' }}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA=" />
              <div className="text-lg font-semibold text-[#4285F4] mb-1">{t("technologies.meta.title")}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{t("technologies.meta.description")}</div>
            </div>
            </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 px-4 sm:px-6 lg:px-8">
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
      </section>

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
      <ServiceDetailsModal
        service={selectedService}
        isOpen={isServiceModalOpen}
        onClose={closeServiceModal}
        onContact={handleServiceContact}
      />
    </div>
  );
}
