"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { CampusAnimals } from "./campus-animals";
import type { Gender } from "./campus-avatar";
import { CampusLineup } from "./campus-lineup";
import { Krucn } from "./campus-krucn";
import { FLORIDA_COLLIDERS } from "./campus-florida";
import { CampusInterior, INTERIOR_ORIGIN } from "./campus-interior";
import { CampusPlayer } from "./campus-player";
import { BeachBalls, KunLetters, LETTER_COLLIDERS } from "./campus-props";
import { campusRuntime } from "./campus-runtime";
import type { SkyPreset } from "./campus-sky";
import { CampusWorld, palmColliders, useVegetation } from "./campus-world";
import { ZONE_ENTRY_MARGIN, ZONES, type Avatar, type Collider, type ZoneDef } from "./campus-zones";
import type { Locale } from "@/i18n/locale-context";

export type CampusPhase = "loading" | "intro" | "playing" | "inside";

const UP = new THREE.Vector3(0, 1, 0);

// Cámara en cuatro actos, como un sitio de Active Theory:
// 1) plano general orbitando la isla mientras carga,
// 2) acercamiento al personaje en la pantalla de creación,
// 3) vuelo hasta la vista de seguimiento cuando empieza el recorrido,
// 4) travelling lento dentro del aula de cada edificio.
function CameraRig({
  phase,
  lineup,
  playerRef,
  reduceMotion,
}: {
  phase: CampusPhase;
  lineup: boolean;
  playerRef: React.RefObject<THREE.Group | null>;
  reduceMotion: boolean;
}) {
  const pos = useRef(new THREE.Vector3(60, 34, 40));
  const look = useRef(new THREE.Vector3(0, 4, 0));
  const scratch = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3(), right: new THREE.Vector3() });
  const phaseStart = useRef({ phase, t: 0 });

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const prevPhase = phaseStart.current.phase;
    if (prevPhase !== phase) phaseStart.current = { phase, t };
    // Entrar o salir del aula ocurre detrás del telón: la cámara salta de una
    // vez en lugar de cruzar volando entre la isla y el aula.
    const teleport = prevPhase !== phase && (phase === "inside" || prevPhase === "inside");
    const sincePhase = t - phaseStart.current.t;
    const player = playerRef.current;
    const narrow = state.size.width < 700;
    const motion = reduceMotion ? 0 : 1;
    const { pos: desiredPos, look: desiredLook, right } = scratch.current;
    let k: number;

    if (phase === "loading" || !player) {
      const a = t * 0.08 * motion + 0.9;
      desiredPos.set(Math.cos(a) * 62, 34, Math.sin(a) * 62);
      desiredLook.set(0, 4, 0);
      k = 1;
    } else if (phase === "intro") {
      // Plano cercano que gira despacio frente al personaje y lo deja a la
      // derecha del encuadre (en móvil, arriba) para no tapar la tarjeta.
      const a = Math.sin(t * 0.12) * 0.3 * motion;
      const radius = narrow ? 14 : 9.5;
      const height = narrow ? 5.5 : 3.4;
      const px = player.position.x;
      const pz = player.position.z;
      desiredPos.set(px + Math.sin(a) * radius, height, pz + Math.cos(a) * radius);
      // Paralaje sutil con el mouse.
      desiredPos.x += state.pointer.x * 1.2 * motion;
      desiredPos.y += state.pointer.y * 0.6 * motion;
      right.set(Math.cos(a), 0, -Math.sin(a));
      desiredLook.set(px, narrow ? -4.6 : 2.3, pz).addScaledVector(right, narrow ? 0 : -2.6);
      if (lineup) {
        // Selección de personaje: los tres centrados, la cámara un poco más atrás.
        desiredPos.set(px + Math.sin(a) * 4, narrow ? 6 : 4.4, pz + (narrow ? 17 : 13.5));
        desiredLook.set(px, narrow ? 0.4 : 2.1, pz);
      }
      k = 1 - Math.exp(-delta * Math.min(2.2, 0.4 + sincePhase * 0.9));
    } else if (phase === "inside") {
      const [ox, oy, oz] = INTERIOR_ORIGIN;
      const drift = Math.sin(t * 0.15) * 1.2 * motion;
      // El tablero ocupa la derecha (en móvil, la mitad de abajo): el holograma
      // queda a la izquierda / arriba del encuadre.
      desiredPos.set(ox + (narrow ? 0 : -3) + drift, oy + (narrow ? 7 : 5.5), oz + (narrow ? 21 : 17));
      desiredPos.x += state.pointer.x * 1.4 * motion;
      desiredPos.y += state.pointer.y * 0.7 * motion;
      desiredLook.set(ox + (narrow ? 0 : 6.5), oy + (narrow ? 1.5 : 4.2), oz);
      k = 1 - Math.exp(-delta * 1.4);
      if (teleport) {
        // Arranca más atrás para que, al abrirse el telón, la cámara entre al aula.
        pos.current.set(desiredPos.x, desiredPos.y + 2, desiredPos.z + 9);
        look.current.copy(desiredLook);
      }
    } else {
      const zoom = campusRuntime.zoom;
      desiredPos.set(
        player.position.x,
        player.position.y + (narrow ? 16 : 12) * zoom,
        player.position.z + (narrow ? 19 : 16) * zoom,
      );
      desiredLook.set(player.position.x, player.position.y + 1.5, player.position.z);
      // Vuelo de entrada más lento, luego seguimiento firme.
      k = 1 - Math.exp(-delta * Math.min(4.5, 0.8 + sincePhase * 2.2));
      if (teleport) {
        pos.current.copy(desiredPos);
        look.current.copy(desiredLook);
      }
    }

    // En pantallas angostas se abre el lente para que entre más campus.
    const cam = state.camera as THREE.PerspectiveCamera;
    const fov = narrow ? 62 : 50;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }

    pos.current.lerp(desiredPos, k);
    look.current.lerp(desiredLook, Math.min(1, k * 1.4));
    state.camera.position.copy(pos.current);
    state.camera.up.copy(UP);
    state.camera.lookAt(look.current);
  });

  return null;
}


