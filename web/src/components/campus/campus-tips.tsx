"use client";

import { useEffect, useState } from "react";
import { usePick } from "@/i18n/locale-context";
import { CAFE_TRAMPOLINES } from "./campus-cafe";
import { BEACH_TRAMPOLINES } from "./campus-florida";
import { campusRuntime } from "./campus-runtime";

// Pistas de juego que aparecen solas la primera vez: las sombrillas son
// trampolines y, ya arriba, se puede saltar de una a otra. Cada pista se muestra
// hasta que la persona la usa (se recuerda en este navegador).

const TRAMPOLINES = [...CAFE_TRAMPOLINES, ...BEACH_TRAMPOLINES];
const KEY = "kun-tips-v1";
type Tip = "jump" | "hop";

const COPY = {
  es: {
    jump: { desk: "☂️ ¡Las sombrillas son trampolines! Párate debajo y salta con Espacio.", touch: "☂️ ¡Las sombrillas son trampolines! Párate debajo y toca Saltar." },
    hop: { desk: "🦘 Arriba, presiona una dirección para saltar a otra sombrilla.", touch: "🦘 Arriba, mueve el joystick hacia otra sombrilla para saltar a ella." },
  },
  en: {
    jump: { desk: "☂️ Umbrellas are trampolines! Stand under one and press Space.", touch: "☂️ Umbrellas are trampolines! Stand under one and tap Jump." },
    hop: { desk: "🦘 Up top, press a direction to hop to another umbrella.", touch: "🦘 Up top, push the joystick toward another umbrella to hop onto it." },
  },
};

function loadDone(): Set<Tip> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]") as Tip[]);
  } catch {
    return new Set();
  }
}

export function CampusTips({ enabled }: { enabled: boolean }) {
  const t = usePick(COPY);
  const [tip, setTip] = useState<Tip | null>(null);
  const [touch] = useState(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);

  useEffect(() => {
    if (!enabled) return;
    const done = loadDone();
    const finish = (k: Tip) => {
      done.add(k);
      try {
        localStorage.setItem(KEY, JSON.stringify([...done]));
      } catch {
        /* ignorado */
      }
    };
    const id = window.setInterval(() => {
      const p = campusRuntime.player;
      const u = TRAMPOLINES.find((o) => Math.hypot(p.x - o.x, p.z - o.z) < o.r + 2.2);
      const onTop = !!u && p.y > u.top(0) - 1;
      // Ya rebotó: la primera pista cumplió; si cambió de sombrilla, la segunda también.
      if (onTop && !done.has("jump")) finish("jump");
      if (onTop && Math.hypot(p.vx, p.vz) > 1 && !done.has("hop")) {
        window.setTimeout(() => finish("hop"), 1500);
      }
      if (!u) setTip(null);
      else if (onTop) setTip(done.has("hop") ? null : "hop");
      else setTip(done.has("jump") ? null : "jump");
    }, 250);
    return () => window.clearInterval(id);
  }, [enabled]);

  if (!enabled || !tip) return null;
  return (
    <div className="reveal-animate pointer-events-none absolute inset-x-0 top-[calc(18px+env(safe-area-inset-top,0px))] z-20 mx-auto w-fit max-w-[min(560px,calc(100%-24px))] rounded-full border-2 border-[#FFC85C] bg-[#0E061E]/88 px-5 py-2.5 text-center text-[14px] font-bold text-[#FFF3E6] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-md max-md:top-auto max-md:bottom-[calc(196px+env(safe-area-inset-bottom,0px))] max-md:rounded-2xl max-md:text-[12.5px]">
      {touch ? t[tip].touch : t[tip].desk}
    </div>
  );
}
