import type { Dict } from "@/i18n/locale-context";

// Personajes 3D del campus: modelos CC0 de Quaternius ("Ultimate Modular Men/Women
// Pack", ver public/models/characters/LICENSE.txt), reducidos a las animaciones
// que usamos y comprimidos con meshopt. Todos comparten el mismo esqueleto, así
// que la misma lógica de animación y de accesorios sirve para cualquiera.

export type Gender = "male" | "female" | "other";

export type CharacterDef = {
  id: string;
  gender: Gender;
  label: Dict<string>;
  url: string;
  /** Materiales de piel (se tiñen con el tono elegido). */
  skin: string[];
  /** Material de la prenda superior y la pieza del cuerpo donde está. */
  top: { mesh: string; material: string };
  /** Nodos que se ocultan (p. ej. la pistola del personaje sci-fi). */
  hide?: string[];
  /** Lleva casco: sin tono de piel ni accesorios en la cabeza. */
  helmet?: boolean;
};

export const CHARACTERS: CharacterDef[] = [
  {
    id: "man-casual",
    gender: "male",
    label: { es: "Casual", en: "Casual" },
    url: "/models/characters/man-casual.glb",
    skin: ["Skin", "Skin_Darker"],
    top: { mesh: "Casual2_Body", material: "LightBrown" },
  },
  {
    id: "man-hoodie",
    gender: "male",
    label: { es: "Hoodie", en: "Hoodie" },
    url: "/models/characters/man-hoodie.glb",
    skin: ["Skin"],
    top: { mesh: "Casual_Body", material: "Purple" },
  },
  {
    id: "woman-casual",
    gender: "female",
    label: { es: "Casual", en: "Casual" },
    url: "/models/characters/woman-casual.glb",
    skin: ["Skin"],
    top: { mesh: "Casual_Body", material: "White" },
  },
  {
    id: "woman-suit",
    gender: "female",
    label: { es: "Ejecutiva", en: "Executive" },
    url: "/models/characters/woman-suit.glb",
    skin: ["Skin"],
    top: { mesh: "Suit_Body", material: "Black" },
  },
  {
    id: "other-scifi",
    gender: "other",
    label: { es: "Futurista", en: "Futuristic" },
    url: "/models/characters/other-scifi.glb",
    skin: ["Skin"],
    top: { mesh: "SciFi_Body", material: "LightBlue" },
    hide: ["Pistol"],
  },
  {
    id: "other-astronaut",
    gender: "other",
    label: { es: "Astronauta", en: "Astronaut" },
    url: "/models/characters/other-astronaut.glb",
    skin: [],
    top: { mesh: "SpaceSuit_Body", material: "SciFi_Main" },
    helmet: true,
  },
];

export const SKIN_TONES = ["#F3D2B8", "#E2B08A", "#C68B5E", "#9C6643", "#6E452C", "#4A2D1D"];

export const OUTFIT_COLORS = ["#E8735A", "#3D6FD9", "#1E9C7E", "#FFC85C", "#C2387A", "#24123F", "#F4F0EA"];

export type Accessory = "cap" | "headphones" | "backpack" | "none";

export function characterById(id: string) {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}
