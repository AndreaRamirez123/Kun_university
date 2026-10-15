"use client";

import { useEffect, useState } from "react";
import { useLocale, usePick, type Locale } from "@/i18n/locale-context";
import type { School } from "@/lib/types";
import { campusRuntime } from "./campus-runtime";
import { ZONES } from "./campus-zones";

// Conversación con Krucn, la mascota del campus. Por ahora responde tres
// preguntas fijas; "¿Dónde estoy?" se calcula con la posición real del jugador.

type QuestionId = "where" | "what" | "why";

const COPY = {
  es: {
    role: "Mascota del campus",
    talk: "Hablar",
    hint: "Pulsa E",
    close: "Cerrar",
    greeting: (name: string) =>
      `¡Hola${name ? `, ${name}` : ""}! Soy Krucn, el cocodrilo oficial de KUN University AI. ¿En qué te ayudo?`,
    questions: { where: "¿Dónde estoy?", what: "¿Qué es este lugar?", why: "¿Por qué eres un cocodrilo?" } as Record<QuestionId, string>,
    whereNear: (place: string, dir: string) =>
      `Estás en el campus virtual de KUN University AI, en Florida. Ahora mismo tienes cerca ${place}, hacia ${dir}. Acércate a la puerta y pulsa E para entrar a su aula.`,
    whereOpen: (place: string, dir: string) =>
      `Estás en la isla del campus virtual de KUN University AI, en Florida. El lugar más cercano es ${place}, hacia ${dir}. ¡Sígueme o mira el minimapa arriba a la derecha!`,
    what: "Es el campus virtual de KUN University AI, la universidad IA-Native con sede en Florida. Aquí recorres las cuatro escuelas, el Currículo vivo, Admisiones y la plataforma de certificaciones. Y todo es 100% online: estudias desde cualquier lugar del mundo.",
    why: "¡Porque soy de Florida! El sur de Florida es el único lugar del mundo donde viven juntos cocodrilos y caimanes. Así que me puse la camiseta de KUN, el birrete, y ahora mi trabajo es que nadie se pierda en el campus. Tranquilo: tengo muchos dientes, pero solo los uso para sonreír.",
    dirs: ["el norte", "el noreste", "el este", "el sureste", "el sur", "el suroeste", "el oeste", "el noroeste"],
    places: { cur: "el Currículo vivo", adm: "el edificio de Admisiones", cont: "la plataforma de lanzamiento de certificaciones" } as Record<string, string>,
  },
  en: {
    role: "Campus mascot",
    talk: "Talk",
    hint: "Press E",
    close: "Close",
    greeting: (name: string) => `Hi${name ? `, ${name}` : ""}! I'm Krucn, KUN University AI's official crocodile. How can I help?`,
    questions: { where: "Where am I?", what: "What is this place?", why: "Why are you a crocodile?" } as Record<QuestionId, string>,
    whereNear: (place: string, dir: string) =>
      `You're on KUN University AI's virtual campus, in Florida. Right now ${place} is close by, to the ${dir}. Walk up to the door and press E to enter its classroom.`,
    whereOpen: (place: string, dir: string) =>
      `You're on the island of KUN University AI's virtual campus, in Florida. The closest place is ${place}, to the ${dir}. Follow me or check the minimap at the top right!`,
    what: "It's the virtual campus of KUN University AI, the AI-Native university based in Florida. Here you can visit the four schools, the Living curriculum, Admissions and the certifications launch pad. And it's all 100% online: you study from anywhere in the world.",
    why: "Because I'm from Florida! South Florida is the only place in the world where crocodiles and alligators live side by side. So I put on the KUN jersey and the grad cap, and now my job is making sure nobody gets lost on campus. Don't worry: I have lots of teeth, but I only use them to smile.",
    dirs: ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"],
    places: { cur: "the Living curriculum", adm: "the Admissions building", cont: "the certifications launch pad" } as Record<string, string>,
  },
};

function placeName(id: string, schools: School[], locale: Locale) {
  const zone = ZONES.find((z) => z.id === id);
  const school = zone?.schoolSlug ? schools.find((s) => s.slug === zone.schoolSlug) : undefined;
  if (school) return (locale === "es" ? "la " : "the ") + school.name[locale];
  return COPY[locale].places[id] ?? zone?.label[locale] ?? "";
}

/** Respuesta a "¿Dónde estoy?" con el lugar más cercano y su dirección. */
function whereAnswer(schools: School[], locale: Locale) {
  const t = COPY[locale];
  const p = campusRuntime.player;
  let best = ZONES[0];
  let bestD = Infinity;
  for (const z of ZONES) {
    const d = Math.hypot(z.x - p.x, z.z - p.z);
    if (d < bestD) {
      bestD = d;
      best = z;
    }
  }
  // Norte = -z en la isla (hacia donde mira la cámara al empezar).
  const angle = Math.atan2(best.x - p.x, -(best.z - p.z));
  const dir = t.dirs[(Math.round(angle / (Math.PI / 4)) + 8) % 8];
  const place = placeName(best.id, schools, locale);
  return bestD < 16 ? t.whereNear(place, dir) : t.whereOpen(place, dir);
}

