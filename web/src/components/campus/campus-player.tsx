"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CampusLabel } from "./campus-label";
import { campusRuntime } from "./campus-runtime";
import { GRASS_RADIUS, PLAYER_START, WALK_RADIUS, type Avatar, type Collider } from "./campus-zones";

const WALK_SPEED = 7;
const RUN_SPEED = 12;
const TURN_SMOOTHING = 12;
const PLAYER_RADIUS = 0.6;
const GRAVITY = 32;
const JUMP_SPEED = 11;
const DUST_COUNT = 24;

const MOVE_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"]);

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

function Part({
  args,
  position,
  color,
}: {
  args: [number, number, number];
  position: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.8} flatShading />
    </mesh>
  );
}

export function CampusPlayer({
  groupRef,
  avatar,
  playing,
  colliders,
  onLand,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  avatar: Avatar;
  playing: boolean;
  colliders: Collider[];
  onLand?: (strength: number) => void;
}) {
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const dust = useRef<THREE.InstancedMesh>(null);

  const motion = useRef({ walk: 0, vy: 0, y: 0, grounded: true, squash: 0, squashV: 0, dustTimer: 0, dustIndex: 0 });
  // Estado de simulación mutable: vive en refs, no en estado de React.
  const dustState = useRef(
    Array.from({ length: DUST_COUNT }, () => ({ x: 0, y: -10, z: 0, vx: 0, vy: 0, vz: 0, life: 0 })),
  );
  const dummy = useRef(new THREE.Object3D());

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTyping(e.target)) return;
      // Espacio sobre un botón o enlace enfocado debe seguir activándolo.
      if (e.code === "Space" && (e.target as HTMLElement | null)?.closest?.("button, a")) return;
      if (MOVE_KEYS.has(e.code)) e.preventDefault();
      if (e.code === "Space" && !e.repeat) campusRuntime.jumpQueued = true;
      campusRuntime.keys[e.code] = true;
    }
    function onKeyUp(e: KeyboardEvent) {
      campusRuntime.keys[e.code] = false;
    }
    function onBlur() {
      campusRuntime.keys = {};
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  function spawnDust(x: number, z: number, burst: number) {
    const m = motion.current;
    for (let k = 0; k < burst; k++) {
      const p = dustState.current[m.dustIndex++ % DUST_COUNT];
      const a = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.6;
      p.x = x + Math.cos(a) * 0.3;
      p.z = z + Math.sin(a) * 0.3;
      p.y = 0.3;
      p.vx = Math.cos(a) * speed;
      p.vz = Math.sin(a) * speed;
      p.vy = 0.6 + Math.random() * 0.8;
      p.life = 1;
    }
  }

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const g = groupRef.current;
    if (!g) return;
    const m = motion.current;
    const k = campusRuntime.keys;
    const t = state.clock.elapsedTime;

    let ix = 0;
    let iz = 0;
    let len = 0;
    let speed = 0;
    if (playing) {
      if (k.KeyW || k.ArrowUp) iz -= 1;
      if (k.KeyS || k.ArrowDown) iz += 1;
      if (k.KeyA || k.ArrowLeft) ix -= 1;
      if (k.KeyD || k.ArrowRight) ix += 1;
      ix += campusRuntime.stick.x;
      iz += campusRuntime.stick.z;
      len = Math.hypot(ix, iz);
      const running = k.ShiftLeft || k.ShiftRight || (campusRuntime.stick.active && len > 0.95);
      speed = running ? RUN_SPEED : WALK_SPEED;

      if (campusRuntime.jumpQueued) {
        campusRuntime.jumpQueued = false;
        if (m.grounded) {
          m.vy = JUMP_SPEED;
          m.grounded = false;
          m.squashV = 6;
        }
      }
    } else {
      campusRuntime.jumpQueued = false;
    }

    let vx = 0;
    let vz = 0;
    if (len > 0.08) {
      ix /= Math.max(1, len);
      iz /= Math.max(1, len);
      vx = ix * speed;
      vz = iz * speed;
      let nx = g.position.x + vx * delta;
      let nz = g.position.z + vz * delta;
      for (const c of colliders) {
        const dx = nx - c.x;
        const dz = nz - c.z;
        const dist = Math.hypot(dx, dz);
        const min = c.r + PLAYER_RADIUS;
        if (dist < min && dist > 0.0001) {
          nx = c.x + (dx / dist) * min;
          nz = c.z + (dz / dist) * min;
        }
      }
      const d = Math.hypot(nx, nz);
      if (d > WALK_RADIUS) {
        nx = (nx / d) * WALK_RADIUS;
        nz = (nz / d) * WALK_RADIUS;
      }
      vx = (nx - g.position.x) / delta;
      vz = (nz - g.position.z) / delta;
      g.position.x = nx;
      g.position.z = nz;

      const target = Math.atan2(ix, iz);
      let diff = target - g.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      g.rotation.y += diff * Math.min(1, delta * TURN_SMOOTHING);
      m.walk += delta * speed * 1.4;

      if (m.grounded && speed === RUN_SPEED) {
        m.dustTimer -= delta;
        if (m.dustTimer <= 0) {
          spawnDust(g.position.x, g.position.z, 2);
          m.dustTimer = 0.07;
        }
      }
    } else {
      m.walk *= 0.85;
      if (!playing) {
        // En la pantalla de inicio el personaje mira a la cámara.
        let diff = 0 - g.rotation.y;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        g.rotation.y += diff * Math.min(1, delta * 3);
      }
    }
    campusRuntime.player.x = g.position.x;
    campusRuntime.player.z = g.position.z;
    campusRuntime.player.vx = vx;
    campusRuntime.player.vz = vz;
    campusRuntime.player.heading = g.rotation.y;

    // Salto con gravedad y squash & stretch al aterrizar.
    if (!m.grounded) {
      m.vy -= GRAVITY * delta;
      m.y += m.vy * delta;
      if (m.y <= 0) {
        const impact = Math.min(1, Math.abs(m.vy) / JUMP_SPEED);
        m.y = 0;
        m.vy = 0;
        m.grounded = true;
        m.squashV = -9 * impact;
        spawnDust(g.position.x, g.position.z, 8);
        onLand?.(impact);
      }
    }
    m.squashV += -m.squash * 180 * delta;
    m.squashV *= Math.exp(-10 * delta);
    m.squash += m.squashV * delta;

    const ground = Math.hypot(g.position.x, g.position.z) < GRASS_RADIUS ? 0.2 : 0.05;
    const walkAmount = Math.min(1, len * 2);
    const bob = m.grounded ? Math.abs(Math.sin(m.walk)) * 0.08 * walkAmount : 0;
    g.position.y = ground + m.y + bob;

    if (body.current) {
      const s = 1 + m.squash;
      body.current.scale.set(1 / Math.sqrt(Math.max(0.5, s)), s, 1 / Math.sqrt(Math.max(0.5, s)));
      // Respiración suave cuando está quieto.
      if (walkAmount < 0.1 && m.grounded) body.current.position.y = Math.sin(t * 2) * 0.03;
      else body.current.position.y = 0;
    }

    const swing = m.grounded ? Math.sin(m.walk) * 0.7 * walkAmount : 0;
    const air = m.grounded ? 0 : -0.6;
    if (legL.current) legL.current.rotation.x = swing + air * 0.5;
    if (legR.current) legR.current.rotation.x = -swing - air * 0.3;
    if (armL.current) {
      armL.current.rotation.x = -swing * 0.8 + air;
      armL.current.rotation.z = m.grounded ? 0 : 0.5;
    }
    if (armR.current) {
      // Saludo en la pantalla de inicio.
      const wave = !playing ? Math.sin(t * 6) * 0.35 : 0;
      armR.current.rotation.x = !playing ? -2.6 : swing * 0.8 + air;
      armR.current.rotation.z = !playing ? -0.3 + wave : m.grounded ? 0 : -0.5;
    }

    const mesh = dust.current;
    if (!mesh) return;
    const d = dummy.current;
    for (let i = 0; i < DUST_COUNT; i++) {
      const p = dustState.current[i];
      if (p.life > 0) {
        p.life -= delta * 2.2;
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;
        p.vx *= 0.92;
        p.vz *= 0.92;
      }
      d.position.set(p.x, p.y, p.z);
      d.scale.setScalar(p.life > 0 ? 0.12 + (1 - p.life) * 0.35 : 0);
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  const skin = "#C98B62";
  const pants = "#2A1758";
  const shirt = avatar.shirt;

  return (
    <>
      <group ref={groupRef} position={PLAYER_START}>
        <group ref={body}>
          <group ref={legL} position={[-0.22, 1, 0]}>
            <Part args={[0.38, 1, 0.42]} position={[0, -0.45, 0]} color={pants} />
          </group>
          <group ref={legR} position={[0.22, 1, 0]}>
            <Part args={[0.38, 1, 0.42]} position={[0, -0.45, 0]} color={pants} />
          </group>
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.48, 0.42, 1.2, 10]} />
            <meshStandardMaterial color={shirt} roughness={0.8} flatShading />
          </mesh>
          <group ref={armL} position={[-0.62, 2.1, 0]}>
            <Part args={[0.24, 1, 0.28]} position={[0, -0.45, 0]} color={shirt} />
          </group>
          <group ref={armR} position={[0.62, 2.1, 0]}>
            <Part args={[0.24, 1, 0.28]} position={[0, -0.45, 0]} color={shirt} />
          </group>
          <mesh position={[0, 2.65, 0]} castShadow>
            <sphereGeometry args={[0.46, 14, 12]} />
            <meshStandardMaterial color={skin} roughness={0.7} flatShading />
          </mesh>
          {/* Mochila */}
          <Part args={[0.7, 0.85, 0.35]} position={[0, 1.7, -0.55]} color="#FFC85C" />
          {/* Ojos */}
          {[-0.16, 0.16].map((x) => (
            <mesh key={x} position={[x, 2.72, 0.42]}>
              <sphereGeometry args={[0.07, 6, 6]} />
              <meshStandardMaterial color="#24123F" />
            </mesh>
          ))}
          {avatar.accessory === "cap" && (
            <>
              <mesh position={[0, 2.8, 0]} castShadow>
                <sphereGeometry args={[0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={shirt} roughness={0.8} flatShading />
              </mesh>
              <Part args={[0.6, 0.06, 0.5]} position={[0, 2.82, 0.5]} color={shirt} />
            </>
          )}
          {avatar.accessory === "headphones" && (
            <>
              <mesh position={[0, 2.7, 0]}>
                <torusGeometry args={[0.5, 0.07, 6, 20, Math.PI]} />
                <meshStandardMaterial color="#24123F" />
              </mesh>
              {[-0.5, 0.5].map((x) => (
                <mesh key={x} position={[x, 2.62, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.18, 0.18, 0.16, 12]} />
                  <meshStandardMaterial color="#24123F" emissive="#FF8A4C" emissiveIntensity={0.4} />
                </mesh>
              ))}
            </>
          )}
          {avatar.accessory === "none" && (
            <mesh position={[0, 2.72, -0.04]} castShadow>
              <sphereGeometry args={[0.48, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
              <meshStandardMaterial color="#3A2410" roughness={0.8} flatShading />
            </mesh>
          )}
        </group>
        {avatar.name && <CampusLabel text={avatar.name} color="#24123F" position={[0, 3.9, 0]} width={4} />}
      </group>
      <instancedMesh ref={dust} args={[undefined, undefined, DUST_COUNT]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#F7E3C9" flatShading />
      </instancedMesh>
    </>
  );
}
