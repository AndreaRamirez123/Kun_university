"use client";

import { useEffect, useState } from "react";
import { useLocale, usePick } from "@/i18n/locale-context";
import { playChime, playFanfare } from "./campus-audio";
import { saveBest, stonesFor, type CourseDemo, type Station } from "./campus-demo";
import { resetCampusInput } from "./campus-runtime";
import { earn } from "./campus-wallet";

// Circuito de repaso de una materia (su juego): Sauna (concurso con reloj),
// Piscina (emparejar) y Jardín (clasificar). Se abre desde la página de la
// materia; al terminar, la torre de piedras de la estación crece con tu mejor marca.

export const STATION_STYLE: Record<Station, { emoji: string; color: string; dark: string }> = {
  quiz: { emoji: "🔥", color: "#F28C28", dark: "#3A1E05" },
  match: { emoji: "💧", color: "#3BB3B5", dark: "#06262A" },
  sort: { emoji: "🌿", color: "#7DB83A", dark: "#1E3608" },
};

const COPY = {
  es: {
    circuit: "Circuito de repaso",
    names: { quiz: "Sauna", match: "Piscina", sort: "Jardín" } as Record<Station, string>,
    hints: {
      quiz: "10 preguntas · 20 segundos cada una. Cada respuesta te explica por qué.",
      match: "Toca un término y luego su definición.",
      sort: "Toca un servicio y luego la canasta donde va. Al final revisamos.",
    } as Record<Station, string>,
    close: "Volver a la materia",
    q: (i: number) => `Pregunta ${i} de 10`,
    right: "¡Correcto!",
    wrong: "No es esa.",
    time: "Se acabó el tiempo.",
    next: "Siguiente",
    finish: "Ver mi resultado",
    terms: "Términos",
    defs: "Definiciones",
    tries: (n: number) => `${n} intentos`,
    check: "Revisar mis canastas",
    score: "Puntaje",
    again: "Repetir",
    r: [
      "Aún no hay piedras. Repasa el tema y vuelve.",
      "Primera piedra puesta. Repasa las explicaciones y vuelve a intentarlo.",
      "Buen equilibrio. Repite para completar la torre.",
      "¡Torre completa! Dominas esta estación.",
    ],
    tower: "Tu torre crece con tu mejor marca.",
  },
  en: {
    circuit: "Review circuit",
    names: { quiz: "Sauna", match: "Pool", sort: "Garden" } as Record<Station, string>,
    hints: {
      quiz: "10 questions · 20 seconds each. Every answer explains why.",
      match: "Tap a term, then its definition.",
      sort: "Tap a service, then the basket it belongs in. We check at the end.",
    } as Record<Station, string>,
    close: "Back to the course",
    q: (i: number) => `Question ${i} of 10`,
    right: "Correct!",
    wrong: "Not that one.",
    time: "Time is up.",
    next: "Next",
    finish: "See my result",
    terms: "Terms",
    defs: "Definitions",
    tries: (n: number) => `${n} attempts`,
    check: "Check my baskets",
    score: "Score",
    again: "Replay",
    r: [
      "No stones yet. Review the topic and come back.",
      "First stone placed. Review the explanations and try again.",
      "Good balance. Replay to complete the tower.",
      "Full tower! You've mastered this station.",
    ],
    tower: "Your tower grows with your best score.",
  },
};

const shuffle = <T,>(a: T[]) => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

