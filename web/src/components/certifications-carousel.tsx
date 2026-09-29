"use client";

import { useEffect, useRef, useState } from "react";
import type { Certification } from "@/lib/types";

const ACCENTS = ["#0092B6", "#D4AF37"];

export function CertificationsCarousel({ certifications }: { certifications: Certification[] }) {
  const [index, setIndex] = useState(0);
  const [spinKey, setSpinKey] = useState(0);
  const [fading, setFading] = useState(false);
  const pausedRef = useRef(false);
  const total = certifications.length;

  function go(delta: number) {
    setSpinKey((k) => k + 1);
    setFading(true);
    setTimeout(() => {
      setIndex((i) => (i + delta + total) % total);
      setFading(false);
    }, 350);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      go(1);
    }, 4800);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const cert = certifications[index];
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <div
      id="continua"
      className="relative z-10 bg-navy py-22 text-cream"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className="mx-auto max-w-[1100px] px-14 max-md:px-6">
        <div className="mb-12 text-center">
          <div className="small-caps mb-3.5 text-xs font-bold tracking-[0.14em] text-cyan">
            Educación continua
          </div>
          <h2 className="font-display mb-3.5 text-4xl font-normal">
            No tienes que esperar a graduarte
          </h2>
          <p className="mx-auto max-w-[480px] text-sm text-navy-muted">
            Seis certificaciones de 36 a 40 horas, diseñadas para aplicar lo aprendido desde la
            primera semana.
          </p>
        </div>

        <div className="relative mx-auto flex max-w-160 items-center gap-4 max-md:gap-2">
          <button
            type="button"
            aria-label="Certificación anterior"
            onClick={() => go(-1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-cyan/40 text-cyan transition hover:-translate-y-0.5 hover:border-cyan hover:bg-cyan/10 max-md:h-9 max-md:w-9"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="relative flex-1 overflow-hidden rounded-t-[64px] rounded-b-2xl border-2 border-cyan/20 bg-cream px-10 py-12 text-center text-ink max-md:rounded-t-[36px] max-md:px-6 max-md:py-9">
            <div
              key={spinKey}
              className="animate-badge-spin mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-4 bg-white"
              style={{ borderColor: accent, boxShadow: `0 8px 20px ${accent}33` }}
            >
              <span className="font-display text-lg font-bold" style={{ color: accent }}>
                {cert.hours}h
              </span>
            </div>

            <div className={`transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}>
              <div
                className="small-caps mb-2.5 text-xs font-bold tracking-[0.1em]"
                style={{ color: accent }}
              >
                {cert.hours} horas · 100% online
              </div>
              <h3 className="font-display mb-3 text-2xl font-normal">{cert.name}</h3>
              <p className="mx-auto max-w-100 text-sm leading-[1.6] text-muted-ink">
                {cert.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Siguiente certificación"
            onClick={() => go(1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-cyan/40 text-cyan transition hover:-translate-y-0.5 hover:border-cyan hover:bg-cyan/10 max-md:h-9 max-md:w-9"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {certifications.map((c, i) => (
            <button
              key={c.slug}
              type="button"
              aria-label={`Ir a ${c.name}`}
              onClick={() => {
                setSpinKey((k) => k + 1);
                setFading(true);
                setTimeout(() => {
                  setIndex(i);
                  setFading(false);
                }, 350);
              }}
              className="h-2 w-2 rounded-full transition"
              style={{ background: i === index ? "var(--color-cyan)" : "rgba(255,255,255,0.25)" }}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full bg-burgundy px-7 py-4 text-[15px] font-bold text-cream shadow-[0_14px_28px_rgba(0,146,182,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,146,182,0.55)]"
          >
            Inscríbete a una certificación
          </a>
        </div>
      </div>
    </div>
  );
}
