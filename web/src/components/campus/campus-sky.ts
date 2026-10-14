"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

// Cielo según la hora real de Florida (America/New_York): de día brilla el sol,
// al atardecer el sol Art Deco de Miami y de noche la luna con estrellas.
// Se puede forzar un momento del día desde el HUD para presentar el campus.

export type SkyMode = "auto" | "day" | "sunset" | "night";

export type SkyPreset = {
  horizon: THREE.Color;
  mid: THREE.Color;
  top: THREE.Color;
  fog: THREE.Color;
  ocean: THREE.Color;
  lightColor: THREE.Color;
  lightIntensity: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  /** Posición del sol o la luna en el cielo. */
  body: THREE.Vector3;
  /** 0 = pleno día, 1 = noche cerrada. */
  night: number;
  /** 1 = sol alto; controla las franjas Art Deco (solo con el sol bajo). */
  day: number;
  /** Hora de Florida usada (0–24). */
  hour: number;
};

type Key = {
  h: number;
  horizon: string;
  mid: string;
  top: string;
  fog: string;
  ocean: string;
  light: string;
  lightI: number;
  hemiSky: string;
  hemiGround: string;
  hemiI: number;
  body: [number, number, number];
  night: number;
  day: number;
};

const NIGHT: Omit<Key, "h"> = {
  horizon: "#1E2A5C",
  mid: "#121A44",
  top: "#050818",
  fog: "#1A2350",
  ocean: "#0C3550",
  light: "#A9BFFF",
  lightI: 1.1,
  hemiSky: "#7C8CD6",
  hemiGround: "#2E3A66",
  hemiI: 1.25,
  body: [40, 70, -220],
  night: 1,
  day: 0,
};
const DAWN: Omit<Key, "h"> = {
  horizon: "#FFB98A",
  mid: "#C98FC0",
  top: "#4A5BA8",
  fog: "#F0B49A",
  ocean: "#1C7A93",
  light: "#FFD2B0",
  lightI: 1.5,
  hemiSky: "#E0C8FF",
  hemiGround: "#F7CFA0",
  hemiI: 1.05,
  body: [30, 18, -230],
  night: 0.2,
  day: 0.3,
};
const DAY: Omit<Key, "h"> = {
  horizon: "#CDE9FF",
  mid: "#7DBDF5",
  top: "#2E6FD0",
  fog: "#BFDDF5",
  ocean: "#1F9CC4",
  light: "#FFF4E0",
  lightI: 2.5,
  hemiSky: "#D6ECFF",
  hemiGround: "#F2E2C0",
  hemiI: 1.25,
  body: [-30, 120, -190],
  night: 0,
  day: 1,
};
const SUNSET: Omit<Key, "h"> = {
  horizon: "#FF9E5C",
  mid: "#DB4D7A",
  top: "#1F0F4D",
  fog: "#F2906E",
  ocean: "#1C7A93",
  light: "#FFCFA0",
  lightI: 1.9,
  hemiSky: "#D9C6FF",
  hemiGround: "#F7CFA0",
  hemiI: 1.15,
  body: [-20, 14, -230],
  night: 0.15,
  day: 0.25,
};

// Horario aproximado de Miami: amanece ~6:30, atardece ~19:00.
const KEYS: Key[] = [
  { h: 0, ...NIGHT },
  { h: 5.5, ...NIGHT },
  { h: 6.75, ...DAWN },
  { h: 8.5, ...DAY },
  { h: 16.5, ...DAY },
  { h: 18.5, ...SUNSET },
  { h: 20, ...NIGHT },
  { h: 24, ...NIGHT },
];

const FIXED_HOUR: Record<Exclude<SkyMode, "auto">, number> = { day: 12, sunset: 18.5, night: 23 };

export function floridaHour(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 12);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h + m / 60;
}

const c = (hex: string) => new THREE.Color(hex);

export function skyAt(hour: number): SkyPreset {
  let i = 0;
  while (i < KEYS.length - 2 && hour >= KEYS[i + 1].h) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const raw = (hour - a.h) / Math.max(0.0001, b.h - a.h);
  const t = raw * raw * (3 - 2 * raw);
  const mix = (x: string, y: string) => c(x).lerp(c(y), t);
  const num = (x: number, y: number) => x + (y - x) * t;
  return {
    horizon: mix(a.horizon, b.horizon),
    mid: mix(a.mid, b.mid),
    top: mix(a.top, b.top),
    fog: mix(a.fog, b.fog),
    ocean: mix(a.ocean, b.ocean),
    lightColor: mix(a.light, b.light),
    lightIntensity: num(a.lightI, b.lightI),
    hemiSky: mix(a.hemiSky, b.hemiSky),
    hemiGround: mix(a.hemiGround, b.hemiGround),
    hemiIntensity: num(a.hemiI, b.hemiI),
    body: new THREE.Vector3(...a.body).lerp(new THREE.Vector3(...b.body), t),
    night: num(a.night, b.night),
    day: num(a.day, b.day),
    hour,
  };
}

/** Momento del día que se muestra, para la etiqueta del HUD. */
export function skyLabel(sky: SkyPreset): Exclude<SkyMode, "auto"> {
  if (sky.night > 0.6) return "night";
  if (sky.day > 0.7) return "day";
  return "sunset";
}

export function useFloridaSky(mode: SkyMode) {
  // Arranca en atardecer en servidor y cliente por igual (evita un desajuste de
  // hidratación) y enseguida pasa a la hora real de Florida.
  const [hour, setHour] = useState(18.5);
  useEffect(() => {
    const first = window.setTimeout(() => setHour(floridaHour()), 0);
    const id = window.setInterval(() => setHour(floridaHour()), 60_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  const effective = mode === "auto" ? hour : FIXED_HOUR[mode];
  // La hora se actualiza una vez por minuto, así que el cielo se recalcula poco.
  return useMemo(() => skyAt(effective), [effective]);
}
