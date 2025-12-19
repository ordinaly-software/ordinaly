"use client";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface SectionProps {
  t: TranslateFn;
}

const testimonials = [
  {
    initials: "AG",
    nameKey: "testimonials.items.0.name",
    defaultName: "Ana García",
    roleKey: "testimonials.items.0.role",
    defaultRole: "Directora, Inmobiliaria en Sevilla",
    quoteKey: "testimonials.items.0.quote",
    defaultQuote:
      "El chatbot de WhatsApp nos ha cambiado la vida. Ahorramos 15 horas semanales en consultas repetitivas y nuestros clientes están encantados con la atención 24/7. La inversión se recuperó en 4 meses.",
    color: "from-green-400 to-green-600",
  },
  {
    initials: "JM",
    nameKey: "testimonials.items.1.name",
    defaultName: "José Martínez",
    roleKey: "testimonials.items.1.role",
    defaultRole: "Gerente, Administrador de Fincas",
    quoteKey: "testimonials.items.1.quote",
    defaultQuote:
      "La automatización de incidencias ha revolucionado nuestra gestión. Los vecinos reportan problemas por WhatsApp y el sistema asigna proveedores automáticamente. Profesionales y muy cercanos.",
    color: "from-blue-400 to-blue-600",
  },
  {
    initials: "LR",
    nameKey: "testimonials.items.2.name",
    defaultName: "Laura Rodríguez",
    roleKey: "testimonials.items.2.role",
    defaultRole: "CEO, Agencia de Marketing",
    quoteKey: "testimonials.items.2.quote",
    defaultQuote:
      "Los workflows de contenido con IA nos permiten gestionar 3x más clientes con el mismo equipo. El curso de formación fue fundamental para aprovechar todo el potencial. Totalmente recomendable.",
    color: "from-purple-400 to-purple-600",
  },
];

export function TestimonialsSection({ t }: SectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("testimonials.title")}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {t("testimonials.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div
              key={item.nameKey}
              className="scroll-animate fade-in-up bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4`}
                >
                  {item.initials}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{t(item.nameKey)}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(item.roleKey)}
                  </p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                “{t(item.quoteKey)}”
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
