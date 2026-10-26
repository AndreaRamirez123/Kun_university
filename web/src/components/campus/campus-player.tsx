"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MiiAvatar, miiHeight } from "./campus-mii";
import { CampusLabel } from "./campus-label";
import { CAFE_SEATS, CAFE_TRAMPOLINES } from "./campus-cafe";
import { BEACH_TRAMPOLINES } from "./campus-florida";
import { activeTreat, campusRuntime } from "./campus-runtime";
import { playStep, type Ground } from "./campus-audio";
import { CAFE, GRASS_RADIUS, ISLAND_RADIUS, PLAYER_START, WALK_RADIUS, ZONES, type Avatar, type Collider } from "./campus-zones";

const WALK_SPEED = 7;
const RUN_SPEED = 12;
const TURN_SMOOTHING = 12;
const PLAYER_RADIUS = 0.6;
const GRAVITY = 32;
const JUMP_SPEED = 11;
/** Saltar debajo de una sombrilla de la cafetería lanza hasta su lona. */
const TRAMPOLINE_LAUNCH = 19.5;
/** Rebote al caer sobre la lona de una sombrilla. */
const TRAMPOLINE_BOUNCE = 15;
const TRAMPOLINES = [...CAFE_TRAMPOLINES, ...BEACH_TRAMPOLINES];
const DUST_COUNT = 24;

const MOVE_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"]);

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

/** La comida o bebida de la KUN Store en la mano derecha, mientras dura. */
function HeldTreat({ avatar }: { avatar: Avatar }) {
  const ref = useRef<THREE.Group>(null);
  const kinds = useRef<{ [k: string]: THREE.Object3D | null }>({});
  useFrame(() => {
    const kind = activeTreat();
    if (ref.current) ref.current.visible = kind !== null;
    for (const [k, o] of Object.entries(kinds.current)) if (o) o.visible = k === kind;
  });
  const y = 0.22 + 0.72 * avatar.height + 0.55 * avatar.height;
  const x = 0.42 * avatar.build + 0.2;
  return (
    <group ref={ref} position={[x, y, 0.22]} visible={false}>
      {/* Vaso de café con tapa */}
      <group ref={(o) => void (kinds.current.coffee = o)}>
        <mesh castShadow>
          <cylinderGeometry args={[0.13, 0.1, 0.32, 14]} />
          <meshStandardMaterial color="#FFF8F0" />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.135, 0.125, 0.1, 14]} />
          <meshStandardMaterial color="#14306E" />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.05, 14]} />
          <meshStandardMaterial color="#C8102E" />
        </mesh>
      </group>
      {/* Jugo con pajilla */}
      <group ref={(o) => void (kinds.current.juice = o)}>
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.34, 14]} />
          <meshStandardMaterial color="#FF9A1F" transparent opacity={0.92} />
        </mesh>
        <mesh position={[0.04, 0.28, 0]} rotation={[0, 0, -0.25]}>
          <cylinderGeometry args={[0.02, 0.02, 0.32, 6]} />
          <meshStandardMaterial color="#FF4FA3" />
        </mesh>
        <mesh position={[-0.1, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.06, 0.025, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#FFC85C" />
        </mesh>
      </group>
      {/* Cono de helado */}
      <group ref={(o) => void (kinds.current.icecream = o)}>
        <mesh rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[0.12, 0.3, 12]} />
          <meshStandardMaterial color="#D9A066" />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.14, 14, 10]} />
          <meshStandardMaterial color="#FFF8F0" />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshStandardMaterial color="#C8102E" />
        </mesh>
      </group>
    </group>
  );
}

/** Qué pisa el jugador: terraza de la cafetería, arena (fuera del pasto), camino o pasto. */
function groundAt(x: number, z: number): Ground {
  if (Math.hypot(x - CAFE.x, z - CAFE.z) < CAFE.deck) return "wood";
  const r = Math.hypot(x, z);
  if (r > GRASS_RADIUS || r > ISLAND_RADIUS) return "sand";
  // Mismo trazado que los caminos de campus-world: anillo de la plaza, la entrada
  // desde la playa sur y un camino recto de la plaza a cada lugar.
  if (r > 7 && r < 10.5) return "path";
  if (Math.abs(x) < 1.4 && z > 10.5 && z < 41.5) return "path";
  for (const zn of ZONES) {
    if (zn.kind === "curriculum") continue;
    const d = Math.hypot(zn.x, zn.z);
    const along = (x * zn.x + z * zn.z) / d;
    const across = Math.abs(x * zn.z - z * zn.x) / d;
    if (across < 1.4 && along > 10 && along < d - zn.r) return "path";
  }
  return "grass";
}

