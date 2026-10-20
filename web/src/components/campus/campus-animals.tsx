"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { campusRuntime } from "./campus-runtime";
import { PetFx, petAct, petActionAge, petHeading, petPos } from "./campus-pet";
import type { Pet } from "./campus-avatar";
import { PLAYER_START, WALK_RADIUS } from "./campus-zones";

// Fauna de Florida para darle vida a la isla: delfines saltando en el mar,
// pelícanos volando, tortugas marinas en la playa y un perrito que te
// acompaña por el campus.

function Std({ color, rough = 0.7 }: { color: string; rough?: number }) {
  return <meshStandardMaterial color={color} roughness={rough} flatShading />;
}

// ---------------------------------------------------------------- delfines

const DOLPHINS = [
  { angle: 0.4, radius: 60, period: 7, offset: 0 },
  { angle: 2.3, radius: 64, period: 9, offset: 2.5 },
  { angle: 4.1, radius: 58, period: 8, offset: 5 },
];

function Dolphin({ angle, radius, period, offset }: (typeof DOLPHINS)[number]) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime + offset;
    // Nada en círculo y salta durante el primer tercio de cada período.
    const a = angle + t * 0.06;
    const phase = (t % period) / period;
    const jump = phase < 0.32 ? phase / 0.32 : -1;
    const along = jump >= 0 ? (jump - 0.5) * 7 : 0;
    const x = Math.cos(a) * radius - Math.sin(a) * along;
    const z = Math.sin(a) * radius + Math.cos(a) * along;
    const y = jump >= 0 ? Math.sin(jump * Math.PI) * 4.2 - 0.8 : -3;
    g.position.set(x, y, z);
    g.visible = jump >= 0;
    g.rotation.set(0, -a, 0);
    // Cabecea siguiendo la parábola del salto.
    g.children[0].rotation.x = jump >= 0 ? -Math.cos(jump * Math.PI) * 0.9 : 0;
  });
  return (
    <group ref={ref}>
      <group>
        <mesh scale={[0.55, 0.55, 1.6]} castShadow>
          <sphereGeometry args={[1, 14, 10]} />
          <Std color="#6E8FA8" rough={0.35} />
        </mesh>
        <mesh position={[0, -0.18, 0.05]} scale={[0.42, 0.3, 1.3]}>
          <sphereGeometry args={[1, 12, 8]} />
          <Std color="#E6EEF3" />
        </mesh>
        <mesh position={[0, 0.55, -0.1]} rotation={[-0.5, 0, 0]}>
          <coneGeometry args={[0.18, 0.6, 4]} />
          <Std color="#5B7A92" />
        </mesh>
        <mesh position={[0, 0, 1.6]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.16, 0.45, 8]} />
          <Std color="#6E8FA8" />
        </mesh>
        <mesh position={[0, 0, -1.65]} scale={[1.2, 0.15, 0.5]}>
          <sphereGeometry args={[0.6, 10, 6]} />
          <Std color="#5B7A92" />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------- pelícanos

const PELICANS = [
  { radius: 26, height: 22, speed: 0.22, phase: 0 },
  { radius: 31, height: 25, speed: 0.18, phase: 1.6 },
  { radius: 22, height: 19, speed: 0.26, phase: 3.4 },
  { radius: 35, height: 27, speed: 0.15, phase: 4.8 },
];

