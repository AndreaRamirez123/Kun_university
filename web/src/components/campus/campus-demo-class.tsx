"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { Stats } from "@/lib/types";
import { playChime } from "./campus-audio";
import { chapterSeconds, demoChapters, findDemo, markLesson, stonesFor, useDemoProgress, type Station } from "./campus-demo";
import { Cairn, CampusDemoCircuit, STATION_STYLE } from "./campus-demo-circuit";
import { drawExplainer, THEME_STYLE } from "./campus-explainer";
import { labelFontFamily } from "./campus-label";
import { resetCampusInput } from "./campus-runtime";
import { earn } from "./campus-wallet";

// Página de una materia con demo (se abre dentro de su escuela, desde el
// catálogo): lecciones narradas tipo curso en línea, con temporizador, velocidad,
// idioma, lecciones marcadas como vistas y preguntas rápidas entre lecciones; y el
// Circuito de repaso (Sauna, Piscina, Jardín) de la misma materia.

const COPY = {
  es: {
    kicker: "Clase demo",
    close: "Cerrar",
    back: "← Volver al programa",
    play: "Reproducir",
    pause: "Pausar",
    prev: "Lección anterior",
    next: "Lección siguiente",
    voice: "Narración",
    captions: "Subtítulos",
    speed: "Velocidad",
    lessons: "Contenido de la clase",
    progress: (d: number, n: number) => `${d} de ${n} lecciones vistas`,
    quick: "Pregunta rápida",
    right: "¡Correcto!",
    wrong: "Casi.",
    continue: "Continuar",
    upNext: "Siguiente lección",
    inSec: (s: number) => `en ${s} s`,
    now: "Ver ahora",
    stay: "Quedarme aquí",
    done: "¡Terminaste la clase demo! Ahora pon a prueba lo aprendido en el Circuito de repaso.",
    replay: "Ver de nuevo",
    circuit: "Circuito de repaso",
    circuitHint: "Tres estaciones como un spa termal. Cada una levanta tu torre de piedras y da KUN Coins.",
    stations: { quiz: "Sauna · concurso", match: "Piscina · emparejar", sort: "Jardín · clasificar" } as Record<Station, string>,
    notYet: "Sin intentar",
    lang: "Idioma de la clase",
  },
  en: {
    kicker: "Demo class",
    close: "Close",
    back: "← Back to the program",
    play: "Play",
    pause: "Pause",
    prev: "Previous lesson",
    next: "Next lesson",
    voice: "Narration",
    captions: "Captions",
    speed: "Speed",
    lessons: "Class content",
    progress: (d: number, n: number) => `${d} of ${n} lessons watched`,
    quick: "Quick question",
    right: "Correct!",
    wrong: "Almost.",
    continue: "Continue",
    upNext: "Next lesson",
    inSec: (s: number) => `in ${s}s`,
    now: "Watch now",
    stay: "Stay here",
    done: "You finished the demo class! Now test what you learned in the Review circuit.",
    replay: "Watch again",
    circuit: "Review circuit",
    circuitHint: "Three stations like a thermal spa. Each one builds your stone tower and earns KUN Coins.",
    stations: { quiz: "Sauna · quiz", match: "Pool · match", sort: "Garden · sort" } as Record<Station, string>,
    notYet: "Not tried",
    lang: "Class language",
  },
};

const VIDEO_W = 1280;
const VIDEO_H = 720;
const SPEEDS = [1, 1.25, 1.5, 2];
const STATIONS: Station[] = ["quiz", "match", "sort"];
const MONO = "font-mono uppercase tracking-[0.14em]";

/** Subtítulos: la narración partida en frases cortas, con el carácter donde empieza cada una. */
function captionChunks(text: string) {
  const chunks: Array<{ at: number; text: string }> = [];
  const re = /[^.!?…;:]+[.!?…;:]*\s*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const words = m[0].trim().split(/\s+/);
    let at = m.index;
    for (let i = 0; i < words.length; i += 14) {
      const part = words.slice(i, i + 14).join(" ");
      chunks.push({ at, text: part });
      at += part.length + 1;
    }
  }
  return chunks;
}

