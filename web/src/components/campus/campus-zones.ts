import type { Dict } from "@/i18n/locale-context";

export type ZoneKind = "school" | "admissions" | "curriculum" | "certifications";

export type ZoneDef = {
  id: string;
  kind: ZoneKind;
  /** Slug de la escuela en la API, solo para las zonas de tipo "school". */
  schoolSlug?: string;
  color: string;
  x: number;
  z: number;
  /** Radio de colisión del edificio. */
  r: number;
  labelHeight: number;
  label: Dict<string>;
};

// Distribución de la isla: el currículo vivo en el centro, las escuelas y admisiones
// en anillo, y la plataforma de lanzamiento de certificaciones sobre la playa.
export const ZONES: ZoneDef[] = [
  {
    id: "ing",
    kind: "school",
    schoolSlug: "ingenieria",
    color: "#3D6FD9",
    x: 0,
    z: -25,
    r: 5.5,
    labelHeight: 23,
    label: { es: "Ingeniería", en: "Engineering" },
  },
  {
    id: "neg",
    kind: "school",
    schoolSlug: "transformacion-de-negocios",
    color: "#D99A1E",
    x: 24,
    z: -8,
    r: 5.5,
    labelHeight: 15.5,
    label: { es: "Negocios", en: "Business" },
  },
  {
    id: "bie",
    kind: "school",
    schoolSlug: "bienestar-y-desarrollo-humano",
    color: "#1E9C7E",
    x: 15,
    z: 21,
    r: 5.8,
    labelHeight: 11,
    label: { es: "Bienestar", en: "Wellness" },
  },
  {
    id: "dis",
    kind: "school",
    schoolSlug: "diseno-y-tecnologias-de-comunicacion",
    color: "#C2387A",
    x: -15,
    z: 21,
    r: 5.5,
    labelHeight: 15,
    label: { es: "Diseño", en: "Design" },
  },
  {
    id: "adm",
    kind: "admissions",
    color: "#E8735A",
    x: -24,
    z: -8,
    r: 6,
    labelHeight: 14,
    label: { es: "Admisiones", en: "Admissions" },
  },
  {
    id: "cur",
    kind: "curriculum",
    color: "#7A4FD0",
    x: 0,
    z: 0,
    r: 4.2,
    labelHeight: 8.4,
    label: { es: "Currículo vivo", en: "Living curriculum" },
  },
  {
    id: "cont",
    kind: "certifications",
    color: "#FF8A4C",
    x: 31,
    z: -31,
    r: 4.6,
    labelHeight: 14,
    label: { es: "Certificaciones", en: "Certifications" },
  },
];

/** Distancia extra al radio del edificio a partir de la cual se abre su panel. */
export const ZONE_ENTRY_MARGIN = 4.5;

/** Lugar al que Krucn puede guiar: las zonas con sala y la cafetería. */
export type GuidePlace = Pick<ZoneDef, "id" | "color" | "x" | "z" | "r" | "label">;

/**
 * Cafetería "KUN Café": punto de encuentro donde se ve y saluda a otros
 * visitantes. No tiene sala interior ni cuenta entre los lugares por visitar.
 */
export const CAFE: GuidePlace & { deck: number } = {
  id: "cafe",
  color: "#B8743A",
  x: -21,
  z: -27,
  r: 6.5,
  deck: 11.25,
  label: { es: "Cafetería", en: "Café" },
};

export const GUIDE_PLACES: GuidePlace[] = [...ZONES, CAFE];

export const findGuidePlace = (id: string | null | undefined) => (id ? GUIDE_PLACES.find((p) => p.id === id) : undefined);

/** Punto frente a la puerta de un lugar, del lado de la plaza: ahí lleva Krucn al guiar. */
export function zoneDoor(zone: Pick<ZoneDef, "x" | "z" | "r">): { x: number; z: number } {
  const d = Math.hypot(zone.x, zone.z);
  // El lugar del centro (Currículo vivo) se aborda desde el sur, por donde se llega.
  const [ux, uz] = d < 1 ? [0, 1] : [-zone.x / d, -zone.z / d];
  const off = zone.r + 2.5;
  return { x: zone.x + ux * off, z: zone.z + uz * off };
}

export const ISLAND_RADIUS = 50;
export const GRASS_RADIUS = 42;
/** El jugador no puede salir de la arena. */
export const WALK_RADIUS = 48;

export const PLAYER_START: [number, number, number] = [0, 0.2, 31];

export type { Accessory, Avatar } from "./campus-avatar";

/** Obstáculo circular; con `h`, solo bloquea por debajo de esa altura (se puede saltar por encima). */
export type Collider = { x: number; z: number; r: number; h?: number };

/** Fila de las letras K·U·N frente al punto de partida (empujables, al estilo Bruno Simon). */
export const LETTERS_Z = 19;
