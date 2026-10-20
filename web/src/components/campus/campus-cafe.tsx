"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { campusRuntime } from "./campus-runtime";
import type { Locale } from "@/i18n/locale-context";
import { CampusLabel, labelFontFamily, useFontsReady } from "./campus-label";
import { CAFE, type Collider } from "./campus-zones";

// Cafetería "KUN Café": el punto de encuentro del campus. Una terraza de madera
// con un kiosko, mesas con sombrilla y luces colgantes, en los colores del logo.
// La parte de ver y saludar a otros visitantes está en campus-remote-players.

const NAVY = "#14306E";
const RED = "#C8102E";
const WOOD = "#B8743A";
const CREAM = "#FFF8F0";

/** Todo el mobiliario se dibuja a esta escala (la terraza mide CAFE.deck de radio). */
const SCALE = 1.5;

/** La terraza mira hacia el centro de la plaza. */
const ROT = Math.atan2(-CAFE.x, -CAFE.z);

/** Coordenadas locales de la terraza (antes de escalar) → mundo. */
function toWorld(lx: number, lz: number) {
  const c = Math.cos(ROT);
  const s = Math.sin(ROT);
  const x = lx * SCALE;
  const z = lz * SCALE;
  return { x: CAFE.x + x * c + z * s, z: CAFE.z - x * s + z * c };
}

const KIOSK: [number, number] = [0, -3.2];
const TABLES: Array<[number, number]> = [
  [-5.4, -1.4],
  [-3.6, 1.6],
  [0, 3.2],
  [3.6, 1.6],
  [5.4, -1.4],
];

export const CAFE_COLLIDERS: Collider[] = [
  { ...toWorld(...KIOSK), r: 2.9 * SCALE },
  // Las mesas se pueden saltar: por encima de 1.4 ya no bloquean (para subir a las sombrillas).
  ...TABLES.map(([x, z]) => ({ ...toWorld(x, z), r: 1.05 * SCALE, h: 1.4 })),
];

/** Zona libre de palmeras y arbustos. */
export const CAFE_SPOTS = [{ x: CAFE.x, z: CAFE.z, r: CAFE.deck + 1 }];

/** Ángulos de los taburetes alrededor de cada mesa (local, sin escalar). */
const STOOL_ANGLES = [0, 2.1, 4.2];
const STOOL_RING = 1.25;
/** Base del grupo de la cafetería sobre el suelo. */
const BASE_Y = 0.2;

export type CafeSeat = {
  x: number;
  z: number;
  /** Altura del asiento (mundo). */
  y: number;
  /** Rumbo al sentarse: mirando hacia la mesa. */
  face: number;
  /** Dónde queda el personaje al levantarse (fuera de la mesa). */
  standX: number;
  standZ: number;
};

/** Los taburetes donde se puede sentar el personaje. */
export const CAFE_SEATS: CafeSeat[] = TABLES.flatMap(([tx, tz]) => {
  const table = toWorld(tx, tz);
  return STOOL_ANGLES.map((a) => {
    const seat = toWorld(tx + Math.cos(a) * STOOL_RING, tz + Math.sin(a) * STOOL_RING);
    const dx = seat.x - table.x;
    const dz = seat.z - table.z;
    const d = Math.hypot(dx, dz) || 1;
    return {
      ...seat,
      y: BASE_Y + 0.75 * SCALE,
      face: Math.atan2(table.x - seat.x, table.z - seat.z),
      standX: seat.x + (dx / d) * 1.1,
      standZ: seat.z + (dz / d) * 1.1,
    };
  });
});

/** Medidas de la sombrilla (locales, sin escalar): aro y punta del cono. */
const UMBRELLA_R = 1.55;
const UMBRELLA_RIM = 2.65;
const UMBRELLA_TIP = 3.35;

export type Trampoline = { x: number; z: number; r: number; top: (d: number) => number };

/**
 * Las sombrillas funcionan como trampolines: `top(d)` es la altura de la lona
 * sobre el suelo a distancia d del centro (más alta en la punta).
 */
