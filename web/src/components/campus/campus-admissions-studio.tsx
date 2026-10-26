"use client";

import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Stats } from "@/lib/types";
import { CHAPTER_SECONDS, THEME_STYLE, type Chapter, type Theme } from "./campus-explainer";
import { campusRuntime } from "./campus-runtime";

// Sala de Admisiones al estilo de activetheory.net/work: un vacío oscuro con
// fondo liso del color de la escuela. El video principal va en la interfaz,
// para que se vea nítido, y es el único lugar con decoración.

export function ExplainerStudio({ chapters, theme }: { chapters: Chapter[]; stats: Stats; theme: Theme }) {
  const style = THEME_STYLE[theme];

  useEffect(() => {
    campusRuntime.explainer.count = chapters.length;
  }, [chapters.length]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const e = campusRuntime.explainer;
    if (e.playing) {
      e.local += (delta * e.speed) / CHAPTER_SECONDS;
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
      {/* Fondo liso: el estilo de cada escuela vive solo dentro del video. */}

      {/* Sin escultura de fondo: quedaba detrás del video y solo asomaba un pedazo. */}
      {/* El video principal se muestra nítido en la interfaz (StudioRoom), delante de esta escena. */}

      {/* Sin pantallas laterales: competían con el menú y los textos de la sala. */}
      <pointLight position={[0, 6, 8]} intensity={40} distance={30} color="#C9A0FF" />
    </group>
  );
}
