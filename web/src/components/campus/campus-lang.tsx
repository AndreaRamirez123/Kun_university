"use client";

import { useLocale } from "@/i18n/locale-context";

/**
 * ES/EN dentro de las ventanas del campus. En celular el selector flotante del
 * sitio se oculta mientras hay una ventana abierta (taparía su contenido), así
 * que cada ventana trae el suyo; en escritorio sigue el flotante y este no se ve.
 */
export function CampusLang({ tone = "dark", className = "", desktop = false }: { tone?: "dark" | "light"; className?: string; /** También en escritorio (salas, donde se oculta el flotante). */ desktop?: boolean }) {
  const { locale, setLocale } = useLocale();
  const light = tone === "light";
  return (
    <div
      role="group"
      aria-label="Idioma / Language"
      className={`flex shrink-0 items-center gap-0.5 rounded-full p-0.5 ${desktop ? "" : "md:hidden"} ${light ? "bg-[#24123F]/10" : "border border-white/20 bg-black/30"} ${className}`}
    >
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={locale === l}
          onClick={() => setLocale(l)}
          className={`h-8 cursor-pointer rounded-full px-2.5 text-[11px] font-bold transition ${
            locale === l ? (light ? "bg-[#24123F] text-white" : "bg-white text-[#10182B]") : light ? "text-[#24123F]/60" : "text-white/65"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
