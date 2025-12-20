"use client";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface SectionProps {
  t: TranslateFn;
}

const faqItems = [
  {
    questionKey: "faq.items.0.q",
    defaultQuestion: "¿Qué es un agente de IA para negocios y cómo puede ayudar a mi empresa?",
    answerKey: "faq.items.0.a",
    defaultAnswer:
      "Un agente de IA es un sistema inteligente que puede realizar tareas específicas de forma autónoma, como responder consultas de clientes, procesar documentos, gestionar citas o automatizar flujos de trabajo. Para tu empresa en Sevilla, esto significa ahorro de tiempo, reducción de errores humanos y disponibilidad 24/7.",
    extraKey: "faq.items.0.extra",
    defaultExtra:
      "Por ejemplo, un administrador de fincas puede tener un agente que gestione incidencias de comunidades automáticamente por WhatsApp.",
  },
  {
    questionKey: "faq.items.1.q",
    defaultQuestion: "¿Cuánto cuesta implementar automatización con IA en mi empresa?",
    answerKey: "faq.items.1.a",
    defaultAnswer:
      "El coste varía según la complejidad del proyecto. Los proyectos simples como chatbots de WhatsApp o automatizaciones básicas pueden arrancar desde presupuestos accesibles para PYMEs.",
    extraKey: "faq.items.1.extra",
    defaultExtra:
      "Ofrecemos consultas gratuitas donde analizamos tu caso específico y te damos un presupuesto personalizado. La mayoría de nuestros clientes recuperan la inversión en menos de 6 meses gracias al ahorro de tiempo y recursos.",
  },
  {
    questionKey: "faq.items.2.q",
    defaultQuestion: "¿Necesito conocimientos técnicos para usar sistemas de automatización?",
    answerKey: "faq.items.2.a",
    defaultAnswer:
      "No, en absoluto. Diseñamos todas nuestras soluciones para que sean intuitivas y fáciles de usar. Además, incluimos formación práctica para tu equipo.",
    extraKey: "faq.items.2.extra",
    defaultExtra:
      "También ofrecemos cursos de IA en Sevilla donde aprenderás a usar herramientas como ChatGPT, automatizaciones y más, sin necesidad de conocimientos previos de programación.",
  },
  {
    questionKey: "faq.items.3.q",
    defaultQuestion: "¿Qué diferencia a Ordinaly de otras empresas de automatización?",
    answerKey: "faq.items.3.a",
    defaultAnswer:
      "Somos un equipo local en Sevilla que entiende las necesidades específicas de las empresas andaluzas. No somos una consultora internacional que aplica soluciones genéricas.",
    extraKey: "faq.items.3.extra",
    defaultExtra:
      "Nos especializamos en PYMEs y sectores específicos (inmobiliarias, administradores de fincas, marketing, retail) y combinamos automatización con formación práctica para que tu equipo sea autónomo.",
  },
  {
    questionKey: "faq.items.4.q",
    defaultQuestion: "¿Cuánto tiempo tarda en implementarse un proyecto de automatización?",
    answerKey: "faq.items.4.a",
    defaultAnswer:
      "Los proyectos simples como chatbots o automatizaciones básicas pueden estar funcionando en 2-4 semanas. Proyectos más complejos como implementación de CRM/ERP con Odoo o workflows avanzados pueden tomar entre 1-3 meses, dependiendo del alcance.",
    extraKey: "faq.items.4.extra",
    defaultExtra: "Siempre trabajamos por fases para que veas resultados rápidos.",
  },
  {
    questionKey: "faq.items.5.q",
    defaultQuestion: "¿Ofrecen soporte después de la implementación?",
    answerKey: "faq.items.5.a",
    defaultAnswer:
      "Sí, por supuesto. Incluimos soporte técnico y mantenimiento. Al estar basados en Sevilla, podemos hacer reuniones presenciales cuando sea necesario.",
    extraKey: "faq.items.5.extra",
    defaultExtra:
      "Además, nuestros sistemas son escalables: a medida que tu negocio crece, podemos ampliar y mejorar las automatizaciones sin empezar desde cero.",
  },
];

export function FaqSection({ t }: SectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("faq.title")}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {t("faq.subtitle")}
          </p>
        </div>
        <div className="space-y-6">
          {faqItems.map((item, index) => (
            <details
              key={item.questionKey}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 cursor-pointer group animate-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <summary className="text-xl font-bold text-gray-900 dark:text-white list-none flex items-center justify-between">
                {t(item.questionKey)}
                <svg className="w-6 h-6 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                <p className="mb-3">{t(item.answerKey)}</p>
                <p>{t(item.extraKey)}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
