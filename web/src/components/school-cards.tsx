"use client";

import { useEffect, useState } from "react";
import type { School } from "@/lib/types";

const ICONS: Record<string, React.ReactNode> = {
  ingenieria: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 2l3 4h4l-1 4 3 3-3 3 1 4h-4l-3 4-3-4H5l1-4-3-3 3-3-1-4h4z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  ),
  "transformacion-de-negocios": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 20V13M10 20V9M16 20V5M22 20V11" />
    </svg>
  ),
  "bienestar-y-desarrollo-humano": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 21s-7-4.5-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-7 10-7 10a29 29 0 0 1-2-1.6" />
      <path d="M6 12h2l1.5-3 2 5 1.5-2H15" />
    </svg>
  ),
  "diseno-y-tecnologias-de-comunicacion": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 20l6-16 2 5 2-5 6 16" />
      <path d="M8 20l4-10 4 10" />
    </svg>
  ),
};

const FACADES = ["#C9D6EC", "#BFE6EE", "#E7E8E8", "#C3E0E6"];
const HEIGHTS = [440, 400, 480, 420];

function BuildingCard({ school, i }: { school: School; i: number }) {
  const facade = FACADES[i % FACADES.length];
  const height = HEIGHTS[i % HEIGHTS.length];
  return (
    <div
      className="flex w-62 shrink-0 flex-col items-center max-md:w-full max-md:max-w-70"
      style={{ filter: "drop-shadow(0 18px 20px rgba(3,62,140,0.22))" }}
    >
      <div
        className="deco-ziggurat relative w-full border-x-2 border-t-2 border-navy/20 pt-14"
        style={{
          height,
          background: `linear-gradient(180deg, #FFFFFF 0%, ${facade} 45%, ${facade} 100%)`,
        }}
      >
        <div
          className="absolute top-16 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-sm border-2 border-navy bg-cream px-3 py-5 text-navy shadow-[0_8px_16px_rgba(3,62,140,0.3)]"
          style={{ writingMode: "vertical-rl" }}
        >
          <span className="font-display text-xl font-bold tracking-[0.1em] uppercase">
            {school.name.replace("Escuela de ", "")}
          </span>
        </div>

        <div className="mt-32 grid grid-cols-4 gap-2 px-6">
          {Array.from({ length: 12 }, (_, w) => (
            <div key={w} className="aspect-square rounded-[2px] bg-navy/20" />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 flex h-11 w-11 items-center justify-center rounded-full border-2 border-navy bg-cream text-navy">
          {ICONS[school.slug]}
        </div>
      </div>

      <div className="w-full border-x-2 border-b-2 border-navy/15 bg-cream p-4 text-center">
        <p className="mb-2.5 text-[15px] leading-snug italic text-muted-ink">{school.tagline}</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {school.programs.map((p) => (
            <span
              key={p.name}
              className="small-caps rounded-full border border-hairline px-2.5 py-1 text-[10px] font-bold text-muted-brown"
            >
              {p.degree}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SchoolCards({ schools }: { schools: School[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((a) => (a + 1) % schools.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [schools.length]);

  return (
    <div id="programas" className="relative z-10 overflow-hidden bg-cream py-24">
      <div className="mx-auto max-w-300 px-14 max-md:px-6">
        <div className="mb-14 text-center">
          <div className="small-caps mb-3.5 text-xs font-bold text-teal">Cuatro escuelas</div>
          <h2 className="font-display mb-3.5 text-4xl font-normal">
            El mismo motor IA-Native, cuatro fachadas distintas
          </h2>
          <p className="mx-auto max-w-[520px] text-[15px] text-muted-ink">
            Cada programa se rediseña continuamente con IA y expertos humanos para reflejar lo que
            la industria necesita hoy.
          </p>
        </div>
      </div>

      {/* Desktop/tablet: all buildings side by side */}
      <div className="overflow-x-auto pb-4 max-md:hidden">
        <div className="mx-auto flex w-max items-end gap-1 px-14">
          {schools.map((school, i) => (
            <BuildingCard key={school.slug} school={school} i={i} />
          ))}
        </div>
      </div>

      {/* Mobile: one building at a time, auto-advancing */}
      <div className="hidden justify-center px-6 max-md:flex">
        <BuildingCard key={schools[active].slug} school={schools[active]} i={active} />
      </div>
      <div className="mt-5 hidden justify-center gap-2 max-md:flex">
        {schools.map((school, i) => (
          <button
            key={school.slug}
            type="button"
            aria-label={`Ir a ${school.name}`}
            onClick={() => setActive(i)}
            className="h-2 w-2 rounded-full transition"
            style={{ background: i === active ? "var(--color-navy)" : "var(--color-hairline)" }}
          />
        ))}
      </div>

      <div aria-hidden className="mx-auto mt-1 h-2 max-w-300 bg-navy/15 max-md:hidden" />

      <div className="mt-12 text-center">
        <a
          href="#informacion"
          className="inline-block rounded-full bg-navy px-7 py-4 text-[15px] font-bold text-cream shadow-[0_14px_28px_rgba(3,62,140,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(3,62,140,0.55)]"
        >
          Quiero información de mi escuela
        </a>
      </div>
    </div>
  );
}
