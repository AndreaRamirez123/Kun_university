"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getDotTexture } from "./campus-dot-texture";
import { seeded } from "./campus-random";
import { campusRuntime } from "./campus-runtime";

// Edificios low-poly de la isla. Cada uno se dibuja en coordenadas locales
// (frente hacia +z) y la escena lo coloca mirando al centro del campus.
// Las piezas emisivas superan 1.0 de luminancia a propósito: son las que
// recoge el bloom del post-procesado.

function Mat({
  color,
  roughness = 0.8,
  metalness = 0,
  emissive,
  emissiveIntensity = 1,
}: {
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      flatShading
      emissive={emissive ?? "#000000"}
      emissiveIntensity={emissive ? emissiveIntensity : 0}
    />
  );
}

function Box({
  args,
  position,
  rotation,
  children,
}: {
  args: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      {children}
    </mesh>
  );
}

function useTime(cb: (t: number, delta: number) => void) {
  useFrame((state, delta) => cb(state.clock.elapsedTime, delta));
}

export function EngineeringBuilding() {
  const beacon = useRef<THREE.Mesh>(null);
  useTime((t) => {
    if (beacon.current) beacon.current.visible = Math.sin(t * 4) > 0;
  });
  return (
    <group>
      <Box args={[9, 1.6, 9]} position={[0, 0.8, 0]}>
        <Mat color="#22346E" />
      </Box>
      <Box args={[5.4, 15, 5.4]} position={[0, 9, 0]}>
        <Mat color="#3D6FD9" roughness={0.3} metalness={0.3} />
      </Box>
      {Array.from({ length: 8 }, (_, i) => (
        <Box key={i} args={[5.6, 0.28, 5.6]} position={[0, 3.2 + i * 1.7, 0]}>
          <Mat color="#A9C8FF" emissive="#5C8CFF" emissiveIntensity={2.2} />
        </Box>
      ))}
      <mesh position={[0, 18.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 4, 6]} />
        <Mat color="#DDE6FF" />
      </mesh>
      <mesh ref={beacon} position={[0, 20.6, 0]}>
        <sphereGeometry args={[0.4, 10, 8]} />
        <meshBasicMaterial color={[4, 0.9, 0.9]} toneMapped={false} />
      </mesh>
      {[-3.6, 3.6].map((x) => (
        <Box key={x} args={[1.4, 2.6, 1.4]} position={[x, 2.9, 3.6]}>
          <Mat color="#5B86E6" />
        </Box>
      ))}
    </group>
  );
}

export function BusinessBuilding() {
  const tiers: Array<[number, number, number]> = [
    [10, 3, 8],
    [7.6, 3, 6],
    [5.4, 3, 4.4],
    [3.2, 3, 2.8],
  ];
  const bands = tiers.map((_, i) => tiers.slice(0, i + 1).reduce((y, s) => y + s[1], 0));
  return (
    <group>
      {tiers.map(([w, h, d], i) => (
        <group key={i}>
          <Box args={[w, h, d]} position={[0, bands[i] - h / 2, 0]}>
            <Mat color="#F5B841" />
          </Box>
          <Box args={[w + 0.2, 0.35, d + 0.2]} position={[0, bands[i] - 0.2, 0]}>
            <Mat color="#FFF6E8" />
          </Box>
          {/* Ventanas iluminadas en cada piso */}
          <Box args={[w * 0.7, 0.5, 0.05]} position={[0, bands[i] - h / 2, d / 2 + 0.03]}>
            <Mat color="#FFE7A8" emissive="#FFB347" emissiveIntensity={1.8} />
          </Box>
        </group>
      ))}
      <mesh position={[0, bands[3] + 1.5, 0]} castShadow>
        <coneGeometry args={[0.8, 3, 4]} />
        <Mat color="#FFF6E8" />
      </mesh>
      <Box args={[2.4, 3.2, 0.3]} position={[0, 1.6, 4.05]}>
        <Mat color="#3A2410" />
      </Box>
    </group>
  );
}

export function WellnessBuilding() {
  const columns = useMemo(
    () => Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2),
    [],
  );
  return (
    <group>
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.6, 4.8, 3.2, 24]} />
        <Mat color="#52C7A7" />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow>
        <sphereGeometry args={[4.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Mat color="#F2FFF9" />
      </mesh>
      {columns.map((a) => (
        <mesh key={a} position={[Math.cos(a) * 5.4, 1.7, Math.sin(a) * 5.4]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 3.4, 6]} />
          <Mat color="#FFFFFF" />
        </mesh>
      ))}
      <mesh position={[0, 3.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[5.4, 0.3, 6, 32]} />
        <Mat color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 8.4, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.2, 8]} />
        <Mat color="#FFFFFF" emissive="#9FFFE0" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

