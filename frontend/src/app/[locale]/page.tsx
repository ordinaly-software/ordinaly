import type { Metadata } from "next";
import HomePage from "./page.client";
import LoadingPage from "./loading";
import { createPageMetadata } from "@/lib/metadata";
import { getApiEndpoint } from "@/lib/api-config";
import type { Service } from "@/hooks/useServices";
import type { Course } from "@/hooks/useCourses";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");

  const base = createPageMetadata({
    locale,
    path: "/",
    title: isEs
      ? "Automatización IA Sevilla | Chatbots y Agentes IA para Empresas | Ordinaly Software"
      : "AI Automation Seville | Chatbots and AI Agents for Business | Ordinaly Software",
    description: isEs
      ? "Agencia especializada en automatización IA en Sevilla: chatbots empresariales, agentes IA, n8n automation, WhatsApp CRM y formación IA para PYMES. Primeros resultados en 2-4 semanas."
      : "AI automation agency in Seville: business chatbots, AI agents, n8n automation, WhatsApp CRM and AI training for SMEs. First results in 2-4 weeks.",
    image: "/og-image.png",
  });
  return {
    ...base,
    keywords: isEs
      ? ["automatización IA Sevilla", "agentes IA empresas", "chatbots empresas", "formación IA Sevilla", "n8n automatización", "WhatsApp CRM IA", "agencia automatización Sevilla", "inteligencia artificial PYMES"]
      : ["AI automation Seville", "AI agents business", "business chatbots", "AI training Seville", "n8n automation", "WhatsApp CRM AI"],
  };
}

export const revalidate = 3600; // ISR: revalidate home every hour

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
};

const extractItems = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results?: unknown }).results;
    if (Array.isArray(results)) return results as T[];
  }
  return [];
};

const getInitialServices = unstable_cache(
  async (): Promise<Service[]> => {
    const data = await fetchJson<unknown>(getApiEndpoint("/api/services/"));
    const items = extractItems<Service>(data);
    return items.filter((service) => !service.draft).slice(0, 6);
  },
  ["home-services"],
  { revalidate: 3600 },
);

const getInitialCourses = unstable_cache(
  async (): Promise<Course[]> => {
    const data = await fetchJson<unknown>(getApiEndpoint("/api/courses/courses/"));
    const items = extractItems<Course>(data);
    const now = new Date();
    const upcoming = items.filter((course) => {
      if (course.draft) return false;
      const startDate = Date.parse(course.start_date);
      return !Number.isNaN(startDate) && startDate >= now.getTime();
    });
    const getSortTime = (course: Course) => {
      const createdAt = Date.parse(course.created_at);
      if (!Number.isNaN(createdAt)) return createdAt;
      const startAt = Date.parse(course.start_date);
      if (!Number.isNaN(startAt)) return startAt;
      return 0;
    };
    return upcoming.sort((a, b) => getSortTime(b) - getSortTime(a)).slice(0, 3);
  },
  ["home-courses"],
  { revalidate: 3600 },
);

export default async function Home({
  //params,
}: {
  params: Promise<{ locale: string }>;
}) {
  //const { locale } = await params;
  const renderedAt = Date.now();
  const initialServicesPromise = getInitialServices();
  const initialCoursesPromise = getInitialCourses();

  return (
    <>
      <Suspense fallback={<LoadingPage />}>
        <HomeContent
          renderedAt={renderedAt}
          initialServicesPromise={initialServicesPromise}
          initialCoursesPromise={initialCoursesPromise}
        />
      </Suspense>
    </>
  );
}

type HomeContentProps = {
  renderedAt: number;
  initialServicesPromise: Promise<Service[]>;
  initialCoursesPromise: Promise<Course[]>;
};

async function HomeContent({
  renderedAt,
  initialServicesPromise,
  initialCoursesPromise,
}: HomeContentProps) {
  const [initialServices, initialCourses] = await Promise.all([
    initialServicesPromise,
    initialCoursesPromise,
  ]);

  return (
    <HomePage
      renderedAt={renderedAt}
      initialServices={initialServices}
      initialCourses={initialCourses}
    />
  );
}