function ZoneWatcher({
  enabled,
  playerRef,
  onZoneChange,
}: {
  enabled: boolean;
  playerRef: React.RefObject<THREE.Group | null>;
  onZoneChange: (id: string | null) => void;
}) {
  const current = useRef<string | null>(null);
  useFrame(() => {
    const player = playerRef.current;
    let next: string | null = null;
    if (enabled && player) {
      let best = Infinity;
      for (const zn of ZONES) {
        const d = Math.hypot(player.position.x - zn.x, player.position.z - zn.z);
        if (d < zn.r + ZONE_ENTRY_MARGIN && d < best) {
          best = d;
          next = zn.id;
        }
      }
    }
    if (next !== current.current) {
      current.current = next;
      onZoneChange(next);
    }
  });
  return null;
}

// Avisa una sola vez cuando la escena ya pintó sus primeros frames, para que
// el loader no se retire antes de que haya algo bonito detrás.
function FirstFrames({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) onReady();
  });
  return null;
}

export function CampusScene({
  phase,
  avatar,
  locale,
  activeZoneId,
  interiorZone,
  eventSource,
  sky,
  lineupGender,
  krucnTalking,
  onKrucnNear,
  reduceMotion,
  playerRef,
  onZoneChange,
  onReady,
  onBump,
}: {
  phase: CampusPhase;
  avatar: Avatar;
  locale: Locale;
  activeZoneId: string | null;
  interiorZone: ZoneDef | null;
  eventSource: React.RefObject<HTMLElement | null>;
  sky: SkyPreset;
  /** Si no es null, se muestra la fila de personajes para elegir (primer paso del creador). */
  lineupGender: Gender | null;
  /** Krucn, la mascota, está conversando con el jugador. */
  krucnTalking: boolean;
  onKrucnNear: (near: boolean) => void;
  reduceMotion: boolean;
  playerRef: React.RefObject<THREE.Group | null>;
  onZoneChange: (id: string | null) => void;
  onReady: () => void;
  onBump: (strength: number) => void;
}) {
  const vegetation = useVegetation();
  const colliders: Collider[] = useMemo(
    () => [...ZONES.map((z) => ({ x: z.x, z: z.z, r: z.r })), ...palmColliders(vegetation.palms), ...LETTER_COLLIDERS, ...FLORIDA_COLLIDERS],
    [vegetation],
  );
  const narrow = typeof window !== "undefined" && window.innerWidth < 700;
  // La luz principal sale del sol o de la luna, nunca por debajo del horizonte.
  const lightPosition = useMemo<[number, number, number]>(() => {
    const v = sky.body.clone().normalize().multiplyScalar(70);
    return [v.x, Math.max(25, v.y), v.z];
  }, [sky]);

  return (
    <Canvas
      shadows="percentage"
      dpr={narrow ? [1, 1.5] : [1, 2]}
      camera={{ position: [60, 34, 40], fov: 50, near: 0.1, far: 600 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      aria-label="Campus 3D de KUN University AI"
      // El paralaje sigue al mouse aunque esté encima del tablero o de la interfaz.
      eventSource={eventSource as React.RefObject<HTMLElement>}
      eventPrefix="client"
    >
      <fog attach="fog" args={[sky.fog.getHex(), 70, 190]} />
      <hemisphereLight color={sky.hemiSky} groundColor={sky.hemiGround} intensity={sky.hemiIntensity} />
      <directionalLight
        position={lightPosition}
        intensity={sky.lightIntensity}
        color={sky.lightColor}
        castShadow
        shadow-mapSize={narrow ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0004}
      />

      <group visible={phase !== "inside"}>
      <CampusWorld
        locale={locale}
        activeZoneId={activeZoneId}
        reduceMotion={reduceMotion}
        vegetation={vegetation}
        showLabels={phase === "playing"}
        sky={sky}
      />
      <KunLetters onBump={onBump} />
      <BeachBalls colliders={colliders} onBump={onBump} />
      <CampusPlayer
        groupRef={playerRef}
        avatar={avatar}
        playing={phase === "playing"}
        frozen={krucnTalking}
        visible={lineupGender === null}
        colliders={colliders}
        onLand={onBump}
      />
      {lineupGender !== null && <CampusLineup selected={lineupGender} />}
      <CampusAnimals playing={phase === "playing"} pet={lineupGender !== null ? "dog" : avatar.pet} />
      <Krucn talking={krucnTalking} onNearChange={onKrucnNear} />
      </group>
      {interiorZone && <CampusInterior zone={interiorZone} sky={sky} />}

      <CameraRig phase={phase} lineup={lineupGender !== null} playerRef={playerRef} reduceMotion={reduceMotion} />
      <ZoneWatcher enabled={phase === "playing"} playerRef={playerRef} onZoneChange={onZoneChange} />
      <Suspense fallback={null}>
        <FirstFrames onReady={onReady} />
      </Suspense>

      <EffectComposer multisampling={narrow ? 0 : 4}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={1} luminanceSmoothing={0.25} radius={0.7} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        <Vignette offset={0.28} darkness={0.62} />
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={narrow ? 0 : 0.35} />
      </EffectComposer>
    </Canvas>
  );
}
