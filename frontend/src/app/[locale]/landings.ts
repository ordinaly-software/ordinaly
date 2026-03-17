import type { HubFigureKey, HubBgTheme, PlatformPosition } from "@/components/ui/hub-figures";

export type LocalizedText = {
  es: string;
  en: string;
};

export type HubPlatformMeta = {
  position: PlatformPosition;
  figureKey: HubFigureKey;
  colorScheme: "indigo" | "cyan";
  label: LocalizedText;
  sublabel: LocalizedText;
};

export type LandingHubMeta = {
  title: LocalizedText;
  subtitle?: LocalizedText;
  bgTheme?: HubBgTheme;
  platforms: HubPlatformMeta[];
};

export type LandingMetric = {
  label: LocalizedText;
  value: LocalizedText;
  detail: LocalizedText;
};

export type LandingUseCase = {
  tag: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  bullets: LocalizedText[];
};

export type LandingFaq = {
  tag?: LocalizedText;
  question: LocalizedText;
  answer: LocalizedText;
};

export type LandingCta = {
  label: LocalizedText;
  href: string;
  bgColor: string;
};

export type LocalLandingMeta = {
  slug: string;
  heroImage?: string;
  heroImagePosition?: string;
  title: LocalizedText;
  shortTitle: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  heroBadge: LocalizedText;
  heroCtaLabel: LocalizedText;
  secondaryCtaLabel: LocalizedText;
  serviceType: LocalizedText;
  areaServed: LocalizedText;
  valueProps: LocalizedText[];
  metrics: LandingMetric[];
  outcomes: LocalizedText[];
  steps: LocalizedText[];
  useCases: LandingUseCase[];
  technologyFaqs: LandingFaq[];
  keywords: LocalizedText[];
  hub?: LandingHubMeta;
  cta?: LandingCta;
};

export const localize = (locale: string, value: LocalizedText) =>
  locale.startsWith("en") ? value.en : value.es;

