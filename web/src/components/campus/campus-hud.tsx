"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, usePick } from "@/i18n/locale-context";
import { ADMISSIONS_EMAIL, SOCIAL_LINKS, socialHref } from "@/lib/contact";
import { SocialIcon } from "../social-icons";
import { visiblePlayers } from "@/lib/campus-presence";
import { campusRuntime } from "./campus-runtime";
import type { SkyMode } from "./campus-sky";
import { CAFE, findGuidePlace, GRASS_RADIUS, ISLAND_RADIUS, STORE, ZONES, zoneDoor } from "./campus-zones";

const COPY = {
  es: {
    subtitle: "Campus virtual en Florida",
    classicSite: "← Sitio clásico",
    catalog: "Catálogo académico",
    editAvatar: "Mi personaje",
    follow: "Síguenos",
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
    guiding: "Krucn te lleva a",
    cancelGuide: "Cancelar",
  },
  en: {
    subtitle: "Virtual campus in Florida",
    classicSite: "← Classic site",
    catalog: "Academic catalog",
    editAvatar: "My character",
    follow: "Follow us",
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
    guiding: "Krucn is taking you to",
    cancelGuide: "Cancel",
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
      // Cafetería: punto de encuentro (no cuenta como lugar por visitar).
      ctx.fillStyle = CAFE.color;
      ctx.strokeStyle = "#FFF3E6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(CAFE.x * s, CAFE.z * s, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = `18px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☕", CAFE.x * s, CAFE.z * s + 1);
      // Encima del punto: debajo chocaría con el nombre de Ingeniería.
      tag(namesRef.current.cafe ?? "", CAFE.x * s, CAFE.z * s - 46, "rgba(235,230,242,0.8)");
      // KUN Store.
      ctx.fillStyle = STORE.color;
      ctx.strokeStyle = "#FFF3E6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(STORE.x * s, STORE.z * s, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = `16px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🛍️", STORE.x * s, STORE.z * s + 1);
      tag(namesRef.current.store ?? "", STORE.x * s, STORE.z * s + 18, "rgba(235,230,242,0.8)");
      // Las demás personas conectadas.
      for (const other of visiblePlayers()) {
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#1E6B5C";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(other.x * s, other.z * s, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      // Ruta de Krucn: línea punteada del jugador a la puerta y anillo en el destino.
      const gz = findGuidePlace(campusRuntime.guide.zone);
      if (gz) {
        const door = zoneDoor(gz);
        const me = campusRuntime.player;
        ctx.save();
        ctx.setLineDash([10, 9]);
        ctx.lineDashOffset = -now / 40;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(me.x * s, me.z * s);
        ctx.lineTo(door.x * s, door.z * s);
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = gz.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(gz.x * s, gz.z * s, 26 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
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
    <div className="h-55 w-55 overflow-hidden rounded-[28px] border-2 border-[#FFF3E6]/35 bg-[#1D0C3C]/60 backdrop-blur-md max-md:h-32 max-md:w-32 max-md:rounded-[20px]">
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
  onEditAvatar,
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
  onEditAvatar: () => void;
}) {
  const t = usePick(COPY);
  const hint = usePick(HINT);
  const { locale } = useLocale();
  const names = useMemo(() => ({ ...Object.fromEntries(ZONES.map((z) => [z.id, z.label[locale]])), cafe: CAFE.label[locale], store: STORE.label[locale] }), [locale]);
  const base = `transition-opacity duration-700 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`;

  return (
    <>
      <div className={`absolute top-[calc(16px+env(safe-area-inset-top,0px))] left-5 z-10 text-[#FFF3E6] max-md:top-[calc(12px+env(safe-area-inset-top,0px))] max-md:left-3 ${base}`}>
        <div className="font-(family-name:--font-gabarito) text-xl font-extrabold [text-shadow:0_2px_10px_rgba(20,6,40,.5)] max-md:text-base">
          KUN University AI
        </div>
        <div className="text-[13px] text-[#FBE3D3] max-md:text-[11px]">{t.subtitle}</div>
        <Link
          href="/"
          className="mt-3 inline-block rounded-full bg-[#1D0C3C]/55 px-3.5 py-1.5 text-xs font-bold backdrop-blur-md transition hover:bg-[#1D0C3C]/80 max-md:mt-2 max-md:px-3 max-md:py-1 max-md:text-[11px]"
        >
          {t.classicSite}
        </Link>
        <button
          type="button"
          onClick={onOpenCatalog}
          className="mt-2 flex cursor-pointer items-center gap-2 rounded-full bg-[#FFC85C] px-4 py-2 text-[13px] font-bold text-[#24123F] shadow-[0_10px_24px_-10px_rgba(255,200,92,0.9)] transition hover:-translate-y-0.5 max-md:mt-1.5 max-md:gap-1.5 max-md:px-3 max-md:py-1.5 max-md:text-xs"
        >
          <span aria-hidden>📚</span> {t.catalog}
        </button>
        <button
          type="button"
          onClick={onEditAvatar}
          className="mt-2 flex cursor-pointer items-center gap-2 rounded-full bg-[#1D0C3C]/60 px-4 py-2 text-[13px] font-bold backdrop-blur-md transition hover:bg-[#1D0C3C]/85 max-md:mt-1.5 max-md:px-3 max-md:py-1.5 max-md:text-xs"
        >
          <span aria-hidden>✏️</span> {t.editAvatar}
        </button>
      </div>

      <div
        className={`absolute top-[calc(16px+env(safe-area-inset-top,0px))] right-5 z-10 flex flex-col items-end gap-2.5 max-md:top-[calc(12px+env(safe-area-inset-top,0px))] max-md:right-3 max-md:gap-1.5 ${base}`}
      >
        <div className="relative">
          <Minimap visited={visited} label={t.map} names={names} />
          {/* En celular el contador va como insignia sobre el minimapa. */}
          <span
            aria-hidden
            className="absolute -bottom-1.5 left-1/2 hidden -translate-x-1/2 rounded-full bg-[#FFC85C] px-2 py-0.5 text-[11px] font-black whitespace-nowrap text-[#24123F] max-md:block"
          >
            ✓ {visited.size}/{ZONES.length}
          </span>
        </div>
        <MinimapLegend visitedLabel={t.visitedTag} pendingLabel={t.pendingTag} />
        <div
          className="rounded-full bg-[#1D0C3C]/60 px-3.5 py-2 text-sm font-bold text-[#FFF3E6] backdrop-blur-md max-md:sr-only"
          aria-live="polite"
        >
          {t.visited(visited.size, ZONES.length)}
        </div>
        <div className="flex flex-col items-end gap-2.5 max-md:mt-2 max-md:flex-row max-md:gap-1.5">
        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? t.soundOn : t.soundOff}
          className="flex items-center gap-2 rounded-full bg-[#1D0C3C]/60 px-3.5 py-2 text-xs font-bold text-[#FFF3E6] backdrop-blur-md transition hover:bg-[#1D0C3C]/85 max-md:h-9 max-md:px-3"
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
          <span className="max-md:hidden">{soundOn ? t.soundOn : t.soundOff}</span>
        </button>
        <button
          type="button"
          onClick={onCycleSky}
          title={t.skyHint}
          aria-label={`${t.skyHint}: ${t.sky[skyKind]}`}
          className="flex items-center gap-2 rounded-full bg-[#1D0C3C]/60 px-3.5 py-2 text-xs font-bold text-[#FFF3E6] backdrop-blur-md transition hover:bg-[#1D0C3C]/85 max-md:h-9 max-md:gap-1.5 max-md:px-3"
        >
          <SkyIcon kind={skyKind} />
          <span>
            <span className="max-md:hidden">
              {t.sky[skyKind]} · {t.miami}{" "}
            </span>
            {floridaTime}
          </span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/75 max-md:hidden">
            {skyMode === "auto" ? t.auto : t.manual}
          </span>
        </button>
        </div>
      </div>

      <div
        className={`absolute bottom-[calc(22px+env(safe-area-inset-bottom,0px))] left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#1D0C3C]/55 px-4 py-2 text-[13px] text-[#FFF3E6] backdrop-blur-md max-md:px-2.5 ${base}`}
      >
        {hint.map(([key, action]) => (
          <span key={key} className="flex items-center gap-1.5 whitespace-nowrap max-lg:hidden">
            <kbd className="rounded-md border border-[#FFF3E6]/35 bg-[#FFF3E6]/15 px-1.5 py-px font-sans text-xs font-bold">
              {key}
            </kbd>
            {action}
          </span>
        ))}
        {/* "Footer" del campus: redes y correo de admisiones, compactos */}
        <span aria-hidden className="h-5 w-px bg-white/20 max-lg:hidden" />
        <span className="flex items-center gap-0.5" aria-label={t.follow}>
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.network}
              href={socialHref(s.href)}
              target={s.href ? "_blank" : undefined}
              rel={s.href ? "noopener noreferrer" : undefined}
              aria-label={s.label}
              title={s.label}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#FFF3E6]/80 transition hover:bg-white/10 hover:text-[#FFC85C]"
            >
              <SocialIcon network={s.network} size={14} />
            </a>
          ))}
          <a
            href={`mailto:${ADMISSIONS_EMAIL}`}
            aria-label={ADMISSIONS_EMAIL}
            title={ADMISSIONS_EMAIL}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#FFF3E6]/80 transition hover:bg-white/10 hover:text-[#FFC85C]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </a>
        </span>
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
          className="fixed right-4 bottom-[calc(128px+env(safe-area-inset-bottom,0px))] z-30 h-16 w-16 rounded-full border-2 border-[#FFF3E6]/50 bg-[#1D0C3C]/45 text-xs font-bold text-[#FFF3E6] backdrop-blur-md active:scale-95"
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

