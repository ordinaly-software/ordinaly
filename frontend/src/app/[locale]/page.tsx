"use client";

import { Bot, Workflow, Zap, Users, TrendingUp, ChevronUp, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import StyledButton from "@/components/ui/styled-button";
import ColourfulText from "@/components/ui/colourful-text";
import { Cover } from "@/components/ui/cover";
import Footer from "@/components/home/footer";
import DemoModal from "@/components/home/demo-modal";
import { useTranslations } from "next-intl";
import Image from 'next/image';
import PricingPlans from "@/components/home/pricing-plans";
import Navbar from "@/components/ui/navbar";

export default function HomePage() {
  const t = useTranslations("home");
  const [isDark, setIsDark] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    const animateElements = document.querySelectorAll(".scroll-animate");
    animateElements.forEach((el) => observer.observe(el));

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 1000);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      {/* Navigation - now using the Navbar component */}
      <Navbar isDark={isDark} setIsDark={setIsDark} />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-[#32E875]/10 dark:via-[#46B1C9]/10 dark:to-[#623CEA]/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-animate slide-in-left">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#32E875] via-[#46B1C9] to-[#623CEA] bg-clip-text text-transparent">
                <ColourfulText text={t("hero.title")} />
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
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/static/girl_resting_transparent.webp"
                  alt="AI Automation Dashboard"
                  width={600}
                  height={500}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#32E875]/20 via-transparent to-[#623CEA]/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#32E875]">{t("services.title")}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t("services.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="scroll-animate slide-in-left bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#32E875] transition-all duration-300 hover:shadow-xl hover:shadow-[#32E875]/10">
              <CardHeader>
                <div className="w-16 h-16 bg-[#32E875]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Bot className="h-8 w-8 text-[#32E875]" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">{t("services.chatbots.title")}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {t("services.chatbots.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="scroll-animate fade-in-up bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#46B1C9] transition-all duration-300 hover:shadow-xl hover:shadow-[#46B1C9]/10">
              <CardHeader>
                <div className="w-16 h-16 bg-[#46B1C9]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Workflow className="h-8 w-8 text-[#46B1C9]" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">{t("services.workflows.title")}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {t("services.workflows.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="scroll-animate slide-in-right bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#E4572E] transition-all duration-300 hover:shadow-xl hover:shadow-[#E4572E]/10">
              <CardHeader>
                <div className="w-16 h-16 bg-[#E4572E]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-[#E4572E]" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">{t("services.whatsapp.title")}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {t("services.whatsapp.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="scroll-animate slide-in-left bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#623CEA] transition-all duration-300 hover:shadow-xl hover:shadow-[#623CEA]/10">
              <CardHeader>
                <div className="w-16 h-16 bg-[#623CEA]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Accessibility className="h-8 w-8 text-[#623CEA]" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">{t("services.accessibility.title")}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {t("services.accessibility.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="scroll-animate fade-in-up bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#32E875] transition-all duration-300 hover:shadow-xl hover:shadow-[#32E875]/10">
              <CardHeader>
                <div className="w-16 h-16 bg-[#32E875]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-[#32E875]" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">{t("services.consulting.title")}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {t("services.consulting.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="scroll-animate slide-in-right bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#46B1C9] transition-all duration-300 hover:shadow-xl hover:shadow-[#46B1C9]/10">
              <CardHeader>
                <div className="w-16 h-16 bg-[#46B1C9]/10 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-[#46B1C9]" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">{t("services.optimization.title")}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {t("services.optimization.description")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
        
      </section>

       {/* Partners Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#32E875] text-black">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">{t("partners.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center justify-items-center">
            {[
              { src: "/static/logos/logo_aviva_publicidad.webp", alt: "Partner 1", delay: "0.1s" },
              { src: "/static/logos/logo_grupo_addu.webp", alt: "Partner 2", delay: "0.2s" },
              { src: "/static/logos/logo_proinca_consultores.webp", alt: "Partner 3", delay: "0.3s" },
            ].map(({ src, alt, delay }, i) => (
              <div
                key={i}
                className="scroll-animate fade-in-up w-full flex justify-center"
                style={{ animationDelay: delay }}
              >
                <Image
                  src={src}
                  alt={alt}
                  width={300}
                  height={200}
                  className="h-24 w-auto object-contain filter dark:invert dark:brightness-0 dark:contrast-100"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

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
              />
            </div>
            <div className="scroll-animate slide-in-right">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-[#32E875]">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#E4572E]">{t("technologies.title")}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t("technologies.description")}
            </p>
          </div>
            <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-6 bg-[#32E875]/10 rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/odoo_logo.webp"
              alt="Odoo"
              width={50}
              height={100}
              className="h-14 mb-2 dark:invert" />
              <div className="text-lg font-semibold text-[#32E875] mb-1">{t("technologies.odoo.title")}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{t("technologies.odoo.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#46B1C9]/10 rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/whatsapp_logo.webp" 
              alt="WhatsApp Business" 
              width={50}
              height={100}
              className="h-10 mb-2 dark:invert" />
              <div className="text-lg font-semibold text-[#46B1C9] mb-1">{t("technologies.whatsapp.title")}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{t("technologies.whatsapp.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#623CEA]/10 rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/chatgpt_logo.webp"
              alt="ChatGPT"
              width={50}
              height={100}
              className="h-10 mb-2 dark:invert" />
              <div className="text-lg font-semibold text-[#623CEA] mb-1">{t("technologies.chatgpt.title")}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{t("technologies.chatgpt.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#00BFAE]/10 rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/gemini_logo.webp"
              alt="Gemini"
              width={50}
              height={100}
              className="h-10 mb-2" />
              <div className="text-lg font-semibold text-[#00BFAE] mb-1">{t("technologies.gemini.title")}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{t("technologies.gemini.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#4285F4]/10 rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/looker_studio_logo.webp"
              alt="Looker Studio"
              width={50}
              height={100}
              className="h-10 mb-2" />
              <div className="text-lg font-semibold text-[#4285F4] mb-1">{t("technologies.looker.title")}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{t("technologies.looker.description")}</div>
            </div>
            <div className="text-center p-6 bg-[#4285F4]/10 rounded-2xl flex flex-col items-center">
              <Image src="/static/tools/meta_logo.webp"
              width={50}
              height={100}
              alt="Meta"
              className="h-10 mb-2" />
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
            <PricingPlans />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="contact"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#32E875] via-[#46B1C9] to-[#623CEA] text-white"
      >
        <div className="max-w-4xl mx-auto text-center scroll-animate fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            {t("cta.title1")}
            <Cover>{t("cta.title2")}</Cover>
            {t("cta.title3")}
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <StyledButton 
                  text={t("cta.button")} 
                  href="https://wa.me/34626270806?text=Hola%2C+me+gustar%C3%ADa+saber+m%C3%A1s+sobre+los+servicios+de+Ordinaly"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-8 z-50 w-11 h-11 rounded-full bg-[#32E875] hover:bg-[#2BC765] text-black shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-5"
          size="icon"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