export function CampusPlayer({
  groupRef,
  avatar,
  playing,
  frozen = false,
  visible = true,
  colliders,
  onLand,
  onBounce,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  avatar: Avatar;
  playing: boolean;
  /** En el campus pero sin moverse (p. ej. mientras conversa con Krucn). */
  frozen?: boolean;
  visible?: boolean;
  colliders: Collider[];
  onLand?: (strength: number) => void;
  /** Rebote en una sombrilla-trampolín. */
  onBounce?: () => void;
}) {
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const dust = useRef<THREE.InstancedMesh>(null);

  const motion = useRef({
    walk: 0,
    vy: 0,
    y: 0,
    grounded: true,
    squash: 0,
    squashV: 0,
    dustTimer: 0,
    dustIndex: 0,
    /** Al lanzarse o rebotar en una sombrilla, punto de la lona hacia el que se acomoda en el aire. */
    aim: null as { x: number; z: number } | null,
    /** El salto va de una sombrilla a otra (se guía aunque haya teclas presionadas). */
    hop: false,
  });
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
    if (playing && !frozen) {
      if (k.KeyW || k.ArrowUp) iz -= 1;
      if (k.KeyS || k.ArrowDown) iz += 1;
      if (k.KeyA || k.ArrowLeft) ix -= 1;
      if (k.KeyD || k.ArrowRight) ix += 1;
      ix += campusRuntime.stick.x;
      iz += campusRuntime.stick.z;
      len = Math.hypot(ix, iz);
      const running = k.ShiftLeft || k.ShiftRight || (campusRuntime.stick.active && len > 0.95);
      // El café de la KUN Store da energía: un 30 % más rápido.
      speed = (running ? RUN_SPEED : WALK_SPEED) * (activeTreat() === "coffee" ? 1.3 : 1);

      const sitting = CAFE_SEATS[campusRuntime.seat];
      if (sitting && (len > 0.08 || campusRuntime.jumpQueued)) {
        // Se levanta y queda de pie junto al taburete.
        campusRuntime.seat = -1;
        campusRuntime.jumpQueued = false;
        g.position.x = sitting.standX;
        g.position.z = sitting.standZ;
        len = 0;
      }

      if (campusRuntime.jumpQueued) {
        campusRuntime.jumpQueued = false;
        if (m.grounded) {
          // Debajo de una sombrilla, el salto es un lanzamiento hasta la lona.
          // (La mesa no deja pararse justo debajo: basta con estar junto a ella.)
          const under = m.y < 0.5 ? TRAMPOLINES.find((u) => Math.hypot(g.position.x - u.x, g.position.z - u.z) < u.r + 0.4) : undefined;
          // Impulso suficiente para pasar un poco por encima de la lona (las de la cafetería son altas).
          m.vy = under ? Math.max(TRAMPOLINE_LAUNCH, Math.sqrt(2 * GRAVITY * (under.top(0) + 0.9))) : JUMP_SPEED * (activeTreat() === "juice" ? 1.45 : 1);
          if (under) m.aim = { x: under.x + (g.position.x - under.x) * 0.25, z: under.z + (g.position.z - under.z) * 0.25 };
          m.grounded = false;
          m.squashV = under ? 9 : 6;
          if (under) onBounce?.();
        }
      }
    } else {
      campusRuntime.jumpQueued = false;
    }
    const seat = CAFE_SEATS[campusRuntime.seat];
    if (seat) len = 0;

    let vx = 0;
    let vz = 0;
    // Saltando de una sombrilla a otra, el vuelo lo guía el salto (las teclas solo eligen el destino).
    if (len > 0.08 && !(m.hop && !m.grounded)) {
      ix /= Math.max(1, len);
      iz /= Math.max(1, len);
      vx = ix * speed;
      vz = iz * speed;
      let nx = g.position.x + vx * delta;
      let nz = g.position.z + vz * delta;
      for (const c of colliders) {
        if (c.h !== undefined && m.y > c.h) continue;
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
      const before = m.walk;
      m.walk += delta * speed * 1.4;
      // Un paso cada medio ciclo de la caminata (cuando un pie toca el suelo).
      if (m.grounded && Math.floor(m.walk / Math.PI) !== Math.floor(before / Math.PI)) {
        playStep(groundAt(g.position.x, g.position.z), speed === RUN_SPEED);
      }

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
        // En la pantalla de inicio el personaje mira a la cámara, o hacia donde
        // lo gire la persona en el editor (para verlo de espaldas).
        let diff = campusRuntime.previewSpin - g.rotation.y;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        g.rotation.y += diff * Math.min(1, delta * 7);
      }
    }
    campusRuntime.player.x = g.position.x;
    campusRuntime.player.z = g.position.z;
    campusRuntime.player.vx = vx;
    campusRuntime.player.vz = vz;
    campusRuntime.player.heading = g.rotation.y;

    // Salto con gravedad y squash & stretch al aterrizar.
    if (!m.grounded) {
      const prevY = m.y;
      m.vy -= GRAVITY * delta;
      m.y += m.vy * delta;
      if (m.vy < 0) {
        for (const u of TRAMPOLINES) {
          const d = Math.hypot(g.position.x - u.x, g.position.z - u.z);
          if (d > u.r) continue;
          const top = u.top(d);
          if (prevY >= top - 0.05 && m.y < top) {
            m.y = top;
            m.vy = TRAMPOLINE_BOUNCE;
            m.aim = { x: u.x + (g.position.x - u.x) * 0.4, z: u.z + (g.position.z - u.z) * 0.4 };
            m.hop = false;
            // Con una dirección presionada, salta a la sombrilla más cercana hacia ese lado.
            if (len > 0.08) {
              const dx = ix / len;
              const dz = iz / len;
              let best: (typeof TRAMPOLINES)[number] | null = null;
              let bestD = 11;
              for (const o of TRAMPOLINES) {
                if (o === u) continue;
                const ox = o.x - g.position.x;
                const oz = o.z - g.position.z;
                const od = Math.hypot(ox, oz);
                if (od < bestD && (ox * dx + oz * dz) / od > 0.55) {
                  best = o;
                  bestD = od;
                }
              }
              if (best) {
                m.aim = { x: best.x, z: best.z };
                m.hop = true;
                m.vy = TRAMPOLINE_BOUNCE + 2;
              }
            }
            m.squashV = -10;
            spawnDust(g.position.x, g.position.z, 4);
            onBounce?.();
            break;
          }
        }
      }
      // Sin teclas, se acomoda sobre la lona para seguir rebotando.
      if (m.aim && (len < 0.08 || m.hop)) {
        const k = Math.min(1, delta * (m.hop ? 2.6 : 3.5));
        g.position.x += (m.aim.x - g.position.x) * k;
        g.position.z += (m.aim.z - g.position.z) * k;
      }
      if (m.y <= 0) {
        m.aim = null;
        m.hop = false;
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

    // Si cae sobre una mesa (sin tocar la sombrilla), queda a un lado, no dentro.
    for (const c of seat ? [] : colliders) {
      if (c.h === undefined || m.y > c.h) continue;
      const dx = g.position.x - c.x;
      const dz = g.position.z - c.z;
      const dist = Math.hypot(dx, dz);
      const min = c.r + PLAYER_RADIUS;
      if (dist < min && dist > 0.0001) {
        g.position.x = c.x + (dx / dist) * min;
        g.position.z = c.z + (dz / dist) * min;
      }
    }
    const ground = Math.hypot(g.position.x, g.position.z) < GRASS_RADIUS ? 0.2 : 0.05;
    const walkAmount = Math.min(1, len * 2);
    const bob = m.grounded ? Math.abs(Math.sin(m.walk)) * 0.08 * walkAmount : 0;
    g.position.y = ground + m.y + bob;
    campusRuntime.player.y = m.y;
    if (seat) {
      g.position.set(seat.x, seat.y + 0.08 - (0.22 + 0.72 * avatar.height), seat.z);
      let diff = seat.face - g.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      g.rotation.y += diff * Math.min(1, delta * 10);
      campusRuntime.player.x = seat.x;
      campusRuntime.player.z = seat.z;
      campusRuntime.player.heading = g.rotation.y;
    }

    if (body.current) {
      const s = 1 + m.squash;
      body.current.scale.set(1 / Math.sqrt(Math.max(0.5, s)), s, 1 / Math.sqrt(Math.max(0.5, s)));
      // Respiración suave cuando está quieto.
      body.current.position.y = walkAmount < 0.1 && m.grounded ? Math.sin(t * 2) * 0.025 : 0;
    }

    // Balanceo de piernas y brazos, saludo en la pantalla de inicio y pose en el aire.
    const swing = m.grounded ? Math.sin(m.walk) * 0.7 * walkAmount : 0;
    const air = m.grounded ? 0 : -0.6;
    // Sentado: piernas hacia adelante y brazos sobre la mesa.
    if (legL.current) legL.current.rotation.x = seat ? -1.45 : swing + air * 0.5;
    if (legR.current) legR.current.rotation.x = seat ? -1.45 : -swing - air * 0.3;
    if (armL.current) {
      armL.current.rotation.x = seat ? -0.9 : -swing * 0.8 + air;
      armL.current.rotation.z = m.grounded ? -0.08 : -0.5;
    }
    if (armR.current) {
      const wave = !playing ? Math.sin(t * 6) * 0.35 : 0;
      armR.current.rotation.x = !playing ? 0 : seat ? -0.9 : swing * 0.8 + air;
      armR.current.rotation.z = !playing ? 2.5 + wave : m.grounded ? 0.08 : 0.5;
    }
    // La cabeza acompaña: se inclina un poco al saludar y oscila al caminar.
    if (head.current) {
      head.current.rotation.z = !playing ? Math.sin(t * 1.5) * 0.08 : Math.sin(m.walk) * 0.04 * walkAmount;
      head.current.rotation.x = !playing ? -0.05 : 0;
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

  return (
    <>
      <group ref={groupRef} position={PLAYER_START} visible={visible}>
        <group ref={body}>
          <MiiAvatar avatar={avatar} legLRef={legL} legRRef={legR} armLRef={armL} armRRef={armR} headRef={head} />
          <HeldTreat avatar={avatar} />
        </group>        {avatar.name.trim() && (
          <CampusLabel text={avatar.name.trim()} color="#24123F" position={[0, miiHeight(avatar) + 0.75, 0]} width={4.4} />
        )}
      </group>
      <instancedMesh ref={dust} args={[undefined, undefined, DUST_COUNT]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#F7E3C9" flatShading />
      </instancedMesh>
    </>
  );
}
