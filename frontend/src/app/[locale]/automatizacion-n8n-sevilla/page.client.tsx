"use client";

import { useMessages } from "next-intl";
import Footer from "@/components/ui/footer";
import ContactForm from "@/components/ui/contact-form.client";
import N8nFlow from "@/components/ui/N8nFlow";
import RelojArenaMagico from "@/components/ui/relojArena";

export default function AutomatizacionesN8NnSevillaPage() {
  const messages = useMessages() as any;
  const content = messages.landings?.["automatizacion-n8n-sevilla"];

  if (!content) throw new Error("Missing content: automatizacion-n8n-sevilla");

  return (
    <div className="relative bg-white dark:bg-neutral-900">

      {/* HERO */}
      <section className="w-full py-32 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {content.title}
            </h1>

            <p className="mt-6 text-lg text-neutral-300 max-w-xl">
              {content.subtitle}
            </p>

            <div className="mt-10 flex gap-4">
              <a
                href="#formulario"
                className="px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition hover:scale-105"
                style={{ backgroundColor: "#d97757" }}
              >
                {content.heroCtaLabel}
              </a>

              <a
                href={content.secondaryCtaHref}
                className="px-8 py-4 rounded-xl font-semibold border border-neutral-500 text-neutral-300 hover:text-white hover:border-white transition hover:scale-105"
              >
                {content.secondaryCtaLabel}
              </a>
            </div>
          </div>

          {/* Reloj*/}
          <div className="flex justify-center md:justify-end max-w-sm mx-auto md:mx-0">
            <RelojArenaMagico />
          </div>


        </div>
      </section>

      <section className="py-24 px-6 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_1.2fr] gap-16 items-center">

          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 dark:text-white">
              {content.sectionTitles?.whatIsN8N}
            </h2>

            <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {content.whatIsN8N}
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <img
              src="/static/automatizacion-n8n-sevilla/n8n-integration.webp"
              alt="Ejemplo de flujo n8n"
              className="w-full max-w-[760px] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700"
            />
          </div>

        </div>
      </section>
      <section className="py-24 px-6 bg-neutral-100 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 dark:text-white">
          {content.sectionTitles?.whatWeAutomate}
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">

          {content.whatWeAutomate.map((item: any, i: number) => (
            <div
              key={i}
              className="
                group p-8 rounded-2xl bg-white dark:bg-neutral-900 
                border border-neutral-200 dark:border-neutral-700 
                shadow-sm transition-all duration-300 
                hover:-translate-y-2 hover:shadow-2xl
                relative overflow-hidden
              "
            >
              {/* Glow n8n */}
              <div
                className="
                  absolute inset-0 opacity-0 group-hover:opacity-20 
                  bg-gradient-to-br from-[#ff6d5a] to-transparent 
                  transition-opacity duration-500 pointer-events-none
                "
              />

              <h3 className="text-xl font-semibold mb-3 dark:text-white">
                {item.title}
              </h3>

              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}

        </div>
      </section>

      <section className="py-24 px-6 bg-white dark:bg-neutral-900">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 dark:text-white">
          {content.sectionTitles?.integrations}
        </h2>
        <div className="max-w-6xl mx-auto">
          <N8nFlow />
        </div>
      </section>
      <section className="py-24 max-w-5xl mx-auto px-6 bg-neutral-50 dark:bg-neutral-800">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900 dark:text-white">
          {content.sectionTitles?.faq}
        </h2>

        <div className="space-y-8">
          {content.faq.map((faq: any, i: number) => (
            <div
              key={i}
              className="
                p-6 rounded-xl bg-white dark:bg-neutral-900 
                border border-neutral-300 dark:border-neutral-700
                shadow-sm hover:shadow-xl transition
              "
            >
              <h3 className="text-xl font-bold dark:text-white">{faq.question}</h3>
              <p className="text-neutral-700 dark:text-neutral-300 mt-3">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="#formulario"
            className="
              inline-flex items-center gap-2 px-6 py-3 rounded-full 
              border-2 border-clay text-clay font-semibold shadow-md 
              transition-all duration-300 hover:bg-clay hover:text-white 
              hover:shadow-lg hover:shadow-clay/20 group
            "
          >
            {content.sectionTitles?.ctaTitle}
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </a>
        </div>
      </section>

      {/* FORM */}
      <section id="formulario" className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-6">
          <ContactForm className="[&>section]:max-w-none [&>section]:bg-black [&>section]:px-0 [&>section]:py-0" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
