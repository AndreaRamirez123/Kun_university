"use client";

import { useLocale } from "@/i18n/locale-context";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="fixed right-5 bottom-5 z-50 flex items-center gap-0.5 rounded-full bg-[#10182B] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)] max-md:bottom-20">
      <button
        type="button"
        onClick={() => setLocale("es")}
        aria-pressed={locale === "es"}
        className={`rounded-full px-3 py-2 text-xs font-bold transition ${
          locale === "es" ? "bg-white text-[#10182B]" : "text-white/60 hover:text-white"
        }`}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`rounded-full px-3 py-2 text-xs font-bold transition ${
          locale === "en" ? "bg-white text-[#10182B]" : "text-white/60 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}
