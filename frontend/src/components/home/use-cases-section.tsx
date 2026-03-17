"use client";

import { useEffect, useRef } from "react";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface SectionProps {
  t: TranslateFn;
}

const useCases = [
  {
    titleKey: "useCases.items.4.title",
    bulletKey: "useCases.items.4",
    defaultTitle: "Consultoría y Servicios",
    icon: "💼",
    bullets: [
      "Gestión automática de correos",
      "Workflows de facturación",
      "CRM personalizado con VeriFactu"
    ],
  },
  {
    titleKey: "useCases.items.0.title",
    bulletKey: "useCases.items.0",
    defaultTitle: "Administradores de Fincas",
    icon: "🏢",
    bullets: [
      "Envío automático de informes a propietarios",
      "Gestión automática de correos",
      "Workflows de facturación"
    ]
  },
  {
    titleKey: "useCases.items.1.title",
    bulletKey: "useCases.items.1",
    defaultTitle: "Inmobiliarias",
    icon: "🏠",
    bullets: [
      "Agente de IA para consultas de clientes",
      "Automatización de publicaciones en redes sociales",
      "Workflow de visitas y seguimiento",
    ],
  },
  {
    titleKey: "useCases.items.2.title",
    bulletKey: "useCases.items.2",
    defaultTitle: "Agencias de Marketing",
    icon: "📱",
    bullets: [
      "Automatización de redes sociales",
      "Generación de contenido con IA",
      "Análisis de campañas automatizado",
    ],
  },
  {
    titleKey: "useCases.items.3.title",
    bulletKey: "useCases.items.3",
    defaultTitle: "Comercio Retail",
    icon: "🛍️",
    bullets: [
      "Gestión de inventario inteligente",
      "Atención al cliente automatizada",
      "Predicción de demanda con IA",
    ],
  },
  {
    titleKey: "useCases.items.5.title",
    bulletKey: "useCases.items.5",
    defaultTitle: "Construcción e Ingeniería",
    icon: "🏗️",
    bullets: [
      "Gestión de proveedores y presupuestos",
      "Documentación inteligente con IA",
      "Planning y cronogramas automatizados",
    ],
  },
];

export function UseCasesSection({ t }: SectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(".scroll-animate"));
    if (items.length === 0) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("animate-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[--swatch--ivory-medium] dark:bg-[--swatch--slate-dark]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-dark dark:text-ivory-light">
            {t("useCases.title")}
          </h2>
          <p className="text-xl text-slate-medium dark:text-cloud-medium max-w-3xl mx-auto">
            {t("useCases.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((item, index) => (
            <div
              key={item.titleKey}
              className="scroll-animate fade-in-up bg-[--swatch--ivory-light] dark:bg-[--swatch--slate-medium] rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-dark dark:text-ivory-light">
                {t(item.titleKey)}
              </h3>
              <ul className="space-y-2 text-slate-medium dark:text-cloud-medium">
                {item.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-clay dark:text-clay mt-1">✓</span>
                    <span>{t(`${item.bulletKey ?? item.titleKey.replace(".title", "")}.bullets.${idx}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
