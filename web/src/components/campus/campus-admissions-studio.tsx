"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Stats } from "@/lib/types";
import { getDotTexture } from "./campus-dot-texture";
import { CHAPTER_SECONDS, drawExplainer, THEME_STYLE, type Chapter, type Theme } from "./campus-explainer";
import { labelFontFamily } from "./campus-label";
import { seeded } from "./campus-random";
import { campusRuntime } from "./campus-runtime";

// Sala de Admisiones al estilo de activetheory.net/work: un vacío oscuro con
// nubes de partículas, una escultura tornasol y pantallas flotantes con los
// capítulos. El video principal va en la interfaz, para que se vea nítido.

const SCREEN_W = 1280;
const SCREEN_H = 720;

function ParticleCloud({ count, center, radius, color, seed, size }: { count: number; center: [number, number, number]; radius: number; color: [number, number, number]; seed: number; size: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rnd = seeded(seed);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Nube irregular: más densa en el centro.
      const u = rnd() * Math.PI * 2;
      const v = Math.acos(2 * rnd() - 1);
      const r = radius * Math.pow(rnd(), 0.6);
      arr.set([Math.sin(v) * Math.cos(u) * r * 1.4, Math.cos(v) * r, Math.sin(v) * Math.sin(u) * r * 0.8], i * 3);
    }
    return arr;
  }, [count, radius, seed]);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.03 * (seed % 2 ? 1 : -1);
  });
  return (
    <points ref={ref} position={center}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={getDotTexture()}
        alphaTest={0.02}
        size={size}
        color={color}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

function SideScreen({ position, rotation, index, chapters, stats }: { position: [number, number, number]; rotation: [number, number, number]; index: number; chapters: Chapter[]; stats: Stats }) {
  const ref = useRef<THREE.Group>(null);
  // Miniatura fija del capítulo, dibujada una vez.
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 640;
    c.height = 360;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.scale(0.5, 0.5);
    drawExplainer(ctx, SCREEN_W, SCREEN_H, chapters, index % chapters.length, 0.6, index * 3, labelFontFamily(), stats);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [index, chapters, stats]);
  useEffect(() => () => texture?.dispose(), [texture]);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime + index;
    g.position.y = position[1] + Math.sin(t * 0.6) * 0.3;
    g.rotation.y = rotation[1] + Math.sin(t * 0.3) * 0.05;
  });
  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[6.6, 3.9, 0.15]} />
        <meshStandardMaterial color="#1A1230" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[6.3, 3.55]} />
        <meshBasicMaterial map={texture} toneMapped={false} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export function ExplainerStudio({ chapters, stats, theme }: { chapters: Chapter[]; stats: Stats; theme: Theme }) {
  const sculpture = useRef<THREE.Mesh>(null);
  const style = THEME_STYLE[theme];
  const sculptureKind = style.sculpture.kind;

  useEffect(() => {
    campusRuntime.explainer.count = chapters.length;
  }, [chapters.length]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const t = state.clock.elapsedTime;
    const e = campusRuntime.explainer;
    if (e.playing) {
      e.local += delta / CHAPTER_SECONDS;
      if (e.local >= 1) {
        e.local = 0;
        e.chapter = (e.chapter + 1) % chapters.length;
      }
    }
    if (campusRuntime.explainer.chapter >= chapters.length) campusRuntime.explainer.chapter = 0;
    const sc = sculpture.current;
    if (sc) {
      sc.rotation.y = t * (sculptureKind === "wire" ? 0.25 : 0.12);
      sc.rotation.x = Math.sin(t * 0.2) * 0.2;
      // La esfera de Bienestar respira; las demás giran.
      if (sculptureKind === "breath") sc.scale.setScalar(1.6 + Math.sin(t * 1.2) * 0.12);
    }
  });

  return (
    <group>
      {/* Vacío oscuro, teñido con el color de fondo de la escuela */}
      <mesh>
        <sphereGeometry args={[110, 32, 16]} />
        <meshBasicMaterial color={style.bg} side={THREE.BackSide} fog={false} />
      </mesh>
      <ParticleCloud count={2200} center={[-12, 6, -14]} radius={9} color={style.particles[0]} seed={3} size={0.16} />
      <ParticleCloud count={1800} center={[13, 4, -12]} radius={8} color={style.particles[1]} seed={8} size={0.15} />
      <ParticleCloud count={1600} center={[0, 10, -20]} radius={11} color={style.particles[2]} seed={13} size={0.14} />
      <ParticleCloud count={900} center={[0, 1, 4]} radius={14} color={style.particles[3]} seed={21} size={0.08} />

      {/* Escultura de fondo, distinta en cada escuela */}
      <mesh ref={sculpture} position={[0, 6, -11]} scale={sculptureKind === "rainbow" ? [1, 2.2, 1] : [1.6, 1.6, 1.6]}>
        {sculptureKind === "wire" && <icosahedronGeometry args={[3.2, 1]} />}
        {sculptureKind === "metal" && <octahedronGeometry args={[3.2, 0]} />}
        {sculptureKind === "breath" && <sphereGeometry args={[2.8, 48, 32]} />}
        {sculptureKind === "rainbow" && <torusKnotGeometry args={[2.6, 0.75, 220, 24, 3, 7]} />}
        {sculptureKind === "wire" ? (
          <meshBasicMaterial color={style.sculpture.color} wireframe toneMapped={false} />
        ) : sculptureKind === "metal" ? (
          <meshStandardMaterial color={style.sculpture.color} metalness={0.95} roughness={0.22} emissive="#6B4A10" emissiveIntensity={0.5} flatShading />
        ) : sculptureKind === "breath" ? (
          <meshStandardMaterial color={style.sculpture.color} roughness={0.35} emissive={style.sculpture.color} emissiveIntensity={0.45} transparent opacity={0.85} />
        ) : (
          <meshNormalMaterial />
        )}
      </mesh>

      {/* El video principal se muestra nítido en la interfaz (StudioRoom), delante de esta escena. */}

      {/* Pantallas laterales flotantes con los capítulos */}
      <SideScreen position={[-12.5, 7.5, -4]} rotation={[0.05, 0.55, -0.04]} index={1} chapters={chapters} stats={stats} />
      <SideScreen position={[-11, 1.6, -2]} rotation={[-0.05, 0.42, 0.03]} index={3} chapters={chapters} stats={stats} />
      <SideScreen position={[12.5, 7.8, -4]} rotation={[0.04, -0.55, 0.04]} index={2} chapters={chapters} stats={stats} />
      <SideScreen position={[11.5, 1.8, -2.5]} rotation={[-0.04, -0.45, -0.03]} index={5} chapters={chapters} stats={stats} />
      <SideScreen position={[0, 13.2, -8]} rotation={[0.35, 0, 0]} index={6} chapters={chapters} stats={stats} />

      <pointLight position={[0, 6, 8]} intensity={40} distance={30} color="#C9A0FF" />
    </group>
  );
}