function KrucnPortrait() {
  return (
    <svg viewBox="0 0 80 80" width="64" height="64" aria-hidden>
      <circle cx="40" cy="40" r="40" fill="#E3E39A" />
      <ellipse cx="40" cy="50" rx="30" ry="18" fill="#3FA34D" />
      <ellipse cx="40" cy="40" rx="24" ry="22" fill="#3FA34D" />
      <path d="M18 56 Q40 70 62 56" stroke="#24123F" strokeWidth="3" fill="none" strokeLinecap="round" />
      {[24, 32, 40, 48, 56].map((x) => (
        <path key={x} d={`M${x - 3} 58 L${x} 64 L${x + 3} 58`} fill="#fff" />
      ))}
      <circle cx="29" cy="24" r="9" fill="#fff" />
      <circle cx="51" cy="24" r="9" fill="#fff" />
      <circle cx="30" cy="25" r="4.5" fill="#1A1A1A" />
      <circle cx="52" cy="25" r="4.5" fill="#1A1A1A" />
      <circle cx="35" cy="47" r="2" fill="#1E2A1E" />
      <circle cx="45" cy="47" r="2" fill="#1E2A1E" />
      <rect x="22" y="6" width="36" height="6" rx="1" fill="#24123F" transform="rotate(-6 40 9)" />
    </svg>
  );
}

/** Aviso flotante cuando Krucn está cerca. */
export function KrucnPrompt({ visible, onTalk }: { visible: boolean; onTalk: () => void }) {
  const t = usePick(COPY);
  if (!visible) return null;
  return (
    <div className="reveal-animate absolute bottom-[calc(84px+env(safe-area-inset-bottom,0px))] left-1/2 z-20 w-[min(420px,calc(100%-32px))] -translate-x-1/2 max-md:bottom-[calc(140px+env(safe-area-inset-bottom,0px))]">
      <div className="flex items-center gap-3 rounded-[22px] border border-white/12 bg-[#0E061E]/80 p-2.5 pl-3 text-[#FFF3E6] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <span className="shrink-0 overflow-hidden rounded-full">
          <KrucnPortrait />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">{t.role}</div>
          <div className="font-(family-name:--font-gabarito) text-[18px] leading-tight font-extrabold">Krucn</div>
        </div>
        <button
          type="button"
          onClick={onTalk}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl bg-[#3FA34D] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
        >
          💬 {t.talk}
          <kbd className="rounded-md border border-white/40 px-1.5 font-mono text-[11px] max-md:hidden">E</kbd>
        </button>
      </div>
    </div>
  );
}

/** Texto que aparece letra por letra, como en los diálogos de los videojuegos. */
function useTypewriter(text: string) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = 0;
    const id = window.setInterval(() => {
      i = reduce ? text.length : i + 2;
      setShown(Math.min(i, text.length));
      if (i >= text.length) window.clearInterval(id);
    }, 22);
    return () => window.clearInterval(id);
  }, [text]);
  return { visible: text.slice(0, shown), done: shown >= text.length };
}

export function KrucnDialog({
  open,
  playerName,
  schools,
  onClose,
}: {
  open: boolean;
  playerName: string;
  schools: School[];
  onClose: () => void;
}) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  const [answer, setAnswer] = useState<{ q: QuestionId | null; text: string }>({ q: null, text: "" });
  const message = answer.text || t.greeting(playerName);
  const { visible, done } = useTypewriter(open ? message : "");

  if (!open) return null;

  function ask(q: QuestionId) {
    const text = q === "where" ? whereAnswer(schools, locale) : q === "what" ? t.what : t.why;
    setAnswer({ q, text });
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="krucn-name"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="reveal-animate absolute bottom-[calc(24px+env(safe-area-inset-bottom,0px))] left-1/2 z-30 w-[min(720px,calc(100%-24px))] -translate-x-1/2 max-md:bottom-[calc(88px+env(safe-area-inset-bottom,0px))]"
    >
      <div className="relative rounded-[26px] border-2 border-[#3FA34D] bg-[#0E061E]/90 p-5 text-[#FFF3E6] shadow-[0_30px_70px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl max-md:p-4">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="absolute top-3 right-3 h-9 w-9 cursor-pointer rounded-full bg-white/10 text-lg leading-none transition hover:bg-white/20"
        >
          ×
        </button>
        <div className="flex gap-4 max-md:gap-3">
          <span className="shrink-0 self-start overflow-hidden rounded-full ring-2 ring-[#3FA34D]">
            <KrucnPortrait />
          </span>
          <div className="min-w-0 flex-1 pr-8">
            <div className="flex items-baseline gap-2">
              <span id="krucn-name" className="font-(family-name:--font-gabarito) text-xl font-black text-[#7FD68A]">
                Krucn
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/45 uppercase">{t.role}</span>
            </div>
            {answer.q && <p className="m-0 mt-1 text-[13px] font-bold text-[#FFC85C]">“{t.questions[answer.q]}”</p>}
            <p className="m-0 mt-1.5 min-h-[4.5em] text-[15.5px] leading-relaxed" aria-live="polite">
              {visible}
              {!done && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-[#7FD68A] align-middle" />}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(t.questions) as QuestionId[]).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => ask(q)}
              className={`cursor-pointer rounded-full border-2 px-4 py-2 text-[14px] font-bold transition hover:-translate-y-0.5 ${
                answer.q === q ? "border-[#3FA34D] bg-[#3FA34D] text-white" : "border-white/25 text-[#FFF3E6] hover:border-[#7FD68A]"
              }`}
            >
              {t.questions[q]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
