"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { isFunctionalAllowed } from '@/utils/cookie-manager';

interface ThemeContextType {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [functionalAllowed, setFunctionalAllowed] = useState(false);

  const getFunctionalConsent = () => {
    try {
      return isFunctionalAllowed();
    } catch {
      return true;
    }
  };

  const resolvePreferredTheme = (allowPersistence: boolean) => {
    if (typeof window === 'undefined') return false;

    if (allowPersistence) {
      try {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") return true;
        if (savedTheme === "light") return false;
      } catch {
        // Ignore storage failures
      }
    }

    return false;
  };

  const applyTheme = (dark: boolean, shouldPersist: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    try {
      if (shouldPersist) {
        localStorage.setItem("theme", dark ? "dark" : "light");
      } else {
        localStorage.removeItem("theme");
      }
    } catch {
      // Ignore storage failures (likely blocked by user settings)
    }
  };

  useEffect(() => {
    // Initialize theme from storage when allowed, otherwise default to light.
    const allowPersistence = getFunctionalConsent();
    setFunctionalAllowed(allowPersistence);
    const shouldBeDark = resolvePreferredTheme(allowPersistence);
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark, allowPersistence);
  }, []);

  // Handle theme changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cookie-preferences') {
        const allowPersistence = getFunctionalConsent();
        setFunctionalAllowed(allowPersistence);
        const shouldBeDark = resolvePreferredTheme(allowPersistence);
        setIsDark(shouldBeDark);
        applyTheme(shouldBeDark, allowPersistence);
        return;
      }

      if (functionalAllowed && e.key === 'theme') {
        const shouldBeDark = e.newValue === 'dark';
        setIsDark(shouldBeDark);
        applyTheme(shouldBeDark, true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [functionalAllowed]);

  // glisse reads data-theme, while the site toggles the "dark" class from several places;
  // mirror the class so glisse components follow the site theme instead of the OS one.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => root.setAttribute("data-theme", root.classList.contains("dark") ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
    applyTheme(dark, functionalAllowed);
  };

  const toggleTheme = () => {
    setTheme(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark: setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
