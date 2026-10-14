"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BUILDINGS, CurriculumCore, LaunchPad } from "./campus-buildings";
import { CampusLabel } from "./campus-label";
import { LETTER_SPOTS } from "./campus-props";
import { getDotTexture } from "./campus-dot-texture";
import { seeded } from "./campus-random";
import type { SkyPreset } from "./campus-sky";
import { CelestialBody, SkyDome, Stars } from "./campus-sky-dome";
import { FLORIDA_SPOTS, FloridaDecor } from "./campus-florida";
import { GRASS_RADIUS, ISLAND_RADIUS, ZONES, type Collider, type ZoneDef } from "./campus-zones";
import type { Locale } from "@/i18n/locale-context";


function Ocean({ reduceMotion, color }: { reduceMotion: boolean; color: THREE.Color }) {
  const ref = useRef<THREE.Mesh>(null);
  const base = useRef<Float32Array | null>(null);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh || reduceMotion) return;
    const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    if (!base.current) base.current = arr.slice();
    const b = base.current;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < arr.length; i += 3) {
      const x = b[i];
      const y = b[i + 1];
      arr[i + 2] = Math.sin(x * 0.08 + t * 1.1) * 0.35 + Math.cos(y * 0.07 + t * 0.8) * 0.3;
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]} receiveShadow>
      <planeGeometry args={[420, 420, 90, 90]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} flatShading />
    </mesh>
  );
}

function Island() {
  return (
    <group>
      <mesh position={[0, -1, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS + 4, 2, 48]} />
        <meshStandardMaterial color="#F2C79A" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[GRASS_RADIUS, GRASS_RADIUS + 1, 0.3, 48]} />
        <meshStandardMaterial color="#6DB38A" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[7, 10.5, 40]} />
        <meshStandardMaterial color="#EFA98C" side={THREE.DoubleSide} />
      </mesh>
      {/* Caminos desde la plaza hacia cada lugar */}
      {ZONES.filter((z) => z.kind !== "curriculum").map((zn) => {
        const d = Math.hypot(zn.x, zn.z);
        const k = 0.5 + 4.5 / d;
        return (
          <mesh
            key={zn.id}
            position={[zn.x * k, 0.22, zn.z * k]}
            rotation={[0, Math.atan2(zn.x, zn.z), 0]}
            receiveShadow
          >
            <boxGeometry args={[2.6, 0.05, d - 9]} />
            <meshStandardMaterial color="#EFA98C" />
          </mesh>
        );
      })}
      {/* Camino de llegada desde la playa sur, donde arranca el recorrido */}
      <mesh position={[0, 0.22, 26]} receiveShadow>
        <boxGeometry args={[2.6, 0.05, 31]} />
        <meshStandardMaterial color="#EFA98C" />
      </mesh>
    </group>
  );
}

type PalmData = { x: number; z: number; s: number; rot: number; lean: number; sway: number; fronds: number[] };

function Palm({ data }: { data: PalmData }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + data.sway) * 0.025;
  });

  // Tronco segmentado con leve inclinación y copa de hojas curvadas.
  const segments = useMemo(() => {
    const out: Array<{ x: number; y: number; i: number }> = [];
    let px = 0;
    let py = 0;
    for (let i = 0; i < 7; i++) {
      out.push({ x: px, y: py + 0.6, i });
      px += data.lean * 0.35;
      py += 1.15;
    }
    return { out, top: [px, py] as const };
  }, [data.lean]);

  const frondGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.9, 3.6, 1, 4);
    const p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const yy = p.getY(k) + 1.8;
      p.setZ(k, -yy * yy * 0.12);
      p.setX(k, p.getX(k) * (1 - yy / 4));
      p.setY(k, yy);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group ref={ref} position={[data.x, 0.1, data.z]} rotation={[0, data.rot, 0]} scale={data.s}>
      {segments.out.map((seg) => (
        <mesh key={seg.i} position={[seg.x, seg.y, 0]} rotation={[0, 0, -data.lean * 0.6]} castShadow>
          <cylinderGeometry args={[0.26 - seg.i * 0.015, 0.3 - seg.i * 0.015, 1.2, 6]} />
          <meshStandardMaterial color="#8A6A4A" flatShading />
        </mesh>
      ))}
      {data.fronds.map((a, i) => (
        <mesh
          key={i}
          geometry={frondGeometry}
          position={[segments.top[0], segments.top[1], 0]}
          rotation={[-1.1, a, 0, "YXZ"]}
          castShadow
        >
          <meshStandardMaterial color={i % 2 ? "#2F8F5B" : "#3BA56A"} side={THREE.DoubleSide} flatShading />
        </mesh>
      ))}
    </group>
  );
}

const FIREFLY_COUNT = 220;