function Pelican({ radius, height, speed, phase }: (typeof PELICANS)[number]) {
  const ref = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const a = phase + t * speed;
    g.position.set(Math.cos(a) * radius, height + Math.sin(t * 0.8 + phase) * 1.2, Math.sin(a) * radius);
    // Vuela tangente al círculo, inclinado hacia adentro.
    g.rotation.set(0, -a, 0.25);
    const flap = Math.sin(t * 4 + phase) * 0.55;
    if (wingL.current) wingL.current.rotation.z = flap;
    if (wingR.current) wingR.current.rotation.z = -flap;
  });
  return (
    <group ref={ref}>
      {/* El cuerpo mira hacia +z dentro del grupo, que avanza en la tangente */}
      <group rotation={[0, Math.PI, 0]}>
        <mesh scale={[0.45, 0.42, 1]} castShadow>
          <sphereGeometry args={[1, 12, 8]} />
          <Std color="#EDE8E0" />
        </mesh>
        <mesh position={[0, 0.25, 1.05]}>
          <sphereGeometry args={[0.3, 10, 8]} />
          <Std color="#F4F0EA" />
        </mesh>
        <mesh position={[0, 0.12, 1.75]} rotation={[Math.PI / 2 + 0.15, 0, 0]}>
          <coneGeometry args={[0.13, 1.2, 6]} />
          <Std color="#F2A541" />
        </mesh>
        <mesh ref={wingL} position={[-0.4, 0.1, 0]}>
          <boxGeometry args={[2.4, 0.06, 0.8]} />
          <Std color="#9C948C" />
        </mesh>
        <mesh ref={wingR} position={[0.4, 0.1, 0]}>
          <boxGeometry args={[2.4, 0.06, 0.8]} />
          <Std color="#9C948C" />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------- tortugas

// Recorren tramos de la playa lejos de las torres salvavidas y del cohete.
const TURTLES = [
  { from: 2.15, to: 2.55, speed: 0.012 },
  { from: 3.8, to: 4.15, speed: 0.01 },
  { from: 4.75, to: 5.2, speed: 0.011 },
];

function SeaTurtle({ from, to, speed }: (typeof TURTLES)[number]) {
  const ref = useRef<THREE.Group>(null);
  const flippers = useRef<Array<THREE.Mesh | null>>([]);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // Va y vuelve por su tramo de playa.
    const span = to - from;
    const u = (Math.sin(t * speed * (Math.PI * 2) / span) + 1) / 2;
    const dir = Math.cos(t * speed * (Math.PI * 2) / span) >= 0 ? 1 : -1;
    const a = from + span * u;
    g.position.set(Math.cos(a) * 45.5, 0.15, Math.sin(a) * 45.5);
    g.rotation.y = -a + (dir > 0 ? 0 : Math.PI);
    flippers.current.forEach((f, i) => {
      if (f) f.rotation.y = Math.sin(t * 3 + i * Math.PI) * 0.5;
    });
  });
  return (
    <group ref={ref} scale={0.9}>
      <mesh position={[0, 0.35, 0]} scale={[1, 0.45, 1.2]} castShadow>
        <sphereGeometry args={[0.8, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Std color="#4F7A3A" />
      </mesh>
      <mesh position={[0, 0.36, 0]} scale={[0.75, 0.42, 0.9]}>
        <sphereGeometry args={[0.8, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Std color="#6E9B4E" />
      </mesh>
      <mesh position={[0, 0.35, 1.1]} castShadow>
        <sphereGeometry args={[0.24, 10, 8]} />
        <Std color="#8DA76A" />
      </mesh>
      {[
        [-0.75, 0.55],
        [0.75, 0.55],
        [-0.6, -0.65],
        [0.6, -0.65],
      ].map(([x, z], i) => (
        <mesh
          key={i}
          ref={(m) => {
            flippers.current[i] = m;
          }}
          position={[x, 0.2, z]}
          scale={[1, 0.25, 0.55]}
        >
          <sphereGeometry args={[0.32, 8, 6]} />
          <Std color="#8DA76A" />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------- mascotas que te acompañan

/** Perro, gato y las mascotas de la tienda: mini Krucn (cocodrilo) y pantera de Florida. */
type Quadruped = "dog" | "cat" | "croc" | "panther";

/** A quién sigue la mascota: por defecto el jugador; para otras personas, su personaje. */
type Follow = { x: number; z: number; heading: number };

/** Mascota que sigue a un personaje (la propia o la de otra persona del campus). */
export function PetFollower({ pet, playing, follow }: { pet: Pet; playing: boolean; follow?: Follow }) {
  if (pet === "dog" || pet === "cat" || pet === "croc" || pet === "panther") return <FollowerQuadruped key={pet} kind={pet} playing={playing} follow={follow} />;
  if (pet === "parrot") return <FollowerParrot playing={playing} follow={follow} />;
  return null;
}

// Perrito o gatito: te sigue un paso atrás, trota al caminar y se sienta cuando
// te detienes. En la pantalla de inicio se sienta a tu lado.
function FollowerQuadruped({ kind, playing, follow }: { kind: Quadruped; playing: boolean; follow?: Follow }) {
  const ref = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Mesh>(null);
  const legs = useRef<Array<THREE.Mesh | null>>([]);
  const rear = useRef<THREE.Group>(null);
  const state = useRef({ x: PLAYER_START[0] - 1.9, z: PLAYER_START[2] + 0.6, heading: 0, trot: 0 });
  // La pantera usa el cuerpo del gato; el mini Krucn, el del perro con hocico largo.
  const cat = kind === "cat" || kind === "panther";
  const croc = kind === "croc";

  useFrame((frame, rawDelta) => {
    const g = ref.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.05);
    const s = state.current;
    const p = follow ?? campusRuntime.player;
    const t = frame.clock.elapsedTime;
    const back = playing ? 2.4 : 0;
    const side = playing ? 1.1 : -1.9;
    const hx = Math.sin(p.heading);
    const hz = Math.cos(p.heading);
    let tx = p.x - hx * back + hz * side;
    let tz = p.z - hz * back - hx * side;
    // Al consentirla (solo la propia) viene frente al jugador; al jugar, va por la pelota.
    const age = follow ? null : petActionAge();
    const kind = age === null ? null : petAct.kind;
    if (kind && age !== null) {
      const fetch = kind === "play" && age > 0.55 && age < 2.1;
      // Delante y a un lado, para que se vea junto al personaje y no tapado por él.
      tx = fetch ? petAct.bx : p.x + hx * 1.4 + hz * 1.3;
      tz = fetch ? petAct.bz : p.z + hz * 1.4 - hx * 1.3;
    }
    const dx = tx - s.x;
    const dz = tz - s.z;
    const dist = Math.hypot(dx, dz);
    const speed = dist > 0.4 ? Math.min(kind === "play" ? 16 : 14, dist * 3.2) : 0;
    if (speed > 0) {
      s.x += (dx / dist) * speed * delta;
      s.z += (dz / dist) * speed * delta;
      const target = Math.atan2(dx, dz);
      let diff = target - s.heading;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      s.heading += diff * Math.min(1, delta * 8);
      s.trot += delta * speed * 2.2;
    } else {
      // Quieto: mira hacia donde mira el jugador (o a la cámara al inicio); si la consientes, te mira a ti.
      const look = kind ? Math.atan2(p.x - s.x, p.z - s.z) : playing ? p.heading : 0;
      let diff = look - s.heading;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      s.heading += diff * Math.min(1, delta * 3);
    }
    const r = Math.hypot(s.x, s.z);
    if (r > WALK_RADIUS) {
      s.x = (s.x / r) * WALK_RADIUS;
      s.z = (s.z / r) * WALK_RADIUS;
    }
    const moving = speed > 0.5;
    // Reacciones: saltitos con el premio, un giro con salto para el truco.
    let hop = 0;
    let spin = 0;
    if (kind === "treat" && age !== null && age < 1.6) hop = Math.abs(Math.sin(age * 9)) * 0.28;
    if (kind === "pat" && age !== null) hop = Math.abs(Math.sin(age * 5)) * 0.08;
    if (kind === "trick" && age !== null && age < 1.3) {
      hop = Math.sin((age / 1.3) * Math.PI) * 1.1;
      spin = (age / 1.3) * Math.PI * 2;
    }
    g.position.set(s.x, 0.2 + hop + (moving ? Math.abs(Math.sin(s.trot)) * 0.12 : 0), s.z);
    g.rotation.y = s.heading + spin;
    if (!follow) {
      petPos.x = s.x;
      petPos.z = s.z;
      petHeading.h = s.heading;
    }
    legs.current.forEach((l, i) => {
      if (l) l.rotation.x = moving ? Math.sin(s.trot + (i % 2 ? Math.PI : 0)) * 0.7 : 0;
    });
    if (rear.current) rear.current.rotation.x = THREE.MathUtils.lerp(rear.current.rotation.x, moving ? 0 : 0.55, 0.1);
    if (tail.current) {
      // El perro mueve la cola rápido; el gato la balancea despacio, en alto.
      if (cat) tail.current.rotation.z = Math.sin(t * 2.2) * 0.35;
      else tail.current.rotation.z = Math.sin(t * (kind ? 22 : moving ? 14 : 9)) * (kind ? 0.8 : 0.6);
    }
  });

  const PALETTE: Record<Quadruped, [string, string, string]> = {
    dog: ["#C98A4B", "#F2DDBF", "#8A5A2E"],
    cat: ["#E39A4F", "#FFF3E2", "#B8692E"],
    croc: ["#3FA34D", "#E3E39A", "#2C7A38"],
    panther: ["#C9A26B", "#EFE0C4", "#4A3420"],
  };
  const [fur, light, dark] = PALETTE[kind];
  return (
    <group ref={ref} scale={kind === "cat" ? 0.78 : kind === "panther" ? 1.02 : 0.95}>
      <mesh position={[0, 0.95, 0.35]} scale={[0.42, 0.42, 0.55]} castShadow>
        <sphereGeometry args={[1, 14, 10]} />
        <Std color={fur} />
      </mesh>
      <group position={[0, 1.45, 0.75]}>
        <mesh castShadow>
          <sphereGeometry args={[0.38, 16, 12]} />
          <Std color={fur} />
        </mesh>
        <mesh position={[0, croc ? -0.1 : -0.08, croc ? 0.42 : 0.3]} scale={cat ? [0.7, 0.45, 0.5] : croc ? [0.8, 0.42, 1.9] : [0.75, 0.6, 0.8]}>
          <sphereGeometry args={[0.24, 12, 10]} />
          <Std color={light} />
        </mesh>
        <mesh position={[0, croc ? -0.02 : -0.02, cat ? 0.42 : croc ? 0.84 : 0.52]}>
          <sphereGeometry args={[cat ? 0.045 : 0.07, 8, 6]} />
          <Std color={cat ? "#E87A8A" : "#1E1410"} rough={0.3} />
        </mesh>
        {[-1, 1].map((sx) => (
          <group key={sx}>
            <mesh position={[sx * 0.14, 0.08, 0.32]}>
              <sphereGeometry args={[0.05, 8, 6]} />
              <Std color={cat ? "#3C6E3A" : "#1E1410"} rough={0.2} />
            </mesh>
            {cat ? (
              <>
                {/* Orejas puntiagudas y bigotes */}
                <mesh position={[sx * 0.2, 0.36, -0.02]} rotation={[0, 0, sx * -0.25]}>
                  <coneGeometry args={[0.13, 0.28, 4]} />
                  <Std color={dark} />
                </mesh>
                {[0.03, -0.04].map((wy) => (
                  <mesh key={wy} position={[sx * 0.24, -0.05 + wy, 0.36]} rotation={[0, 0, Math.PI / 2 + sx * wy * 3]}>
                    <cylinderGeometry args={[0.006, 0.006, 0.3, 4]} />
                    <Std color="#FFFFFF" />
                  </mesh>
                ))}
              </>
            ) : croc ? (
              /* Ojos saltones del cocodrilo, sobre la cabeza */
              <mesh position={[sx * 0.13, 0.3, 0.12]}>
                <sphereGeometry args={[0.1, 10, 8]} />
                <Std color="#FFFFFF" rough={0.3} />
              </mesh>
            ) : (
              <mesh position={[sx * 0.32, 0.05, -0.02]} rotation={[0, 0, sx * 0.35]} scale={[0.35, 0.8, 0.5]}>
                <sphereGeometry args={[0.28, 10, 8]} />
                <Std color={dark} />
              </mesh>
            )}
          </group>
        ))}
        {/* Collar / pañuelo con los colores de KUN */}
        <mesh position={[0, -0.36, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[cat ? 0.2 : 0.24, cat ? 0.035 : 0.06, 6, 16]} />
          <Std color={kind === "panther" || croc ? "#14306E" : "#E8735A"} />
        </mesh>
      </group>
      {[-1, 1].map((sx, i) => (
        <mesh
          key={`f${sx}`}
          ref={(m) => {
            legs.current[i] = m;
          }}
          position={[sx * 0.2, 0.4, 0.45]}
        >
          <capsuleGeometry args={[cat ? 0.075 : 0.09, 0.55, 4, 8]} />
          <Std color={fur} />
        </mesh>
      ))}
      <group ref={rear} position={[0, 0.75, 0]}>
        <mesh position={[0, 0.15, -0.35]} scale={[0.4, 0.38, 0.55]} castShadow>
          <sphereGeometry args={[1, 14, 10]} />
          <Std color={fur} />
        </mesh>
        {[-1, 1].map((sx, i) => (
          <mesh
            key={`b${sx}`}
            ref={(m) => {
              legs.current[i + 2] = m;
            }}
            position={[sx * 0.22, -0.3, -0.55]}
          >
            <capsuleGeometry args={[cat ? 0.085 : 0.1, 0.5, 4, 8]} />
            <Std color={fur} />
          </mesh>
        ))}
        {cat ? (
          <mesh ref={tail} position={[0, 0.75, -0.9]} rotation={[-0.25, 0, 0]}>
            <capsuleGeometry args={[0.055, 0.95, 4, 8]} />
            <Std color={dark} />
          </mesh>
        ) : croc ? (
          <mesh ref={tail} position={[0, 0.0, -1.15]} rotation={[1.35, 0, 0]}>
            <capsuleGeometry args={[0.16, 0.9, 4, 8]} />
            <Std color={dark} />
          </mesh>
        ) : (
          <mesh ref={tail} position={[0, 0.4, -0.85]} rotation={[0.9, 0, 0]}>
            <capsuleGeometry args={[0.06, 0.45, 4, 8]} />
            <Std color={fur} />
          </mesh>
        )}
      </group>
    </group>
  );
}

// Loro (guacamayo) que vuela a la altura de tu hombro, muy de Florida.
function FollowerParrot({ playing, follow }: { playing: boolean; follow?: Follow }) {
  const ref = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);
  const state = useRef({ x: PLAYER_START[0] - 1.4, z: PLAYER_START[2] + 0.4, heading: 0 });

  useFrame((frame, rawDelta) => {
    const g = ref.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.05);
    const s = state.current;
    const p = follow ?? campusRuntime.player;
    const t = frame.clock.elapsedTime;
    const hx = Math.sin(p.heading);
    const hz = Math.cos(p.heading);
    const side = playing ? 1.2 : -1.5;
    const back = playing ? 0.8 : 0;
    let tx = p.x - hx * back + hz * side;
    let tz = p.z - hz * back - hx * side;
    const age = follow ? null : petActionAge();
    const kind = age === null ? null : petAct.kind;
    if (kind && age !== null) {
      const fetch = kind === "play" && age > 0.55 && age < 2.1;
      tx = fetch ? petAct.bx : p.x + hx * 1.7;
      tz = fetch ? petAct.bz : p.z + hz * 1.7;
    }
    s.x += (tx - s.x) * Math.min(1, delta * 4);
    s.z += (tz - s.z) * Math.min(1, delta * 4);
    const moving = Math.hypot(tx - s.x, tz - s.z) > 0.3;
    const look = moving ? Math.atan2(tx - s.x, tz - s.z) : kind ? Math.atan2(p.x - s.x, p.z - s.z) : playing ? p.heading : 0;
    let diff = look - s.heading;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    s.heading += diff * Math.min(1, delta * 6);
    const loop = kind === "trick" && age !== null && age < 1.4 ? (age / 1.4) * Math.PI * 2 : 0;
    const bounce = kind === "pat" || kind === "treat" ? Math.abs(Math.sin(t * 8)) * 0.3 : 0;
    g.position.set(s.x, 3.3 + Math.sin(t * 3) * 0.18 + bounce + Math.sin(loop) * 0.9, s.z);
    g.rotation.y = s.heading + loop;
    if (!follow) {
      petPos.x = s.x;
      petPos.z = s.z;
      petHeading.h = s.heading;
    }
    const flap = Math.sin(t * (moving ? 22 : 12)) * (moving ? 0.9 : 0.5);
    if (wingL.current) wingL.current.rotation.z = flap;
    if (wingR.current) wingR.current.rotation.z = -flap;
  });

  return (
    <group ref={ref} scale={0.85}>
      <mesh scale={[0.32, 0.36, 0.5]} castShadow>
        <sphereGeometry args={[1, 14, 10]} />
        <Std color="#D7263D" />
      </mesh>
      <mesh position={[0, 0.38, 0.22]} castShadow>
        <sphereGeometry args={[0.26, 14, 10]} />
        <Std color="#D7263D" />
      </mesh>
      <mesh position={[0, 0.4, 0.34]} scale={[0.8, 0.8, 0.6]}>
        <sphereGeometry args={[0.18, 12, 8]} />
        <Std color="#FFF8F0" />
      </mesh>
      <mesh position={[0, 0.32, 0.5]} rotation={[Math.PI / 2 + 0.6, 0, 0]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <Std color="#2B2B2B" />
      </mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * 0.11, 0.46, 0.4]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <Std color="#111111" rough={0.2} />
        </mesh>
      ))}
      <mesh ref={wingL} position={[-0.3, 0.05, -0.05]}>
        <boxGeometry args={[0.7, 0.05, 0.42]} />
        <Std color="#2A6FDB" />
      </mesh>
      <mesh ref={wingR} position={[0.3, 0.05, -0.05]}>
        <boxGeometry args={[0.7, 0.05, 0.42]} />
        <Std color="#2A6FDB" />
      </mesh>
      {/* Cola larga de guacamayo */}
      <mesh position={[0, -0.12, -0.75]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[0.16, 0.04, 0.8]} />
        <Std color="#F2C14E" />
      </mesh>
    </group>
  );
}

export function CampusAnimals({ playing, pet }: { playing: boolean; pet: Pet }) {
  const dolphins = useMemo(() => DOLPHINS, []);
  return (
    <group>
      {dolphins.map((d, i) => (
        <Dolphin key={i} {...d} />
      ))}
      {PELICANS.map((p, i) => (
        <Pelican key={i} {...p} />
      ))}
      {TURTLES.map((t, i) => (
        <SeaTurtle key={i} {...t} />
      ))}
      <PetFollower pet={pet} playing={playing} />
      <PetFx pet={pet} />
    </group>
  );
}