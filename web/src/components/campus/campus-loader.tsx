"use client";

import { useEffect, useRef, useState } from "react";
import { usePick } from "@/i18n/locale-context";

const COPY = {
  es: {
    eyebrow: "KUN University AI · Florida",
    steps: ["Levantando los edificios", "Plantando las palmeras", "Encendiendo el atardecer", "Abriendo el campus"],
  },
  en: {
    eyebrow: "KUN University AI · Florida",
    steps: ["Raising the buildings", "Planting the palm trees", "Lighting up the sunset", "Opening the campus"],
  },
};

// Preloader a pantalla completa: contador grande, frases que rotan y una
// cortina que se abre en dos mitades para revelar la isla. El avance real lo
// marca `ready` (la escena ya pintó); antes de eso el contador se queda en 90.
export function CampusLoader({
  ready,
  reduceMotion,
  onDone,
}: {
  ready: boolean;
  reduceMotion: boolean;
  onDone: () => void;
}) {
  const t = usePick(COPY);
  const [progress, setProgress] = useState(0);
  const [opening, setOpening] = useState(false);
  const [gone, setGone] = useState(false);
  const readyRef = useRef(ready);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    readyRef.current = ready;
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const start = performance.now();
    let shown = 0;
    let raf = 0;
    let finished = false;
    const timers: number[] = [];
    let last = start;
    function step(now: number) {
      const elapsed = (now - start) / 1000;
      // Suavizado por tiempo (no por frame) para que tarde lo mismo en equipos lentos.
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      const target = readyRef.current && elapsed > 0.9 ? 100 : Math.min(90, 100 * (1 - Math.exp(-elapsed * 1.6)));
      shown += (target - shown) * (1 - Math.exp(-dt * 7));
      if (target === 100 && shown > 99) shown = 100;
      setProgress(shown);
      if (shown === 100 && !finished) {
        finished = true;
        timers.push(window.setTimeout(() => setOpening(true), 250));
        timers.push(
          window.setTimeout(
            () => {
              setGone(true);
              onDoneRef.current();
            },
            reduceMotion ? 300 : 1350,
          ),
        );
        return;
      }
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [reduceMotion]);

  if (gone) return null;

  const pct = Math.round(progress);
  const stepIndex = Math.min(t.steps.length - 1, Math.floor((progress / 100) * t.steps.length));
  const curtain = reduceMotion
    ? "transition-opacity duration-300"
    : "transition-transform duration-[1100ms] ease-[cubic-bezier(.76,0,.24,1)]";

  return (
    <div className="pointer-events-auto absolute inset-0 z-40" role="status" aria-live="polite" aria-label={`${pct}%`}>
      <div
        className={`absolute inset-x-0 top-0 h-1/2 bg-[#140A28] ${curtain} ${
          opening ? (reduceMotion ? "opacity-0" : "-translate-y-full") : ""
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 h-1/2 bg-[#140A28] ${curtain} ${
          opening ? (reduceMotion ? "opacity-0" : "translate-y-full") : ""
        }`}
      />
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-[#FFF3E6] transition-opacity duration-500 ${
          opening ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="text-xs font-bold tracking-[0.3em] text-[#FFC85C] uppercase">{t.eyebrow}</div>
        <div className="font-(family-name:--font-gabarito) text-[clamp(96px,22vw,220px)] leading-[0.8] font-black tabular-nums">
          {String(pct).padStart(3, "0")}
        </div>
        <div className="h-[2px] w-[min(360px,70vw)] overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #FFD47A, #FF7A59)" }}
          />
        </div>
        <div className="h-5 text-sm text-[#FFF3E6]/70">{t.steps[stepIndex]}…</div>
      </div>
    </div>
  );
}
