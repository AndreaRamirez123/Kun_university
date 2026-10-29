"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as THREE from "three";
import { playBump, playChime, playCroc, playFanfare, playLaunch, setAmbience, setCampusSound } from "./campus-audio";
import { CampusFormModal } from "./campus-form-modal";
import { CampusGuidePill, CampusHud, CampusToast, CampusTouchControls } from "./campus-hud";
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
import { findGuidePlace, PLAYER_START, ZONES, type Avatar } from "./campus-zones";
import { hasWebGL } from "./has-webgl";
import { NoWebGLFallback } from "./no-webgl-fallback";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { KrucnAction } from "@/lib/krucn-agent";
import { joinPresence, leavePresence, sendEmote, updateProfile } from "@/lib/campus-presence";
import { serializeAvatar } from "./campus-social";
import { CampusSocialPanel } from "./campus-social-panel";
import { CampusSeatPrompt } from "./campus-seat-prompt";
import { CampusTips } from "./campus-tips";
import { CampusCafePrompt, CampusCoinsHud, CampusShop, CampusStorePrompt } from "./campus-shop";
import { CampusDemoCourse } from "./campus-demo-class";
import { schoolHasDemo } from "./campus-demo";
import { earn } from "./campus-wallet";
import { playCoin } from "./campus-audio";
import type { Certification, School, Stats } from "@/lib/types";

const CampusScene = dynamic(() => import("./campus-scene").then((m) => m.CampusScene), { ssr: false });

const COPY = {
  es: {
    defaultName: "Estudiante",
    hello: (name: string) => `Hola, ${name}. Empuja las letras y sigue al currículo vivo, frente a ti.`,
    allVisited: "Recorriste todo el campus. Admisiones te espera.",
    launch: "Despegue. Tu carrera también arranca aquí.",
    submitted: "¡Listo! Quedaste en la lista de interés.",
    stayHint: "Sigues en el campus. Para salir usa «← Sitio clásico».",
    following: "Sigue a Krucn y la luz sobre el edificio.",
    arrived: (place: string) => `¡Llegaste a ${place}! Pulsa E o toca «Entrar».`,
    launchRocket: "Despegar el cohete",
    coursePlan: "Programas y materias →",
    coursePlanDemo: "Programas y clases demo →",
  },
  en: {
    defaultName: "Student",
    hello: (name: string) => `Hi, ${name}. Push the letters and head to the living curriculum, right ahead.`,
    allVisited: "You explored the whole campus. Admissions is waiting for you.",
    launch: "Liftoff. Your career takes off here too.",
    submitted: "Done! You are on the interest list.",
    stayHint: "You're still on campus. To leave, use “← Classic site”.",
    following: "Follow Krucn and the light above the building.",
    arrived: (place: string) => `You made it to ${place}! Press E or tap “Enter”.`,
    launchRocket: "Launch the rocket",
    coursePlan: "Programs and courses →",
    coursePlanDemo: "Programs and demo classes →",
  },
};

const SKY_CYCLE: SkyMode[] = ["auto", "day", "sunset", "night"];

const normName = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .toLowerCase()
    .trim();