const clock = (t: number) => {
  const s = Math.max(0, t);
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

type Gate = null | { kind: "check"; picked: number | null } | { kind: "next"; left: number } | { kind: "finished" };

export function CampusDemoCourse({ code, stats, onClose }: { code: string; stats: Stats; onClose: () => void }) {
  const demo = findDemo(code);
  if (!demo) return null;
  return <Course key={demo.code} demo={demo} stats={stats} onClose={onClose} />;
}

function Course({ demo, stats, onClose }: { demo: NonNullable<ReturnType<typeof findDemo>>; stats: Stats; onClose: () => void }) {
  const t = usePick(COPY);
  const { locale, setLocale } = useLocale();
  const chapters = useMemo(() => demoChapters(demo, locale), [demo, locale]);
  const progress = useDemoProgress();
  const done = progress.done[demo.code] ?? [];
  const best = progress.best[demo.code] ?? {};

  const [index, setIndex] = useState(() => {
    // Retoma en la primera lección sin ver.
    const first = demo.class.findIndex((c) => !done.includes(c.id));
    return first < 0 ? 0 : first;
  });
  const [playing, setPlaying] = useState(true);
  const [voice, setVoice] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [gate, setGate] = useState<Gate>(null);
  const [station, setStation] = useState<Station | null>(null);

  const canvas = useRef<HTMLCanvasElement>(null);
  const timeText = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  // char: carácter que va leyendo la voz (-1 si no hay voz que lo informe).
  const clockRef = useRef({ local: 0, speaking: false, char: -1 });
  const caption = useRef<HTMLSpanElement>(null);
  const speech = useRef({ key: "" });

  // Duración de cada lección a la velocidad elegida, y dónde empieza en la línea de tiempo.
  const chunks = useMemo(() => chapters.map((c) => captionChunks(c.voice)), [chapters]);
  const durations = useMemo(() => chapters.map((c) => chapterSeconds(c.voice) / speed), [chapters, speed]);
  const starts = useMemo(() => durations.map((_, i) => durations.slice(0, i).reduce((a, b) => a + b, 0)), [durations]);
  const total = durations.reduce((a, b) => a + b, 0);

  const live = useRef({ index, playing, durations, starts, total, gate, chunks });
  useEffect(() => {
    live.current = { index, playing, durations, starts, total, gate, chunks };
  });

  // Esc: cierra primero la estación abierta y luego la materia (antes que el catálogo de abajo).
  const keyState = useRef({ station, onClose });
  useEffect(() => {
    keyState.current = { station, onClose };
  });
  useEffect(() => {
    resetCampusInput();
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      if (keyState.current.station) setStation(null);
      else keyState.current.onClose();
    }
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Narración: se pausa y se retoma sin volver a empezar la lección.
  useEffect(() => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) return;
    const active = playing && !gate && station === null;
    const key = `${index}|${locale}|${speed}`;
    if (!voice) {
      synth.cancel();
      speech.current.key = "";
      clockRef.current.speaking = false;
      return;
    }
    if (!active) {
      if (synth.speaking) synth.pause();
      return;
    }
    if (speech.current.key === key && synth.paused) {
      synth.resume();
      return;
    }
    if (speech.current.key === key && synth.speaking) return;
    synth.cancel();
    speech.current.key = key;
    const u = new SpeechSynthesisUtterance(chapters[index].voice);
    u.lang = locale === "es" ? "es-ES" : "en-US";
    u.rate = speed;
    clockRef.current.char = -1;
    u.onstart = () => (clockRef.current.speaking = true);
    u.onboundary = (e) => (clockRef.current.char = e.charIndex);
    u.onend = () => (clockRef.current.speaking = false);
    synth.speak(u);
  }, [index, voice, playing, gate, station, chapters, locale, speed]);

  // Al terminar una lección: se marca vista y viene la pregunta rápida o la siguiente.
  const finishLesson = useRef<(i: number) => void>(() => {});
  useEffect(() => {
    finishLesson.current = (i: number) => {
      setPlaying(false);
      markLesson(demo.code, demo.class[i].id);
      const seen = new Set([...done, demo.class[i].id]);
      if (demo.class.every((c) => seen.has(c.id))) earn("demoClass", demo.code);
      if (demo.class[i].check) setGate({ kind: "check", picked: null });
      else if (i < chapters.length - 1) setGate({ kind: "next", left: 4 });
      else setGate({ kind: "finished" });
    };
  });

  // Video: dibujo y reloj.
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const family = labelFontFamily();
    let raf = 0;
    let last = performance.now();
    const start = last;
    function frame(now: number) {
      if (!el || !ctx) return;
      const dt = Math.min(1, (now - last) / 1000);
      last = now;
      const s = live.current;
      const c = clockRef.current;
      if (s.playing && !s.gate) {
        // Con narración, la lección no termina mientras se sigue hablando.
        c.local = Math.min(c.speaking ? 0.96 : 1, c.local + dt / s.durations[s.index]);
        if (c.local >= 1) {
          c.local = 1;
          finishLesson.current(s.index);
        }
      }
      const elapsed = s.starts[s.index] + c.local * s.durations[s.index];
      if (timeText.current) timeText.current.textContent = `${clock(elapsed)} / ${clock(s.total)}`;
      if (bar.current) bar.current.style.width = `${(elapsed / s.total) * 100}%`;
      if (caption.current) {
        const list = s.chunks[s.index];
        const len = list.length ? list[list.length - 1].at + list[list.length - 1].text.length : 1;
        // Con voz se sigue lo que va diciendo; sin voz, el avance de la lección.
        const at = c.speaking && c.char >= 0 ? c.char : (c.local / 0.96) * len;
        let k = 0;
        while (k < list.length - 1 && list[k + 1].at <= at) k++;
        const text = list[k]?.text ?? "";
        if (caption.current.textContent !== text) caption.current.textContent = text;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(el.clientWidth * dpr);
      const h = Math.round(el.clientHeight * dpr);
      if (el.width !== w || el.height !== h) {
        el.width = w;
        el.height = h;
      }
      ctx.setTransform(w / VIDEO_W, 0, 0, h / VIDEO_H, 0, 0);
      drawExplainer(ctx, VIDEO_W, VIDEO_H, chapters, s.index, Math.min(0.89, c.local), (now - start) / 1000, family, stats);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [chapters, stats]);

  const go = (i: number) => {
    const next = Math.max(0, Math.min(chapters.length - 1, i));
    clockRef.current.local = 0;
    speech.current.key = "";
    setGate(null);
    setIndex(next);
    setPlaying(true);
  };

  // Cuenta regresiva hacia la siguiente lección.
  useEffect(() => {
    if (gate?.kind !== "next") return;
    const id = window.setTimeout(() => {
      if (gate.left <= 1) go(index + 1);
      else setGate({ kind: "next", left: gate.left - 1 });
    }, 1000);
    return () => window.clearTimeout(id);
    // go solo cambia estado; no hace falta como dependencia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gate, index]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const at = ((e.clientX - r.left) / r.width) * total;
    let i = starts.findIndex((s, k) => at >= s && at < s + durations[k]);
    if (i < 0) i = chapters.length - 1;
    go(i);
  };

  const accent = THEME_STYLE.wellness.accents[0];
  const ch = demo.class[index];
  const check = ch.check;
  const pct = Math.round((done.length / demo.class.length) * 100);
  const btn = `${MONO} cursor-pointer rounded-full border border-white/20 px-3 py-1.5 text-[11px] hover:bg-white/10`;

  return (
    <div className="absolute inset-0 z-[70] overflow-y-auto bg-[#06131A]/96 text-[#FFF3E6] backdrop-blur-md">
      <div className="mx-auto flex min-h-full max-w-[1320px] flex-col gap-4 px-6 py-4 max-md:px-3 max-md:py-3">
        {/* Encabezado: materia, progreso e idioma */}
        {/* En celular: arriba volver, idioma y cerrar; debajo el nombre de la materia a todo el ancho. */}
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-5 gap-y-2 max-md:grid-cols-[minmax(0,1fr)_auto_auto] max-md:gap-x-2">
          <button type="button" onClick={onClose} className={`${MONO} cursor-pointer justify-self-start text-[11px] text-white/60 hover:text-white`}>
            {t.back}
          </button>
          <div className="min-w-0 max-md:order-last max-md:col-span-3">
            <div className={`${MONO} truncate text-[10.5px] text-white/50`}>
              {t.kicker} · {demo.code}
              <span className="max-md:hidden"> · {demo.program[locale]}</span>
            </div>
            <h2 className="m-0 truncate font-(family-name:--font-gabarito) text-[22px] font-black max-md:line-clamp-2 max-md:text-[19px] max-md:leading-tight max-md:whitespace-normal">
              {demo.name[locale]}
            </h2>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-white/15 p-1" role="group" aria-label={t.lang}>
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={locale === l}
                onClick={() => {
                  if (l === locale) return;
                  clockRef.current.local = 0;
                  setLocale(l);
                }}
                className={`cursor-pointer rounded-full px-3 py-1 text-[12px] font-bold ${locale === l ? "bg-white text-[#06131A]" : "text-white/70 hover:text-white"}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} aria-label={t.close} className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 text-xl transition hover:bg-white/10">
            ×
          </button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
          {/* Reproductor */}
          <div className="flex min-w-0 flex-col gap-3">
            <div className="relative overflow-hidden rounded-[18px] border bg-black" style={{ borderColor: `${accent}44` }}>
              <div className="relative">
              <canvas ref={canvas} role="img" aria-label={chapters[index].title} className="block aspect-video w-full" onClick={() => !gate && setPlaying((p) => !p)} />
              {captions && !gate && (
                <p className="pointer-events-none absolute inset-x-[8%] bottom-[19%] m-0 text-center max-md:inset-x-[4%] max-md:bottom-[6%]">
                  <span ref={caption} className="inline rounded-md bg-black/72 box-decoration-clone px-2.5 py-1 text-[19px] leading-[1.55] font-semibold max-md:text-[12px]" />
                </p>
              )}
              {!playing && !gate && (
                <button type="button" onClick={() => setPlaying(true)} aria-label={t.play} className="absolute inset-0 m-auto grid h-20 w-20 cursor-pointer place-items-center rounded-full text-3xl text-[#06131A] shadow-2xl" style={{ background: accent }}>
                  ▶
                </button>
              )}
              </div>
              {gate && <GateCard gate={gate} setGate={setGate} check={check} locale={locale} next={chapters[index + 1]?.title} onNext={() => go(index + 1)} onReplay={() => go(0)} onCircuit={() => setStation("quiz")} last={index === chapters.length - 1} />}
              {/* Barra de controles */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 pt-6 pb-2.5 max-md:static max-md:bg-none max-md:bg-[#0B1A22] max-md:px-3 max-md:pt-3">
                <div className="group relative h-2 cursor-pointer rounded-full bg-white/20" onClick={seek} role="slider" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progreso">
                  <div ref={bar} className="absolute inset-y-0 left-0 rounded-full" style={{ background: accent }} />
                  {starts.slice(1).map((s, i) => (
                    <span key={i} className="absolute top-0 h-2 w-[3px] bg-black/70" style={{ left: `${(s / total) * 100}%` }} />
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[13px] max-md:gap-1.5 max-md:text-[11px]">
                  <button type="button" onClick={() => go(index - 1)} aria-label={t.prev} className="cursor-pointer px-1.5 text-lg">
                    ⏮
                  </button>
                  <button type="button" onClick={() => !gate && setPlaying((p) => !p)} aria-label={playing ? t.pause : t.play} className="w-8 cursor-pointer text-xl">
                    {playing && !gate ? "❚❚" : "▶"}
                  </button>
                  <button type="button" onClick={() => go(index + 1)} aria-label={t.next} className="cursor-pointer px-1.5 text-lg">
                    ⏭
                  </button>
                  <span ref={timeText} className="font-mono tabular-nums text-white/85" />
                  <span className="flex-1" />
                  <button type="button" onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])} aria-label={t.speed} className="cursor-pointer rounded-md border border-white/30 px-2 py-0.5 font-mono font-bold">
                    {speed}x
                  </button>
                  <button type="button" aria-pressed={captions} onClick={() => setCaptions((c) => !c)} aria-label={t.captions} className={`cursor-pointer rounded-md border px-2 py-0.5 font-bold ${captions ? "border-white bg-white text-black" : "border-white/30"}`}>
                    CC
                  </button>
                  <button type="button" aria-pressed={voice} onClick={() => setVoice((v) => !v)} aria-label={t.voice} className="cursor-pointer px-1 text-lg">
                    {voice ? "🔊" : "🔇"}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="m-0 font-(family-name:--font-gabarito) text-[19px] font-extrabold">
                <span className="mr-2 font-mono text-[13px] text-white/45">{String(index + 1).padStart(2, "0")}</span>
                {chapters[index].title}
              </h3>
              <div className="flex gap-2">
                <button type="button" onClick={() => go(index - 1)} className={btn}>
                  « {t.prev}
                </button>
                <button type="button" onClick={() => go(index + 1)} className={`${btn} border-transparent font-bold text-[#06131A]`} style={{ background: accent }}>
                  {t.next} »
                </button>
              </div>
            </div>
            <p className="m-0 text-[11.5px] leading-snug text-white/45">{demo.disclaimer[locale]}</p>
          </div>

          {/* Contenido: lecciones marcadas y circuito de repaso */}
          <aside className="flex flex-col gap-4">
            <section className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
              <div className={`${MONO} text-[11px] text-white/55`}>{t.lessons}</div>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/12">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: accent }} />
                </div>
                <b className="font-mono text-[12px]">{pct}%</b>
              </div>
              <div className="mt-1 text-[12px] text-white/55">{t.progress(done.length, demo.class.length)}</div>
              <ol className="m-0 mt-3 flex list-none flex-col gap-1 p-0">
                {chapters.map((c, i) => {
                  const seen = done.includes(demo.class[i].id);
                  const current = i === index;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => go(i)}
                        aria-current={current ? "true" : undefined}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[13.5px] transition ${current ? "bg-white/12" : "hover:bg-white/6"}`}
                      >
                        <span
                          aria-hidden
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[11px] font-black ${seen ? "border-transparent text-[#06131A]" : current ? "text-white" : "border-white/25 text-white/45"}`}
                          style={seen ? { background: accent } : current ? { borderColor: accent } : undefined}
                        >
                          {seen ? "✓" : current ? "▶" : i + 1}
                        </span>
                        <span className={`min-w-0 flex-1 ${current ? "font-bold text-white" : seen ? "text-white/70" : "text-white/80"}`}>
                          {c.menu}
                          {demo.class[i].check && <span className="ml-1.5 text-[11px] text-white/45">· ❓</span>}
                        </span>
                        <span className="font-mono text-[11px] text-white/45">{clock(durations[i])}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
            <section className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
              <div className={`${MONO} text-[11px] text-white/55`}>♨️ {t.circuit}</div>
              <p className="m-0 mt-1 text-[12px] leading-snug text-white/60">{t.circuitHint}</p>
              <div className="mt-3 flex flex-col gap-2">
                {STATIONS.map((s) => {
                  const score = best[s];
                  const style = STATION_STYLE[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStation(s)}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-white/30"
                      style={{ background: `linear-gradient(90deg, ${style.color}26, transparent)` }}
                    >
                      <span aria-hidden className="text-2xl">
                        {style.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-bold">{t.stations[s]}</span>
                        <span className="block text-[11.5px] text-white/55">{score === undefined ? t.notYet : `${score}%`}</span>
                      </span>
                      <Cairn n={score === undefined ? 0 : stonesFor(score)} color={style.color} size={46} />
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
      {station && <CampusDemoCircuit key={station} demo={demo} station={station} onClose={() => setStation(null)} />}
    </div>
  );
}

/** Lo que aparece sobre el video al terminar una lección. */
function GateCard({
  gate,
  setGate,
  check,
  locale,
  next,
  last,
  onNext,
  onReplay,
  onCircuit,
}: {
  gate: NonNullable<Gate>;
  setGate: (g: Gate) => void;
  check?: NonNullable<ReturnType<typeof findDemo>>["class"][number]["check"];
  locale: "es" | "en";
  next?: string;
  last: boolean;
  onNext: () => void;
  onReplay: () => void;
  onCircuit: () => void;
}) {
  const t = usePick(COPY);
  const accent = THEME_STYLE.wellness.accents[0];
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#06131A]/80 p-4 backdrop-blur-sm max-md:static max-md:bg-[#0B1A22] max-md:p-2">
      <div className="reveal-animate w-[min(620px,100%)] rounded-2xl border border-white/15 bg-[#0B1A22] p-5 shadow-2xl max-md:p-3">
        {gate.kind === "check" && check && (
          <>
            <div className={`${MONO} text-[11px]`} style={{ color: accent }}>
              ❓ {t.quick}
            </div>
            <h4 className="m-0 mt-1 font-(family-name:--font-gabarito) text-[19px] leading-tight font-extrabold max-md:text-[15px]">{check.q[locale]}</h4>
            <div className="mt-3 grid grid-cols-2 gap-2 max-md:gap-1.5">
              {check.o.map((o, j) => {
                const picked = gate.picked;
                const ring = picked === null ? "" : j === check.a ? "ring-3 ring-[#3FB37F]" : j === picked ? "ring-3 ring-[#E2574C]" : "opacity-50";
                return (
                  <button
                    key={j}
                    type="button"
                    disabled={picked !== null}
                    onClick={() => {
                      setGate({ kind: "check", picked: j });
                      if (j === check.a) playChime();
                    }}
                    className={`cursor-pointer rounded-xl bg-white/8 px-3 py-2.5 text-left text-[14px] font-semibold transition enabled:hover:bg-white/15 max-md:py-1.5 max-md:text-[12px] ${ring}`}
                  >
                    {o[locale]}
                  </button>
                );
              })}
            </div>
            {gate.picked !== null && (
              <div className="reveal-animate mt-3 flex flex-wrap items-center justify-between gap-2 text-[13.5px] max-md:text-[12px]">
                <span className="min-w-0 flex-1">
                  <b>{gate.picked === check.a ? t.right : t.wrong}</b> {check.f[locale]}
                </span>
                <button type="button" autoFocus onClick={() => (last ? setGate({ kind: "finished" }) : onNext())} className="cursor-pointer rounded-full px-4 py-1.5 font-bold text-[#06131A]" style={{ background: accent }}>
                  {t.continue} →
                </button>
              </div>
            )}
          </>
        )}
        {gate.kind === "next" && (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className={`${MONO} text-[11px] text-white/55`}>
              ✓ {t.upNext} {t.inSec(gate.left)}
            </div>
            <h4 className="m-0 font-(family-name:--font-gabarito) text-[22px] font-extrabold">{next}</h4>
            <div className="mt-2 flex gap-2">
              <button type="button" autoFocus onClick={onNext} className="cursor-pointer rounded-full px-5 py-2 font-bold text-[#06131A]" style={{ background: accent }}>
                ▶ {t.now}
              </button>
              <button type="button" onClick={() => setGate(null)} className="cursor-pointer rounded-full border border-white/25 px-5 py-2 font-bold">
                {t.stay}
              </button>
            </div>
          </div>
        )}
        {gate.kind === "finished" && (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="text-4xl">🎓</span>
            <p className="m-0 max-w-md text-[15px]">{t.done}</p>
            <div className="flex gap-2">
              <button type="button" autoFocus onClick={onCircuit} className="cursor-pointer rounded-full px-5 py-2 font-bold text-[#06131A]" style={{ background: accent }}>
                ♨️ {t.circuit}
              </button>
              <button type="button" onClick={onReplay} className="cursor-pointer rounded-full border border-white/25 px-5 py-2 font-bold">
                {t.replay}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
