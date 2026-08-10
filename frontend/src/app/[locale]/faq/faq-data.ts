export type LocalizedText = {
  es: string;
  en: string;
};

export type FaqCategoryKey =
  | "general"
  | "company"
  | "training"
  | "calling-agent"
  | "n8n"
  | "invoices"
  | "reports"
  | "odoo";

export type FaqEntry = {
  id: string;
  category: FaqCategoryKey;
  tag?: LocalizedText;
  question: LocalizedText;
  answer: LocalizedText;
};

export type FaqCategoryMeta = {
  label: LocalizedText;
  description: LocalizedText;
  relatedPath: string;
  relatedLabel: LocalizedText;
};

export const localizeFaq = (locale: string, value: LocalizedText) =>
  locale.startsWith("en") ? value.en : value.es;

// Order here drives the default browsing order on the FAQ page.
export const faqCategories: Record<FaqCategoryKey, FaqCategoryMeta> = {
  general: {
    label: { es: "General", en: "General" },
    description: {
      es: "Cómo trabajamos, cuánto se tarda y qué pasa después de lanzar una automatización.",
      en: "How we work, how long it takes and what happens after an automation goes live.",
    },
    relatedPath: "/",
    relatedLabel: { es: "Ir al inicio", en: "Go to homepage" },
  },
  company: {
    label: { es: "Sobre Ordinaly", en: "About Ordinaly" },
    description: {
      es: "Quiénes somos como equipo y qué buscamos conseguir con la automatización.",
      en: "Who we are as a team and what we want automation to achieve.",
    },
    relatedPath: "/nosotros",
    relatedLabel: { es: "Conocer al equipo", en: "Meet the team" },
  },
  training: {
    label: { es: "Formación", en: "Training" },
    description: {
      es: "Dudas habituales antes de apuntarte a un curso o taller de Ordinaly.",
      en: "Common questions before signing up for an Ordinaly course or workshop.",
    },
    relatedPath: "/formacion",
    relatedLabel: { es: "Ver formaciones", en: "View training programs" },
  },
  "calling-agent": {
    label: { es: "Agente de llamadas IA", en: "AI calling agent" },
    description: {
      es: "Telefonía, voz, IA y precio del agente de llamadas con inteligencia artificial.",
      en: "Telephony, voice, AI and pricing for the AI phone calling agent.",
    },
    relatedPath: "/agente-de-llamadas-ia",
    relatedLabel: { es: "Ver agente de llamadas IA", en: "View AI calling agent" },
  },
  n8n: {
    label: { es: "Automatización con n8n", en: "n8n automations" },
    description: {
      es: "Integraciones, mantenimiento y coste de las automatizaciones a medida con n8n.",
      en: "Integrations, maintenance and cost of custom n8n automations.",
    },
    relatedPath: "/automatizaciones-personalizadas-empresas-n8n",
    relatedLabel: { es: "Ver automatizaciones n8n", en: "View n8n automations" },
  },
  invoices: {
    label: { es: "Automatización de facturas", en: "Invoice automation" },
    description: {
      es: "Cómo se detectan, procesan y protegen tus facturas de forma automática.",
      en: "How your invoices are detected, processed and protected automatically.",
    },
    relatedPath: "/automatizacion-facturas",
    relatedLabel: { es: "Ver automatización de facturas", en: "View invoice automation" },
  },
  reports: {
    label: { es: "Automatización de informes", en: "Report automation" },
    description: {
      es: "Recogida, envío masivo e integración de informes periódicos.",
      en: "Collection, bulk delivery and integration of recurring reports.",
    },
    relatedPath: "/automatizacion-informes",
    relatedLabel: { es: "Ver automatización de informes", en: "View report automation" },
  },
  odoo: {
    label: { es: "Implantación de Odoo", en: "Odoo implementation" },
    description: {
      es: "Precio, seguridad y diferencias entre Odoo Community y Odoo Enterprise.",
      en: "Pricing, security and the differences between Odoo Community and Odoo Enterprise.",
    },
    relatedPath: "/implantacion-odoo",
    relatedLabel: { es: "Ver implantación de Odoo", en: "View Odoo implementation" },
  },
};

