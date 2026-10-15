"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DEFAULT_AVATAR, HAIR_COLORS, OUTFIT_COLORS, SKIN_TONES, withGender, type Avatar, type Gender } from "./campus-avatar";
import { MiiAvatar } from "./campus-mii";
import { PLAYER_START } from "./campus-zones";

// Primer paso del creador: tres personajes en fila para elegir con quién
// empezar. El elegido saluda y se ilumina; luego se personaliza en detalle.

export const LINEUP: Record<Gender, Avatar> = {
  male: {
    ...withGender(DEFAULT_AVATAR, "male"),
    skin: SKIN_TONES[1],
    hairColor: HAIR_COLORS[0],
    top: "hoodie",
    outfit: OUTFIT_COLORS[1],
  },
  female: { ...withGender(DEFAULT_AVATAR, "female") },
  other: {
    ...withGender(DEFAULT_AVATAR, "other"),
    skin: SKIN_TONES[3],
    hairColor: HAIR_COLORS[7],
    top: "blazer",
    outfit: OUTFIT_COLORS[2],
    glasses: "round",
  },
};

export const LINEUP_ORDER: Gender[] = ["male", "female", "other"];
const SPACING = 3.3;

function LineupMii({ avatar, x, selected, index }: { avatar: Avatar; x: number; selected: boolean; index: number }) {
  const root = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + index * 0.7;
    const g = root.current;
    if (!g) return;
    // El elegido se adelanta un poco y crece; los demás respiran en su sitio.
    const targetScale = selected ? 1.08 : 0.94;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, targetScale, Math.min(1, delta * 6)));
    g.position.z = THREE.MathUtils.lerp(g.position.z, PLAYER_START[2] + (selected ? 0.8 : 0), Math.min(1, delta * 6));
    g.position.y = PLAYER_START[1] + (selected ? Math.abs(Math.sin(t * 3)) * 0.08 : Math.sin(t * 2) * 0.02);
    if (armR.current) {
      armR.current.rotation.z = selected ? 2.5 + Math.sin(t * 6) * 0.35 : 0.08;
    }
    if (armL.current) armL.current.rotation.z = -0.08;
    if (head.current) head.current.rotation.z = selected ? Math.sin(t * 1.5) * 0.08 : Math.sin(t) * 0.03;
    const m = ring.current?.material as THREE.MeshBasicMaterial | undefined;
    if (m) m.opacity = selected ? 0.65 + Math.sin(t * 3) * 0.25 : 0;
  });

  return (
    <group ref={root} position={[PLAYER_START[0] + x, PLAYER_START[1], PLAYER_START[2]]}>
      <MiiAvatar avatar={avatar} armRRef={armR} armLRef={armL} headRef={head} />
      <mesh ref={ring} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.2, 48]} />
        <meshBasicMaterial color={[2.4, 1.8, 0.7]} transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function CampusLineup({ selected }: { selected: Gender }) {
  return (
    <group>
      {LINEUP_ORDER.map((g, i) => (
        <LineupMii key={g} avatar={LINEUP[g]} x={(i - 1) * SPACING} selected={selected === g} index={i} />
      ))}
    </group>
  );
}
