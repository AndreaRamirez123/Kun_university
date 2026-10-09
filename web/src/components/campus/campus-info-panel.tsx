"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "../reveal";
import type { School } from "@/lib/types";

export function CampusInfoPanel({ school }: { school: School | null }) {
  const [prevSchool, setPrevSchool] = useState(school);
  const [rendered, setRendered] = useState(school);
  if (school !== prevSchool) {
    setPrevSchool(school);
    if (school) setRendered(school);
  }

  if (!rendered) return null;
  const open = !!school;

  return (
    <div
      key={rendered.slug}
      className={`absolute inset-y-0 right-0 z-20 flex w-full max-w-115 flex-col gap-5 overflow-y-auto border-l border-white/10 bg-[#140A28]/95 px-9 py-14 backdrop-blur-md transition-[translate,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] max-md:max-w-full max-md:px-6 max-md:py-10 ${
        open ? "pointer-events-auto translate-x-0 opacity-100" : "pointer-events-none translate-x-10 opacity-0"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 100% 0%, rgba(255,200,92,0.1), transparent 60%), repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)",
      }}
    >
      <Reveal variant="right">
        <div className="small-caps text-xs font-bold text-[#FFC85C]">Escuela</div>
      </Reveal>
      <Reveal variant="right" delay={60}>
        <h2 className="font-display text-4xl leading-[1.05] font-normal text-[#FFF3E6] max-md:text-3xl">
          {rendered.name.replace("Escuela de ", "")}
        </h2>
      </Reveal>
      <Reveal variant="right" delay={120}>
        <div className="animate-hairline h-[2px] bg-[#FFC85C]" />
      </Reveal>
      <Reveal variant="right" delay={160}>
        <p className="text-[15px] italic text-[#FFF3E6]/70">{rendered.tagline}</p>
      </Reveal>

      <div className="mt-2 flex flex-col">
        {rendered.programs.map((program, i) => (
          <Reveal key={program.name} variant="right" delay={220 + i * 90}>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 py-4">
              <div>
                <div className="small-caps text-[10px] font-bold tracking-[0.08em] text-[#0092B6]">
                  {program.degree}
                </div>
                <div className="mt-1 text-[15px] font-bold text-[#FFF3E6]">{program.name}</div>
              </div>
              <div className="shrink-0 text-sm font-bold text-[#FFF3E6]/50">{program.totalCredits}cr</div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal variant="right" delay={220 + rendered.programs.length * 90 + 80}>
        <Link
          href={`/programas/${rendered.slug}`}
          className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#FFC85C] hover:underline"
        >
          Ver plan de materias completo →
        </Link>
      </Reveal>

      <p className="pointer-events-none mt-auto text-[11px] font-semibold tracking-[0.04em] text-[#FFF3E6]/40">
        Aléjate del edificio para cerrar
      </p>
    </div>
  );
}
