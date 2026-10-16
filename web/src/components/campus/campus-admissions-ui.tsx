"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, usePick } from "@/i18n/locale-context";
import { ADMISSIONS_EMAIL } from "@/lib/contact";
import type { School } from "@/lib/types";
import type { Chapter } from "./campus-explainer";
import { campusRuntime } from "./campus-runtime";

// Interfaz de la sala de Admisiones, inspirada en activetheory.net/work:
// menú de capítulos en tipografía mono, selector VIDEO / INSCRIPCIÓN arriba a la
// derecha, subtítulos y controles abajo. El formulario sirve solo para inscribirse.

const COPY = {
  es: {
    room: "Admisiones · KUN University AI",
    exit: "Salir al campus",
    video: "Video",
    signup: "Inscripción",
    lookingFor: "¿Qué quieres saber?",
    cta: "Inscríbete ahora…",
    pause: "Pausar",
    play: "Reproducir",
    voiceOn: "Narración: sí",
    voiceOff: "Narración: no",
    formTitle: "Inscríbete",
    formBody: "Déjanos tus datos y un asesor de admisiones te contacta.",
    name: "Nombre completo",
    email: "Email",
    phone: "Teléfono",
    program: "Programa de interés",
    choose: "Elige un programa",
    send: "Enviar inscripción →",
    orEmail: "¿Prefieres escribirnos?",
    prev: "Capítulo anterior",
    next: "Capítulo siguiente",
  },
  en: {
    room: "Admissions · KUN University AI",
    exit: "Back to campus",
    video: "Video",
    signup: "Sign up",
    lookingFor: "What do you want to know?",
    cta: "Sign up now…",
    pause: "Pause",
    play: "Play",
    voiceOn: "Narration: on",
    voiceOff: "Narration: off",
    formTitle: "Sign up",
    formBody: "Leave your details and an admissions advisor will contact you.",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    program: "Program of interest",
    choose: "Choose a program",
    send: "Send sign-up →",
    orEmail: "Prefer email?",
    prev: "Previous chapter",
    next: "Next chapter",
  },
};

const MONO = "font-mono uppercase tracking-[0.12em]";
const GLASS = "border border-white/15 bg-[#0A0516]/70 backdrop-blur-xl";
const FIELD = `h-11 rounded-xl border border-white/20 bg-white/5 px-3.5 text-[15px] text-[#FFF3E6] placeholder:text-white/35 focus:border-[#C9A0FF] focus:outline-none`;

function speak(text: string, locale: "es" | "en", onEnd: () => void) {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale === "es" ? "es-ES" : "en-US";
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(locale));
  if (voice) u.voice = voice;
  u.rate = 1.02;
  u.onend = onEnd;
  synth.speak(u);
}

export type RoomAction = { label: string; onClick?: () => void; href?: string };

