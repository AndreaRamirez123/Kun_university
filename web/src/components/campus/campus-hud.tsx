"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, usePick } from "@/i18n/locale-context";
import { campusRuntime } from "./campus-runtime";
import type { SkyMode } from "./campus-sky";
import { GRASS_RADIUS, ISLAND_RADIUS, ZONES } from "./campus-zones";

const COPY = {
  es: {
    subtitle: "Campus virtual en Florida",
    classicSite: "← Sitio clásico",
    catalog: "Catálogo académico",
    visited: (n: number, total: number) => `Visitaste ${n} de ${total} lugares`,
    soundOn: "Sonido activado",
    soundOff: "Activar sonido",
    jump: "Saltar",
    map: "Minimapa del campus",
    visitedTag: "Visitado",
    pendingTag: "Pendiente",
    sky: { day: "Día", sunset: "Atardecer", night: "Noche" },
    auto: "Hora real",
    manual: "Vista previa",
    miami: "Miami",
    skyHint: "Cambiar el momento del día",
  },
  en: {
    subtitle: "Virtual campus in Florida",
    classicSite: "← Classic site",
    catalog: "Academic catalog",
    visited: (n: number, total: number) => `You visited ${n} of ${total} places`,
    soundOn: "Sound on",
    soundOff: "Turn sound on",
    jump: "Jump",
    map: "Campus minimap",
    visitedTag: "Visited",
    pendingTag: "Pending",
    sky: { day: "Day", sunset: "Sunset", night: "Night" },
    auto: "Live time",
    manual: "Preview",
    miami: "Miami",
    skyHint: "Change the time of day",
  },
};

const HINT = {
  es: [
    ["W A S D", "caminar"],
    ["Shift", "correr"],
    ["Espacio", "saltar"],
    ["Rueda", "zoom"],
  ],
  en: [
    ["W A S D", "walk"],
    ["Shift", "run"],
    ["Space", "jump"],
    ["Wheel", "zoom"],
  ],
};