export const CAFE_TRAMPOLINES: Trampoline[] = TABLES.map(([tx, tz]) => ({
  ...toWorld(tx, tz),
  r: UMBRELLA_R * SCALE,
  top: (d: number) => SCALE * (UMBRELLA_RIM + (UMBRELLA_TIP - UMBRELLA_RIM) * Math.max(0, 1 - d / (UMBRELLA_R * SCALE))),
}));

function texture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  draw(ctx);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function useCafeTextures() {
  const fontsReady = useFontsReady();
  const textures = useMemo(() => {
    if (typeof document === "undefined") return { awning: null, sign: null };
    const awning = texture(256, 64, (ctx) => {
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? CREAM : NAVY;
        ctx.fillRect(i * 32, 0, 32, 64);
      }
    });
    const sign = texture(512, 128, (ctx) => {
      ctx.fillStyle = NAVY;
      ctx.fillRect(0, 0, 512, 128);
      ctx.fillStyle = RED;
      ctx.fillRect(0, 112, 512, 16);
      ctx.fillStyle = CREAM;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `900 70px ${labelFontFamily()}`;
      ctx.fillText("KUN Café ☕", 256, 58);
    });
    return { awning, sign };
    // fontsReady fuerza a redibujar con la tipografía definitiva.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsReady]);
  useEffect(
    () => () => {
      textures.awning?.dispose();
      textures.sign?.dispose();
    },
    [textures],
  );
  return textures;
}

function Std({ color, rough = 0.6, metal = 0 }: { color: string; rough?: number; metal?: number }) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={metal} />;
}