/** Aviso mientras Krucn guía: a dónde va, a cuántos metros y cómo cancelar. */
export function CampusGuidePill({
  zoneId,
  onCancel,
  onArrive,
}: {
  zoneId: string | null;
  onCancel: () => void;
  /** Al llegar a la puerta (sirve también para la cafetería, que no es una zona con sala). */
  onArrive: (id: string) => void;
}) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  const meters = useRef<HTMLSpanElement>(null);
  const zone = findGuidePlace(zoneId);

  useEffect(() => {
    if (!zone) return;
    let raf = 0;
    const door = zoneDoor(zone);
    const tick = () => {
      const p = campusRuntime.player;
      const d = Math.hypot(door.x - p.x, door.z - p.z);
      if (meters.current) meters.current.textContent = `${Math.max(0, Math.round(d))} m`;
      if (d < 2.5) {
        onArrive(zone.id);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [zone, onArrive]);

  if (!zone) return null;
  return (
    <div
      role="status"
      className="reveal-animate absolute inset-x-0 top-[calc(16px+env(safe-area-inset-top,0px))] z-20 mx-auto flex w-fit max-w-[calc(100%-560px)] items-center gap-2.5 rounded-full border-2 bg-[#0E061E]/80 py-1.5 pr-1.5 pl-4 text-[13px] font-bold text-[#FFF3E6] backdrop-blur-md max-md:top-[calc(268px+env(safe-area-inset-top,0px))] max-md:right-auto max-md:left-3 max-md:mx-0 max-md:max-w-[calc(100%-24px)] max-md:text-[12px]"
      style={{ borderColor: zone.color }}
    >
      <span aria-hidden className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full" style={{ background: zone.color }} />
      <span className="min-w-0 truncate">
        {t.guiding} {zone.label[locale]} · <span ref={meters} className="tabular-nums" />
      </span>
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 cursor-pointer rounded-full bg-white/12 px-3 py-1 text-[12px] transition hover:bg-white/25"
      >
        {t.cancelGuide}
      </button>
    </div>
  );
}
