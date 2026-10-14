"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { CHARACTERS, characterById } from "./campus-characters";
import type { Avatar } from "./campus-zones";

export type MotionState = "idle" | "walk" | "run" | "wave";
export type Motion = { state: MotionState; speed: number };

/** Altura de los modelos (~1.87) escalada a la del mundo del campus (~3). */
export const CHARACTER_SCALE = 1.6;

// Sin Draco (evita descargar el decodificador de un CDN), con meshopt.
const LOAD_ARGS = [false, true] as const;
for (const c of CHARACTERS) useGLTF.preload(c.url, ...LOAD_ARGS);

/** Carga todos los personajes de una vez, para que cambiar de uno a otro sea instantáneo. */
export function usePreloadedCharacters() {
  return useGLTF(
    CHARACTERS.map((c) => c.url),
    ...LOAD_ARGS,
  );
}

const CLIP: Record<MotionState, string> = { idle: "Idle", walk: "Walk", run: "Run", wave: "Wave" };

type Registry = { skin: THREE.MeshStandardMaterial[]; skinDark: THREE.MeshStandardMaterial[]; top: THREE.MeshStandardMaterial[] };

function partName(o: THREE.Object3D) {
  // Una malla con varios materiales llega como grupo "X_Body" con hijas "X_Body_1"...
  return o.parent && o.parent.type === "Group" && o.parent.name ? o.parent.name : o.name;
}

// Accesorios armados con primitivas. Se arman en el espacio del modelo y se
// cuelgan del hueso correspondiente, así siguen la animación de la cabeza o el pecho.
function buildAccessory(kind: Avatar["accessory"], color: string, box: THREE.Box3): THREE.Object3D | null {
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const g = new THREE.Group();
  const mat = (c: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, ...extra });
  const r = size.x * 0.56;
  if (kind === "cap") {
    const crown = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(color));
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.95, r * 0.95, r * 0.08, 20, 1, false, -Math.PI / 2, Math.PI), mat(color));
    brim.position.set(0, 0, r * 0.35);
    brim.scale.set(1, 1, 0.9);
    const badge = new THREE.Mesh(new THREE.CircleGeometry(r * 0.28, 16), mat("#FFC85C", { emissive: "#FF9A3C", emissiveIntensity: 0.4 }));
    badge.position.set(0, r * 0.45, r * 0.86);
    badge.rotation.x = -0.5;
    g.add(crown, brim, badge);
    g.position.set(center.x, box.max.y - size.y * 0.2, center.z - size.z * 0.02);
  } else if (kind === "headphones") {
    // Medio toro en el plano XY: un arco de oreja a oreja por encima de la cabeza.
    const band = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, r * 0.09, 8, 28, Math.PI), mat("#24123F"));
    g.add(band);
    for (const side of [-1, 1]) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.32, r * 0.32, r * 0.24, 18), mat("#24123F"));
      cup.rotation.z = Math.PI / 2;
      cup.position.set(side * r * 1.02, -r * 0.05, 0);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.3, r * 0.05, 6, 18), mat(color, { emissive: color, emissiveIntensity: 0.6 }));
      ring.rotation.y = Math.PI / 2;
      ring.position.set(side * r * 1.15, -r * 0.05, 0);
      g.add(cup, ring);
    }
    g.position.set(center.x, center.y + size.y * 0.06, center.z);
  } else if (kind === "backpack") {
    // El ancho del cuerpo incluye los brazos abiertos de la pose de referencia,
    // así que la mochila se dimensiona por la profundidad y la altura del torso.
    const w = size.z * 1.25;
    const h = size.y * 0.3;
    const d = size.z * 0.55;
    const pack = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, h * 0.38, d * 0.3), mat("#24123F"));
    pocket.position.set(0, -h * 0.2, -d * 0.6);
    // Parche con la K de KUN.
    const patch = new THREE.Mesh(new THREE.CircleGeometry(w * 0.16, 16), mat("#FFC85C", { emissive: "#FF9A3C", emissiveIntensity: 0.4 }));
    patch.position.set(0, h * 0.18, -d * 0.51);
    patch.rotation.y = Math.PI;
    g.add(pack, pocket, patch);
    g.position.set(0, center.y + size.y * 0.12, box.min.z - d * 0.35);
  } else {
    return null;
  }
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true;
  });
  return g;
}