function Table({ x, z, umbrella, canopyRef }: { x: number; z: number; umbrella: string; canopyRef: (m: THREE.MeshStandardMaterial | null) => void }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.08, 20]} />
        <Std color={CREAM} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.07, 0.12, 0.9, 8]} />
        <Std color="#5A4E40" metal={0.4} />
      </mesh>
      {/* Sombrilla */}
      <mesh position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.1, 6]} />
        <Std color="#E9E6EF" metal={0.5} />
      </mesh>
      <mesh position={[0, 3.0, 0]} castShadow>
        <coneGeometry args={[1.55, 0.7, 10]} />
        <meshStandardMaterial ref={canopyRef} color={umbrella} roughness={0.7} flatShading transparent />
      </mesh>
      {/* Taburetes */}
      {STOOL_ANGLES.map((a) => (
        <mesh key={a} position={[Math.cos(a) * STOOL_RING, 0.5, Math.sin(a) * STOOL_RING]} castShadow>
          <cylinderGeometry args={[0.32, 0.28, 0.5, 12]} />
          <Std color={WOOD} rough={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** Guirnalda de bombillos entre dos puntos, con la caída de un cable. */
function StringLights({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const bulbs = useMemo(() => {
    const n = 11;
    return Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      const sag = Math.sin(t * Math.PI) * 0.6;
      return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t - sag, from[2] + (to[2] - from[2]) * t] as [number, number, number];
    });
  }, [from, to]);
  return (
    <>
      {bulbs.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshStandardMaterial color="#FFE3A3" emissive="#FFC85C" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

export function KunCafe({ locale }: { locale: Locale }) {
  const { awning, sign } = useCafeTextures();
  // Si el personaje queda debajo o detrás de una sombrilla, esta se vuelve
  // transparente para que no lo tape (la cámara mira desde el sur).
  const canopies = useRef<Array<THREE.MeshStandardMaterial | null>>([]);
  useFrame((_, delta) => {
    const p = campusRuntime.player;
    CAFE_TRAMPOLINES.forEach((u, i) => {
      const m = canopies.current[i];
      if (!m) return;
      const dx = p.x - u.x;
      const dz = p.z - u.z;
      // Debajo, o un poco al norte (la sombrilla queda entre la cámara y el personaje).
      const hidden = p.y < u.top(0) - 0.4 && Math.hypot(dx, dz + 1.2) < u.r + 1.4;
      const target = hidden ? 0.22 : 1;
      m.opacity += (target - m.opacity) * Math.min(1, delta * 8);
      m.depthWrite = m.opacity > 0.95;
    });
  });
  const [kx, kz] = KIOSK;
  return (
    <group position={[CAFE.x, 0.2, CAFE.z]} rotation={[0, ROT, 0]}>
      <group scale={SCALE}>
        {/* Terraza de madera */}
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <cylinderGeometry args={[CAFE.deck / SCALE, CAFE.deck / SCALE, 0.08, 48]} />
          <Std color="#D9B48A" rough={0.85} />
        </mesh>

        {/* Kiosko */}
        <group position={[kx, 0, kz]}>
          <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.2, 2.8, 2.6]} />
            <Std color={CREAM} />
          </mesh>
          <mesh position={[0, 1.95, 1.31]}>
            <boxGeometry args={[4.2, 1.1, 0.04]} />
            <Std color="#2A1A10" />
          </mesh>
          {/* Mostrador */}
          <mesh position={[0, 0.72, 1.55]} castShadow>
            <boxGeometry args={[5.4, 1.1, 0.6]} />
            <Std color={NAVY} />
          </mesh>
          <mesh position={[0, 1.33, 1.6]}>
            <boxGeometry args={[5.6, 0.12, 0.85]} />
            <Std color={WOOD} rough={0.7} />
          </mesh>
          {/* Toldo a rayas */}
          <mesh position={[0, 3.05, 1.85]} rotation={[0.38, 0, 0]} castShadow>
            <boxGeometry args={[5.8, 0.08, 1.7]} />
            <meshStandardMaterial map={awning} roughness={0.8} />
          </mesh>
          {/* Techo y letrero */}
          <mesh position={[0, 3.1, 0]} castShadow>
            <boxGeometry args={[5.6, 0.3, 3.0]} />
            <Std color={RED} />
          </mesh>
          <mesh position={[0, 3.85, 0.9]}>
            <boxGeometry args={[4.4, 1.1, 0.12]} />
            <meshStandardMaterial map={sign} roughness={0.5} />
          </mesh>
          {/* Taza gigante */}
          <group position={[-1.9, 3.25, -0.4]}>
            <mesh position={[0, 0.6, 0]} castShadow>
              <cylinderGeometry args={[0.75, 0.58, 1.2, 20]} />
              <Std color={CREAM} rough={0.35} />
            </mesh>
            <mesh position={[0, 1.18, 0]}>
              <cylinderGeometry args={[0.68, 0.68, 0.04, 20]} />
              <Std color="#5B3A1E" rough={0.3} />
            </mesh>
            <mesh position={[0.8, 0.65, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.28, 0.08, 8, 16]} />
              <Std color={CREAM} rough={0.35} />
            </mesh>
          </group>
        </group>

        {TABLES.map(([x, z], i) => (
          <Table
            key={i}
            x={x}
            z={z}
            umbrella={i % 2 ? NAVY : RED}
            canopyRef={(m) => {
              canopies.current[i] = m;
            }}
          />
        ))}

        {/* Postes y guirnaldas de luces */}
        {[-5.6, 5.6].map((x) => (
          <mesh key={x} position={[x, 1.6, 4.6]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 3.2, 8]} />
            <Std color="#5A4E40" metal={0.3} />
          </mesh>
        ))}
        <StringLights from={[-5.6, 3.15, 4.6]} to={[-2.8, 3.35, -1.1]} />
        <StringLights from={[5.6, 3.15, 4.6]} to={[2.8, 3.35, -1.1]} />
        <StringLights from={[-5.6, 3.15, 4.6]} to={[5.6, 3.15, 4.6]} />
      </group>

      <CampusLabel text={`☕ ${CAFE.label[locale]}`} color={CAFE.color} position={[0, 9.5, -1.5]} width={6.5} />
    </group>
  );
}
