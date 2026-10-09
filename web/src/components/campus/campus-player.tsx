"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SPEED = 6;
const TURN_SMOOTHING = 10;

export const BOUNDARY_RADIUS = 27;

const MOVE_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

export function CampusPlayer({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  const keys = useRef<Record<string, boolean>>({});
  const walkCycle = useRef(0);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (MOVE_KEYS.has(e.code)) e.preventDefault();
      keys.current[e.code] = true;
    }
    function onKeyUp(e: KeyboardEvent) {
      keys.current[e.code] = false;
    }
    function onBlur() {
      keys.current = {};
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

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const g = groupRef.current;
    if (!g) return;
    const k = keys.current;

    let ix = 0;
    let iz = 0;
    if (k.KeyW || k.ArrowUp) iz -= 1;
    if (k.KeyS || k.ArrowDown) iz += 1;
    if (k.KeyA || k.ArrowLeft) ix -= 1;
    if (k.KeyD || k.ArrowRight) ix += 1;

    const len = Math.hypot(ix, iz);
    let moving = false;
    if (len > 0.01) {
      ix /= len;
      iz /= len;
      const nx = g.position.x + ix * SPEED * delta;
      const nz = g.position.z + iz * SPEED * delta;
      if (Math.hypot(nx, nz) < BOUNDARY_RADIUS) {
        g.position.x = nx;
        g.position.z = nz;
        moving = true;
      }
      const targetAngle = Math.atan2(ix, iz);
      let diff = targetAngle - g.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      g.rotation.y += diff * Math.min(1, delta * TURN_SMOOTHING);
      walkCycle.current += delta * SPEED * 1.6;
    }

    const swing = moving ? Math.sin(walkCycle.current) * 0.55 : 0;
    if (leftLeg.current) leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, swing, 0.3);
    if (rightLeg.current) rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, -swing, 0.3);
    if (leftArm.current) leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, -swing, 0.3);
    if (rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, swing, 0.3);
  });

  const skin = "#D9A273";
  const outfit = "#10101A";

  return (
    <group ref={groupRef} position={[0, 0, 16]}>
      {/* Torso */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <capsuleGeometry args={[0.36, 0.7, 4, 12]} />
        <meshStandardMaterial color={outfit} roughness={0.65} />
      </mesh>
      {/* Cabeza */}
      <mesh position={[0, 2.35, 0]} castShadow>
        <sphereGeometry args={[0.3, 20, 16]} />
        <meshStandardMaterial color={skin} roughness={0.5} />
      </mesh>
      {/* Piernas (pivote en la cadera para que el balanceo se vea natural) */}
      <group ref={leftLeg} position={[-0.16, 1.15, 0]}>
        <mesh position={[0, -0.33, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.55, 4, 8]} />
          <meshStandardMaterial color={outfit} roughness={0.7} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.16, 1.15, 0]}>
        <mesh position={[0, -0.33, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.55, 4, 8]} />
          <meshStandardMaterial color={outfit} roughness={0.7} />
        </mesh>
      </group>
      {/* Brazos */}
      <group ref={leftArm} position={[-0.48, 1.85, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.48, 1.85, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
