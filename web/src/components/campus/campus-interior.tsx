"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getDotTexture } from "./campus-dot-texture";
import { seeded } from "./campus-random";
import type { SkyPreset } from "./campus-sky";
import { CelestialBody, SkyDome, Stars } from "./campus-sky-dome";
import type { ZoneDef } from "./campus-zones";
import { ExplainerStudio } from "./campus-admissions-studio";
import { ZONE_VIDEO_URLS, type Chapter } from "./campus-explainer";
import type { Stats } from "@/lib/types";

// Aula virtual de cada lugar del campus: una plataforma que flota sobre el mar
// de Florida al atardecer, con ventanal Art Deco, pupitres con pantallas
// holográficas y un holograma distinto por escuela. Vive lejos de la isla
// (INTERIOR_ORIGIN) y la escena oculta la isla mientras estás adentro.

export const INTERIOR_ORIGIN: [number, number, number] = [0, -400, 0];

function color(hex: string, boost = 1) {
  return new THREE.Color(hex).multiplyScalar(boost);
}

const SEA_BELOW = new THREE.Color("#07202C");

function Backdrop({ sky }: { sky: SkyPreset }) {
  return (
    <group>
      <SkyDome sky={sky} radius={120} below={SEA_BELOW} />
      <Stars sky={sky} radius={112} />
      {/* El mismo sol o luna de la isla, más cerca porque el domo es más chico */}
      <CelestialBody sky={sky} scale={0.42} />
      <InteriorSea color={sky.ocean} />
    </group>
  );
}
function InteriorSea({ color }: { color: THREE.Color }) {
  const ref = useRef<THREE.Mesh>(null);
  const base = useRef<Float32Array | null>(null);
  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    if (!base.current) base.current = arr.slice();
    const b = base.current;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 2] = Math.sin(b[i] * 0.12 + t) * 0.3 + Math.cos(b[i + 1] * 0.1 + t * 0.7) * 0.25;
    }
    pos.needsUpdate = true;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[240, 240, 60, 60]} />
      <meshStandardMaterial color={color} roughness={0.25} metalness={0.3} flatShading />
    </mesh>
  );
}

// Palmeras en silueta a los lados del ventanal, como en el hero de Miami Deco.
function PalmSilhouette({ x, z, s, flip }: { x: number; z: number; s: number; flip?: boolean }) {
  const fronds = useMemo(() => Array.from({ length: 7 }, (_, i) => (i / 7) * Math.PI * 2), []);
  return (
    <group position={[x, -3, z]} scale={[flip ? -s : s, s, s]}>
      <mesh position={[0.4, 4, 0]} rotation={[0, 0, -0.12]}>
        <cylinderGeometry args={[0.18, 0.3, 8, 6]} />
        <meshBasicMaterial color="#2A1238" />
      </mesh>
      {fronds.map((a) => (
        <mesh key={a} position={[0.9, 8, 0]} rotation={[0, a, 0.9]}>
          <coneGeometry args={[0.35, 4.2, 4]} />
          <meshBasicMaterial color="#2A1238" />
        </mesh>
      ))}
    </group>
  );
}

