"use client";

export type TranslateFn = (key: string, values?: Record<string, any>) => string;

export const homeBenefits = [
  {
    titleKey: "benefits.items.0.title",
    defaultTitle: "Ahorro de Tiempo Real",
    descriptionKey: "benefits.items.0.description",
    defaultDescription: "Automatiza tareas repetitivas y ahorra hasta 20 horas semanales con nuestros agentes de IA",
    iconBg: "bg-[#22A60D]",
    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    titleKey: "benefits.items.1.title",
    defaultTitle: "Soluciones a Medida",
    descriptionKey: "benefits.items.1.description",
    defaultDescription: "Diseñamos workflows personalizados adaptados a tu sector: inmobiliaria, fincas, marketing",
    iconBg: "bg-[#46B1C9]",
    iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    titleKey: "benefits.items.2.title",
    defaultTitle: "Formación Incluida",
    descriptionKey: "benefits.items.2.description",
    defaultDescription: "Cursos prácticos de IA para que tu equipo domine las herramientas y sea autónomo",
    iconBg: "bg-[#623CEA]",
    iconPath: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    titleKey: "benefits.items.3.title",
    defaultTitle: "Soporte Local",
    descriptionKey: "benefits.items.3.description",
    defaultDescription: "Equipo en Sevilla disponible para reuniones presenciales y soporte continuo",
    iconBg: "bg-[#F97316]",
    iconPath: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  },
];

export const serviceBenefits = [
  {
    titleKey: "services.extra.0.title",
    defaultTitle: "Implementación Rápida",
    descriptionKey: "services.extra.0.description",
    defaultDescription: "Primeros resultados visibles en 2-4 semanas. Trabajamos por fases para valor inmediato.",
    iconBg: "from-green-400 to-green-600",
    iconPath: "M5 13l4 4L19 7",
  },
  {
    titleKey: "services.extra.1.title",
    defaultTitle: "100% Personalizable",
    descriptionKey: "services.extra.1.description",
    defaultDescription: "No usamos plantillas genéricas. Cada solución se diseña específicamente para tu negocio.",
    iconBg: "from-blue-400 to-blue-600",
    iconPath: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
  },
  {
    titleKey: "services.extra.2.title",
    defaultTitle: "Soporte Continuo",
    descriptionKey: "services.extra.2.description",
    defaultDescription: "Equipo técnico en Sevilla disponible. Actualizaciones y mejoras incluidas en el servicio.",
    iconBg: "from-purple-400 to-purple-600",
    iconPath: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
  },
];

export const processSteps = [
  {
    titleKey: "process.steps.0.title",
    defaultTitle: "Análisis Inicial",
    descriptionKey: "process.steps.0.description",
    defaultDescription: "Reunión gratuita (presencial en Sevilla o videollamada) donde analizamos tus procesos actuales.",
    color: "#22A60D",
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

export const useCases = [
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

export const testimonials = [
  {
    initials: "AG",
    nameKey: "testimonials.items.0.name",
    defaultName: "Ana García",
    roleKey: "testimonials.items.0.role",
    defaultRole: "Directora, Inmobiliaria en Sevilla",
    quoteKey: "testimonials.items.0.quote",
    defaultQuote: 'El chatbot de WhatsApp nos ha cambiado la vida. Ahorramos 15 horas semanales en consultas repetitivas y nuestros clientes están encantados con la atención 24/7. La inversión se recuperó en 4 meses.',
    color: "from-green-400 to-green-600",
  },
  {
    initials: "JM",
    nameKey: "testimonials.items.1.name",
    defaultName: "José Martínez",
    roleKey: "testimonials.items.1.role",
    defaultRole: "Gerente, Administrador de Fincas",
    quoteKey: "testimonials.items.1.quote",
    defaultQuote: "La automatización de incidencias ha revolucionado nuestra gestión. Los vecinos reportan problemas por WhatsApp y el sistema asigna proveedores automáticamente. Profesionales y muy cercanos.",
    color: "from-blue-400 to-blue-600",
  },
  {
    initials: "LR",
    nameKey: "testimonials.items.2.name",
    defaultName: "Laura Rodríguez",
    roleKey: "testimonials.items.2.role",
    defaultRole: "CEO, Agencia de Marketing",
    quoteKey: "testimonials.items.2.quote",
    defaultQuote: "Los workflows de contenido con IA nos permiten gestionar 3x más clientes con el mismo equipo. El curso de formación fue fundamental para aprovechar todo el potencial. Totalmente recomendable.",
    color: "from-purple-400 to-purple-600",
  },
];

export const faqItems = [
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

export const partners = [
  { src: "/static/logos/logo_aviva_publicidad.webp", alt: "Aviva Publicidad - Automatización Marketing", url: "https://avivapublicidad.es", delay: "0.1s" },
  { src: "/static/logos/logo_grupo_addu.webp", alt: "Grupo Addu - Soluciones IA", url: "https://grupoaddu.com", delay: "0.2s" },
  { src: "/static/logos/logo_proinca_consultores.webp", alt: "Proinca Consultores - Optimización Procesos", url: "https://www.proincaconsultores.es", delay: "0.3s" },
  { src: "/static/logos/logo_aires_de_feria.webp", alt: "Aires de Feria - Automatización Eventos", url: "https://www.airesdeferia.com", delay: "0.4s" },
  { src: "/static/logos/guadalquivir_fincas_logo.webp", alt: "Guadalquivir Fincas - Agentes IA Inmobiliaria", url: "https://www.guadalquivirfincas.com", delay: "0.5s" },
];

export const ctaBenefits = [
  {
    titleKey: "cta.items.0.title",
    defaultTitle: "Análisis Personalizado",
    descriptionKey: "cta.items.0.description",
    defaultDescription: "Estudiamos tu negocio y te mostramos oportunidades de automatización concretas",
    icon: "🎯",
  },
  {
    titleKey: "cta.items.1.title",
    defaultTitle: "Presupuesto Transparente",
    descriptionKey: "cta.items.1.description",
    defaultDescription: "Sin costes ocultos. Sabrás exactamente qué vas a recibir y cuánto costará",
    icon: "💰",
  },
  {
    titleKey: "cta.items.2.title",
    defaultTitle: "Resultados Rápidos",
    descriptionKey: "cta.items.2.description",
    defaultDescription: "Primeras automatizaciones funcionando en 2-4 semanas. Valor desde el día 1",
    icon: "⚡",
  },
];
