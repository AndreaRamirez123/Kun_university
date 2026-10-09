"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";
import { CampusPlayer } from "./campus-player";
import type { Certification, School, Stats } from "@/lib/types";

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

function NoWebGLFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-[#FFF3E6]">
      <p className="text-lg font-bold">Tu navegador no puede mostrar el campus en 3D</p>
      <p className="max-w-80 text-sm opacity-80">
        Activa la aceleración por hardware o abre esta página en una versión reciente de Chrome, Edge o Safari.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-[#FFC85C] px-6 py-3 text-sm font-bold text-[#24123F] transition hover:-translate-y-0.5"
      >
        Ver versión clásica del sitio
      </Link>
    </div>
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

// Placeholder: un marcador por escuela mientras se construyen los edificios reales en la Fase 3
// (los carteles con nombre llegarán ahí con drei <Billboard>+<Text>).
function SchoolMarker({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function CampusScene({
  schools,
}: {
  schools: School[];
  certifications: Certification[];
  stats: Stats;
}) {
  const [webglOk] = useState(() => (typeof window !== "undefined" ? hasWebGL() : true));
  const playerRef = useRef<THREE.Group>(null);

  const markers = useMemo(() => {
    const colors = ["#3D6FD9", "#D99A1E", "#1E9C7E", "#C2387A"];
    const positions = [
      [0, -10],
      [10, 0],
      [0, 10],
      [-10, 0],
    ];
    return schools.slice(0, 4).map((school, i) => ({
      school,
      color: colors[i % colors.length],
      x: positions[i % positions.length][0],
      z: positions[i % positions.length][1],
    }));
  }, [schools]);

  if (!webglOk) return <NoWebGLFallback />;

  return (
    <div className="absolute inset-0">
      <div className="pointer-events-none absolute top-4 left-4 z-10 text-[#FFF3E6]">
        <div className="text-lg font-extrabold">KUN University AI</div>
        <div className="text-xs opacity-70">Campus virtual — prueba de concepto</div>
      </div>
      <Link
        href="/"
        className="absolute top-4 right-4 z-10 rounded-full bg-black/30 px-4 py-2 text-xs font-bold text-[#FFF3E6] backdrop-blur-sm transition hover:bg-black/50"
      >
        ← Sitio clásico
      </Link>
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-[11px] font-semibold tracking-[0.04em] text-[#FFF3E6]/70">
        Usa las flechas o W A S D para caminar
      </div>

      <Canvas shadows camera={{ position: [0, 13, 31], fov: 45 }}>
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

        {markers.map((m) => (
          <SchoolMarker key={m.school.slug} x={m.x} z={m.z} color={m.color} />
        ))}

        <CampusPlayer groupRef={playerRef} />
        <CameraRig targetRef={playerRef} />
      </Canvas>
    </div>
  );
}