// Minimapa: los lugares empiezan en gris y se pintan de su color (con ✓) cuando
// entras a su aula, así se ve de un vistazo qué te falta. Cada punto lleva su
// nombre para orientarse.
function Minimap({ visited, label, names }: { visited: Set<string>; label: string; names: Record<string, string> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const visitedRef = useRef(visited);
  const namesRef = useRef(names);
  useEffect(() => {
    visitedRef.current = visited;
    namesRef.current = names;
  }, [visited, names]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    const W = 440;
    // La isla llena el recuadro (radio 50 ≈ mitad del canvas).
    const s = W / 102;
    const family = getComputedStyle(document.getElementById("campus-root") ?? document.body).getPropertyValue("--font-gabarito").trim() || "system-ui, sans-serif";
    function tag(text: string, x: number, y: number, color: string) {
      if (!ctx) return;
      ctx.font = `800 27px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.lineJoin = "round";
      ctx.lineWidth = 7;
      ctx.strokeStyle = "rgba(20,8,40,0.9)";
      // Que el nombre nunca se salga del recuadro (p. ej. "Certificaciones" en el borde).
      const half = ctx.measureText(text).width / 2 + 8;
      const cx = Math.min(W / 2 - half, Math.max(-W / 2 + half, x));
      ctx.strokeText(text, cx, y);
      ctx.fillStyle = color;
      ctx.fillText(text, cx, y);
    }
    function draw(now: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, W);
      ctx.save();
      ctx.translate(W / 2, W / 2);
      ctx.fillStyle = "rgba(242,199,154,.6)";
      ctx.beginPath();
      ctx.arc(0, 0, ISLAND_RADIUS * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(109,179,138,.8)";
      ctx.beginPath();
      ctx.arc(0, 0, GRASS_RADIUS * s, 0, Math.PI * 2);
      ctx.fill();
      const pulse = Math.sin(now / 300);
      for (const zn of ZONES) {
        const done = visitedRef.current.has(zn.id);
        const x = zn.x * s;
        const y = zn.z * s;
        if (done) {
          ctx.fillStyle = zn.color;
          ctx.beginPath();
          ctx.arc(x, y, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 4;
          ctx.stroke();
          // ✓ de visitado
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x - 6, y);
          ctx.lineTo(x - 1, y + 5);
          ctx.lineTo(x + 7, y - 5);
          ctx.stroke();
        } else {
          // Pendiente: gris y con un pulso suave que invita a visitarlo.
          ctx.fillStyle = "#8F8A99";
          ctx.beginPath();
          ctx.arc(x, y, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.55)";
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.45 + pulse * 0.3;
          ctx.beginPath();
          ctx.arc(x, y, 20 + pulse * 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        tag(namesRef.current[zn.id] ?? "", x, y + 23, done ? "#FFFFFF" : "rgba(235,230,242,0.8)");
      }
      // Krucn, la mascota: punto verde con borde blanco.
      const k = campusRuntime.krucn;
      ctx.fillStyle = "#3FA34D";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(k.x * s, k.z * s, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      const p = campusRuntime.player;
      ctx.translate(p.x * s, p.z * s);
      ctx.rotate(-p.heading + Math.PI);
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#24123F";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(11, 11);
      ctx.lineTo(0, 6);
      ctx.lineTo(-11, 11);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.restore();
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="h-55 w-55 overflow-hidden rounded-[28px] border-2 border-[#FFF3E6]/35 bg-[#1D0C3C]/60 backdrop-blur-md max-md:h-36 max-md:w-36 max-md:rounded-[20px]">
      <canvas ref={ref} width={440} height={440} role="img" aria-label={label} className="h-full w-full" />
    </div>
  );
}

function MinimapLegend({ visitedLabel, pendingLabel }: { visitedLabel: string; pendingLabel: string }) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-[#1D0C3C]/60 px-3 py-1 text-[11px] font-semibold text-[#FFF3E6]/85 backdrop-blur-md max-md:hidden">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#E8735A] ring-2 ring-white" />
        {visitedLabel}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#8F8A99]" />
        {pendingLabel}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#3FA34D] ring-2 ring-white" />
        Krucn
      </span>
    </div>
  );
}

function SkyIcon({ kind }: { kind: "day" | "sunset" | "night" }) {
  if (kind === "night")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#E6ECFF" aria-hidden>
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
      </svg>
    );
  if (kind === "sunset")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFC85C" strokeWidth="2" aria-hidden>
        <path d="M5 16a7 7 0 0 1 14 0M3 19h18M7 22h10M12 3v4M4.2 8.2l2.1 2.1M19.8 8.2l-2.1 2.1" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD166" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="4.5" fill="#FFD166" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CampusHud({
  visible,
  visited,
  soundOn,
  onToggleSound,
  skyMode,
  skyKind,
  floridaTime,
  onCycleSky,
  onOpenCatalog,
}: {
  visible: boolean;
  visited: Set<string>;
  soundOn: boolean;
  onToggleSound: () => void;
  skyMode: SkyMode;
  skyKind: "day" | "sunset" | "night";
  floridaTime: string;
  onCycleSky: () => void;
  onOpenCatalog: () => void;
}) {
  const t = usePick(COPY);
  const hint = usePick(HINT);
  const { locale } = useLocale();
  const names = useMemo(() => Object.fromEntries(ZONES.map((z) => [z.id, z.label[locale]])), [locale]);
  const base = `transition-opacity duration-700 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`;

  return (
    <>
      <div className={`absolute top-[calc(16px+env(safe-area-inset-top,0px))] left-5 z-10 text-[#FFF3E6] ${base}`}>
        <div className="font-(family-name:--font-gabarito) text-xl font-extrabold [text-shadow:0_2px_10px_rgba(20,6,40,.5)]">
          KUN University AI
        </div>
        <div className="text-[13px] text-[#FBE3D3]">{t.subtitle}</div>
        <Link
          href="/"
          className="mt-3 inline-block rounded-full bg-[#1D0C3C]/55 px-3.5 py-1.5 text-xs font-bold backdrop-blur-md transition hover:bg-[#1D0C3C]/80"
        >
          {t.classicSite}
        </Link>
        <button
          type="button"
          onClick={onOpenCatalog}
          className="mt-2 flex cursor-pointer items-center gap-2 rounded-full bg-[#FFC85C] px-4 py-2 text-[13px] font-bold text-[#24123F] shadow-[0_10px_24px_-10px_rgba(255,200,92,0.9)] transition hover:-translate-y-0.5"
        >
          <span aria-hidden>📚</span> {t.catalog}
        </button>
      </div>

      <div
        className={`absolute top-[calc(16px+env(safe-area-inset-top,0px))] right-5 z-10 flex flex-col items-end gap-2.5 ${base}`}
      >
        <Minimap visited={visited} label={t.map} names={names} />
        <MinimapLegend visitedLabel={t.visitedTag} pendingLabel={t.pendingTag} />
        <div className="rounded-full bg-[#1D0C3C]/60 px-3.5 py-2 text-sm font-bold text-[#FFF3E6] backdrop-blur-md" aria-live="polite">
          {t.visited(visited.size, ZONES.length)}
        </div>
        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundOn}
          className="flex items-center gap-2 rounded-full bg-[#1D0C3C]/60 px-3.5 py-2 text-xs font-bold text-[#FFF3E6] backdrop-blur-md transition hover:bg-[#1D0C3C]/85"
        >
          <span aria-hidden className="flex h-3 items-end gap-[2px]">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-[3px] rounded-full bg-[#FFC85C] ${soundOn ? "animate-pulse" : ""}`}
                style={{ height: soundOn ? `${[60, 100, 40, 80][i]}%` : "25%", animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
          {soundOn ? t.soundOn : t.soundOff}
        </button>
        <button
          type="button"
          onClick={onCycleSky}
          title={t.skyHint}
          aria-label={`${t.skyHint}: ${t.sky[skyKind]}`}
          className="flex items-center gap-2 rounded-full bg-[#1D0C3C]/60 px-3.5 py-2 text-xs font-bold text-[#FFF3E6] backdrop-blur-md transition hover:bg-[#1D0C3C]/85"
        >
          <SkyIcon kind={skyKind} />
          <span>
            {t.sky[skyKind]} · {t.miami} {floridaTime}
          </span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/75">
            {skyMode === "auto" ? t.auto : t.manual}
          </span>
        </button>
      </div>

      <div
        className={`pointer-events-none absolute bottom-[calc(22px+env(safe-area-inset-bottom,0px))] left-1/2 z-10 flex -translate-x-1/2 gap-3 rounded-2xl bg-[#1D0C3C]/55 px-4 py-2.5 text-[13px] text-[#FFF3E6] backdrop-blur-md max-md:hidden ${base}`}
      >
        {hint.map(([key, action]) => (
          <span key={key} className="flex items-center gap-1.5 whitespace-nowrap">
            <kbd className="rounded-md border border-[#FFF3E6]/35 bg-[#FFF3E6]/15 px-1.5 py-px font-sans text-xs font-bold">
              {key}
            </kbd>
            {action}
          </span>
        ))}
      </div>
    </>
  );
}

// Joystick que aparece donde se apoya el dedo, más un botón para saltar.
export function CampusTouchControls({ enabled, targetRef }: { enabled: boolean; targetRef: React.RefObject<HTMLElement | null> }) {
  const t = usePick(COPY);
  const [stick, setStick] = useState<{ x: number; y: number; kx: number; ky: number } | null>(null);
  const [touchDevice, setTouchDevice] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || !enabled) return;
    let pointerId: number | null = null;
    let origin = { x: 0, y: 0 };
    const MAX = 50;

    function down(e: PointerEvent) {
      if (e.pointerType === "mouse" || pointerId !== null) return;
      if ((e.target as HTMLElement).closest("button, a, input, select, [role=dialog], aside")) return;
      setTouchDevice(true);
      pointerId = e.pointerId;
      origin = { x: e.clientX, y: e.clientY };
      campusRuntime.stick.active = true;
      setStick({ x: e.clientX, y: e.clientY, kx: 0, ky: 0 });
    }
    function move(e: PointerEvent) {
      if (e.pointerId !== pointerId) return;
      let dx = e.clientX - origin.x;
      let dy = e.clientY - origin.y;
      const l = Math.hypot(dx, dy);
      if (l > MAX) {
        dx = (dx / l) * MAX;
        dy = (dy / l) * MAX;
      }
      campusRuntime.stick.x = dx / MAX;
      campusRuntime.stick.z = dy / MAX;
      setStick({ x: origin.x, y: origin.y, kx: dx, ky: dy });
    }
    function up(e: PointerEvent) {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      campusRuntime.stick.x = 0;
      campusRuntime.stick.z = 0;
      campusRuntime.stick.active = false;
      setStick(null);
    }
    target.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      target.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [enabled, targetRef]);

  return (
    <>
      {stick && (
        <div
          className="pointer-events-none fixed z-30 h-30 w-30 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FFF3E6]/50 bg-[#1D0C3C]/25"
          style={{ left: stick.x, top: stick.y }}
        >
          <div
            className="absolute top-1/2 left-1/2 -mt-6.5 -ml-6.5 h-13 w-13 rounded-full bg-[#FFF3E6]/85"
            style={{ transform: `translate(${stick.kx}px, ${stick.ky}px)` }}
          />
        </div>
      )}
      {enabled && touchDevice && (
        <button
          type="button"
          onPointerDown={() => {
            campusRuntime.jumpQueued = true;
          }}
          className="fixed right-5 bottom-[calc(140px+env(safe-area-inset-bottom,0px))] z-30 h-16 w-16 rounded-full border-2 border-[#FFF3E6]/50 bg-[#1D0C3C]/45 text-xs font-bold text-[#FFF3E6] backdrop-blur-md active:scale-95"
        >
          {t.jump}
        </button>
      )}
    </>
  );
}

export function CampusToast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      role="status"
      className={`pointer-events-none absolute bottom-[calc(76px+env(safe-area-inset-bottom,0px))] left-1/2 z-30 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full bg-[#FFC85C] px-5 py-3 text-center text-sm font-bold text-[#24123F] shadow-[0_14px_30px_-10px_rgba(20,6,40,0.6)] transition-[opacity,translate] duration-300 max-md:bottom-[calc(150px+env(safe-area-inset-bottom,0px))] ${
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
