"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";
import { BUILDING_LAYOUT } from "./campus-buildings";
import { hasWebGL } from "./has-webgl";
import { CampusInfoPanel } from "./campus-info-panel";
import { CampusPlayer, type Collider, type Gender } from "./campus-player";
import { NoWebGLFallback } from "./no-webgl-fallback";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { Certification, School, Stats } from "@/lib/types";

const COPY = {
  es: {
    subtitle: "Campus virtual — prueba de concepto",
    classicSite: "← Sitio clásico",
    controlsHint: "Usa las flechas o W A S D para caminar · Acércate a un edificio para explorarlo",
  },
  en: {
    subtitle: "Virtual campus — proof of concept",
    classicSite: "← Classic site",
    controlsHint: "Use the arrow keys or W A S D to walk · Get close to a building to explore it",
  },
};

const ENTRY_MARGIN = 3.5;

type Building = { school: School; layout: (typeof BUILDING_LAYOUT)[string] };

// Detecta el edificio más cercano dentro de su radio de entrada, sin re-renderizar cada frame.
function ProximityWatcher({
  playerRef,
  buildings,
  onActiveChange,
}: {
  playerRef: React.RefObject<THREE.Group | null>;
  buildings: Building[];
  onActiveChange: (slug: string | null) => void;
}) {
  const current = useRef<string | null>(null);

  useFrame(() => {
    const player = playerRef.current;
    if (!player) return;
    let closestSlug: string | null = null;
    let closestDist = Infinity;
    for (const { school, layout } of buildings) {
      const dx = player.position.x - layout.x;
      const dz = player.position.z - layout.z;
      const dist = Math.hypot(dx, dz);
      if (dist < layout.radius + ENTRY_MARGIN && dist < closestDist) {
        closestDist = dist;
        closestSlug = school.slug;
      }
    }
    if (closestSlug !== current.current) {
      current.current = closestSlug;
      onActiveChange(closestSlug);
    }
  });

  return null;
}

// Anillo dorado que pulsa en la plaza del edificio activo.
function ActiveRing({ radius }: { radius: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    mesh.scale.setScalar(1 + Math.sin(t * 2.4) * 0.03);
    (mesh.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(t * 2.4) * 0.25;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      <ringGeometry args={[radius - 0.15, radius, 48]} />
      <meshBasicMaterial color="#FFC85C" transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Cámara cinematográfica: sigue al personaje suavemente desde atrás, sin control manual de arrastre.
function CameraRig({ targetRef }: { targetRef: React.RefObject<THREE.Group | null> }) {
  const desired = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const target = targetRef.current;
    if (!target) return;
    const t = Math.min(1, delta * 2.4);
    desired.current.set(target.position.x, 13, target.position.z + 15);
    state.camera.position.lerp(desired.current, t);
    lookAt.current.lerp(
      new THREE.Vector3(target.position.x, target.position.y + 1.5, target.position.z),
      Math.min(1, delta * 4),
    );
    state.camera.lookAt(lookAt.current);
  });

  return null;
}

export function CampusScene({
  schools,
  gender = "male",
}: {
  schools: School[];
  certifications: Certification[];
  stats: Stats;
  gender?: Gender;
}) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  const [webglOk] = useState(() => (typeof window !== "undefined" ? hasWebGL() : true));
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const playerRef = useRef<THREE.Group>(null);

  const buildings: Building[] = useMemo(
    () => schools.map((school) => ({ school, layout: BUILDING_LAYOUT[school.slug] })).filter((b) => b.layout),
    [schools],
  );

  const colliders: Collider[] = useMemo(
    () => buildings.map((b) => ({ x: b.layout.x, z: b.layout.z, radius: b.layout.radius })),
    [buildings],
  );

  if (!webglOk) return <NoWebGLFallback />;

  return (
    <div className="absolute inset-0">
      <div className="pointer-events-none absolute top-4 left-4 z-10 text-[#FFF3E6]">
        <div className="text-lg font-extrabold">KUN University AI</div>
        <div className="text-xs opacity-70">{t.subtitle}</div>
      </div>
      <Link
        href="/"
        className="absolute top-4 right-4 z-10 rounded-full bg-black/30 px-4 py-2 text-xs font-bold text-[#FFF3E6] backdrop-blur-sm transition hover:bg-black/50"
      >
        {t.classicSite}
      </Link>
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-[11px] font-semibold tracking-[0.04em] text-[#FFF3E6]/70">
        {t.controlsHint}
      </div>

      <CampusInfoPanel school={buildings.find((b) => b.school.slug === activeSlug)?.school ?? null} />

      <Canvas shadows camera={{ position: [4, 13, 21], fov: 45 }}>
        <color attach="background" args={["#1D1236"]} />
        <fog attach="fog" args={["#1D1236", 40, 120]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[-15, 20, -10]} intensity={1.4} castShadow />
        <hemisphereLight args={["#C9B2FF", "#F2C79A", 0.6]} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[30, 48]} />
          <meshStandardMaterial color="#6DB38A" />
        </mesh>
        <Grid args={[60, 60]} position={[0, 0.01, 0]} cellColor="#2A1758" sectionColor="#7A4FD0" fadeDistance={40} />

        {buildings.map(({ school, layout }) => (
          <group key={school.slug} position={[layout.x, 0, layout.z]}>
            <layout.Component label={school.name[locale].replace(/^(Escuela de |School of )/, "")} />
            {activeSlug === school.slug && <ActiveRing radius={layout.radius} />}
          </group>
        ))}

        <CampusPlayer groupRef={playerRef} colliders={colliders} gender={gender} />
        <CameraRig targetRef={playerRef} />
        <ProximityWatcher playerRef={playerRef} buildings={buildings} onActiveChange={setActiveSlug} />
      </Canvas>
    </div>
  );
}
