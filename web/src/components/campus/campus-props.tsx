"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { campusRuntime } from "./campus-runtime";
import { LETTERS_Z, WALK_RADIUS, type Collider } from "./campus-zones";

// Objetos para jugar, al estilo del portafolio de Bruno Simon: pelotas de playa
// que ruedan cuando las empujas y letras gigantes K·U·N que se tambalean al
// chocarlas (junto a ellas, el escudo del logo). Física simplificada a mano (sin motor) porque solo hay unas pocas
// piezas y así no sumamos otra dependencia pesada.

const PLAYER_RADIUS = 0.6;

const BALLS = [
  { x: 6, z: 28, color: "#FF6B6B" },
  { x: -7, z: 30, color: "#3D6FD9" },
  { x: 20, z: 34, color: "#FFC85C" },
  { x: -26, z: 18, color: "#1E9C7E" },
  { x: 33, z: 6, color: "#C2387A" },
  { x: -9, z: -36, color: "#FF8A4C" },
];
const BALL_RADIUS = 0.9;

export function BeachBalls({ colliders, onBump }: { colliders: Collider[]; onBump?: (strength: number) => void }) {
  const refs = useRef<Array<THREE.Group | null>>([]);
  // Estado de simulación mutable: vive en refs, no en estado de React.
  const sim = useRef({
    bodies: BALLS.map((b) => ({ x: b.x, z: b.z, y: 0, vx: 0, vz: 0, vy: 0, cooldown: 0 })),
    axis: new THREE.Vector3(),
    spin: new THREE.Quaternion(),
  });

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const p = campusRuntime.player;
    const { bodies, axis, spin } = sim.current;
    bodies.forEach((b, i) => {
      b.cooldown = Math.max(0, b.cooldown - delta);
      // Empujón del jugador: hereda su velocidad y sale despedida hacia afuera.
      const dx = b.x - p.x;
      const dz = b.z - p.z;
      const dist = Math.hypot(dx, dz);
      const min = BALL_RADIUS + PLAYER_RADIUS;
      if (dist < min && dist > 0.0001 && b.y < 1.5) {
        const nx = dx / dist;
        const nz = dz / dist;
        b.x = p.x + nx * min;
        b.z = p.z + nz * min;
        const playerSpeed = Math.hypot(p.vx, p.vz);
        const kick = 3 + playerSpeed * 1.1;
        b.vx = nx * kick + p.vx * 0.4;
        b.vz = nz * kick + p.vz * 0.4;
        b.vy = Math.max(b.vy, 2 + playerSpeed * 0.45);
        if (b.cooldown === 0) {
          onBump?.(Math.min(1, playerSpeed / 12));
          b.cooldown = 0.25;
        }
      }
      // Rebote contra edificios, palmeras y el borde de la isla.
      for (const c of colliders) {
        const cx = b.x - c.x;
        const cz = b.z - c.z;
        const cd = Math.hypot(cx, cz);
        const cmin = c.r + BALL_RADIUS;
        if (cd < cmin && cd > 0.0001) {
          const nx = cx / cd;
          const nz = cz / cd;
          b.x = c.x + nx * cmin;
          b.z = c.z + nz * cmin;
          const dot = b.vx * nx + b.vz * nz;
          if (dot < 0) {
            b.vx -= 1.7 * dot * nx;
            b.vz -= 1.7 * dot * nz;
          }
        }
      }
      // Choques entre pelotas.
      for (let j = i + 1; j < bodies.length; j++) {
        const o = bodies[j];
        const ox = o.x - b.x;
        const oz = o.z - b.z;
        const od = Math.hypot(ox, oz);
        if (od < BALL_RADIUS * 2 && od > 0.0001) {
          const nx = ox / od;
          const nz = oz / od;
          const overlap = (BALL_RADIUS * 2 - od) / 2;
          b.x -= nx * overlap;
          b.z -= nz * overlap;
          o.x += nx * overlap;
          o.z += nz * overlap;
          const rel = (o.vx - b.vx) * nx + (o.vz - b.vz) * nz;
          if (rel < 0) {
            b.vx += rel * nx;
            b.vz += rel * nz;
            o.vx -= rel * nx;
            o.vz -= rel * nz;
          }
        }
      }
      const r = Math.hypot(b.x, b.z);
      if (r > WALK_RADIUS) {
        const nx = b.x / r;
        const nz = b.z / r;
        b.x = nx * WALK_RADIUS;
        b.z = nz * WALK_RADIUS;
        const dot = b.vx * nx + b.vz * nz;
        if (dot > 0) {
          b.vx -= 1.6 * dot * nx;
          b.vz -= 1.6 * dot * nz;
        }
      }

      b.vy -= 24 * delta;
      b.y += b.vy * delta;
      if (b.y < 0) {
        b.y = 0;
        b.vy = Math.abs(b.vy) > 2 ? -b.vy * 0.45 : 0;
      }
      const friction = b.y > 0.01 ? 0.995 : Math.exp(-1.4 * delta);
      b.vx *= friction;
      b.vz *= friction;
      b.x += b.vx * delta;
      b.z += b.vz * delta;

      const g = refs.current[i];
      if (!g) return;
      g.position.set(b.x, BALL_RADIUS + 0.2 + b.y, b.z);
      // Rodar: rota sobre el eje perpendicular a la dirección del movimiento.
      const speed = Math.hypot(b.vx, b.vz);
      if (speed > 0.01) {
        axis.set(b.vz, 0, -b.vx).normalize();
        spin.setFromAxisAngle(axis, (speed * delta) / BALL_RADIUS);
        g.quaternion.premultiply(spin);
      }
    });
  });

  return (
    <>
      {BALLS.map((b, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g;
          }}
          position={[b.x, BALL_RADIUS + 0.2, b.z]}
        >
          <BeachBall color={b.color} />
        </group>
      ))}
    </>
  );
}

