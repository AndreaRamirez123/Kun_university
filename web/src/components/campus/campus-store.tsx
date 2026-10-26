"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Locale } from "@/i18n/locale-context";
import { CampusLabel, labelFontFamily, useFontsReady } from "./campus-label";
import { seeded } from "./campus-random";
import { campusRuntime } from "./campus-runtime";
import { CAFE, STORE, ZONES, type Collider } from "./campus-zones";

// KUN Store (la tienda de recompensas) y las monedas que flotan por la isla.

const NAVY = "#14306E";
const RED = "#C8102E";
const GOLD = "#F2C14E";
const CREAM = "#FFF8F0";

/** La fachada mira al sur, hacia donde está siempre la cámara: el letrero y la entrada se ven de frente. */
const ROT = 0;
/** Tamaño de la tienda (el modelo está hecho a escala 1). */
const SCALE = 1.7;

export const STORE_COLLIDERS: Collider[] = [{ x: STORE.x, z: STORE.z, r: STORE.r }];
export const STORE_SPOTS = [{ x: STORE.x, z: STORE.z, r: STORE.r + 3 }];

function useSignTexture() {
  const fontsReady = useFontsReady();
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = NAVY;
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, 112, 512, 16);
    ctx.fillStyle = CREAM;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 68px ${labelFontFamily()}`;
    ctx.fillText("KUN Store 🛍️", 256, 58);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
    // fontsReady fuerza a redibujar con la tipografía definitiva.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsReady]);
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

/** Moneda KUN: disco dorado con canto. */
function CoinMesh({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.14, 24]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} emissive="#7A5410" emissiveIntensity={0.35} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0, s * 0.075]} rotation={[0, s < 0 ? Math.PI : 0, 0]}>
          <ringGeometry args={[0.3, 0.42, 24]} />
          <meshStandardMaterial color="#FFE08A" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export function KunStore({ locale }: { locale: Locale }) {
  const sign = useSignTexture();
  const coin = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (coin.current) {
      coin.current.rotation.y = state.clock.elapsedTime * 1.4;
      coin.current.position.y = 6.4 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });
  return (
    <group position={[STORE.x, 0.2, STORE.z]} rotation={[0, ROT, 0]}>
      <group scale={SCALE}>
      {/* Cuerpo de la tienda */}
      <mesh position={[0, 1.8, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[5.6, 3.6, 4.2]} />
        <meshStandardMaterial color={CREAM} roughness={0.6} />
      </mesh>
      {/* Vitrina y puerta */}
      <mesh position={[-1.4, 1.7, 1.72]}>
        <boxGeometry args={[2.2, 1.8, 0.06]} />
        <meshStandardMaterial color="#9FD8FF" roughness={0.1} metalness={0.3} emissive="#2A6E9E" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[1.3, 1.3, 1.72]}>
        <boxGeometry args={[1.4, 2.6, 0.08]} />
        <meshStandardMaterial color={NAVY} roughness={0.5} />
      </mesh>
      <mesh position={[1.75, 1.3, 1.78]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Toldo rojo y techo */}
      <mesh position={[0, 3.25, 2.25]} rotation={[0.42, 0, 0]} castShadow>
        <boxGeometry args={[6.0, 0.1, 1.5]} />
        <meshStandardMaterial color={RED} roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.7, -0.4]} castShadow>
        <boxGeometry args={[6.0, 0.3, 4.6]} />
        <meshStandardMaterial color={NAVY} roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.4, 1.5]}>
        <boxGeometry args={[4.6, 1.15, 0.14]} />
        <meshStandardMaterial map={sign} roughness={0.5} />
      </mesh>
      {/* Moneda gigante girando sobre el techo */}
      <group ref={coin} position={[0, 6.4, -0.4]}>
        <CoinMesh scale={2.2} />
      </group>
      </group>
      <CampusLabel text={`🛍️ ${STORE.label[locale]}`} color="#C98A1E" position={[0, 15, -0.7]} width={7} />
    </group>
  );
}

// ---------------------------------------------------------------- monedas flotantes

const COIN_COUNT = 16;
/** Las monedas recogidas no vuelven hasta el día siguiente (se guardan en el navegador). */
const PICKED_KEY = "kun-coins-picked-v1";
const today = () => new Date().toISOString().slice(0, 10);

function loadPicked(): Set<number> {
  try {
    const raw = JSON.parse(localStorage.getItem(PICKED_KEY) ?? "null") as { day: string; picked: number[] } | null;
    if (raw?.day === today()) return new Set(raw.picked);
  } catch {
    /* sin almacenamiento */
  }
  return new Set();
}

function savePicked(picked: Set<number>) {
  try {
    localStorage.setItem(PICKED_KEY, JSON.stringify({ day: today(), picked: [...picked] }));
  } catch {
    /* ignorado */
  }
}
const PICK_RADIUS = 1.4;

/** Lugares para las monedas: por la isla, lejos de edificios, cafetería y tienda. */
function coinSpots() {
  const rnd = seeded(41);
  const spots: Array<{ x: number; z: number }> = [];
  const blocked = [...ZONES.map((z) => ({ x: z.x, z: z.z, r: z.r + 3 })), { x: CAFE.x, z: CAFE.z, r: CAFE.r + 5 }, { x: STORE.x, z: STORE.z, r: STORE.r + 3 }];
  let guard = 0;
  while (spots.length < COIN_COUNT && guard++ < 2000) {
    const a = rnd() * Math.PI * 2;
    const r = 7 + rnd() * 35;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (blocked.some((b) => Math.hypot(x - b.x, z - b.z) < b.r)) continue;
    if (spots.some((s) => Math.hypot(x - s.x, z - s.z) < 6)) continue;
    spots.push({ x, z });
  }
  return spots;
}

const COIN_SPOTS = coinSpots();

export function CampusCoins({ enabled, onCollect }: { enabled: boolean; onCollect: () => void }) {
  const spots = COIN_SPOTS;
  const refs = useRef<Array<THREE.Group | null>>([]);
  const picked = useRef<Set<number> | null>(null);
  const day = useRef("");
  const onCollectRef = useRef(onCollect);
  useEffect(() => {
    onCollectRef.current = onCollect;
  });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = campusRuntime.player;
    // Al cambiar de día (o la primera vez) se leen las recogidas de hoy.
    if (!picked.current || day.current !== today()) {
      picked.current = loadPicked();
      day.current = today();
    }
    const done = picked.current;
    spots.forEach((s, i) => {
      const g = refs.current[i];
      if (!g) return;
      const active = !done.has(i);
      g.visible = active;
      if (!active) return;
      g.rotation.y = t * 2.2 + i;
      g.position.y = 1.3 + Math.sin(t * 2.4 + i) * 0.2;
      if (enabled && p.y < 2.5 && Math.hypot(p.x - s.x, p.z - s.z) < PICK_RADIUS) {
        done.add(i);
        savePicked(done);
        onCollectRef.current();
      }
    });
  });

  return (
    <>
      {spots.map((s, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g;
          }}
          position={[s.x, 1.3, s.z]}
        >
          <CoinMesh scale={0.75} />
        </group>
      ))}
    </>
  );
}
