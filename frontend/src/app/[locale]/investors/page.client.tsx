"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ArrowRight, Globe, Shield, Sparkles, TrendingUp } from "lucide-react";
import { PartnersSection } from "@/components/home/partners-section";

const Footer = dynamic(() => import("@/components/ui/footer"), {
  ssr: false,
  loading: () => (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924] animate-pulse">
      <div className="max-w-7xl mx-auto h-10 bg-gray-200 dark:bg-gray-700 rounded" />
    </footer>
  ),
});

const InvestorsPage = () => {
  // Mock translation function
  const t = useTranslations("investors");
  const tHome = useTranslations("home");

  const stats = [
    {
      label: t("stats.market.label"),
      value: t("stats.market.value"),
      detail: t("stats.market.detail"),
    },
    {
      label: t("stats.clients.label"),
      value: t("stats.clients.value"),
      detail: t("stats.clients.detail"),
    },
    {
      label: t("stats.efficiency.label"),
      value: t("stats.efficiency.value"),
      detail: t("stats.efficiency.detail"),
    },
  ];

  const highlights = [
    {
      icon: Globe,
      title: t("highlights.global.title"),
      description: t("highlights.global.body"),
    },
    {
      icon: Sparkles,
      title: t("highlights.traction.title"),
      description: t("highlights.traction.body"),
    },
    {
      icon: Shield,
      title: t("highlights.governance.title"),
      description: t("highlights.governance.body"),
    },
  ];

  const roadmap = [
    {
      title: t("roadmap.1.title"),
      detail: t("roadmap.1.body"),
    },
    {
      title: t("roadmap.2.title"),
      detail: t("roadmap.2.body"),
    },
    {
      title: t("roadmap.3.title"),
      detail: t("roadmap.3.body"),
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0a0f1a] text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
      {/* Hero Section - More spacious and clean */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#0a2818] via-[#0d3d20] to-[#1F8A0D]">
        <div className="absolute inset-0 bg-[url('/static/backgrounds/us_background.webp')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {t("hero.tagline")}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              {t("hero.title")}
            </h1>
            
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90 font-light leading-relaxed">
              {t("hero.subtitle")}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <a 
                href="#cta"
                className="inline-flex items-center bg-white text-[#0d3d20] hover:bg-gray-100 px-8 py-6 text-base font-bold shadow-2xl hover:shadow-xl transition-all hover:scale-105 rounded-lg"
              >
                {t("hero.ctaPrimary")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="mailto:info@ordinaly.ai"
                className="inline-flex items-center border-2 border-white text-white hover:bg-white hover:text-[#0d3d20] px-8 py-6 text-base font-bold transition-all rounded-lg"
              >
                {t("hero.ctaSecondary")}
              </a>
            </div>
          </div>
        </div>
        
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-white dark:text-[#0a0f1a]"/>
          </svg>
        </div>
      </section>

      {/* Key Stats Highlight - Cleaner cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="group relative bg-white dark:bg-[#0f1621] rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#1F8A0D] to-[#0d3d20] rounded-l-2xl" />
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">
                  {stat.label}
                </p>
                <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1F8A0D] to-[#0d6e0c]">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {stat.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PartnersSection t={tHome} />

      {/* Highlights - Icon-driven cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            {t("highlights.title")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("highlights.subtitle")}
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {highlights.map((item, idx) => (
            <div
              key={item.title}
              className="group relative bg-white dark:bg-[#0f1621] rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#1F8A0D] rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-[#1F8A0D] to-[#0d6e0c] text-white flex items-center justify-center shadow-lg">
                    <item.icon className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap - Timeline style */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0f1621] dark:to-[#0a0f1a] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              {t("roadmap.title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t("roadmap.subtitle")}
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Connection line for desktop */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1F8A0D] via-[#0d6e0c] to-[#1F8A0D] -z-0" />
            
            {roadmap.map((item, index) => (
              <div
                key={item.title}
                className="relative bg-white dark:bg-[#0f1621] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#1F8A0D] to-[#0d6e0c] text-white flex items-center justify-center text-xl font-black shadow-xl border-4 border-white dark:border-[#0a0f1a]">
                    {`0${index + 1}`}
                  </div>
                </div>
                <div className="pt-10 space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Highlight Section - New addition inspired by FisioFind */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-[#0a2818] to-[#0d3d20] rounded-3xl p-12 md:p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/static/backgrounds/us_background.webp')] bg-cover bg-center opacity-5" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {t("hero.focusLabel")}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black">
                {t("hero.focusTitle")}
              </h2>
              <p className="text-xl text-white/90 leading-relaxed">
                {t("hero.focusBody")}
              </p>
            </div>
            <div className="grid gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                  <p className="text-xs uppercase text-white/70 tracking-widest font-bold mb-2">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black mb-2">{stat.value}</p>
                  <p className="text-sm text-white/80">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - More compelling */}
      <section id="cta" className="bg-gradient-to-br from-[#0a2818] via-[#0d3d20] to-[#1F8A0D] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-8">
          <h2 className="text-4xl md:text-6xl font-black leading-tight">
            {t("cta.title")}
          </h2>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            {t("cta.body")}
          </p>
          <div className="pt-4">
            <a 
              href="mailto:info@ordinaly.ai"
              className="inline-flex items-center bg-white text-[#0d3d20] hover:bg-gray-100 px-10 py-7 text-lg font-bold shadow-2xl hover:shadow-xl transition-all hover:scale-105 rounded-lg"
            >
              {t("cta.button")}
              <ArrowRight className="ml-2 h-6 w-6" />
            </a>
          </div>
          <p className="text-sm text-white/60 pt-4">{t("hero.footnote")}</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InvestorsPage;