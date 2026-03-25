"use client";

import React from "react";
import dynamic from "next/dynamic";

const SparklesPreview = dynamic(
  () => import("@/components/sparkles-demo"),
  { ssr: false }
);

import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";

export interface LandingPageContent {
  title: string;
  subtitle: string;
  description: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  steps: string[];
  benefits: string[];
  before: string[];
  after: string[];
}

export default function AutomatizacionFacturasView({
  content,
}: {
  content: LandingPageContent;
}) {
  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">

      {/* HERO */}
      <section className="relative w-full h-[40rem] flex items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-900 to-black">
        <div className="relative z-20 flex flex-col items-center text-center px-4">
          <h1 className="text-white text-5xl md:text-7xl font-bold drop-shadow-xl">
            {content.title}
          </h1>

          <p className="text-neutral-300 mt-4 max-w-2xl">
            {content.subtitle}
          </p>

          <p className="text-neutral-400 mt-4 max-w-xl">
            {content.description}
          </p>

          <a
            href="#formulario"
            className="mt-10 px-6 py-3 rounded-full bg-[#d97757] text-white font-semibold hover:bg-[#b45309] transition"
          >
            {content.heroCtaLabel}
          </a>
        </div>
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="papers-group">
            <div className="paper-svg">
              <svg width="90" height="120" viewBox="0 0 90 120" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="78" height="108" rx="10" fill="white" stroke="#d4d4d4" strokeWidth="4" />
                <path d="M60 6 L84 30 L60 30 Z" fill="#f3f3f3" />
                <text x="45" y="70" fontSize="24" fontWeight="bold" fill="#dc2626" opacity="0.9"
                  transform="rotate(-18 45 70)" textAnchor="middle">
                  FACTURA
                </text>
              </svg>
            </div>
            <div className="paper-svg">
              <svg width="90" height="120" viewBox="0 0 90 120" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="78" height="108" rx="10" fill="white" stroke="#d4d4d4" strokeWidth="4" />
                <path d="M60 6 L84 30 L60 30 Z" fill="#f3f3f3" />
                <text x="45" y="70" fontSize="24" fontWeight="bold" fill="#dc2626" opacity="0.9"
                  transform="rotate(-18 45 70)" textAnchor="middle">
                  FACTURA
                </text>
              </svg>
            </div>
            <div className="paper-svg">
              <svg width="90" height="120" viewBox="0 0 90 120" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="78" height="108" rx="10" fill="white" stroke="#d4d4d4" strokeWidth="4" />
                <path d="M60 6 L84 30 L60 30 Z" fill="#f3f3f3" />
                <text x="45" y="70" fontSize="24" fontWeight="bold" fill="#dc2626" opacity="0.9"
                  transform="rotate(-18 45 70)" textAnchor="middle">
                  FACTURA
                </text>
              </svg>
            </div>

          </div>
          <div className="pipeline"></div>

          <div className="folder-output">
            <div className="folder-svg">
              <svg width="140" height="100" viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="30" width="120" height="60" rx="10" fill="#fbbf24" stroke="#d97706" strokeWidth="4" />
                <rect x="30" y="10" width="80" height="30" rx="8" fill="#fde68a" stroke="#d97706" strokeWidth="3" />

                <rect x="40" y="20" width="60" height="40" rx="4" fill="white" stroke="#d4d4d4" strokeWidth="2" />
                <rect x="45" y="25" width="50" height="30" rx="3" fill="white" stroke="#e5e5e5" strokeWidth="1.5" />
                <rect x="50" y="30" width="40" height="20" rx="2" fill="white" stroke="#e5e5e5" strokeWidth="1" />
              </svg>
            </div>
          </div>

        </div>

      </section>
      <section className="py-24 bg-white dark:bg-neutral-900 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900 dark:text-white">
          Así funciona la automatización
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto px-6 text-center">
          {content.steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center mx-auto">

              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#d97706]/10 dark:bg-[#d97706]/20 mb-4">
                {i === 0 && (
                  <svg className="w-7 h-7 text-[#d97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
                  </svg>
                )}

                {i === 1 && (
                  <svg className="w-7 h-7 text-[#d97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317a1 1 0 011.35-.936l1.618.54a1 1 0 00.95-.174l1.2-.9a1 1 0 011.45.28l.9 1.2a1 1 0 00.174.95l.54 1.618a1 1 0 01-.936 1.35l-1.618.54a1 1 0 00-.95.174l-1.2.9a1 1 0 01-1.45-.28l-.9-1.2a1 1 0 00-.174-.95l-.54-1.618z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}

                {i === 2 && (
                  <svg className="w-7 h-7 text-[#d97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                )}
              </div>

              <h3 className="font-semibold mt-2 text-neutral-900 dark:text-neutral-200">
                {step}
              </h3>
            </div>
          ))}
        </div>
      </section>
      <section className="py-24 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900 dark:text-white">
          Beneficios de automatizar tus facturas
        </h2>

        <div className="grid md:grid-cols-4 gap-10 max-w-6xl mx-auto px-6">
          {content.benefits.map((benefit, i) => (
            <div
              key={i}
              className="
                p-6 rounded-lg shadow border border-neutral-200 dark:border-neutral-700
                bg-white dark:bg-neutral-900
                hover:border-[#d97706] hover:shadow-lg hover:-translate-y-1
                transition-all duration-300 cursor-pointer
              "
            >
              <div className="w-10 h-10 rounded-full bg-[#d97706]/10 dark:bg-[#d97706]/20 flex items-center justify-center mb-4">
                <span className="text-[#d97706] text-xl">★</span>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                {benefit}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="py-24 bg-white dark:bg-neutral-900 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900 dark:text-white">
          Antes y después de automatizar
        </h2>

        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto px-6">

          <div className="bg-neutral-50 dark:bg-neutral-800 p-8 rounded-lg shadow hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-200">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              Antes
            </h3>

            <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
              {content.before.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800 p-8 rounded-lg shadow hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-200">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Después
            </h3>

            <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
              {content.after.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/*FORM */}
      <section id="formulario" className="max-w-4xl mx-auto px-6 py-20">
        <div className="overflow-hidden">
          <ContactForm className="[&>section]:max-w-none [&>section]:px-0 [&>section]:py-0" />
        </div>
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
        <span>Quiero automatizar mis facturas</span>
      </a>

      <Footer />
    </div>
  );
}
