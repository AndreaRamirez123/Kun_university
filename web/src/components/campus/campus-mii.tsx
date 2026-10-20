"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Avatar } from "./campus-avatar";

// Personaje al estilo Mii hecho con primitivas. La cara es una textura de canvas
// sobre la cabeza (como las piezas 2D de un Mii) y el resto son mallas simples.
// Medidas en unidades del campus: de pies a coronilla mide ~3, igual que el
// resto de la escala de la isla.

type GroupRef = React.RefObject<THREE.Group | null>;

/** Articulaciones que anima quien use el personaje (el jugador o la vista previa). */
export type MiiRigProps = { legLRef?: GroupRef; legRRef?: GroupRef; armLRef?: GroupRef; armRRef?: GroupRef; headRef?: GroupRef };

const R = 0.62; // radio de la cabeza
const PANTS = "#2A2F4A";

function shade(hex: string, k: number) {
  return `#${new THREE.Color(hex).multiplyScalar(k).getHexString()}`;
}

// ---------------------------------------------------------------- cara (textura)

// La textura envuelve la esfera: el frente de la cabeza cae en x = W/4 y el
// ecuador en y = H/2. Cerca del centro la distorsión es mínima, así que las
// piezas se dibujan casi como en papel.
const W = 1024;
const H = 512;
const CX = W / 4;
const EYE_Y = 236;
const EYE_DX = 54;

