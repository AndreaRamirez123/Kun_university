import type { Dict } from "@/i18n/locale-context";

// Avatar al estilo "Mii": cabeza grande y redonda, cuerpo simple y una cara
// armada con piezas intercambiables. Todo se dibuja en código (sin modelos
// descargados), así que cualquier combinación es instantánea.

export type Gender = "male" | "female" | "other";
export type HairStyle = "short" | "buzz" | "curly" | "long" | "ponytail" | "bun" | "afro" | "bald";
export type EyeStyle = "round" | "almond" | "happy" | "big";
export type BrowStyle = "soft" | "straight" | "arched";
export type NoseStyle = "small" | "round" | "wide";
export type MouthStyle = "smile" | "grin" | "neutral" | "open";
export type FacialHair = "none" | "mustache" | "beard";
export type Glasses = "none" | "round" | "square" | "sun";
export type TopStyle = "tshirt" | "hoodie" | "blazer";
export type Accessory = "cap" | "headphones" | "backpack" | "none";
export type Pet = "dog" | "cat" | "parrot" | "none";

export type Avatar = {
  name: string;
  gender: Gender;
  /** Mascota que acompaña al jugador por el campus (o ninguna). */
  pet: Pet;
  skin: string;
  hairStyle: HairStyle;
  hairColor: string;
  eyes: EyeStyle;
  brows: BrowStyle;
  nose: NoseStyle;
  mouth: MouthStyle;
  facialHair: FacialHair;
  glasses: Glasses;
  top: TopStyle;
  outfit: string;
  accessory: Accessory;
  /** 0.85 – 1.15: estatura. */
  height: number;
  /** 0.8 – 1.25: complexión. */
  build: number;
};

export const SKIN_TONES = ["#F6D7C3", "#EBBE9B", "#D49A6A", "#B07848", "#7E5233", "#55361F"];
export const HAIR_COLORS = ["#1E1A18", "#3B2618", "#6B4226", "#B68A4C", "#E2C27A", "#A8452A", "#9A9A9E", "#3D6FD9"];
export const OUTFIT_COLORS = ["#E8735A", "#3D6FD9", "#1E9C7E", "#FFC85C", "#C2387A", "#24123F", "#F4F0EA"];

export const OPTIONS = {
  gender: ["male", "female", "other"] as Gender[],
  hairStyle: ["short", "buzz", "curly", "long", "ponytail", "bun", "afro", "bald"] as HairStyle[],
  eyes: ["round", "almond", "happy", "big"] as EyeStyle[],
  brows: ["soft", "straight", "arched"] as BrowStyle[],
  nose: ["small", "round", "wide"] as NoseStyle[],
  mouth: ["smile", "grin", "neutral", "open"] as MouthStyle[],
  facialHair: ["none", "mustache", "beard"] as FacialHair[],
  glasses: ["none", "round", "square", "sun"] as Glasses[],
  top: ["tshirt", "hoodie", "blazer"] as TopStyle[],
  accessory: ["cap", "headphones", "backpack", "none"] as Accessory[],
  pet: ["dog", "cat", "parrot", "none"] as Pet[],
};

export const OPTION_LABELS: Dict<{
  gender: Record<Gender, string>;
  hairStyle: Record<HairStyle, string>;
  eyes: Record<EyeStyle, string>;
  brows: Record<BrowStyle, string>;
  nose: Record<NoseStyle, string>;
  mouth: Record<MouthStyle, string>;
  facialHair: Record<FacialHair, string>;
  glasses: Record<Glasses, string>;
  top: Record<TopStyle, string>;
  accessory: Record<Accessory, string>;
  pet: Record<Pet, string>;
}> = {
  es: {
    gender: { male: "Hombre", female: "Mujer", other: "Otro" },
    hairStyle: { short: "Corto", buzz: "Rapado", curly: "Rizado", long: "Largo", ponytail: "Cola", bun: "Moño", afro: "Afro", bald: "Calvo" },
    eyes: { round: "Redondos", almond: "Almendra", happy: "Felices", big: "Grandes" },
    brows: { soft: "Suaves", straight: "Rectas", arched: "Arqueadas" },
    nose: { small: "Pequeña", round: "Redonda", wide: "Ancha" },
    mouth: { smile: "Sonrisa", grin: "Risa", neutral: "Seria", open: "Asombro" },
    facialHair: { none: "Nada", mustache: "Bigote", beard: "Barba" },
    glasses: { none: "Sin lentes", round: "Redondos", square: "Cuadrados", sun: "De sol" },
    top: { tshirt: "Camiseta", hoodie: "Hoodie", blazer: "Blazer" },
    accessory: { cap: "Gorra KUN", headphones: "Audífonos", backpack: "Mochila KUN", none: "Ninguno" },
    pet: { dog: "🐶 Perrito", cat: "🐱 Gatito", parrot: "🦜 Loro", none: "Ninguna" },
  },
  en: {
    gender: { male: "Man", female: "Woman", other: "Other" },
    hairStyle: { short: "Short", buzz: "Buzz", curly: "Curly", long: "Long", ponytail: "Ponytail", bun: "Bun", afro: "Afro", bald: "Bald" },
    eyes: { round: "Round", almond: "Almond", happy: "Happy", big: "Big" },
    brows: { soft: "Soft", straight: "Straight", arched: "Arched" },
    nose: { small: "Small", round: "Round", wide: "Wide" },
    mouth: { smile: "Smile", grin: "Grin", neutral: "Neutral", open: "Surprised" },
    facialHair: { none: "None", mustache: "Mustache", beard: "Beard" },
    glasses: { none: "No glasses", round: "Round", square: "Square", sun: "Sunglasses" },
    top: { tshirt: "T-shirt", hoodie: "Hoodie", blazer: "Blazer" },
    accessory: { cap: "KUN cap", headphones: "Headphones", backpack: "KUN backpack", none: "None" },
    pet: { dog: "🐶 Puppy", cat: "🐱 Kitten", parrot: "🦜 Parrot", none: "None" },
  },
};

export const DEFAULT_AVATAR: Avatar = {
  name: "",
  gender: "female",
  pet: "dog",
  skin: SKIN_TONES[2],
  hairStyle: "long",
  hairColor: HAIR_COLORS[1],
  eyes: "round",
  brows: "soft",
  nose: "small",
  mouth: "smile",
  facialHair: "none",
  glasses: "none",
  top: "tshirt",
  outfit: OUTFIT_COLORS[0],
  accessory: "none",
  height: 1,
  build: 1,
};

/** Al cambiar de género se ajustan peinado y vello por defecto (luego se pueden cambiar). */
export function withGender(a: Avatar, gender: Gender): Avatar {
  if (gender === "male") return { ...a, gender, hairStyle: "short", brows: "straight" };
  if (gender === "female") return { ...a, gender, hairStyle: "long", brows: "soft", facialHair: "none" };
  return { ...a, gender, hairStyle: "bun", brows: "soft", facialHair: "none" };
}
