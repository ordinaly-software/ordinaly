"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Alert from "@/components/ui/alert";
import Slider from "@/components/ui/slider";
import { 
  FileText, 
  Download, 
  Calendar,
  Tag,
  ExternalLink,
  Mail,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

interface LegalDocument {
  id: number;
  name: string;
  content: string;
  pdf_content: string | null;
  version: string;
  tag: string;
  author?: {
    username: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

type LegalTab = 'terms' | 'privacy' | 'cookies' | 'license';

interface ContentSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

interface DocumentContent {
  title: string;
  sections: ContentSection[];
}

const Footer = dynamic(() => import("@/components/ui/footer"), { ssr: false, loading: () => <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924]"><div className="max-w-7xl mx-auto"><div className="grid md:grid-cols-4 gap-8"><div className="col-span-2"><div className="h-24 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div></div></div></div></footer> });

const getTermsContent = (t: any): DocumentContent => ({
  title: t('sections.terms.title', { defaultValue: 'Términos de Servicio' }),
  sections: [
    {
      id: 'identification',
      title: t('sections.terms.identification.title', { defaultValue: 'IDENTIFICACIÓN DEL PRESTADOR DE SERVICIOS' }),
      paragraphs: [
        t('sections.terms.identification.p1', { defaultValue: 'En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y comercio electrónico (LSSI-CE), se informa que el presente sitio web es propiedad de:' }),
      ],
      bullets: [
        t('sections.terms.identification.bullet1', { defaultValue: 'Empresa: Ordinaly Software S.L.' }),
        t('sections.terms.identification.bullet2', { defaultValue: 'Domicilio fiscal: Plaza del Duque de la Victoria 1, planta 3, oficina 9, 41002 Sevilla, Sevilla (España)' }),
        t('sections.terms.identification.bullet3', { defaultValue: 'Correo de contacto: ordinalysoftware@gmail.com' }),
        t('sections.terms.identification.bullet4', { defaultValue: 'Sitio web: https://ordinaly.ai' }),
      ],
    },
    {
      id: 'purpose',
      title: t('sections.terms.purpose.title', { defaultValue: 'OBJETO' }),
      paragraphs: [
        t('sections.terms.purpose.p1', { defaultValue: 'Estos Términos de Servicio regulan el acceso, navegación, contratación y uso de los servicios ofrecidos por Ordinaly Software S.L. a través de su sitio web, así como las responsabilidades derivadas de su utilización.' }),
      ],
    },
    {
      id: 'service-modalities',
      title: t('sections.terms.serviceModalities.title', { defaultValue: 'MODALIDADES DE SERVICIO' }),
      paragraphs: [
        t('sections.terms.serviceModalities.p1', { defaultValue: 'Ordinaly ofrece los siguientes tipos de servicio:' }),
      ],
      bullets: [
        t('sections.terms.serviceModalities.bullet1', { defaultValue: 'Servicios bajo suscripción mensual o anual: incluyen soporte técnico, mantenimiento, actualizaciones y acceso a funcionalidades recurrentes (ej. chatbots, automatizaciones, dashboards).' }),
        t('sections.terms.serviceModalities.bullet2', { defaultValue: 'Servicios puntuales: intervenciones concretas sin continuidad (ej. implementación única de un CRM, flujo de trabajo específico). No incluyen mantenimiento ni soporte posterior a la entrega.' }),
        t('sections.terms.serviceModalities.bullet3', { defaultValue: 'Formación: cursos presenciales o telemáticos sobre herramientas de automatización, con condiciones específicas de asistencia y cancelación.' }),
      ],
    },
    {
      id: 'economic-conditions',
      title: t('sections.terms.economicConditions.title', { defaultValue: 'CONDICIONES ECONÓMICAS Y FORMAS DE PAGO' }),
      paragraphs: [],
      bullets: [
        t('sections.terms.economicConditions.bullet1', { defaultValue: 'Los pagos se realizan exclusivamente mediante tarjeta bancaria, a través de la plataforma segura Stripe.' }),
        t('sections.terms.economicConditions.bullet2', { defaultValue: 'La empresa no emite factura automáticamente; se puede solicitar por correo.' }),
        t('sections.terms.economicConditions.bullet3', { defaultValue: 'En los servicios de suscripción, los cobros serán periódicos conforme al acuerdo contractual (mensual o anual).' }),
        t('sections.terms.economicConditions.bullet4', { defaultValue: 'No se admiten reembolsos, salvo para cursos cancelados con al menos 48 horas de antelación al inicio. La inasistencia o cancelación con menos de 48 horas no da derecho a devolución.' }),
      ],
    },
    {
      id: 'access-requirements',
      title: t('sections.terms.accessRequirements.title', { defaultValue: 'ACCESO Y REQUISITOS TÉCNICOS' }),
      paragraphs: [
        t('sections.terms.accessRequirements.p1', { defaultValue: 'Ordinaly proporciona toda la infraestructura y requisitos técnicos necesarios para la implementación de sus servicios. El cliente no necesita disponer de plataformas previas (ej. Odoo, hosting), salvo acuerdo expreso.' }),
      ],
    },
    {
      id: 'correct-use',
      title: t('sections.terms.correctUse.title', { defaultValue: 'USO CORRECTO DE LOS SERVICIOS' }),
      paragraphs: [
        t('sections.terms.correctUse.p1', { defaultValue: 'El usuario se compromete a utilizar los servicios de forma lícita y conforme a los presentes términos. Queda expresamente prohibido:' }),
      ],
      bullets: [
        t('sections.terms.correctUse.bullet1', { defaultValue: 'Usar los servicios para actividades ilegales, fraudulentas o no autorizadas.' }),
        t('sections.terms.correctUse.bullet2', { defaultValue: 'Realizar campañas de spam, desinformación o vulnerar derechos de terceros.' }),
        t('sections.terms.correctUse.bullet3', { defaultValue: 'Reproducir o modificar las herramientas entregadas sin autorización expresa.' }),
      ],
    },
    {
      id: 'intellectual-property',
      title: t('sections.terms.intellectualProperty.title', { defaultValue: 'PROPIEDAD INTELECTUAL' }),
      paragraphs: [
        t('sections.terms.intellectualProperty.p1', { defaultValue: 'Todo el contenido del sitio web (textos, imágenes, documentación, dashboards, flujos, interfaces…) es propiedad de Ordinaly Software S.L. o de sus licenciantes y está protegido por la normativa vigente.' }),
        t('sections.terms.intellectualProperty.p2', { defaultValue: 'El cliente no podrá reproducir, distribuir o modificar dichos contenidos sin consentimiento expreso.' }),
        t('sections.terms.intellectualProperty.p3', { defaultValue: 'Los entregables desarrollados por Ordinaly (chatbots, automatizaciones, etc.) se conceden para su uso únicamente mientras el contrato esté vigente o el servicio se mantenga activo. Su uso queda restringido en caso de impago, cancelación o cese de la actividad.' }),
      ],
    },
    {
      id: 'third-party-licenses',
      title: t('sections.terms.thirdPartyLicenses.title', { defaultValue: 'LICENCIAS DE TERCEROS' }),
      paragraphs: [
        t('sections.terms.thirdPartyLicenses.p1', { defaultValue: 'Las tecnologías y bibliotecas utilizadas están debidamente licenciadas. Ordinaly mantiene un archivo de control (license.json) con la documentación correspondiente. Se hace uso de APIs de terceros como Google, Meta, Gemini, WhatsApp Business API, Stripe, entre otras, cuya normativa de uso también debe ser respetada por el cliente.' }),
      ],
    },
  ],
});

const getPrivacyContent = (t: any): DocumentContent => ({
  title: t('sections.privacy.title', { defaultValue: 'Política de Privacidad' }),
  sections: [
    {
      id: 'data-controller',
      title: t('sections.privacy.dataController.title', { defaultValue: 'RESPONSABLE DEL TRATAMIENTO' }),
      paragraphs: [
        t('sections.privacy.dataController.p1', { defaultValue: 'En cumplimiento del Reglamento General de Protección de Datos (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), se informa que el responsable del tratamiento de los datos es:' }),
        t('sections.privacy.dataController.p2', { defaultValue: 'Ordinaly Software S.L.' }),
      ],
      bullets: [
        t('sections.privacy.dataController.bullet1', { defaultValue: 'Domicilio fiscal: Plaza del Duque de la Victoria 1, planta 3, oficina 9, 41002 Sevilla, Sevilla (España)' }),
        t('sections.privacy.dataController.bullet2', { defaultValue: 'Correo electrónico de contacto: ordinalysoftware@gmail.com' }),
      ],
    },
    {
      id: 'personal-data-collected',
      title: t('sections.privacy.personalDataCollected.title', { defaultValue: 'DATOS PERSONALES QUE RECOGEMOS' }),
      paragraphs: [
        t('sections.privacy.personalDataCollected.p1', { defaultValue: 'A través del sitio web y durante la prestación de servicios, recogemos los siguientes datos:' }),
      ],
      bullets: [
        t('sections.privacy.personalDataCollected.bullet1', { defaultValue: 'Nombre y apellidos' }),
        t('sections.privacy.personalDataCollected.bullet2', { defaultValue: 'Correo electrónico' }),
        t('sections.privacy.personalDataCollected.bullet3', { defaultValue: 'Teléfono' }),
        t('sections.privacy.personalDataCollected.bullet4', { defaultValue: 'Datos de acceso (usuario y contraseña)' }),
        t('sections.privacy.personalDataCollected.bullet5', { defaultValue: 'Preferencias de configuración de la web (tema, idioma)' }),
      ],
    },
    {
      id: 'processing-purposes',
      title: t('sections.privacy.processingPurposes.title', { defaultValue: 'FINALIDADES DEL TRATAMIENTO' }),
      paragraphs: [
        t('sections.privacy.processingPurposes.p1', { defaultValue: 'Tratamos los datos personales para las siguientes finalidades:' }),
      ],
      bullets: [
        t('sections.privacy.processingPurposes.bullet1', { defaultValue: 'Atender consultas o solicitudes recibidas a través de los formularios de contacto' }),
        t('sections.privacy.processingPurposes.bullet2', { defaultValue: 'Gestionar la relación contractual y la prestación de los servicios contratados' }),
        t('sections.privacy.processingPurposes.bullet3', { defaultValue: 'Personalizar la experiencia del usuario (tema, idioma)' }),
        t('sections.privacy.processingPurposes.bullet4', { defaultValue: 'Enviar comunicaciones comerciales únicamente si el usuario ha dado su consentimiento expreso' }),
      ],
    },
    {
      id: 'legal-bases',
      title: t('sections.privacy.legalBases.title', { defaultValue: 'BASES JURÍDICAS DEL TRATAMIENTO' }),
      paragraphs: [
        t('sections.privacy.legalBases.p1', { defaultValue: 'Las bases legales que amparan el tratamiento de los datos son:' }),
      ],
      bullets: [
        t('sections.privacy.legalBases.bullet1', { defaultValue: 'Consentimiento del interesado, al enviar formularios o aceptar comunicaciones comerciales' }),
        t('sections.privacy.legalBases.bullet2', { defaultValue: 'Interés legítimo, para personalizar funciones básicas de la web como idioma o tema' }),
        t('sections.privacy.legalBases.bullet3', { defaultValue: 'En caso de contratación de servicios, también se aplicará la base de ejecución de un contrato.' }),
      ],
    },
    {
      id: 'recipients',
      title: t('sections.privacy.recipients.title', { defaultValue: 'DESTINATARIOS Y TRANSFERENCIAS INTERNACIONALES' }),
      paragraphs: [
        t('sections.privacy.recipients.p1', { defaultValue: 'Los datos pueden ser tratados por proveedores externos que actúan como encargados del tratamiento:' }),
      ],
      bullets: [
        t('sections.privacy.recipients.bullet1', { defaultValue: 'Stripe, para la gestión segura de pagos online' }),
        t('sections.privacy.recipients.bullet2', { defaultValue: 'Google Analytics, para el análisis de uso del sitio web' }),
      ],
    },
    {
      id: 'data-retention',
      title: t('sections.privacy.dataRetention.title', { defaultValue: 'CONSERVACIÓN DE LOS DATOS' }),
      paragraphs: [],
      bullets: [
        t('sections.privacy.dataRetention.bullet1', { defaultValue: 'Los datos de contacto y configuración se conservarán hasta que el usuario solicite su supresión.' }),
        t('sections.privacy.dataRetention.bullet2', { defaultValue: 'Los datos asociados a servicios contratados o facturación se conservarán durante el plazo legal mínimo exigido (5-6 años).' }),
        t('sections.privacy.dataRetention.bullet3', { defaultValue: 'Los datos de navegación se conservan conforme a lo descrito en la Política de Cookies.' }),
      ],
    },
    {
      id: 'ai-interactions',
      title: t('sections.privacy.aiInteractions.title', { defaultValue: 'INTERACCIONES CON SISTEMAS DE IA' }),
      paragraphs: [
        t('sections.privacy.aiInteractions.p1', { defaultValue: 'Este sitio puede incluir chatbots o asistentes virtuales basados en inteligencia artificial (IA). El usuario será informado de forma clara al interactuar con dichos sistemas.' }),
      ],
      bullets: [
        t('sections.privacy.aiInteractions.bullet1', { defaultValue: 'Las conversaciones mantenidas con sistemas de IA pueden almacenarse con fines de mejora del servicio.' }),
        t('sections.privacy.aiInteractions.bullet2', { defaultValue: 'Estos datos se recogen únicamente si el usuario está utilizando activamente un servicio, y no durante la simple navegación por el sitio.' }),
        t('sections.privacy.aiInteractions.bullet3', { defaultValue: 'Actualmente, las conversaciones no se garantizan como anónimas, debido a las condiciones técnicas de los proveedores utilizados (como Meta o WhatsApp API).' }),
      ],
    },
    {
      id: 'user-rights',
      title: t('sections.privacy.userRights.title', { defaultValue: 'DERECHOS DE LOS USUARIOS' }),
      paragraphs: [
        t('sections.privacy.userRights.p1', { defaultValue: 'Los usuarios pueden ejercer los siguientes derechos reconocidos por el RGPD:' }),
      ],
      bullets: [
        t('sections.privacy.userRights.bullet1', { defaultValue: 'Derecho de acceso' }),
        t('sections.privacy.userRights.bullet2', { defaultValue: 'Derecho de rectificación' }),
        t('sections.privacy.userRights.bullet3', { defaultValue: 'Derecho de supresión' }),
        t('sections.privacy.userRights.bullet4', { defaultValue: 'Derecho de oposición' }),
        t('sections.privacy.userRights.bullet5', { defaultValue: 'Derecho a la limitación del tratamiento' }),
        t('sections.privacy.userRights.bullet6', { defaultValue: 'Derecho a la portabilidad de los datos' }),
        t('sections.privacy.userRights.bullet7', { defaultValue: 'Derecho a retirar el consentimiento en cualquier momento' }),
      ],
    },
    {
      id: 'data-security',
      title: t('sections.privacy.dataSecurity.title', { defaultValue: 'SEGURIDAD DE LOS DATOS' }),
      paragraphs: [
        t('sections.privacy.dataSecurity.p1', { defaultValue: 'Ordinaly Software S.L. adopta medidas técnicas y organizativas apropiadas para proteger los datos personales frente a pérdida, acceso no autorizado o uso indebido, en cumplimiento del principio de integridad y confidencialidad establecido por el RGPD.' }),
      ],
    },
  ],
});

const getCookiesContent = (t: any): DocumentContent => ({
  title: t('sections.cookies.title', { defaultValue: 'Política de Cookies' }),
  sections: [
    {
      id: 'what-are-cookies',
      title: t('sections.cookies.whatAreCookies.title', { defaultValue: '¿QUÉ SON LAS COOKIES?' }),
      paragraphs: [
        t('sections.cookies.whatAreCookies.p1', { defaultValue: 'Las cookies son pequeños archivos que un sitio web instala en el dispositivo del usuario al navegar por sus páginas. Permiten almacenar y recuperar información sobre hábitos de navegación o del dispositivo, y pueden utilizarse para reconocer al usuario y personalizar la experiencia.' }),
      ],
    },
    {
      id: 'types-of-cookies',
      title: t('sections.cookies.typesOfCookies.title', { defaultValue: '¿QUÉ TIPOS DE COOKIES UTILIZAMOS?' }),
      paragraphs: [
        t('sections.cookies.typesOfCookies.p1', { defaultValue: 'En este sitio web solo utilizamos los siguientes tipos de cookies:' }),
      ],
      bullets: [
        t('sections.cookies.typesOfCookies.bullet1', { defaultValue: 'Cookies técnicas (necesarias): Son imprescindibles para el funcionamiento básico de la web. No requieren consentimiento del usuario.' }),
        t('sections.cookies.typesOfCookies.bullet2', { defaultValue: 'Cookies analíticas: Permiten recopilar información estadística anónima sobre el uso del sitio web. Estas cookies requieren el consentimiento previo del usuario.' }),
      ],
    },
    {
      id: 'cookies-list',
      title: t('sections.cookies.cookiesList.title', { defaultValue: 'LISTADO DE COOKIES UTILIZADAS' }),
      paragraphs: [
        t('sections.cookies.cookiesList.p1', { defaultValue: 'A continuación se detallan las cookies utilizadas en este sitio:' }),
      ],
      bullets: [
        t('sections.cookies.cookiesList.bullet1', { defaultValue: '__next_hmr_refresh_hash__ (Técnica): Refrescar el contenido dinámico de la web. Duración: Sesión. Proveedor: Ordinaly (local)' }),
        t('sections.cookies.cookiesList.bullet2', { defaultValue: 'NEXT_LOCALE (Técnica): Almacena el idioma seleccionado. Duración: Sesión. Proveedor: Ordinaly (local)' }),
        t('sections.cookies.cookiesList.bullet3', { defaultValue: '_ga (Analítica): Google Analytics para análisis de uso web. Duración: Sesión. Proveedor: Google Inc.' }),
      ],
    },
    {
      id: 'local-storage',
      title: t('sections.cookies.localStorage.title', { defaultValue: 'ALMACENAMIENTO LOCAL DEL NAVEGADOR (LocalStorage)' }),
      paragraphs: [
        t('sections.cookies.localStorage.p1', { defaultValue: 'Además de cookies, este sitio web puede almacenar información en el navegador del usuario mediante almacenamiento local (localStorage), que se comporta de forma similar a las cookies, pero sin fecha de expiración automática. Elementos almacenados:' }),
        t('sections.cookies.localStorage.p2', { defaultValue: 'Estos datos no se comparten con terceros y se utilizan exclusivamente para mejorar la experiencia de usuario.' }),
      ],
      bullets: [
        t('sections.cookies.localStorage.bullet1', { defaultValue: 'theme: Guarda el modo visual del sitio (claro u oscuro)' }),
        t('sections.cookies.localStorage.bullet2', { defaultValue: 'cookie-preferences: Almacena las preferencias del usuario sobre el uso de cookies' }),
        t('sections.cookies.localStorage.bullet3', { defaultValue: 'cookie-consent: Indica si el usuario ha aceptado el uso de cookies' }),
        t('sections.cookies.localStorage.bullet4', { defaultValue: 'authToken: Token de autenticación del usuario registrado' }),
      ],
    },
    {
      id: 'cookie-management',
      title: t('sections.cookies.cookieManagement.title', { defaultValue: 'GESTIÓN DE COOKIES' }),
      paragraphs: [
        t('sections.cookies.cookieManagement.p1', { defaultValue: 'El sitio muestra un banner de gestión de cookies al acceder por primera vez. Desde él, el usuario puede aceptar, rechazar o configurar las cookies no necesarias. También puede eliminar o bloquear las cookies desde su navegador:' }),
      ],
      bullets: [
        t('sections.cookies.cookieManagement.bullet1', { defaultValue: 'Google Chrome: https://support.google.com/chrome/answer/95647?hl=es' }),
        t('sections.cookies.cookieManagement.bullet2', { defaultValue: 'Mozilla Firefox' }),
        t('sections.cookies.cookieManagement.bullet3', { defaultValue: 'Safari: https://support.apple.com/es-es/guide/safari/sfri11471/mac' }),
        t('sections.cookies.cookieManagement.bullet4', { defaultValue: 'Microsoft Edge' }),
      ],
    },
    {
      id: 'international-transfer',
      title: t('sections.cookies.internationalTransfer.title', { defaultValue: 'TRANSFERENCIA INTERNACIONAL DE DATOS' }),
      paragraphs: [
        t('sections.cookies.internationalTransfer.p1', { defaultValue: 'Algunas cookies analíticas, como las de Google Analytics, pueden implicar la transferencia de datos a servidores fuera del Espacio Económico Europeo (por ejemplo, EE. UU.). Estas transferencias están reguladas mediante cláusulas contractuales tipo aprobadas por la Comisión Europea.' }),
      ],
    },
    {
      id: 'policy-modification',
      title: t('sections.cookies.policyModification.title', { defaultValue: 'MODIFICACIÓN DE LA POLÍTICA DE COOKIES' }),
      paragraphs: [
        t('sections.cookies.policyModification.p1', { defaultValue: 'Ordinaly Software S.L. podrá actualizar esta Política de Cookies en función de exigencias normativas, técnicas o por cambios en la configuración de cookies del sitio web. Cualquier cambio relevante será comunicado al usuario.' }),
      ],
    },
  ],
});

const getLicenseContent = (t: any): DocumentContent => ({
  title: t('sections.license.title', { defaultValue: 'Información de Licencia' }),
  sections: [
    {
      id: 'purpose',
      title: t('sections.license.purpose.title', { defaultValue: 'OBJETO' }),
      paragraphs: [
        t('sections.license.purpose.p1', { defaultValue: 'El presente documento regula los términos de uso aplicables a los entregables desarrollados por Ordinaly Software S.L., incluyendo pero no limitándose a:' }),
      ],
      bullets: [
        t('sections.license.purpose.bullet1', { defaultValue: 'Código fuente' }),
        t('sections.license.purpose.bullet2', { defaultValue: 'Interfaces visuales y dashboards' }),
        t('sections.license.purpose.bullet3', { defaultValue: 'Imágenes, ilustraciones, y contenido gráfico' }),
        t('sections.license.purpose.bullet4', { defaultValue: 'Documentación técnica o formativa' }),
        t('sections.license.purpose.bullet5', { defaultValue: 'Archivos de configuración, scripts y plantillas' }),
      ],
    },
    {
      id: 'scope',
      title: t('sections.license.scope.title', { defaultValue: 'ALCANCE DE LA LICENCIA' }),
      paragraphs: [
        t('sections.license.scope.p1', { defaultValue: 'Ordinaly Software S.L. concede al cliente una licencia no exclusiva con los siguientes derechos:' }),
      ],
      bullets: [
        t('sections.license.scope.bullet1', { defaultValue: 'Derecho de uso: el cliente podrá utilizar los entregables en el marco de su actividad profesional o empresarial.' }),
        t('sections.license.scope.bullet2', { defaultValue: 'Derecho de modificación: el cliente podrá personalizar, adaptar o modificar el código y otros elementos entregados.' }),
      ],
    },
    {
      id: 'validity',
      title: t('sections.license.validity.title', { defaultValue: 'VIGENCIA DE LA LICENCIA' }),
      paragraphs: [
        t('sections.license.validity.p1', { defaultValue: 'La vigencia de la licencia dependerá del tipo de servicio contratado:' }),
        t('sections.license.validity.p2', { defaultValue: 'Entregables con suscripción activa (por ejemplo, chatbots, webs alojadas, flujos en mantenimiento): La licencia es válida mientras la suscripción esté vigente y al día. Si el cliente deja de pagar o cancela, la licencia quedará automáticamente revocada.' }),
        t('sections.license.validity.p3', { defaultValue: 'Entregables cerrados (por ejemplo, diseño web o app sin mantenimiento ni alojamiento): La licencia será indefinida, siempre que el proyecto haya sido completamente entregado y pagado.' }),
      ],
    },
    {
      id: 'restrictions',
      title: t('sections.license.restrictions.title', { defaultValue: 'RESTRICCIONES' }),
      paragraphs: [
        t('sections.license.restrictions.p1', { defaultValue: 'El cliente se compromete a no realizar las siguientes acciones sin autorización expresa de Ordinaly Software S.L.:' }),
      ],
      bullets: [
        t('sections.license.restrictions.bullet1', { defaultValue: 'Eliminar o alterar marcas, logotipos, metadatos o notas de propiedad intelectual' }),
        t('sections.license.restrictions.bullet2', { defaultValue: 'Usar el producto para fines ilegales o contrarios a la normativa vigente' }),
        t('sections.license.restrictions.bullet3', { defaultValue: 'Compartir, sublicenciar o transferir total o parcialmente el desarrollo a terceros' }),
      ],
    },
    {
      id: 'third-party-software',
      title: t('sections.license.thirdPartySoftware.title', { defaultValue: 'INCLUSIÓN DE SOFTWARE DE TERCEROS' }),
      paragraphs: [
        t('sections.license.thirdPartySoftware.p1', { defaultValue: 'Los entregables desarrollados por Ordinaly pueden incorporar componentes de terceros, incluyendo APIs, bibliotecas o sistemas integrados de:' }),
      ],
      bullets: [
        t('sections.license.thirdPartySoftware.bullet1', { defaultValue: 'Meta' }),
        t('sections.license.thirdPartySoftware.bullet2', { defaultValue: 'WhatsApp Business API' }),
        t('sections.license.thirdPartySoftware.bullet3', { defaultValue: 'Gemini (Google)' }),
        t('sections.license.thirdPartySoftware.bullet4', { defaultValue: 'Stripe' }),
        t('sections.license.thirdPartySoftware.bullet5', { defaultValue: 'Google Analytics' }),
        t('sections.license.thirdPartySoftware.bullet6', { defaultValue: 'Otras plataformas conectadas' }),
      ],
    },
    {
      id: 'intellectual-property',
      title: t('sections.license.intellectualProperty.title', { defaultValue: 'PROPIEDAD INTELECTUAL' }),
      paragraphs: [
        t('sections.license.intellectualProperty.p1', { defaultValue: 'Todos los derechos de propiedad intelectual sobre los entregables, incluyendo los derechos morales y patrimoniales, son titularidad de Ordinaly Software S.L., salvo que se indique lo contrario mediante acuerdo contractual específico.' }),
        t('sections.license.intellectualProperty.p2', { defaultValue: 'El cliente obtiene una licencia de uso bajo las condiciones expuestas, sin que ello suponga una cesión de titularidad.' }),
      ],
    },
    {
      id: 'applicable-law',
      title: t('sections.license.applicableLaw.title', { defaultValue: 'LEGISLACIÓN APLICABLE Y JURISDICCIÓN' }),
      paragraphs: [
        t('sections.license.applicableLaw.p1', { defaultValue: 'La presente Licencia se regirá por la legislación española. En caso de conflicto, las partes se someterán a los Juzgados y Tribunales de Sevilla (España), salvo en los casos en los que la normativa de protección al consumidor disponga otra jurisdicción.' }),
      ],
    },
  ],
});

const LegalPage = () => {
  const t = useTranslations("legal");
  const tCommon = useTranslations("common");
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [activeTab, setActiveTab] = useState<LegalTab>("terms");
  const [isDark, setIsDark] = useState(false);
  
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      const raw = localStorage.getItem('cookie-preferences');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!parsed.analytics;
    } catch {
      return false;
    }
  });

  const searchParams = useSearchParams();
  
  useEffect(() => {
    const tab = searchParams?.get("tab") as LegalTab | null;
    if (tab && ["terms", "privacy", "cookies", "license"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Listen to cookie preferences changes
  useEffect(() => {
    const onPrefs = (e: Event) => {
      try {
        // @ts-ignore
        const detail = e?.detail;
        if (detail && typeof detail === 'object') {
          setAnalyticsEnabled(!!detail.analytics);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('cookie-preferences-changed', onPrefs as EventListener);
    return () => window.removeEventListener('cookie-preferences-changed', onPrefs as EventListener);
  }, []);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ordinaly.duckdns.org';
      const response = await fetch(`${apiUrl}/api/terms/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(Array.isArray(data) ? data : []);
      } else {
        setAlert({type: 'error', message: t('messages.fetchError')});
      }
    } catch {
      setAlert({type: 'error', message: t('messages.networkError')});
    } finally {
      setIsLoading(false);
    }
  }, [t]);
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const downloadPDF = (doc: LegalDocument) => {
    if (!doc.pdf_content) {
      setAlert({type: 'warning', message: t('messages.noPdfAvailable')});
      return;
    }
    window.open(doc.pdf_content, '_blank');
  };

  const getDocumentsByTag = (tag: string) => {
    return documents.filter(doc => doc.tag === tag);
  };

  const tabs = useMemo(
    () => [
      { id: 'terms' as LegalTab, label: t('tabs.terms'), icon: FileText },
      { id: 'privacy' as LegalTab, label: t('tabs.privacy'), icon: FileText },
      { id: 'cookies' as LegalTab, label: t('tabs.cookies'), icon: Sparkles },
      { id: 'license' as LegalTab, label: t('tabs.license'), icon: FileText },
    ],
    [t]
  );

  const tabButtonClass = (id: LegalTab) => {
    const base = "group inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition-all";
    if (activeTab === id) {
      return isDark
        ? `${base} border-[#22A60D]/60 bg-[#22A60D]/15 text-white shadow-[0_10px_30px_rgba(34,166,13,0.2)]`
        : `${base} border-[#22A60D]/60 bg-[#22A60D]/15 text-[#22A60D] shadow-[0_8px_20px_rgba(34,166,13,0.12)]`;
    }
    return isDark
      ? `${base} border-white/10 bg-white/5 text-gray-200 hover:border-[#22A60D]/30 hover:bg-[#22A60D]/10 hover:text-white`
      : `${base} border-gray-200 bg-white text-gray-700 hover:border-[#22A60D]/30 hover:bg-[#22A60D]/5 hover:text-[#22A60D]`;
  };

  const rootClass = isDark
    ? "relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#0d2036] to-[#0f2947] text-slate-50"
    : "relative min-h-screen overflow-hidden bg-gray-50 text-slate-900";

  const overlaySet = isDark
    ? (
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,166,13,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(34,166,13,0.08),transparent_25%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_35%,transparent_70%)]" />
        </div>
      )
    : null;

  const panelClass = isDark
    ? "rounded-3xl border border-white/10 bg-white/5 px-6 py-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-10"
    : "rounded-3xl border border-gray-200 bg-white px-6 py-8 shadow-sm sm:px-10";

  const cardClass = (extra = "") =>
    isDark ? `border-white/10 bg-white/5 backdrop-blur-md ${extra}` : `border-gray-200 bg-white ${extra}`;

  const activeDocuments = getDocumentsByTag(activeTab);
  const activeDoc = activeDocuments.length > 0 ? activeDocuments[0] : null;
  
  // Get static content for terms/privacy/cookies/license or use API content for other tabs
  const contentData = activeTab === 'terms' 
    ? getTermsContent(t)
    : activeTab === 'privacy'
    ? getPrivacyContent(t)
    : activeTab === 'cookies'
    ? getCookiesContent(t)
    : activeTab === 'license'
    ? getLicenseContent(t)
    : null;

  if (isLoading) {
    return (
      <div className={rootClass}>
        {overlaySet}
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-20 pt-24 md:px-6 lg:px-8 lg:pt-28">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22A60D]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={5000}
        />
      )}

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-20 pt-10 md:px-6 lg:px-8 lg:pt-18">
        {/* Header Panel */}
        <div className={panelClass}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.32em] text-[#22A60D]" : "text-xs font-semibold uppercase tracking-[0.32em] text-[#22A60D]"}>
                Ordinaly Software S.L
              </p>
              <h1 className={isDark ? "text-4xl font-black leading-tight text-white md:text-5xl" : "text-4xl font-black leading-tight text-slate-900 md:text-5xl"}>
                {t('title')}
              </h1>
              <p className={isDark ? "max-w-3xl text-base text-slate-200 md:text-lg" : "max-w-3xl text-base text-slate-700 md:text-lg"}>
                {t('description')}
              </p>
            </div>
            <Link href="/" className="self-start lg:self-center">
              <Button className="bg-[#22A60D] text-white shadow-[0_15px_40px_rgba(34,166,13,0.35)] hover:shadow-[0_20px_50px_rgba(34,166,13,0.4)] hover:bg-[#1a7d09] normal-case not-italic font-semibold tracking-tight">
                <ExternalLink className="mr-2 h-4 w-4" />
                {tCommon('backToHome')}
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={tabButtonClass(tab.id)}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Download Card */}
          {activeDoc && activeDoc.pdf_content && (
            <Card className={cardClass("flex flex-col")}>
              <CardContent className={`flex flex-col p-6 md:p-7 ${isDark ? "" : "text-slate-800"}`}>
                <div className="flex items-center gap-3">
                  <Download className={isDark ? "h-5 w-5 text-[#22A60D]" : "h-5 w-5 text-[#22A60D]"} />
                  <div>
                    <p className={isDark ? "text-sm font-semibold uppercase tracking-[0.2em] text-[#22A60D]" : "text-sm font-semibold uppercase tracking-[0.2em] text-[#22A60D]"}>
                      {t('downloadPdf')}
                    </p>
                    <h3 className={isDark ? "text-xl font-bold text-white" : "text-xl font-bold text-slate-900"}>
                      {activeDoc.name} v{activeDoc.version}
                    </h3>
                  </div>
                </div>
                <p className={`${isDark ? "text-slate-100/85 text-sm" : "text-slate-700 text-sm"} mt-4 mb-4 flex-grow`}>
                  {t('downloadDesc')}
                </p>
                <Button
                  onClick={() => downloadPDF(activeDoc)}
                  className="w-full bg-[#22A60D] text-white shadow-[0_15px_40px_rgba(34,166,13,0.35)] hover:shadow-[0_18px_46px_rgba(34,166,13,0.4)] hover:bg-[#1a7d09] normal-case not-italic font-semibold tracking-tight mt-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t('downloadPdf')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Cookie Settings Card */}
          <Card className={cardClass("flex flex-col")}>
            <CardContent className={`flex flex-col p-6 md:p-7 ${isDark ? "" : "text-slate-800"}`}>
              <div className="flex items-center gap-3">
                  <Sparkles className={isDark ? "h-5 w-5 text-[#22A60D]" : "h-5 w-5 text-[#22A60D]"} />
                  <div>
                  <p className={isDark ? "text-sm font-semibold uppercase tracking-[0.2em] text-[#22A60D]" : "text-sm font-semibold uppercase tracking-[0.2em] text-[#22A60D]"}>
                      {t('tabs.cookies')}
                  </p>
                  <h3 className={isDark ? "text-xl font-bold text-white" : "text-xl font-bold text-slate-900"}>
                        {t('cookieManage', {defaultValue: 'Manage Cookies'})}
                  </h3>
                </div>
              </div>
              <p className={`${isDark ? "text-slate-100/85 text-sm" : "text-slate-700 text-sm"} mt-4 mb-4 flex-grow`}>
                {t('cookieDesc', {defaultValue: 'Toggle analytics cookies on this page.'})}
              </p>
              <Button
                onClick={() => {
                  try {
                    localStorage.removeItem('cookie-consent');
                    window.location.reload();
                  } catch (err) {
                    // ignore
                  }
                }}
                className="w-full bg-[#22A60D] text-white shadow-[0_15px_40px_rgba(34,166,13,0.35)] hover:shadow-[0_18px_46px_rgba(34,166,13,0.4)] hover:bg-[#1a7d09] normal-case not-italic font-semibold tracking-tight mt-auto"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t('openCookieSettings', {defaultValue: 'Open Cookie Settings'})}
              </Button>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className={cardClass("flex flex-col")}>
            <CardContent className={`flex flex-col p-6 md:p-7 ${isDark ? "" : "text-slate-800"}`}>
              <div className="flex items-center gap-3">
                <Mail className={isDark ? "h-5 w-5 text-[#22A60D]" : "h-5 w-5 text-[#22A60D]"} />
                <div>
                  <p className={isDark ? "text-sm font-semibold uppercase tracking-[0.2em] text-[#22A60D]" : "text-sm font-semibold uppercase tracking-[0.2em] text-[#22A60D]"}>
                    {t('supportKicker', {defaultValue: 'Need Help?'})}
                  </p>
                  <h3 className={isDark ? "text-xl font-bold text-white" : "text-xl font-bold text-slate-900"}>
                    {t('supportTitle', {defaultValue: 'Contact Support'})}
                  </h3>
                </div>
              </div>
              <p className={`${isDark ? "text-slate-100/85 text-sm" : "text-slate-700 text-sm"} mt-4 mb-4 flex-grow`}>
                {t('supportDesc', {defaultValue: 'Have questions about our legal documents?'})}
              </p>
              <Button
                asChild
                className="w-full bg-[#22A60D] text-white shadow-[0_15px_40px_rgba(34,166,13,0.35)] hover:shadow-[0_18px_46px_rgba(34,166,13,0.4)] hover:bg-[#1a7d09] normal-case not-italic font-semibold tracking-tight mt-auto"
              >
                <a href="mailto:compliance@ordinaly.ai">{t('contactCta', {defaultValue: 'Contact Us'})}</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className={cardClass()}>
          <CardContent className={`space-y-6 p-6 md:p-8 ${isDark ? "" : "text-slate-900"}`}>
            {contentData || activeDoc ? (
              <>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className={`${isDark ? "text-2xl font-black text-white md:text-3xl" : "text-2xl font-black text-slate-900 md:text-3xl"}`}>
                      {contentData?.title || activeDoc?.name}
                    </h2>
                  </div>
                  <div className={isDark ? "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200" : "flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"}>
                    <Calendar className={isDark ? "h-4 w-4 text-[#22A60D]" : "h-4 w-4 text-[#22A60D]"} />
                    {activeDoc ? new Date(activeDoc.updated_at).toLocaleDateString() : new Date().toLocaleDateString()}
                  </div>
                </div>

                {/* Content Sections */}
                {contentData ? (
                  <div className="space-y-8">
                    {contentData.sections.map((section) => (
                      <div key={section.id} className={isDark ? "space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6" : "space-y-3 rounded-2xl border border-gray-200 bg-white p-6"}>
                        <h3 className={isDark ? "text-lg font-bold text-white" : "text-lg font-bold text-slate-900"}>
                          {section.title}
                        </h3>
                        <div className={isDark ? "space-y-3 text-slate-100/85" : "space-y-3 text-slate-700"}>
                          {section.paragraphs.map((paragraph, idx) => (
                            <p key={idx} className="leading-relaxed">
                              {paragraph}
                            </p>
                          ))}
                          {section.bullets && section.bullets.length > 0 && (
                            <ul className={isDark ? "list-disc space-y-2 pl-5 text-slate-100/80" : "list-disc space-y-2 pl-5 text-slate-700"}>
                              {section.bullets.map((bullet, idx) => (
                                <li key={idx} className="leading-relaxed">
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className={isDark ? "text-base text-slate-100/90" : "text-base text-slate-700"}>{activeDoc?.content}</p>

                    {/* PDF Preview */}
                    {activeDoc?.pdf_content && (
                      <div className="rounded-2xl overflow-hidden border border-white/10">
                        <object
                          data={activeDoc.pdf_content}
                          type="application/pdf"
                          className="w-full h-80 sm:h-[40rem] md:h-[48rem]"
                        >
                          <p className={isDark ? "text-slate-200 p-4" : "text-slate-700 p-4"}>{t('messages.noPdfAvailable')}</p>
                        </object>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className={isDark ? "w-12 h-12 text-gray-400 mx-auto mb-4" : "w-12 h-12 text-gray-400 mx-auto mb-4"} />
                <p className={isDark ? "text-slate-200" : "text-slate-700"}>
                  {t('sections.' + activeTab + '.noDocuments')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Documents Grid - Optional alternative view */}
        {activeDocuments.length > 1 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeDocuments.map((doc) => (
              <Card key={doc.id} className={cardClass()}>
                <CardContent className={`space-y-3 p-4 md:p-5 ${isDark ? "" : "text-slate-800"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={isDark ? "text-xs uppercase tracking-[0.2em] text-[#22A60D]" : "text-xs uppercase tracking-[0.2em] text-[#22A60D]"}>
                        v{doc.version}
                      </p>
                      <h4 className={isDark ? "font-bold text-white" : "font-bold text-slate-900"}>
                        {doc.name}
                      </h4>
                    </div>
                    <Tag className={isDark ? "h-4 w-4 text-slate-400" : "h-4 w-4 text-slate-400"} />
                  </div>
                  <p className={isDark ? "text-xs text-slate-300" : "text-xs text-slate-600"}>
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </p>
                  {doc.pdf_content && (
                    <Button
                      onClick={() => downloadPDF(doc)}
                      size="sm"
                      className="w-full bg-[#22A60D] text-white hover:bg-[#1a7d09]"
                    >
                      <Download className="mr-2 h-3 w-3" />
                      {t('downloadPdf')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default LegalPage;
