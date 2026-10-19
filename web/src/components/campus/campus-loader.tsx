"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePick } from "@/i18n/locale-context";

const COPY = {
  es: {
    badge: "★ Educación superior IA-Native · Florida ★",
    steps: ["Levantando los edificios", "Plantando las palmeras", "Encendiendo el atardecer", "Abriendo el campus"],
  },
  en: {
    badge: "★ AI-Native higher education · Florida ★",
    steps: ["Raising the buildings", "Planting the palm trees", "Lighting up the sunset", "Opening the campus"],
  },
};

// Preloader a pantalla completa con la identidad del modelo 2 (Retro USA):
// fondo gris claro, franjas navy y roja, el logo de KUN y debajo una barra con
// el porcentaje. Al terminar, la cortina se abre en dos mitades. El avance real lo
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
        className={`absolute inset-x-0 top-0 h-1/2 border-t-[10px] border-[#03318C] bg-[#E7E8E8] shadow-[inset_0_6px_0_#8C0303] ${curtain} ${
          opening ? (reduceMotion ? "opacity-0" : "-translate-y-full") : ""
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 h-1/2 border-b-[10px] border-[#03318C] bg-[#E7E8E8] shadow-[inset_0_-6px_0_#8C0303] ${curtain} ${
          opening ? (reduceMotion ? "opacity-0" : "translate-y-full") : ""
        }`}
      />
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-7 px-6 text-[#171717] transition-opacity duration-500 ${
          opening ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="rounded-full bg-[#03318C] px-5 py-2 text-[12px] font-bold tracking-[0.12em] text-white uppercase shadow-[0_10px_24px_-12px_rgba(3,49,140,0.8)] max-md:px-4 max-md:text-[10px]">
          {t.badge}
        </div>
        <Image
          src="/kun-logo-model2.png"
          alt="KUN University AI · Florida"
          width={1446}
          height={513}
          priority
          className="h-auto w-[min(560px,80vw)] drop-shadow-[0_18px_30px_rgba(3,49,140,0.18)]"
        />
        <div className="flex w-[min(460px,76vw)] flex-col gap-2">
          <div className="h-[4px] overflow-hidden rounded-full bg-[#C9CDD1]">
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #03318C, #8C0303)" }} />
          </div>
          <div className="flex items-baseline justify-between gap-4 text-sm text-[#5A4E40]">
            <span className="truncate">{t.steps[stepIndex]}…</span>
            <span className="shrink-0 font-(family-name:--font-gabarito) text-base font-extrabold text-[#03318C] tabular-nums">{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
