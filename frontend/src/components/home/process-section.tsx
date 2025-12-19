"use client";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface SectionProps {
  t: TranslateFn;
}

const processSteps = [
  {
    titleKey: "process.steps.0.title",
    defaultTitle: "Análisis Inicial",
    descriptionKey: "process.steps.0.description",
    defaultDescription: "Reunión gratuita (presencial en Sevilla o videollamada) donde analizamos tus procesos actuales.",
    color: "#1F8A0D",
    badge: "1",
    bulletKey: "process.steps.0",
    bullets: [
      "Identificación de procesos automatizables",
      "Estimación de ahorro de tiempo",
      "Propuesta técnica y presupuesto",
    ],
  },
  {
    titleKey: "process.steps.1.title",
    defaultTitle: "Diseño y Desarrollo",
    descriptionKey: "process.steps.1.description",
    defaultDescription: "Creamos la solución personalizada con entregas parciales para que valides el avance.",
    color: "#46B1C9",
    badge: "2",
    bulletKey: "process.steps.1",
    bullets: [
      "Desarrollo ágil por sprints",
      "Feedback continuo",
      "Ajustes en tiempo real",
    ],
  },
  {
    titleKey: "process.steps.2.title",
    defaultTitle: "Implementación",
    descriptionKey: "process.steps.2.description",
    defaultDescription: "Ponemos en marcha la solución sin interrumpir tu día a día. Testing completo incluido.",
    color: "#623CEA",
    badge: "3",
    bulletKey: "process.steps.2",
    bullets: [
      "Despliegue gradual y controlado",
      "Pruebas de calidad exhaustivas",
      "Migración de datos segura",
    ],
  },
  {
    titleKey: "process.steps.3.title",
    defaultTitle: "Formación y Soporte",
    descriptionKey: "process.steps.3.description",
    defaultDescription: "Capacitamos a tu equipo y ofrecemos soporte continuo. Tú mantienes el control total.",
    color: "#F97316",
    badge: "4",
    bulletKey: "process.steps.3",
    bullets: [
      "Sesiones de formación práctica",
      "Documentación completa",
      "Soporte técnico continuo",
    ],
  },
];

export function ProcessSection({ t }: SectionProps) {
  return (
    <section className="py-20 px-6 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("process.title")}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {t("process.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, index) => (
            <div key={step.titleKey} className="scroll-animate fade-in-up relative" style={{ animationDelay: `${index * 0.1}s` }}>
              <div
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-8 h-full"
                style={{ borderColor: step.color }}
              >
                <div
                  className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ backgroundColor: step.color }}
                >
                  {step.badge}
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t(step.descriptionKey)}
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {step.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-[#1F8A0D] dark:text-[#7CFC00]">→</span>
                        <span>{t(`${step.bulletKey ?? step.titleKey.replace(".title", "")}.bullets.${idx}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
