"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { labelFontFamily, useFontsReady } from "./campus-label";
import type { SkyPreset } from "./campus-sky";
import type { Collider } from "./campus-zones";

// Detalles que hacen al campus inconfundiblemente de Florida, EE. UU.:
// banderas de EE. UU. y de Florida, letrero de bienvenida, torres salvavidas
// pastel de Miami Beach, flamencos, naranjos y faroles que se encienden de noche.

// ---------------------------------------------------------------- ubicaciones

const FLAGS = [
  { x: -3.2, z: 12.5, kind: "us" as const },
  { x: 3.2, z: 12.5, kind: "fl" as const },
];

const SIGN = { x: 8.5, z: 34, rot: -0.35 };

const LIFEGUARD_ANGLES = [15, 75, 105, 160, 200, 250];
const LIFEGUARD_COLORS = ["#FF8FB1", "#5ED3C9", "#FFD166", "#B79CFF", "#FF9E6B", "#7FD1FF"];
const LIFEGUARDS = LIFEGUARD_ANGLES.map((deg, i) => {
  const a = (deg * Math.PI) / 180;
  return { x: Math.cos(a) * 45.5, z: Math.sin(a) * 45.5, color: LIFEGUARD_COLORS[i], a };
});

const FLAMINGOS = [
  { x: -30, z: 5, rot: 0.6 },
  { x: -28.6, z: 7.2, rot: -0.4 },
  { x: 33, z: 2, rot: 2.4 },
  { x: 31.2, z: 4.4, rot: 3.6 },
  { x: 6, z: -38, rot: 1.2 },
];

const ORANGE_TREES = [
  { x: -19, z: 8 },
  { x: 19, z: 8 },
  { x: -12, z: -31 },
  { x: 12, z: -31 },
];

// Detrás del punto de partida, para no tapar la fila de personajes del creador.
const LAMPS = [13.5, 21.5, 27].flatMap((z) => [
  { x: -2.4, z },
  { x: 2.4, z },
]);

/** Colisiones de la decoración, para el jugador y las pelotas. */
export const FLORIDA_COLLIDERS: Collider[] = [
  ...FLAGS.map((f) => ({ x: f.x, z: f.z, r: 0.35 })),
  { x: SIGN.x, z: SIGN.z, r: 2.4 },
  ...LIFEGUARDS.map((l) => ({ x: l.x, z: l.z, r: 1.9 })),
  ...ORANGE_TREES.map((o) => ({ x: o.x, z: o.z, r: 1 })),
  ...LAMPS.map((l) => ({ x: l.x, z: l.z, r: 0.3 })),
];

/** Zonas que la vegetación aleatoria debe dejar libres. */
export const FLORIDA_SPOTS = [
  ...FLAGS.map((f) => ({ x: f.x, z: f.z, r: 1.5 })),
  { x: SIGN.x, z: SIGN.z, r: 4 },
  ...LIFEGUARDS.map((l) => ({ x: l.x, z: l.z, r: 5 })),
  ...FLAMINGOS.map((f) => ({ x: f.x, z: f.z, r: 2 })),
  ...ORANGE_TREES.map((o) => ({ x: o.x, z: o.z, r: 2.5 })),
];

