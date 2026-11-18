import { getWhatsAppUrl } from "@/utils/whatsapp";

const COURSE_TITLE_CLEANUP_REGEX = /🌐 |🐍 |📊 |📱 |☁️ |🎨 |🤖 |🔒 |🔗 |💻 |📈 |🔧 /g;
const DEFAULT_SITE_URL = "https://ordinaly.ai";

type CourseReference = {
  title: string;
  slug?: string | number | null;
  id?: number | string | null;
};

type TranslationFn = (key: string, vars?: Record<string, string | number | Date>) => string;

export function cleanCourseTitle(title: string) {
  if (!title) return "";
  const trimmed = title.replace(COURSE_TITLE_CLEANUP_REGEX, "").trim();
  return trimmed || title;
}

export function buildCourseLink(course: CourseReference, origin?: string) {
  const baseUrl = (origin || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
  const identifier = course.slug || course.id;
  if (!identifier) return `${baseUrl}/formacion`;
  return `${baseUrl}/formacion/${encodeURIComponent(String(identifier))}`;
}

/** WhatsApp link and email draft asking for a new edition of a past course. */
export function getPastCourseContact(course: CourseReference, t: TranslationFn) {
  const cleanTitle = cleanCourseTitle(course.title);
  const message = t("pastCourseMessage", { course: cleanTitle, link: buildCourseLink(course) });
  return {
    whatsappHref: getWhatsAppUrl(message),
    email: { subject: t("pastCourseEmailSubject", { course: cleanTitle }), body: message },
  };
}
