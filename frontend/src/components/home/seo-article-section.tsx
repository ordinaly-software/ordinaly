"use client";

import { Button } from "@/components/ui/button";
type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface HeroProps {
  t: TranslateFn;
  onWhatsApp: () => void;
}

export function SeoArticleSection({ t, onWhatsApp }: HeroProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#23272F]">
      <div className="max-w-4xl mx-auto">
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("seoArticle.title")}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {t("seoArticle.intro")}
          </p>
          <h3 className="text-2xl font-bold mb-4 mt-8 text-gray-900 dark:text-white">
            {t("seoArticle.section1.title")}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {t("seoArticle.section1.body")}
          </p>
          <h3 className="text-2xl font-bold mb-4 mt-8 text-gray-900 dark:text-white">
            {t("seoArticle.section2.title")}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {t("seoArticle.section2.body")}
          </p>
          <ul className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
            {[
              "Administradores de fincas: Automatización de incidencias, comunicación con comunidades y gestión de proveedores. Un administrador en Sevilla puede ahorrar hasta 20 horas semanales con nuestros sistemas.",
              "Inmobiliarias: Agentes conversacionales que cualifican leads, programan visitas y envían información de propiedades automáticamente. Ideal para agencias en Sevilla que gestionan decenas de inmuebles simultáneamente.",
              "Agencias de marketing: Automatización de publicaciones en redes sociales, generación de contenido con IA y análisis de campañas. Las agencias sevillanas que trabajan con nosotros gestionan 3x más clientes con el mismo equipo.",
              "Comercio retail: Gestión inteligente de inventario, predicción de demanda y atención al cliente automatizada vía WhatsApp Business.",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-[#1F8A0D] dark:text-[#3FBD6F] font-bold mt-1">→</span>
                <span>{t(`seoArticle.section2.list.${index}`)}</span>
              </li>
            ))}
          </ul>
          <h3 className="text-2xl font-bold mb-4 mt-8 text-gray-900 dark:text-white">
            {t("seoArticle.section3.title")}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {t("seoArticle.section3.body")}
          </p>
          <h3 className="text-2xl font-bold mb-4 mt-8 text-gray-900 dark:text-white">
            {t("seoArticle.section4.title")}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {t("seoArticle.section4.body")}
          </p>
          <ul className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
            {[
              "Conocimiento del mercado local: Entendemos las particularidades de las PYMEs andaluzas",
              "Disponibilidad presencial: Reuniones cara a cara en nuestra oficina de Sevilla centro",
              "Soluciones 100% personalizadas: No usamos plantillas. Cada proyecto se diseña específicamente para ti",
              "Formación incluida: Tu equipo aprende a gestionar y mejorar los sistemas que implementamos",
              "Soporte continuo: No desaparecemos después de la implementación",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-[#1F8A0D] dark:text-[#3FBD6F] font-bold mt-1">✓</span>
                <span>{t(`seoArticle.section4.list.${index}`)}</span>
              </li>
            ))}
          </ul>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-8 mt-8 border border-green-200 dark:border-green-800">
            <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {t("seoArticle.cta.title")}
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t("seoArticle.cta.body")}
            </p>
            <Button size="lg" variant="special" onClick={onWhatsApp}>
              <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t("seoArticle.cta.button")}
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}
