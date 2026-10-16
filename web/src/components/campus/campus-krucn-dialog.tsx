"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, usePick, type Locale } from "@/i18n/locale-context";
import { ADMISSIONS_EMAIL } from "@/lib/contact";
import { askKrucn, krucnAgentAvailable, type KrucnTurn } from "@/lib/krucn-agent";
import type { School } from "@/lib/types";
import { campusRuntime } from "./campus-runtime";
import { ZONES } from "./campus-zones";

// Conversación con Krucn, la mascota del campus. Tres preguntas rápidas con
// respuesta fija ("¿Dónde estoy?" usa la posición real del jugador) y, cuando la
// API tiene el agente encendido, preguntas libres respondidas por Claude.

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
    placeholder: "Pregúntale lo que quieras: programas, materias, certificados…",
    send: "Preguntar",
    thinking: "Krucn está pensando",
    offline: `¡Uy! Ahora mismo no puedo contestar eso. Escribe a ${ADMISSIONS_EMAIL} y el equipo de admisiones te ayuda, o abre el Catálogo académico.`,
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
    placeholder: "Ask me anything: programs, courses, certificates…",
    send: "Ask",
    thinking: "Krucn is thinking",
    offline: `Oops! I can't answer that right now. Write to ${ADMISSIONS_EMAIL} and the admissions team will help, or open the Academic catalog.`,
  },
};

function placeName(id: string, schools: School[], locale: Locale) {
  const zone = ZONES.find((z) => z.id === id);
  const school = zone?.schoolSlug ? schools.find((s) => s.slug === zone.schoolSlug) : undefined;
  if (school) return (locale === "es" ? "la " : "the ") + school.name[locale];
  return COPY[locale].places[id] ?? zone?.label[locale] ?? "";
}

/** Lugar más cercano al jugador, su dirección y distancia. */
function nearest(schools: School[], locale: Locale) {
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
  return { place: placeName(best.id, schools, locale), dir, distance: bestD };
}

