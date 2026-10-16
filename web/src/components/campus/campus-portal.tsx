"use client";

import { useLocale, usePick } from "@/i18n/locale-context";
import type { School } from "@/lib/types";
import type { ZoneDef } from "./campus-zones";

export type PortalStage = "idle" | "cover" | "reveal";

const COPY = {
  es: {
    entering: "Entrando a",
    leaving: "Volviendo al campus",
    enter: "Entrar",
    kicker: { school: "Escuela", admissions: "Edificio principal", curriculum: "Centro del campus", certifications: "Plataforma de lanzamiento" },
    hint: "Pulsa E o Enter",
  },
  en: {
    entering: "Entering",
    leaving: "Back to campus",
    enter: "Enter",
    kicker: { school: "School", admissions: "Main building", curriculum: "Heart of the campus", certifications: "Launch pad" },
    hint: "Press E or Enter",
  },
};

function zoneTitle(zone: ZoneDef, schools: School[], locale: "es" | "en") {
  const school = zone.schoolSlug ? schools.find((s) => s.slug === zone.schoolSlug) : undefined;
  return school ? school.name[locale] : zone.label[locale];
}

// Telón circular del color del lugar: se cierra desde el centro, cambia la
// escena por debajo y se vuelve a abrir (la transición de "portal" de Active Theory).
export function CampusPortal({
  stage,
  zone,
  leaving,
  schools,
  reduceMotion,
}: {
  stage: PortalStage;
  zone: ZoneDef | null;
  leaving: boolean;
  schools: School[];
  reduceMotion: boolean;
}) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  if (stage === "idle" || !zone) return null;
  const covered = stage === "cover";
  return (
    <div aria-hidden className="pointer-events-auto absolute inset-0 z-50">
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${zone.color} 0%, #140A28 120%)`,
          animation: reduceMotion
            ? `${covered ? "campus-fade-in" : "campus-fade-out"} 300ms ease both`
            : `${covered ? "campus-iris-in" : "campus-iris-out"} 650ms cubic-bezier(.76,0,.24,1) both`,
        }}
      >
        <div className="text-center text-white">
          <div className="mb-3 font-mono text-[11px] tracking-[0.3em] uppercase opacity-80">
            {leaving ? t.leaving : t.entering}
          </div>
          <div className="px-6 font-(family-name:--font-gabarito) text-[clamp(32px,6vw,72px)] leading-none font-black">
            {leaving ? "KUN University AI" : zoneTitle(zone, schools, locale)}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes campus-iris-in { from { clip-path: circle(0% at 50% 50%); } to { clip-path: circle(150% at 50% 50%); } }
        @keyframes campus-iris-out { from { clip-path: circle(150% at 50% 50%); } to { clip-path: circle(0% at 50% 50%); } }
        @keyframes campus-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes campus-fade-out { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
    </div>
  );
}

// Aviso flotante cuando estás frente a un edificio: invita a entrar al aula.
export function CampusZonePrompt({
  zone,
  schools,
  onEnter,
}: {
  zone: ZoneDef | null;
  schools: School[];
  onEnter: () => void;
}) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  if (!zone) return null;
  return (
    <div
      key={zone.id}
      className="reveal-animate absolute inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] z-20 mx-auto w-[min(440px,calc(100%-32px))] max-md:right-24 max-md:left-4 max-md:mx-0 max-md:w-auto max-md:bottom-[calc(132px+env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex items-center gap-4 rounded-[22px] border border-white/12 bg-[#0E061E]/80 p-3 pl-5 text-[#FFF3E6] max-md:gap-3 max-md:p-2 max-md:pl-3.5 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="absolute inset-0 animate-ping rounded-full opacity-70" style={{ background: zone.color }} />
          <span className="relative h-3 w-3 rounded-full" style={{ background: zone.color }} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">{t.kicker[zone.kind]}</div>
          <div className="truncate font-(family-name:--font-gabarito) text-[17px] leading-tight font-extrabold max-md:line-clamp-2 max-md:text-[15px] max-md:whitespace-normal">
            {zoneTitle(zone, schools, locale)}
          </div>
        </div>
        <button
          type="button"
          onClick={onEnter}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 max-md:px-3.5 max-md:py-2.5"
          style={{ background: zone.color }}
        >
          {t.enter}
          <kbd className="rounded-md border border-white/40 px-1.5 font-mono text-[11px] max-md:hidden">E</kbd>
        </button>
      </div>
      <p className="m-0 mt-2 text-center text-[11px] font-semibold text-white/60 max-md:hidden">{t.hint}</p>
    </div>
  );
}