export function DesignBuilding() {
  const ring = useRef<THREE.Mesh>(null);
  useTime((t) => {
    if (ring.current) ring.current.rotation.y = t * 0.8;
  });
  const blocks = ["#C2387A", "#8E3FB8", "#FF7A59"];
  return (
    <group>
      {blocks.map((color, i) => (
        <Box key={i} args={[5.2 - i * 0.8, 4, 5.2 - i * 0.8]} position={[0, 2 + i * 4, 0]} rotation={[0, i * 0.45, 0]}>
          <Mat color={color} />
        </Box>
      ))}
      <mesh ref={ring} position={[4.6, 3.2, 1.6]} castShadow>
        <torusGeometry args={[2.6, 0.45, 10, 32]} />
        <Mat color="#FFD27A" roughness={0.3} metalness={0.4} emissive="#FF9A3C" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

export function AdmissionsBuilding() {
  return (
    <group>
      <Box args={[12, 5.4, 6.4]} position={[0, 2.7, 0]}>
        <Mat color="#FFF4E8" />
      </Box>
      {[1.3, 2.5, 3.7].map((y) => (
        <Box key={y} args={[12.1, 0.35, 6.5]} position={[0, y, 0]}>
          <Mat color="#E8735A" />
        </Box>
      ))}
      <Box args={[3.4, 10, 3.4]} position={[0, 5, 0.6]}>
        <Mat color="#FFF4E8" />
      </Box>
      <mesh position={[0, 10.7, 0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1.7, 1.7, 1.4, 20, 1, false, 0, Math.PI]} />
        <Mat color="#7FD3C8" />
      </mesh>
      {/* Neón vertical estilo Miami Deco */}
      {[-1, 0, 1].map((i) => (
        <Box key={i} args={[0.5, 6, 0.2]} position={[i * 0.9, 5.6, 2.35]}>
          <Mat color="#FF9A82" emissive="#FF6A4A" emissiveIntensity={2} />
        </Box>
      ))}
      <Box args={[2.6, 2.8, 0.3]} position={[0, 1.4, 3.25]}>
        <Mat color="#2A1758" />
      </Box>
    </group>
  );
}

const STREAM_COUNT = 260;

// Centro del campus: fuente con anillos orbitando y un flujo de partículas que
// sube en espiral, la metáfora del currículo que se actualiza solo.
export function CurriculumCore() {
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const orbs = useRef<Array<THREE.Mesh | null>>([]);
  const stream = useRef<THREE.Points>(null);

  const seeds = useMemo(() => {
    const rnd = seeded(11);
    return Array.from({ length: STREAM_COUNT }, () => ({ phase: rnd(), radius: 0.6 + rnd() * 2.4, speed: 0.25 + rnd() * 0.5 }));
  }, []);
  const positions = useMemo(() => new Float32Array(STREAM_COUNT * 3), []);

  useTime((t) => {
    if (ringA.current) {
      ringA.current.rotation.x = t * 0.6;
      ringA.current.rotation.y = t * 0.4;
    }
    if (ringB.current) {
      ringB.current.rotation.y = -t * 0.8;
      ringB.current.rotation.z = t * 0.5;
    }
    orbs.current.forEach((o, i) => {
      if (!o) return;
      const a = t * 0.9 + i * 2.094;
      o.position.set(Math.cos(a) * 3, 5.2 + Math.sin(t * 2 + i) * 0.4, Math.sin(a) * 3);
    });
    const points = stream.current;
    if (!points) return;
    const attr = points.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < STREAM_COUNT; i++) {
      const p = seeds[i];
      const life = (p.phase + t * p.speed * 0.25) % 1;
      const angle = life * Math.PI * 6 + p.phase * 20;
      const r = p.radius * (1 - life * 0.6);
      attr.setXYZ(i, Math.cos(angle) * r, 1 + life * 9, Math.sin(angle) * r);
    }
    attr.needsUpdate = true;
  });

  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4, 4.3, 0.8, 32]} />
        <Mat color="#FFF4E8" />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[3.5, 3.5, 0.1, 32]} />
        <Mat color="#58C4DD" roughness={0.2} emissive="#1E9FCC" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, 2.6, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.5, 4, 8]} />
        <Mat color="#FFF4E8" />
      </mesh>
      <mesh ref={ringA} position={[0, 5.2, 0]}>
        <torusGeometry args={[2.4, 0.12, 8, 48]} />
        <meshBasicMaterial color={[2.6, 2, 0.9]} toneMapped={false} />
      </mesh>
      <mesh ref={ringB} position={[0, 5.2, 0]}>
        <torusGeometry args={[1.8, 0.1, 8, 48]} />
        <meshBasicMaterial color={[2.6, 1.1, 0.5]} toneMapped={false} />
      </mesh>
      {[
        [1.2, 1.6, 3],
        [2.4, 2.4, 2.4],
        [2.6, 2, 0.9],
      ].map((c, i) => (
        <mesh
          key={i}
          ref={(m) => {
            orbs.current[i] = m;
          }}
          position={[0, 5.2, 0]}
        >
          <sphereGeometry args={[0.38, 12, 10]} />
          <meshBasicMaterial color={c as [number, number, number]} toneMapped={false} />
        </mesh>
      ))}
      <points ref={stream}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial map={getDotTexture()} alphaTest={0.02}
          size={0.3}
          color={[1.6, 1.2, 3]}
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

