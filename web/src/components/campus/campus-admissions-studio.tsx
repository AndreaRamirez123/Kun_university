"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Stats } from "@/lib/types";
import { getDotTexture } from "./campus-dot-texture";
import { CHAPTER_SECONDS, THEME_STYLE, type Chapter, type Theme } from "./campus-explainer";
import { seeded } from "./campus-random";
import { campusRuntime } from "./campus-runtime";

// Sala de Admisiones al estilo de activetheory.net/work: un vacío oscuro con
// partículas discretas al fondo. El video principal va en la interfaz, para que
// se vea nítido.

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

export function ExplainerStudio({ chapters, theme }: { chapters: Chapter[]; stats: Stats; theme: Theme }) {
  const style = THEME_STYLE[theme];

  useEffect(() => {
    campusRuntime.explainer.count = chapters.length;
  }, [chapters.length]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const e = campusRuntime.explainer;
    if (e.playing) {
      e.local += delta / CHAPTER_SECONDS;
      if (e.local >= 1) {
        e.local = 0;
        e.chapter = (e.chapter + 1) % chapters.length;
      }
    }
    if (campusRuntime.explainer.chapter >= chapters.length) campusRuntime.explainer.chapter = 0;
  });

  return (
    <group>
      {/* Vacío oscuro, teñido con el color de fondo de la escuela */}
      <mesh>
        <sphereGeometry args={[110, 32, 16]} />
        <meshBasicMaterial color={style.bg} side={THREE.BackSide} fog={false} />
      </mesh>
      {/* Partículas discretas y lejanas: ambiente, sin ensuciar los textos de la sala */}
      <ParticleCloud count={260} center={[-14, 7, -22]} radius={8} color={style.particles[0]} seed={3} size={0.1} />
      <ParticleCloud count={220} center={[15, 5, -20]} radius={8} color={style.particles[1]} seed={8} size={0.1} />
      <ParticleCloud count={260} center={[0, 12, -26]} radius={12} color={style.particles[2]} seed={13} size={0.09} />

      {/* Sin escultura de fondo: quedaba detrás del video y solo asomaba un pedazo. */}
      {/* El video principal se muestra nítido en la interfaz (StudioRoom), delante de esta escena. */}

      {/* Sin pantallas laterales: competían con el menú y los textos de la sala. */}
      <pointLight position={[0, 6, 8]} intensity={40} distance={30} color="#C9A0FF" />
    </group>
  );
}