export const faqEntries: FaqEntry[] = [
  // ---- General (home.faq) ----
  {
    id: "general-tech-knowledge",
    category: "general",
    question: {
      es: "¿Necesito saber de tecnología para trabajar con vosotros?",
      en: "Do I need to know about technology to work with you?",
    },
    answer: {
      es: "Sí. Pero no necesitas ser un experto. Nosotros nos encargamos de la parte técnica y siempre hacemos que nuestros clientes comprendan cómo funcionan las cosas. Además, ofrecemos formación para que tu equipo sea autónomo y no dependa de nosotros para todo.",
      en: "Yes. But you don't need to be an expert. We take care of the technical part and always make sure our clients understand how things work. Also, we offer training so your team can be self-sufficient and not depend on us for everything.",
    },
  },
  {
    id: "general-timeline",
    category: "general",
    question: {
      es: "¿Cuánto tiempo tarda en estar listo?",
      en: "How long does it take to be ready?",
    },
    answer: {
      es: "Depende del proyecto, pero la mayoría de automatizaciones están operativas en 2 a 4 semanas. Trabajamos por sprints para que veas resultados rápido, usando metodologías ágiles de desarrollo.",
      en: "It depends on the project, but most automations are operational within 2 to 4 weeks. We work in sprints so you see results quickly, using agile development methodologies.",
    },
  },
  {
    id: "general-support-changes",
    category: "general",
    question: {
      es: "¿Qué pasa si la automatización falla o necesito hacer cambios?",
      en: "What happens if the automation fails or I need to make changes?",
    },
    answer: {
      es: "Ordinaly ofrece de manera adicional y opcional un soporte técnico para mantener y actualizar tus sistemas. También ofrecemos formación para que tu equipo pueda ser capaz de hacer cambios por sí mismo.",
      en: "Ordinaly offers additional and optional technical support to maintain and update your systems. We also offer training so your team can be capable of making changes by themselves.",
    },
  },
  {
    id: "general-differentiator",
    category: "general",
    question: {
      es: "¿Por qué Ordinaly es diferente?",
      en: "Why is Ordinaly different?",
    },
    answer: {
      es: "No usamos plantillas genéricas ni soluciones estándar. Cada automatización se diseña desde cero adaptada a tu negocio, y siempre que lo necesites nos puedes llamar, visitar o reunirte con nosotros. Creemos en el trato personal y personalizado, y en la transparencia de nuestros procesos. Además, somos especialistas en PYMES y trabajamos con software libre (FLOSS) y europeo.",
      en: "We don't use generic templates or standard solutions. Each automation is designed from scratch adapted to your business, and you can always call us, visit us, or meet with us when you need. We believe in personal and personalized treatment, and in the transparency of our processes. Additionally, we are specialists in SMEs and work with free and open-source (FLOSS) and European software.",
    },
  },

  // ---- Company (usPage.about, /nosotros) ----
  {
    id: "company-what-is",
    category: "company",
    question: {
      es: "¿Qué es Ordinaly?",
      en: "What is Ordinaly?",
    },
    answer: {
      es: "Ordinaly Software S.L. es una empresa sevillana de automatización empresarial con IA que diseña, desarrolla y despliega workflows de automatización de procesos para pymes. Además desarrollamos software a medida como CRMs, ERPs, aplicaciones web y chatbots, y ofrecemos formación profesional para empresas en herramientas de software.",
      en: "Ordinaly Software S.L. is a Seville-based business automation company that uses AI (when it's actually needed) to design, build, and deploy chatbots and workflows for SMBs and corporate teams.",
    },
  },
  {
    id: "company-goal",
    category: "company",
    question: {
      es: "¿Qué queremos conseguir?",
      en: "What do we want to achieve?",
    },
    answer: {
      es: "En nuestra empresa tenemos la misión de potenciar el trabajo de las personas con las nuevas tecnologías, en ningún lugar sustituirlas. Queremos que las empresas, al utilizar nuestras automatizaciones, tengan tiempo para centrarse en la creatividad, las decisiones y las relaciones sociales; aquello que una máquina no debe hacer. Queremos que nuestros clientes se sientan cómodos y seguros con nuestros sistemas, por ello damos importancia a la transparencia y la trazabilidad de estos para cualquier empresa.",
      en: "Our mission is to empower people's work with new technologies, rather than replace them. We want businesses that use our automations to have time to focus on creativity, decisions, and relationships — the things a machine shouldn't do. We want our clients to feel comfortable and secure with our systems, which is why we place real importance on keeping them transparent and simple for any company.",
    },
  },

  // ---- Training (formation.faq, /formacion) ----
  {
    id: "training-programming-knowledge",
    category: "training",
    question: {
      es: "¿Necesito conocimientos previos de programación?",
      en: "Do I need previous programming knowledge?",
    },
    answer: {
      es: "No. Nuestros talleres están pensados para empresarios, autónomos y equipos de cualquier perfil. No es necesario tener conocimientos de programación ni experiencia previa en automatización o inteligencia artificial. Ofrecemos cursos para todos los niveles, desde principiantes hasta avanzados, y adaptamos los contenidos según el grupo de asistentes.",
      en: "No. Our workshops are designed for entrepreneurs, freelancers and teams of any profile. It is not necessary to have programming knowledge or previous experience in automation or artificial intelligence. We offer courses for all levels, from beginners to advanced, and we adapt the content according to the group of attendees.",
    },
  },
  {
    id: "training-bring-materials",
    category: "training",
    question: {
      es: "¿Qué necesito llevar (portátil, cuenta de correo, etc.)?",
      en: "What do I need to bring (laptop, email account, etc.)?",
    },
    answer: {
      es: "Para los talleres presenciales necesitas traer tu propio portátil (con cargador) y una cuenta de correo activa, como Gmail, para seguir los ejercicios en tiempo real. Si un taller requiere algo adicional, te lo avisamos por email unos días antes.",
      en: "For in-person workshops you need to bring your own laptop (with charger) and an active email account, such as Gmail, to follow the exercises in real-time. If a workshop requires something additional, we will notify you by email a few days in advance.",
    },
  },
  {
    id: "training-certificate",
    category: "training",
    question: {
      es: "¿Se entrega algún certificado o diploma al finalizar?",
      en: "Do you issue any certificates or diplomas upon completion?",
    },
    answer: {
      es: "Sí, todas las personas que completan el taller reciben un certificado de participación de Ordinaly, útil para acreditar la formación ante tu empresa o para tu currículum.",
      en: "Yes, all participants who complete the workshop receive a participation certificate from Ordinaly, useful for accrediting the training with your company or for your resume.",
    },
  },
  {
    id: "training-cancel-change",
    category: "training",
    question: {
      es: "¿Qué pasa si me apunto y no puedo asistir? ¿Se puede cancelar o cambiar de fecha?",
      en: "What happens if I sign up and can't attend? Can I cancel or change the date?",
    },
    answer: {
      es: "Puedes cancelar tu inscripción sin coste desde tu perfil en nuestra web hasta 24 horas antes del inicio del taller, liberando tu plaza para otra persona. Si necesitas cambiar de fecha, escríbenos y te ayudamos a moverte a la próxima edición según disponibilidad.",
      en: "You can cancel your enrollment without cost from your profile on our website up to 24 hours before the start of the workshop, freeing your spot for another person. If you need to change the date, please contact us and we will help you move to the next edition according to availability.",
    },
  },
  {
    id: "training-custom-industry",
    category: "training",
    question: {
      es: "¿Puedo solicitar una formación personalizada para mi sector?",
      en: "Can I request a customized training for my industry?",
    },
    answer: {
      es: "Sí. Además de los cursos abiertos, diseñamos formaciones a medida para equipos y sectores concretos (inmobiliaria, agencias de marketing, clínicas, administraciones de fincas, etc.), con contenidos y casos de uso adaptados a tu negocio.",
      en: "Yes. In addition to our open courses, we design customized training programs for specific teams and sectors (real estate, marketing agencies, clinics, property management companies, etc.), with content and use cases adapted to your business.",
    },
  },

  // ---- AI calling agent (landings["agente-de-llamadas-ia"].technologyFaqs) ----
  {
    id: "calling-agent-new-line",
    category: "calling-agent",
    tag: { es: "Teléfono", en: "Phone" },
    question: {
      es: "¿Necesito contratar una línea nueva?",
      en: "Do I need to hire a new line?",
    },
    answer: {
      es: "No necesariamente. Podemos usar tu numeración actual VoIP o proporcionarte una línea a través de Netelip, tanto para llamadas entrantes como salientes.",
      en: "Not necessarily. We can use your current VoIP number or provide a line through Netelip, for both incoming and outgoing calls.",
    },
  },
  {
    id: "calling-agent-gdpr",
    category: "calling-agent",
    tag: { es: "Privacidad", en: "Privacy" },
    question: {
      es: "¿Es seguro y cumple el RGPD?",
      en: "Is it secure and GDPR compliant?",
    },
    answer: {
      es: "Sí. Las llamadas y transcripciones se procesan con garantías de protección de datos, siempre identificándose como un servicio que usa Inteligencia Artificial y preguntando por el consentimiento de tratamiento de datos dado el caso.",
      en: "Yes. Calls and transcriptions are processed with data protection safeguards, always identifying as a service that uses Artificial Intelligence and requesting consent for data processing when applicable.",
    },
  },
  {
    id: "calling-agent-voice",
    category: "calling-agent",
    tag: { es: "Voz", en: "Voice" },
    question: {
      es: "¿Qué tan natural suena la voz del agente?",
      en: "How natural does the agent's voice sound?",
    },
    answer: {
      es: "Usamos las voces de ElevenLabs, líderes en síntesis de voz realista, con soporte para español con distintos acentos además de otros idiomas, ajustando tono y velocidad a tu marca.",
      en: "We use voices from ElevenLabs, leaders in realistic speech synthesis, supporting Spanish with different accents as well as other languages, adjusting tone and speed to your brand.",
    },
  },
  {
    id: "calling-agent-model",
    category: "calling-agent",
    tag: { es: "Inteligencia Artificial", en: "Artificial Intelligence" },
    question: {
      es: "¿Qué modelo se usa en la conversación?",
      en: "Which model is used in the conversation?",
    },
    answer: {
      es: "El razonamiento conversacional se apoya normalmente en modelos Gemini de Google, pero nuestro proveedor ofrece opciones adicionales como los modelos de Claude o GPT.",
      en: "Conversational reasoning is normally powered by Google's Gemini models, but our provider offers additional options such as Claude or GPT models.",
    },
  },
  {
    id: "calling-agent-integration",
    category: "calling-agent",
    tag: { es: "Automatización", en: "Automation" },
    question: {
      es: "¿Cómo se conecta con mi hoja de cálculo o base de datos?",
      en: "How does it connect to my spreadsheet or database?",
    },
    answer: {
      es: "Retell y Netelip gestionan la llamada en tiempo real (voz, IA y telefonía), mientras n8n conecta el resultado de cada llamada con tu CRM, calendario o base de datos mediante APIs REST.",
      en: "Retell and Netelip handle the call in real time (voice, AI and telephony), while n8n connects each call's result to your CRM, calendar or database via REST APIs.",
    },
  },
  {
    id: "calling-agent-price",
    category: "calling-agent",
    tag: { es: "Precio", en: "Price" },
    question: {
      es: "¿Cuánto cuesta implantar un agente de llamadas?",
      en: "How much does it cost to deploy a calling agent?",
    },
    answer: {
      es: "La instalación tiene un precio fijo y cerrado, más IVA. El coste mensual se paga a través de los proveedores externos de voz y telefonía (Retell y Netelip...) y depende del volumen de llamadas. Te lo detallamos tras una auditoría gratuita de tu caso concreto.",
      en: "Installation has a fixed, closed price plus VAT. The monthly cost is paid to external voice and telephony providers (Retell and Netelip...) and depends on call volume. We provide details after a free assessment of your specific case.",
    },
  },

  // ---- n8n automations (landings["automatizaciones-personalizadas-empresas-n8n"].faq) ----
  {
    id: "n8n-undefined-processes",
    category: "n8n",
    question: {
      es: "¿Podemos empezar sin tener procesos definidos?",
      en: "Can we start even if our processes aren't defined?",
    },
    answer: {
      es: "Sí. La fase inicial de nuestro asesoramiento consiste en determinar juntos los sistemas, los puntos de fallo y las tareas repetitivas candidatas a automatizaciones con impacto inmediato.",
      en: "Yes. We map systems, failure points and repetitive tasks together to prioritize automations with immediate impact.",
    },
  },
  {
    id: "n8n-maintain-flows",
    category: "n8n",
    question: {
      es: "¿Es necesario saber programar para mantener los flujos?",
      en: "Do we need programming knowledge to maintain the flows?",
    },
    answer: {
      es: "n8n es una herramienta visual, pero requiere ciertos conocimientos para mantener y evolucionar los flujos. Dejamos convenciones de nombres, dashboards, documentación y formación para que tu equipo gane autonomía, y nuestro equipo puede formar a tu personal o encargarse del mantenimiento.",
      en: "No. We leave naming conventions, dashboards, documentation and training so your team can operate without relying on development.",
    },
  },
  {
    id: "n8n-integrate-tools",
    category: "n8n",
    question: {
      es: "¿Podéis integrarlo con nuestras herramientas actuales?",
      en: "Can you integrate it with our current tools?",
    },
    answer: {
      es: "Sí. Conectamos n8n con ERP, CRM, bases de datos, APIs internas, hojas de cálculo, mensajería y cualquier servicio con API pública disponible.",
      en: "Yes. We connect n8n with ERP, CRM, databases, internal APIs, spreadsheets, messaging tools and any service with an API.",
    },
  },
  {
    id: "n8n-flow-reliability",
    category: "n8n",
    question: {
      es: "¿Qué pasa si falla un nodo del flujo?",
      en: "How do you ensure flows don't break?",
    },
    answer: {
      es: "Diseñamos reintentos, idempotencia, logs, colas y alertas desde el primer día para evitar estados inconsistentes, con notificaciones automáticas para que el equipo pueda actuar rápidamente ante cualquier fallo.",
      en: "We design retries, idempotency, logs, queues and alerts from day one to avoid inconsistent states.",
    },
  },
  {
    id: "n8n-license-cost",
    category: "n8n",
    question: {
      es: "¿n8n tiene coste de licencia?",
      en: "Does n8n have a license cost?",
    },
    answer: {
      es: "La versión web comercial de n8n tiene un coste mensual por usuario y ejecuciones, pero n8n dispone también de una versión de software libre que puede autoalojarse sin coste de licencia. Nuestro presupuesto de pago único cubre la implantación de esta versión de código abierto, sin coste mensual por usarla.",
      en: "The commercial web version of n8n has a monthly cost per user and executions, but n8n also offers a free software version that can be self-hosted at no license cost. Our paid quote covers the implementation of this open-source version, without any monthly fees for using it.",
    },
  },
  {
    id: "n8n-migrate-zapier",
    category: "n8n",
    question: {
      es: "¿Podemos migrar nuestras automatizaciones desde Zapier o Make?",
      en: "Can we migrate our automations from Zapier or Make?",
    },
    answer: {
      es: "Sí. Analizamos tus zaps o escenarios actuales y los reconstruimos en n8n, normalmente con mejor observabilidad y sin las limitaciones de ejecuciones mensuales de esas plataformas.",
      en: "Yes. We review your current zaps or scenarios and rebuild them in n8n, usually with better observability and without those platforms' monthly execution limits.",
    },
  },

  // ---- Invoice automation (landings["automatizacion-facturas"].technologyFaqs) ----
  {
    id: "invoices-detect",
    category: "invoices",
    tag: { es: "Procesamiento", en: "Processing" },
    question: {
      es: "¿Cómo se detectan las facturas automáticamente?",
      en: "How do you detect invoices automatically?",
    },
    answer: {
      es: "Se escanean las bandejas de entrada o carpetas de correo aplicando un filtro de remitente y tipo de archivo adjunto, y después un modelo de OCR identifica los documentos que son facturas, sin reglas manuales.",
      en: "We monitor inboxes or folders and apply OCR models that identify invoice-type documents without manual rules.",
    },
  },
  {
    id: "invoices-data-extracted",
    category: "invoices",
    tag: { es: "Extracción", en: "Extraction" },
    question: {
      es: "¿Qué datos se pueden extraer?",
      en: "What data can be extracted?",
    },
    answer: {
      es: "Cualquier campo indicado previamente: proveedor, fecha, número de factura, conceptos, base imponible, IVA, total y cualquier campo adicional que necesites.",
      en: "Supplier, date, invoice number, items, taxable base, VAT, total, and any additional fields you need.",
    },
  },
  {
    id: "invoices-erp-integration",
    category: "invoices",
    tag: { es: "Integración", en: "Integration" },
    question: {
      es: "¿Se puede conectar con mi Drive o mi sistema ERP?",
      en: "Can it connect to my ERP or accounting system?",
    },
    answer: {
      es: "Sí. n8n se integra con gran facilidad con Google Drive, OneDrive, Dropbox y sistemas ERP como Holded, A3, Contasol y Odoo. Además, se puede conectar con cualquier sistema que tenga API o permita integración mediante webhooks.",
      en: "Yes. We can export to CSV, API, Google Drive, OneDrive, Holded, A3, Contasol, and other systems.",
    },
  },
  {
    id: "invoices-sensitive-data",
    category: "invoices",
    tag: { es: "Seguridad", en: "Security" },
    question: {
      es: "¿Cómo se gestionan los datos sensibles de las facturas?",
      en: "How do you handle sensitive data?",
    },
    answer: {
      es: "Aplicamos minimización de datos, transmisión cifrada y reglas de acceso estrictas. Solo procesamos lo necesario para la automatización.",
      en: "We apply data minimization, encrypted transmission, and strict access rules. We only process what is necessary for automation.",
    },
  },
  {
    id: "invoices-monthly-cost",
    category: "invoices",
    tag: { es: "Precio", en: "Pricing" },
    question: {
      es: "¿Tiene algún coste mensual?",
      en: "Is there a monthly cost?",
    },
    answer: {
      es: "Por nuestra parte no. Nuestro precio de implantación es único y cerrado. El coste mensual dependerá del proveedor de VPS que elijas y del volumen de facturas que proceses. Normalmente, un VPS básico cuesta entre 40€ y 60€ al año, suficiente para la mayoría de empresas.",
      en: "Not on our part. Our implementation price is fixed and closed. The monthly cost will depend on the VPS provider you choose and the volume of invoices you process. Typically, a basic VPS costs between €40 and €60 per year, which is enough for most companies.",
    },
  },

  // ---- Report automation (landings["automatizacion-informes"].technologyFaqs) ----
  {
    id: "reports-collection",
    category: "reports",
    tag: { es: "Procesamiento", en: "Processing" },
    question: {
      es: "¿Cómo se recopilan los informes automáticamente?",
      en: "How are the reports collected automatically?",
    },
    answer: {
      es: "Conectamos con el CRM, la nube o el sistema documental que ya utilices para recoger la información financiera cada mes sin intervención manual.",
      en: "We connect to the CRM, the cloud or the document system you already use to collect the financial reports every month without manual intervention.",
    },
  },
  {
    id: "reports-bulk-send",
    category: "reports",
    tag: { es: "Envío", en: "Delivery" },
    question: {
      es: "¿Cómo se realiza el envío masivo?",
      en: "How is the bulk sending done?",
    },
    answer: {
      es: "Cada informe se envía automáticamente por correo electrónico al propietario correspondiente, usando la plantilla de mensaje que definas.",
      en: "Each report is automatically emailed to the corresponding owner, using the message template you define.",
    },
  },
  {
    id: "reports-crm-integration",
    category: "reports",
    tag: { es: "Integración", en: "Integration" },
    question: {
      es: "¿Se puede conectar con mi CRM o sistema documental?",
      en: "Can it connect to my CRM or document system?",
    },
    answer: {
      es: "Sí. Nos adaptamos al sistema que ya utilices: CRM, nube, base de datos o gestor de documentos.",
      en: "Yes. We adapt to whatever system you already use: CRM, cloud, database or document manager handling your communities.",
    },
  },
  {
    id: "reports-failure",
    category: "reports",
    tag: { es: "Seguridad", en: "Security" },
    question: {
      es: "¿Qué pasa si falla un envío?",
      en: "What happens if a delivery fails?",
    },
    answer: {
      es: "Tras cada ciclo recibirás un correo resumen con el estado del proceso, incluyendo posibles incidencias y confirmación de ejecución.",
      en: "After every cycle you'll receive a summary email with the status of the process, including any incidents and execution confirmation.",
    },
  },
  {
    id: "reports-monthly-cost",
    category: "reports",
    tag: { es: "Precio", en: "Pricing" },
    question: {
      es: "¿Tiene algún coste mensual?",
      en: "Is there a monthly cost?",
    },
    answer: {
      es: "Por nuestra parte no. Nuestro precio de implantación es único y cerrado. El coste mensual dependerá del proveedor de VPS que elijas y del volumen que proceses. Normalmente, un VPS básico cuesta entre 40€ y 60€ al año, suficiente para la mayoría de empresas.",
      en: "Not on our part. Our implementation price is fixed and closed. The monthly cost will depend on the VPS provider you choose and the volume of invoices you process. Typically, a basic VPS costs between €40 and €60 per year, and is sufficient for most companies.",
    },
  },

  // ---- Odoo implementation (landings["implantacion-odoo"].technologyFaqs) ----
  {
    id: "odoo-one-time-payment",
    category: "odoo",
    tag: { es: "Precio", en: "Price" },
    question: {
      es: "¿Por qué el precio es un pago único y no una cuota mensual?",
      en: "Why is it a one-time payment instead of a monthly fee?",
    },
    answer: {
      es: "Implantamos Odoo Community, la edición de código abierto y gratuita de Odoo. Al no depender de las licencias por usuario de Odoo Enterprise, el coste se limita al servicio de implantación: un pago único, sin cuotas mensuales recurrentes por usuario.",
      en: "We implement Odoo Community, Odoo's free, open-source edition. Since it doesn't depend on Odoo Enterprise's per-user licenses, the cost is limited to the implementation service: a one-time payment, with no recurring monthly per-user fees.",
    },
  },
  {
    id: "odoo-data-protection",
    category: "odoo",
    tag: { es: "Seguridad", en: "Security" },
    question: {
      es: "¿Cómo protegéis los datos de mi empresa?",
      en: "How do you protect my company's data?",
    },
    answer: {
      es: "El sistema se despliega en infraestructura controlada por ti (servidor propio o VPS). Mantienes el control total de tus datos y accesos, y no conservamos credenciales ni copias de tu información tras la entrega del servicio.",
      en: "The system is deployed on infrastructure you control (your own server or a VPS). You keep full control of your data and access, and we don't retain credentials or copies of your information after the service is delivered.",
    },
  },
  {
    id: "odoo-vs-other-erps",
    category: "odoo",
    tag: { es: "Comparativa", en: "Comparison" },
    question: {
      es: "¿Por qué elegir Odoo frente a otros ERPs?",
      en: "Why choose Odoo over other ERPs?",
    },
    answer: {
      es: "Odoo combina en una sola plataforma CRM, contabilidad, facturación, inventario, ventas y muchos más módulos, con una interfaz moderna y una curva de aprendizaje mucho menor que otros ERPs tradicionales. Su estructura modular te permite empezar por lo esencial y crecer sin cambiar de sistema.",
      en: "Odoo combines CRM, accounting, invoicing, inventory, sales and many more modules into a single platform, with a modern interface and a much shorter learning curve than traditional ERPs. Its modular structure lets you start with the essentials and grow without switching systems.",
    },
  },
  {
    id: "odoo-community-vs-enterprise",
    category: "odoo",
    tag: { es: "Community vs Enterprise", en: "Community vs Enterprise" },
    question: {
      es: "¿Por qué implantáis Odoo Community y no Odoo Enterprise?",
      en: "Why do you implement Odoo Community instead of Odoo Enterprise?",
    },
    answer: {
      es: "Odoo Community es igual de mantenible, segura y funcional que la versión Enterprise, pero mucho más económica a largo plazo al evitar el coste recurrente de las licencias por usuario. Además, no dependes únicamente de Ordinaly: Odoo Community cuenta con una amplia comunidad de desarrolladores y empresas detrás, incluyendo el foro oficial de Odoo y la Odoo Community Association (OCA).",
      en: "Odoo Community is just as maintainable, secure and functional as the Enterprise edition, but far more cost-effective long-term since it avoids the recurring cost of per-user licenses. And you're not relying solely on Ordinaly either: Odoo Community is backed by a large community of developers and companies, including the official Odoo forum and the Odoo Community Association (OCA).",
    },
  },
  {
    id: "odoo-support-updates",
    category: "odoo",
    tag: { es: "Soporte", en: "Support" },
    question: {
      es: "¿Quién da soporte a Odoo Community? ¿Recibe actualizaciones?",
      en: "Who supports Odoo Community? Does it get updates?",
    },
    answer: {
      es: "Odoo Community está respaldado por una amplia comunidad global de desarrolladores y empresas que publican módulos, correcciones y mejoras de forma continua. Ordinaly se encarga de la implantación, configuración y mantenimiento técnico directo para tu empresa.",
      en: "Odoo Community is backed by a large global community of developers and companies that continuously publish modules, fixes and improvements. Ordinaly handles the implementation, configuration and direct technical maintenance for your business.",
    },
  },
  {
    id: "odoo-migration",
    category: "odoo",
    tag: { es: "Migración", en: "Migration" },
    question: {
      es: "¿Podéis migrar mi negocio desde otro ERP o desde Odoo Enterprise?",
      en: "Can you migrate my business from another ERP or from Odoo Enterprise?",
    },
    answer: {
      es: "Sí. Analizamos tu sistema actual, definimos el alcance funcional necesario y migramos tus datos y procesos a Odoo Community sin perder continuidad operativa.",
      en: "Yes. We analyze your current system, define the functional scope needed and migrate your data and processes to Odoo Community without losing operational continuity.",
    },
  },
];