const SMOKE_COUNT = 40;

// Plataforma de lanzamiento de las certificaciones. El cohete despega cuando
// la interfaz escribe campusRuntime.launchAt.
export function LaunchPad() {
  const rocket = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Mesh>(null);
  const smoke = useRef<THREE.InstancedMesh>(null);
  // Estado de simulación mutable: vive en refs, no en estado de React.
  const smokeState = useRef(
    Array.from({ length: SMOKE_COUNT }, () => ({ x: 0, y: -10, z: 0, vx: 0, vy: 0, vz: 0, life: 0 })),
  );
  const dummy = useRef(new THREE.Object3D());
  const spawnIndex = useRef(0);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const r = rocket.current;
    const f = flame.current;
    if (!r || !f) return;
    const t = state.clock.elapsedTime;
    const launchAt = campusRuntime.launchAt;
    let emitting = false;
    if (launchAt) {
      const lt = (performance.now() - launchAt) / 1000;
      if (lt < 7) {
        r.position.y = 1 + Math.max(0, lt - 0.6) ** 2 * 3;
        r.rotation.y = lt * 0.4;
        f.visible = true;
        f.scale.set(1, 1 + Math.sin(t * 40) * 0.25, 1);
        emitting = r.position.y < 60;
      } else if (lt < 9) {
        r.position.y = 200;
        f.visible = false;
      } else {
        r.position.y = 1;
        r.rotation.y = 0;
        campusRuntime.launchAt = 0;
      }
    } else {
      f.visible = false;
    }

    const mesh = smoke.current;
    if (!mesh) return;
    if (emitting) {
      for (let k = 0; k < 2; k++) {
        const p = smokeState.current[spawnIndex.current++ % SMOKE_COUNT];
        p.x = 0;
        p.y = r.position.y - 1.5;
        p.z = 0;
        const a = Math.random() * Math.PI * 2;
        p.vx = Math.cos(a) * 2.5;
        p.vz = Math.sin(a) * 2.5;
        p.vy = -1.5;
        p.life = 1;
      }
    }
    const d = dummy.current;
    for (let i = 0; i < SMOKE_COUNT; i++) {
      const p = smokeState.current[i];
      if (p.life > 0) {
        p.life -= delta * 0.6;
        p.x += p.vx * delta;
        p.y = Math.max(0.6, p.y + p.vy * delta);
        p.z += p.vz * delta;
        p.vx *= 0.97;
        p.vz *= 0.97;
      }
      const s = p.life > 0 ? (1.4 - p.life) * 1.6 : 0;
      d.position.set(p.x, p.y, p.z);
      d.scale.setScalar(s);
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.4, 4.8, 1, 24]} />
        <Mat color="#9A93A8" />
      </mesh>
      {/* Torre de servicio */}
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} args={[0.35, 12, 0.35]} position={[3 + (i % 2) * 1.4, 6, -1 + (i > 1 ? 2 : 0)]}>
          <Mat color="#E8735A" />
        </Box>
      ))}
      {[3, 6, 9].map((y) => (
        <Box key={y} args={[1.8, 0.25, 2.3]} position={[3.7, y, 0]}>
          <Mat color="#E8735A" />
        </Box>
      ))}
      <group ref={rocket} position={[0, 1, 0]}>
        <mesh position={[0, 3.5, 0]} castShadow>
          <cylinderGeometry args={[1, 1.1, 7, 16]} />
          <Mat color="#FFF8F0" />
        </mesh>
        <mesh position={[0, 8.2, 0]} castShadow>
          <coneGeometry args={[1, 2.4, 16]} />
          <Mat color="#E8735A" />
        </mesh>
        <mesh position={[0, 5.6, 1.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.2, 16]} />
          <Mat color="#3D6FD9" emissive="#5C8CFF" emissiveIntensity={1.8} />
        </mesh>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <Box key={i} args={[0.2, 2, 1.4]} position={[Math.cos(a) * 1.1, 1, Math.sin(a) * 1.1]} rotation={[0, -a, 0]}>
              <Mat color="#E8735A" />
            </Box>
          );
        })}
        <mesh ref={flame} position={[0, -1.4, 0]} rotation={[Math.PI, 0, 0]} visible={false}>
          <coneGeometry args={[0.8, 3, 12]} />
          <meshBasicMaterial color={[4, 2, 0.6]} toneMapped={false} />
        </mesh>
      </group>
      <instancedMesh ref={smoke} args={[undefined, undefined, SMOKE_COUNT]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#F4E6F0" flatShading transparent opacity={0.85} />
      </instancedMesh>
    </group>
  );
}

export const BUILDINGS: Record<string, () => React.ReactElement> = {
  ing: EngineeringBuilding,
  neg: BusinessBuilding,
  bie: WellnessBuilding,
  dis: DesignBuilding,
  adm: AdmissionsBuilding,
};
