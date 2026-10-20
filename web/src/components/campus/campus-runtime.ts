import { PLAYER_START } from "./campus-zones";

// Estado mutable compartido entre la escena 3D (useFrame) y la interfaz DOM.
// Vive fuera de React a propósito: se lee y escribe 60 veces por segundo y
// pasarlo por estado provocaría re-renders en cada frame.
export const campusRuntime = {
  keys: {} as Record<string, boolean>,
  /** Joystick táctil normalizado, -1..1 en cada eje. */
  stick: { x: 0, z: 0, active: false },
  jumpQueued: false,
  /** Posición y velocidad del jugador, para el minimapa y para empujar objetos. */
  player: { x: PLAYER_START[0], z: PLAYER_START[2], y: 0, vx: 0, vz: 0, heading: 0 },
  /** performance.now() del despegue del cohete; 0 si está en la plataforma. */
  launchAt: 0,
  /** Multiplicador de distancia de la cámara (rueda del mouse). */
  zoom: 1,
  /** Posición de Krucn, la mascota, para el minimapa. */
  krucn: { x: 13, z: -10.9 },
  /** Reproducción del video explicativo de Admisiones (la avanza la pantalla 3D). */
  explainer: { chapter: 0, local: 0, playing: true, count: 7 },
  /** Lugar al que Krucn está guiando al jugador (id de zona) o null. */
  guide: { zone: null as string | null },
  /** Taburete de la cafetería donde está sentado el jugador (índice de CAFE_SEATS) o -1. */
  seat: -1,
  /** Giro (radianes) del personaje en el editor, para verlo por detrás. */
  previewSpin: 0,
};

export function resetCampusInput() {
  campusRuntime.keys = {};
  campusRuntime.stick.x = 0;
  campusRuntime.stick.z = 0;
  campusRuntime.stick.active = false;
  campusRuntime.jumpQueued = false;
}
