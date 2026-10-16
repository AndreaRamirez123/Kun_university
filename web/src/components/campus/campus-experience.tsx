"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as THREE from "three";
import { playBump, playChime, playFanfare, playLaunch, setCampusSound } from "./campus-audio";
import { CampusFormModal } from "./campus-form-modal";
import { CampusHud, CampusToast, CampusTouchControls } from "./campus-hud";
import { StudioRoom } from "./campus-admissions-ui";
import { CampusCatalog } from "./campus-catalog";
import { zoneChapters } from "./campus-zone-chapters";
import { ZONE_VIDEO_URLS } from "./campus-explainer";
import { CampusGenderStep, CampusIntro } from "./campus-intro";
import { LINEUP, LINEUP_ORDER } from "./campus-lineup";
import { CampusLoader } from "./campus-loader";
import { CampusPortal, CampusZonePrompt, type PortalStage } from "./campus-portal";
import { KrucnDialog, KrucnPrompt } from "./campus-krucn-dialog";
import { campusRuntime, resetCampusInput } from "./campus-runtime";
import type { CampusPhase } from "./campus-scene";
import { skyLabel, useFloridaSky, type SkyMode } from "./campus-sky";
import { DEFAULT_AVATAR, type Gender } from "./campus-avatar";
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
    launchRocket: "Despegar el cohete",
    coursePlan: "Programas y materias →",
  },
  en: {
    defaultName: "Student",
    hello: (name: string) => `Hi, ${name}. Push the letters and head to the living curriculum, right ahead.`,
    allVisited: "You explored the whole campus. Admissions is waiting for you.",
    launch: "Liftoff. Your career takes off here too.",
    submitted: "Request ready. In the final version it will reach admissions.",
    launchRocket: "Launch the rocket",
    coursePlan: "Programs and courses →",
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
  const [avatar, setAvatar] = useState<Avatar>(DEFAULT_AVATAR);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const [soundOn, setSoundOn] = useState(false);
  const [form, setForm] = useState<{ open: boolean; program: string }>({ open: false, program: "" });
  // Catálogo académico (escuelas → programas → materias), leído de src/data.
  const [catalogView, setCatalogView] = useState<{ open: boolean; school?: string }>({ open: false });
  const [toast, setToast] = useState({ message: "", visible: false });
  const [interiorId, setInteriorId] = useState<string | null>(null);
  // Creador en dos pasos: primero elegir personaje (con vista previa), luego personalizar.
  const [introStep, setIntroStep] = useState<"choose" | "edit">("choose");
  const [chosen, setChosen] = useState<Gender>("female");
  // Krucn, la mascota: si está cerca y si se está conversando con él.
  const [krucnNear, setKrucnNear] = useState(false);
  const [talking, setTalking] = useState(false);
  const [talk, setTalk] = useState(0);
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

  function startTalk() {
    resetCampusInput();
    setTalk((n) => n + 1);
    setTalking(true);
  }

  // En celular los botones flotantes del sitio (idioma, modelos) tapan los paneles:
  // se esconden mientras hay lobby, sala, Krucn, catálogo o formulario abiertos.
  const overlayOpen = phase !== "playing" || talking || form.open || catalogView.open;
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.campusOverlay = overlayOpen ? "on" : "off";
    return () => {
      delete root.dataset.campusOverlay;
    };
  }, [overlayOpen]);

  // Botón "atrás" del navegador: dentro de una sala (o con el catálogo, el
  // formulario o Krucn abiertos) vuelve al campus en vez de salir de la página.
  // Al abrir se agrega una entrada al historial; "atrás" cierra lo de encima.
  const inOverlay = phase === "inside" || catalogView.open || form.open || talking;
  const [backTick, setBackTick] = useState(0);
  const historyRef = useRef({ pushed: false, ignorePop: false });
  const closeTop = useRef(() => {});
  useEffect(() => {
    closeTop.current = () => {
      if (form.open) setForm((f) => ({ ...f, open: false }));
      else if (catalogView.open) setCatalogView({ open: false });
      else if (talking) setTalking(false);
      else if (phase === "inside" && portal.stage === "idle") exitZone();
    };
  });
  useEffect(() => {
    const h = historyRef.current;
    if (inOverlay && !h.pushed) {
      window.history.pushState({ kunCampus: true }, "");
      h.pushed = true;
    } else if (!inOverlay && h.pushed) {
      // Se cerró con un botón de la interfaz: se quita la entrada que agregamos.
      h.pushed = false;
      h.ignorePop = true;
      window.history.back();
    }
  }, [inOverlay, backTick]);
  useEffect(() => {
    function onPop() {
      const h = historyRef.current;
      if (h.ignorePop) {
        h.ignorePop = false;
        return;
      }
      if (!h.pushed) return;
      h.pushed = false;
      closeTop.current();
      // Si queda algo abierto debajo (p. ej. la sala tras el catálogo), se vuelve a proteger.
      setBackTick((n) => n + 1);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Teclado: E / Enter para hablar con Krucn o entrar al edificio cercano, Esc para cerrar.
  const live = useRef({ phase, activeZoneId, formOpen: form.open || catalogView.open, krucnNear, talking, enter: enterZone, exit: () => exitZone(), talk: startTalk });
  useEffect(() => {
    live.current = { phase, activeZoneId, formOpen: form.open || catalogView.open, krucnNear, talking, enter: enterZone, exit: () => exitZone(), talk: startTalk };
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = live.current;
      if (s.formOpen) return;
      if (s.talking && e.code === "Escape") {
        setTalking(false);
        return;
      }
      const el = e.target as HTMLElement | null;
      if (el?.closest?.("input, select, textarea, button, a")) return;
      if (s.phase === "playing" && !s.talking && s.krucnNear && (e.code === "KeyE" || e.code === "Enter")) {
        // Krucn tiene prioridad sobre el edificio cercano.
        e.preventDefault();
        s.talk();
      } else if (s.phase === "playing" && !s.talking && s.activeZoneId && (e.code === "KeyE" || e.code === "Enter")) {
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

  const interiorZone = ZONES.find((z) => z.id === interiorId) ?? null;
  // Video de cada lugar, armado con sus datos (escuela, certificaciones…).
  const interiorChapters = useMemo(
    () => (interiorZone ? zoneChapters(interiorZone, locale, stats, schools, certifications) : null),
    [interiorZone, locale, stats, schools, certifications],
  );

  if (!webglOk) return <NoWebGLFallback />;

  const activeZone = ZONES.find((z) => z.id === activeZoneId) ?? null;
  const interiorSchool = interiorZone?.schoolSlug ? schools.find((s) => s.slug === interiorZone.schoolSlug) : undefined;
  const roomTitle = interiorZone ? `${interiorSchool ? interiorSchool.name[locale] : interiorZone.label[locale]} · KUN University AI` : "";
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
          lineupGender={phase !== "playing" && phase !== "inside" && introStep === "choose" ? chosen : null}
          krucnTalking={talking}
          onKrucnNear={setKrucnNear}
          stats={stats}
          interiorChapters={interiorChapters}
          reduceMotion={reduceMotion}
          playerRef={playerRef}
          onZoneChange={handleZoneChange}
          onReady={handleSceneReady}
          onBump={playBump}
        />
      </div>

      <CampusGenderStep
        visible={phase === "intro" && introStep === "choose"}
        selected={chosen}
        order={LINEUP_ORDER}
        onSelect={setChosen}
        onContinue={() => {
          setAvatar((a) => ({ ...LINEUP[chosen], name: a.name }));
          setIntroStep("edit");
        }}
      />
      <CampusIntro
        visible={phase === "intro" && introStep === "edit"}
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
        onOpenCatalog={() => setCatalogView({ open: true })}
      />
      <CampusZonePrompt
        zone={playing && portal.stage === "idle" && !krucnNear && !talking ? activeZone : null}
        schools={schools}
        onEnter={() => activeZoneId && enterZone(activeZoneId)}
      />
      <KrucnPrompt visible={playing && portal.stage === "idle" && krucnNear && !talking} onTalk={startTalk} />
      <KrucnDialog
        key={talk}
        open={playing && talking}
        playerName={avatar.name.trim()}
        schools={schools}
        onClose={() => setTalking(false)}
      />
      {phase === "inside" && interiorZone && interiorChapters && (
        <StudioRoom
          key={`${interiorZone.id}-${locale}`}
          chapters={interiorChapters}
          roomTitle={roomTitle}
          stats={stats}
          videoUrl={ZONE_VIDEO_URLS[interiorZone.id] ?? null}
          playerName={avatar.name.trim()}
          defaultProgram={interiorSchool?.programs[0]?.name ?? ""}
          extraAction={
            interiorZone.kind === "certifications"
              ? { label: t.launchRocket, onClick: () => exitZone(launch) }
              : interiorSchool
                ? { label: t.coursePlan, onClick: () => setCatalogView({ open: true, school: interiorSchool.name.es }) }
                : undefined
          }
          onExit={() => exitZone()}
          schoolName={interiorSchool?.name.es}
        />
      )}
      <CampusTouchControls enabled={playing && !form.open && !talking && !catalogView.open} targetRef={wrapperRef} />
      <CampusToast message={toast.message} visible={toast.visible} />
      <CampusCatalog
        key={catalogView.open ? (catalogView.school ?? "all") : "closed"}
        open={catalogView.open}
        initialSchool={catalogView.school}
        onClose={() => setCatalogView({ open: false })}
        onSignup={(program) => {
          setCatalogView({ open: false });
          setForm({ open: true, program });
        }}
      />
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
