"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { playBump, playChime, playFanfare, playLaunch, setCampusSound } from "./campus-audio";
import { CampusFormModal } from "./campus-form-modal";
import { CampusHud, CampusToast, CampusTouchControls } from "./campus-hud";
import { CampusBoard } from "./campus-board";
import { CampusIntro } from "./campus-intro";
import { CampusLoader } from "./campus-loader";
import { CampusPortal, CampusZonePrompt, type PortalStage } from "./campus-portal";
import { campusRuntime, resetCampusInput } from "./campus-runtime";
import type { CampusPhase } from "./campus-scene";
import { skyLabel, useFloridaSky, type SkyMode } from "./campus-sky";
import { OUTFIT_COLORS, SKIN_TONES } from "./campus-characters";
import { PLAYER_START, ZONES, type Avatar } from "./campus-zones";
import { hasWebGL } from "./has-webgl";
import { NoWebGLFallback } from "./no-webgl-fallback";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { Certification, School, Stats } from "@/lib/types";

const CampusScene = dynamic(() => import("./campus-scene").then((m) => m.CampusScene), { ssr: false });

const COPY = {
  es: {
    defaultName: "Estudiante",
    hello: (name: string) => `Hola, ${name}. Empuja las letras y sigue al currículo vivo, frente a ti.`,
    allVisited: "Recorriste todo el campus. Admisiones te espera.",
    launch: "Despegue. Tu carrera también arranca aquí.",
    submitted: "Solicitud lista. En la versión final llegará a admisiones.",
  },
  en: {
    defaultName: "Student",
    hello: (name: string) => `Hi, ${name}. Push the letters and head to the living curriculum, right ahead.`,
    allVisited: "You explored the whole campus. Admissions is waiting for you.",
    launch: "Liftoff. Your career takes off here too.",
    submitted: "Request ready. In the final version it will reach admissions.",
  },
};

const SKY_CYCLE: SkyMode[] = ["auto", "day", "sunset", "night"];

/** Hora actual en Miami, formateada para el HUD. */
function useFloridaClock(locale: "es" | "en") {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(locale === "es" ? "es-CO" : "en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
    });
    const update = () => setTime(fmt.format(new Date()));
    const first = window.setTimeout(update, 0);
    const id = window.setInterval(update, 15_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [locale]);
  return time;
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduce;
}