export function StudioRoom({
  chapters,
  roomTitle,
  schools,
  playerName,
  defaultProgram = "",
  extraAction,
  onExit,
  onSubmitted,
}: {
  chapters: Chapter[];
  roomTitle: string;
  schools: School[];
  playerName: string;
  /** Programa preseleccionado en la inscripción (p. ej. el de la escuela). */
  defaultProgram?: string;
  /** Botón extra junto a "Inscríbete": el cohete o el plan de estudios. */
  extraAction?: RoomAction;
  onExit: () => void;
  onSubmitted: () => void;
}) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  const [chapter, setChapter] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [voice, setVoice] = useState(false);
  const [mode, setMode] = useState<"video" | "signup">("video");
  const progress = useRef<HTMLDivElement>(null);
  const speaking = useRef(false);

  // Al entrar, el video arranca desde el principio.
  useEffect(() => {
    const e = campusRuntime.explainer;
    e.chapter = 0;
    e.local = 0;
    e.playing = true;
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Sigue el capítulo que avanza la pantalla 3D y mueve la barra de progreso.
  useEffect(() => {
    let raf = 0;
    let last = -1;
    function tick() {
      const e = campusRuntime.explainer;
      // Con narración, el capítulo espera a que la voz termine de hablar.
      if (speaking.current && e.local > 0.95) e.local = 0.95;
      if (e.chapter !== last) {
        last = e.chapter;
        setChapter(e.chapter);
      }
      if (progress.current) progress.current.style.width = `${((e.chapter + e.local) / chapters.length) * 100}%`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chapters.length]);

  // Narración del capítulo actual.
  useEffect(() => {
    if (!voice || !playing) {
      window.speechSynthesis?.cancel();
      speaking.current = false;
      return;
    }
    speaking.current = true;
    speak(chapters[chapter]?.voice ?? "", locale, () => {
      speaking.current = false;
    });
  }, [voice, playing, chapter, chapters, locale]);

  useEffect(() => {
    campusRuntime.explainer.playing = playing;
  }, [playing]);

  function goTo(i: number) {
    const n = chapters.length;
    const e = campusRuntime.explainer;
    e.chapter = ((i % n) + n) % n;
    e.local = 0;
    setChapter(e.chapter);
    setMode("video");
    setPlaying(true);
  }

  const current = chapters[chapter];

  return (
    <div className="pointer-events-none absolute inset-0 z-30 text-[#FFF3E6]">
      {/* Arriba a la izquierda: salir */}
      <div className="pointer-events-auto absolute top-[calc(20px+env(safe-area-inset-top,0px))] left-5 flex flex-col gap-2">
        <button type="button" onClick={onExit} className={`${GLASS} flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition hover:bg-white/10`}>
          ← {t.exit}
          <kbd className="rounded border border-white/25 px-1.5 font-mono text-[10px] max-md:hidden">Esc</kbd>
        </button>
        <span className={`${MONO} pl-2 text-[10px] text-white/50`}>{roomTitle}</span>
      </div>

      {/* Arriba a la derecha: VIDEO —— INSCRIPCIÓN y selector de capítulo */}
      <div className="pointer-events-auto absolute top-[calc(20px+env(safe-area-inset-top,0px))] right-5 flex flex-col items-end gap-3 max-md:top-auto max-md:right-3 max-md:bottom-[calc(200px+env(safe-area-inset-bottom,0px))]">
        <div className={`${GLASS} flex items-center gap-4 rounded-full px-6 py-3 shadow-[0_0_40px_-10px_rgba(201,160,255,0.6)] max-md:px-4`}>
          <button type="button" onClick={() => setMode("video")} className={`${MONO} cursor-pointer text-[15px] font-bold transition ${mode === "video" ? "text-white" : "text-white/45 hover:text-white"}`}>
            {t.video}
          </button>
          <span aria-hidden className="h-[2px] w-16 rounded-full max-md:w-8" style={{ background: "linear-gradient(90deg, transparent, #fff, transparent)" }} />
          <button type="button" onClick={() => setMode("signup")} className={`${MONO} cursor-pointer text-[15px] font-bold transition ${mode === "signup" ? "text-white" : "text-white/45 hover:text-white"}`}>
            {t.signup}
          </button>
        </div>
        <div className={`${GLASS} flex items-center gap-2 rounded-xl p-1.5`}>
          <button type="button" aria-label={t.prev} onClick={() => goTo(chapter - 1)} className="h-9 w-10 cursor-pointer rounded-lg border border-white/15 font-mono text-sm hover:bg-white/10">
            {"<<"}
          </button>
          <span className={`${MONO} w-40 truncate text-center text-[11px] text-white/75`}>{current?.menu}</span>
          <button type="button" aria-label={t.next} onClick={() => goTo(chapter + 1)} className="h-9 w-10 cursor-pointer rounded-lg border border-white/15 font-mono text-sm hover:bg-white/10">
            {">>"}
          </button>
        </div>
      </div>

      {/* Izquierda: menú de capítulos */}
      <nav aria-label={t.lookingFor} className="pointer-events-auto absolute bottom-[calc(120px+env(safe-area-inset-bottom,0px))] left-10 flex flex-col gap-3 max-md:hidden">
        <div className={`${MONO} mb-1 text-[15px] font-bold text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]`}>{t.lookingFor}</div>
        {chapters.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => goTo(i)}
            aria-current={i === chapter ? "true" : undefined}
            className={`${MONO} cursor-pointer text-left text-[15px] transition-[padding,color] [text-shadow:0_2px_12px_rgba(0,0,0,0.8)] ${
              i === chapter ? "pl-4 font-bold text-white" : "text-[#B9A8FF] hover:pl-2 hover:text-white"
            }`}
          >
            {"-> "}
            {c.menu}
          </button>
        ))}
      </nav>
      <div className="pointer-events-auto absolute bottom-[calc(40px+env(safe-area-inset-bottom,0px))] left-8 flex flex-wrap gap-2 max-md:bottom-[calc(96px+env(safe-area-inset-bottom,0px))] max-md:left-1/2 max-md:-translate-x-1/2">
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`${GLASS} ${MONO} cursor-pointer rounded-full px-7 py-3.5 text-[14px] text-[#C9A0FF] transition hover:text-white hover:shadow-[0_0_30px_-6px_rgba(201,160,255,0.8)]`}
        >
          {t.cta}
        </button>
        {extraAction &&
          (extraAction.href ? (
            <a
              href={extraAction.href}
              className={`${GLASS} ${MONO} rounded-full px-5 py-3.5 text-[12px] text-white/75 no-underline transition hover:text-white max-md:hidden`}
            >
              {extraAction.label}
            </a>
          ) : (
            <button
              type="button"
              onClick={extraAction.onClick}
              className={`${GLASS} ${MONO} cursor-pointer rounded-full px-5 py-3.5 text-[12px] text-white/75 transition hover:text-white`}
            >
              {extraAction.label}
            </button>
          ))}
      </div>

      {/* Abajo al centro: subtítulos y controles */}
      {mode === "video" && current && (
        <div className="pointer-events-auto absolute bottom-[calc(28px+env(safe-area-inset-bottom,0px))] left-1/2 w-[min(640px,calc(100%-32px))] -translate-x-1/2 max-md:bottom-[calc(150px+env(safe-area-inset-bottom,0px))]">
          <div className={`${GLASS} rounded-2xl px-5 py-3`}>
            <p className="m-0 text-center text-[15px] leading-snug" aria-live="polite">
              {current.voice}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button type="button" onClick={() => setPlaying((p) => !p)} className={`${MONO} cursor-pointer rounded-full border border-white/20 px-3 py-1 text-[11px] hover:bg-white/10`}>
                {playing ? `❚❚ ${t.pause}` : `▶ ${t.play}`}
              </button>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                <div ref={progress} className="h-full rounded-full" style={{ width: "0%", background: current.accent }} />
              </div>
              <button
                type="button"
                aria-pressed={voice}
                onClick={() => setVoice((v) => !v)}
                className={`${MONO} cursor-pointer rounded-full border px-3 py-1 text-[11px] transition ${voice ? "border-[#C9A0FF] bg-[#C9A0FF]/20" : "border-white/20 hover:bg-white/10"}`}
              >
                🔊 {voice ? t.voiceOn : t.voiceOff}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de inscripción */}
      {mode === "signup" && (
        <div className="pointer-events-auto absolute top-1/2 right-6 w-[min(420px,calc(100%-24px))] -translate-y-1/2 max-md:top-auto max-md:right-3 max-md:bottom-[calc(16px+env(safe-area-inset-bottom,0px))] max-md:left-3 max-md:w-auto max-md:translate-y-0">
          <form
            className={`${GLASS} reveal-animate-right flex flex-col gap-3 rounded-[24px] p-6 shadow-[0_0_60px_-20px_rgba(201,160,255,0.7)]`}
            onSubmit={(e) => {
              e.preventDefault();
              setMode("video");
              onSubmitted();
            }}
          >
            <h2 className={`${MONO} m-0 text-xl font-bold`}>{t.formTitle}</h2>
            <p className="m-0 text-[13px] text-white/60">{t.formBody}</p>
            <input required name="name" defaultValue={playerName} placeholder={t.name} aria-label={t.name} className={FIELD} />
            <input required type="email" name="email" autoComplete="email" placeholder={t.email} aria-label={t.email} className={FIELD} />
            <input required type="tel" name="phone" autoComplete="tel" placeholder={t.phone} aria-label={t.phone} className={FIELD} />
            <select required name="program" defaultValue={defaultProgram} aria-label={t.program} className={FIELD}>
              <option value="" disabled className="text-[#24123F]">
                {t.choose}
              </option>
              {schools.flatMap((s) =>
                s.programs.map((p) => (
                  <option key={`${s.slug}-${p.name}`} value={p.name} className="text-[#24123F]">
                    {p.name} · {s.name[locale]}
                  </option>
                )),
              )}
            </select>
            <button
              type="submit"
              className={`${MONO} mt-1 h-12 cursor-pointer rounded-full bg-white text-[13px] font-bold text-[#0A0516] transition hover:shadow-[0_0_30px_-4px_rgba(255,255,255,0.8)]`}
            >
              {t.send}
            </button>
            <p className="m-0 text-center text-[12px] text-white/55">
              {t.orEmail}{" "}
              <a href={`mailto:${ADMISSIONS_EMAIL}`} className="font-bold text-[#C9A0FF] underline">
                {ADMISSIONS_EMAIL}
              </a>
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
