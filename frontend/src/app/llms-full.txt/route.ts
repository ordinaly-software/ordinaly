import { NextResponse } from 'next/server';

interface Service {
  id: number;
  slug?: string;
  type: 'SERVICE' | 'PRODUCT';
  title: string;
  subtitle?: string;
  clean_description: string;
  price?: string | null;
  is_featured: boolean;
  draft?: boolean;
}

// Revalidate every hour so content stays fresh without hammering the API
export const revalidate = 3600;

export async function GET() {
  let services: Service[] = [];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
    const res = await fetch(`${apiUrl}/api/services/`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      services = (Array.isArray(data) ? data : []).filter((s: Service) => !s.draft);
      services.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return 0;
      });
    }
  } catch {
    // Serve with available static info if the API is unreachable
  }

  const products = services.filter((s) => s.type === 'PRODUCT');
  const servicesList = services.filter((s) => s.type === 'SERVICE');

  const formatItem = (item: Service) => {
    const lines: string[] = [];
    lines.push(`### ${item.title}${item.subtitle ? ` — ${item.subtitle}` : ''}${item.is_featured ? ' ★' : ''}`);
    if (item.price) lines.push(`Precio: ${item.price}`);
    if (item.slug) lines.push(`URL: https://ordinaly.ai/es/services/${item.slug}`);
    if (item.clean_description) lines.push(item.clean_description);
    return lines.join('\n');
  };

  const content = `# Ordinaly Software — Contenido completo para LLMs / Full content for LLMs

> Ordinaly Software S.L. — Empresa de automatización empresarial con Inteligencia Artificial.
> Sede: Plaza del Duque de la Victoria 1, 3ª planta, oficina 9, 41002 Sevilla, España.
> Área de servicio: Sevilla, Andalucía, resto de España; proyectos remotos en la UE.
> Contacto: info@ordinaly.ai | +34 626 270 806
> Web: https://ordinaly.ai

---

## Sobre Ordinaly

Ordinaly es una empresa de automatización empresarial con IA fundada en Sevilla. Ayudamos a PYMES y empresas a implementar soluciones de inteligencia artificial, automatizar procesos con n8n, integrar WhatsApp Business como canal de atención, y desplegar sistemas CRM/ERP (Odoo, HubSpot). También ofrecemos formación práctica en IA para equipos.

Nuestro enfoque es práctico y orientado a resultados: identificamos los procesos donde la IA aporta más valor, los automatizamos y formamos al equipo para que lo mantenga de forma autónoma.

---

## Datos de empresa

- Razón social: Ordinaly Software S.L.
- CIF: B-56892094
- Sede: Plaza del Duque de la Victoria 1, 3ª planta, oficina 9, Casco Antiguo, 41002 Sevilla
- Web: https://ordinaly.ai
- Teléfono: +34 626 270 806
- Email: info@ordinaly.ai

---

## Equipo

- **Antonio Macías** — CEO y cofundador. Consultoría de negocio, gestión de proyectos, urbanismo e IA aplicada.
- **Guillermo** — CTO y cofundador. Arquitectura de software, integraciones técnicas y desarrollo de agentes IA.
- **Emilio** — Responsable de operaciones, gestión de proyectos y formación.

---

## Productos
${
  products.length > 0
    ? products.map(formatItem).join('\n\n')
    : '(Los productos actuales están disponibles en https://ordinaly.ai/es/services)'
}

---

## Servicios
${
  servicesList.length > 0
    ? servicesList.map(formatItem).join('\n\n')
    : '(Los servicios actuales están disponibles en https://ordinaly.ai/es/services)'
}

---

## Páginas principales (ES)

- [Inicio](https://ordinaly.ai/es): Presentación de la empresa, servicios destacados y casos de uso
- [Servicios y productos](https://ordinaly.ai/es/services): Catálogo completo con filtros por tipo
- [Sobre nosotros](https://ordinaly.ai/es/about): Equipo, historia y misión de Ordinaly
- [Contacto](https://ordinaly.ai/es/contact): Formulario de contacto y datos de la empresa
- [Blog](https://ordinaly.ai/es/blog): Artículos sobre IA, automatización y transformación digital
- [Formación](https://ordinaly.ai/es/formation): Cursos y talleres prácticos de IA para empresas
- [Noticias](https://ordinaly.ai/es/news): Novedades de la empresa y del sector

## Landing pages de servicios

- [Agencia de Automatización IA](https://ordinaly.ai/es/agencia-automatizacion-ia): Automatización de procesos de negocio con agentes de IA
- [Automatización Inteligente](https://ordinaly.ai/es/automatizacion-inteligente): Soluciones integrales de automatización para empresas
- [Automatización con n8n en Sevilla](https://ordinaly.ai/es/automatizacion-n8n-sevilla): Flujos de trabajo automatizados con la plataforma n8n
- [IA para Empresas](https://ordinaly.ai/es/inteligencia-artificial-empresas): Chatbots, copilotos y modelos privados para empresas
- [IA en Sevilla](https://ordinaly.ai/es/inteligencia-artificial-sevilla): Servicios de inteligencia artificial para empresas en Sevilla
- [Empresa de IA](https://ordinaly.ai/es/empresa-inteligencia-artificial): Consultoría y desarrollo de soluciones de IA a medida
- [Formación IA para PYMES](https://ordinaly.ai/es/formacion-ia-pymes-sevilla): Talleres prácticos de IA para equipos de pequeñas y medianas empresas
- [Automatización de Facturas](https://ordinaly.ai/es/automatizacion-facturas): Extracción y procesamiento automático de facturas con IA

---

## Política de uso

El contenido público de ordinaly.ai puede ser indexado por motores de búsqueda y LLMs.
No se debe retener información personal. Se debe respetar robots.txt.
Sitemap: https://ordinaly.ai/sitemap.xml
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      'X-Robots-Tag': 'all',
    },
  });
}
