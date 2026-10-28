"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePick } from "@/i18n/locale-context";
import { OPTION_LABELS, type Pet } from "./campus-avatar";
import { playChime } from "./campus-audio";
import { campusRuntime } from "./campus-runtime";
import { earn } from "./campus-wallet";

// Consentir a la mascota: acariciarla, darle un premio, jugar a la pelota o
// pedirle un truco. La mascota reacciona en 3D (corazones, saltos, va por la
// pelota) y su felicidad sube; con el tiempo baja si no la consientes.

export type PetAction = "pat" | "treat" | "play" | "trick";

/** Cuánto dura cada reacción (segundos). */
export const PET_ACTION_SECONDS: Record<PetAction, number> = { pat: 2.8, treat: 2.6, play: 3.6, trick: 2.4 };
const HAPPY_GAIN: Record<PetAction, number> = { pat: 8, treat: 12, play: 18, trick: 10 };

/** Reacción en curso de la mascota propia (la leen la mascota y los efectos 3D). */
export const petAct = { kind: null as PetAction | null, at: -99, bx: 0, bz: 0 };
/** Dónde está la mascota propia (la escribe la mascota cada frame). */
export const petPos = { x: 0, z: 0 };

const now = () => performance.now() / 1000;

/** Segundos desde que empezó la reacción actual, o null si no hay ninguna. */
export function petActionAge() {
  if (!petAct.kind) return null;
  const age = now() - petAct.at;
  if (age > PET_ACTION_SECONDS[petAct.kind]) {
    petAct.kind = null;
    return null;
  }
  return age;
}

// ---------------------------------------------------------------- felicidad

const KEY = "kun-pet-v1";
/** Puntos de felicidad que se pierden por hora sin consentirla. */
const DECAY_PER_HOUR = 6;
type Mood = { happy: number; at: number };
let mood: Mood | null = null;
const listeners = new Set<() => void>();

function load(): Mood {
  if (mood) return mood;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null") as Mood | null;
    mood = raw && typeof raw.happy === "number" ? raw : { happy: 60, at: Date.now() };
  } catch {
    mood = { happy: 60, at: Date.now() };
  }
  return mood;
}

/** Felicidad actual (0–100) teniendo en cuenta el tiempo sin consentirla. */
function currentHappy(m: Mood) {
  return Math.max(0, Math.min(100, m.happy - ((Date.now() - m.at) / 3_600_000) * DECAY_PER_HOUR));
}

export function addHappy(n: number) {
  const m = load();
  mood = { happy: Math.min(100, currentHappy(m) + n), at: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(mood));
  } catch {
    /* ignorado */
  }
  listeners.forEach((l) => l());
}

const SERVER: Mood = { happy: 60, at: 0 };
function useMood() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    load,
    () => SERVER,
  );
}

/** Lanza una reacción de la mascota propia. */
export function pamperPet(kind: PetAction) {
  const p = campusRuntime.player;
  // La pelota cae unos metros por delante del jugador, dentro de la isla.
  const d = 8;
  let bx = p.x + Math.sin(p.heading) * d;
  let bz = p.z + Math.cos(p.heading) * d;
  const r = Math.hypot(bx, bz);
  if (r > 44) {
    bx = (bx / r) * 44;
    bz = (bz / r) * 44;
  }
  Object.assign(petAct, { kind, at: now(), bx, bz });
  addHappy(HAPPY_GAIN[kind]);
  earn("pet");
  playChime();
}

// ---------------------------------------------------------------- panel

const COPY = {
  es: {
    title: (name: string) => `Consentir a ${name}`,
    happy: "Felicidad",
    actions: { pat: "Acariciar", treat: "Premio", play: "Jugar", trick: "Truco" } as Record<PetAction, string>,
    moods: ["Te extraña 🥺", "Contento", "¡Feliz!", "¡Te adora! 💖"],
  },
  en: {
    title: (name: string) => `Pamper ${name}`,
    happy: "Happiness",
    actions: { pat: "Pet", treat: "Treat", play: "Play", trick: "Trick" } as Record<PetAction, string>,
    moods: ["Misses you 🥺", "Content", "Happy!", "Adores you! 💖"],
  },
};