// Arco Art Deco: el marco del ventanal que da al mar.
function DecoArch({ tint }: { tint: string }) {
  const glow = useMemo(() => color(tint, 2.2), [tint]);
  return (
    <group position={[0, 0, -11]}>
      {[-9, 9].map((x) => (
        <mesh key={x} position={[x, 5, 0]} castShadow>
          <boxGeometry args={[1.2, 10, 1.2]} />
          <meshStandardMaterial color="#FFF3E6" roughness={0.6} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 10, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[9, 0.6, 8, 48, Math.PI]} />
        <meshStandardMaterial color="#FFF3E6" roughness={0.6} flatShading />
      </mesh>
      {/* Neón interior del arco */}
      <mesh position={[0, 10, 0.4]}>
        <torusGeometry args={[8.2, 0.08, 6, 64, Math.PI]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      {[-8.2, 8.2].map((x) => (
        <mesh key={x} position={[x, 5, 0.4]}>
          <boxGeometry args={[0.16, 10, 0.16]} />
          <meshBasicMaterial color={glow} toneMapped={false} />
        </mesh>
      ))}
      {/* Rayos de sol escalonados sobre el arco */}
      {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
        <mesh key={x} position={[x, 19.6 + (i === 2 ? 1.2 : i % 2 ? 0.6 : 0), 0]}>
          <boxGeometry args={[0.7, 1.6 + (i === 2 ? 2.4 : i % 2 ? 1.2 : 0), 0.7]} />
          <meshStandardMaterial color="#FFC85C" emissive="#FF9A3C" emissiveIntensity={0.6} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Platform({ tint }: { tint: string }) {
  const ring = useRef<THREE.Mesh>(null);
  const glow = useMemo(() => color(tint, 2.4), [tint]);
  useFrame((state) => {
    if (ring.current) ring.current.rotation.z = state.clock.elapsedTime * 0.05;
  });
  return (
    <group>
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[15, 13, 1, 64]} />
        <meshStandardMaterial color="#1D1236" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[14.6, 64]} />
        <meshStandardMaterial color="#2A1A4A" roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Anillos luminosos del piso */}
      {[5, 9.5, 14.2].map((r, i) => (
        <mesh key={r} ref={i === 1 ? ring : undefined} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.05, r, 96, 1, 0, i === 1 ? Math.PI * 1.6 : Math.PI * 2]} />
          <meshBasicMaterial color={glow} toneMapped={false} transparent opacity={i === 2 ? 0.9 : 0.55} />
        </mesh>
      ))}
    </group>
  );
}

// Pupitres en semicírculo frente al tablero, cada uno con su pantalla holográfica.
function Desks({ tint }: { tint: string }) {
  const screens = useRef<Array<THREE.Mesh | null>>([]);
  const glow = useMemo(() => color(tint, 1.6), [tint]);
  const seats = useMemo(() => {
    const out: Array<{ x: number; z: number; rot: number }> = [];
    for (const [radius, count] of [
      [7.5, 5],
      [11, 7],
    ] as const) {
      for (let i = 0; i < count; i++) {
        const a = Math.PI * (0.15 + (0.7 * i) / (count - 1));
        out.push({ x: Math.cos(a) * radius, z: Math.sin(a) * radius - 1, rot: -a + Math.PI / 2 });
      }
    }
    return out;
  }, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    screens.current.forEach((s, i) => {
      if (!s) return;
      (s.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 2 + i) * 0.2;
    });
  });
  return (
    <group>
      {seats.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]} rotation={[0, s.rot, 0]}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <boxGeometry args={[2.2, 0.12, 1.1]} />
            <meshStandardMaterial color="#FFF3E6" roughness={0.5} flatShading />
          </mesh>
          {[-0.9, 0.9].map((x) => (
            <mesh key={x} position={[x, 0.55, 0]}>
              <boxGeometry args={[0.1, 1.1, 0.9]} />
              <meshStandardMaterial color="#C9B8E8" flatShading />
            </mesh>
          ))}
          <mesh
            ref={(m) => {
              screens.current[i] = m;
            }}
            position={[0, 1.75, -0.35]}
            rotation={[-0.25, 0, 0]}
          >
            <planeGeometry args={[1.5, 0.9]} />
            <meshBasicMaterial color={glow} transparent opacity={0.6} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          {/* Asiento */}
          <mesh position={[0, 0.6, 0.9]} castShadow>
            <boxGeometry args={[0.9, 0.1, 0.8]} />
            <meshStandardMaterial color="#7A4FD0" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WireMat({ c, boost = 2.2 }: { c: string; boost?: number }) {
  const col = useMemo(() => color(c, boost), [c, boost]);
  return <meshBasicMaterial color={col} wireframe toneMapped={false} transparent opacity={0.9} />;
}

function SolidGlow({ c, boost = 2.2 }: { c: string; boost?: number }) {
  const col = useMemo(() => color(c, boost), [c, boost]);
  return <meshBasicMaterial color={col} toneMapped={false} />;
}

// Holograma característico de cada lugar, flotando sobre el proyector.
function Hologram({ zone }: { zone: ZoneDef }) {
  const group = useRef<THREE.Group>(null);
  const parts = useRef<Array<THREE.Object3D | null>>([]);
  const c = zone.color;


  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    g.rotation.y = t * 0.35;
    g.position.y = 5.2 + Math.sin(t * 1.2) * 0.25;
    const p = parts.current;
    if (zone.id === "ing") {
      p.forEach((o, i) => {
        if (!o || i === 0) return;
        const a = t * (0.6 + i * 0.1) + i * 1.3;
        o.position.set(Math.cos(a) * 3.2, Math.sin(a * 1.3) * 1.2, Math.sin(a) * 3.2);
        o.rotation.set(t, t * 1.3, 0);
      });
    } else if (zone.id === "neg") {
      p.forEach((o, i) => {
        if (!o) return;
        const h = 0.6 + ((Math.sin(t * 0.9 - i * 0.5) + 1) / 2) * (1 + i * 0.6);
        o.scale.y = h;
        o.position.y = (h * 1) / 2 - 1.5;
      });
    } else if (zone.id === "bie") {
      p.forEach((o, i) => {
        if (!o) return;
        const k = Math.floor(i / 2);
        const a = k * 0.55 + t * 1.2 + (i % 2) * Math.PI;
        o.position.set(Math.cos(a) * 1.4, k * 0.42 - 2.6, Math.sin(a) * 1.4);
      });
    } else if (zone.id === "cur") {
      p.forEach((o, i) => {
        if (!o) return;
        o.rotation.x = t * (0.5 + i * 0.3);
        o.rotation.z = t * (0.3 + i * 0.2);
      });
    } else if (zone.id === "cont") {
      const r = p[0];
      if (r) r.position.y = Math.sin(t * 2) * 0.4;
      const f = p[1];
      if (f) f.scale.y = 1 + Math.sin(t * 30) * 0.2;
    } else if (zone.id === "dis" || zone.id === "adm") {
      const o = p[0];
      if (o) o.rotation.x = t * 0.6;
    }
  });

  let body: React.ReactNode;
  switch (zone.id) {
    case "ing":
      body = (
        <>
          <mesh ref={(o) => { parts.current[0] = o; }}>
            <icosahedronGeometry args={[2.2, 1]} />
            <WireMat c={c} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} ref={(o) => { parts.current[i + 1] = o; }}>
              <boxGeometry args={[0.45, 0.45, 0.45]} />
              <SolidGlow c={i % 2 ? "#FFFFFF" : c} boost={1.8} />
            </mesh>
          ))}
        </>
      );
      break;
    case "neg":
      body = (
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i} ref={(o) => { parts.current[i] = o; }} position={[(i - 2) * 1.05, 0, 0]}>
              <boxGeometry args={[0.75, 1, 0.75]} />
              <WireMat c={i === 4 ? "#FFFFFF" : c} />
            </mesh>
          ))}
          <mesh position={[0.4, 2.2, 0]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.45, 0.9, 4]} />
            <SolidGlow c="#FFFFFF" boost={1.6} />
          </mesh>
        </>
      );
      break;
    case "bie":
      body = (
        <>
          {Array.from({ length: 26 }, (_, i) => (
            <mesh key={i} ref={(o) => { parts.current[i] = o; }}>
              <sphereGeometry args={[0.2, 10, 8]} />
              <SolidGlow c={i % 2 ? "#FFFFFF" : c} boost={1.8} />
            </mesh>
          ))}
        </>
      );
      break;
    case "dis":
      body = (
        <>
          <mesh ref={(o) => { parts.current[0] = o; }}>
            <torusKnotGeometry args={[1.6, 0.45, 120, 12, 2, 3]} />
            <WireMat c={c} />
          </mesh>
          <mesh rotation={[0.6, 0.3, 0]}>
            <octahedronGeometry args={[0.9, 0]} />
            <SolidGlow c="#FFD27A" boost={1.6} />
          </mesh>
        </>
      );
      break;
    case "cur":
      body = (
        <>
          {[2.6, 2, 1.4].map((r, i) => (
            <mesh key={r} ref={(o) => { parts.current[i] = o; }}>
              <torusGeometry args={[r, 0.07, 8, 64]} />
              <SolidGlow c={["#FFD27A", c, "#FFFFFF"][i]} boost={2} />
            </mesh>
          ))}
          <mesh>
            <icosahedronGeometry args={[0.7, 0]} />
            <WireMat c="#FFFFFF" />
          </mesh>
        </>
      );
      break;
    case "cont":
      body = (
        <group ref={(o) => { parts.current[0] = o; }}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.6, 0.7, 3.4, 12]} />
            <WireMat c={c} />
          </mesh>
          <mesh position={[0, 2.7, 0]}>
            <coneGeometry args={[0.6, 1.3, 12]} />
            <WireMat c="#FFFFFF" />
          </mesh>
          <mesh ref={(o) => { parts.current[1] = o; }} position={[0, -2, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.45, 1.6, 10]} />
            <SolidGlow c="#FFB347" boost={2.4} />
          </mesh>
        </group>
      );
      break;
    default:
      // Admisiones: birrete de graduación.
      body = (
        <group ref={(o) => { parts.current[0] = o; }}>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[3, 0.12, 3]} />
            <WireMat c={c} />
          </mesh>
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[1, 1.1, 1.1, 16]} />
            <WireMat c="#FFFFFF" />
          </mesh>
          <mesh position={[1.4, -0.7, 0]}>
            <sphereGeometry args={[0.18, 8, 6]} />
            <SolidGlow c="#FFD27A" />
          </mesh>
        </group>
      );
  }

  return <group ref={group}>{body}</group>;
}

