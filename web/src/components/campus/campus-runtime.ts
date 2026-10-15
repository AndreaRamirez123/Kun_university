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
  player: { x: PLAYER_START[0], z: PLAYER_START[2], vx: 0, vz: 0, heading: 0 },
  /** performance.now() del despegue del cohete; 0 si está en la plataforma. */
  launchAt: 0,
  /** Multiplicador de distancia de la cámara (rueda del mouse). */
  zoom: 1,
  /** Posición de Krucn, la mascota, para el minimapa. */
  krucn: { x: 13, z: -10.9 },
};

export function resetCampusInput() {
  campusRuntime.keys = {};
  campusRuntime.stick.x = 0;
  campusRuntime.stick.z = 0;
  campusRuntime.stick.active = false;
  campusRuntime.jumpQueued = false;
}
