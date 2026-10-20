"use client";

import { useEffect, useState } from "react";
import { useLocale, usePick } from "@/i18n/locale-context";
import { presenceEnabled, visiblePlayers } from "@/lib/campus-presence";
import { usePresencePlayers } from "./campus-remote-players";
import { EMOTES } from "./campus-social";
import { CAFE } from "./campus-zones";

// Botón para interactuar con las demás personas del campus: cuántas hay (y
// cuántas en la cafetería) y una paleta de emojis y frases listas.

const COPY = {
  es: {
    interact: "Interactuar",
    alone: "Solo tú por ahora",
    people: (n: number) => `${n} en el campus`,
    inCafe: (n: number) => `${n} en la cafetería`,
    emojis: "Reacciones (teclas 1–6)",
    phrases: "Frases",
    close: "Cerrar",
  },
  en: {
    interact: "Interact",
    alone: "Just you for now",
    people: (n: number) => `${n} on campus`,
    inCafe: (n: number) => `${n} at the café`,
    emojis: "Reactions (keys 1–6)",
    phrases: "Phrases",
    close: "Close",
  },
};

const EMOJI_COUNT = EMOTES.findIndex((e) => e.text);

export function CampusSocialPanel({ visible, onEmote }: { visible: boolean; onEmote: (index: number) => void }) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  const players = usePresencePlayers();
  const [open, setOpen] = useState(false);
  // Las posiciones cambian sin re-render: el conteo de la cafetería se recalcula cada 2 s.
  const [inCafe, setInCafe] = useState(0);
  useEffect(() => {
    if (!visible || !presenceEnabled) return;
    const count = () => setInCafe(visiblePlayers().filter((p) => Math.hypot(p.x - CAFE.x, p.z - CAFE.z) < CAFE.deck + 1).length);
    count();
    const id = window.setInterval(count, 2000);
    return () => window.clearInterval(id);
  }, [visible]);

  // Teclas 1–6: reacciones rápidas sin abrir el panel.
  useEffect(() => {
    if (!visible || !presenceEnabled) return;
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el?.closest?.("input, textarea, select, [contenteditable=true]")) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= EMOJI_COUNT) onEmote(n - 1);
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, onEmote]);

  if (!presenceEnabled || !visible) return null;

  const send = (i: number) => {
    onEmote(i);
    setOpen(false);
  };

  return (
    <div className="absolute top-[calc(214px+env(safe-area-inset-top,0px))] left-5 z-20 text-[#FFF3E6] max-md:top-[calc(180px+env(safe-area-inset-top,0px))] max-md:left-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-[#3FA34D] bg-[#0E061E]/75 px-3.5 py-1.5 text-[13px] font-bold backdrop-blur-md transition hover:bg-[#0E061E]/90 max-md:px-3 max-md:text-xs"
      >
        <span aria-hidden>😊</span>
        {t.interact}
        <span className="rounded-full bg-white/12 px-2 py-0.5 text-[11px] font-semibold text-white/85">
          👥 {players.length ? t.people(players.length + 1) : t.alone}
          {inCafe > 0 && ` · ☕ ${t.inCafe(inCafe)}`}
        </span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={t.interact}
          className="reveal-animate mt-2 w-[min(320px,calc(100vw-24px))] rounded-[20px] border border-white/12 bg-[#0E061E]/92 p-3 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
        >
          <div className="mb-1.5 font-mono text-[10px] tracking-[0.18em] text-white/50 uppercase">{t.emojis}</div>
          <div className="grid grid-cols-6 gap-1.5">
            {EMOTES.slice(0, EMOJI_COUNT).map((e, i) => (
              <button
                key={i}
                type="button"
                onClick={() => send(i)}
                className="flex aspect-square cursor-pointer items-center justify-center rounded-xl bg-white/8 text-xl transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                {e.emoji}
              </button>
            ))}
          </div>
          <div className="mt-3 mb-1.5 font-mono text-[10px] tracking-[0.18em] text-white/50 uppercase">{t.phrases}</div>
          <div className="flex max-h-[38vh] flex-col gap-1 overflow-y-auto pr-1">
            {EMOTES.map((e, i) =>
              e.text ? (
                <button
                  key={i}
                  type="button"
                  onClick={() => send(i)}
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13.5px] font-semibold transition hover:bg-white/10"
                >
                  <span aria-hidden>{e.emoji}</span>
                  {e.text[locale]}
                </button>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
