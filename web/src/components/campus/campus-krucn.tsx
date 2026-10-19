"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CampusLabel, labelFontFamily, useFontsReady } from "./campus-label";
import { campusRuntime } from "./campus-runtime";
import { findGuidePlace, ZONES, zoneDoor } from "./campus-zones";

// Krucn, la mascota del campus: un cocodrilo de botarga con la camiseta de KUN
// y birrete de graduación. Pasea por la plaza siguiendo una ruta y, cuando te
// acercas, se detiene, te mira y espera a que le hables.

/** Ruta alrededor de la plaza que no entra a los edificios ni a sus zonas. */
const ROUTE: Array<[number, number]> = [
  [13, -10.9],
  [16, 5.8],
  [0, 15],
  [-16, 5.8],
  [-13, -10.9],
  [-5.8, -16],
  [5.8, -16],
];

export const KRUCN_TALK_DISTANCE = 6;
const WALK_SPEED = 2.4;
/** Al guiar va más rápido, pero espera si el jugador se aleja más que esto. */
const GUIDE_SPEED = 4.2;
const GUIDE_WAIT_DISTANCE = 9;
const GUIDE_STEP_ASIDE_SECONDS = 8;

const GREEN = "#3FA34D";
const GREEN_DARK = "#2C7A38";
const BELLY = "#E3E39A";
const JERSEY = "#7A4FD0";

function Std({ color, rough = 0.7 }: { color: string; rough?: number }) {
  return <meshStandardMaterial color={color} roughness={rough} />;
}

