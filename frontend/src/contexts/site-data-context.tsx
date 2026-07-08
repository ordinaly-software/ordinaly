"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Service } from "@/hooks/useServices";
import type { Course } from "@/hooks/useCourses";

interface SiteData {
  services: Service[];
  courses: Course[];
}

const SiteDataContext = createContext<SiteData>({ services: [], courses: [] });

export function SiteDataProvider({
  services,
  courses,
  children,
}: SiteData & { children: ReactNode }) {
  return (
    <SiteDataContext.Provider value={{ services, courses }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData(): SiteData {
  return useContext(SiteDataContext);
}
