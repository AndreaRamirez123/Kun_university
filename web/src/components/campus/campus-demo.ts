import { useSyncExternalStore } from "react";
import well101 from "@/data/demos/WELL101.json";
import type { Dict, Locale } from "@/i18n/locale-context";
import { findCatalogSchool } from "@/lib/catalog";
import { THEME_STYLE, type Chapter } from "./campus-explainer";

// Demos de materias: clases narradas (bilingües, con preguntas rápidas) y el
// Circuito de repaso de 3 estaciones. Se abren dentro de su escuela, desde el
// catálogo (escuela → programa → materia). Cada materia es un JSON en
// src/data/demos; para agregar otra basta con copiar WELL101.json y registrarla en DEMOS.

type Text = Dict<string>;
type Labels = string[] | Dict<string[]>;

type DemoClassChapter = {
  id: string;
  graphic: Chapter["graphic"];
  menu: Text;
  title: Text;
  voice: Text;
  extra?: Labels;
  badge?: { top: string; value: number; unit: Text };
  /** Pregunta rápida al terminar la lección. */
  check?: QuickCheck;
  career?: {
    kicker: Text;
    credential: Text;
    credits: Text;
    modality: Text;
    coursesLabel: Text;
    courses: Array<{ code: string; name: Text }>;
    footer: Text;
  };
};

export type QuickCheck = { q: Text; o: Text[]; a: number; f: Text };

export type CourseDemo = {
  code: string;
  name: Text;
  program: Text;
  zone: string;
  disclaimer: Text;
  class: DemoClassChapter[];
  quiz: Array<{ clo: number; q: Text; o: Text[]; a: number; f: Text }>;
  pairs: Array<[Text, Text]>;
  sort: { baskets: [Text, Text]; items: Array<{ t: Text; b: 0 | 1 }> };
};

export const DEMOS: CourseDemo[] = [well101 as unknown as CourseDemo];

const code = (s: string) => s.replace(/\s+/g, "").toUpperCase();

/** Demo de una materia por su código del catálogo ("WELL 101" o "WELL101"). */
export function findDemo(courseCode: string | null | undefined) {
  return courseCode ? DEMOS.find((d) => code(d.code) === code(courseCode)) : undefined;
}

/** Capítulos de la clase demo para el motor de video de las salas. */
export function demoChapters(demo: CourseDemo, locale: Locale): Chapter[] {
  const accents = THEME_STYLE.wellness.accents;
  const labels = (x?: Labels) => (!x ? undefined : Array.isArray(x) ? x : x[locale]);
  return demo.class.map((c, i) => ({
    id: c.id,
    menu: c.menu[locale],
    title: c.title[locale],
    voice: c.voice[locale],
    accent: accents[i % accents.length],
    theme: "wellness",
    graphic: c.graphic,
    extra: labels(c.extra),
    badge: c.badge && { top: c.badge.top, value: c.badge.value, unit: c.badge.unit[locale] },
    career: c.career && {
      kicker: c.career.kicker[locale],
      credential: c.career.credential[locale],
      credits: c.career.credits[locale],
      modality: c.career.modality[locale],
      coursesLabel: c.career.coursesLabel[locale],
      courses: c.career.courses.map((x) => ({ code: x.code, name: x.name[locale] })),
      footer: c.career.footer[locale],
    },
  }));
}

/** Segundos que dura un capítulo: lo que tarda en narrarse (≈2,6 palabras/s). */
export function chapterSeconds(voice: string) {
  return Math.max(10, voice.split(/\s+/).length / 2.6);
}

/** Si alguna materia de la escuela (nombre de la API o del JSON) tiene clase demo. */
export function schoolHasDemo(schoolName: string) {
  const school = findCatalogSchool(schoolName);
  return !!school?.programas.some((p) => p.materias.some((m) => findDemo(m.codigo)));
}

// ---------------------------------------------------------------- progreso

export type Station = "quiz" | "match" | "sort";
type Progress = {
  /** Mejor puntaje (%) por estación del circuito. */
  best: Record<string, Partial<Record<Station, number>>>;
  /** Lecciones vistas por materia (ids de capítulo). */
  done: Record<string, string[]>;
};

const KEY = "kun-demo-v2";
const EMPTY: Progress = { best: {}, done: {} };
let state: Progress | null = null;
const listeners = new Set<() => void>();

function load(): Progress {
  if (state) return state;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<Progress> | null;
    state = { best: raw?.best ?? {}, done: raw?.done ?? {} };
  } catch {
    state = { ...EMPTY };
  }
  return state;
}

function save(next: Progress) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignorado */
  }
  listeners.forEach((l) => l());
}

/** Piedras de la torre (0–3) según el puntaje en %. */
export function stonesFor(pct: number) {
  return pct >= 90 ? 3 : pct >= 60 ? 2 : pct > 0 ? 1 : 0;
}

/** Guarda el resultado (en %) si mejora la marca; devuelve las piedras logradas. */
export function saveBest(course: string, station: Station, pct: number) {
  const p = load();
  const prev = p.best[course]?.[station] ?? -1;
  if (pct > prev) save({ ...p, best: { ...p.best, [course]: { ...p.best[course], [station]: pct } } });
  return stonesFor(pct);
}

/** Marca una lección como vista. */
export function markLesson(course: string, lesson: string) {
  const p = load();
  const done = p.done[course] ?? [];
  if (!done.includes(lesson)) save({ ...p, done: { ...p.done, [course]: [...done, lesson] } });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useDemoProgress() {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}
