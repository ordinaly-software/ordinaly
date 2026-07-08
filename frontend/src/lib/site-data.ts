import { getApiEndpoint } from "@/lib/api-config";
import type { Service } from "@/hooks/useServices";
import type { Course } from "@/hooks/useCourses";

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

export async function getSiteServices(): Promise<Service[]> {
  const data = await fetchJson<unknown>(getApiEndpoint("/api/services/"));
  return extractItems<Service>(data).filter((service) => !service.draft);
}

export async function getSiteCourses(): Promise<Course[]> {
  const data = await fetchJson<unknown>(getApiEndpoint("/api/courses/courses/"));
  return extractItems<Course>(data).filter((course) => !course.draft);
}
