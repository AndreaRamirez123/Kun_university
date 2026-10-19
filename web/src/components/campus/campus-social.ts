import type { Locale } from "@/i18n/locale-context";
import { DEFAULT_AVATAR, OPTIONS, type Avatar } from "./campus-avatar";

// Interacción entre visitantes: solo emojis y frases de una lista cerrada, así
// nadie puede escribir groserías ni datos personales y no hace falta moderar.
// Por la red viaja el número del emote; cada quien lo ve en su propio idioma.

export type Emote = { emoji: string; text?: Record<Locale, string> };

export const EMOTES: Emote[] = [
  { emoji: "👋" },
  { emoji: "😂" },
  { emoji: "❤️" },
  { emoji: "🎉" },
  { emoji: "👍" },
  { emoji: "🐊" },
  { emoji: "👋", text: { es: "¡Hola!", en: "Hi!" } },
  { emoji: "🎓", text: { es: "¿Qué estudias?", en: "What do you study?" } },
  { emoji: "☕", text: { es: "¡Vamos a la cafetería!", en: "Let's go to the café!" } },
  { emoji: "🙌", text: { es: "¡Bienvenido/a al campus!", en: "Welcome to campus!" } },
  { emoji: "🤝", text: { es: "¡Mucho gusto!", en: "Nice to meet you!" } },
  { emoji: "🧭", text: { es: "¡Sígueme!", en: "Follow me!" } },
  { emoji: "💻", text: { es: "Me interesa Ingeniería", en: "I'm into Engineering" } },
  { emoji: "📈", text: { es: "Me interesa Negocios", en: "I'm into Business" } },
  { emoji: "🧠", text: { es: "Me interesa Bienestar", en: "I'm into Wellness" } },
  { emoji: "🎬", text: { es: "Me interesa Diseño", en: "I'm into Design" } },
  { emoji: "👋", text: { es: "¡Nos vemos!", en: "See you!" } },
];

/** Cuánto dura un emote sobre la cabeza. */
export const EMOTE_MS = 4500;

export function emoteLabel(index: number | undefined, locale: Locale) {
  const e = index === undefined ? undefined : EMOTES[index];
  if (!e) return "";
  return e.text ? `${e.emoji} ${e.text[locale]}` : e.emoji;
}

/** Avatar para enviar por la red (sin el nombre, que va aparte). */
export function serializeAvatar(a: Avatar) {
  const { name: _name, ...rest } = a;
  void _name;
  return JSON.stringify(rest);
}

const HEX = /^#[0-9a-f]{6}$/i;

/**
 * Lee el avatar de otra persona sin confiar en él: cada campo debe ser una opción
 * válida; si no, se usa el valor por defecto (así un dato raro no rompe la escena).
 */
export function parseAvatar(json: string | undefined, name: string): Avatar {
  let raw: Record<string, unknown> = {};
  try {
    const v = JSON.parse(json ?? "{}");
    if (v && typeof v === "object") raw = v as Record<string, unknown>;
  } catch {
    /* avatar ilegible: por defecto */
  }
  const pick = <K extends keyof typeof OPTIONS>(key: K): Avatar[K] => {
    const v = raw[key];
    return ((OPTIONS[key] as readonly unknown[]).includes(v) ? v : DEFAULT_AVATAR[key]) as Avatar[K];
  };
  const color = (key: "skin" | "hairColor" | "outfit") => (typeof raw[key] === "string" && HEX.test(raw[key] as string) ? (raw[key] as string) : DEFAULT_AVATAR[key]);
  const num = (key: "height" | "build", min: number, max: number) => {
    const v = Number(raw[key]);
    return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : DEFAULT_AVATAR[key];
  };
  return {
    name: name.slice(0, 16),
    gender: pick("gender"),
    pet: "none",
    skin: color("skin"),
    hairStyle: pick("hairStyle"),
    hairColor: color("hairColor"),
    eyes: pick("eyes"),
    brows: pick("brows"),
    nose: pick("nose"),
    mouth: pick("mouth"),
    facialHair: pick("facialHair"),
    glasses: pick("glasses"),
    top: pick("top"),
    outfit: color("outfit"),
    accessory: pick("accessory"),
    height: num("height", 0.85, 1.15),
    build: num("build", 0.8, 1.25),
  };
}