/** Respuesta a "¿Dónde estoy?" con el lugar más cercano y su dirección. */
function whereAnswer(schools: School[], locale: Locale) {
  const t = COPY[locale];
  const { place, dir, distance } = nearest(schools, locale);
  return distance < 16 ? t.whereNear(place, dir) : t.whereOpen(place, dir);
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
    <div className="reveal-animate absolute inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] z-20 mx-auto w-[min(420px,calc(100%-32px))] max-md:right-24 max-md:left-4 max-md:mx-0 max-md:w-auto max-md:bottom-[calc(132px+env(safe-area-inset-bottom,0px))]">
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
  // live: la respuesta llega del agente en streaming (sin efecto máquina de escribir).
  const [answer, setAnswer] = useState<{ q: QuestionId | null; asked: string; text: string; live: boolean }>({
    q: null,
    asked: "",
    text: "",
    live: false,
  });
  const [history, setHistory] = useState<KrucnTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [agentOn, setAgentOn] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const message = answer.text || t.greeting(playerName);
  const { visible, done } = useTypewriter(open && !answer.live ? message : "");

  useEffect(() => {
    let alive = true;
    krucnAgentAvailable().then((on) => alive && setAgentOn(on));
    return () => {
      alive = false;
    };
  }, []);

  // Al cerrar el diálogo se corta la respuesta que esté en camino.
  useEffect(() => {
    if (!open) abortRef.current?.abort();
  }, [open]);
  useEffect(() => () => abortRef.current?.abort(), []);

  if (!open) return null;

  function ask(q: QuestionId) {
    abortRef.current?.abort();
    setBusy(false);
    const text = q === "where" ? whereAnswer(schools, locale) : q === "what" ? t.what : t.why;
    setAnswer({ q, asked: t.questions[q], text, live: false });
    setHistory((h) => [...h, { role: "user", content: t.questions[q] }, { role: "assistant", content: text }]);
  }

  async function askFree(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const messages: KrucnTurn[] = [...history, { role: "user", content: q }];
    const near = nearest(schools, locale);
    setDraft("");
    setBusy(true);
    setAnswer({ q: null, asked: q, text: "", live: true });

    let text = "";
    try {
      const stop = await askKrucn(
        { messages, locale, playerName: playerName || undefined, nearestPlace: `${near.place} (${near.dir})` },
        (chunk) => {
          text += chunk;
          setAnswer((a) => ({ ...a, text }));
        },
        controller.signal,
      );
      if (!text.trim() || stop === "refusal") throw new Error("empty");
    } catch {
      if (controller.signal.aborted) return;
      text = t.offline;
      setAnswer((a) => ({ ...a, text }));
    }
    if (controller.signal.aborted) return;
    setBusy(false);
    setHistory([...messages, { role: "assistant", content: text }]);
  }

  const shown = answer.live ? answer.text : visible;
  const typing = answer.live ? busy : !done;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="krucn-name"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="reveal-animate absolute inset-x-0 bottom-[calc(24px+env(safe-area-inset-bottom,0px))] z-[60] mx-auto w-[min(720px,calc(100%-24px))] max-md:bottom-[calc(12px+env(safe-area-inset-bottom,0px))]"
    >
      <div className="relative rounded-[26px] border-2 border-[#3FA34D] bg-[#0E061E]/90 p-5 text-[#FFF3E6] shadow-[0_30px_70px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl max-md:rounded-[20px] max-md:p-3">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="absolute top-3 right-3 h-9 w-9 cursor-pointer rounded-full bg-white/10 text-lg leading-none transition hover:bg-white/20 max-md:top-2 max-md:right-2 max-md:h-8 max-md:w-8"
        >
          ×
        </button>
        <div className="flex gap-4 max-md:gap-2.5">
          <span className="shrink-0 self-start overflow-hidden rounded-full ring-2 ring-[#3FA34D] max-md:[&_svg]:h-10 max-md:[&_svg]:w-10">
            <KrucnPortrait />
          </span>
          <div className="min-w-0 flex-1 pr-8">
            <div className="flex items-baseline gap-2">
              <span id="krucn-name" className="font-(family-name:--font-gabarito) text-xl font-black text-[#7FD68A] max-md:text-base">
                Krucn
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/45 uppercase max-md:hidden">{t.role}</span>
            </div>
            {answer.asked && <p className="m-0 mt-1 line-clamp-2 text-[13px] font-bold text-[#FFC85C] max-md:text-[12px]">“{answer.asked}”</p>}
            <p
              className="m-0 mt-1.5 max-h-[38vh] min-h-[4.5em] overflow-y-auto pr-1 text-[15.5px] leading-relaxed whitespace-pre-line max-md:mt-1 max-md:max-h-[26dvh] max-md:min-h-[3em] max-md:text-[13.5px] max-md:leading-snug"
              aria-live="polite"
              aria-busy={typing}
            >
              {answer.live && busy && !shown && <span className="text-white/55">{t.thinking}… </span>}
              {shown}
              {typing && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-[#7FD68A] align-middle" />}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 max-md:mt-2 max-md:gap-1.5">
          {(Object.keys(t.questions) as QuestionId[]).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => ask(q)}
              className={`cursor-pointer rounded-full border-2 px-4 py-2 text-[14px] font-bold transition hover:-translate-y-0.5 max-md:px-3 max-md:py-1.5 max-md:text-[12.5px] ${
                answer.q === q ? "border-[#3FA34D] bg-[#3FA34D] text-white" : "border-white/25 text-[#FFF3E6] hover:border-[#7FD68A]"
              }`}
            >
              {t.questions[q]}
            </button>
          ))}
        </div>
        {agentOn && (
          <form
            className="mt-3 flex gap-2 max-md:mt-2"
            onSubmit={(e) => {
              e.preventDefault();
              void askFree(draft);
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              className="min-w-0 flex-1 rounded-2xl border-2 border-white/15 bg-white/6 px-4 py-2.5 text-[15px] text-[#FFF3E6] outline-none placeholder:text-white/40 focus:border-[#7FD68A] max-md:py-2 max-md:text-base"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              className="shrink-0 cursor-pointer rounded-2xl bg-[#3FA34D] px-5 py-2.5 text-[14px] font-bold text-white transition enabled:hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-45"
            >
              {t.send}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