// ---------------------------------------------------------------- texturas

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function usFlagTexture() {
  return canvasTexture(380, 200, (ctx) => {
    const stripe = 200 / 13;
    for (let i = 0; i < 13; i++) {
      ctx.fillStyle = i % 2 ? "#FFFFFF" : "#B22234";
      ctx.fillRect(0, i * stripe, 380, stripe + 1);
    }
    const cw = 152;
    const ch = stripe * 7;
    ctx.fillStyle = "#3C3B6E";
    ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = "#FFFFFF";
    // 50 estrellas: 9 filas alternadas de 6 y 5.
    for (let row = 0; row < 9; row++) {
      const count = row % 2 ? 5 : 6;
      for (let col = 0; col < count; col++) {
        const x = (cw / 12) * (col * 2 + (row % 2 ? 2 : 1));
        const y = (ch / 10) * (row + 1);
        ctx.beginPath();
        ctx.arc(x, y, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

function floridaFlagTexture() {
  return canvasTexture(380, 250, (ctx) => {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 380, 250);
    ctx.strokeStyle = "#C8102E";
    ctx.lineWidth = 46;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(380, 250);
    ctx.moveTo(380, 0);
    ctx.lineTo(0, 250);
    ctx.stroke();
    // Sello estatal simplificado.
    ctx.fillStyle = "#F2C14E";
    ctx.beginPath();
    ctx.arc(190, 125, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4A9BD6";
    ctx.beginPath();
    ctx.arc(190, 125, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2F8F5B";
    ctx.fillRect(184, 104, 10, 30);
    ctx.beginPath();
    ctx.arc(189, 104, 14, Math.PI, 0);
    ctx.fill();
  });
}

function welcomeTexture() {
  const family = labelFontFamily();
  return canvasTexture(1024, 560, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 1024, 560);
    g.addColorStop(0, "#5ED3C9");
    g.addColorStop(1, "#FF8FB1");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(8, 8, 1008, 544, 56);
    ctx.fill();
    ctx.lineWidth = 14;
    ctx.strokeStyle = "#FFF8F0";
    ctx.stroke();
    // Sol y palmera estilo postal.
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    ctx.arc(860, 150, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#24123F";
    ctx.fillRect(842, 150, 12, 230);
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.translate(848, 150);
      ctx.rotate(-Math.PI / 2 + (i - 2.5) * 0.55);
      ctx.beginPath();
      ctx.ellipse(70, 0, 72, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Naranja de Florida.
    ctx.fillStyle = "#FF8A1F";
    ctx.beginPath();
    ctx.arc(900, 440, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2F8F5B";
    ctx.beginPath();
    ctx.ellipse(915, 392, 22, 10, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#24123F";
    ctx.textBaseline = "alphabetic";
    ctx.font = `800 54px ${family}`;
    ctx.fillText("WELCOME TO", 70, 150);
    ctx.font = `900 108px ${family}`;
    ctx.fillText("KUN University", 64, 270);
    ctx.fillText("AI", 64, 380);
    ctx.font = `800 58px ${family}`;
    ctx.fillStyle = "#FFF8F0";
    ctx.fillText("FLORIDA · USA", 70, 480);
  });
}

// ---------------------------------------------------------------- piezas

function WavingFlag({ x, z, kind }: { x: number; z: number; kind: "us" | "fl" }) {
  const cloth = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => (typeof document === "undefined" ? null : kind === "us" ? usFlagTexture() : floridaFlagTexture()), [kind]);
  useEffect(() => () => texture?.dispose(), [texture]);
  const W = 3.4;
  const H = kind === "us" ? 1.8 : 2.2;

  // Ondea como tela: la onda crece hacia el borde libre.
  useFrame((state) => {
    const mesh = cloth.current;
    if (!mesh) return;
    const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const u = (px + W / 2) / W;
      pos.setZ(i, Math.sin(px * 2.4 - t * 4 + pos.getY(i) * 0.6) * 0.22 * u);
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  });

  return (
    <group position={[x, 0.2, z]}>
      <mesh position={[0, 4.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.11, 9.2, 8]} />
        <meshStandardMaterial color="#E9E6EF" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 9.3, 0]}>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshStandardMaterial color="#F2C14E" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh ref={cloth} position={[W / 2 + 0.08, 9.1 - H / 2, 0]} castShadow>
        <planeGeometry args={[W, H, 20, 8]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
    </group>
  );
}

function WelcomeSign() {
  const fontsReady = useFontsReady();
  // fontsReady fuerza a redibujar con la tipografía definitiva.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const texture = useMemo(() => (typeof document === "undefined" ? null : welcomeTexture()), [fontsReady]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return (
    <group position={[SIGN.x, 0.2, SIGN.z]} rotation={[0, SIGN.rot, 0]}>
      {[-1.9, 1.9].map((px) => (
        <mesh key={px} position={[px, 1.6, -0.1]} castShadow>
          <boxGeometry args={[0.28, 3.2, 0.28]} />
          <meshStandardMaterial color="#FFF8F0" flatShading />
        </mesh>
      ))}
      <mesh position={[0, 3.6, 0]} castShadow>
        <boxGeometry args={[5.2, 2.85, 0.18]} />
        <meshStandardMaterial color="#FFF8F0" flatShading />
      </mesh>
      <mesh position={[0, 3.6, 0.1]}>
        <planeGeometry args={[5, 2.73]} />
        <meshStandardMaterial map={texture} roughness={0.7} />
      </mesh>
    </group>
  );
}

function LifeguardTower({ x, z, color, a }: { x: number; z: number; color: string; a: number }) {
  // Mira hacia el mar (afuera de la isla).
  const rot = Math.atan2(Math.cos(a), Math.sin(a));
  return (
    <group position={[x, 0.05, z]} rotation={[0, rot, 0]}>
      {[
        [-0.9, -0.7],
        [0.9, -0.7],
        [-0.9, 0.7],
        [0.9, 0.7],
      ].map(([lx, lz]) => (
        <mesh key={`${lx}${lz}`} position={[lx, 1.2, lz]} castShadow>
          <boxGeometry args={[0.18, 2.4, 0.18]} />
          <meshStandardMaterial color="#FFF8F0" flatShading />
        </mesh>
      ))}
      <mesh position={[0, 2.45, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.15, 2.6]} />
        <meshStandardMaterial color="#F7E3C9" flatShading />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[2.3, 1.95, 1.7]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      {/* Franjas de colores estilo Miami Beach */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 2.85 + i * 0.32, 0.86]}>
          <boxGeometry args={[2.32, 0.12, 0.02]} />
          <meshStandardMaterial color={["#FFF8F0", "#24123F", "#FFF8F0"][i]} />
        </mesh>
      ))}
      <mesh position={[0, 3.7, 0.87]}>
        <planeGeometry args={[1.2, 0.7]} />
        <meshStandardMaterial color="#2A1758" />
      </mesh>
      <mesh position={[0, 4.75, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.85, 0.8, 4]} />
        <meshStandardMaterial color="#FFF8F0" flatShading />
      </mesh>
      {/* Rampa */}
      <mesh position={[0, 1.2, -2]} rotation={[0.62, 0, 0]} castShadow>
        <boxGeometry args={[1, 0.1, 3]} />
        <meshStandardMaterial color="#F7E3C9" flatShading />
      </mesh>
      {/* Bandera de salvavidas */}
      <mesh position={[1.2, 5.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2, 6]} />
        <meshStandardMaterial color="#FFF8F0" />
      </mesh>
      <mesh position={[1.55, 6.3, 0]}>
        <planeGeometry args={[0.7, 0.45]} />
        <meshStandardMaterial color="#E63946" side={THREE.DoubleSide} />
      </mesh>
      {/* Sombrilla y toalla al lado */}
      <group position={[3.2, 0, 1.2]}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2.4, 6]} />
          <meshStandardMaterial color="#FFF8F0" />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[0, 2.35, 0]} rotation={[0, (i / 8) * Math.PI * 2, 0]}>
            <coneGeometry args={[1.5, 0.55, 3, 1, true, 0, (Math.PI * 2) / 8]} />
            <meshStandardMaterial color={i % 2 ? "#FFF8F0" : color} side={THREE.DoubleSide} flatShading />
          </mesh>
        ))}
        <mesh position={[0.4, 0.06, 1.2]} rotation={[-Math.PI / 2, 0, 0.3]} receiveShadow>
          <planeGeometry args={[0.9, 1.9]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
}

