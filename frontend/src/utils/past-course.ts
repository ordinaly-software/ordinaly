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

export function buildCourseLink(course: CourseReference) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, "");
  const identifier = course.slug ?? course.id;
  if (!identifier) return baseUrl;
  return `${baseUrl}/formation/${identifier}`;
}

export function openPastCourseWhatsApp(course: CourseReference, t: TranslationFn, translationKey = "pastCourseMessage") {
  if (typeof window === "undefined") return;
  const cleanTitle = cleanCourseTitle(course.title);
  const courseLink = buildCourseLink(course);
  const message = t(translationKey, {
    course: cleanTitle,
    link: courseLink,
  });
  const whatsappUrl = getWhatsAppUrl(message);
  if (!whatsappUrl) return;
  window.open(whatsappUrl, "_blank");
}
