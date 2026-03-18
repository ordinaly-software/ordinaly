"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, BookOpen, BrainCircuit, Globe, Shield, Sparkles, TrendingUp } from "lucide-react";
import { LogoCarousel } from "@/components/ui/logo-carousel";
import ContactForm from "@/components/ui/contact-form.client";

const Footer = dynamic(() => import("@/components/ui/footer"), {
  ssr: false,
  loading: () => (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924] animate-pulse">
      <div className="max-w-7xl mx-auto h-10 bg-gray-200 dark:bg-gray-700 rounded" />
    </footer>
  ),
});

const InvestorsPage = () => {
  const t = useTranslations("investors");
  const t_home = useTranslations("home");

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

  const team = [
    {
      name: "Antonio Macías",
      role: t("team.antonio.role"),
      photo: "/static/team/antonio_hd.webp",
      linkedin: "https://www.linkedin.com/in/antoniommff/",
      tags: [
        t("team.antonio.tags.0"),
        t("team.antonio.tags.1"),
        t("team.antonio.tags.2"),
        t("team.antonio.tags.3"),
      ],
      bio: t("team.antonio.bio"),
      icon: BrainCircuit,
    },
    {
      name: "Guillermo Montero",
      role: t("team.guillermo.role"),
      photo: "/static/team/guillermo_hd.webp",
      linkedin: "https://www.linkedin.com/in/guillermomontero/",
      tags: [
        t("team.guillermo.tags.0"),
        t("team.guillermo.tags.1"),
        t("team.guillermo.tags.2"),
        t("team.guillermo.tags.3"),
      ],
      bio: t("team.guillermo.bio"),
      icon: Globe,
    },
  ];

  const courses = [
    {
      title: t("formation.courses.0.title"),
      description: t("formation.courses.0.description"),
      icon: BookOpen,
    },
    {
      title: t("formation.courses.1.title"),
      description: t("formation.courses.1.description"),
      icon: BrainCircuit,
    },
    {
      title: t("formation.courses.2.title"),
      description: t("formation.courses.2.description"),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="bg-[--color-bg-primary] dark:bg-[--color-bg-inverted] text-slate-dark dark:text-ivory-light min-h-screen transition-colors duration-300 mt-[-20px]">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-[--swatch--slate-dark]">
        <Image
          src="/static/backgrounds/us_background.webp"
          alt=""
          fill
          className="object-cover opacity-30 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-[--swatch--slate-dark]/75" />
        <div className="relative max-w-7xl mx-auto px-4 pb-28 pt-20 sm:px-6 lg:px-8 md:pb-36 md:pt-28">
          <div className="max-w-4xl mx-auto text-center space-y-8 text-white">

            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              {t("hero.title")}
            </h1>

            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/80 font-light leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <a
                href="#cta"
                className="inline-flex items-center bg-clay hover:bg-clay/90 text-white px-8 py-4 text-base font-bold shadow-xl transition-all hover:scale-105 rounded-xl"
              >
                {t("hero.ctaPrimary")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="mailto:info@ordinaly.ai"
                className="inline-flex items-center border-2 border-white/40 text-white hover:bg-white/10 px-8 py-4 text-base font-semibold transition-all rounded-xl"
              >
                {t("hero.ctaSecondary")}
              </a>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path
              d="M0 80L60 73C120 67 240 53 360 47C480 40 600 40 720 43C840 47 960 53 1080 57C1200 60 1320 60 1380 60L1440 60V80H0Z"
              fill="currentColor"
              className="text-[--color-bg-primary] dark:text-[--color-bg-inverted]"
            />
          </svg>
        </div>
      </section>

      {/* Key Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative bg-white dark:bg-[--swatch--slate-medium] rounded-2xl p-8 shadow-xl border border-[--color-border-subtle] dark:border-[--color-border-strong] hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-clay to-cobalt rounded-l-2xl" />
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-slate-light dark:text-cloud-medium font-bold">
                  {stat.label}
                </p>
                <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-clay to-cobalt">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-medium dark:text-cloud-medium leading-relaxed">
                  {stat.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="u-container pb-12">
        <div className="rounded-[2rem] border border-[--color-border-subtle] bg-[--swatch--slate-dark] p-8 md:p-12 dark:border-white/10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-shrink-0 lg:max-w-xs text-white space-y-3">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">{t_home("partners.title")}</p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                {t_home("partners.subtitle")}
              </h2>
            </div>
            <div className="flex-1 flex justify-center overflow-hidden">
              <LogoCarousel logos={partnerLogos} columnCount={3} mobileColumnCount={2} />
            </div>
          </div>
        </div>
      </section>

      {/* Technical Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-clay font-semibold mb-3">
            {t("team.label")}
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-dark dark:text-ivory-light mb-4 tracking-tight">
            {t("team.title")}
          </h2>
          <p className="text-lg text-slate-medium dark:text-cloud-medium max-w-2xl mx-auto leading-relaxed">
            {t("team.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {team.map((member) => (
            <div
              key={member.name}
              className="group bg-white dark:bg-[--swatch--slate-medium] rounded-3xl p-8 border border-[--color-border-subtle] dark:border-[--color-border-strong] hover:border-clay/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-5 mb-6">
                <div className="relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden ring-2 ring-[--color-border-subtle] dark:ring-[--color-border-strong] group-hover:ring-clay/40 transition-all">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-slate-dark dark:text-ivory-light">{member.name}</h3>
                  <p className="text-sm text-clay font-medium mt-0.5">{member.role}</p>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-light dark:text-cloud-medium hover:text-cobalt transition-colors mt-1"
                  >
                    LinkedIn →
                  </a>
                </div>
              </div>

              <p className="text-sm text-slate-medium dark:text-cloud-medium leading-relaxed mb-5">
                {member.bio}
              </p>

              <div className="flex flex-wrap gap-2">
                {member.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full bg-[--swatch--ivory-medium] dark:bg-[--swatch--slate-dark] text-slate-medium dark:text-cloud-medium border border-[--color-border-subtle] dark:border-[--color-border-strong] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formation Courses */}
      <section className="bg-[--swatch--ivory-medium] dark:bg-[--swatch--slate-medium] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.18em] text-clay font-semibold mb-3">
              {t("formation.label")}
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-dark dark:text-ivory-light mb-4 tracking-tight">
              {t("formation.title")}
            </h2>
            <p className="text-lg text-slate-medium dark:text-cloud-medium max-w-2xl mx-auto leading-relaxed">
              {t("formation.subtitle")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.title}
                className="bg-white dark:bg-[--swatch--slate-dark] rounded-3xl p-8 border border-[--color-border-subtle] dark:border-[--color-border-strong] hover:border-clay/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-2xl bg-clay/10 dark:bg-clay/20 flex items-center justify-center mb-5">
                  <course.icon className="h-6 w-6 text-clay" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-dark dark:text-ivory-light mb-3">{course.title}</h3>
                <p className="text-sm text-slate-medium dark:text-cloud-medium leading-relaxed">{course.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-black text-slate-dark dark:text-ivory-light mb-4 tracking-tight">
            {t("highlights.title")}
          </h2>
          <p className="text-lg text-slate-medium dark:text-cloud-medium max-w-2xl mx-auto">
            {t("highlights.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="group bg-white dark:bg-[--swatch--slate-medium] rounded-3xl p-8 border border-[--color-border-subtle] dark:border-[--color-border-strong] hover:border-clay/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="h-14 w-14 rounded-2xl bg-cobalt/10 dark:bg-cobalt/20 flex items-center justify-center">
                  <item.icon className="h-7 w-7 text-cobalt" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-dark dark:text-ivory-light">
                  {item.title}
                </h3>
                <p className="text-slate-medium dark:text-cloud-medium leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="bg-[--swatch--ivory-medium] dark:bg-[--swatch--slate-medium] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-slate-dark dark:text-ivory-light mb-4 tracking-tight">
              {t("roadmap.title")}
            </h2>
            <p className="text-lg text-slate-medium dark:text-cloud-medium max-w-2xl mx-auto">
              {t("roadmap.subtitle")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-clay via-cobalt to-clay opacity-30" />

            {roadmap.map((item, index) => (
              <div
                key={item.title}
                className="relative bg-white dark:bg-[--swatch--slate-dark] rounded-3xl p-8 border border-[--color-border-subtle] dark:border-[--color-border-strong] hover:border-clay/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-clay to-cobalt text-white flex items-center justify-center text-xl font-black shadow-xl border-4 border-[--swatch--ivory-medium] dark:border-[--swatch--slate-medium]">
                    {`0${index + 1}`}
                  </div>
                </div>
                <div className="pt-10 space-y-4">
                  <h3 className="text-xl font-bold text-slate-dark dark:text-ivory-light text-center">
                    {item.title}
                  </h3>
                  <p className="text-slate-medium dark:text-cloud-medium leading-relaxed text-center text-sm">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Focus */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-[--swatch--slate-dark] rounded-3xl p-10 md:p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/static/backgrounds/us_background.webp')] bg-cover bg-center opacity-5" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-clay/20 border border-clay/30">
                <TrendingUp className="h-4 w-4 text-clay" />
                <span className="text-xs font-semibold uppercase tracking-wider text-clay">
                  {t("hero.focusLabel")}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                {t("hero.focusTitle")}
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                {t("hero.focusBody")}
              </p>
            </div>
            <div className="grid gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                  <p className="text-xs uppercase text-white/60 tracking-widest font-bold mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black text-clay mb-1">{stat.value}</p>
                  <p className="text-sm text-white/70">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="bg-[--swatch--slate-dark] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-8">
          <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
            {t("cta.title")}
          </h2>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {t("cta.body")}
          </p>
          <div className="pt-4">
            <a
              href="mailto:info@ordinaly.ai"
              className="inline-flex items-center bg-clay hover:bg-clay/90 text-white px-10 py-5 text-lg font-bold shadow-2xl transition-all hover:scale-105 rounded-xl"
            >
              {t("cta.button")}
              <ArrowRight className="ml-2 h-6 w-6" />
            </a>
          </div>
          <p className="text-sm text-white/50 pt-4">{t("hero.footnote")}</p>
        </div>
      </section>

      <ContactForm />

      <Footer />
    </div>
  );
};

export default InvestorsPage;