export function CharacterModel({ avatar, motion }: { avatar: Avatar; motion: React.RefObject<Motion> }) {
  const def = characterById(avatar.character);
  const gltf = useGLTF(def.url, ...LOAD_ARGS);
  const holder = useRef<THREE.Group>(null);
  const registry = useRef<Registry>({ skin: [], skinDark: [], top: [] });

  // Copia independiente del modelo (esqueleto y materiales propios).
  const model = useMemo(() => cloneSkinned(gltf.scene), [gltf.scene]);
  // Mezclador propio por copia del modelo. Se crea dentro del efecto: así cada
  // montaje (incluido el doble montaje del modo estricto) tiene el suyo y la
  // limpieza nunca deja acciones a medio liberar.
  const anim = useRef<{ mixer: THREE.AnimationMixer; actions: Record<string, THREE.AnimationAction> } | null>(null);
  const current = useRef<MotionState | null>(null);
  useEffect(() => {
    const mixer = new THREE.AnimationMixer(model);
    const actions = Object.fromEntries(gltf.animations.map((clip) => [clip.name, mixer.clipAction(clip)]));
    anim.current = { mixer, actions };
    current.current = null;
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      anim.current = null;
    };
  }, [model, gltf.animations]);

  // Prepara materiales y sombras de la copia, y oculta lo que no va (la pistola).
  useEffect(() => {
    const reg: Registry = { skin: [], skinDark: [], top: [] };
    model.traverse((o) => {
      if (def.hide?.includes(o.name)) o.visible = false;
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
      mesh.material = mat;
      if (def.skin.includes(mat.name)) (mat.name.endsWith("Darker") ? reg.skinDark : reg.skin).push(mat);
      if (mat.name === def.top.material && partName(mesh).startsWith(def.top.mesh)) reg.top.push(mat);
    });
    registry.current = reg;
  }, [model, def]);

  // Tono de piel y color de la prenda superior.
  useEffect(() => {
    const reg = registry.current;
    reg.skin.forEach((m) => m.color.set(avatar.skin));
    reg.skinDark.forEach((m) => m.color.set(avatar.skin).multiplyScalar(0.82));
    reg.top.forEach((m) => m.color.set(avatar.outfit));
  }, [model, def, avatar.skin, avatar.outfit]);

  // Accesorio colgado del hueso de la cabeza o del pecho.
  useEffect(() => {
    const head = def.helmet && avatar.accessory !== "backpack" ? null : avatar.accessory;
    if (!head || head === "none") return;
    model.traverse((o) => {
      const mesh = o as THREE.SkinnedMesh;
      if (mesh.isSkinnedMesh) mesh.skeleton.pose();
    });
    model.updateMatrixWorld(true);
    const toModel = model.matrixWorld.clone().invert();
    const partBox = (suffix: string) => {
      const part = model.getObjectByName(`${def.top.mesh.split("_")[0]}_${suffix}`);
      const box = new THREE.Box3();
      if (part) box.setFromObject(part, true).applyMatrix4(toModel);
      return box;
    };
    const isHead = head !== "backpack";
    const box = partBox(isHead ? "Head" : "Body");
    if (box.isEmpty()) return;
    const acc = buildAccessory(head, avatar.outfit, box);
    const bone = model.getObjectByName(isHead ? "Head" : "Chest");
    if (!acc || !bone) return;
    model.add(acc);
    model.updateMatrixWorld(true);
    bone.attach(acc);
    return () => {
      acc.removeFromParent();
      acc.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          (m.material as THREE.Material).dispose();
        }
      });
    };
  }, [model, def, avatar.accessory, avatar.outfit]);

  // Mezcla suave entre animaciones según lo que hace el personaje.
  useFrame((_, delta) => {
    const m = motion.current;
    const a = anim.current;
    if (!m || !a) return;
    const { mixer, actions } = a;
    mixer.update(Math.min(delta, 0.1));
    const name = CLIP[m.state];
    const action = actions[name];
    if (!action) return;
    if (current.current !== m.state) {
      const prev = current.current ? actions[CLIP[current.current]] : null;
      action.reset().setEffectiveWeight(1).fadeIn(0.25).play();
      prev?.fadeOut(0.25);
      current.current = m.state;
    } else if (!action.isRunning()) {
      action.reset().setEffectiveWeight(1).play();
    }
    // Pasos al ritmo de la velocidad real.
    if (m.state === "walk") action.timeScale = Math.max(0.6, m.speed / 4.2);
    else if (m.state === "run") action.timeScale = Math.max(0.8, m.speed / 9);
    else action.timeScale = 1;
  });


  return (
    <group ref={holder} scale={CHARACTER_SCALE}>
      <primitive object={model} />
    </group>
  );
}