export const landingsMeta: LocalLandingMeta[] = [
  {
    slug: "chatbots-empresas-sevilla",
    heroImage: "/static/backgrounds/blog_background.webp",
    heroImagePosition: "center 32%",
    title: {
      es: "Chatbots empresariales con datos conectados",
      en: "Business chatbots with connected data",
    },
    shortTitle: {
      es: "Chatbots",
      en: "Chatbots",
    },
    subtitle: {
      es: "RAG, guardrails y handoff humano para soporte, ventas y help desks internos.",
      en: "RAG, guardrails and human handoff for support, sales and internal help desks.",
    },
    description: {
      es: "Diseñamos asistentes con fuentes versionadas, trazas por respuesta y políticas de escalado para que cada respuesta salga de documentos y sistemas validados, no de texto genérico.",
      en: "We design assistants with versioned sources, traceability per answer and escalation policies so responses come from validated documents and systems instead of generic text.",
    },
    heroBadge: {
      es: "RAG + guardrails",
      en: "RAG + guardrails",
    },
    heroCtaLabel: {
      es: "Definir piloto",
      en: "Scope a pilot",
    },
    secondaryCtaLabel: {
      es: "Abrir WhatsApp",
      en: "Open WhatsApp",
    },
    serviceType: {
      es: "Chatbots para soporte, ventas e información interna",
      en: "Chatbots for support, sales and internal knowledge",
    },
    areaServed: {
      es: "España, Portugal y despliegue remoto en la UE",
      en: "Spain, Portugal and remote EU delivery",
    },
    valueProps: [
      {
        es: "Pipelines de recuperación con chunking, ranking de fuentes y fallback cuando no hay evidencia suficiente.",
        en: "Retrieval pipelines with chunking, source ranking and fallback when there is not enough evidence.",
      },
      {
        es: "Despliegue en web, WhatsApp y correo con memoria compartida y contexto persistente por cliente.",
        en: "Deployment across web, WhatsApp and email with shared memory and persistent customer context.",
      },
      {
        es: "Escalado a humano con transcripción, intención detectada, score de confianza y siguiente acción sugerida.",
        en: "Human handoff with transcript, detected intent, confidence score and suggested next action.",
      },
    ],
    metrics: [
      {
        label: { es: "Ventana de piloto", en: "Pilot window" },
        value: { es: "2-4 semanas", en: "2-4 weeks" },
        detail: {
          es: "Incluye limpieza documental, despliegue inicial y revisión con muestra real.",
          en: "Includes knowledge cleanup, initial deployment and review against real samples.",
        },
      },
      {
        label: { es: "Capas de control", en: "Control layers" },
        value: { es: "3 niveles", en: "3 layers" },
        detail: {
          es: "Responder, pedir contexto o escalar según evidencia recuperada y política de riesgo.",
          en: "Answer, ask for more context or escalate based on retrieved evidence and risk policy.",
        },
      },
      {
        label: { es: "Trazabilidad", en: "Traceability" },
        value: { es: "100% logado", en: "100% logged" },
        detail: {
          es: "Prompt, fuentes, confianza y handoff registrados para auditoría y tuning.",
          en: "Prompt, sources, confidence and handoff events logged for audit and tuning.",
        },
      },
    ],
    outcomes: [
      {
        es: "Deflexión por intención y por canal, en lugar de medir solo conversaciones totales.",
        en: "Deflection by intent and channel instead of only measuring total conversations.",
      },
      {
        es: "Tiempo mediano de primera respuesta y resolución con corte por idioma, canal y segmento.",
        en: "Median first-response and resolution time split by language, channel and customer segment.",
      },
      {
        es: "Precisión de escalado para asegurar que el equipo humano reciba solo casos fuera de política o baja confianza.",
        en: "Escalation precision so the human team receives only low-confidence or policy-bound cases.",
      },
    ],
    steps: [
      {
        es: "Clasificamos intenciones, acciones permitidas y calidad de las fuentes antes de tocar prompts.",
        en: "We classify intents, allowed actions and source quality before touching prompts.",
      },
      {
        es: "Construimos recuperación, prompts, guardrails e integraciones CRM en un entorno de staging.",
        en: "We build retrieval, prompts, guardrails and CRM integrations in a staging environment.",
      },
      {
        es: "Liberamos con QA muestral, revisión semanal de fallos y panel de métricas por intención.",
        en: "We release with sampled QA, weekly failure review and intent-level dashboards.",
      },
    ],
    useCases: [
      {
        tag: { es: "Soporte", en: "Support" },
        title: {
          es: "Estado de pedidos e incidencias",
          en: "Order status and issue triage",
        },
        description: {
          es: "El bot responde desde ERP, logística y base documental sin obligar al cliente a esperar a un agente.",
          en: "The bot answers from ERP, logistics and documentation sources without forcing the customer to wait for an agent.",
        },
        bullets: [
          {
            es: "Consulta de envío, devoluciones y facturas",
            en: "Shipping, returns and invoice checks",
          },
          {
            es: "Clasificación automática por urgencia e intención",
            en: "Automatic urgency and intent classification",
          },
        ],
      },
      {
        tag: { es: "Ventas", en: "Sales" },
        title: {
          es: "Cualificación previa a demo",
          en: "Pre-demo lead qualification",
        },
        description: {
          es: "Recoge variables de negocio, tamaño de equipo, stack y caso de uso antes de pasar al comercial.",
          en: "It captures business variables, team size, stack and use case before handing off to sales.",
        },
        bullets: [
          {
            es: "Preguntas ramificadas con scoring",
            en: "Branched qualification with scoring",
          },
          {
            es: "Creación automática de lead y resumen en CRM",
            en: "Automatic lead creation and CRM summary",
          },
        ],
      },
      {
        tag: { es: "Operaciones", en: "Operations" },
        title: {
          es: "Asistente documental interno",
          en: "Internal documentation assistant",
        },
        description: {
          es: "Reduce tiempo de búsqueda en políticas, procedimientos y fichas de producto para equipos internos.",
          en: "Reduces search time across policies, procedures and product sheets for internal teams.",
        },
        bullets: [
          {
            es: "Búsqueda con citas y documentos fuente",
            en: "Search with citations and source documents",
          },
          {
            es: "Permisos por área o tipo de documento",
            en: "Permissions by team or document type",
          },
        ],
      },
    ],
    technologyFaqs: [
      {
        tag: { es: "Arquitectura", en: "Architecture" },
        question: {
          es: "¿Qué arquitectura usáis para reducir alucinaciones?",
          en: "Which architecture do you use to reduce hallucinations?",
        },
        answer: {
          es: "Combinamos chunking por tipo documental, embeddings, reranking, reglas de citación y umbrales de confianza. Si la evidencia es insuficiente, el sistema pide más contexto o escala en vez de improvisar.",
          en: "We combine document-specific chunking, embeddings, reranking, citation rules and confidence thresholds. If evidence is insufficient, the system asks for more context or escalates instead of improvising.",
        },
      },
      {
        tag: { es: "Integraciones", en: "Integrations" },
        question: {
          es: "¿Puede escribir en CRM o ticketing?",
          en: "Can it write into CRM or ticketing systems?",
        },
        answer: {
          es: "Sí. Limitamos acciones por endpoint, rol y escenario. Las operaciones sensibles pasan por validaciones adicionales o aprobación humana.",
          en: "Yes. We limit actions by endpoint, role and scenario. Sensitive operations go through extra validation or human approval.",
        },
      },
      {
        tag: { es: "Evaluación", en: "Evaluation" },
        question: {
          es: "¿Cómo evaluáis la calidad antes de salir a producción?",
          en: "How do you evaluate quality before going live?",
        },
        answer: {
          es: "Montamos un set de preguntas reales, medimos exactitud, cobertura, escalado correcto y consistencia de cita. El piloto sale con baseline y revisión semanal.",
          en: "We build a real question set and measure accuracy, coverage, correct escalation and citation consistency. The pilot launches with a baseline and weekly review.",
        },
      },
      {
        tag: { es: "Infraestructura", en: "Infrastructure" },
        question: {
          es: "¿Podemos mantener nuestros documentos en nuestra infraestructura?",
          en: "Can we keep our documents inside our own infrastructure?",
        },
        answer: {
          es: "Sí. Podemos indexar desde almacenamiento interno, nubes privadas o servicios europeos. Definimos retención, acceso y sincronización incremental según vuestro entorno.",
          en: "Yes. We can index from internal storage, private cloud or European services. We define retention, access and incremental sync according to your environment.",
        },
      },
    ],
    keywords: [
      { es: "chatbots empresariales", en: "business chatbots" },
      { es: "chatbot con RAG", en: "RAG chatbot" },
      { es: "automatización de soporte IA", en: "AI support automation" },
      { es: "chatbot CRM y WhatsApp", en: "CRM and WhatsApp chatbot" },
    ],
    hub: {
      title: {
        es: "Arquitectura típica de un chatbot conectado",
        en: "Typical connected-chatbot architecture",
      },
      subtitle: {
        es: "Orquestación, conocimiento, CRM y equipo humano bajo un flujo trazable.",
        en: "Orchestration, knowledge, CRM and human team under one traceable flow.",
      },
      bgTheme: "indigo",
      platforms: [
        {
          position: "top-left",
          figureKey: "chatbot",
          colorScheme: "indigo",
          label: { es: "Interfaz conversacional", en: "Conversation layer" },
          sublabel: { es: "Web y mensajería", en: "Web and messaging" },
        },
        {
          position: "top-right",
          figureKey: "cloud-data",
          colorScheme: "cyan",
          label: { es: "Conocimiento validado", en: "Validated knowledge" },
          sublabel: { es: "FAQs, docs y políticas", en: "FAQs, docs and policies" },
        },
        {
          position: "bottom-left",
          figureKey: "sales-crm",
          colorScheme: "indigo",
          label: { es: "Sistemas de negocio", en: "Business systems" },
          sublabel: { es: "CRM, ERP, tickets", en: "CRM, ERP, tickets" },
        },
        {
          position: "bottom-right",
          figureKey: "teams-ops",
          colorScheme: "cyan",
          label: { es: "Handoff humano", en: "Human handoff" },
          sublabel: { es: "Solo cuando conviene", en: "Only when needed" },
        },
      ],
    },
    cta: {
      label: {
        es: "Pedir demo de chatbot",
        en: "Request chatbot demo",
      },
      href: "https://wa.me/34626270806?text=Quiero%20un%20chatbot%20conectado%20a%20mis%20datos",
      bgColor: "#0255D5",
    },
  },
  {
    slug: "automatizacion-n8n-sevilla",
    heroImage: "/static/backgrounds/n8n_background.webp",
    heroImagePosition: "center center",
    title: {
      es: "Automatización n8n con observabilidad y control",
      en: "n8n automation with observability and control",
    },
    shortTitle: {
      es: "Automatización n8n",
      en: "n8n automation",
    },
    subtitle: {
      es: "Workflows versionados para sincronización, alertas, conciliación y operaciones asistidas por IA.",
      en: "Versioned workflows for syncs, alerts, reconciliation and AI-assisted operations.",
    },
    description: {
      es: "Diseñamos flujos en n8n con reintentos, colas, logs y métricas por nodo para que la automatización deje de ser una caja negra y pase a ser infraestructura operable.",
      en: "We design n8n flows with retries, queues, logs and node-level metrics so automation stops being a black box and becomes operable infrastructure.",
    },
    heroBadge: {
      es: "n8n + observabilidad",
      en: "n8n + observability",
    },
    heroCtaLabel: {
      es: "Auditar procesos",
      en: "Audit processes",
    },
    secondaryCtaLabel: {
      es: "Hablar por WhatsApp",
      en: "Talk on WhatsApp",
    },
    serviceType: {
      es: "Automatización de procesos e integraciones sobre n8n",
      en: "Process automation and integrations on n8n",
    },
    areaServed: {
      es: "España y despliegue remoto UE",
      en: "Spain and EU remote delivery",
    },
    valueProps: [
      {
        es: "Flujos reutilizables con control de versiones y separación clara entre secretos, lógica y configuración.",
        en: "Reusable flows with version control and clear separation between secrets, logic and configuration.",
      },
      {
        es: "Métricas de éxito, error y latencia por workflow para detectar cuellos de botella reales.",
        en: "Success, failure and latency metrics per workflow to detect real bottlenecks.",
      },
      {
        es: "Despliegue gestionado o self-hosted con copias, entornos y políticas de cambio.",
        en: "Managed or self-hosted deployment with backups, environments and change policies.",
      },
    ],
    metrics: [
      {
        label: { es: "Cobertura inicial", en: "Initial scope" },
        value: { es: "2-5 flujos", en: "2-5 workflows" },
        detail: {
          es: "Normalmente cubrimos primero las automatizaciones con más coste manual o más incidencias.",
          en: "We usually start with automations carrying the highest manual cost or failure volume.",
        },
      },
      {
        label: { es: "Modelo de reintentos", en: "Retry model" },
        value: { es: "Idempotente", en: "Idempotent" },
        detail: {
          es: "Diseñamos operaciones para que un retry no duplique registros ni provoque estados inconsistentes.",
          en: "We design operations so retries do not duplicate records or create inconsistent states.",
        },
      },
      {
        label: { es: "Visibilidad", en: "Visibility" },
        value: { es: "Nodo a nodo", en: "Node-level" },
        detail: {
          es: "Eventos, payloads críticos y errores correlacionados para depurar rápido.",
          en: "Critical events, payloads and correlated errors for fast debugging.",
        },
      },
    ],
    outcomes: [
      {
        es: "Tiempo ahorrado por proceso y por responsable, no solo número de ejecuciones.",
        en: "Time saved by process and owner, not only number of executions.",
      },
      {
        es: "Tasa de éxito por workflow con detalle de fallos transitorios frente a fallos de lógica.",
        en: "Success rate per workflow with transient failures separated from logic failures.",
      },
      {
        es: "Backlog operativo eliminado gracias a sincronizaciones y alertas automáticas.",
        en: "Operational backlog removed through syncs and automated alerts.",
      },
    ],
    steps: [
      {
        es: "Mapeamos el proceso, los sistemas implicados y los puntos donde el dato cambia de estado.",
        en: "We map the process, involved systems and points where data changes state.",
      },
      {
        es: "Diseñamos nodos, colas, webhooks y fallback manual con logs desde el día uno.",
        en: "We design nodes, queues, webhooks and manual fallback with logs from day one.",
      },
      {
        es: "Dejamos runbooks, monitorización y ownership compartido con vuestro equipo.",
        en: "We leave runbooks, monitoring and shared ownership with your team.",
      },
    ],
    useCases: [
      {
        tag: { es: "Finanzas", en: "Finance" },
        title: {
          es: "Conciliación y reporting recurrente",
          en: "Recurring reconciliation and reporting",
        },
        description: {
          es: "Automatiza exportaciones, validaciones y envío de reportes sin depender de hojas manuales.",
          en: "Automate exports, validation and report delivery without depending on manual spreadsheets.",
        },
        bullets: [
          {
            es: "Cruce de facturas, pagos y cobros",
            en: "Invoice, payment and collections matching",
          },
          {
            es: "Alertas cuando faltan datos o cuadran mal",
            en: "Alerts when data is missing or mismatched",
          },
        ],
      },
      {
        tag: { es: "Operaciones", en: "Operations" },
        title: {
          es: "Sincronización entre ERP, CRM y formularios",
          en: "ERP, CRM and form synchronization",
        },
        description: {
          es: "Reduce copias manuales y asegura que cada alta o cambio llegue al sistema correcto.",
          en: "Removes manual copy-paste and ensures each new record or change reaches the right system.",
        },
        bullets: [
          {
            es: "Altas y actualizaciones en cascada",
            en: "Cascade create and update flows",
          },
          {
            es: "Validación de duplicados y claves críticas",
            en: "Duplicate and critical-key validation",
          },
        ],
      },
      {
        tag: { es: "Soporte", en: "Support" },
        title: {
          es: "Alertado y triage de incidencias",
          en: "Incident alerting and triage",
        },
        description: {
          es: "Convierte eventos de sistemas en tickets priorizados con contexto y responsable asignado.",
          en: "Turns system events into prioritized tickets with context and assigned owner.",
        },
        bullets: [
          {
            es: "Creación automática en Slack, email o ticketing",
            en: "Automatic creation in Slack, email or ticketing",
          },
          {
            es: "Reglas de escalado por severidad y SLA",
            en: "Escalation rules by severity and SLA",
          },
        ],
      },
    ],
    technologyFaqs: [
      {
        tag: { es: "Despliegue", en: "Deployment" },
        question: {
          es: "¿Trabajáis con n8n cloud, self-hosted u on-prem?",
          en: "Do you work with n8n cloud, self-hosted or on-prem?",
        },
        answer: {
          es: "Sí. Definimos el modo según requisitos de seguridad, latencia, acceso a sistemas internos y capacidad de operación del equipo.",
          en: "Yes. We choose the setup based on security, latency, access to internal systems and the team’s operating capacity.",
        },
      },
      {
        tag: { es: "Fiabilidad", en: "Reliability" },
        question: {
          es: "¿Cómo evitáis flujos frágiles o imposibles de mantener?",
          en: "How do you avoid fragile workflows that become impossible to maintain?",
        },
        answer: {
          es: "Separamos lógica, credenciales y configuración; limitamos workflows gigantes; documentamos nodos críticos y diseñamos retries e idempotencia desde el inicio.",
          en: "We separate logic, credentials and configuration; avoid giant workflows; document critical nodes and design retries and idempotency from the start.",
        },
      },
      {
        tag: { es: "Integraciones", en: "Integrations" },
        question: {
          es: "¿Qué sistemas integráis con más frecuencia?",
          en: "Which systems do you integrate most often?",
        },
        answer: {
          es: "ERP, CRM, SQL, hojas de cálculo, servicios de mensajería, herramientas financieras, ticketing y APIs internas o de terceros.",
          en: "ERP, CRM, SQL, spreadsheets, messaging services, finance tools, ticketing and internal or third-party APIs.",
        },
      },
      {
        tag: { es: "Gobernanza", en: "Governance" },
        question: {
          es: "¿El equipo puede mantener los flujos después?",
          en: "Can the team maintain the workflows afterward?",
        },
        answer: {
          es: "Sí, si es el objetivo. Entregamos runbooks, naming conventions, paneles y formación para que el equipo pueda operar y extender sin rehacer la base.",
          en: "Yes, if that is the goal. We deliver runbooks, naming conventions, dashboards and training so the team can operate and extend the system without rebuilding the foundation.",
        },
      },
    ],
    keywords: [
      { es: "automatización n8n", en: "n8n automation" },
      { es: "workflows con observabilidad", en: "observable workflows" },
      { es: "integraciones operativas", en: "operational integrations" },
      { es: "n8n self hosted", en: "self-hosted n8n" },
    ],
    hub: {
      title: {
        es: "Capa de automatización conectada a todo el stack",
        en: "Automation layer connected to the full stack",
      },
      subtitle: {
        es: "Flujos, datos, finanzas y equipo trabajando con la misma señal operativa.",
        en: "Workflows, data, finance and teams sharing the same operational signal.",
      },
      bgTheme: "cyan",
      platforms: [
        {
          position: "top-left",
          figureKey: "workflow",
          colorScheme: "indigo",
          label: { es: "Workflows n8n", en: "n8n workflows" },
          sublabel: { es: "Orquestación y lógica", en: "Orchestration and logic" },
        },
        {
          position: "top-right",
          figureKey: "cloud-data",
          colorScheme: "cyan",
          label: { es: "Datos y APIs", en: "Data and APIs" },
          sublabel: { es: "Eventos y sincronización", en: "Events and sync" },
        },
        {
          position: "bottom-right",
          figureKey: "finance",
          colorScheme: "cyan",
          label: { es: "Métricas y reporting", en: "Metrics and reporting" },
          sublabel: { es: "KPIs por flujo", en: "KPIs per workflow" },
        },
      ],
    },
    cta: {
      label: {
        es: "Automatizar con n8n",
        en: "Automate with n8n",
      },
      href: "https://wa.me/34626270806?text=Quiero%20auditar%20procesos%20para%20automatizar%20con%20n8n",
      bgColor: "#0255D5",
    },
  },
  {
    slug: "agentes-ia-atencion-cliente-sevilla",
    heroImage: "/static/backgrounds/blog_background.webp",
    heroImagePosition: "center 28%",
    title: {
      es: "Agentes IA para atención al cliente con acción segura",
      en: "AI customer support agents with safe actions",
    },
    shortTitle: {
      es: "Agentes IA",
      en: "AI agents",
    },
    subtitle: {
      es: "Agentes capaces de consultar, ejecutar y escalar con políticas operativas bien definidas.",
      en: "Agents that can read, act and escalate under clearly defined operating policies.",
    },
    description: {
      es: "Construimos agentes que no solo responden. También consultan sistemas, generan tickets, validan estado de pedidos o aplican reglas de negocio con supervisión cuando hace falta.",
      en: "We build agents that do more than answer. They also query systems, create tickets, validate order status and apply business rules with supervision when needed.",
    },
    heroBadge: {
      es: "Agentes con acciones",
      en: "Action-taking agents",
    },
    heroCtaLabel: {
      es: "Diseñar agente",
      en: "Design an agent",
    },
    secondaryCtaLabel: {
      es: "Abrir conversación",
      en: "Open chat",
    },
    serviceType: {
      es: "Agentes IA para soporte y operaciones",
      en: "AI agents for support and operations",
    },
    areaServed: {
      es: "España, equipos distribuidos y soporte remoto",
      en: "Spain, distributed teams and remote support",
    },
    valueProps: [
      {
        es: "Acciones limitadas por permiso, tipo de caso y política de riesgo para evitar automatizaciones ciegas.",
        en: "Actions are limited by permission, case type and risk policy to avoid blind automation.",
      },
      {
        es: "Trazas completas con entrada, razonamiento operacional y salida para revisión posterior.",
        en: "Complete traces with input, operational reasoning and output for later review.",
      },
      {
        es: "Escalado a humano con contexto estructurado y sugerencia de siguiente paso.",
        en: "Human escalation with structured context and recommended next step.",
      },
    ],
    metrics: [
      {
        label: { es: "Control operativo", en: "Operational control" },
        value: { es: "Aprobación opcional", en: "Approval optional" },
        detail: {
          es: "Los casos críticos pueden requerir confirmación humana antes de ejecutar.",
          en: "Critical cases can require human confirmation before execution.",
        },
      },
      {
        label: { es: "Cobertura de trazas", en: "Trace coverage" },
        value: { es: "Evento a evento", en: "Event by event" },
        detail: {
          es: "Registramos contexto, decisión, herramienta usada y resultado final.",
          en: "We log context, decision, tool usage and final outcome.",
        },
      },
      {
        label: { es: "Ventana de tuning", en: "Tuning window" },
        value: { es: "Semanas 1-3", en: "Weeks 1-3" },
        detail: {
          es: "Primera fase con revisión intensiva para ajustar políticas, prompts y herramientas.",
          en: "Initial phase with heavy review to adjust policies, prompts and tools.",
        },
      },
    ],
    outcomes: [
      {
        es: "Tiempo de primera respuesta y tiempo hasta acción ejecutada, separados por tipo de caso.",
        en: "First-response time and time-to-action, split by case type.",
      },
      {
        es: "Precisión de clasificación y tasa de escalado correcto frente a escalado innecesario.",
        en: "Classification accuracy and correct-escalation rate versus unnecessary escalation.",
      },
      {
        es: "Coste por ticket o interacción resuelta con comparación antes y después del piloto.",
        en: "Cost per resolved ticket or interaction compared before and after the pilot.",
      },
    ],
    steps: [
      {
        es: "Definimos qué puede hacer el agente, qué debe consultar y qué siempre debe escalar.",
        en: "We define what the agent can do, what it can query and what must always be escalated.",
      },
      {
        es: "Conectamos APIs, diseñamos validaciones y montamos observabilidad de cada acción.",
        en: "We connect APIs, design validation layers and instrument each action for observability.",
      },
      {
        es: "Lanzamos un piloto controlado con revisión humana y criterios de aceptación operativos.",
        en: "We launch a controlled pilot with human review and operational acceptance criteria.",
      },
    ],
    useCases: [
      {
        tag: { es: "Soporte", en: "Support" },
        title: {
          es: "Gestión de devoluciones y cambios",
          en: "Returns and exchange handling",
        },
        description: {
          es: "El agente interpreta el caso, valida condiciones y ejecuta el flujo correcto o escala si hay riesgo.",
          en: "The agent interprets the case, validates conditions and executes the right flow or escalates when risk exists.",
        },
        bullets: [
          {
            es: "Comprobación de plazos y estado del pedido",
            en: "Deadline and order-state validation",
          },
          {
            es: "Creación de ticket o etiqueta logística",
            en: "Ticket or logistics-label creation",
          },
        ],
      },
      {
        tag: { es: "Operaciones", en: "Operations" },
        title: {
          es: "Reposición y consulta de stock",
          en: "Stock checks and replenishment",
        },
        description: {
          es: "Conecta inventario, compras y reglas de negocio para decidir si informar, crear solicitud o derivar.",
          en: "Connects inventory, procurement and business rules to decide whether to inform, create a request or route the case.",
        },
        bullets: [
          {
            es: "Lectura de inventario en tiempo real",
            en: "Real-time inventory reads",
          },
          {
            es: "Reglas por umbral y proveedor",
            en: "Threshold and supplier rules",
          },
        ],
      },
      {
        tag: { es: "CX", en: "CX" },
        title: {
          es: "Asistente multicanal con continuidad",
          en: "Multichannel assistant with continuity",
        },
        description: {
          es: "Mantiene contexto entre web, email y mensajería para que el cliente no repita información.",
          en: "Maintains context between web, email and messaging so the customer does not repeat information.",
        },
        bullets: [
          {
            es: "Resumen automático del caso al escalar",
            en: "Automatic case summary on escalation",
          },
          {
            es: "Identificación y memoria por cliente",
            en: "Customer identity and session memory",
          },
        ],
      },
    ],
    technologyFaqs: [
      {
        tag: { es: "Políticas", en: "Policies" },
        question: {
          es: "¿Cómo evitáis que el agente haga acciones fuera de política?",
          en: "How do you stop the agent from taking actions outside policy?",
        },
        answer: {
          es: "Definimos herramientas permitidas, validaciones previas, límites por rol y rutas de aprobación. El agente opera dentro de esos bordes, no libremente.",
          en: "We define allowed tools, pre-checks, role limits and approval routes. The agent operates inside those boundaries, not freely.",
        },
      },
      {
        tag: { es: "Modelos", en: "Models" },
        question: {
          es: "¿Usáis un único modelo para todo?",
          en: "Do you use a single model for everything?",
        },
        answer: {
          es: "No siempre. Podemos enrutar entre modelos según latencia, coste, idioma o criticidad del paso. La arquitectura se decide por tarea, no por moda.",
          en: "Not always. We can route between models based on latency, cost, language or step criticality. The architecture is chosen per task, not by trend.",
        },
      },
      {
        tag: { es: "QA", en: "QA" },
        question: {
          es: "¿Cómo controláis la calidad después del lanzamiento?",
          en: "How do you control quality after launch?",
        },
        answer: {
          es: "Con revisión muestral, scoring automático, alertas de baja confianza y un backlog de fallos clasificado por causa raíz.",
          en: "With sample reviews, automatic scoring, low-confidence alerts and a failure backlog classified by root cause.",
        },
      },
      {
        tag: { es: "Seguridad", en: "Security" },
        question: {
          es: "¿Qué pasa con datos sensibles o identificables?",
          en: "What happens with sensitive or identifiable data?",
        },
        answer: {
          es: "Aplicamos minimización de datos, controles de acceso, redacción cuando conviene y retención acorde al flujo. Si el caso lo requiere, limitamos el contexto al mínimo viable.",
          en: "We apply data minimization, access controls, redaction when useful and retention rules aligned with the flow. If needed, we restrict context to the minimum viable set.",
        },
      },
    ],
    keywords: [
      { es: "agentes IA para soporte", en: "AI support agents" },
      { es: "agente con acciones", en: "action-taking AI agent" },
      { es: "automatización helpdesk", en: "helpdesk automation" },
      { es: "agente IA con trazabilidad", en: "traceable AI agent" },
    ],
    hub: {
      title: {
        es: "Agente IA orquestado sobre tus sistemas",
        en: "AI agent orchestrated on top of your systems",
      },
      subtitle: {
        es: "Base de conocimiento, acciones seguras y escalado humano en una única capa.",
        en: "Knowledge base, safe actions and human escalation in one layer.",
      },
      bgTheme: "purple",
      platforms: [
        {
          position: "top-left",
          figureKey: "chatbot",
          colorScheme: "indigo",
          label: { es: "Agente IA", en: "AI agent" },
          sublabel: { es: "Clasifica y responde", en: "Classifies and responds" },
        },
        {
          position: "top-right",
          figureKey: "cloud-data",
          colorScheme: "cyan",
          label: { es: "Conocimiento", en: "Knowledge" },
          sublabel: { es: "Fuentes verificadas", en: "Verified sources" },
        },
        {
          position: "bottom-left",
          figureKey: "workflow",
          colorScheme: "indigo",
          label: { es: "Herramientas", en: "Tools" },
          sublabel: { es: "APIs y acciones", en: "APIs and actions" },
        },
        {
          position: "bottom-right",
          figureKey: "teams-ops",
          colorScheme: "cyan",
          label: { es: "Supervisión", en: "Supervision" },
          sublabel: { es: "Aprobación y QA", en: "Approval and QA" },
        },
      ],
    },
    cta: {
      label: {
        es: "Explorar agente IA",
        en: "Explore AI agent",
      },
      href: "https://wa.me/34626270806?text=Quiero%20dise%C3%B1ar%20un%20agente%20IA%20para%20atenci%C3%B3n%20al%20cliente",
      bgColor: "#0255D5",
    },
  },
  {
    slug: "automatizacion-whatsapp-business-sevilla",
    heroImage: "/static/backgrounds/us_background.webp",
    heroImagePosition: "center 38%",
    title: {
      es: "WhatsApp Business automatizado con medición real",
      en: "WhatsApp Business automation with measurable performance",
    },
    shortTitle: {
      es: "WhatsApp Business",
      en: "WhatsApp Business",
    },
    subtitle: {
      es: "Mensajería operativa para captación, soporte y seguimiento con SLA, plantillas y contexto CRM.",
      en: "Operational messaging for acquisition, support and follow-up with SLA, templates and CRM context.",
    },
    description: {
      es: "Diseñamos flujos de WhatsApp que combinan plantillas aprobadas, bots híbridos y derivación a humanos para que el canal sirva de verdad a ventas y soporte sin perder trazabilidad.",
      en: "We design WhatsApp flows that combine approved templates, hybrid bots and human handoff so the channel truly serves sales and support without losing traceability.",
    },
    heroBadge: {
      es: "WhatsApp + SLA",
      en: "WhatsApp + SLA",
    },
    heroCtaLabel: {
      es: "Optimizar canal",
      en: "Optimize the channel",
    },
    secondaryCtaLabel: {
      es: "Escribir por WhatsApp",
      en: "Message on WhatsApp",
    },
    serviceType: {
      es: "Automatización de WhatsApp Business para ventas y soporte",
      en: "WhatsApp Business automation for sales and support",
    },
    areaServed: {
      es: "España y equipos comerciales distribuidos",
      en: "Spain and distributed commercial teams",
    },
    valueProps: [
      {
        es: "Diseño de journeys con plantillas, respuestas IA y handoff a comercial o soporte según intención.",
        en: "Journey design with templates, AI responses and handoff to sales or support based on intent.",
      },
      {
        es: "Registro estructurado de cada conversación en CRM para no perder contexto ni atribución.",
        en: "Structured logging of every conversation into CRM so context and attribution are never lost.",
      },
      {
        es: "Paneles de tiempos de respuesta, conversión y carga por equipo o franja horaria.",
        en: "Dashboards for response times, conversion and workload by team or time slot.",
      },
    ],
    metrics: [
      {
        label: { es: "Primer contacto", en: "First contact" },
        value: { es: "<30 s objetivo", en: "<30s target" },
        detail: {
          es: "Diseñamos el flujo para responder rápido aunque el caso termine en humano.",
          en: "We design the flow to respond quickly even when the case ultimately goes to a human.",
        },
      },
      {
        label: { es: "Contexto compartido", en: "Shared context" },
        value: { es: "CRM sincronizado", en: "CRM-synced" },
        detail: {
          es: "Cada conversación deja trazas, etiquetas y resumen operativo para el equipo.",
          en: "Each conversation leaves traces, tags and an operational summary for the team.",
        },
      },
      {
        label: { es: "Canal híbrido", en: "Hybrid channel" },
        value: { es: "Plantillas + IA", en: "Templates + AI" },
        detail: {
          es: "Cumplimos restricciones del canal sin renunciar a conversaciones abiertas donde tienen sentido.",
          en: "We respect channel constraints without giving up open-ended conversations where they make sense.",
        },
      },
    ],
    outcomes: [
      {
        es: "Tasa de respuesta y conversión por campaña, plantilla e intención detectada.",
        en: "Response and conversion rate by campaign, template and detected intent.",
      },
      {
        es: "Tiempo hasta asignación humana con trazabilidad completa del histórico.",
        en: "Time to human assignment with full history traceability.",
      },
      {
        es: "Carga operativa por equipo para ajustar horarios, reglas y automatizaciones.",
        en: "Operational load per team so schedules, rules and automations can be adjusted.",
      },
    ],
    steps: [
      {
        es: "Auditamos journeys, mensajes, aprobaciones y SLA antes de rediseñar el canal.",
        en: "We audit journeys, messages, approvals and SLA before redesigning the channel.",
      },
      {
        es: "Configuramos plantillas, enrutado, IA híbrida e integración con CRM o ticketing.",
        en: "We configure templates, routing, hybrid AI and CRM or ticketing integration.",
      },
      {
        es: "Medimos durante el piloto y ajustamos reglas según conversión, tiempos y handoff.",
        en: "We measure during the pilot and adjust rules based on conversion, timing and handoff behavior.",
      },
    ],
    useCases: [
      {
        tag: { es: "Captación", en: "Acquisition" },
        title: {
          es: "Cualificación y agenda comercial",
          en: "Qualification and sales scheduling",
        },
        description: {
          es: "Recoge variables clave y deriva al comercial correcto con resumen previo en CRM.",
          en: "Captures key variables and routes the lead to the right rep with a CRM summary.",
        },
        bullets: [
          {
            es: "Lead scoring antes de llamada o demo",
            en: "Lead scoring before calls or demos",
          },
          {
            es: "Asignación por idioma, zona o producto",
            en: "Assignment by language, area or product",
          },
        ],
      },
      {
        tag: { es: "Soporte", en: "Support" },
        title: {
          es: "Seguimiento posventa con contexto",
          en: "Post-sale follow-up with context",
        },
        description: {
          es: "Unifica incidencias, documentación y estado de pedido dentro del mismo hilo de conversación.",
          en: "Unifies incidents, documentation and order status inside the same conversation thread.",
        },
        bullets: [
          {
            es: "Actualizaciones automáticas por evento",
            en: "Automatic updates from system events",
          },
          {
            es: "Escalado con resumen y archivos",
            en: "Escalation with summary and attachments",
          },
        ],
      },
      {
        tag: { es: "Operaciones", en: "Operations" },
        title: {
          es: "Notificaciones críticas y recordatorios",
          en: "Critical notifications and reminders",
        },
        description: {
          es: "Usa el canal para avisos relevantes sin convertirlo en ruido operativo.",
          en: "Uses the channel for relevant alerts without turning it into operational noise.",
        },
        bullets: [
          {
            es: "Recordatorios con plantillas aprobadas",
            en: "Reminders with approved templates",
          },
          {
            es: "Reglas de frecuencia y prioridad",
            en: "Frequency and priority rules",
          },
        ],
      },
    ],
    technologyFaqs: [
      {
        tag: { es: "API", en: "API" },
        question: {
          es: "¿Trabajáis con la API oficial de WhatsApp Business?",
          en: "Do you work with the official WhatsApp Business API?",
        },
        answer: {
          es: "Sí. Podemos trabajar con BSP existentes o ayudar a ordenar la capa de proveedor, plantillas y números si aún no está bien resuelta.",
          en: "Yes. We can work with your current BSP or help structure the provider, template and number setup if it is not solved yet.",
        },
      },
      {
        tag: { es: "Métricas", en: "Metrics" },
        question: {
          es: "¿Cómo medís si el canal realmente mejora ventas o soporte?",
          en: "How do you measure whether the channel actually improves sales or support?",
        },
        answer: {
          es: "Atamos conversación, plantilla, intención y resultado final a dashboards de conversión, respuesta y escalado. Sin esa atribución, el canal no se considera optimizado.",
          en: "We tie conversation, template, intent and final outcome to dashboards for conversion, response and escalation. Without that attribution, the channel is not considered optimized.",
        },
      },
      {
        tag: { es: "Diseño", en: "Design" },
        question: {
          es: "¿Todo debe resolverse con botones y plantillas?",
          en: "Does everything need to be solved with buttons and templates?",
        },
        answer: {
          es: "No. Diseñamos capas: plantillas para apertura y recontacto, y respuestas IA o handoff para el tramo conversacional que sí necesita flexibilidad.",
          en: "No. We design layers: templates for outreach and recontact, then AI answers or human handoff for the conversational phase that needs flexibility.",
        },
      },
      {
        tag: { es: "Integración", en: "Integration" },
        question: {
          es: "¿Puede compartir lógica con el chatbot web?",
          en: "Can it share logic with the web chatbot?",
        },
        answer: {
          es: "Sí. Reutilizamos intención, conocimiento y reglas de negocio cuando conviene. El canal cambia; la capa de conocimiento y observabilidad no tiene por qué cambiar.",
          en: "Yes. We reuse intents, knowledge and business rules when it makes sense. The channel changes; the knowledge and observability layer does not have to.",
        },
      },
    ],
    keywords: [
      { es: "automatización WhatsApp Business", en: "WhatsApp Business automation" },
      { es: "WhatsApp para ventas", en: "WhatsApp for sales" },
      { es: "SLA en mensajería", en: "messaging SLA" },
      { es: "CRM y WhatsApp", en: "CRM and WhatsApp" },
    ],
    hub: {
      title: {
        es: "WhatsApp conectado a CRM, IA y reporting",
        en: "WhatsApp connected to CRM, AI and reporting",
      },
      subtitle: {
        es: "Un canal comercial y de soporte con trazabilidad operativa completa.",
        en: "A sales and support channel with full operational traceability.",
      },
      bgTheme: "green",
      platforms: [
        {
          position: "top-left",
          figureKey: "whatsapp",
          colorScheme: "indigo",
          label: { es: "Canal WhatsApp", en: "WhatsApp channel" },
          sublabel: { es: "Entrada principal", en: "Primary entry point" },
        },
        {
          position: "top-right",
          figureKey: "chatbot",
          colorScheme: "cyan",
          label: { es: "IA híbrida", en: "Hybrid AI" },
          sublabel: { es: "Plantillas y respuesta", en: "Templates and response" },
        },
        {
          position: "bottom-left",
          figureKey: "sales-crm",
          colorScheme: "indigo",
          label: { es: "CRM", en: "CRM" },
          sublabel: { es: "Contexto y atribución", en: "Context and attribution" },
        },
        {
          position: "bottom-right",
          figureKey: "cloud-data",
          colorScheme: "cyan",
          label: { es: "Paneles", en: "Dashboards" },
          sublabel: { es: "SLA y conversión", en: "SLA and conversion" },
        },
      ],
    },
    cta: {
      label: {
        es: "Activar WhatsApp IA",
        en: "Activate AI WhatsApp",
      },
      href: "https://wa.me/34626270806?text=Quiero%20mejorar%20mi%20operaci%C3%B3n%20de%20WhatsApp%20Business",
      bgColor: "#0d6e0c",
    },
  },
  {
    slug: "formacion-ia-pymes-sevilla",
    heroImage: "/static/backgrounds/formation_background.webp",
    heroImagePosition: "center 30%",
    title: {
      es: "Formación IA aplicada a procesos reales",
      en: "AI training applied to real processes",
    },
    shortTitle: {
      es: "Formación IA",
      en: "AI training",
    },
    subtitle: {
      es: "Programas prácticos para equipos que necesitan usar IA con criterio, seguridad y retorno claro.",
      en: "Hands-on programs for teams that need to use AI with judgment, safety and clear ROI.",
    },
    description: {
      es: "Diseñamos talleres con tareas del negocio, datasets propios y reglas de uso para que el equipo salga con hábitos, plantillas y límites operativos, no solo inspiración.",
      en: "We design workshops around business tasks, internal datasets and usage rules so the team leaves with habits, templates and operational boundaries, not just inspiration.",
    },
    heroBadge: {
      es: "Training operativo",
      en: "Operational training",
    },
    heroCtaLabel: {
      es: "Planificar formación",
      en: "Plan training",
    },
    secondaryCtaLabel: {
      es: "Consultar agenda",
      en: "Check availability",
    },
    serviceType: {
      es: "Formación IA para ventas, soporte y operaciones",
      en: "AI training for sales, support and operations",
    },
    areaServed: {
      es: "España, sesiones remotas y presenciales",
      en: "Spain, remote and on-site sessions",
    },
    valueProps: [
      {
        es: "Sesiones con ejemplos del negocio y tareas medibles que el equipo ya hace hoy.",
        en: "Sessions built around business examples and measurable tasks the team already performs today.",
      },
      {
        es: "Módulos de seguridad, gobierno del dato y criterios de uso aceptable por equipo.",
        en: "Security, data-governance and acceptable-use modules tailored to each team.",
      },
      {
        es: "Plantillas, prompts y rutinas operativas listas para aplicar al día siguiente.",
        en: "Templates, prompts and routines ready to apply the very next day.",
      },
    ],
    metrics: [
      {
        label: { es: "Formato", en: "Format" },
        value: { es: "2-4 horas", en: "2-4 hours" },
        detail: {
          es: "Bloques compactos para no detener la operación y poder iterar por equipo.",
          en: "Compact blocks that do not stop operations and can be repeated by team.",
        },
      },
      {
        label: { es: "Seguimiento", en: "Follow-up" },
        value: { es: "30 días opcionales", en: "Optional 30 days" },
        detail: {
          es: "Acompañamos adopción, revisamos dudas y medimos uso real después de la sesión.",
          en: "We support adoption, answer doubts and measure actual usage after the session.",
        },
      },
      {
        label: { es: "Materiales", en: "Materials" },
        value: { es: "Playbooks listos", en: "Ready-to-use playbooks" },
        detail: {
          es: "Guías por rol, checklists y librería de prompts ajustada a vuestras tareas.",
          en: "Role-based guides, checklists and prompt libraries fitted to your tasks.",
        },
      },
    ],
    outcomes: [
      {
        es: "Adopción por equipo y por caso de uso, no solo asistencia al taller.",
        en: "Adoption by team and use case, not just attendance.",
      },
      {
        es: "Tiempo ahorrado en tareas concretas después de introducir nuevas rutinas y plantillas.",
        en: "Time saved on concrete tasks after introducing new routines and templates.",
      },
      {
        es: "Incidencias de seguridad o usos fuera de política detectadas y corregidas temprano.",
        en: "Security incidents or out-of-policy uses detected and corrected early.",
      },
    ],
    steps: [
      {
        es: "Diagnosticamos tareas repetitivas, herramientas permitidas y riesgos del equipo.",
        en: "We diagnose repetitive tasks, approved tools and team-specific risks.",
      },
      {
        es: "Impartimos una sesión práctica con ejercicios reales y criterios de revisión.",
        en: "We run a hands-on session with real exercises and review criteria.",
      },
      {
        es: "Entregamos materiales y, si conviene, abrimos seguimiento con retos y office hours.",
        en: "We deliver materials and, when useful, follow with challenges and office hours.",
      },
    ],
    useCases: [
      {
        tag: { es: "Ventas", en: "Sales" },
        title: {
          es: "Generación de propuestas y preparación de reuniones",
          en: "Proposal generation and meeting prep",
        },
        description: {
          es: "El equipo aprende a usar IA para sintetizar contexto, preparar objecciones y estructurar follow-ups.",
          en: "The team learns to use AI for context synthesis, objection prep and structured follow-up.",
        },
        bullets: [
          {
            es: "Prompts reutilizables por fase comercial",
            en: "Reusable prompts by sales stage",
          },
          {
            es: "Revisión de tono, riesgo y exactitud",
            en: "Tone, risk and accuracy review",
          },
        ],
      },
      {
        tag: { es: "Operaciones", en: "Operations" },
        title: {
          es: "Documentación, análisis y reportes",
          en: "Documentation, analysis and reporting",
        },
        description: {
          es: "Convertimos tareas largas de síntesis y clasificación en rutinas claras y repetibles.",
          en: "We turn long synthesis and classification tasks into clear, repeatable routines.",
        },
        bullets: [
          {
            es: "Resúmenes consistentes y comparables",
            en: "Consistent, comparable summaries",
          },
          {
            es: "Checklist para validar salidas antes de usar",
            en: "Checklist to validate outputs before use",
          },
        ],
      },
      {
        tag: { es: "Liderazgo", en: "Leadership" },
        title: {
          es: "Política interna de uso de IA",
          en: "Internal AI usage policy",
        },
        description: {
          es: "Ayudamos a definir qué se puede usar, con qué datos y bajo qué supervisión.",
          en: "We help define what can be used, with which data and under what supervision.",
        },
        bullets: [
          {
            es: "Criterios por perfil y por herramienta",
            en: "Criteria by role and tool",
          },
          {
            es: "Buenas prácticas para datos sensibles",
            en: "Best practices for sensitive data",
          },
        ],
      },
    ],
    technologyFaqs: [
      {
        tag: { es: "Programa", en: "Program" },
        question: {
          es: "¿La formación es genérica o se adapta al negocio?",
          en: "Is the training generic or adapted to the business?",
        },
        answer: {
          es: "Siempre parte de casos y tareas reales. Sin ese anclaje, la adopción cae rápido y el equipo vuelve a sus hábitos anteriores.",
          en: "It always starts from real cases and real tasks. Without that anchor, adoption drops quickly and the team returns to old habits.",
        },
      },
      {
        tag: { es: "Seguridad", en: "Security" },
        question: {
          es: "¿Incluís seguridad, privacidad y gobernanza?",
          en: "Do you include security, privacy and governance?",
        },
        answer: {
          es: "Sí. Cubrimos minimización de datos, herramientas aprobadas, límites de uso y revisión humana cuando el impacto lo exige.",
          en: "Yes. We cover data minimization, approved tools, usage limits and human review when impact requires it.",
        },
      },
      {
        tag: { es: "Formato", en: "Format" },
        question: {
          es: "¿Puede combinarse con una implantación técnica?",
          en: "Can it be combined with a technical rollout?",
        },
        answer: {
          es: "Sí. Suele funcionar mejor cuando la formación acompaña a un piloto o despliegue, porque el equipo aprende sobre su propio flujo de trabajo.",
          en: "Yes. It often works better when training accompanies a pilot or rollout because the team learns on top of its own workflow.",
        },
      },
      {
        tag: { es: "Adopción", en: "Adoption" },
        question: {
          es: "¿Cómo medís si la formación realmente cambia hábitos?",
          en: "How do you measure whether training actually changes habits?",
        },
        answer: {
          es: "Definimos tareas objetivo, baseline de tiempo o calidad y seguimiento posterior. Sin medición, la formación queda en inspiración y no en operación.",
          en: "We define target tasks, baseline time or quality and post-session follow-up. Without measurement, training remains inspiration instead of operations.",
        },
      },
    ],
    keywords: [
      { es: "formación IA para empresas", en: "AI training for companies" },
      { es: "adopción de IA en equipos", en: "AI adoption for teams" },
      { es: "taller IA práctico", en: "hands-on AI workshop" },
      { es: "gobernanza de IA", en: "AI governance training" },
    ],
    cta: {
      label: {
        es: "Solicitar formación",
        en: "Request training",
      },
      href: "https://wa.me/34626270806?text=Quiero%20formaci%C3%B3n%20IA%20pr%C3%A1ctica%20para%20mi%20equipo",
      bgColor: "#0255D5",
    },
  },
  {
    slug: "integraciones-crm-erp-sevilla",
    heroImage: "/static/backgrounds/odoo_background.webp",
    heroImagePosition: "center center",
    title: {
      es: "Integraciones CRM y ERP con reglas y calidad de dato",
      en: "CRM and ERP integrations with rules and data quality",
    },
    shortTitle: {
      es: "Integraciones CRM y ERP",
      en: "CRM and ERP integrations",
    },
    subtitle: {
      es: "Sincronizaciones robustas entre ventas, finanzas, soporte e inventario sin duplicados ni conflictos silenciosos.",
      en: "Robust synchronization between sales, finance, support and inventory without duplicates or silent conflicts.",
    },
    description: {
      es: "Unificamos sistemas con mapeos claros, ownership por campo y observabilidad de sincronización para que el dato circule con criterio y no solo con conectores.",
      en: "We unify systems with clear mappings, field-level ownership and sync observability so data flows with intent, not just with connectors.",
    },
    heroBadge: {
      es: "CRM + ERP conectados",
      en: "CRM + ERP connected",
    },
    heroCtaLabel: {
      es: "Auditar integración",
      en: "Audit the integration",
    },
    secondaryCtaLabel: {
      es: "Hablar con el equipo",
      en: "Talk with the team",
    },
    serviceType: {
      es: "Integraciones CRM, ERP y datos operativos",
      en: "CRM, ERP and operational data integrations",
    },
    areaServed: {
      es: "España, equipos multi-sede y entornos híbridos",
      en: "Spain, multi-site teams and hybrid environments",
    },
    valueProps: [
      {
        es: "Definimos qué sistema manda cada campo, cuándo se sincroniza y qué pasa ante conflicto o falta de dato.",
        en: "We define which system owns each field, when it syncs and what happens on conflict or missing data.",
      },
      {
        es: "Validamos calidad, deduplicación y reconciliación para evitar errores que parecen integración pero son diseño de dato.",
        en: "We validate quality, deduplication and reconciliation to avoid issues that look like integration problems but are actually data-design problems.",
      },
      {
        es: "Paneles de ejecución y error para que el equipo operativo pueda ver qué falla y dónde.",
        en: "Execution and error dashboards so the operations team can see what fails and where.",
      },
    ],
    metrics: [
      {
        label: { es: "Modelo de sync", en: "Sync model" },
        value: { es: "Bidireccional o dirigido", en: "Bidirectional or directed" },
        detail: {
          es: "La dirección se decide por proceso y criticidad, no por comodidad técnica.",
          en: "Direction is chosen by process and criticality, not by technical convenience.",
        },
      },
      {
        label: { es: "Reconciliación", en: "Reconciliation" },
        value: { es: "Reglas explícitas", en: "Explicit rules" },
        detail: {
          es: "Diferenciamos conflictos funcionales, duplicados y errores de transporte.",
          en: "We separate functional conflicts, duplicates and transport errors.",
        },
      },
      {
        label: { es: "Cobertura", en: "Coverage" },
        value: { es: "Campos críticos primero", en: "Critical fields first" },
        detail: {
          es: "Priorizamos aquello que impacta facturación, reporting, soporte o inventario.",
          en: "We prioritize what impacts billing, reporting, support or inventory.",
        },
      },
    ],
    outcomes: [
      {
        es: "Menos incidencias por datos inconsistentes entre comercial, soporte y facturación.",
        en: "Fewer incidents caused by inconsistent data between sales, support and billing.",
      },
      {
        es: "Menor tiempo de onboarding y actualización de clientes, productos o pedidos.",
        en: "Lower onboarding and update time for customers, products or orders.",
      },
      {
        es: "Más confianza en reportes operativos y financieros porque la base de dato es coherente.",
        en: "Higher confidence in operational and financial reporting because the data foundation is coherent.",
      },
    ],
    steps: [
      {
        es: "Auditamos sistemas, modelos de dato, ownership y fallos recurrentes de sincronización.",
        en: "We audit systems, data models, ownership and recurring sync failures.",
      },
      {
        es: "Diseñamos el mapeo, reglas de transformación y gestión de conflictos.",
        en: "We design the mapping, transformation rules and conflict-management logic.",
      },
      {
        es: "Desplegamos con monitorización, alertas y runbooks para soporte interno.",
        en: "We deploy with monitoring, alerts and runbooks for internal support.",
      },
    ],
    useCases: [
      {
        tag: { es: "Ventas", en: "Sales" },
        title: {
          es: "Leads, oportunidades y pedidos sincronizados",
          en: "Leads, opportunities and orders kept in sync",
        },
        description: {
          es: "Evita pérdidas de contexto cuando una oportunidad pasa de marketing a comercial y luego a operación.",
          en: "Avoids context loss when an opportunity moves from marketing to sales and later to operations.",
        },
        bullets: [
          {
            es: "Mismo identificador de cliente entre sistemas",
            en: "Same customer identity across systems",
          },
          {
            es: "Estados coherentes de venta y pedido",
            en: "Consistent sales and order states",
          },
        ],
      },
      {
        tag: { es: "Finanzas", en: "Finance" },
        title: {
          es: "Facturación y cobro sin doble captura",
          en: "Billing and collections without double entry",
        },
        description: {
          es: "Conecta contratos, pedidos y facturas para eliminar repeticiones y errores manuales.",
          en: "Connects contracts, orders and invoices to eliminate repetitive and manual errors.",
        },
        bullets: [
          {
            es: "Transformación de datos entre modelos distintos",
            en: "Data transformation across different models",
          },
          {
            es: "Alertas de desajuste y conciliación",
            en: "Mismatch and reconciliation alerts",
          },
        ],
      },
      {
        tag: { es: "Soporte", en: "Support" },
        title: {
          es: "Visión completa del cliente para soporte",
          en: "Complete customer view for support",
        },
        description: {
          es: "El equipo ve ventas, incidencias, facturación y estado operacional sin saltar entre cuatro herramientas.",
          en: "The team sees sales, incidents, billing and operational status without jumping across four tools.",
        },
        bullets: [
          {
            es: "Contexto histórico y operativo unificado",
            en: "Unified historical and operational context",
          },
          {
            es: "Menos escalados por falta de información",
            en: "Fewer escalations caused by missing information",
          },
        ],
      },
    ],
    technologyFaqs: [
      {
        tag: { es: "Compatibilidad", en: "Compatibility" },
        question: {
          es: "¿Trabajáis solo con Odoo y HubSpot?",
          en: "Do you only work with Odoo and HubSpot?",
        },
        answer: {
          es: "No. Son casos habituales, pero el enfoque sirve para CRMs propios, ERPs verticales y bases internas siempre que exista acceso por API, base de datos o exportación controlada.",
          en: "No. Those are common cases, but the approach also works for custom CRMs, vertical ERPs and internal databases as long as there is access through API, database or controlled exports.",
        },
      },
      {
        tag: { es: "Conflictos", en: "Conflicts" },
        question: {
          es: "¿Cómo gestionáis conflictos entre dos sistemas que discrepan?",
          en: "How do you handle conflicts when two systems disagree?",
        },
        answer: {
          es: "Definimos ownership por campo, prioridad temporal y reglas de reconciliación. Si no se puede decidir automáticamente, el caso pasa a una cola de revisión con contexto.",
          en: "We define field ownership, time priority and reconciliation rules. If the case cannot be resolved automatically, it goes to a review queue with context.",
        },
      },
      {
        tag: { es: "Seguridad", en: "Security" },
        question: {
          es: "¿Incluye seguridad y mínimos privilegios?",
          en: "Does it include security and least-privilege access?",
        },
        answer: {
          es: "Sí. Trabajamos con credenciales segregadas, permisos mínimos, cifrado en tránsito y revisión de accesos según criticidad del flujo.",
          en: "Yes. We work with segregated credentials, least-privilege access, in-transit encryption and access reviews according to flow criticality.",
        },
      },
      {
        tag: { es: "Operación", en: "Operations" },
        question: {
          es: "¿Quién mantiene la integración cuando está en producción?",
          en: "Who maintains the integration once it is in production?",
        },
        answer: {
          es: "Depende del acuerdo. Podemos operar nosotros, dejar ownership al equipo interno o compartirlo con runbooks, métricas y ventanas de cambio definidas.",
          en: "It depends on the agreement. We can operate it, hand ownership to the internal team or share it with runbooks, metrics and defined change windows.",
        },
      },
    ],
    keywords: [
      { es: "integraciones CRM ERP", en: "CRM ERP integrations" },
      { es: "calidad de dato", en: "data quality integration" },
      { es: "Odoo HubSpot integración", en: "Odoo HubSpot integration" },
      { es: "sincronización operacional", en: "operational synchronization" },
    ],
    hub: {
      title: {
        es: "Sistemas conectados con ownership y reglas claras",
        en: "Connected systems with clear ownership and rules",
      },
      subtitle: {
        es: "Ventas, finanzas y operaciones compartiendo un mismo dato operativo.",
        en: "Sales, finance and operations sharing the same operational data.",
      },
      bgTheme: "cyan",
      platforms: [
        {
          position: "top-left",
          figureKey: "sales-crm",
          colorScheme: "indigo",
          label: { es: "CRM", en: "CRM" },
          sublabel: { es: "Leads y clientes", en: "Leads and customers" },
        },
        {
          position: "top-right",
          figureKey: "cloud-data",
          colorScheme: "cyan",
          label: { es: "Capa de sync", en: "Sync layer" },
          sublabel: { es: "Transformación y reglas", en: "Transformation and rules" },
        },
        {
          position: "bottom-left",
          figureKey: "finance",
          colorScheme: "indigo",
          label: { es: "ERP", en: "ERP" },
          sublabel: { es: "Pedidos y finanzas", en: "Orders and finance" },
        },
        {
          position: "bottom-right",
          figureKey: "workflow",
          colorScheme: "cyan",
          label: { es: "Observabilidad", en: "Observability" },
          sublabel: { es: "Errores y reconciliación", en: "Errors and reconciliation" },
        },
      ],
    },
    cta: {
      label: {
        es: "Integrar CRM y ERP",
        en: "Integrate CRM and ERP",
      },
      href: "https://wa.me/34626270806?text=Quiero%20unificar%20CRM%20y%20ERP%20sin%20errores%20de%20dato",
      bgColor: "#0255D5",
    },
  },
];

export const localLandingSlugs = landingsMeta.map((landing) => landing.slug);

export const getLandingMeta = (slug: string) => landingsMeta.find((landing) => landing.slug === slug);
