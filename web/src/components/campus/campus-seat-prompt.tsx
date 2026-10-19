"use client";

import { useEffect, useRef, useState } from "react";
import { usePick } from "@/i18n/locale-context";
import { visiblePlayers } from "@/lib/campus-presence";
import { CAFE_SEATS } from "./campus-cafe";
import { campusRuntime, resetCampusInput } from "./campus-runtime";

// Sentarse en los taburetes de la cafetería: al acercarse a uno libre aparece
// el botón (o la tecla E). Para levantarse basta con caminar o saltar.

const COPY = {
  es: { sit: "Sentarse", stand: "Levantarse", hint: "o camina para levantarte" },
  en: { sit: "Sit down", stand: "Stand up", hint: "or walk to get up" },
};

/** Distancia máxima al taburete para poder sentarse. */
const SEAT_REACH = 1.9;

function nearestFreeSeat() {
  const p = campusRuntime.player;
  if (p.y > 0.3) return -1;
  const taken = new Set(visiblePlayers().map((o) => (o as { s?: number }).s).filter((s) => typeof s === "number" && s >= 0));
  let best = -1;
  let bestD = SEAT_REACH;
  CAFE_SEATS.forEach((seat, i) => {
    if (taken.has(i)) return;
    const d = Math.hypot(seat.x - p.x, seat.z - p.z);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

export function CampusSeatPrompt({ enabled, blocked }: { enabled: boolean; /** Krucn o una puerta tienen prioridad para la tecla E. */ blocked: boolean }) {
  const t = usePick(COPY);
  const [near, setNear] = useState(-1);
  const [seated, setSeated] = useState(false);
  const live = useRef({ near, seated, blocked });
  useEffect(() => {
    live.current = { near, seated, blocked };
  });

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      setSeated(campusRuntime.seat >= 0);
      setNear(campusRuntime.seat >= 0 ? -1 : nearestFreeSeat());
    }, 200);
    return () => window.clearInterval(id);
  }, [enabled]);

  // Si sale del campus (sala, lobby), se levanta.
  useEffect(() => {
    if (!enabled) campusRuntime.seat = -1;
  }, [enabled]);

  function toggle() {
    const s = live.current;
    if (s.seated) {
      // Levantarse = moverse un instante: el personaje vuelve a quedar de pie.
      campusRuntime.jumpQueued = true;
      return;
    }
    if (s.near >= 0) {
      resetCampusInput();
      campusRuntime.seat = s.near;
      setSeated(true);
    }
  }

  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el?.closest?.("input, textarea, select, button, a")) return;
      if (e.code !== "KeyE" || live.current.blocked) return;
      if (live.current.near < 0 && !live.current.seated) return;
      e.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  if (!enabled || blocked || (near < 0 && !seated)) return null;
  return (
    <div className="reveal-animate absolute inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] z-20 mx-auto flex w-fit flex-col items-center gap-1.5 max-md:bottom-[calc(132px+env(safe-area-inset-bottom,0px))]">
      <button
        type="button"
        onClick={toggle}
        className="flex cursor-pointer items-center gap-2.5 rounded-full border-2 border-[#B8743A] bg-[#0E061E]/85 px-5 py-2.5 text-[15px] font-bold text-[#FFF3E6] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-md transition hover:-translate-y-0.5"
      >
        <span aria-hidden>{seated ? "🧍" : "🪑"}</span>
        {seated ? t.stand : t.sit}
        <kbd className="rounded-md border border-white/40 px-1.5 font-mono text-[11px] max-md:hidden">E</kbd>
      </button>
      {seated && <span className="text-[11.5px] font-semibold text-white/70 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">{t.hint}</span>}
    </div>
  );
}
