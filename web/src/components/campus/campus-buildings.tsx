"use client";

import { CampusLabel } from "./campus-label";

const NAVY = "#003D54";
const TEAL = "#0092B6";
const CREAM = "#FFF9EC";
const BRASS = "#C9A227";
const CORAL = "#BF6B4A";

function Plaza({ radius, color = "#EFE6D2" }: { radius: number; color?: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
      <circleGeometry args={[radius, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function IngenieriaBuilding() {
  return (
    <group>
      <Plaza radius={5} />
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[6, 1, 6]} />
        <meshStandardMaterial color={NAVY} />
      </mesh>
      <mesh position={[0, 6, 0]} castShadow>
        <boxGeometry args={[3.6, 11, 3.6]} />
        <meshStandardMaterial color="#0D4A68" roughness={0.3} metalness={0.2} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 2 + i * 1.8, 0]} castShadow>
          <boxGeometry args={[3.7, 0.18, 3.7]} />
          <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 12.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 2.6, 6]} />
        <meshStandardMaterial color={CREAM} />
      </mesh>
      <CampusLabel text="Ingeniería" color={NAVY} position={[0, 14.5, 0]} />
    </group>
  );
}

function NegociosBuilding() {
  const tiers: Array<[number, number, number]> = [
    [7, 2.2, 6],
    [5.4, 2.2, 4.6],
    [4, 2.2, 3.4],
    [2.6, 2.2, 2.2],
  ];
  let y = 0;
  return (
    <group>
      <Plaza radius={5.2} />
      {tiers.map(([w, h, d], i) => {
        const pos = y + h / 2;
        y += h;
        return (
          <group key={i}>
            <mesh position={[0, pos, 0]} castShadow>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial color={BRASS} />
            </mesh>
            <mesh position={[0, y - 0.12, 0]} castShadow>
              <boxGeometry args={[w + 0.25, 0.25, d + 0.25]} />
              <meshStandardMaterial color={CREAM} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, y + 1.3, 0]} castShadow>
        <coneGeometry args={[0.7, 2.6, 4]} />
        <meshStandardMaterial color={CREAM} />
      </mesh>
      <CampusLabel text="Transformación de Negocios" color={BRASS} position={[0, y + 3.2, 0]} />
    </group>
  );
}

function BienestarBuilding() {
  return (
    <group>
      <Plaza radius={5.6} color="#DFF2EA" />
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[4.4, 4.6, 3.2, 28]} />
        <meshStandardMaterial color={TEAL} />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow>
        <sphereGeometry args={[4.4, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={CREAM} />
      </mesh>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 4.9, 1.7, Math.sin(a) * 4.9]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 3.3, 8]} />
            <meshStandardMaterial color={CREAM} />
          </mesh>
        );
      })}
      <mesh position={[0, 7.8, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 1.1, 10]} />
        <meshStandardMaterial color={CREAM} />
      </mesh>
      <CampusLabel text="Bienestar y Desarrollo Humano" color={TEAL} position={[0, 9.4, 0]} />
    </group>
  );
}

function DisenoBuilding() {
  const blocks: Array<[number, string, number]> = [
    [0, CORAL, 0],
    [1, NAVY, 0.45],
    [2, TEAL, 0.9],
  ];
  return (
    <group>
      <Plaza radius={5} color="#F3E4DC" />
      {blocks.map(([i, color, rotY]) => (
        <mesh key={i} position={[0, 2 + i * 4, 0]} rotation={[0, rotY, 0]} castShadow>
          <boxGeometry args={[5.2 - i * 0.8, 4, 5.2 - i * 0.8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      <mesh position={[4.2, 3.2, 1.6]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[2.4, 0.4, 12, 32]} />
        <meshStandardMaterial color={BRASS} roughness={0.3} metalness={0.4} />
      </mesh>
      <CampusLabel text="Diseño y Tecnologías de Comunicación" color={CORAL} position={[0, 14.5, 0]} />
    </group>
  );
}

export const BUILDING_LAYOUT: Record<
  string,
  { x: number; z: number; radius: number; Component: () => React.ReactElement }
> = {
  ingenieria: { x: 0, z: -18, radius: 6.5, Component: IngenieriaBuilding },
  "transformacion-de-negocios": { x: 18, z: 0, radius: 6.5, Component: NegociosBuilding },
  "bienestar-y-desarrollo-humano": { x: 0, z: 18, radius: 6.5, Component: BienestarBuilding },
  "diseno-y-tecnologias-de-comunicacion": { x: -18, z: 0, radius: 6.5, Component: DisenoBuilding },
};
