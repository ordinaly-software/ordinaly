"use client";

import Image from "next/image";
type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface SectionProps {
  t: TranslateFn;
}

const partners = [
  {
    src: "/static/logos/logo_aviva_publicidad_small.webp",
    alt: "Aviva Publicidad - Automatización Marketing",
    url: "https://avivapublicidad.es",
    delay: "0.1s",
  },
  {
    src: "/static/logos/logo_grupo_addu_small.webp",
    alt: "Grupo Addu - Soluciones IA",
    url: "https://grupoaddu.com",
    delay: "0.2s",
  },
  {
    src: "/static/logos/logo_proinca_consultores_small.webp",
    alt: "Proinca Consultores - Optimización Procesos",
    url: "https://www.proincaconsultores.es",
    delay: "0.3s",
  },
  {
    src: "/static/logos/logo_guadalquivir_fincas_small.webp",
    alt: "Guadalquivir Fincas - Agentes IA Inmobiliaria",
    url: "https://www.guadalquivirfincas.com",
    delay: "0.5s",
  },
  {
    src: "/static/logos/logo_esau.webp",
    alt: "Esaú Galván García - Economista abogado",
    url: "#",
    delay: "0.5s",
  },
  {
    src: "/static/logos/logo_aires_de_feria.webp",
    alt: "Aires de Feria - Automatización Eventos",
    url: "https://www.airesdeferia.com",
    delay: "0.4s",
  },
];

export function PartnersSection({ t }: SectionProps) {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-4 bg-[#1F8A0D] dark:bg-[#0E1B12] text-[#145C07] dark:text-[#E6FFE0]">
      <h2 className="text-3xl font-bold text-center mb-4 text-white dark:text-[#E6FFE0]">
        {t("partners.title")}
      </h2>
      <div className="relative">
        <div className="partners-scroll overflow-hidden">
          <div className="partners-marquee flex w-max">
            {[0, 1].map((sequence) => (
              <div
                key={`partners-sequence-${sequence}`}
                className="partners-track flex gap-6 px-4 py-2"
                aria-hidden={sequence === 1}
              >
                {partners.map((partner) => (
                  <div
                    key={`${sequence}-${partner.src}`}
                    className="w-44 md:w-56 flex items-center justify-center shrink-0"
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
                        className="h-14 md:h-20 w-auto object-contain filter dark:invert dark:brightness-0 dark:contrast-100"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA="
                        sizes="(max-width: 768px) 176px, 220px"
                      />
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .partners-marquee {
          animation: partners-marquee 30s linear infinite;
        }

        .partners-marquee:hover {
          animation-play-state: paused;
        }

        .partners-scroll {
          scrollbar-width: none;
        }

        .partners-scroll::-webkit-scrollbar {
          display: none;
        }

        @keyframes partners-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .partners-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
