"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

export type Locale = "es" | "en";
export type Dict<T> = Record<Locale, T>;

const STORAGE_KEY = "kun-locale";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es") return stored;
  } catch {
    // localStorage can be unavailable (private mode); fall through to default.
  }
  return "es";
}

function getServerSnapshot(): Locale {
  return "es";
}

const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void } | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Reads the persisted choice without causing a hydration mismatch: SSR/first
  // paint always uses "es", then React itself reconciles to the stored value.
  const storedLocale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [override, setOverride] = useState<Locale | null>(null);
  const locale = override ?? storedLocale;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(next: Locale) {
    setOverride(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore write failures; locale still updates for this session via `override`.
    }
  }

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}

// Co-locates an { es, en } dictionary next to the component that uses it and
// picks the active locale's half, instead of one global translations file.
export function usePick<T>(dict: Dict<T>): T {
  const { locale } = useLocale();
  return dict[locale];
}
