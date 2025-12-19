"use client";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface SectionProps {
  t: TranslateFn;
}

const useCases = [
  {
    titleKey: "useCases.items.0.title",
    bulletKey: "useCases.items.0",
    defaultTitle: "Administradores de Fincas",
    icon: "🏢",
    bullets: ["Sistema CRM para seguimiento de propiedades"],
  },
  {
    titleKey: "useCases.items.1.title",
    bulletKey: "useCases.items.1",
    defaultTitle: "Inmobiliarias",
    icon: "🏠",
    bullets: [
      "Agente de IA para consultas de clientes",
      "Automatización de publicaciones en portales",
      "Workflow de visitas y seguimiento",
      "Generación automática de descripciones",
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
      "Chatbots para captación de leads",
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
      "Integración con eCommerce",
    ],
  },
  {
    titleKey: "useCases.items.4.title",
    bulletKey: "useCases.items.4",
    defaultTitle: "Consultoría y Servicios",
    icon: "💼",
    bullets: [
      "CRM personalizado con Odoo",
      "Automatización de propuestas",
      "Gestión de proyectos con IA",
      "Workflows de facturación",
    ],
  },
  {
    titleKey: "useCases.items.5.title",
    bulletKey: "useCases.items.5",
    defaultTitle: "Construcción e Ingeniería",
    icon: "🏗️",
    bullets: [
      "Control de obras automatizado",
      "Gestión de proveedores y presupuestos",
      "Documentación inteligente con IA",
      "Planning y cronogramas automatizados",
    ],
  },
];

export function UseCasesSection({ t }: SectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("useCases.title")}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {t("useCases.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((item, index) => (
            <div
              key={item.titleKey}
              className="scroll-animate fade-in-up bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                {t(item.titleKey)}
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                {item.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#1F8A0D] dark:text-[#7CFC00] mt-1">✓</span>
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
