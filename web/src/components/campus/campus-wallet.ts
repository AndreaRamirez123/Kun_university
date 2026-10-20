import { useSyncExternalStore } from "react";
import type { Dict } from "@/i18n/locale-context";
import type { Accessory, Pet } from "./campus-avatar";

// KUN Coins 🪙: se ganan recorriendo, aprendiendo, jugando e interactuando en
// el campus, y se gastan en la tienda (KUN Store). Se guardan en el navegador
// (localStorage), sin registro: en otro equipo se empieza de cero.

export type RewardKind =
  | "welcome"
  | "visit"
  | "allVisited"
  | "learn"
  | "catalog"
  | "signup"
  | "krucn"
  | "coin"
  | "bounce"
  | "play"
  | "emote"
  | "sit"
  | "demoClass"
  | "demoStation"
  | "demoTower"
  | "pet";

type Rule = { amount: number; once?: boolean; cooldownMs?: number; dailyCap?: number };

/** Cuánto da cada acción. `once`: una sola vez (por lugar, si lleva id); `dailyCap`: máximo por día. */
export const REWARDS: Record<RewardKind, Rule> = {
  welcome: { amount: 25, once: true },
  visit: { amount: 20, once: true },
  allVisited: { amount: 50, once: true },
  learn: { amount: 15, once: true },
  catalog: { amount: 10, once: true },
  signup: { amount: 50, once: true },
  krucn: { amount: 5, cooldownMs: 5 * 60_000, dailyCap: 20 },
  coin: { amount: 1, dailyCap: 60 },
  bounce: { amount: 1, cooldownMs: 1500, dailyCap: 40 },
  play: { amount: 1, cooldownMs: 3000, dailyCap: 20 },
  emote: { amount: 3, cooldownMs: 20_000, dailyCap: 30 },
  sit: { amount: 5, cooldownMs: 2 * 60_000, dailyCap: 20 },
  demoClass: { amount: 25, once: true },
  demoStation: { amount: 15, once: true },
  demoTower: { amount: 10, once: true },
  pet: { amount: 2, cooldownMs: 20_000, dailyCap: 30 },
};

export const REWARD_LABELS: Dict<Record<RewardKind, string>> = {
  es: {
    welcome: "¡Bienvenida al campus!",
    visit: "Lugar descubierto",
    allVisited: "¡Recorriste todo el campus!",
    learn: "Aprendiste algo nuevo",
    catalog: "Exploraste el catálogo",
    signup: "¡Te inscribiste!",
    krucn: "Charlaste con Krucn",
    coin: "KUN Coin",
    bounce: "¡Boing!",
    play: "Jugando",
    emote: "Saludaste",
    sit: "Un cafecito",
    demoClass: "Clase demo completa",
    demoStation: "Estación superada",
    demoTower: "¡Torre completa!",
    pet: "Consentiste a tu mascota",
  },
  en: {
    welcome: "Welcome to campus!",
    visit: "Place discovered",
    allVisited: "You explored the whole campus!",
    learn: "You learned something new",
    catalog: "You explored the catalog",
    signup: "You signed up!",
    krucn: "You chatted with Krucn",
    coin: "KUN Coin",
    bounce: "Boing!",
    play: "Playing",
    emote: "You said hi",
    sit: "Coffee break",
    demoClass: "Demo class finished",
    demoStation: "Station cleared",
    demoTower: "Full tower!",
    pet: "You pampered your pet",
  },
};

/** Cómo ganar monedas, para mostrar en la tienda. */
export const HOW_TO_EARN: Dict<Array<[string, string]>> = {
  es: [
    ["🏛️", "Entra por primera vez a cada lugar: +20 (y +50 al completar todos)"],
    ["🪙", "Recoge las KUN Coins que flotan por la isla: +1"],
    ["🎬", "Quédate a ver el video de una sala: +15"],
    ["📚", "Abre el Catálogo académico: +10 · Inscríbete: +50"],
    ["☂️", "Rebota en las sombrillas o empuja las letras y pelotas: +1"],
    ["🐊", "Habla con Krucn: +5 · Saluda a otros: +3 · Siéntate en la cafetería: +5"],
    ["🧖", "Clase demo WELL 101 (en Bienestar): +25 · Cada estación del Circuito: +15 (torre completa: +10)"],
    ["🐾", "Consiente a tu mascota (acariciar, premio, jugar, truco): +2"],
  ],
  en: [
    ["🏛️", "Enter each place for the first time: +20 (and +50 for all of them)"],
    ["🪙", "Pick up the KUN Coins floating around the island: +1"],
    ["🎬", "Stay to watch a room's video: +15"],
    ["📚", "Open the Academic catalog: +10 · Sign up: +50"],
    ["☂️", "Bounce on umbrellas or push the letters and balls: +1"],
    ["🐊", "Talk to Krucn: +5 · Wave at others: +3 · Sit at the café: +5"],
    ["🧖", "WELL 101 demo class: +25 · Each Circuit station: +15 (full tower: +10)"],
    ["🐾", "Pamper your pet (pet, treat, play, trick): +2"],
  ],
};

