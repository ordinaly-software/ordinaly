export type LocalLandingMeta = {
  slug: string;
  heroImage?: string;
  valueProps: number;
  outcomes: number;
  steps: number;
  faqs: number;
  keywords: number;
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
  },
  {
    slug: "automatizacion-n8n-sevilla",
    heroImage: "/static/backgrounds/n8n_background.webp",
    valueProps: 3,
    outcomes: 3,
    steps: 3,
    faqs: 3,
    keywords: 3,
  },
  {
    slug: "agentes-ia-atencion-cliente-sevilla",
    heroImage: "/static/backgrounds/blog_background.webp",
    valueProps: 3,
    outcomes: 3,
    steps: 3,
    faqs: 3,
    keywords: 3,
  },
  {
    slug: "automatizacion-whatsapp-business-sevilla",
    heroImage: "/static/backgrounds/us_background.webp",
    valueProps: 3,
    outcomes: 3,
    steps: 3,
    faqs: 3,
    keywords: 3,
  },
  {
    slug: "formacion-ia-pymes-sevilla",
    heroImage: "/static/backgrounds/formation_background.webp",
    valueProps: 3,
    outcomes: 3,
    steps: 3,
    faqs: 3,
    keywords: 3,
  },
  {
    slug: "integraciones-crm-erp-sevilla",
    heroImage: "/static/backgrounds/odoo_background.webp",
    valueProps: 3,
    outcomes: 3,
    steps: 3,
    faqs: 3,
    keywords: 3,
  },
];

export const localLandingSlugs = landingsMeta.map((l) => l.slug);

export const getLandingMeta = (slug: string) => landingsMeta.find((l) => l.slug === slug);
