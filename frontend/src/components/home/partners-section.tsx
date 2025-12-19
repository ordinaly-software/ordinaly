"use client";

import Image from "next/image";
type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface SectionProps {
  t: TranslateFn;
}

const partners = [
  {
    src: "/static/logos/logo_aviva_publicidad.webp",
    alt: "Aviva Publicidad - Automatización Marketing",
    url: "https://avivapublicidad.es",
    delay: "0.1s",
  },
  {
    src: "/static/logos/logo_grupo_addu.webp",
    alt: "Grupo Addu - Soluciones IA",
    url: "https://grupoaddu.com",
    delay: "0.2s",
  },
  {
    src: "/static/logos/logo_proinca_consultores.webp",
    alt: "Proinca Consultores - Optimización Procesos",
    url: "https://www.proincaconsultores.es",
    delay: "0.3s",
  },
  {
    src: "/static/logos/logo_aires_de_feria.webp",
    alt: "Aires de Feria - Automatización Eventos",
    url: "https://www.airesdeferia.com",
    delay: "0.4s",
  },
  {
    src: "/static/logos/guadalquivir_fincas_logo.webp",
    alt: "Guadalquivir Fincas - Agentes IA Inmobiliaria",
    url: "https://www.guadalquivirfincas.com",
    delay: "0.5s",
  },
];

export function PartnersSection({ t }: SectionProps) {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-4 bg-[#1F8A0D] dark:bg-[#0E1B12] text-[#145C07] dark:text-[#E6FFE0]">
      <h2 className="text-3xl font-bold text-center mb-4 text-white dark:text-[#E6FFE0]">
        {t("partners.title")}
      </h2>
      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-4 items-center justify-items-center">
          {partners.map((partner, index) => (
            <div
              key={partner.src}
              className="scroll-animate fade-in-up w-full max-w-[220px] flex items-center justify-center"
              style={{ animationDelay: partner.delay || `${index * 0.1}s` }}
            >
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-300 hover:scale-105 hover:opacity-80 cursor-pointer flex items-center justify-center w-full"
                aria-label={t("partners.visit")}
              >
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={220}
                  height={88}
                  className="h-16 sm:h-20 md:h-24 w-auto object-contain filter dark:invert dark:brightness-0 dark:contrast-100"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA="
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 220px"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