export type ShopItem = {
  id: string;
  kind: "accessory" | "pet" | "outfit";
  value: string;
  price: number;
  emoji: string;
  name: Dict<string>;
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: "accessory:gradcap", kind: "accessory", value: "gradcap" satisfies Accessory, price: 60, emoji: "🎓", name: { es: "Birrete KUN", en: "KUN grad cap" } },
  { id: "accessory:sunhat", kind: "accessory", value: "sunhat" satisfies Accessory, price: 80, emoji: "👒", name: { es: "Sombrero playero", en: "Beach hat" } },
  { id: "accessory:crown", kind: "accessory", value: "crown" satisfies Accessory, price: 200, emoji: "👑", name: { es: "Corona dorada", en: "Golden crown" } },
  { id: "pet:croc", kind: "pet", value: "croc" satisfies Pet, price: 150, emoji: "🐊", name: { es: "Mini Krucn", en: "Mini Krucn" } },
  { id: "pet:panther", kind: "pet", value: "panther" satisfies Pet, price: 250, emoji: "🐆", name: { es: "Pantera de Florida", en: "Florida panther" } },
  { id: "outfit:#14306E", kind: "outfit", value: "#14306E", price: 30, emoji: "👕", name: { es: "Azul KUN", en: "KUN navy" } },
  { id: "outfit:#C8102E", kind: "outfit", value: "#C8102E", price: 30, emoji: "👕", name: { es: "Rojo KUN", en: "KUN red" } },
  { id: "outfit:#3FA34D", kind: "outfit", value: "#3FA34D", price: 40, emoji: "👕", name: { es: "Verde cocodrilo", en: "Crocodile green" } },
  { id: "outfit:#FF4FA3", kind: "outfit", value: "#FF4FA3", price: 50, emoji: "👕", name: { es: "Rosa Miami", en: "Miami pink" } },
  { id: "outfit:#D4A72C", kind: "outfit", value: "#D4A72C", price: 120, emoji: "👕", name: { es: "Dorado", en: "Gold" } },
];

// ---------------------------------------------------------------- estado

type Log = Record<string, { last: number; day: string; today: number }>;
type Wallet = { coins: number; owned: string[]; log: Log };

const KEY = "kun-wallet-v1";
const today = () => new Date().toISOString().slice(0, 10);

let wallet: Wallet | null = null;

function load(): Wallet {
  if (wallet) return wallet;
  wallet = { coins: 0, owned: [], log: {} };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<Wallet> | null;
    if (raw && typeof raw.coins === "number") {
      wallet = {
        coins: Math.max(0, Math.floor(raw.coins)),
        owned: Array.isArray(raw.owned) ? raw.owned.filter((x) => typeof x === "string") : [],
        log: raw.log && typeof raw.log === "object" ? raw.log : {},
      };
    }
  } catch {
    /* sin almacenamiento: monedas solo por esta visita */
  }
  return wallet;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(wallet));
  } catch {
    /* ignorado */
  }
}

export type EarnEvent = { amount: number; kind: RewardKind };
const listeners = new Set<() => void>();
const earnListeners = new Set<(e: EarnEvent) => void>();

function changed() {
  listeners.forEach((l) => l());
}

export function subscribeWallet(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Avisa cada vez que se ganan monedas (para la animación "+5 🪙"). */
export function onEarn(listener: (e: EarnEvent) => void) {
  earnListeners.add(listener);
  return () => {
    earnListeners.delete(listener);
  };
}

export const getCoins = () => load().coins;
export const getOwned = () => load().owned;
export const isOwned = (id: string) => load().owned.includes(id);

/** Da la recompensa si corresponde (no repetida, sin pasar el límite). Devuelve las monedas ganadas. */
export function earn(kind: RewardKind, id = "") {
  const w = load();
  const rule = REWARDS[kind];
  const key = id ? `${kind}:${id}` : kind;
  const now = Date.now();
  const d = today();
  const entry = w.log[key];
  if (rule.once && entry) return 0;
  if (entry && rule.cooldownMs && now - entry.last < rule.cooldownMs) return 0;
  const todaySoFar = entry && entry.day === d ? entry.today : 0;
  const amount = rule.dailyCap ? Math.min(rule.amount, rule.dailyCap - todaySoFar) : rule.amount;
  if (amount <= 0) return 0;
  w.log[key] = { last: now, day: d, today: todaySoFar + amount };
  w.coins += amount;
  save();
  changed();
  earnListeners.forEach((l) => l({ amount, kind }));
  return amount;
}

/** Compra un artículo de la tienda. */
export function buy(item: ShopItem) {
  const w = load();
  if (w.owned.includes(item.id) || w.coins < item.price) return false;
  w.coins -= item.price;
  w.owned = [...w.owned, item.id];
  save();
  changed();
  return true;
}

/** Valores comprados de un tipo (para mostrarlos también en el lobby). */
export function ownedValues(kind: ShopItem["kind"]) {
  const owned = new Set(load().owned);
  return SHOP_ITEMS.filter((i) => i.kind === kind && owned.has(i.id)).map((i) => i.value);
}

const NO_OWNED: string[] = [];

/** Monedas y artículos comprados, siempre al día. */
export function useWallet() {
  const coins = useSyncExternalStore(subscribeWallet, getCoins, () => 0);
  const owned = useSyncExternalStore(subscribeWallet, getOwned, () => NO_OWNED);
  return { coins, owned };
}
