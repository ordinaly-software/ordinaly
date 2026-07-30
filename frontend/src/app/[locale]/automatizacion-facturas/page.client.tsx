"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Mail, FolderOpen, ScanLine, FileSearch, Archive, ShieldCheck, Zap, Files, FolderTree } from "lucide-react";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import TimelineHorizontal from "@/components/ui/timeline-horizontal";
import { FolderReveal } from "@/components/ui/folder-reveal";
import { HoverEffectCards } from "@/components/ui/card-hover-effect";
import { SecurityRequirements } from "@/components/ui/security-requirements";
import ReCaptchaWrapper from "../recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

const FUNCIONES_ICONS = [
  <Mail key="mail" className="w-5 h-5" />,
  <FolderOpen key="folder" className="w-5 h-5" />,
  <ScanLine key="scan" className="w-5 h-5" />,
  <FileSearch key="search" className="w-5 h-5" />,
  <Archive key="archive" className="w-5 h-5" />,
];

const VENTAJAS_ICONS = [
  <ShieldCheck key="shield" className="w-5 h-5" />,
  <Zap key="zap" className="w-5 h-5" />,
  <Files key="files" className="w-5 h-5" />,
  <ScanLine key="scan" className="w-5 h-5" />,
  <FolderTree key="tree" className="w-5 h-5" />,
];

export default function AutomatizacionFacturas() {
  const messages = useMessages() as any;
  const content = messages.landings?.["automatizacion-facturas"];

  if (!content) {
    throw new Error("Missing landing content: automatizacion-facturas");
  }

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">

      {/* HERO */}
      <section className="relative w-full min-h-[36rem] flex items-center justify-center overflow-hidden bg-neutral-950 py-20">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/static/automatizacion-facturas/automatizacion-facturas.webp"
            alt=""
            fill
            priority
            className="object-cover object-center opacity-80"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-neutral-950/30" />

        <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-3xl mx-auto">
          <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-bold drop-shadow-xl leading-tight">
            {content.title}
          </h1>

          <p className="mt-6 text-neutral-200 max-w-2xl text-lg leading-relaxed">
            {content.heroText}
          </p>

          <a
            href="#formulario"
            className="mt-10 px-6 py-3 rounded-full bg-[#d97757] text-white font-semibold hover:bg-[#b45309] transition"
          >
            {content.heroCtaLabel}
          </a>
        </div>
      </section>

      {/* HOW WE DO IT */}
      <section className="py-20 md:py-24 bg-white dark:bg-neutral-900 transition-colors">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-neutral-900 dark:text-white">
            {content.sectionTitles?.howItWorks}
          </h2>
          <TimelineHorizontal steps={content.steps ?? []} />
        </div>
      </section>

      {/* FUNCIONES */}
      <section className="py-20 md:py-24 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-neutral-900 dark:text-white">
            {content.sectionTitles?.funciones}
          </h2>

          <FolderReveal
            badgeText={content.sectionTitles?.funciones}
            items={(content.funciones?.items ?? []).map((item: { title: string }, i: number) => ({
              title: item.title,
              icon: FUNCIONES_ICONS[i % FUNCIONES_ICONS.length],
            }))}
          />

          <div className="mt-14 max-w-3xl mx-auto space-y-4">
            {content.funciones?.paragraphs?.map((p: string, i: number) => (
              <p key={i} className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-center">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* VENTAJAS */}
      <section className="py-20 md:py-24 bg-white dark:bg-neutral-900 transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900 dark:text-white">
            {content.sectionTitles?.ventajas}
          </h2>

          <HoverEffectCards
            items={(content.ventajas ?? []).map((v: { title: string; description: string }, i: number) => ({
              title: v.title,
              description: v.description,
              icon: VENTAJAS_ICONS[i % VENTAJAS_ICONS.length],
            }))}
          />
        </div>
      </section>

      {/* SECURITY + REQUIREMENTS */}
      <SecurityRequirements
        trustTitle={content.sectionTitles?.security ?? "Tu negocio es nuestra prioridad"}
        trustPoints={content.security?.trustPoints ?? []}
        requirementsTitle={content.sectionTitles?.requirements}
        requirements={content.security?.requirements ?? []}
        pricing={content.pricing}
        accentClassName="text-[#d97706]"
      />

      {/* TECHNOLOGY FAQS */}
      {content.technologyFaqs?.length > 0 && (
        <FaqAccordion
          className="bg-white dark:bg-neutral-900 transition-colors"
          title={content.sectionTitles?.technologyFaqs}
          items={content.technologyFaqs.map((faq: { tag: string; question: string; answer: string }) => ({
            question: faq.question,
            answer: faq.answer,
            tag: faq.tag,
          }))}
        />
      )}

      {/* FORM */}
      <section id="formulario">
          <ReCaptchaWrapper badgeContainerId="recaptcha-badge-home-contact">
            <ContactForm />
          </ReCaptchaWrapper>
      </section>

      <a
        href="https://wa.me/34626270806"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 text-white font-semibold px-6 py-3 rounded-full shadow-xl transition"
        style={{ backgroundColor: "#d97757" }}
      >
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.52 3.48A11.8 11.8 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.64a12 12 0 0 0 5.74 1.46h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.47-8.4ZM12.05 21.3h-.01a9.3 9.3 0 0 1-4.74-1.3l-.34-.2-3.74.97 1-3.64-.22-.37a9.28 9.28 0 0 1-1.42-4.9c0-5.14 4.18-9.32 9.33-9.32 2.49 0 4.83.97 6.6 2.73a9.27 9.27 0 0 1 2.73 6.6c0 5.15-4.18 9.33-9.33 9.33Zm5.13-6.96c-.28-.14-1.65-.81-1.9-.9-.26-.1-.45-.14-.64.14-.19.28-.74.9-.9 1.08-.17.19-.33.21-.61.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.34 0 1.38 1 2.72 1.14 2.9.14.19 1.96 3 4.75 4.2.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.12-.26-.19-.54-.33Z" />
        </svg>
        <span>{content.secondaryCtaLabel}</span>
      </a>

      <WhatsAppBubble />
      <Footer />
    </div>
  );
}