/** Torre de piedras (0–3) del resultado de una estación. */
export function Cairn({ n, color, size = 160 }: { n: number; color: string; size?: number }) {
  const stones = [
    { cy: 118, rx: 46, ry: 15 },
    { cy: 92, rx: 34, ry: 12 },
    { cy: 70, rx: 22, ry: 9 },
  ];
  return (
    <svg width={size} height={(size * 140) / 160} viewBox="0 0 160 140" role="img" aria-label={`${n}/3`}>
      <ellipse cx="80" cy="132" rx="60" ry="6" fill="rgba(0,0,0,.3)" />
      {stones.map((s, i) => (
        <ellipse
          key={i}
          cx="80"
          cy={s.cy}
          rx={s.rx}
          ry={s.ry}
          fill={i < n ? ["#B9A88E", "#D4C3A6", "#EFE3CC"][i] : "none"}
          stroke={i < n ? color : "rgba(255,255,255,.45)"}
          strokeWidth="2.5"
          strokeDasharray={i < n ? undefined : "5 6"}
          className={i < n ? "reveal-animate" : undefined}
          style={i < n ? { animationDelay: `${i * 0.25}s` } : undefined}
        />
      ))}
    </svg>
  );
}

function Quiz({ demo, onDone }: { demo: CourseDemo; onDone: (pct: number) => void }) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  const [order] = useState(() => shuffle(demo.quiz.map((_, i) => i)));
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [left, setLeft] = useState(20);
  const item = demo.quiz[order[i]];

  useEffect(() => {
    if (picked !== null) return;
    // Al llegar a 0 se marca como "se acabó el tiempo" (-1).
    const id = window.setTimeout(() => {
      setLeft((l) => l - 1);
      if (left <= 1) setPicked(-1);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [left, picked]);

  const answer = (j: number) => {
    if (picked !== null) return;
    setPicked(j);
    if (j === item.a) {
      setScore((s) => s + 1);
      playChime();
    }
  };
  const last = i === order.length - 1;
  const color = STATION_STYLE.quiz.color;

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 84 84" className="h-16 w-16 -rotate-90">
            <circle cx="42" cy="42" r="36" stroke="rgba(255,255,255,.18)" strokeWidth="7" fill="none" />
            <circle cx="42" cy="42" r="36" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={226} strokeDashoffset={226 * (1 - left / 20)} style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <b className="absolute inset-0 grid place-items-center font-(family-name:--font-gabarito) text-xl">{left}</b>
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[11px] tracking-[0.14em] text-white/55 uppercase">
            {t.q(i + 1)} · CLO {item.clo}
          </div>
          <h3 className="m-0 font-(family-name:--font-gabarito) text-[21px] leading-tight font-extrabold max-md:text-[17px]">{item.q[locale]}</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        {item.o.map((o, j) => {
          const state = picked === null ? "" : j === item.a ? "ring-4 ring-[#3FB37F]" : j === picked ? "ring-4 ring-[#E2574C]" : "opacity-50";
          return (
            <button
              key={j}
              type="button"
              disabled={picked !== null}
              onClick={() => answer(j)}
              className={`cursor-pointer rounded-[26px_18px_24px_16px] px-5 py-4 text-left text-[15px] font-bold text-[#24123F] shadow-[inset_0_-6px_0_rgba(0,0,0,.14)] transition enabled:hover:-translate-y-0.5 ${state}`}
              style={{ background: ["#FFB466", "#8FE0DF", "#C9EB8F", "#E3B3D6"][j] }}
            >
              {o[locale]}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="reveal-animate mt-4 rounded-2xl bg-white/92 p-4 text-[#0D3B4F]">
          <b>{picked === -1 ? t.time : picked === item.a ? t.right : t.wrong}</b> {item.f[locale]}
          <div className="mt-3 text-right">
            <button
              type="button"
              autoFocus
              onClick={() => {
                if (last) onDone(Math.round((score / order.length) * 100));
                else {
                  setI(i + 1);
                  setPicked(null);
                  setLeft(20);
                }
              }}
              className="cursor-pointer rounded-full px-5 py-2 font-bold text-white"
              style={{ background: color }}
            >
              {last ? t.finish : t.next} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Match({ demo, onDone }: { demo: CourseDemo; onDone: (pct: number) => void }) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  const [terms] = useState(() => shuffle(demo.pairs.map((_, i) => i)));
  const [defs] = useState(() => shuffle(demo.pairs.map((_, i) => i)));
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [shake, setShake] = useState<number | null>(null);

  const pickDef = (d: number) => {
    if (sel === null) return;
    const n = tries + 1;
    setTries(n);
    if (d === sel) {
      const next = [...done, d];
      setDone(next);
      setSel(null);
      playChime();
      if (next.length === demo.pairs.length) onDone(Math.round((demo.pairs.length / n) * 100));
    } else {
      setShake(d);
      window.setTimeout(() => setShake(null), 380);
    }
  };
  const stone = "block w-full cursor-pointer rounded-[22px_14px_20px_12px] px-4 py-3 text-left text-[14px] font-semibold text-[#0D3B4F] shadow-[inset_0_-5px_0_rgba(0,0,0,.08)] transition";
  return (
    <div>
      <div className="mb-3 font-mono text-[11px] tracking-[0.14em] text-white/55 uppercase">
        {done.length} / {demo.pairs.length} · {t.tries(tries)}
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div className="flex flex-col gap-2">
          <h3 className="m-0 text-[13px] font-bold text-white/60">{t.terms}</h3>
          {terms.map((i) => (
            <button
              key={i}
              type="button"
              disabled={done.includes(i)}
              onClick={() => setSel(i)}
              className={`${stone} font-(family-name:--font-gabarito) text-[15px] ${done.includes(i) ? "bg-[#9ED9B9]" : "bg-[#F1E8D8] hover:translate-x-1"} ${sel === i ? "ring-4 ring-[#3BB3B5]" : ""}`}
            >
              {demo.pairs[i][0][locale]}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="m-0 text-[13px] font-bold text-white/60">{t.defs}</h3>
          {defs.map((i) => (
            <button
              key={i}
              type="button"
              disabled={done.includes(i)}
              onClick={() => pickDef(i)}
              className={`${stone} ${done.includes(i) ? "bg-[#9ED9B9]" : "bg-[#F1E8D8] hover:translate-x-1"} ${shake === i ? "ring-4 ring-[#E2574C]" : ""}`}
            >
              {demo.pairs[i][1][locale]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sort({ demo, onDone }: { demo: CourseDemo; onDone: (pct: number) => void }) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  const [pool, setPool] = useState(() => shuffle(demo.sort.items.map((_, i) => i)));
  const [sel, setSel] = useState<number | null>(null);
  const [baskets, setBaskets] = useState<[number[], number[]]>([[], []]);
  const [checked, setChecked] = useState(false);
  const drop = (b: 0 | 1) => {
    if (sel === null || checked) return;
    setBaskets((bs) => (b === 0 ? [[...bs[0], sel], bs[1]] : [bs[0], [...bs[1], sel]]));
    setPool((p) => p.filter((x) => x !== sel));
    setSel(null);
  };
  const correct = baskets[0].filter((i) => demo.sort.items[i].b === 0).length + baskets[1].filter((i) => demo.sort.items[i].b === 1).length;
  const chip = "rounded-[20px_14px_18px_12px] px-3.5 py-2 text-[13.5px] font-bold text-[#0D3B4F]";
  return (
    <div>
      {pool.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 rounded-3xl bg-black/20 p-3">
          {pool.map((i) => (
            <button key={i} type="button" onClick={() => setSel(i)} className={`${chip} cursor-pointer bg-[#F1E8D8] ${sel === i ? "ring-4 ring-[#7DB83A]" : ""}`}>
              {demo.sort.items[i].t[locale]}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        {([0, 1] as const).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => drop(b)}
            className="flex min-h-40 cursor-pointer flex-col items-start gap-2 rounded-[30px_30px_40px_40px] p-4 text-left shadow-[inset_0_-10px_0_rgba(0,0,0,.1)]"
            style={{ background: b === 0 ? "linear-gradient(170deg,#E3F5C9,#B9E07E)" : "linear-gradient(170deg,#F6E3F0,#DDB3D2)" }}
          >
            <span className="font-(family-name:--font-gabarito) text-[17px] font-extrabold text-[#24123F]">
              {b === 0 ? "🌿" : "⚕️"} {demo.sort.baskets[b][locale]}
            </span>
            <span className="flex flex-wrap gap-1.5">
              {baskets[b].map((i) => (
                <span
                  key={i}
                  className={`${chip} bg-white ${checked ? (demo.sort.items[i].b === b ? "ring-2 ring-[#3FB37F]" : "line-through ring-2 ring-[#E2574C]") : ""}`}
                >
                  {demo.sort.items[i].t[locale]}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 text-right">
        {pool.length === 0 && !checked && (
          <button type="button" onClick={() => setChecked(true)} className="cursor-pointer rounded-full bg-[#7DB83A] px-5 py-2 font-bold text-[#1E3608]">
            {t.check}
          </button>
        )}
        {checked && (
          <button type="button" onClick={() => onDone(Math.round((correct / demo.sort.items.length) * 100))} className="cursor-pointer rounded-full bg-[#7DB83A] px-5 py-2 font-bold text-[#1E3608]">
            {t.finish} →
          </button>
        )}
      </div>
    </div>
  );
}

export function CampusDemoCircuit({ demo, station, onClose }: { demo: CourseDemo; station: Station; onClose: () => void }) {
  const t = usePick(COPY);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const style = STATION_STYLE[station];

  // Esc lo maneja la página de la materia (cierra primero la estación).
  useEffect(() => resetCampusInput(), []);

  const finish = (pct: number) => {
    const stones = saveBest(demo.code, station, pct);
    setResult(pct);
    if (stones >= 2) earn("demoStation", `${demo.code}:${station}`);
    if (stones === 3) {
      earn("demoTower", `${demo.code}:${station}`);
      playFanfare();
    }
  };
  const n = result === null ? 0 : stonesFor(result);

  return (
    <div
      className="absolute inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-md max-md:items-end max-md:p-2"
      style={{ background: `radial-gradient(80% 60% at 50% 0%, ${style.color}33, rgba(5,8,14,0.82))` }}
    >
      <div role="dialog" aria-modal="true" className="reveal-animate flex max-h-[92dvh] w-[min(900px,100%)] flex-col overflow-hidden rounded-[30px] border border-white/15 bg-[#0B1A22]/95 text-[#F4FAF8] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]">
        <header className="flex items-center gap-4 border-b border-white/10 px-6 py-4 max-md:px-4" style={{ background: `linear-gradient(90deg, ${style.color}40, transparent)` }}>
          <span aria-hidden className="text-3xl">
            {style.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[11px] tracking-[0.14em] text-white/60 uppercase">{demo.code} · {t.circuit}</div>
            <h2 className="m-0 font-(family-name:--font-gabarito) text-[24px] font-black">{t.names[station]}</h2>
            <p className="m-0 text-[12.5px] text-white/65">{t.hints[station]}</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 cursor-pointer rounded-full border border-white/20 px-4 py-2 text-[13px] font-bold transition hover:bg-white/10">
            ← {t.close}
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 max-md:px-4">
          {result === null ? (
            station === "quiz" ? (
              <Quiz key={round} demo={demo} onDone={finish} />
            ) : station === "match" ? (
              <Match key={round} demo={demo} onDone={finish} />
            ) : (
              <Sort key={round} demo={demo} onDone={finish} />
            )
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <Cairn n={n} color={style.color} />
              <h3 className="m-0 font-(family-name:--font-gabarito) text-[26px] font-black">
                {t.score}: {result}%
              </h3>
              <p className="m-0 max-w-md text-white/75">{t.r[n]}</p>
              <p className="m-0 text-[12px] text-white/50">{t.tower}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setRound((r) => r + 1);
                  }}
                  className="cursor-pointer rounded-full px-5 py-2 font-bold text-[#0B1A22]"
                  style={{ background: style.color }}
                >
                  {t.again}
                </button>
                <button type="button" onClick={onClose} className="cursor-pointer rounded-full border border-white/25 px-5 py-2 font-bold">
                  {t.close}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