function Flamingo({ x, z, rot, phase }: { x: number; z: number; rot: number; phase: number }) {
  const neck = useRef<THREE.Group>(null);
  useFrame((state) => {
    const n = neck.current;
    // Baja la cabeza de vez en cuando, como si picoteara.
    if (n) n.rotation.x = Math.max(0, Math.sin(state.clock.elapsedTime * 0.7 + phase)) * 1.1;
  });
  const pink = "#FF7FA8";
  return (
    <group position={[x, 0.2, z]} rotation={[0, rot, 0]}>
      <mesh position={[0.08, 0.8, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1.6, 5]} />
        <meshStandardMaterial color="#E85D8A" />
      </mesh>
      {/* La otra pata recogida, la pose clásica */}
      <mesh position={[-0.08, 1.15, 0.12]} rotation={[0.9, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.7, 5]} />
        <meshStandardMaterial color="#E85D8A" />
      </mesh>
      <mesh position={[0, 1.85, 0]} scale={[0.5, 0.42, 0.8]} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color={pink} roughness={0.7} flatShading />
      </mesh>
      <mesh position={[0, 1.95, -0.7]} rotation={[-0.9, 0, 0]}>
        <coneGeometry args={[0.22, 0.6, 6]} />
        <meshStandardMaterial color="#E85D8A" flatShading />
      </mesh>
      <group ref={neck} position={[0, 2.05, 0.55]}>
        <mesh position={[0, 0.45, 0.1]} rotation={[0.25, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.95, 6]} />
          <meshStandardMaterial color={pink} flatShading />
        </mesh>
        <mesh position={[0, 0.95, 0.05]} rotation={[-0.35, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.5, 6]} />
          <meshStandardMaterial color={pink} flatShading />
        </mesh>
        <mesh position={[0, 1.22, 0.12]}>
          <sphereGeometry args={[0.17, 10, 8]} />
          <meshStandardMaterial color={pink} flatShading />
        </mesh>
        <mesh position={[0, 1.14, 0.36]} rotation={[1.9, 0, 0]}>
          <coneGeometry args={[0.07, 0.3, 6]} />
          <meshStandardMaterial color="#24123F" />
        </mesh>
      </group>
    </group>
  );
}