// Pelota de gajos alternados blanco / color.
function BeachBall({ color }: { color: string }) {
  const segments = 6;
  return (
    <group>
      {Array.from({ length: segments }, (_, i) => (
        <mesh key={i} castShadow>
          <sphereGeometry
            args={[BALL_RADIUS, 6, 12, (i / segments) * Math.PI * 2, (Math.PI * 2) / segments]}
          />
          <meshStandardMaterial color={i % 2 ? "#FFF8F0" : color} roughness={0.45} flatShading />
        </mesh>
      ))}
    </group>
  );
}

// Glifos de K, U y N armados con barras: [ancho, alto, x, y, rotaciónZ].
type Bar = [number, number, number, number, number];
const GLYPHS: Record<string, Bar[]> = {
  K: [
    [0.9, 4, -0.9, 2, 0],
    [0.85, 2.6, 0.35, 2.95, -0.62],
    [0.85, 2.6, 0.35, 1.05, 0.62],
  ],
  U: [
    [0.9, 3.6, -1, 2.2, 0],
    [0.9, 3.6, 1, 2.2, 0],
    [2.9, 0.9, 0, 0.45, 0],
  ],
  N: [
    [0.9, 4, -1.05, 2, 0],
    [0.9, 4, 1.05, 2, 0],
    [0.9, 4.5, 0, 2, 0.5],
  ],
};
// Colores del logo de KUN: azul marino y rojo.
const LOGO_NAVY = "#14306E";
const LOGO_RED = "#C8102E";

const LETTERS = [
  { char: "K", x: -4.6, color: LOGO_NAVY },
  { char: "U", x: 0, color: LOGO_RED },
  { char: "N", x: 4.6, color: LOGO_NAVY },
];

/** El escudo de KUN, de pie junto a la K. */
const SHIELD = { x: -9.4, z: LETTERS_Z + 0.4, rot: 0.28, w: 3.5, h: 4.1 };
const LETTER_RADIUS = 1.5;
const LETTER_COLLIDER_RADIUS = 1.4;

