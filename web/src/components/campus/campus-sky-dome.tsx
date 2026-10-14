"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getDotTexture } from "./campus-dot-texture";
import { seeded } from "./campus-random";
import type { SkyPreset } from "./campus-sky";

// Cielo compartido por la isla y las aulas: gradiente según la hora de
// Florida, sol (con franjas Art Deco cuando está bajo) o luna, y estrellas.

const VERTEX = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uHorizon;
  uniform vec3 uMid;
  uniform vec3 uTop;
  uniform vec3 uBelow;
  varying vec3 vDir;
  void main() {
    float h = vDir.y;
    vec3 c = mix(uHorizon, uMid, smoothstep(-0.02, 0.2, h));
    c = mix(c, uTop, smoothstep(0.16, 0.65, h));
    if (h < -0.02) c = uBelow;
    gl_FragColor = vec4(c, 1.0);
  }
`;

export function SkyDome({ sky, radius, below }: { sky: SkyPreset; radius: number; below?: THREE.Color }) {
  const ref = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uHorizon: { value: new THREE.Color() },
      uMid: { value: new THREE.Color() },
      uTop: { value: new THREE.Color() },
      uBelow: { value: new THREE.Color() },
    }),
    [],
  );
  // Copia los colores del momento del día a los uniforms del shader.
  useFrame(() => {
    const mat = ref.current?.material as THREE.ShaderMaterial | undefined;
    if (!mat) return;
    mat.uniforms.uHorizon.value.copy(sky.horizon);
    mat.uniforms.uMid.value.copy(sky.mid);
    mat.uniforms.uTop.value.copy(sky.top);
    mat.uniforms.uBelow.value.copy(below ?? sky.horizon);
  });
  return (
    <mesh ref={ref} renderOrder={-1}>
      <sphereGeometry args={[radius, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
      />
    </mesh>
  );
}

const CENTER = new THREE.Vector3();

/**
 * Sol o luna. `scale` acerca el astro para domos más chicos (las aulas).
 * Más brillante que 1.0 a propósito: el bloom lo convierte en halo.
 */
export function CelestialBody({ sky, scale = 1 }: { sky: SkyPreset; scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  const isMoon = sky.night >= 0.5;
  // Franjas Art Deco solo con el sol bajo (amanecer y atardecer).
  const stripes = !isMoon && sky.day < 0.6;
  const sunColor = useMemo(() => {
    const low = new THREE.Color(2.2, 1.55, 0.7);
    const high = new THREE.Color(2.6, 2.45, 2.0);
    return low.lerp(high, sky.day);
  }, [sky.day]);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    g.position.copy(sky.body).multiplyScalar(scale);
    // Mira al centro de su domo (el aula está desplazada respecto de la isla).
    if (g.parent) g.parent.getWorldPosition(CENTER);
    else CENTER.set(0, 0, 0);
    g.lookAt(CENTER);
  });

  const r = (isMoon ? 13 : 22) * scale;
  return (
    <group ref={ref}>
      {isMoon ? (
        <>
          <mesh>
            <circleGeometry args={[r, 48]} />
            <meshBasicMaterial color={[1.5, 1.55, 1.75]} toneMapped={false} fog={false} />
          </mesh>
          {[
            [-0.35, 0.25, 0.22],
            [0.3, -0.1, 0.16],
            [-0.05, -0.42, 0.12],
            [0.4, 0.4, 0.09],
          ].map(([x, y, s], i) => (
            <mesh key={i} position={[x * r, y * r, 0.05]}>
              <circleGeometry args={[s * r, 24]} />
              <meshBasicMaterial color={[1.05, 1.1, 1.3]} toneMapped={false} fog={false} />
            </mesh>
          ))}
          {/* Halo lunar */}
          <mesh position={[0, 0, -0.1]}>
            <circleGeometry args={[r * 2.2, 48]} />
            <meshBasicMaterial
              color={[0.35, 0.42, 0.75]}
              transparent
              opacity={0.25}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
              fog={false}
            />
          </mesh>
        </>
      ) : (
        <>
          <mesh>
            <circleGeometry args={[r, 48]} />
            <meshBasicMaterial color={sunColor} toneMapped={false} fog={false} />
          </mesh>
          {stripes &&
            [-4, -8, -11.5, -14.5, -17].map((y, i) => (
              <mesh key={y} position={[0, y * scale, 0.1]}>
                <planeGeometry args={[50 * scale, (1.2 + i * 0.5) * scale]} />
                <meshBasicMaterial color={sky.mid} fog={false} />
              </mesh>
            ))}
        </>
      )}
    </group>
  );
}

const STAR_COUNT = 700;

export function Stars({ sky, radius }: { sky: SkyPreset; radius: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rnd = seeded(77);
    const arr = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      // Solo el hemisferio de arriba, más denso hacia el cenit.
      const theta = rnd() * Math.PI * 2;
      const y = 0.08 + Math.sqrt(rnd()) * 0.92;
      const rr = Math.sqrt(1 - y * y);
      arr.set([Math.cos(theta) * rr * radius, y * radius, Math.sin(theta) * rr * radius], i * 3);
    }
    return arr;
  }, [radius]);
  useFrame((state) => {
    const mat = ref.current?.material as THREE.PointsMaterial | undefined;
    if (!mat) return;
    const target = Math.max(0, (sky.night - 0.35) / 0.65);
    mat.opacity = target * (0.85 + Math.sin(state.clock.elapsedTime * 1.7) * 0.1);
    if (ref.current) ref.current.visible = target > 0.01;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={getDotTexture()}
        alphaTest={0.02}
        size={radius / 160}
        color={[1.6, 1.6, 1.9]}
        transparent
        opacity={0}
        depthWrite={false}
        fog={false}
        toneMapped={false}
      />
    </points>
  );
}
