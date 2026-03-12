import type { HubFigureKey, HubBgTheme, PlatformPosition } from "@/components/ui/hub-figures";

export type HubPlatformMeta = {
  position: PlatformPosition;
  figureKey: HubFigureKey;
  colorScheme: "indigo" | "cyan";
  label: { es: string; en: string };
  sublabel: { es: string; en: string };
};

export type LandingHubMeta = {
  title: { es: string; en: string };
  subtitle?: { es: string; en: string };
  bgTheme?: HubBgTheme;
  platforms: HubPlatformMeta[];
};

export type LandingCta = {
  labelEs: string;
  labelEn: string;
  href: string;
  bgColor: string;
};

export type LocalLandingMeta = {
  slug: string;
  heroImage?: string;
  valueProps: number;
  outcomes: number;
  steps: number;
  faqs: number;
  keywords: number;
  hub?: LandingHubMeta;
  cta?: LandingCta;
};

export const landingsMeta: LocalLandingMeta[] = [
  {
    slug: "chatbots-empresas-sevilla",
    heroImage: "/static/backgrounds/blog_background.webp",
    valueProps: 3,
    outcomes: 3,
    steps: 3,
    faqs: 3,
    keywords: 3,
    hub: {
      title: {
        es: "Tu empresa automatizada de extremo a extremo",
        en: "Your business automated end-to-end",
      },
      subtitle: {
        es: "Chatbots IA conectados a tu CRM, datos y equipo en un único flujo",
        en: "AI chatbots connected to your CRM, data and team in a single flow",
      },
      bgTheme: "indigo",
      platforms: [
        {
          position: "top-left",
          figureKey: "chatbot",
          colorScheme: "indigo",
          label: { es: "Chatbot IA", en: "AI Chatbot" },
          sublabel: { es: "Conversaciones automáticas", en: "Automated conversations" },
        },
        {
          position: "top-right",
          figureKey: "cloud-data",
          colorScheme: "cyan",
          label: { es: "Nube & Datos", en: "Cloud & Data" },
          sublabel: { es: "Contexto en tiempo real", en: "Real-time context" },
        },
        {
          position: "bottom-left",
          figureKey: "sales-crm",
          colorScheme: "indigo",
          label: { es: "CRM Conectado", en: "Connected CRM" },
          sublabel: { es: "Leads cualificados auto.", en: "Automatic lead scoring" },
        },
        {
          position: "bottom-right",
          figureKey: "teams-ops",
          colorScheme: "cyan",
          label: { es: "Tu Equipo", en: "Your Team" },
          sublabel: { es: "Sólo casos complejos", en: "Complex cases only" },
        },
      ],
    },
    cta: {
      labelEs: "Pide tu demo de chatbot",
      labelEn: "Request your chatbot demo",
      href: "https://wa.me/34626270806?text=Quiero%20un%20chatbot%20para%20mi%20empresa",
      bgColor: "#4F46E5",
    },
  },
  {
    slug: "automatizacion-n8n-sevilla",
    heroImage: "/static/backgrounds/n8n_background.webp",
    valueProps: 3,
    outcomes: 3,
    steps: 3,
    faqs: 3,
    keywords: 3,
    hub: {
      title: {
        es: "Flujos n8n que conectan toda tu empresa",
        en: "n8n workflows that connect your entire business",
      },
      subtitle: {
        es: "Automatiza cualquier proceso con nodos, APIs e inteligencia artificial",
        en: "Automate any process with nodes, APIs and artificial intelligence",
      },
      bgTheme: "cyan",
      platforms: [
        {
          position: "top-left",
          figureKey: "workflow",
          colorScheme: "indigo",
          label: { es: "Flujos n8n", en: "n8n Workflows" },
          sublabel: { es: "Lógica sin código", en: "No-code logic" },
        },
        {
          position: "top-right",
          figureKey: "cloud-data",
          colorScheme: "cyan",
          label: { es: "APIs & Cloud", en: "APIs & Cloud" },
          sublabel: { es: "Cientos de integraciones", en: "Hundreds of integrations" },
        },
        {
          position: "bottom-right",
          figureKey: "finance",
          colorScheme: "cyan",
          label: { es: "Finanzas & Ops", en: "Finance & Ops" },
          sublabel: { es: "Informes automáticos", en: "Automatic reports" },
        },
      ],
    },
    cta: {
      labelEs: "Automatiza con n8n ahora",
      labelEn: "Automate with n8n now",
      href: "https://wa.me/34626270806?text=Quiero%20automatizar%20con%20n8n",
      bgColor: "#0891B2",
    },
  },
  {
    slug: "agentes-ia-atencion-cliente-sevilla",
    heroImage: "/static/backgrounds/blog_background.webp",
    valueProps: 3,
    outcomes: 3,
    steps: 3,
    faqs: 3,
    keywords: 3,
    hub: {
      title: {
        es: "Atención al cliente IA, disponible 24/7",
        en: "AI customer service, available 24/7",
      },
      subtitle: {
        es: "Agentes inteligentes que resuelven, escalan y aprenden de cada conversación",
        en: "Intelligent agents that resolve, escalate and learn from every conversation",
      },
      bgTheme: "purple",
      platforms: [
        {
          position: "top-left",
          figureKey: "chatbot",
          colorScheme: "indigo",
          label: { es: "Agente IA", en: "AI Agent" },
          sublabel: { es: "Primera línea 24/7", en: "First-line 24/7" },
        },
        {
          position: "top-right",
          figureKey: "cloud-data",
          colorScheme: "cyan",
          label: { es: "Base de Conocimiento", en: "Knowledge Base" },
          sublabel: { es: "Respuestas precisas", en: "Precise answers" },
        },
        {
          position: "bottom-left",
          figureKey: "workflow",
          colorScheme: "indigo",
          label: { es: "Escalado Inteligente", en: "Smart Escalation" },
          sublabel: { es: "Sólo lo necesario", en: "Only what's needed" },
        },
        {
          position: "bottom-right",
          figureKey: "teams-ops",
          colorScheme: "cyan",
          label: { es: "Equipo Humano", en: "Human Team" },
          sublabel: { es: "Casos de alto valor", en: "High-value cases" },
        },
      ],
    },
    cta: {
      labelEs: "Prueba un agente IA gratis",
      labelEn: "Try an AI agent for free",
      href: "https://wa.me/34626270806?text=Quiero%20un%20agente%20IA%20para%20atenci%C3%B3n%20al%20cliente",
      bgColor: "#7C3AED",
    },
  },
  {
    slug: "automatizacion-whatsapp-business-sevilla",
    heroImage: "/static/backgrounds/us_background.webp",
    valueProps: 3,
    outcomes: 3,
    steps: 3,
    faqs: 3,
    keywords: 3,
    hub: {
      title: {
        es: "WhatsApp Business automatizado con IA",
        en: "AI-powered WhatsApp Business automation",
      },
      subtitle: {
        es: "Atiende, cualifica y cierra clientes en WhatsApp mientras duermes",
        en: "Engage, qualify and close customers on WhatsApp while you sleep",
      },
      bgTheme: "green",
      platforms: [
        {
          position: "top-left",
          figureKey: "whatsapp",
          colorScheme: "indigo",
          label: { es: "WhatsApp Business", en: "WhatsApp Business" },
          sublabel: { es: "Canal principal de ventas", en: "Main sales channel" },
        },
        {
          position: "top-right",
          figureKey: "chatbot",
          colorScheme: "cyan",
          label: { es: "Bot IA", en: "AI Bot" },
          sublabel: { es: "Respuestas instantáneas", en: "Instant replies" },
        },
        {
          position: "bottom-left",
          figureKey: "sales-crm",
          colorScheme: "indigo",
          label: { es: "CRM Automático", en: "Automatic CRM" },
          sublabel: { es: "Leads directos al pipeline", en: "Leads into the pipeline" },
        },
        {
          position: "bottom-right",
          figureKey: "cloud-data",
          colorScheme: "cyan",
          label: { es: "Analítica", en: "Analytics" },
          sublabel: { es: "Conversiones medidas", en: "Measured conversions" },
        },
      ],
    },
    cta: {
      labelEs: "Activa tu WhatsApp Business IA",
      labelEn: "Activate your AI WhatsApp Business",
      href: "https://wa.me/34626270806?text=Quiero%20automatizar%20WhatsApp%20Business",
      bgColor: "#0d6e0c",
    },
  },
  {
    slug: "formacion-ia-pymes-sevilla",
    heroImage: "/static/backgrounds/formation_background.webp",
    valueProps: 3,
    outcomes: 3,
    steps: 3,
    faqs: 3,
    keywords: 3,
    cta: {
      labelEs: "Solicita formación para tu equipo",
      labelEn: "Request training for your team",
      href: "https://wa.me/34626270806?text=Quiero%20formaci%C3%B3n%20en%20IA%20para%20mi%20equipo",
      bgColor: "#4F46E5",
    },
  },
  {
    slug: "integraciones-crm-erp-sevilla",
    heroImage: "/static/backgrounds/odoo_background.webp",
    valueProps: 3,
    outcomes: 3,
    steps: 3,
    faqs: 3,
    keywords: 3,
    hub: {
      title: {
        es: "Tu CRM y ERP, conectados y automatizados",
        en: "Your CRM and ERP, connected and automated",
      },
      subtitle: {
        es: "Elimina silos entre sistemas y haz que tus datos fluyan solos",
        en: "Eliminate silos between systems and let your data flow automatically",
      },
      bgTheme: "cyan",
      platforms: [
        {
          position: "top-left",
          figureKey: "sales-crm",
          colorScheme: "indigo",
          label: { es: "CRM Central", en: "Central CRM" },
          sublabel: { es: "Ventas unificadas", en: "Unified sales" },
        },
        {
          position: "top-right",
          figureKey: "cloud-data",
          colorScheme: "cyan",
          label: { es: "APIs & Cloud", en: "APIs & Cloud" },
          sublabel: { es: "Sincronización en tiempo real", en: "Real-time sync" },
        },
        {
          position: "bottom-left",
          figureKey: "finance",
          colorScheme: "indigo",
          label: { es: "ERP Financiero", en: "Financial ERP" },
          sublabel: { es: "Contabilidad automática", en: "Automatic accounting" },
        },
        {
          position: "bottom-right",
          figureKey: "workflow",
          colorScheme: "cyan",
          label: { es: "Flujos Integrados", en: "Integrated Flows" },
          sublabel: { es: "Sin intervención manual", en: "Zero manual effort" },
        },
      ],
    },
    cta: {
      labelEs: "Integra tu CRM y ERP hoy",
      labelEn: "Integrate your CRM and ERP today",
      href: "https://wa.me/34626270806?text=Quiero%20integrar%20mi%20CRM%20y%20ERP",
      bgColor: "#0891B2",
    },
  },
];

export const localLandingSlugs = landingsMeta.map((l) => l.slug);

export const getLandingMeta = (slug: string) => landingsMeta.find((l) => l.slug === slug);