/** Nombre del programa en la API que corresponde al que nombró Krucn (o el mismo nombre). */
function matchApiProgram(schools: School[], name: string) {
  const n = normName(name);
  const all = schools.flatMap((s) => s.programs.map((p) => p.name));
  return all.find((p) => normName(p) === n) ?? all.find((p) => normName(p).includes(n) || n.includes(normName(p))) ?? name;
}

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
  const [catalogView, setCatalogView] = useState<{ open: boolean; school?: string; program?: string }>({ open: false });
  // Lugar al que Krucn está guiando (id de zona). La escena lo lee de campusRuntime.
  const [guide, setGuide] = useState<string | null>(null);
  // Tienda de recompensas (KUN Store).
  const [shopOpen, setShopOpen] = useState(false);
  // Menú de la cafetería (las comidas y bebidas van aparte de la tienda).
  const [cafeOpen, setCafeOpen] = useState(false);
  // Materia con demo abierta (código, p. ej. "WELL 101"): clases y circuito de repaso.
  const [demoCourse, setDemoCourse] = useState<string | null>(null);
  // Ventanas a pantalla completa (tienda o demo): pausan el campus.
  const modal = shopOpen || cafeOpen || demoCourse !== null;
  // Último emote propio (lo ven todos sobre tu personaje).
  const [myEmote, setMyEmote] = useState<{ index: number; at: number } | null>(null);
  const [toast, setToast] = useState({ message: "", visible: false });
  const [interiorId, setInteriorId] = useState<string | null>(null);
  // Creador en dos pasos: primero elegir personaje (con vista previa), luego personalizar.
  const [introStep, setIntroStep] = useState<"choose" | "edit">("choose");
  // Volvió al editor desde el campus (no repetir el saludo de bienvenida).
  const returning = useRef(false);
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
    campusRuntime.guide.zone = null;
    campusRuntime.player.x = PLAYER_START[0];
    campusRuntime.player.z = PLAYER_START[2];
    return () => {
      resetCampusInput();
      setCampusSound(false);
      window.speechSynthesis?.cancel();
      leavePresence();
      window.clearTimeout(toastTimer.current);
      portalTimers.current.forEach(clearTimeout);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast((s) => ({ ...s, visible: false })), 3200);
  }, []);

  useEffect(() => {
    campusRuntime.guide.zone = guide;
  }, [guide]);

  // Al llegar a la puerta del lugar al que guiaba Krucn, termina la guía.
  const guideRef = useRef(guide);
  useEffect(() => {
    guideRef.current = guide;
  }, [guide]);
  const arriveAt = useCallback(
    (id: string) => {
      if (id !== guideRef.current) return;
      guideRef.current = null;
      setGuide(null);
      const place = findGuidePlace(id);
      if (place) {
        playCroc();
        showToast(t.arrived(place.label[locale]));
      }
    },
    [showToast, t, locale],
  );
  const handleZoneChange = useCallback(
    (id: string | null) => {
      setActiveZoneId(id);
      if (id) arriveAt(id);
    },
    [arriveAt],
  );

  const handleEmote = useCallback((index: number) => {
    earn("emote");
    sendEmote(index);
    setMyEmote({ index, at: Date.now() });
  }, []);

  // Lo que Krucn decide hacer al final de su respuesta.
  const handleKrucnAction = useCallback(
    (action: KrucnAction) => {
      setTalking(false);
      if (action.type === "guide") {
        const zone = findGuidePlace(action.place);
        if (!zone) return;
        // Ya está en la puerta: no hace falta guiar.
        if (activeZoneId === zone.id) {
          showToast(t.arrived(zone.label[locale]));
          return;
        }
        setGuide(zone.id);
        playCroc();
        showToast(t.following);
      } else if (action.type === "catalog") {
        setCatalogView({ open: true, school: action.school, program: action.program });
      } else {
        setForm({ open: true, program: matchApiProgram(schools, action.program) });
      }
    },
    [schools, showToast, t, activeZoneId, locale],
  );

  // Un lugar cuenta como visitado cuando entras a su aula, no solo al pasar cerca.
  function markVisited(id: string) {
    if (visitedRef.current.has(id)) return;
    const next = new Set(visitedRef.current);
    next.add(id);
    visitedRef.current = next;
    setVisited(next);
    earn("visit", id);
    if (next.size === ZONES.length) {
      earn("allVisited");
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
    setGuide(null);
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
    playCroc();
    earn("krucn");
    resetCampusInput();
    setTalk((n) => n + 1);
    setTalking(true);
  }

  const closeDemo = useCallback(() => setDemoCourse(null), []);

  // En celular los botones flotantes del sitio (idioma, modelos) tapan los paneles:
  // se esconden mientras hay lobby, sala, Krucn, catálogo o formulario abiertos.
  // Dentro de una escuela no se oye la playa (ni la música ni el murmullo de la isla).
  useEffect(() => {
    setAmbience(phase !== "inside");
    // En la sala el ES/EN va junto a "Salir" (el flotante tapaba la narración).
    document.documentElement.dataset.campusRoom = phase === "inside" ? "on" : "off";
    return () => {
      delete document.documentElement.dataset.campusRoom;
    };
  }, [phase]);

  const overlayOpen = phase !== "playing" || talking || form.open || catalogView.open || modal;
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.campusOverlay = overlayOpen ? "on" : "off";
    return () => {
      delete root.dataset.campusOverlay;
    };
  }, [overlayOpen]);

  // Botón "atrás" del navegador: nunca saca del campus hacia los modelos 1–3.
  // Con la primera interacción se agrega una entrada "guardia" al historial (Chrome
  // ignora al ir atrás las entradas creadas sin un gesto del usuario, por eso se
  // crea dentro del toque/tecla). Al ir atrás se cierra lo que esté encima (sala,
  // catálogo, formulario, Krucn) o se avisa cómo salir, y se repone la guardia.
  const closeTop = useRef(() => {});
  useEffect(() => {
    closeTop.current = () => {
      if (demoCourse) setDemoCourse(null);
      else if (shopOpen) setShopOpen(false);
      else if (cafeOpen) setCafeOpen(false);
      else if (form.open) setForm((f) => ({ ...f, open: false }));
      else if (catalogView.open) setCatalogView({ open: false });
      else if (talking) setTalking(false);
      else if (phase === "inside") {
        if (portal.stage === "idle") exitZone();
      } else if (phase === "playing") showToast(t.stayHint);
    };
  });
  useEffect(() => {
    let guarded = false;
    function guard() {
      if (guarded) return;
      guarded = true;
      window.history.pushState({ kunCampus: true }, "");
    }
    function onPop() {
      // Cualquier "atrás" que siga dentro de /campus llega aquí.
      guarded = false;
      closeTop.current();
      guard();
    }
    window.addEventListener("pointerdown", guard, true);
    window.addEventListener("click", guard, true);
    window.addEventListener("keydown", guard, true);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("pointerdown", guard, true);
      window.removeEventListener("click", guard, true);
      window.removeEventListener("keydown", guard, true);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  // Teclado: E / Enter para hablar con Krucn o entrar al edificio cercano, Esc para cerrar.
  const live = useRef({ phase, activeZoneId, formOpen: form.open || catalogView.open || modal, krucnNear, talking, enter: enterZone, exit: () => exitZone(), talk: startTalk });
  useEffect(() => {
    live.current = { phase, activeZoneId, formOpen: form.open || catalogView.open || modal, krucnNear, talking, enter: enterZone, exit: () => exitZone(), talk: startTalk };
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

  const handleCoin = useCallback(() => {
    playCoin();
    earn("coin");
  }, []);

  // Ver el video de una sala (quedarse 30 s) y abrir el catálogo también dan monedas.
  useEffect(() => {
    if (phase !== "inside" || !interiorId) return;
    const id = window.setTimeout(() => earn("learn", interiorId), 30_000);
    return () => window.clearTimeout(id);
  }, [phase, interiorId]);
  useEffect(() => {
    if (catalogView.open) earn("catalog");
  }, [catalogView.open]);

  // Si cambia el personaje en la tienda, los demás lo ven con lo nuevo.
  useEffect(() => {
    if (phase === "playing" || phase === "inside") updateProfile(avatar.name.trim(), serializeAvatar(avatar));
  }, [avatar, phase]);
  const handleLoaderDone = useCallback(() => setPhase((p) => (p === "loading" ? "intro" : p)), []);

  function start() {
    const name = avatar.name.trim().slice(0, 16) || t.defaultName;
    setAvatar((a) => ({ ...a, name }));
    setLeavingIntro(true);
    setPhase("playing");
    if (!returning.current) showToast(t.hello(name));
    returning.current = false;
    earn("welcome");
    // Campus compartido: los demás te ven llegar (si la base en tiempo real está configurada).
    void joinPresence(name, serializeAvatar({ ...avatar, name }), {
      x: campusRuntime.player.x,
      z: campusRuntime.player.z,
      h: campusRuntime.player.heading,
    });
    wrapperRef.current?.focus();
  }

  function launch() {
    if (campusRuntime.launchAt) return;
    campusRuntime.launchAt = performance.now();
    playLaunch();
    showToast(t.launch);
  }

  function editAvatar() {
          // Vuelve al editor del lobby (paso "personalizar") sin perder el progreso.
          resetCampusInput();
          campusRuntime.seat = -1;
          returning.current = true;
          setLeavingIntro(false);
          setIntroStep("edit");
          setPhase("intro");
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
          myEmote={myEmote}
          onCoin={handleCoin}
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
        onAction={handleKrucnAction}
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
                ? { label: schoolHasDemo(interiorSchool.name.es) ? t.coursePlanDemo : t.coursePlan, onClick: () => setCatalogView({ open: true, school: interiorSchool.name.es }) }
                : undefined
          }
          onExit={() => exitZone()}
          schoolName={interiorSchool?.name.es}
        />
      )}
      <CampusTouchControls enabled={playing && !form.open && !talking && !catalogView.open && !modal} targetRef={wrapperRef} />
      <CampusGuidePill zoneId={playing && portal.stage === "idle" ? guide : null} onCancel={() => setGuide(null)} onArrive={arriveAt} />
      <CampusSocialPanel visible={playing && !talking && !form.open && !catalogView.open && !modal} onEmote={handleEmote} />
      <CampusCoinsHud
        visible={playing && !talking && !form.open && !catalogView.open && !modal}
        onOpen={() => setShopOpen(true)}
        name={avatar.name.trim()}
        pet={avatar.pet}
        onEditAvatar={editAvatar}
      />
      <CampusStorePrompt
        enabled={playing && portal.stage === "idle" && !talking && !form.open && !catalogView.open && !modal}
        blocked={krucnNear || !!activeZoneId}
        onOpen={() => setShopOpen(true)} />
      <CampusShop
        open={shopOpen}
        avatar={avatar}
        onEquip={(patch) => setAvatar((a) => ({ ...a, ...patch }))}
        onClose={() => setShopOpen(false)}
      />
      <CampusTips enabled={playing && portal.stage === "idle" && !talking && !form.open && !catalogView.open && !modal} />
      <CampusCafePrompt
        enabled={playing && portal.stage === "idle" && !talking && !form.open && !catalogView.open && !modal}
        blocked={krucnNear || !!activeZoneId}
        onOpen={() => setCafeOpen(true)}
      />
      <CampusShop
        open={cafeOpen}
        mode="cafe"
        avatar={avatar}
        onEquip={(patch) => setAvatar((a) => ({ ...a, ...patch }))}
        onClose={() => setCafeOpen(false)}
      />
      <CampusSeatPrompt
        enabled={playing && portal.stage === "idle" && !talking && !form.open && !catalogView.open && !modal}
        blocked={krucnNear || !!activeZoneId}
      />
      <CampusToast message={toast.message} visible={toast.visible} />
      <CampusCatalog
        key={catalogView.open ? `${catalogView.school ?? "all"}-${catalogView.program ?? ""}` : "closed"}
        open={catalogView.open}
        initialSchool={catalogView.school}
        initialProgram={catalogView.program}
        onClose={() => setCatalogView({ open: false })}
        onDemo={setDemoCourse}
        onSignup={(program) => {
          setCatalogView({ open: false });
          setForm({ open: true, program });
        }}
      />
      {demoCourse && <CampusDemoCourse code={demoCourse} stats={stats} onClose={closeDemo} />}
      <CampusFormModal
        open={form.open}
        schools={schools}
        defaultName={avatar.name}
        defaultProgram={form.program}
        onClose={() => setForm((f) => ({ ...f, open: false }))}
        onSubmitted={() => {
          setForm((f) => ({ ...f, open: false }));
          earn("signup");
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