export function KunLetters({ onBump }: { onBump?: (strength: number) => void }) {
  const refs = useRef<Array<THREE.Group | null>>([]);
  // Las letras no se desplazan (son sólidas para el personaje, ver
  // LETTER_COLLIDERS): solo se tambalean al chocarlas y vuelven a quedar de pie.
  const bodies = useRef(
    LETTERS.map(() => ({ tiltX: 0, tiltZ: 0, tiltVX: 0, tiltVZ: 0, cooldown: 0, lastDist: Infinity, fall: null as null | { dir: number; t: number } })),
  );

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const p = campusRuntime.player;
    bodies.current.forEach((b, i) => {
      b.cooldown = Math.max(0, b.cooldown - delta);
      const dx = LETTERS[i].x - p.x;
      const dz = LETTERS_Z - p.z;
      const dist = Math.hypot(dx, dz);
      // Impacto: en el frame en que el personaje llega al borde de la letra,
      // con la velocidad que traía (después el collider lo frena en seco).
      const contact = LETTER_COLLIDER_RADIUS + PLAYER_RADIUS + 0.2;
      const approach = Number.isFinite(b.lastDist) ? (b.lastDist - dist) / Math.max(delta, 0.001) : 0;
      const speed = Math.max(Math.hypot(p.vx, p.vz), approach);
      if (!b.fall && dist < contact && b.lastDist >= contact && dist > 0.0001 && speed > 0.5 && b.cooldown === 0) {
        const nx = dx / dist;
        const nz = dz / dist;
        onBump?.(Math.min(1, speed / 12) * 0.8);
        b.cooldown = 0.35;
        // Con un buen empujón (corriendo o de frente) la letra se cae hacia atrás y
        // después se levanta sola; si es suave, solo se tambalea.
        if (speed > 5.5 && Math.abs(nz) > 0.45) {
          b.fall = { dir: Math.sign(nz), t: 0 };
          b.tiltVX = b.tiltVZ = b.tiltZ = 0;
        } else {
          b.tiltVX += nz * speed * 0.35;
          b.tiltVZ -= nx * speed * 0.35;
        }
      }
      b.lastDist = dist;

      if (b.fall) {
        const f = b.fall;
        const before = f.t;
        f.t += delta;
        const DOWN = 0.55;
        const LIE = 1.6;
        const UP = 1.1;
        let a2: number;
        if (f.t < DOWN) {
          // Cae acelerando, como algo pesado.
          const k = f.t / DOWN;
          a2 = k * k * 1.48;
        } else if (f.t < DOWN + 0.22) {
          // Pequeño rebote al chocar con el suelo.
          const k = (f.t - DOWN) / 0.22;
          a2 = 1.48 - Math.sin(k * Math.PI) * 0.12;
        } else if (f.t < DOWN + LIE) {
          a2 = 1.48;
        } else if (f.t < DOWN + LIE + UP) {
          // Se levanta sola con un movimiento suave.
          const k = (f.t - DOWN - LIE) / UP;
          a2 = 1.48 * (1 - (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2));
        } else {
          a2 = 0;
          b.fall = null;
          // Termina con un tambaleo corto, como quien se acomoda.
          b.tiltVX = -f.dir * 1.4;
        }
        if (before < DOWN && f.t >= DOWN) onBump?.(1);
        const g0 = refs.current[i];
        if (g0) g0.rotation.set(f.dir * a2, 0, 0);
        return;
      }
      // Resorte amortiguado que las devuelve a estar de pie.
      b.tiltVX += -b.tiltX * 60 * delta;
      b.tiltVZ += -b.tiltZ * 60 * delta;
      b.tiltVX *= Math.exp(-3.5 * delta);
      b.tiltVZ *= Math.exp(-3.5 * delta);
      b.tiltX = THREE.MathUtils.clamp(b.tiltX + b.tiltVX * delta, -0.35, 0.35);
      b.tiltZ = THREE.MathUtils.clamp(b.tiltZ + b.tiltVZ * delta, -0.35, 0.35);

      const g = refs.current[i];
      if (g) g.rotation.set(b.tiltX, 0, b.tiltZ);
    });
  });
  return (
    <>
      {LETTERS.map((l, i) => (
        <group
          key={l.char}
          ref={(g) => {
            refs.current[i] = g;
          }}
          position={[l.x, 0.2, LETTERS_Z]}
        >
          {GLYPHS[l.char].map(([w, h, x, y, rz], k) => (
            <mesh key={k} position={[x, y, 0]} rotation={[0, 0, rz]} castShadow receiveShadow>
              <boxGeometry args={[w, h, 0.9]} />
              <meshStandardMaterial color={l.color} roughness={0.55} flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

/** Las letras y el escudo bloquean al personaje como un edificio pequeño. */
export const LETTER_COLLIDERS: Collider[] = [
  ...LETTERS.map((l) => ({ x: l.x, z: LETTERS_Z, r: LETTER_COLLIDER_RADIUS })),
  { x: SHIELD.x, z: SHIELD.z, r: 1.7 },
];

/** Zonas de exclusión de las letras y el escudo, para no sembrar arbustos encima. */
export const LETTER_SPOTS = [
  ...LETTERS.map((l) => ({ x: l.x, z: LETTERS_Z, r: LETTER_RADIUS + 1 })),
  { x: SHIELD.x, z: SHIELD.z, r: 3 },
];

/** Silueta del escudo: borde superior recto y punta abajo, como el del logo. */
function shieldShape(w: number, h: number) {
  const s = new THREE.Shape();
  const hw = w / 2;
  s.moveTo(-hw, h);
  s.lineTo(hw, h);
  s.lineTo(hw, h * 0.45);
  s.quadraticCurveTo(hw * 0.95, h * 0.12, 0, 0);
  s.quadraticCurveTo(-hw * 0.95, h * 0.12, -hw, h * 0.45);
  s.closePath();
  return s;
}

/** Frente del escudo: se recorta del logo del modelo 2 (public/kun-logo-model2.png). */
function useShieldTexture() {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 448;
    canvas.height = 513;
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    const img = new Image();
    img.onload = () => {
      canvas.getContext("2d")?.drawImage(img, 0, 0, img.width * 0.31, img.height, 0, 0, canvas.width, canvas.height);
      t.needsUpdate = true;
    };
    img.src = "/kun-logo-model2.png";
    return t;
  }, []);
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

export function KunShield() {
  const texture = useShieldTexture();
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shieldShape(SHIELD.w + 0.3, SHIELD.h + 0.3), {
      depth: 0.5,
      bevelEnabled: true,
      bevelSize: 0.08,
      bevelThickness: 0.08,
      bevelSegments: 2,
    });
    g.translate(0, -0.15, -0.5);
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const lift = 0.9;
  return (
    <group position={[SHIELD.x, 0.2, SHIELD.z]} rotation={[0, SHIELD.rot, 0]}>
      {/* Pedestal */}
      <mesh position={[0, 0.35, -0.25]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.7, 1.2]} />
        <meshStandardMaterial color="#E9E6EF" roughness={0.6} />
      </mesh>
      <group position={[0, lift, 0]}>
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial color={LOGO_NAVY} roughness={0.45} metalness={0.2} />
        </mesh>
        <mesh position={[0, SHIELD.h / 2, 0.1]}>
          <planeGeometry args={[SHIELD.w, SHIELD.h]} />
          <meshStandardMaterial map={texture} transparent alphaTest={0.05} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
