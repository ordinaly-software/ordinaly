"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCookiePreferences } from '@/utils/cookieManager';

interface ThemeContextType {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [functionalAllowed, setFunctionalAllowed] = useState(false);

  const [mounted, setMounted] = useState(false);

  const getFunctionalConsent = () => {
    try {
      const preferences = getCookiePreferences();
      return Boolean(preferences?.functional);
    } catch {
      return false;
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
    setMounted(true);
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

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
    applyTheme(dark, functionalAllowed);
  };

  const toggleTheme = () => {
    setTheme(!isDark);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

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