// Luciérnagas doradas flotando sobre la isla: le dan profundidad y movimiento
// a la escena y el bloom las convierte en puntitos de luz.
function Fireflies({ reduceMotion, sky }: { reduceMotion: boolean; sky: SkyPreset }) {
  const ref = useRef<THREE.Points>(null);
  const seeds = useMemo(() => {
    const rnd = seeded(99);
    return Array.from({ length: FIREFLY_COUNT }, () => {
      const a = rnd() * Math.PI * 2;
      const d = 6 + rnd() * 44;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, y: 1 + rnd() * 9, phase: rnd() * 10, speed: 0.3 + rnd() * 0.6 };
    });
  }, []);
  const positions = useMemo(() => {
    const arr = new Float32Array(FIREFLY_COUNT * 3);
    seeds.forEach((s, i) => arr.set([s.x, s.y, s.z], i * 3));
    return arr;
  }, [seeds]);

  useFrame((state) => {
    const pts = ref.current;
    if (!pts) return;
    // De día casi no se ven; al atardecer y de noche brillan.
    (pts.material as THREE.PointsMaterial).opacity = 0.15 + 0.75 * (1 - sky.day);
    if (reduceMotion) return;
    const t = state.clock.elapsedTime;
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      const s = seeds[i];
      const w = t * s.speed + s.phase;
      attr.setXYZ(i, s.x + Math.sin(w) * 1.2, s.y + Math.sin(w * 1.3) * 0.8, s.z + Math.cos(w * 0.9) * 1.2);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={getDotTexture()} alphaTest={0.02}
        size={0.42}
        color={[3, 2.1, 0.9]}
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

// Anillo dorado que pulsa en el suelo del lugar activo.
function ActiveRing({ zone }: { zone: ZoneDef }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    mesh.scale.setScalar(1 + Math.sin(t * 2.4) * 0.03);
    (mesh.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 2.4) * 0.3;
  });
  return (
    <mesh ref={ref} position={[zone.x, 0.26, zone.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[zone.r + 1.6, zone.r + 2.1, 64]} />
      <meshBasicMaterial color={[2.4, 1.8, 0.7]} transparent toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function FloatingLabel({ zone, locale, index }: { zone: ZoneDef; locale: Locale; index: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.position.y = zone.labelHeight + Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.25;
  });
  return (
    <group ref={ref} position={[zone.x, zone.labelHeight, zone.z]}>
      <CampusLabel text={zone.label[locale]} color={zone.color} position={[0, 0, 0]} />
    </group>
  );
}

export function useVegetation() {
  return useMemo(() => {
    const rnd = seeded(7);
    const far = (x: number, z: number, margin: number) =>
      ZONES.every((zn) => Math.hypot(x - zn.x, z - zn.z) > zn.r + margin) &&
      LETTER_SPOTS.every((l) => Math.hypot(x - l.x, z - l.z) > l.r + margin) &&
      FLORIDA_SPOTS.every((s) => Math.hypot(x - s.x, z - s.z) > s.r + margin * 0.5) &&
      Math.hypot(x, z) > 12 &&
      // Deja libre el camino de llegada y el corredor por donde pasa la cámara.
      !(Math.abs(x) < 3 && z > 10) &&
      !(margin > 3 && Math.abs(x) < 12 && z > 14);
    const make = (x: number, z: number, s: number): PalmData => ({
      x,
      z,
      s,
      rot: rnd() * 6,
      lean: (rnd() - 0.5) * 0.5,
      sway: rnd() * 6,
      fronds: Array.from({ length: 7 }, (_, i) => (i / 7) * Math.PI * 2 + rnd()),
    });
    const palms: PalmData[] = [];
    for (let i = 0; i < 80 && palms.length < 34; i++) {
      const a = rnd() * Math.PI * 2;
      const d = 30 + rnd() * 17;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (far(x, z, 4)) palms.push(make(x, z, 0.9 + rnd() * 0.5));
    }
    for (const [x, z] of [
      [8, -12],
      [-8, -12],
      [11, 6],
      [-11, 6],
    ]) {
      palms.push(make(x, z, 1));
    }
    const bushes: Array<{ x: number; z: number; s: number; pink: boolean }> = [];
    for (let i = 0; i < 46; i++) {
      const a = rnd() * Math.PI * 2;
      const d = 13 + rnd() * 28;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (far(x, z, 2)) bushes.push({ x, z, s: 0.7 + rnd() * 0.6, pink: rnd() > 0.5 });
    }
    return { palms, bushes };
  }, []);
}

export function palmColliders(palms: PalmData[]): Collider[] {
  return palms.map((p) => ({ x: p.x, z: p.z, r: 0.6 }));
}

export function CampusWorld({
  locale,
  activeZoneId,
  reduceMotion,
  vegetation,
  showLabels,
  sky,
}: {
  locale: Locale;
  activeZoneId: string | null;
  reduceMotion: boolean;
  vegetation: ReturnType<typeof useVegetation>;
  showLabels: boolean;
  sky: SkyPreset;
}) {
  const activeZone = ZONES.find((z) => z.id === activeZoneId) ?? null;

  return (
    <>
      <SkyDome sky={sky} radius={300} />
      <Stars sky={sky} radius={280} />
      <CelestialBody sky={sky} />
      <Ocean reduceMotion={reduceMotion} color={sky.ocean} />
      <Island />
      <FloridaDecor sky={sky} />

      {ZONES.map((zn) => {
        const Building = BUILDINGS[zn.id];
        if (!Building) return null;
        return (
          <group key={zn.id} position={[zn.x, 0.2, zn.z]} rotation={[0, Math.atan2(-zn.x, -zn.z), 0]}>
            <Building />
          </group>
        );
      })}
      <group position={[0, 0.2, 0]}>
        <CurriculumCore />
      </group>
      <group position={[31, 0, -31]}>
        <LaunchPad />
      </group>

      {/* Los letreros se guardan durante la pantalla de inicio para no competir con el titular. */}
      {showLabels && ZONES.map((zn, i) => <FloatingLabel key={zn.id} zone={zn} locale={locale} index={i} />)}
      {activeZone && <ActiveRing zone={activeZone} />}

      {vegetation.palms.map((p, i) => (
        <Palm key={i} data={p} />
      ))}
      {vegetation.bushes.map((b, i) => (
        <mesh key={i} position={[b.x, 0.6, b.z]} scale={b.s} castShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={b.pink ? "#E86A9A" : "#4FA374"} flatShading />
        </mesh>
      ))}

      <Fireflies reduceMotion={reduceMotion} sky={sky} />
    </>
  );
}