const ICONS: Record<PetAction, string> = { pat: "🤚", treat: "🦴", play: "🎾", trick: "✨" };
const PET_EMOJI: Record<Pet, string> = { dog: "🐶", cat: "🐱", parrot: "🦜", croc: "🐊", panther: "🐆", none: "" };

/** Cuidar a la mascota: felicidad y acciones (dentro de "Mi perfil" con `inline`). */
export function CampusPetPanel({ visible, pet, inline = false }: { visible: boolean; pet: Pet; inline?: boolean }) {
  const t = usePick(COPY);
  const L = usePick(OPTION_LABELS);
  const m = useMood();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  // Se recalcula cada minuto para que la barra baje sola.
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!visible || pet === "none") return null;
  const happy = Math.round(currentHappy(m));
  const moodText = t.moods[happy < 30 ? 0 : happy < 60 ? 1 : happy < 85 ? 2 : 3];
  const name = L.pet[pet].replace(/^\S+\s/, "");
  const treat = pet === "cat" || pet === "panther" ? "🐟" : pet === "parrot" ? "🌻" : ICONS.treat;

  const act = (kind: PetAction) => {
    if (busy) return;
    pamperPet(kind);
    setBusy(true);
    window.setTimeout(() => setBusy(false), PET_ACTION_SECONDS[kind] * 1000);
  };

  const care = (
    <>
      <div className="flex items-baseline justify-between text-[12px]">
        <b>
          {PET_EMOJI[pet]} {name} · 💗 {happy}%
        </b>
        <span className="text-white/65">{moodText}</span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {(Object.keys(ICONS) as PetAction[]).map((k) => (
          <button
            key={k}
            type="button"
            disabled={busy}
            onClick={() => act(k)}
            className="flex cursor-pointer flex-col items-center gap-0.5 rounded-xl bg-white/8 py-2 text-[10.5px] font-semibold transition enabled:hover:-translate-y-0.5 enabled:hover:bg-white/15 disabled:opacity-45"
          >
            <span aria-hidden className="text-xl leading-none">
              {k === "treat" ? treat : ICONS[k]}
            </span>
            {t.actions[k]}
          </button>
        ))}
      </div>
    </>
  );
  if (inline) return care;

  return (
    <div className="absolute top-[calc(344px+env(safe-area-inset-top,0px))] left-5 z-20 text-[#FFF3E6] max-md:top-[calc(300px+env(safe-area-inset-top,0px))] max-md:left-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-[#FF8FB1] bg-[#0E061E]/80 py-1.5 pr-3 pl-2 text-[13px] font-bold backdrop-blur-md transition hover:-translate-y-0.5 max-md:text-[12px]"
      >
        <span aria-hidden className="text-lg leading-none">
          {PET_EMOJI[pet]}
        </span>
        <span className="max-md:hidden">{t.title(name)}</span>
        <span className="relative h-2 w-14 overflow-hidden rounded-full bg-white/20" aria-label={`${t.happy}: ${happy}%`}>
          <span className="absolute inset-y-0 left-0 rounded-full bg-[#FF8FB1] transition-all" style={{ width: `${happy}%` }} />
        </span>
      </button>
      {open && (
        <div className="reveal-animate mt-2 w-[236px] rounded-2xl border border-white/15 bg-[#0E061E]/88 p-3 backdrop-blur-md">
          <div className="flex items-baseline justify-between text-[12px]">
            <b>
              💗 {t.happy} {happy}%
            </b>
            <span className="text-white/65">{moodText}</span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {(Object.keys(ICONS) as PetAction[]).map((k) => (
              <button
                key={k}
                type="button"
                disabled={busy}
                onClick={() => act(k)}
                className="flex cursor-pointer flex-col items-center gap-0.5 rounded-xl bg-white/8 py-2 text-[10.5px] font-semibold transition enabled:hover:-translate-y-0.5 enabled:hover:bg-white/15 disabled:opacity-45"
              >
                <span aria-hidden className="text-xl leading-none">
                  {k === "treat" ? treat : ICONS[k]}
                </span>
                {t.actions[k]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- efectos 3D

function useHeartTexture() {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#FF4F8B";
    ctx.beginPath();
    ctx.moveTo(32, 56);
    ctx.bezierCurveTo(4, 36, 4, 10, 20, 10);
    ctx.bezierCurveTo(28, 10, 32, 18, 32, 20);
    ctx.bezierCurveTo(32, 18, 36, 10, 44, 10);
    ctx.bezierCurveTo(60, 10, 60, 36, 32, 56);
    ctx.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

const HEARTS = 6;

/** Corazones, la pelota y el premio de la mascota propia. */
export function PetFx({ pet }: { pet: Pet }) {
  const heart = useHeartTexture();
  const hearts = useRef<Array<THREE.Sprite | null>>([]);
  const ball = useRef<THREE.Mesh>(null);
  const snack = useRef<THREE.Group>(null);
  const tall = pet === "parrot" ? 3.6 : 1.9;

  useFrame(() => {
    const age = petActionAge();
    const kind = age === null ? null : petAct.kind;
    hearts.current.forEach((h, i) => {
      if (!h) return;
      const k = age === null || kind === "play" ? -1 : (age - i * 0.15) / 1.8;
      h.visible = k > 0 && k < 1;
      if (!h.visible) return;
      h.position.set(petPos.x + Math.sin(i * 2.4) * 0.8, tall + 0.3 + k * 2.2, petPos.z + Math.cos(i * 2.4) * 0.5);
      h.scale.setScalar(0.7 + Math.sin(k * Math.PI) * 0.45);
      (h.material as THREE.SpriteMaterial).opacity = 1 - k * k;
    });
    // Pelota: vuela del jugador al suelo y vuelve en la boca de la mascota.
    if (ball.current) {
      const b = ball.current;
      b.visible = kind === "play";
      if (kind === "play" && age !== null) {
        const p = campusRuntime.player;
        if (age < 0.7) {
          const f = age / 0.7;
          b.position.set(p.x + (petAct.bx - p.x) * f, 2 + Math.sin(f * Math.PI) * 3 - f * 1.7, p.z + (petAct.bz - p.z) * f);
        } else if (Math.hypot(petPos.x - petAct.bx, petPos.z - petAct.bz) > 0.9 && age < 1.9) {
          b.position.set(petAct.bx, 0.45, petAct.bz);
        } else {
          b.position.set(petPos.x + Math.sin(petHeading.h) * 0.9, 1.25, petPos.z + Math.cos(petHeading.h) * 0.9);
        }
      }
    }
    // Premio: aparece sobre la cabeza y se lo come.
    if (snack.current) {
      const s = snack.current;
      s.visible = kind === "treat" && age !== null && age < 1.1;
      if (s.visible && age !== null) {
        s.position.set(petPos.x + Math.sin(petHeading.h) * 0.9, tall - 0.2 + (1.1 - age) * 0.6, petPos.z + Math.cos(petHeading.h) * 0.9);
        s.scale.setScalar(Math.max(0.05, 1 - Math.max(0, age - 0.6) * 2));
        s.rotation.y = age * 4;
      }
    }
  });

  if (pet === "none") return null;
  const fish = pet === "cat" || pet === "panther";
  return (
    <group>
      {Array.from({ length: HEARTS }, (_, i) => (
        <sprite key={i} ref={(s) => void (hearts.current[i] = s)} visible={false}>
          <spriteMaterial map={heart} transparent depthWrite={false} />
        </sprite>
      ))}
      <mesh ref={ball} visible={false} castShadow>
        <sphereGeometry args={[0.28, 16, 12]} />
        <meshStandardMaterial color="#D8F24E" roughness={0.6} />
      </mesh>
      <group ref={snack} visible={false}>
        {fish ? (
          <mesh rotation={[0, 0, Math.PI / 2]} scale={[0.5, 1, 0.3]}>
            <coneGeometry args={[0.25, 0.7, 8]} />
            <meshStandardMaterial color="#7FB8E8" />
          </mesh>
        ) : (
          <>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.07, 0.45, 4, 8]} />
              <meshStandardMaterial color="#F4E9D4" />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.3, 0, 0]}>
                <sphereGeometry args={[0.11, 10, 8]} />
                <meshStandardMaterial color="#F4E9D4" />
              </mesh>
            ))}
          </>
        )}
      </group>
    </group>
  );
}

/** Hacia dónde mira la mascota propia (para poner la pelota y el premio en su boca). */
export const petHeading = { h: 0 };
