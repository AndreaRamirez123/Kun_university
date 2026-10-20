"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Locale } from "@/i18n/locale-context";
import {
  getPlayer,
  presenceEnabled,
  refreshPresence,
  sendPosition,
  serverNow,
  subscribePresence,
  visiblePlayers,
  type RemotePlayer,
} from "@/lib/campus-presence";
import { CampusLabel } from "./campus-label";
import { PetFollower } from "./campus-animals";
import { CAFE_SEATS } from "./campus-cafe";
import { setMurmur } from "./campus-audio";
import { MiiAvatar, miiHeight } from "./campus-mii";
import { campusRuntime } from "./campus-runtime";
import { EMOTE_MS, emoteLabel, parseAvatar } from "./campus-social";

// Las demás personas que están en el campus en este momento: su personaje Mii,
// su nombre y sus emotes. La posición llega ~4 veces por segundo y aquí se
// interpola para que caminen suave, con la misma animación de piernas y brazos.

/** Lista de quienes están conectados; cambia solo al entrar, salir o hacer un emote. */
export function usePresencePlayers() {
  const [players, setPlayers] = useState<RemotePlayer[]>([]);
  useEffect(() => {
    if (!presenceEnabled) return;
    const update = () => setPlayers(visiblePlayers());
    const off = subscribePresence(update);
    // Quien se desconecta sin avisar no genera eventos: se revisa cada tanto.
    const id = window.setInterval(refreshPresence, 3000);
    return () => {
      off();
      window.clearInterval(id);
    };
  }, []);
  return players;
}

// Posición que sigue la mascota de cada persona (se actualiza en cada frame, sin re-render).
const PET_TARGETS = new Map<string, { x: number; z: number; heading: number }>();
function petTarget(id: string) {
  let t = PET_TARGETS.get(id);
  if (!t) {
    const p = getPlayer(id);
    t = { x: p?.x ?? 0, z: p?.z ?? 0, heading: p?.h ?? 0 };
    PET_TARGETS.set(id, t);
  }
  return t;
}

function EmoteBubble({ text, height, at, clock }: { text: string; height: number; at: number; clock: () => number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const age = clock() - at;
    g.visible = !!text && age >= 0 && age < EMOTE_MS;
    // Sube un poco al aparecer.
    g.position.y = height + 1.6 + Math.min(1, age / 250) * 0.25;
  });
  if (!text) return null;
  return (
    <group ref={ref} visible={false}>
      <CampusLabel text={text} color="#FF7A59" position={[0, 0, 0]} width={Math.min(9, 1.6 + text.length * 0.33)} />
    </group>
  );
}

function RemoteAvatar({ player, locale }: { player: RemotePlayer; locale: Locale }) {
  const avatar = useMemo(() => parseAvatar(player.a, player.n), [player.a, player.n]);
  const height = miiHeight(avatar);
  const root = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const sim = useRef({ x: player.x, z: player.z, h: player.h, y: 0, walk: 0 });

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const g = root.current;
    const target = getPlayer(player.id);
    if (!g || !target) return;
    const s = sim.current;
    const k = 1 - Math.exp(-delta * 8);
    const px = s.x;
    const pz = s.z;
    // Si saltó muy lejos (p. ej. al salir de una sala), aparece directo.
    if (Math.hypot(target.x - s.x, target.z - s.z) > 12) {
      s.x = target.x;
      s.z = target.z;
    } else {
      s.x += (target.x - s.x) * k;
      s.z += (target.z - s.z) * k;
    }
    let dh = target.h - s.h;
    dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    s.h += dh * k;
    s.y += ((target.y ?? 0) - s.y) * k;
    const seat = typeof target.s === "number" ? CAFE_SEATS[target.s] : undefined;
    const speed = Math.hypot(s.x - px, s.z - pz) / Math.max(delta, 1e-3);
    const moving = !seat && speed > 0.4 && s.y < 0.2;
    if (moving) s.walk += delta * Math.min(speed, 8) * 2.4;
    const swing = moving ? Math.sin(s.walk) * 0.55 : 0;
    if (seat) {
      // Sentado en un taburete de la cafetería, mirando a la mesa.
      g.position.set(seat.x, seat.y + 0.08 - (0.22 + 0.72 * avatar.height), seat.z);
      g.rotation.y = seat.face;
    } else {
      g.position.set(s.x, 0.2 + s.y + (moving ? Math.abs(Math.sin(s.walk)) * 0.06 : 0), s.z);
      g.rotation.y = s.h;
    }
    const follow = petTarget(player.id);
    follow.x = seat ? seat.x : s.x;
    follow.z = seat ? seat.z : s.z;
    follow.heading = seat ? seat.face : s.h;
    const air = !seat && s.y > 0.3 ? -0.5 : 0;
    if (legL.current) legL.current.rotation.x = seat ? -1.45 : swing + air * 0.5;
    if (legR.current) legR.current.rotation.x = seat ? -1.45 : -swing - air * 0.3;
    if (armL.current) armL.current.rotation.x = seat ? -0.9 : -swing * 0.8 + air;
    if (armR.current) armR.current.rotation.x = seat ? -0.9 : swing * 0.8 + air;
  });

  return (
    <>
    <PetFollower pet={avatar.pet} playing follow={petTarget(player.id)} />
    <group ref={root} position={[player.x, 0.2, player.z]}>
      <MiiAvatar avatar={avatar} legLRef={legL} legRRef={legR} armLRef={armL} armRRef={armR} />
      {avatar.name && <CampusLabel text={avatar.name} color="#1E6B5C" position={[0, height + 0.75, 0]} width={4.4} />}
      <EmoteBubble text={emoteLabel(player.e, locale)} height={height} at={player.et ?? 0} clock={serverNow} />
    </group>
    </>
  );
}

/** Emote propio, encima del personaje del jugador. */
function MyEmote({ emote, locale, height }: { emote: { index: number; at: number } | null; locale: Locale; height: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    g.position.set(campusRuntime.player.x, 0.2, campusRuntime.player.z);
  });
  if (!emote) return null;
  return (
    <group ref={ref}>
      <EmoteBubble key={emote.at} text={emoteLabel(emote.index, locale)} height={height} at={emote.at} clock={Date.now} />
    </group>
  );
}

export function RemotePlayers({
  enabled,
  locale,
  myEmote,
  myHeight,
}: {
  /** Publica la propia posición (solo mientras se recorre el campus). */
  enabled: boolean;
  locale: Locale;
  myEmote: { index: number; at: number } | null;
  myHeight: number;
}) {
  const players = usePresencePlayers();
  const lastMurmur = useRef(0);
  useFrame((state) => {
    // Murmullo de ambiente según cuánta gente hay cerca (se revisa cada segundo).
    if (state.clock.elapsedTime - lastMurmur.current > 1) {
      lastMurmur.current = state.clock.elapsedTime;
      const me = campusRuntime.player;
      setMurmur(visiblePlayers().filter((o) => Math.hypot(o.x - me.x, o.z - me.z) < 18).length);
    }
    if (enabled) {
      const p = campusRuntime.player;
      sendPosition(p.x, p.z, p.heading, p.y, campusRuntime.seat);
    }
  });
  if (!presenceEnabled) return null;
  return (
    <>
      {players.map((p) => (
        <RemoteAvatar key={p.id} player={p} locale={locale} />
      ))}
      <MyEmote emote={myEmote} locale={locale} height={myHeight} />
    </>
  );
}