function drawFace(ctx: CanvasRenderingContext2D, a: Avatar) {
  const dark = "#2B1A12";
  ctx.fillStyle = a.skin;
  ctx.fillRect(0, 0, W, H);

  // Barba: cubre la parte baja de la cara antes de dibujar la boca encima.
  if (a.facialHair === "beard") {
    ctx.fillStyle = a.hairColor;
    ctx.beginPath();
    ctx.moveTo(CX - 112, 262);
    ctx.quadraticCurveTo(CX - 110, 392, CX, 400);
    ctx.quadraticCurveTo(CX + 110, 392, CX + 112, 262);
    ctx.quadraticCurveTo(CX + 70, 300, CX, 300);
    ctx.quadraticCurveTo(CX - 70, 300, CX - 112, 262);
    ctx.fill();
  }

  // Rubor.
  ctx.fillStyle = "rgba(240,110,110,0.28)";
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(CX + s * 82, 290, 24, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ojos.
  for (const s of [-1, 1]) {
    const x = CX + s * EYE_DX;
    ctx.save();
    if (a.eyes === "round") {
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(x, EYE_Y, 13, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (a.eyes === "almond") {
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(x, EYE_Y, 19, 11, s * -0.12, 0, Math.PI * 2);
      ctx.fill();
    } else if (a.eyes === "happy") {
      ctx.strokeStyle = dark;
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(x, EYE_Y + 8, 15, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(x, EYE_Y, 21, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(x + s * 2, EYE_Y + 3, 14, 0, Math.PI * 2);
      ctx.fill();
    }
    if (a.eyes !== "happy") {
      // Brillo, el detalle que les da vida.
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(x + 4, EYE_Y - 6, a.eyes === "big" ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Pestañas.
    if (a.gender === "female" && a.eyes !== "happy") {
      ctx.strokeStyle = dark;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      const top = EYE_Y - (a.eyes === "almond" ? 10 : a.eyes === "big" ? 24 : 17);
      ctx.beginPath();
      ctx.moveTo(x + s * 12, top + 2);
      ctx.lineTo(x + s * 22, top - 6);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Cejas, del color del pelo.
  ctx.strokeStyle = shade(a.hairColor, 0.85);
  ctx.lineCap = "round";
  ctx.lineWidth = a.brows === "straight" ? 9 : 7;
  for (const s of [-1, 1]) {
    const x = CX + s * EYE_DX;
    const y = EYE_Y - 40;
    ctx.beginPath();
    if (a.brows === "straight") {
      ctx.moveTo(x - 18, y + 2);
      ctx.lineTo(x + 18, y + 2);
    } else if (a.brows === "arched") {
      ctx.moveTo(x - 20, y + 6);
      ctx.quadraticCurveTo(x, y - 14, x + 20, y + 6);
    } else {
      ctx.moveTo(x - 18, y + 3);
      ctx.quadraticCurveTo(x, y - 6, x + 18, y + 3);
    }
    ctx.stroke();
  }

  // Nariz.
  ctx.fillStyle = shade(a.skin, 0.82);
  ctx.strokeStyle = shade(a.skin, 0.7);
  ctx.lineWidth = 5;
  ctx.beginPath();
  if (a.nose === "small") {
    ctx.arc(CX, 272, 9, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  } else if (a.nose === "round") {
    ctx.ellipse(CX, 272, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.ellipse(CX, 274, 20, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bigote.
  if (a.facialHair === "mustache" || a.facialHair === "beard") {
    ctx.fillStyle = a.hairColor;
    ctx.beginPath();
    ctx.ellipse(CX - 22, 296, 24, 9, -0.25, 0, Math.PI * 2);
    ctx.ellipse(CX + 22, 296, 24, 9, 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  // Boca.
  const my = 318;
  ctx.strokeStyle = "#7A2E2E";
  ctx.fillStyle = "#7A2E2E";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (a.mouth === "smile") {
    ctx.arc(CX, my - 12, 24, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else if (a.mouth === "grin") {
    ctx.moveTo(CX - 28, my - 6);
    ctx.quadraticCurveTo(CX, my + 34, CX + 28, my - 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(CX - 20, my - 6, 40, 7);
  } else if (a.mouth === "neutral") {
    ctx.moveTo(CX - 18, my);
    ctx.lineTo(CX + 18, my);
    ctx.stroke();
  } else {
    ctx.ellipse(CX, my + 2, 12, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function useFaceTexture(a: Avatar) {
  const { skin, hairColor, eyes, brows, nose, mouth, facialHair, gender } = a;
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    drawFace(ctx, { skin, hairColor, eyes, brows, nose, mouth, facialHair, gender } as Avatar);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [skin, hairColor, eyes, brows, nose, mouth, facialHair, gender]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

// ---------------------------------------------------------------- piezas

function Std({ color, rough = 0.75, emissive }: { color: string; rough?: number; emissive?: string }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={rough}
      emissive={emissive ?? "#000000"}
      emissiveIntensity={emissive ? 0.5 : 0}
    />
  );
}

/** Casquete esférico: base de casi todos los peinados y de la gorra. */
function Cap({ radius, theta, tilt, color, y = 0, z = 0 }: { radius: number; theta: number; tilt: number; color: string; y?: number; z?: number }) {
  return (
    <mesh position={[0, y, z]} rotation={[tilt, 0, 0]} castShadow>
      <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, theta]} />
      {/* Doble cara: desde abajo o de canto no se transparenta */}
      <meshStandardMaterial color={color} roughness={0.85} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Peinados al estilo Roblox: un "casco" de pelo cubre coronilla, lados y nuca
// (así de espaldas nunca se ve calvo) y cada estilo suma su volumen encima.
// La cara mira a +z (phi = π/2 en la esfera); FACE deja libre la cara y las orejas.
const FACE = 0.8;
/** Alrededor de la cabeza, sin la cara. */
const AROUND: [number, number] = [Math.PI / 2 + FACE, Math.PI * 2 - FACE * 2];
/** Solo la parte de atrás (sin tapar las orejas). */
const BACK: [number, number] = [Math.PI + 0.32, Math.PI - 0.64];
/** Solo el frente (flequillo). */
const FRONT: [number, number] = [Math.PI / 2 - 0.95, 1.9];

function Shell({ r, phi = [0, Math.PI * 2], theta, color, scale }: { r: number; phi?: [number, number]; theta: [number, number]; color: string; scale?: [number, number, number] }) {
  return (
    <mesh castShadow scale={scale}>
      <sphereGeometry args={[r, 40, 24, phi[0], phi[1], theta[0], theta[1]]} />
      <meshStandardMaterial color={color} roughness={0.85} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Blob({ p, r, c, s }: { p: [number, number, number]; r: number; c: string; s?: [number, number, number] }) {
  return (
    <mesh position={p} scale={s} castShadow>
      <sphereGeometry args={[r, 14, 10]} />
      <Std color={c} rough={0.9} />
    </mesh>
  );
}

/** Base de todos los peinados: coronilla y nuca cubiertas. */
function Helmet({ c, r = 1.06, nape = 1.78 }: { c: string; r?: number; nape?: number }) {
  return (
    <>
      <Shell r={R * r} theta={[0, 1.12]} color={c} />
      <Shell r={R * (r - 0.005)} phi={BACK} theta={[1.0, nape - 1.0]} color={c} />
    </>
  );
}

/** Punto en la superficie de la cabeza (theta desde la coronilla, phi alrededor). */
function onHead(theta: number, phi: number, r: number): [number, number, number] {
  return [-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta)];
}

/** Pelo largo de atrás: cae hasta los hombros. */
function BackFall({ c, len = 0.95, wavy = false }: { c: string; len?: number; wavy?: boolean }) {
  return (
    <>
      <mesh position={[0, -R * 0.62, -R * 0.5]} scale={[1.22, 1, 0.52]} castShadow>
        <capsuleGeometry args={[0.5, len, 6, 18]} />
        <Std color={c} rough={0.85} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * R * 0.9, -R * 0.55, R * 0.08]} rotation={[0.12, 0, s * 0.06]} castShadow>
          <capsuleGeometry args={[0.15, len * 0.95, 6, 10]} />
          <Std color={c} rough={0.85} />
        </mesh>
      ))}
      {wavy &&
        [-0.42, -0.14, 0.14, 0.42].map((x, i) => <Blob key={i} p={[x, -R * 0.62 - len * 0.62, -R * 0.42]} r={0.17} c={c} />)}
      {wavy && [-1, 1].map((s) => <Blob key={s} p={[s * R * 0.92, -R * 0.55 - len * 0.55, R * 0.1]} r={0.15} c={c} />)}
    </>
  );
}

function Hair({ a }: { a: Avatar }) {
  const c = a.hairColor;
  const male = a.gender === "male";
  // Un "corto" de mujer es un pixie, no un corte rapado.
  const style = a.hairStyle === "short" && a.gender === "female" ? "pixie" : a.hairStyle;
  switch (style) {
    case "bald":
      return null;
    case "buzz":
      return <Helmet c={c} r={1.025} nape={1.72} />;
    case "short":
      return (
        <>
          <Helmet c={c} r={1.05} />
          {/* Volumen arriba y flequillo corto */}
          <Blob p={[0, R * 0.72, -R * 0.05]} r={R * 0.9} c={c} s={[1, 0.42, 1]} />
          <Blob p={[0.14, R * 0.66, R * 0.6]} r={0.22} c={c} s={[1.5, 0.5, 0.7]} />
        </>
      );
    case "quiff":
      return (
        <>
          <Helmet c={c} r={1.045} />
          <mesh position={[0, R * 0.98, R * 0.32]} rotation={[-0.55, 0, 0]} scale={[1.15, 0.6, 0.95]} castShadow>
            <sphereGeometry args={[0.32, 16, 12]} />
            <Std color={c} rough={0.85} />
          </mesh>
        </>
      );
    case "spiky":
      return (
        <>
          <Helmet c={c} r={1.045} />
          {[
            [0, 0.2],
            [0.55, 0.45],
            [-0.55, 0.45],
            [0.3, -0.3],
            [-0.3, -0.3],
            [0, 0.75],
            [0, -0.75],
          ].map(([x, z], i) => {
            const p = onHead(0.35 + Math.hypot(x, z) * 0.45, Math.atan2(z, -x), R * 1.0);
            return (
              <mesh key={i} position={p} rotation={[z * 0.6, 0, -x * 0.6]} castShadow>
                <coneGeometry args={[0.13, 0.42, 6]} />
                <Std color={c} rough={0.85} />
              </mesh>
            );
          })}
        </>
      );
    case "manbun":
      return (
        <>
          <Helmet c={c} r={1.05} />
          <Blob p={[0, R * 0.62, -R * 0.98]} r={0.22} c={c} />
          <mesh position={[0, R * 0.62, -R * 0.84]} rotation={[0.3, 0, 0]}>
            <torusGeometry args={[0.12, 0.04, 6, 14]} />
            <Std color="#24123F" />
          </mesh>
        </>
      );
    case "dreads":
      return (
        <>
          <Helmet c={c} r={1.06} />
          {Array.from({ length: 11 }, (_, i) => {
            const phi = AROUND[0] + 0.2 + (i / 10) * (AROUND[1] - 0.4);
            const [x, , z] = onHead(1.4, phi, R * 1.0);
            return (
              <mesh key={i} position={[x, -R * 0.28, z]} rotation={[z * 0.15, 0, -x * 0.15]} castShadow>
                <capsuleGeometry args={[0.075, 0.62, 4, 8]} />
                <Std color={c} rough={0.95} />
              </mesh>
            );
          })}
        </>
      );
    case "curly":
      if (male)
        return (
          <>
            <Helmet c={c} r={1.05} />
            {Array.from({ length: 14 }, (_, i) => {
              const ring = i < 6 ? 0.35 : 0.85;
              const k = i < 6 ? i / 6 : (i - 6) / 8;
              return <Blob key={i} p={onHead(ring, k * Math.PI * 2 + ring, R * 1.04)} r={0.19} c={c} />;
            })}
          </>
        );
      // Rizos largos: bucles por toda la cabeza hasta los hombros.
      return (
        <>
          <Helmet c={c} r={1.08} nape={2.0} />
          {Array.from({ length: 34 }, (_, i) => {
            const row = Math.floor(i / 9);
            const k = (i % 9) / 8;
            const theta = 0.45 + row * 0.5;
            const span = row === 0 ? [0, Math.PI * 2] : AROUND;
            const p = onHead(Math.min(theta, 2.1), span[0] + k * span[1], R * 1.08);
            if (row === 3) p[1] -= 0.25;
            return <Blob key={i} p={p} r={0.21} c={c} />;
          })}
        </>
      );
    case "long":
      return (
        <>
          <Helmet c={c} r={1.07} />
          <Shell r={R * 1.075} phi={AROUND} theta={[0.9, 1.25]} color={c} />
          <BackFall c={c} />
        </>
      );
    case "wavy":
      return (
        <>
          <Helmet c={c} r={1.08} />
          <Shell r={R * 1.09} phi={AROUND} theta={[0.9, 1.25]} color={c} scale={[1.04, 1, 1.02]} />
          <BackFall c={c} wavy />
        </>
      );
    case "bob":
      return (
        <>
          <Helmet c={c} r={1.1} />
          {/* Melena a la altura de la mandíbula y flequillo */}
          <Shell r={R * 1.12} phi={AROUND} theta={[0.85, 1.25]} color={c} scale={[1.05, 1, 1.02]} />
          <Shell r={R * 1.1} phi={FRONT} theta={[0.3, 0.8]} color={c} />
        </>
      );
    case "pixie":
      return (
        <>
          <Helmet c={c} r={1.07} nape={1.95} />
          {/* Corto femenino: tapa las orejas, nuca larga y flequillo de lado */}
          <Shell r={R * 1.08} phi={AROUND} theta={[0.9, 0.78]} color={c} />
          <mesh position={[0.12, R * 0.6, R * 0.66]} rotation={[0.55, 0, -0.6]} scale={[2.0, 0.6, 0.8]} castShadow>
            <sphereGeometry args={[0.22, 16, 10]} />
            <Std color={c} rough={0.85} />
          </mesh>
          <Blob p={[0, R * 0.78, -R * 0.15]} r={R * 0.85} c={c} s={[1, 0.38, 1]} />
          {[-1, 1].map((s) => (
            <Blob key={s} p={[s * R * 0.9, R * 0.05, R * 0.18]} r={0.11} c={c} s={[0.7, 1.6, 0.9]} />
          ))}
        </>
      );
    case "ponytail":
      return (
        <>
          <Helmet c={c} r={1.06} />
          <mesh position={[0, R * 0.05, -R * 1.18]} rotation={[0.3, 0, 0]} castShadow>
            <capsuleGeometry args={[0.18, 0.9, 6, 12]} />
            <Std color={c} rough={0.85} />
          </mesh>
          <mesh position={[0, R * 0.58, -R * 0.98]} rotation={[0.9, 0, 0]}>
            <torusGeometry args={[0.13, 0.05, 6, 16]} />
            <Std color="#FFC85C" />
          </mesh>
        </>
      );
    case "bun":
      return (
        <>
          <Helmet c={c} r={1.06} />
          <Blob p={[0, R * 1.02, -R * 0.36]} r={0.32} c={c} />
          <mesh position={[0, R * 0.86, -R * 0.3]} rotation={[-0.3, 0, 0]}>
            <torusGeometry args={[0.2, 0.05, 6, 18]} />
            <Std color="#FFC85C" />
          </mesh>
        </>
      );
    case "braids":
      return (
        <>
          <Helmet c={c} r={1.07} />
          {[-1, 1].map((s) => (
            <group key={s}>
              {Array.from({ length: 6 }, (_, i) => (
                <Blob key={i} p={[s * (R * 0.82 + i * 0.012), -R * 0.15 - i * 0.2, R * 0.05 + i * 0.05]} r={0.13 - i * 0.008} c={c} s={[1, 1.15, 1]} />
              ))}
              <mesh position={[s * (R * 0.82 + 0.08), -R * 0.15 - 6 * 0.2 + 0.05, R * 0.05 + 0.3]}>
                <sphereGeometry args={[0.07, 8, 6]} />
                <Std color="#E8735A" />
              </mesh>
            </group>
          ))}
        </>
      );
    case "puffs":
      return (
        <>
          <Helmet c={c} r={1.06} />
          {[-1, 1].map((s) => (
            <Blob key={s} p={[s * R * 0.66, R * 0.86, -R * 0.12]} r={0.34} c={c} />
          ))}
        </>
      );
    case "afro":
      return (
        <>
          <Helmet c={c} r={1.07} />
          {/* Volumen del afro: esfera grande hacia arriba y atrás, sin tapar la cara */}
          <mesh position={[0, R * 0.5, -R * 0.42]} castShadow>
            <sphereGeometry args={[R * 1.3, 24, 18]} />
            <Std color={c} rough={0.95} />
          </mesh>
        </>
      );
  }
}

function GlassesMesh({ kind }: { kind: Avatar["glasses"] }) {
  if (kind === "none") return null;
  const y = 0.09;
  const z = R * 0.99;
  const frame = kind === "sun" ? "#141018" : "#24123F";
  const ring =
    kind === "square" ? (
      <torusGeometry args={[0.15, 0.026, 6, 4]} />
    ) : (
      <torusGeometry args={[0.135, 0.024, 8, 24]} />
    );
  return (
    <group position={[0, y, z]}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.21, 0, 0]} rotation={[0, s * 0.28, kind === "square" ? Math.PI / 4 : 0]}>
          <mesh>{ring}<Std color={frame} rough={0.35} /></mesh>
          {kind === "sun" && (
            <mesh>
              <circleGeometry args={[0.13, 20]} />
              <meshStandardMaterial color="#1A1A24" roughness={0.1} metalness={0.4} transparent opacity={0.88} />
            </mesh>
          )}
        </group>
      ))}
      <mesh position={[0, 0.02, 0.02]}>
        <boxGeometry args={[0.13, 0.025, 0.025]} />
        <Std color={frame} />
      </mesh>
    </group>
  );
}

/** Peinados con volumen: los sombreros crecen y suben para no hundirse en el pelo. */
const BIG_HAIR: Avatar["hairStyle"][] = ["afro", "curly", "puffs", "spiky", "quiff", "bun"];

function HeadAccessory({ a }: { a: Avatar }) {
  if (a.accessory === "cap") {
    // Con peinados voluminosos la gorra crece y sube para no hundirse en el pelo.
    const big = BIG_HAIR.includes(a.hairStyle);
    return (
      <group position={[0, big ? R * 0.32 : 0, big ? -R * 0.08 : 0]} scale={big ? 1.25 : 1}>
        <Cap radius={R * 1.1} theta={1.12} tilt={-0.12} color={a.outfit} />
        <mesh position={[0, R * 0.42, R * 0.78]} rotation={[0.28, 0, 0]} scale={[1, 1, 1.25]} castShadow>
          <cylinderGeometry args={[R * 0.62, R * 0.62, 0.05, 24, 1, false, -Math.PI / 2, Math.PI]} />
          <Std color={a.outfit} />
        </mesh>
        <mesh position={[0, R * 0.78, R * 0.66]} rotation={[-0.75, 0, 0]}>
          <circleGeometry args={[0.13, 20]} />
          <Std color="#FFC85C" emissive="#FF9A3C" />
        </mesh>
      </group>
    );
  }
  if (a.accessory === "gradcap") {
    // Birrete de graduación de KUN (como el de Krucn).
    const big = BIG_HAIR.includes(a.hairStyle);
    return (
      <group position={[0, big ? R * 0.3 : 0, 0]} scale={big ? 1.2 : 1}>
        <Cap radius={R * 1.08} theta={0.95} tilt={-0.05} color="#14306E" />
        <mesh position={[0, R * 1.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <boxGeometry args={[R * 1.75, 0.07, R * 1.75]} />
          <Std color="#14306E" rough={0.5} />
        </mesh>
        <mesh position={[0, R * 1.05, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.06, 12]} />
          <Std color="#FFC85C" emissive="#C98A1E" />
        </mesh>
        <mesh position={[R * 0.7, R * 0.72, R * 0.35]}>
          <cylinderGeometry args={[0.035, 0.035, 0.5, 6]} />
          <Std color="#FFC85C" emissive="#C98A1E" />
        </mesh>
      </group>
    );
  }
  if (a.accessory === "sunhat") {
    // Sombrero de paja de ala ancha, con cinta roja.
    return (
      <group position={[0, R * 0.62, 0]} rotation={[-0.08, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[R * 1.75, R * 1.85, 0.06, 32]} />
          <Std color="#E8C77A" rough={0.9} />
        </mesh>
        <mesh position={[0, R * 0.32, 0]} castShadow>
          <cylinderGeometry args={[R * 0.78, R * 0.9, R * 0.62, 24]} />
          <Std color="#E8C77A" rough={0.9} />
        </mesh>
        <mesh position={[0, R * 0.1, 0]}>
          <cylinderGeometry args={[R * 0.91, R * 0.92, R * 0.18, 24]} />
          <Std color="#C8102E" />
        </mesh>
      </group>
    );
  }
  if (a.accessory === "crown") {
    // Corona dorada con picos y gemas.
    return (
      <group position={[0, R * 0.86, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[R * 0.62, R * 0.58, R * 0.34, 20, 1, true]} />
          <meshStandardMaterial color="#F2C14E" metalness={0.8} roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => {
          const ang = (i / 6) * Math.PI * 2;
          return (
            <group key={i}>
              <mesh position={[Math.sin(ang) * R * 0.6, R * 0.3, Math.cos(ang) * R * 0.6]}>
                <coneGeometry args={[0.09, 0.24, 4]} />
                <meshStandardMaterial color="#F2C14E" metalness={0.8} roughness={0.25} />
              </mesh>
              <mesh position={[Math.sin(ang) * R * 0.63, 0, Math.cos(ang) * R * 0.63]}>
                <sphereGeometry args={[0.045, 8, 6]} />
                <Std color={i % 2 ? "#C8102E" : "#3D6FD9"} emissive={i % 2 ? "#7A0A1C" : "#1E3A7A"} />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }
  if (a.accessory === "headphones") {
    return (
      <group>
        <mesh>
          <torusGeometry args={[R * 1.1, 0.05, 8, 32, Math.PI]} />
          <Std color="#24123F" rough={0.4} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * R * 1.02, -0.02, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 0.16, 20]} />
              <Std color="#24123F" rough={0.4} />
            </mesh>
            <mesh position={[s * 0.085, 0, 0]} rotation={[0, s * Math.PI / 2, 0]}>
              <ringGeometry args={[0.12, 0.17, 20]} />
              <Std color={a.outfit} emissive={a.outfit} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }
  return null;
}

// ---------------------------------------------------------------- extremidades

function Leg({
  side,
  groupRef,
  b,
  hipY,
  legLen,
  legR,
  outfit,
}: {
  side: number;
  groupRef?: GroupRef;
  b: number;
  hipY: number;
  legLen: number;
  legR: number;
  outfit: string;
}) {
  return (
    <group ref={groupRef} position={[side * 0.2 * b, hipY, 0]}>
      <mesh position={[0, -(legLen - 0.06) / 2, 0]} castShadow>
        <capsuleGeometry args={[legR, legLen - 0.06 - legR * 2, 6, 12]} />
        <Std color={PANTS} />
      </mesh>
      {/* Zapatilla */}
      <mesh position={[0, -legLen + 0.02, 0.07]} scale={[1, 0.62, 1.45]} castShadow>
        <sphereGeometry args={[0.17, 16, 10]} />
        <Std color="#F7F3EE" rough={0.5} />
      </mesh>
      <mesh position={[0, -legLen - 0.06, 0.07]} scale={[1.05, 0.22, 1.5]}>
        <sphereGeometry args={[0.17, 16, 8]} />
        <Std color={outfit} />
      </mesh>
    </group>
  );
}

function Arm({
  side,
  groupRef,
  x,
  y,
  armLen,
  sleeves,
  a,
}: {
  side: number;
  groupRef?: GroupRef;
  x: number;
  y: number;
  armLen: number;
  sleeves: boolean;
  a: Avatar;
}) {
  return (
    <group ref={groupRef} position={[side * x, y, 0]}>
      <mesh position={[0, -armLen / 2 + 0.04, 0]} castShadow>
        <capsuleGeometry args={[0.115, armLen - 0.23, 6, 10]} />
        <Std color={sleeves ? a.outfit : a.skin} />
      </mesh>
      {!sleeves && (
        <mesh position={[0, -0.1, 0]} castShadow>
          <capsuleGeometry args={[0.135, 0.12, 6, 10]} />
          <Std color={a.outfit} />
        </mesh>
      )}
      <mesh position={[0, -armLen + 0.04, 0]} castShadow>
        <sphereGeometry args={[0.13, 14, 10]} />
        <Std color={a.skin} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------- personaje

export function MiiAvatar({ avatar: a, legLRef, legRRef, armLRef, armRRef, headRef }: { avatar: Avatar } & MiiRigProps) {
  const face = useFaceTexture(a);
  const h = a.height;
  const b = a.build;

  // Proporciones Mii: cabeza grande, cuerpo corto y redondeado.
  const legLen = 0.72 * h;
  const hipY = 0.22 + legLen;
  const torsoH = 0.92 * h;
  const torsoTop = hipY + torsoH;
  const torsoR = 0.42 * b;
  const shoulderY = torsoTop - 0.14;
  const armLen = 0.66 * h;
  const headY = torsoTop + R * 0.9;
  const legR = 0.16 * Math.sqrt(b);
  const sleeves = a.top !== "tshirt";
  const topDark = shade(a.outfit, 0.72);

  return (
    <group>
      {/* Piernas (pivote en la cadera) */}
      <Leg side={-1} groupRef={legLRef} b={b} hipY={hipY} legLen={legLen} legR={legR} outfit={a.outfit} />
      <Leg side={1} groupRef={legRRef} b={b} hipY={hipY} legLen={legLen} legR={legR} outfit={a.outfit} />
      {/* Torso */}
      <mesh position={[0, hipY + 0.06, 0]} scale={[1, 0.5, 0.82]} castShadow>
        <sphereGeometry args={[torsoR * 1.05, 20, 12]} />
        <Std color={PANTS} />
      </mesh>
      <mesh position={[0, hipY + torsoH / 2, 0]} scale={[1, 1, 0.82]} castShadow>
        <cylinderGeometry args={[torsoR * 0.92, torsoR * 1.04, torsoH, 24]} />
        <Std color={a.outfit} />
      </mesh>
      <mesh position={[0, torsoTop, 0]} scale={[1, 0.42, 0.82]} castShadow>
        <sphereGeometry args={[torsoR * 0.92, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Std color={a.outfit} />
      </mesh>

      {/* Detalles de cada prenda */}
      {a.top === "tshirt" && (
        <mesh position={[0, torsoTop + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.82, 1]}>
          <torusGeometry args={[0.17, 0.035, 6, 20]} />
          <Std color={topDark} />
        </mesh>
      )}
      {a.top === "hoodie" && (
        <>
          <mesh position={[0, torsoTop - 0.02, -torsoR * 0.5]} rotation={[1.2, 0, 0]} castShadow>
            <torusGeometry args={[0.26, 0.11, 8, 20]} />
            <Std color={topDark} />
          </mesh>
          <mesh position={[0, hipY + torsoH * 0.3, torsoR * 0.82]} scale={[1, 1, 0.3]}>
            <boxGeometry args={[torsoR * 1.1, torsoH * 0.28, 0.1]} />
            <Std color={topDark} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.08, torsoTop - 0.22, torsoR * 0.8]}>
              <cylinderGeometry args={[0.012, 0.012, 0.3, 5]} />
              <Std color="#F7F3EE" />
            </mesh>
          ))}
        </>
      )}
      {a.top === "blazer" && (
        <>
          {/* Camisa blanca en V y solapas */}
          <mesh position={[0, torsoTop - 0.22, torsoR * 0.8]} rotation={[0, 0, Math.PI]}>
            <circleGeometry args={[0.2, 3]} />
            <Std color="#F7F3EE" />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.13, torsoTop - 0.3, torsoR * 0.81]} rotation={[0, 0, s * 0.35]}>
              <boxGeometry args={[0.07, 0.42, 0.02]} />
              <Std color={topDark} />
            </mesh>
          ))}
          {[0, 1].map((i) => (
            <mesh key={i} position={[0, hipY + torsoH * (0.2 + i * 0.2), torsoR * 0.84]}>
              <sphereGeometry args={[0.03, 8, 6]} />
              <Std color="#FFC85C" />
            </mesh>
          ))}
        </>
      )}

      {/* Brazos (pivote en el hombro) */}
      <Arm side={-1} groupRef={armLRef} x={torsoR + 0.1} y={shoulderY} armLen={armLen} sleeves={sleeves} a={a} />
      <Arm side={1} groupRef={armRRef} x={torsoR + 0.1} y={shoulderY} armLen={armLen} sleeves={sleeves} a={a} />
      {/* Mochila */}
      {a.accessory === "backpack" && (
        <group position={[0, hipY + torsoH * 0.55, -torsoR * 0.82 - 0.14]}>
          <mesh castShadow>
            <boxGeometry args={[torsoR * 1.35, torsoH * 0.7, 0.3]} />
            <Std color={a.outfit === "#FFC85C" ? "#E8735A" : "#FFC85C"} />
          </mesh>
          <mesh position={[0, -torsoH * 0.14, -0.17]}>
            <boxGeometry args={[torsoR * 1.0, torsoH * 0.26, 0.08]} />
            <Std color="#24123F" />
          </mesh>
          <mesh position={[0, torsoH * 0.12, -0.155]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[0.1, 18]} />
            <Std color="#E8735A" emissive="#E8735A" />
          </mesh>
        </group>
      )}

      {/* Cuello y cabeza */}
      <mesh position={[0, torsoTop + 0.04, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.16, 12]} />
        <Std color={a.skin} />
      </mesh>
      <group ref={headRef} position={[0, headY, 0]}>
        <group scale={[1, 1.06, 0.96]}>
          <mesh castShadow>
            <sphereGeometry args={[R, 48, 32]} />
            {face ? <meshStandardMaterial map={face} roughness={0.7} /> : <Std color={a.skin} />}
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * R * 0.97, -0.02, 0]} scale={[0.5, 1, 0.7]}>
              <sphereGeometry args={[0.13, 12, 10]} />
              <Std color={a.skin} />
            </mesh>
          ))}
          <Hair a={a} />
          <GlassesMesh kind={a.glasses} />
          <HeadAccessory a={a} />
        </group>
      </group>
    </group>
  );
}

/** Altura de la coronilla, para colocar el letrero con el nombre. */
export function miiHeight(a: Avatar) {
  return 0.22 + 0.72 * a.height + 0.92 * a.height + R * 0.9 + R * 1.06;
}
