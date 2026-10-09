"use client";

import { Reveal } from "../reveal";
import { usePick } from "@/i18n/locale-context";
import type { Gender } from "./campus-player";

export type { Gender };

const COPY = {
  es: {
    eyebrow: "KUN University AI",
    heading: "Elige tu personaje",
    body: "Así te verás recorriendo el campus virtual.",
    female: "Femenino",
    male: "Masculino",
    other: "Otro",
  },
  en: {
    eyebrow: "KUN University AI",
    heading: "Choose your character",
    body: "This is how you'll look exploring the virtual campus.",
    female: "Female",
    male: "Male",
    other: "Other",
  },
};

function SilhouettePreview({ gender }: { gender: Gender }) {
  return (
    <svg
      width="64"
      height="84"
      viewBox="0 0 64 84"
      fill="currentColor"
      className="mx-auto text-[#FFF3E6]/75 transition-colors duration-300 group-hover:text-[#FFC85C]"
    >
      <circle cx="32" cy="18" r="14" />
      {gender === "female" && (
        <path d="M18 11a14 14 0 0 1 28 0c0 9-3 15-3 25h-4c0-9 1-16 1-24a10 10 0 1 0-20 0c0 8 1 15 1 24h-4c0-10-3-16-3-25z" />
      )}
      <path d="M14 42c0-7 8-12 18-12s18 5 18 12l4 36H10z" />
    </svg>
  );
}

export function CampusCharacterSelect({ onSelect }: { onSelect: (gender: Gender) => void }) {
  const t = usePick(COPY);
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-8 bg-[#1D1236] px-6 text-center text-[#FFF3E6]">
      <Reveal variant="up">
        <div className="small-caps text-xs font-bold text-[#FFC85C]">{t.eyebrow}</div>
      </Reveal>
      <Reveal variant="up" delay={70}>
        <h1 className="font-display text-4xl font-normal max-md:text-3xl">{t.heading}</h1>
      </Reveal>
      <Reveal variant="up" delay={130}>
        <p className="max-w-100 text-[15px] text-[#FFF3E6]/70">{t.body}</p>
      </Reveal>

      <Reveal variant="up" delay={200}>
        <div className="flex gap-5 max-md:flex-col">
          <button
            type="button"
            onClick={() => onSelect("female")}
            className="group w-40 rounded-2xl border border-white/15 bg-white/5 px-5 py-8 transition hover:-translate-y-1 hover:border-[#FFC85C]/60 hover:bg-white/10"
          >
            <SilhouettePreview gender="female" />
            <div className="mt-4 text-sm font-bold">{t.female}</div>
          </button>
          <button
            type="button"
            onClick={() => onSelect("male")}
            className="group w-40 rounded-2xl border border-white/15 bg-white/5 px-5 py-8 transition hover:-translate-y-1 hover:border-[#FFC85C]/60 hover:bg-white/10"
          >
            <SilhouettePreview gender="male" />
            <div className="mt-4 text-sm font-bold">{t.male}</div>
          </button>
          <button
            type="button"
            onClick={() => onSelect("other")}
            className="group w-40 rounded-2xl border border-white/15 bg-white/5 px-5 py-8 transition hover:-translate-y-1 hover:border-[#FFC85C]/60 hover:bg-white/10"
          >
            <SilhouettePreview gender="other" />
            <div className="mt-4 text-sm font-bold">{t.other}</div>
          </button>
        </div>
      </Reveal>
    </div>
  );
}