function Projector({ tint }: { tint: string }) {
  const glow = useMemo(() => color(tint, 1.4), [tint]);
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[1.6, 2, 0.8, 32]} />
        <meshStandardMaterial color="#FFF3E6" roughness={0.4} flatShading />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.05, 32]} />
        <meshBasicMaterial color={color(tint, 3)} toneMapped={false} />
      </mesh>
      {/* Haz de luz del proyector */}
      <mesh position={[0, 3.6, 0]}>
        <cylinderGeometry args={[3.2, 1.2, 5.6, 32, 1, true]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

const MOTE_COUNT = 140;

function Motes({ tint }: { tint: string }) {
  const ref = useRef<THREE.Points>(null);
  const seeds = useMemo(() => {
    const rnd = seeded(31);
    return Array.from({ length: MOTE_COUNT }, () => ({
      x: (rnd() - 0.5) * 30,
      y: rnd() * 14,
      z: (rnd() - 0.5) * 24,
      p: rnd() * 10,
    }));
  }, []);
  const positions = useMemo(() => {
    const arr = new Float32Array(MOTE_COUNT * 3);
    seeds.forEach((s, i) => arr.set([s.x, s.y, s.z], i * 3));
    return arr;
  }, [seeds]);
  const col = useMemo(() => color(tint, 2.5).lerp(new THREE.Color(3, 2.4, 1.2), 0.5), [tint]);
  useFrame((state) => {
    const pts = ref.current;
    if (!pts) return;
    const t = state.clock.elapsedTime;
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < MOTE_COUNT; i++) {
      const s = seeds[i];
      attr.setXYZ(i, s.x + Math.sin(t * 0.4 + s.p) * 0.6, (s.y + t * 0.25 + s.p) % 14, s.z + Math.cos(t * 0.3 + s.p) * 0.6);
    }
    attr.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={getDotTexture()} alphaTest={0.02} size={0.24} color={col} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
}

export function CampusInterior({ zone, sky, stats, chapters }: { zone: ZoneDef; sky: SkyPreset; stats: Stats; chapters: Chapter[] | null }) {
  // Cada lugar es una sala con su video explicativo en pantallas flotantes.
  if (chapters) {
    return (
      <group position={INTERIOR_ORIGIN}>
        <ExplainerStudio chapters={chapters} stats={stats} videoUrl={ZONE_VIDEO_URLS[zone.id] ?? null} />
      </group>
    );
  }
  return (
    <group position={INTERIOR_ORIGIN}>
      <Backdrop sky={sky} />
      <PalmSilhouette x={-24} z={-30} s={2.2} />
      <PalmSilhouette x={-31} z={-40} s={1.7} />
      <PalmSilhouette x={25} z={-32} s={2} flip />
      <PalmSilhouette x={33} z={-44} s={1.6} flip />
      <Platform tint={zone.color} />
      <DecoArch tint={zone.color} />
      <Desks tint={zone.color} />
      <Projector tint={zone.color} />
      <Hologram zone={zone} />
      <Motes tint={zone.color} />
      <pointLight position={[0, 6, 2]} intensity={60} distance={30} color={zone.color} />
      <pointLight position={[0, 12, 12]} intensity={40} distance={40} color="#FFD9B0" />
    </group>
  );
}
