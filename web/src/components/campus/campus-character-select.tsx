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

// Avatares con los mismos tonos de piel/cabello/atuendo que el personaje 3D real,
// para que la elección se sienta coherente con quién vas a ver en el campus.
function CharacterAvatar({ gender }: { gender: Gender }) {
  const skin = "#D9A273";
  const hair = "#2B1B12";
  const outfit = gender === "female" ? "#17213A" : gender === "other" ? "#0D3B45" : "#10101A";
  const clipId = `avatar-clip-${gender}`;

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="mx-auto">
      <circle cx="48" cy="48" r="46" fill="#FFC85C" opacity="0.12" />
      <defs>
        <clipPath id={clipId}>
          <circle cx="48" cy="48" r="46" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path d="M12 96c0-19 16-32 36-32s36 13 36 32v6H12z" fill={outfit} />
        <rect x="39" y="55" width="18" height="16" rx="7" fill={skin} />
        <circle cx="48" cy="41" r="20" fill={skin} />
        {gender === "female" && (
          <path
            d="M26 39c-1-16 10-27 22-27s23 11 22 27c0 6-2 11-2 11l-3-2c1-10-2-15-2-19-4 3-11 4-17 4s-13-1-17-4c0 4-3 9-2 19l-3 2s-2-5-2-11z"
            fill={hair}
          />
        )}
        {gender === "male" && (
          <path
            d="M29 37a19 19 0 0 1 38 0c0 2-1 5-1 7-3-6-9-9-18-9s-15 3-18 9c0-2-1-5-1-7z"
            fill={hair}
          />
        )}
        {gender === "other" && (
          <path
            d="M28 35a20 20 0 0 1 40 0c0 3-1 6-2 8-2-4-5-7-9-8 2 3 3 6 2 9-3-3-7-5-11-5s-8 2-11 5c-1-3 0-6 2-9-4 1-7 4-9 8-1-2-2-5-2-8z"
            fill={hair}
          />
        )}
        <circle cx="41" cy="42" r="1.7" fill="#2B1B12" />
        <circle cx="55" cy="42" r="1.7" fill="#2B1B12" />
        <path d="M42 49c2 2.2 4 3.2 6 3.2s4-1 6-3.2" stroke="#2B1B12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
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
            <CharacterAvatar gender="female" />
            <div className="mt-4 text-sm font-bold">{t.female}</div>
          </button>
          <button
            type="button"
            onClick={() => onSelect("male")}
            className="group w-40 rounded-2xl border border-white/15 bg-white/5 px-5 py-8 transition hover:-translate-y-1 hover:border-[#FFC85C]/60 hover:bg-white/10"
          >
            <CharacterAvatar gender="male" />
            <div className="mt-4 text-sm font-bold">{t.male}</div>
          </button>
          <button
            type="button"
            onClick={() => onSelect("other")}
            className="group w-40 rounded-2xl border border-white/15 bg-white/5 px-5 py-8 transition hover:-translate-y-1 hover:border-[#FFC85C]/60 hover:bg-white/10"
          >
            <CharacterAvatar gender="other" />
            <div className="mt-4 text-sm font-bold">{t.other}</div>
          </button>
        </div>
      </Reveal>
    </div>
  );
}
