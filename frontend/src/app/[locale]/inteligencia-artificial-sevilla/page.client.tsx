"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import Footer from "@/components/ui/footer";
import ReCaptchaWrapper from "../recaptcha-provider";

const GlobeSevilla = dynamic(() => import("@/components/3d-globe-demo").then(m => m.GlobeSevilla), {
  ssr: false,
  loading: () => <div className="w-[300px] h-[300px] bg-black/10 rounded-xl" />,
});

const Card3D = dynamic(() => import("@/components/ui/card-3d").then(m => m.Card3D), {
  ssr: false,
});

const ContactForm = dynamic(() => import("@/components/ui/contact-form.client"), {
  ssr: false,
});

export default function InteligenciaArtificialSevilla() {
  const messages = useMessages() as any;
  const content = messages.landings?.["inteligencia-artificial-sevilla"];

  if (!content) {
    throw new Error("Missing landing content: inteligencia-artificial-sevilla");
  }


  const cardImages = [
    "/static/inteligencia-artificial-sevilla/Alcance_Servicio.webp",
    "/static/inteligencia-artificial-sevilla/Cobertura.webp",
    "/static/inteligencia-artificial-sevilla/Modelo_Entrega.webp",
    "/static/inteligencia-artificial-sevilla/Automatización.webp",
    "/static/inteligencia-artificial-sevilla/AsistenteIA.webp",
    "/static/inteligencia-artificial-sevilla/Cobertura.webp",
  ];

  return (
    <div className="relative z-20 isolate">

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {content.title}
          </h1>

          <p className="text-xl text-slate-700 dark:text-neutral-300 mb-4">
            {content.subtitle}
          </p>

          <p className="text-slate-600 dark:text-neutral-400 mb-8 max-w-lg">
            {content.description}
          </p>

          <a
            href={content.heroCtaHref}
            className="inline-block bg-[#D97757] hover:bg-[#C6613F] text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            {content.heroCtaLabel}
          </a>
        </div>

        <div className="flex justify-center">
          <GlobeSevilla />
        </div>
      </section>

      {/* CARDS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-16 text-center">
          {content.cardsSectionTitle}
        </h2>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-12">
          {content.cards?.map((card: any, i: number) => (
            <div key={i} className="relative w-96 h-80 flex items-center justify-center">
              <Card3D
                title={card.title}
                description={card.description}
                image={cardImages[i]}
              />
            </div>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10">
          {content.servicesSectionTitle}
        </h2>

        <ol className="space-y-6">
          {content.steps?.map((step: string, i: number) => (
            <li key={i} className="flex gap-4">
              <span className="text-orange-500 font-bold text-2xl">{i + 1}</span>
              <p className="text-slate-700 dark:text-neutral-300">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FORM */}
      <section id="formulario">
        <div className="max-w-5xl mx-auto px-6 pt-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            {content.formSectionTitle}
          </h2>
        </div>
        <ReCaptchaWrapper>
          <ContactForm/>
        </ReCaptchaWrapper>
      </section>

      {/* WHATSAPP BUTTON */}
      <a
        href="https://wa.me/34626270806"
        target="_blank"
        rel="noopener noreferrer"
        className="
          fixed
          bottom-6
          left-1/2
          -translate-x-1/2
          z-50
          flex
          items-center
          gap-3
          text-white
          font-semibold
          px-6
          py-3
          rounded-full
          shadow-xl
          transition
        "
        style={{ backgroundColor: "#d97757" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-5 h-5"
        >
          <path d="M20.52 3.48A11.8 11.8 0 0 0 12 0C5.37 0 0 5.37 0 12a11.9 11.9 0 0 0 1.64 6L0 24l6.26-1.64A11.9 11.9 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.9 9.9 0 0 1-5.06-1.39l-.36-.21-3.72.98 1-3.63-.24-.37A9.9 9.9 0 0 1 2 12c0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93A9.9 9.9 0 0 1 22 12c0 5.52-4.48 10-10 10zm5.13-7.47c-.28-.14-1.65-.82-1.9-.91-.25-.1-.43-.14-.62.14-.18.28-.71.91-.87 1.1-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.32.43-.48.14-.16.18-.28.28-.46.1-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.06-.22-.53-.45-.46-.62-.46h-.53c-.18 0-.48.07-.73.34-.25.28-.96.94-.96 2.28 0 1.34.98 2.63 1.12 2.81.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.55.58.65.2 1.24.17 1.7.1.52-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.2-.53-.34z" />
        </svg>

        <span>{content.contactUs}</span>
      </a>

      <Footer />
    </div>
  );
}