function useJerseyTexture() {
  const fontsReady = useFontsReady();
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#FFF8F0";
    ctx.font = `900 92px ${labelFontFamily()}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("KUN", 128, 70);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
    // fontsReady fuerza a redibujar con la tipografía definitiva.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsReady]);
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

export function Krucn({
  talking,
  onNearChange,
}: {
  talking: boolean;
  onNearChange: (near: boolean) => void;
}) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const jaw = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const alert = useRef<THREE.Group>(null);
  const jersey = useJerseyTexture();
  const sim = useRef({ x: ROUTE[0][0], z: ROUTE[0][1], heading: 0, target: 1, pause: 2, walk: 0, near: false, wasGuiding: false, quietUntil: 0 });

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const g = root.current;
    if (!g) return;
    const s = sim.current;
    const t = state.clock.elapsedTime;
    const p = campusRuntime.player;
    const toPlayer = Math.hypot(p.x - s.x, p.z - s.z);
    const guideZone = findGuidePlace(campusRuntime.guide.zone);
    const guiding = !!guideZone && !talking;
    // Al terminar de guiar se aparta unos segundos para dejar ver el botón de entrar.
    if (s.wasGuiding && !guiding) s.quietUntil = t + GUIDE_STEP_ASIDE_SECONDS;
    s.wasGuiding = guiding;
    // Mientras guía (o se aparta) no ofrece conversación, para no tapar la puerta.
    const near = !guiding && t > s.quietUntil && toPlayer < KRUCN_TALK_DISTANCE;
    if (near !== s.near) {
      s.near = near;
      onNearChange(near);
    }

    let moving = false;
    let face = s.heading;
    if (guiding && guideZone) {
      // Camina hacia la puerta, un poco por delante; si el jugador se queda atrás, lo espera.
      const door = zoneDoor(guideZone);
      let dx = door.x - s.x;
      let dz = door.z - s.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.6 || toPlayer > GUIDE_WAIT_DISTANCE) {
        face = Math.atan2(p.x - s.x, p.z - s.z);
      } else {
        dx /= d;
        dz /= d;
        // Rodea los demás edificios en vez de atravesarlos.
        for (const zn of ZONES) {
          if (zn === guideZone) continue;
          const ox = s.x - zn.x;
          const oz = s.z - zn.z;
          const od = Math.hypot(ox, oz);
          const clear = zn.r + 2.5;
          if (od < clear + 2 && od > 0.01) {
            const push = (clear + 2 - od) / 2;
            dx += (ox / od) * push;
            dz += (oz / od) * push;
          }
        }
        const l = Math.hypot(dx, dz) || 1;
        const speed = toPlayer > GUIDE_WAIT_DISTANCE * 0.6 ? WALK_SPEED : GUIDE_SPEED;
        s.x += (dx / l) * speed * delta;
        s.z += (dz / l) * speed * delta;
        face = Math.atan2(dx, dz);
        moving = true;
        s.walk += delta * speed * 2.4;
      }
      // Al terminar, retoma su ruta sin quedarse plantado en la puerta.
      s.pause = 0;
    } else if (talking || (near && t > s.quietUntil)) {
      // Se detiene y te mira.
      face = Math.atan2(p.x - s.x, p.z - s.z);
      s.pause = Math.max(s.pause, 2.5);
    } else if (s.pause > 0) {
      s.pause -= delta;
    } else {
      const [tx, tz] = ROUTE[s.target];
      const dx = tx - s.x;
      const dz = tz - s.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.3) {
        s.target = (s.target + 1) % ROUTE.length;
        s.pause = 2.5 + (s.target % 3);
      } else {
        s.x += (dx / d) * WALK_SPEED * delta;
        s.z += (dz / d) * WALK_SPEED * delta;
        face = Math.atan2(dx, dz);
        moving = true;
        s.walk += delta * WALK_SPEED * 2.4;
      }
    }
    let diff = face - s.heading;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    s.heading += diff * Math.min(1, delta * 5);
    campusRuntime.krucn.x = s.x;
    campusRuntime.krucn.z = s.z;

    g.position.set(s.x, 0.2, s.z);
    g.rotation.y = s.heading;
    const swing = moving ? Math.sin(s.walk) * 0.45 : 0;
    if (body.current) {
      // Bamboleo de botarga al caminar; respiración cuando está quieto.
      body.current.position.y = moving ? Math.abs(Math.sin(s.walk)) * 0.12 : Math.sin(t * 2) * 0.04;
      body.current.rotation.z = moving ? Math.sin(s.walk) * 0.06 : 0;
    }
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.8;
    if (armR.current) {
      // Saluda en las pausas y cuando te ve llegar.
      const waving = !moving && !talking && (near || Math.sin(t * 0.7) > 0.6);
      armR.current.rotation.x = waving ? 0 : swing * 0.8;
      armR.current.rotation.z = waving ? 2.4 + Math.sin(t * 7) * 0.35 : 0.15;
    }
    if (jaw.current) jaw.current.rotation.x = talking ? Math.max(0, Math.sin(t * 11)) * 0.38 : 0.04;
    if (head.current) head.current.rotation.x = talking ? Math.sin(t * 3) * 0.06 : 0;
    if (tail.current) tail.current.rotation.y = Math.sin(t * (moving ? 5 : 2)) * 0.35;
    if (alert.current) {
      alert.current.visible = near && !talking;
      alert.current.position.y = 5.5 + Math.sin(t * 4) * 0.12;
    }
  });

  return (
    <group ref={root}>
      <group ref={body}>
        {/* Patas con garras */}
        {[
          [-1, legL],
          [1, legR],
        ].map(([sx, ref]) => (
          <group key={String(sx)} ref={ref as React.RefObject<THREE.Group>} position={[(sx as number) * 0.42, 0.95, 0]}>
            <mesh position={[0, -0.42, 0]} castShadow>
              <capsuleGeometry args={[0.24, 0.4, 6, 12]} />
              <Std color={GREEN} />
            </mesh>
            <mesh position={[0, -0.82, 0.18]} scale={[1, 0.5, 1.5]} castShadow>
              <sphereGeometry args={[0.32, 16, 10]} />
              <Std color={GREEN_DARK} />
            </mesh>
            {[-0.14, 0, 0.14].map((cx) => (
              <mesh key={cx} position={[cx, -0.84, 0.66]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.05, 0.14, 6]} />
                <Std color="#F7F3EE" />
              </mesh>
            ))}
          </group>
        ))}

        {/* Torso con la camiseta de KUN */}
        <mesh position={[0, 1.75, 0]} scale={[1, 1.12, 0.88]} castShadow>
          <sphereGeometry args={[0.92, 24, 16]} />
          <Std color={GREEN} />
        </mesh>
        <mesh position={[0, 1.92, 0]} scale={[1, 0.92, 0.9]} castShadow>
          <cylinderGeometry args={[0.86, 0.95, 1.05, 24]} />
          <Std color={JERSEY} />
        </mesh>
        <mesh position={[0, 1.42, 0]} scale={[1, 1, 0.9]}>
          <cylinderGeometry args={[0.955, 0.955, 0.12, 24]} />
          <Std color="#E8735A" />
        </mesh>
        {jersey && (
          <mesh position={[0, 2.02, 0.8]} rotation={[-0.08, 0, 0]}>
            <planeGeometry args={[0.95, 0.48]} />
            <meshStandardMaterial map={jersey} transparent roughness={0.7} />
          </mesh>
        )}
        {/* Barriga clara */}
        <mesh position={[0, 1.2, 0.5]} scale={[0.75, 0.55, 0.5]}>
          <sphereGeometry args={[0.8, 16, 12]} />
          <Std color={BELLY} />
        </mesh>

        {/* Brazos */}
        {[
          [-1, armL],
          [1, armR],
        ].map(([sx, ref]) => (
          <group key={String(sx)} ref={ref as React.RefObject<THREE.Group>} position={[(sx as number) * 0.95, 2.3, 0]}>
            <mesh position={[0, -0.42, 0]} castShadow>
              <capsuleGeometry args={[0.17, 0.55, 6, 10]} />
              <Std color={JERSEY} />
            </mesh>
            <mesh position={[0, -0.85, 0]} castShadow>
              <sphereGeometry args={[0.2, 14, 10]} />
              <Std color={GREEN} />
            </mesh>
            {[-0.09, 0, 0.09].map((fx) => (
              <mesh key={fx} position={[fx, -1.02, 0.05]}>
                <sphereGeometry args={[0.07, 8, 6]} />
                <Std color={GREEN_DARK} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Cabeza de botarga: cráneo, hocico y mandíbula que se mueve al hablar */}
        <group ref={head} position={[0, 3.15, 0.05]}>
          <mesh scale={[1, 0.85, 1]} castShadow>
            <sphereGeometry args={[0.78, 24, 18]} />
            <Std color={GREEN} />
          </mesh>
          {/* Hocico superior */}
          <mesh position={[0, -0.02, 0.85]} scale={[0.62, 0.32, 1]} castShadow>
            <sphereGeometry args={[0.72, 20, 14]} />
            <Std color={GREEN} />
          </mesh>
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 0.16, 0.16, 1.48]}>
              <sphereGeometry args={[0.06, 8, 6]} />
              <Std color="#1E2A1E" />
            </mesh>
          ))}
          {/* Dientes superiores */}
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 6 - 0.5) * 2.1;
            return (
              <mesh key={i} position={[Math.sin(a) * 0.42, -0.2, 0.85 + Math.cos(a) * 0.62]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.05, 0.13, 6]} />
                <Std color="#FFFFFF" rough={0.4} />
              </mesh>
            );
          })}
          {/* Mandíbula */}
          <group ref={jaw} position={[0, -0.2, 0.35]}>
            <mesh position={[0, -0.08, 0.5]} scale={[0.58, 0.22, 0.95]} castShadow>
              <sphereGeometry args={[0.72, 20, 12]} />
              <Std color={BELLY} />
            </mesh>
            <mesh position={[0, -0.02, 0.48]} scale={[0.46, 0.08, 0.8]}>
              <sphereGeometry args={[0.72, 16, 8]} />
              <Std color="#C0444B" />
            </mesh>
          </group>
          {/* Ojos saltones arriba de la cabeza */}
          {[-1, 1].map((sx) => (
            <group key={sx} position={[sx * 0.32, 0.62, 0.3]}>
              <mesh>
                <sphereGeometry args={[0.27, 16, 12]} />
                <Std color="#FFFFFF" rough={0.3} />
              </mesh>
              <mesh position={[0, 0.02, 0.2]}>
                <sphereGeometry args={[0.13, 12, 10]} />
                <Std color="#1A1A1A" rough={0.2} />
              </mesh>
              <mesh position={[0.04, 0.07, 0.31]}>
                <sphereGeometry args={[0.04, 8, 6]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              {/* Párpado */}
              <mesh position={[0, 0.06, 0]} rotation={[-0.5, 0, 0]}>
                <sphereGeometry args={[0.29, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
                <Std color={GREEN_DARK} />
              </mesh>
            </group>
          ))}
          {/* Escamas en la nuca */}
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.45 - i * 0.28, -0.7 - i * 0.05]} rotation={[-0.6, 0, 0]}>
              <coneGeometry args={[0.1, 0.24, 4]} />
              <Std color={GREEN_DARK} />
            </mesh>
          ))}
          {/* Birrete de graduación */}
          <group position={[0, 0.78, -0.15]} rotation={[-0.15, 0.2, 0]}>
            <mesh>
              <cylinderGeometry args={[0.36, 0.4, 0.22, 16]} />
              <Std color="#24123F" />
            </mesh>
            <mesh position={[0, 0.13, 0]} rotation={[0, Math.PI / 4, 0]}>
              <boxGeometry args={[1.0, 0.05, 1.0]} />
              <Std color="#24123F" />
            </mesh>
            <mesh position={[0.45, -0.05, 0.05]}>
              <cylinderGeometry args={[0.02, 0.02, 0.35, 5]} />
              <Std color="#FFC85C" />
            </mesh>
            <mesh position={[0.45, -0.25, 0.05]}>
              <sphereGeometry args={[0.06, 8, 6]} />
              <Std color="#FFC85C" />
            </mesh>
          </group>
        </group>

        {/* Cola */}
        <group ref={tail} position={[0, 1.15, -0.75]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, -0.18 * i, -0.38 * i - 0.2]} scale={1 - i * 0.2} castShadow>
              <sphereGeometry args={[0.36, 12, 10]} />
              <Std color={i % 2 ? GREEN_DARK : GREEN} />
            </mesh>
          ))}
        </group>
      </group>

      <CampusLabel text="Krucn" color="#2C7A38" position={[0, 4.7, 0]} width={3.4} />
      {/* "!" cuando estás cerca y todavía no le hablas */}
      <group ref={alert} position={[0, 5.5, 0]}>
        <CampusLabel text="!" color="#E8735A" position={[0, 0, 0]} width={2.4} />
      </group>
    </group>
  );
}

/**
 * Faro de luz sobre el lugar al que guía Krucn, más un anillo frente a la puerta.
 * Lee el destino de campusRuntime en cada frame, así que no provoca renders.
 */
export function GuideBeacon() {
  const root = useRef<THREE.Group>(null);
  const beam = useRef<THREE.MeshBasicMaterial>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const shown = useRef<string | null>(null);

  useFrame((state) => {
    const g = root.current;
    if (!g) return;
    const id = campusRuntime.guide.zone;
    const zone = findGuidePlace(id);
    g.visible = !!zone;
    if (!zone) {
      shown.current = null;
      return;
    }
    if (shown.current !== zone.id) {
      shown.current = zone.id;
      g.position.set(zone.x, 0, zone.z);
      beam.current?.color.set(zone.color);
      ringMat.current?.color.set(zone.color);
      const door = zoneDoor(zone);
      ring.current?.position.set(door.x - zone.x, 0.25, door.z - zone.z);
    }
    const t = state.clock.elapsedTime;
    if (beam.current) beam.current.opacity = 0.5 + Math.sin(t * 3) * 0.12;
    if (ring.current) ring.current.scale.setScalar(1 + ((t * 0.8) % 1) * 0.6);
    if (ringMat.current) ringMat.current.opacity = 0.9 * (1 - ((t * 0.8) % 1));
  });

  return (
    <group ref={root} visible={false}>
      <mesh position={[0, 20, 0]}>
        <cylinderGeometry args={[1.6, 2.6, 40, 24, 1, true]} />
        <meshBasicMaterial ref={beam} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* Núcleo blanco: se ve también de día, contra el cielo claro. */}
      <mesh position={[0, 20, 0]}>
        <cylinderGeometry args={[0.35, 0.6, 40, 12, 1, true]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.55} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.5, 40]} />
        <meshBasicMaterial ref={ringMat} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