function OrangeTree({ x, z }: { x: number; z: number }) {
  const fruits = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const a = i * 2.4;
        const y = 2.4 + Math.sin(i * 1.7) * 0.6;
        return [Math.cos(a) * 1.25, y, Math.sin(a) * 1.25] as [number, number, number];
      }),
    [],
  );
  return (
    <group position={[x, 0.2, z]}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.26, 1.6, 6]} />
        <meshStandardMaterial color="#7A5434" flatShading />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <icosahedronGeometry args={[1.45, 1]} />
        <meshStandardMaterial color="#2F8F5B" flatShading />
      </mesh>
      {fruits.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshStandardMaterial color="#FF8A1F" roughness={0.5} emissive="#FF6A00" emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function StreetLamp({ x, z, sky }: { x: number; z: number; sky: SkyPreset }) {
  const bulb = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = bulb.current?.material as THREE.MeshBasicMaterial | undefined;
    // Encendidos de noche (más brillo que 1.0 para el bloom), apagados de día.
    if (m) m.color.setRGB(1, 0.78, 0.45).multiplyScalar(0.6 + sky.night * 2.6 + (1 - sky.day) * 0.6);
  });
  return (
    <group position={[x, 0.2, z]}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 3.2, 6]} />
        <meshStandardMaterial color="#2A1758" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh ref={bulb} position={[0, 3.35, 0]}>
        <sphereGeometry args={[0.26, 12, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.62, 0]}>
        <coneGeometry args={[0.32, 0.22, 8]} />
        <meshStandardMaterial color="#2A1758" />
      </mesh>
    </group>
  );
}

export function FloridaDecor({ sky }: { sky: SkyPreset }) {
  return (
    <group>
      {FLAGS.map((f) => (
        <WavingFlag key={f.kind} x={f.x} z={f.z} kind={f.kind} />
      ))}
      <WelcomeSign />
      {LIFEGUARDS.map((l, i) => (
        <LifeguardTower key={i} x={l.x} z={l.z} color={l.color} a={l.a} />
      ))}
      {FLAMINGOS.map((f, i) => (
        <Flamingo key={i} x={f.x} z={f.z} rot={f.rot} phase={i * 1.7} />
      ))}
      {ORANGE_TREES.map((o, i) => (
        <OrangeTree key={i} x={o.x} z={o.z} />
      ))}
      {LAMPS.map((l, i) => (
        <StreetLamp key={i} x={l.x} z={l.z} sky={sky} />
      ))}
    </group>
  );
}
