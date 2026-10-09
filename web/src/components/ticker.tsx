"use client";

import { usePick } from "@/i18n/locale-context";

const COPY = {
  es: {
    items: [
      "Escuela de Ingeniería",
      "Transformación de Negocios",
      "Bienestar y Desarrollo Humano",
      "Diseño y Tecnologías de Comunicación",
      "Educación Superior IA-Native",
      "Florida",
      "100% Online / Global",
    ],
  },
  en: {
    items: [
      "School of Engineering",
      "Business Transformation",
      "Wellness and Human Development",
      "Design and Communication Technologies",
      "AI-Native Higher Education",
      "Florida",
      "100% Online / Global",
    ],
  },
};

function TickerGroup({ items }: { items: string[] }) {
  return (
    <span className="flex items-center">
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span
            className="small-caps px-4.5 text-xs font-bold tracking-[0.14em] text-navy"
            style={{ textShadow: "0 1px 1px rgba(255,255,255,0.8)" }}
          >
            {item}
          </span>
          <span className="h-1.25 w-1.25 shrink-0 rounded-full bg-navy/50" />
        </span>
      ))}
    </span>
  );
}

export function Ticker() {
  const t = usePick(COPY);
  return (
    <div
      className="mask-fade-x relative z-10 overflow-hidden border-y border-white/60 py-4 whitespace-nowrap backdrop-blur-md backdrop-saturate-200"
      style={{
        background:
          "radial-gradient(140% 220% at 50% -60%, rgba(255,255,255,0.9), rgba(255,255,255,0.35) 35%, transparent 60%), rgba(120,190,255,0.55)",
        boxShadow:
          "inset 0 2px 1px rgba(255,255,255,0.8), inset 0 -6px 12px rgba(3,62,140,0.2), 0 16px 36px rgba(3,62,140,0.28)",
      }}
    >
      <div className="animate-marquee flex w-max">
        <TickerGroup items={t.items} />
        <TickerGroup items={t.items} />
      </div>
    </div>
  );
}
