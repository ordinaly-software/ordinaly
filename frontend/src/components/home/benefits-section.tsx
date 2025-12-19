"use client";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface SectionProps {
  t: TranslateFn;
}

const homeBenefits = [
  {
    titleKey: "benefits.items.0.title",
    defaultTitle: "Ahorro de Tiempo Real",
    descriptionKey: "benefits.items.0.description",
    defaultDescription: "Automatiza tareas repetitivas y ahorra hasta 20 horas semanales con nuestros agentes de IA",
    iconBg: "bg-[#1F8A0D] dark:bg-[#7CFC00] text-white dark:text-[#0B1B17]",
    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    titleKey: "benefits.items.1.title",
    defaultTitle: "Soluciones a Medida",
    descriptionKey: "benefits.items.1.description",
    defaultDescription: "Diseñamos workflows personalizados adaptados a tu sector: inmobiliaria, fincas, marketing",
    iconBg: "bg-[#46B1C9] text-white",
    iconPath:
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    titleKey: "benefits.items.2.title",
    defaultTitle: "Formación Incluida",
    descriptionKey: "benefits.items.2.description",
    defaultDescription: "Cursos prácticos de IA para que tu equipo domine las herramientas y sea autónomo",
    iconBg: "bg-[#623CEA] text-white",
    iconPath:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    titleKey: "benefits.items.3.title",
    defaultTitle: "Soporte Local",
    descriptionKey: "benefits.items.3.description",
    defaultDescription: "Equipo en Sevilla disponible para reuniones presenciales y soporte continuo",
    iconBg: "bg-[#F97316] text-white",
    iconPath:
      "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  },
];

export function BenefitsSection({ t }: SectionProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#23272F]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {t("benefits.title")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t("benefits.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {homeBenefits.map((item, index) => (
            <div
              key={item.titleKey}
              className="scroll-animate fade-in-up p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-[#0F2418] dark:to-[#143024] dark:border dark:border-white/10 dark:shadow-[0_20px_40px_-30px_rgba(0,0,0,0.7)] rounded-xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                {t(item.titleKey)}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{t(item.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
