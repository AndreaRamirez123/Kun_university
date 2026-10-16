"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { Stats } from "@/lib/types";
import { drawExplainer, THEME_STYLE, type Chapter } from "./campus-explainer";
import { labelFontFamily } from "./campus-label";
import { campusRuntime } from "./campus-runtime";
import { SignupPanel } from "./campus-signup";

// El video se dibuja en un <canvas> de la interfaz (no como textura 3D) a la
// resolución real de la pantalla: así se ve nítido y sin el grano del post-procesado.
const VIDEO_W = 1280;
const VIDEO_H = 720;

function ExplainerCanvas({ chapters, stats }: { chapters: Chapter[]; stats: Stats }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const glow = THEME_STYLE[chapters[0]?.theme ?? "default"].accents[0];
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const family = labelFontFamily();
    let raf = 0;
    const start = performance.now();
    function draw(now: number) {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const e = campusRuntime.explainer;
      ctx.setTransform(w / VIDEO_W, 0, 0, h / VIDEO_H, 0, 0);
      drawExplainer(ctx, VIDEO_W, VIDEO_H, chapters, Math.min(e.chapter, chapters.length - 1), e.local, (now - start) / 1000, family, stats);
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [chapters, stats]);
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={chapters[0]?.title}
      className="aspect-video w-full rounded-[20px] border"
      style={{ borderColor: `${glow}66`, boxShadow: `0 0 90px -12px ${glow}AA` }}
    />
  );
}

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
    howTo: "Mira el video · salta a una carrera en el menú de la izquierda · inscríbete cuando quieras",
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
    howTo: "Watch the video · jump to a program from the left menu · sign up whenever you like",
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
  stats,
  videoUrl,
  playerName,
  defaultProgram = "",
  extraAction,
  schoolName,
  onExit,
}: {
  chapters: Chapter[];
  roomTitle: string;
  stats: Stats;
  /** Video grabado del lugar (ZONE_VIDEO_URLS); si no hay, se muestra el generado. */
  videoUrl?: string | null;
  playerName: string;
  /** Programa preseleccionado en la inscripción (p. ej. el de la escuela). */
  defaultProgram?: string;
  /** Botón extra junto a "Inscríbete": el cohete o el plan de estudios. */
  extraAction?: RoomAction;
  /** Escuela de la sala (para mostrar primero sus carreras al inscribirse). */
  schoolName?: string;
  onExit: () => void;
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
  // El menú toma el color de la escuela (antes era lila en todas las salas).
  const menuColor = THEME_STYLE[chapters[0]?.theme ?? "default"].accents[0];

  return (
    // En celular todo pasa a una sola columna ordenada (salir · video · capítulo ·
    // subtítulos · inscripción); en escritorio cada pieza flota en su esquina.
    <div className="pointer-events-none absolute inset-0 z-30 text-[#FFF3E6] max-md:pointer-events-auto max-md:flex max-md:flex-row max-md:flex-wrap max-md:content-start max-md:gap-2.5 max-md:overflow-y-auto max-md:px-3 max-md:pt-[calc(12px+env(safe-area-inset-top,0px))] max-md:pb-[calc(16px+env(safe-area-inset-bottom,0px))]">
      {/* Arriba a la izquierda: salir */}
      <div className="pointer-events-auto absolute top-[calc(20px+env(safe-area-inset-top,0px))] left-5 flex flex-col gap-2 max-md:static max-md:order-1">
        <button type="button" onClick={onExit} className={`${GLASS} flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition hover:bg-white/10 max-md:h-10`}>
          ← {t.exit}
          <kbd className="rounded border border-white/25 px-1.5 font-mono text-[10px] max-md:hidden">Esc</kbd>
        </button>
        <span className={`${MONO} pl-2 text-[10px] text-white/50 max-md:hidden`}>{roomTitle}</span>
      </div>

      {/* Arriba a la derecha: VIDEO —— INSCRIPCIÓN y selector de capítulo */}
      <div className="pointer-events-auto absolute top-[calc(20px+env(safe-area-inset-top,0px))] right-5 flex flex-col items-end gap-3 max-md:contents">
        <div className={`${GLASS} flex items-center gap-4 rounded-full px-6 py-3 shadow-[0_0_40px_-10px_rgba(201,160,255,0.6)] max-md:order-2 max-md:ml-auto max-md:h-10 max-md:gap-2.5 max-md:px-4 max-md:py-0`}>
          <button type="button" onClick={() => setMode("video")} className={`${MONO} cursor-pointer text-[15px] font-bold transition max-md:text-[12px] ${mode === "video" ? "text-white" : "text-white/45 hover:text-white"}`}>
            {t.video}
          </button>
          <span aria-hidden className="h-[2px] w-16 rounded-full max-md:w-5" style={{ background: "linear-gradient(90deg, transparent, #fff, transparent)" }} />
          <button type="button" onClick={() => setMode("signup")} className={`${MONO} cursor-pointer text-[15px] font-bold transition max-md:text-[12px] ${mode === "signup" ? "text-white" : "text-white/45 hover:text-white"}`}>
            {t.signup}
          </button>
        </div>
        <div hidden={mode === "signup"} className={`${GLASS} flex items-center gap-2 rounded-xl p-1.5 max-md:order-4 max-md:w-full`}>
          <button type="button" aria-label={t.prev} onClick={() => goTo(chapter - 1)} className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-white/15 font-mono text-sm hover:bg-white/10">
            {"<<"}
          </button>
          <span className={`${MONO} w-40 truncate text-center text-[11px] text-white/75 max-md:w-auto max-md:flex-1`}>{current?.menu}</span>
          <button type="button" aria-label={t.next} onClick={() => goTo(chapter + 1)} className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-white/15 font-mono text-sm hover:bg-white/10">
            {">>"}
          </button>
        </div>
      </div>

      {/* Centro: el video, nítido, dibujado a la resolución real de la pantalla */}
      {mode === "video" && (
        <div className="absolute top-[13%] left-1/2 flex w-[min(54vw,1100px)] -translate-x-1/2 flex-col items-center gap-2 max-md:static max-md:order-3 max-md:w-full max-md:translate-x-0">
          <p className={`${MONO} m-0 text-center text-[11px] text-white/70 [text-shadow:0_2px_10px_rgba(0,0,0,0.9)] max-md:hidden`}>{t.howTo}</p>
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full rounded-[20px] border border-white/15 bg-black shadow-[0_0_80px_-10px_rgba(201,160,255,0.55)]"
            />
          ) : (
            <ExplainerCanvas chapters={chapters} stats={stats} />
          )}
        </div>
      )}

      {/* Izquierda: menú de capítulos */}
      <nav aria-label={t.lookingFor} hidden={mode === "signup"} className="pointer-events-auto absolute bottom-[calc(120px+env(safe-area-inset-bottom,0px))] left-10 flex max-w-[19vw] flex-col gap-3 max-md:hidden">
        <div className={`${MONO} mb-1 text-[15px] font-bold text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]`}>{t.lookingFor}</div>
        {chapters.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => goTo(i)}
            aria-current={i === chapter ? "true" : undefined}
            title={c.menu}
            className={`${MONO} cursor-pointer truncate text-left text-[14px] transition-[padding,color] [text-shadow:0_2px_12px_rgba(0,0,0,0.8)] ${
              i === chapter ? "pl-4 font-bold text-white" : "hover:pl-2 hover:text-white"
            }`}
            style={i === chapter ? undefined : { color: menuColor }}
          >
            {"-> "}
            {c.menu}
          </button>
        ))}
      </nav>
      <div hidden={mode === "signup"} className="pointer-events-auto absolute bottom-[calc(40px+env(safe-area-inset-bottom,0px))] left-8 flex flex-wrap gap-2 max-md:static max-md:order-5 max-md:w-full max-md:flex-nowrap">
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`${GLASS} ${MONO} cursor-pointer rounded-full px-7 py-3.5 text-[14px] text-[#C9A0FF] transition hover:text-white hover:shadow-[0_0_30px_-6px_rgba(201,160,255,0.8)] max-md:flex-1 max-md:border-(--cta) max-md:bg-(--cta-soft) max-md:px-4 max-md:py-3 max-md:text-[13px] max-md:font-bold max-md:text-white`}
          style={{ "--cta": menuColor, "--cta-soft": `${menuColor}40` } as React.CSSProperties}
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
              className={`${GLASS} ${MONO} cursor-pointer rounded-full px-5 py-3.5 text-[12px] text-white/75 transition hover:text-white max-md:shrink-0 max-md:px-4 max-md:py-3 max-md:text-[11px]`}
            >
              {extraAction.label}
            </button>
          ))}
      </div>

      {/* Abajo al centro: subtítulos y controles */}
      {mode === "video" && current && (
        <div className="pointer-events-auto absolute bottom-[calc(28px+env(safe-area-inset-bottom,0px))] left-1/2 w-[min(640px,calc(100%-32px))] -translate-x-1/2 max-md:static max-md:order-6 max-md:w-full max-md:translate-x-0">
          <div className={`${GLASS} rounded-2xl px-5 py-3 max-md:px-3.5 max-md:py-2.5`}>
            <p className="m-0 text-center text-[15px] leading-snug max-md:text-[13px]" aria-live="polite">
              {current.voice}
            </p>
            <div className="mt-3 flex items-center gap-3 max-md:mt-2 max-md:gap-2">
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

      {/* Inscripción: tarjeta centrada y enfocada, en el color de la escuela */}
      {mode === "signup" && (
        <SignupPanel
          accent={menuColor}
          schoolName={schoolName}
          defaultProgram={defaultProgram}
          playerName={playerName}
          onClose={() => setMode("video")}
        />
      )}    </div>
  );
}