export function CampusExperience(props: {
  schools: School[];
  certifications: Certification[];
  stats: Stats;
}) {
  const { schools, certifications, stats } = props;
  const t = usePick(COPY);
  const { locale } = useLocale();
  const reduceMotion = usePrefersReducedMotion();
  const [webglOk] = useState(() => (typeof window !== "undefined" ? hasWebGL() : true));

  const [phase, setPhase] = useState<CampusPhase>("loading");
  const [sceneReady, setSceneReady] = useState(false);
  const [leavingIntro, setLeavingIntro] = useState(false);
  const [avatar, setAvatar] = useState<Avatar>({ name: "", character: "woman-casual", skin: SKIN_TONES[2], outfit: OUTFIT_COLORS[0], accessory: "cap" });
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const [soundOn, setSoundOn] = useState(false);
  const [form, setForm] = useState<{ open: boolean; program: string }>({ open: false, program: "" });
  const [toast, setToast] = useState({ message: "", visible: false });
  const [interiorId, setInteriorId] = useState<string | null>(null);
  const [skyMode, setSkyMode] = useState<SkyMode>("auto");
  const sky = useFloridaSky(skyMode);
  const floridaTime = useFloridaClock(locale);
  const [portal, setPortal] = useState<{ stage: PortalStage; zoneId: string | null; leaving: boolean }>({
    stage: "idle",
    zoneId: null,
    leaving: false,
  });

  const playerRef = useRef<THREE.Group>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const visitedRef = useRef(visited);
  const portalTimers = useRef<number[]>([]);
  const portalBusy = useRef(false);

  // El estado de runtime es un módulo compartido: lo reiniciamos al entrar a la
  // página para que una navegación de ida y vuelta no herede teclas ni cohete.
  useEffect(() => {
    resetCampusInput();
    campusRuntime.launchAt = 0;
    campusRuntime.zoom = 1;
    campusRuntime.player.x = PLAYER_START[0];
    campusRuntime.player.z = PLAYER_START[2];
    return () => {
      resetCampusInput();
      setCampusSound(false);
      window.clearTimeout(toastTimer.current);
      portalTimers.current.forEach(clearTimeout);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast((s) => ({ ...s, visible: false })), 3200);
  }, []);

  const handleZoneChange = useCallback((id: string | null) => setActiveZoneId(id), []);

  // Un lugar cuenta como visitado cuando entras a su aula, no solo al pasar cerca.
  function markVisited(id: string) {
    if (visitedRef.current.has(id)) return;
    const next = new Set(visitedRef.current);
    next.add(id);
    visitedRef.current = next;
    setVisited(next);
    if (next.size === ZONES.length) {
      playFanfare();
      showToast(t.allVisited);
    } else {
      playChime();
    }
  }

  // Telón: se cierra, cambia la escena por debajo y se vuelve a abrir.
  function runPortal(zoneId: string, leaving: boolean, swap: () => void) {
    if (portalBusy.current) return;
    portalBusy.current = true;
    portalTimers.current.forEach(clearTimeout);
    const cover = reduceMotion ? 320 : 700;
    setPortal({ stage: "cover", zoneId, leaving });
    portalTimers.current = [
      window.setTimeout(() => {
        swap();
        setPortal((p) => ({ ...p, stage: "reveal" }));
      }, cover + 200),
      window.setTimeout(() => {
        setPortal({ stage: "idle", zoneId: null, leaving: false });
        portalBusy.current = false;
      }, cover * 2 + 250),
    ];
  }

  function enterZone(id: string) {
    runPortal(id, false, () => {
      resetCampusInput();
      setInteriorId(id);
      setPhase("inside");
      markVisited(id);
    });
  }

  function exitZone(after?: () => void) {
    if (!interiorId) return;
    runPortal(interiorId, true, () => {
      setPhase("playing");
      setInteriorId(null);
      wrapperRef.current?.focus();
      if (after) portalTimers.current.push(window.setTimeout(after, 900));
    });
  }

  // Teclado: E / Enter para entrar al edificio cercano, Esc para salir del aula.
  const live = useRef({ phase, activeZoneId, formOpen: form.open, enter: enterZone, exit: () => exitZone() });
  useEffect(() => {
    live.current = { phase, activeZoneId, formOpen: form.open, enter: enterZone, exit: () => exitZone() };
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = live.current;
      if (s.formOpen) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest?.("input, select, textarea, button, a")) return;
      if (s.phase === "playing" && s.activeZoneId && (e.code === "KeyE" || e.code === "Enter")) {
        e.preventDefault();
        s.enter(s.activeZoneId);
      } else if (s.phase === "inside" && e.code === "Escape") {
        s.exit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleLoaderDone = useCallback(() => setPhase((p) => (p === "loading" ? "intro" : p)), []);

  function start() {
    const name = avatar.name.trim().slice(0, 16) || t.defaultName;
    setAvatar((a) => ({ ...a, name }));
    setLeavingIntro(true);
    setPhase("playing");
    showToast(t.hello(name));
    wrapperRef.current?.focus();
  }

  function launch() {
    if (campusRuntime.launchAt) return;
    campusRuntime.launchAt = performance.now();
    playLaunch();
    showToast(t.launch);
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setCampusSound(next);
  }

  if (!webglOk) return <NoWebGLFallback />;

  const activeZone = ZONES.find((z) => z.id === activeZoneId) ?? null;
  const interiorZone = ZONES.find((z) => z.id === interiorId) ?? null;
  const portalZone = ZONES.find((z) => z.id === portal.zoneId) ?? null;
  const playing = phase === "playing";

  return (
    <div
      ref={wrapperRef}
      tabIndex={-1}
      className="absolute inset-0 overflow-hidden bg-[#2A1758] outline-none select-none"
      onWheel={(e) => {
        if (!playing) return;
        campusRuntime.zoom = Math.min(1.6, Math.max(0.6, campusRuntime.zoom + e.deltaY * 0.001));
      }}
    >
      <div className="absolute inset-0 touch-none">
        <CampusScene
          phase={phase}
          avatar={avatar}
          locale={locale}
          activeZoneId={activeZoneId}
          interiorZone={interiorZone}
          eventSource={wrapperRef}
          sky={sky}
          reduceMotion={reduceMotion}
          playerRef={playerRef}
          onZoneChange={handleZoneChange}
          onReady={handleSceneReady}
          onBump={playBump}
        />
      </div>

      <CampusIntro
        visible={phase === "intro"}
        leaving={leavingIntro}
        avatar={avatar}
        reduceMotion={reduceMotion}
        onChange={setAvatar}
        onStart={start}
      />
      <CampusHud
        visible={playing}
        visited={visited}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        skyMode={skyMode}
        skyKind={skyLabel(sky)}
        floridaTime={floridaTime}
        onCycleSky={() => setSkyMode((m) => SKY_CYCLE[(SKY_CYCLE.indexOf(m) + 1) % SKY_CYCLE.length])}
      />
      <CampusZonePrompt
        zone={playing && portal.stage === "idle" ? activeZone : null}
        schools={schools}
        onEnter={() => activeZoneId && enterZone(activeZoneId)}
      />
      {phase === "inside" && interiorZone && (
        <CampusBoard
          zone={interiorZone}
          schools={schools}
          certifications={certifications}
          stats={stats}
          actions={{
            onExit: () => exitZone(),
            onRequestInfo: (program) => setForm({ open: true, program: program ?? "" }),
            onLaunch: () => exitZone(launch),
          }}
        />
      )}
      <CampusTouchControls enabled={playing && !form.open} targetRef={wrapperRef} />
      <CampusToast message={toast.message} visible={toast.visible} />
      <CampusFormModal
        open={form.open}
        schools={schools}
        defaultName={avatar.name}
        defaultProgram={form.program}
        onClose={() => setForm((f) => ({ ...f, open: false }))}
        onSubmitted={() => {
          setForm((f) => ({ ...f, open: false }));
          showToast(t.submitted);
        }}
      />
      <CampusPortal
        stage={portal.stage}
        zone={portalZone}
        leaving={portal.leaving}
        schools={schools}
        reduceMotion={reduceMotion}
      />
      <CampusLoader ready={sceneReady} reduceMotion={reduceMotion} onDone={handleLoaderDone} />
    </div>
  );
}
