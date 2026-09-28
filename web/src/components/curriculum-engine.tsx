"use client";

import { useState } from "react";

const ACCENTS = ["#0092B6", "#D4AF37", "#A9BFD1"];

const STEPS = [
  {
    number: "I",
    title: "La IA rastrea la frontera",
    body: "Nuestros agentes de IA monitorean lo último que publica la ciencia, la industria y la regulación en cada campo que enseñamos.",
    lift: "md:mb-16",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="10" cy="10" r="6" />
        <path d="M20 20l-5-5" />
        <path d="M10 7v6M7 10h6" />
      </svg>
    ),
  },
  {
    number: "II",
    title: "El criterio humano decide",
    body: "Nuestro equipo académico experto revisa, valida y da forma al contenido. La IA propone, las personas deciden.",
    lift: "",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.5l2.3 2.3L16 9.5" />
      </svg>
    ),
  },
  {
    number: "III",
    title: "Aprendes lo que el mercado necesita hoy",
    body: "No lo que se enseñaba hace cinco años. Aprendes las competencias que las empresas buscan hoy.",
    lift: "md:mb-16",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 20V10M10 20V4M16 20v-7M20 20v-3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function CurriculumEngine() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="relative mx-auto max-w-260 px-14 pb-24 max-md:px-6">
      <h2 className="font-display mb-16 text-center text-4xl font-normal max-md:mb-8">
        Así se construye un curso en KUN
      </h2>
      <div className="relative grid grid-cols-3 items-start gap-8 max-md:grid-cols-1 max-md:gap-6">
        <svg
          className="pointer-events-none absolute top-17 left-[16%] hidden w-[68%] md:block"
          height="24"
          viewBox="0 0 500 24"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 5 C 120 5, 130 19, 250 19 S 380 5, 500 5"
            fill="none"
            stroke="var(--color-burgundy)"
            strokeWidth="2"
            strokeDasharray="2 10"
            strokeLinecap="round"
          />
        </svg>

        {STEPS.map((step, i) => (
          <div key={step.number} className={`text-center ${step.lift}`}>
            <div
              role="button"
              tabIndex={0}
              aria-expanded={open === i}
              className="animate-pulse-soft peer relative mx-auto mb-5 flex h-17 w-17 cursor-pointer items-center justify-center rounded-full border-2 transition-colors duration-300"
              style={{
                borderColor: ACCENTS[i],
                color: ACCENTS[i],
                background: `${ACCENTS[i]}1F`,
                boxShadow: `0 0 0 7px ${ACCENTS[i]}14`,
                animationDelay: `${i * 0.3}s`,
              }}
              onClick={() => setOpen((o) => (o === i ? null : i))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen((o) => (o === i ? null : i));
                }
              }}
            >
              {step.icon}
            </div>
            <div className="mb-2 text-base font-bold">{step.title}</div>
            <div
              className={`peer-hover:grid-rows-[1fr] peer-hover:opacity-100 mx-auto grid max-w-70 grid-rows-[0fr] text-sm leading-[1.6] text-muted-ink opacity-0 transition-[grid-template-rows,opacity] duration-700 ease-out ${open === i ? "grid-rows-[1fr] opacity-100" : ""}`}
            >
              <div className="overflow-hidden">{step.body}</div>
            </div>
            <div className={`text-xs font-semibold text-teal ${open === i ? "hidden" : "hidden max-md:block"}`}>
              Toca el ícono para ver más
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <a
          href="#informacion"
          className="inline-block rounded-full bg-navy px-7 py-4 text-[15px] font-bold text-cream shadow-[0_14px_28px_rgba(3,62,140,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(3,62,140,0.55)]"
        >
          Habla con admisiones
        </a>
      </div>
    </div>
  );
}
