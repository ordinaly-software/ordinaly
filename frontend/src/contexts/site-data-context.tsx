"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Course } from "@/hooks/useCourses";

interface SiteData {
  courses: Course[];
}

const SiteDataContext = createContext<SiteData>({ courses: [] });

export function SiteDataProvider({
  courses,
  children,
}: SiteData & { children: ReactNode }) {
  return (
    <SiteDataContext.Provider value={{ courses }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData(): SiteData {
  return useContext(SiteDataContext);
}
