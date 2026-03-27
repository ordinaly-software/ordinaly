"use client";

import { useMessages } from "next-intl";
import Footer from "@/components/ui/footer";
import CardStackDemo from "@/components/card-stack-demo"
import ContactForm from "@/components/ui/contact-form.client";

export default function FormacionIaPymesSevillaPage() {
  const messages = useMessages() as any;

  const content = messages.landings?.["formacion-ia-pymes-sevilla"];



  if (!content) throw new Error("Missing content: formacion-ia-pymes-sevilla");

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">

      {/* HERO */}
      <section
        className="relative w-full min-h-[40rem] flex flex-col items-center justify-center text-center px-6 bg-cover bg-center"
        style={{
          backgroundImage: `url(${content.heroImage})`,
          backgroundPosition: content.heroImagePosition || "center"
        }}
      >

        <h1 className="text-white font-bold leading-[1.05] drop-shadow-xl max-w-3xl">
          <span className="block text-5xl md:text-7xl">{content.title}</span>
        </h1>
        <a
  href="#formulario"
  className="mt-10 px-6 py-3 rounded-full text-white font-semibold transition !bg-[#d97757]"
>
  {content.cta?.label}
</a>

      </section>
      <section className="py-24 max-w-5xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 
                 text-neutral-900 dark:text-white tracking-tight">
          ¿Por qué esta formación funciona?
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {content.valueProps.map((prop: string, i: number) => (
            <div
              key={i}
              className="
          group p-8 rounded-2xl 
          bg-white dark:bg-neutral-900 
          border border-neutral-200 dark:border-neutral-700 
          shadow-[0_4px_20px_rgba(0,0,0,0.06)] 
          dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]
          hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]
          dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.55)]
          transition-all duration-300 hover:-translate-y-1
        "
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-xl mb-6"
                style={{ backgroundColor: "#d97757" }}
              >
                <span className="text-white text-2xl font-bold">✓</span>
              </div>

              <p className="text-neutral-700 dark:text-neutral-300 
                      font-medium leading-relaxed text-lg">
                {prop}
              </p>
              <div
                className="
            mt-6 h-1 w-0 
            group-hover:w-full 
            transition-all duration-300 rounded-full
          "
                style={{ backgroundColor: "#d97757" }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-neutral-50 dark:bg-neutral-900 transition-colors">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 
                 text-neutral-900 dark:text-white tracking-tight">
          Formato de la formación
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">

          {content.metrics.map((metric: any, i: number) => (
            <div key={i} className="relative group">
              <div
                className={`
            relative p-8 shadow-xl rounded-2xl overflow-hidden
            bg-white dark:bg-neutral-800 
            border border-neutral-200 dark:border-neutral-700 
            transition-all duration-500 
            hover:-translate-y-3 hover:shadow-2xl
            hover:[transform:rotateX(6deg)_rotateY(-6deg)]

            ${i === 0 ? "clip-path-book" : ""}
            ${i === 1 ? "clip-path-folder" : ""}
            ${i === 2 ? "clip-path-chip" : ""}
          `}
              >
                <div
                  className="
              absolute inset-0 opacity-0 group-hover:opacity-20 
              transition-opacity duration-500 pointer-events-none
              bg-gradient-to-r from-transparent via-white to-transparent
              group-hover:animate-[shine_1.5s_ease-in-out]
            "
                />
                <div
                  className="
              absolute inset-0 rounded-2xl pointer-events-none
              opacity-0 group-hover:opacity-100
              transition-opacity duration-500
            "
                  style={{
                    boxShadow: "0 0 20px #d97757",
                    border: "2px solid #d97757"
                  }}
                />
                <div
                  className="
              mb-6 transition-transform duration-500 
              group-hover:translate-x-1 group-hover:-translate-y-1
            "
                >
                  {i === 0 && (
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="#d97757">
                      <path d="M4 19.5V6a2 2 0 0 1 2-2h9.5a2 2 0 0 1 2 2v13.5l-6.75-3.5L4 19.5z" />
                    </svg>
                  )}
                  {i === 1 && (
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="#d97757">
                      <path d="M3 6a2 2 0 0 1 2-2h6l2 2h6a2 2 0 0 1 2 2v10a2 
                2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"/>
                    </svg>
                  )}
                  {i === 2 && (
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="#d97757">
                      <path d="M12 2a3 3 0 0 1 3 3v1h1a3 3 0 0 1 3 3v2a3 
                3 0 0 1-3 3h-1v1a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-1H6a3 
                3 0 0 1-3-3V9a3 3 0 0 1 3-3h1V5a3 3 0 0 1 3-3h2z"/>
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {metric.label}
                </h3>
                <p className="text-3xl font-extrabold mt-2" style={{ color: "#d97757" }}>
                  {metric.value}
                </p>
                <p className="text-neutral-600 dark:text-neutral-300 mt-4 leading-relaxed">
                  {metric.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center mt-16 text-lg font-medium 
                text-neutral-700 dark:text-neutral-300">
          Aprende con <span style={{ color: '#d97757' }}>Ordinaly AI</span>
        </p>
      </section>
      {/* EXPERTOS */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900 dark:text-white">
          Nuestros expertos
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {content?.experts?.map((expert: any, i: number) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                {expert.name}
              </h3>
              <p className="text-[#d97757] font-medium mt-1">{expert.role}</p>
              <p className="text-neutral-600 dark:text-neutral-400 mt-3">
                {expert.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-neutral-50 dark:bg-neutral-800">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900 dark:text-white">
          Casos de uso reales
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          {content.useCases.map((useCase: any, i: number) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm"
            >
              <span className="text-[#d97757] font-semibold">{useCase.tag}</span>
              <h3 className="text-xl font-bold mt-2 text-neutral-900 dark:text-white">
                {useCase.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-3">
                {useCase.description}
              </p>

              <ul className="mt-4 space-y-2 text-neutral-700 dark:text-neutral-300">
                {useCase.bullets.map((b: string, j: number) => (
                  <li key={j}>• {b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900 dark:text-white">
          Preguntas frecuentes
        </h2>

        <div className="space-y-8">
          {content.technologyFaqs.map((faq: any, i: number) => (
            <div key={i} className="p-6 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
              <span className="text-[#d97757] font-semibold">{faq.tag}</span>
              <h3 className="text-xl font-bold mt-2 text-neutral-900 dark:text-white">
                {faq.question}
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300 mt-3">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="/faq"
            className="text-[#d97757] font-semibold underline hover:text-[#d97757] transition"
          >
            Ver todas las preguntas frecuentes
          </a>
        </div>
      </section>

      <section className="py-28 bg-neutral-50 dark:bg-neutral-900">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 
                 text-neutral-900 dark:text-white">
          Curiosidades sobre la IA
        </h2>

        <div className="max-w-5xl mx-auto px-6">
          <CardStackDemo />
        </div>
      </section>



      {/* FORM */}
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
        <span>Quiero formarme</span>
      </a>

      <Footer />


      <Footer />
    </div>
  );
}
