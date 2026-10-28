"use client";

import { useEffect, useRef, useState } from "react";
import { CampusLang } from "./campus-lang";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { Avatar } from "./campus-avatar";
import { activeTreat, campusRuntime, resetCampusInput, startTreat } from "./campus-runtime";
import { addHappy } from "./campus-pet";
import { playChime } from "./campus-audio";
import { STORE, zoneDoor } from "./campus-zones";
import { CAFE_COUNTER } from "./campus-cafe";
import { CampusPetPanel } from "./campus-pet";
import type { Pet } from "./campus-avatar";
import { buy, HOW_TO_EARN, onEarn, REWARD_LABELS, SHOP_ITEMS, useWallet, type ShopItem } from "./campus-wallet";

// Interfaz de la tienda: el contador de monedas del HUD, el aviso para entrar a
// la KUN Store y la ventana con los artículos.

/** Lo que se ve en el HUD mientras dura la comida o bebida. */
const TREAT_CHIP: Record<string, string> = { coffee: "☕ ⚡", juice: "🍊 🦘", icecream: "🍦 💗" };

/** Cuánto dura una comida o bebida de la cafetería. */
const TREAT_MS = 120_000;

const COPY = {
  es: {
    title: "KUN Store",
    subtitle: "Canjea tus KUN Coins por cosas para tu personaje",
    hats: "Sombreros",
    pets: "Mascotas",
    colors: "Colores de ropa",
    treats: "☕ Cafetería · comidas y bebidas (duran 2 min)",
    order: "Pedir",
    enjoy: (n: string) => `¡Disfruta tu ${n}! Lo llevas en la mano por 2 minutos.`,
    buy: "Comprar",
    use: "Usar",
    inUse: "En uso",
    remove: "Quitar",
    missing: (n: number) => `Te faltan ${n}`,
    howTo: "Cómo ganar KUN Coins",
    close: "Cerrar",
    enter: "Entrar a la tienda",
    menu: "Ver el menú de la cafetería",
    cafeTitle: "KUN Café",
    cafeSubtitle: "Pide algo con tus KUN Coins: cada cosa dura 2 minutos",
    coins: "monedas",
    profile: "Mi perfil",
    editCharacter: "✏️ Editar mi personaje",
    store: "🛍️ KUN Store",
    noPet: "Aún no tienes mascota: elígela al editar tu personaje.",
    bought: (n: string) => `¡Compraste ${n}! Ya lo llevas puesto.`,
  },
  en: {
    title: "KUN Store",
    subtitle: "Trade your KUN Coins for things for your character",
    hats: "Hats",
    pets: "Pets",
    colors: "Outfit colors",
    treats: "☕ Café · food and drinks (last 2 min)",
    order: "Order",
    enjoy: (n: string) => `Enjoy your ${n}! You hold it for 2 minutes.`,
    buy: "Buy",
    use: "Use",
    inUse: "In use",
    remove: "Remove",
    missing: (n: number) => `${n} more needed`,
    howTo: "How to earn KUN Coins",
    close: "Close",
    enter: "Enter the store",
    menu: "See the café menu",
    cafeTitle: "KUN Café",
    cafeSubtitle: "Order something with your KUN Coins: each lasts 2 minutes",
    coins: "coins",
    profile: "My profile",
    editCharacter: "✏️ Edit my character",
    store: "🛍️ KUN Store",
    noPet: "No pet yet: pick one when you edit your character.",
    bought: (n: string) => `You bought ${n}! You're wearing it now.`,
  },
};

/**
 * "Mi perfil": un solo botón con las monedas que, al abrirse, reúne el personaje,
 * la tienda y la mascota (antes eran tres botones flotantes). Debajo aparecen la
 * animación "+5 🪙" al ganar y la bebida activa.
 */
export function CampusCoinsHud({
  visible,
  onOpen,
  name,
  pet,
  onEditAvatar,
}: {
  visible: boolean;
  onOpen: () => void;
  name: string;
  pet: Pet;
  onEditAvatar: () => void;
}) {
  const t = usePick(COPY);
  const [open, setOpen] = useState(false);
  const labels = usePick(REWARD_LABELS);
  const { coins } = useWallet();
  const [pops, setPops] = useState<Array<{ id: number; text: string }>>([]);
  const next = useRef(0);
  // Comida o bebida activa y cuánto le queda (se revisa cada segundo).
  const [treat, setTreat] = useState<{ kind: string; left: number } | null>(null);
  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => {
      const kind = activeTreat();
      setTreat(kind ? { kind, left: Math.ceil((campusRuntime.treat.until - performance.now()) / 1000) } : null);
    }, 1000);
    return () => window.clearInterval(id);
  }, [visible]);

  useEffect(
    () =>
      onEarn(({ amount, kind }) => {
        const id = ++next.current;
        setPops((p) => [...p.slice(-2), { id, text: `+${amount} 🪙 ${labels[kind]}` }]);
        window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 2200);
      }),
    [labels],
  );

  if (!visible) return null;
  return (
    <div className="absolute top-[calc(214px+env(safe-area-inset-top,0px))] left-5 z-20 flex flex-col items-start gap-1.5 max-md:top-[calc(186px+env(safe-area-inset-top,0px))] max-md:left-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-[#1D0C3C]/70 px-3.5 py-1.5 text-[13px] font-bold text-[#FFF3E6] backdrop-blur-md transition hover:bg-[#1D0C3C]/90 max-md:px-3 max-md:text-xs"
      >
        <span aria-hidden>👤</span>
        {t.profile}
        <span className="rounded-full bg-[#F2C14E]/20 px-2 py-0.5 text-[12px] tabular-nums text-[#F2C14E]">🪙 {coins}</span>
        <span aria-hidden className={`text-[10px] text-white/60 transition ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {open && (
        <div className="reveal-animate flex w-[250px] flex-col gap-2.5 rounded-2xl border border-white/15 bg-[#0E061E]/90 p-3 text-[#FFF3E6] backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <b className="truncate text-[14px]">{name || t.profile}</b>
            <span className="shrink-0 text-[12px] font-bold text-[#F2C14E]">🪙 {coins} KUN Coins</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEditAvatar();
              }}
              className="cursor-pointer rounded-xl bg-white/10 px-2 py-2 text-[12px] font-bold transition hover:bg-white/20"
            >
              {t.editCharacter}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpen();
              }}
              className="cursor-pointer rounded-xl bg-[#F2C14E] px-2 py-2 text-[12px] font-black text-[#24123F] transition hover:-translate-y-0.5"
            >
              {t.store}
            </button>
          </div>
          <div className="border-t border-white/10 pt-2.5">
            {pet === "none" ? <p className="m-0 text-[12px] text-white/60">{t.noPet}</p> : <CampusPetPanel visible pet={pet} inline />}
          </div>
        </div>
      )}
      {treat && (
        <span className="rounded-full border border-white/20 bg-[#0E061E]/75 px-3 py-1 text-[12px] font-bold text-[#FFF3E6] backdrop-blur-md">
          {TREAT_CHIP[treat.kind]} · {Math.floor(treat.left / 60)}:{String(treat.left % 60).padStart(2, "0")}
        </span>
      )}
      {pops.map((p) => (
        <span
          key={p.id}
          className="reveal-animate rounded-full bg-[#F2C14E] px-3 py-1 text-[12px] font-black text-[#24123F] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]"
        >
          {p.text}
        </span>
      ))}
    </div>
  );
}

/** Aviso al acercarse a un punto (puerta de la tienda, mostrador del café); también con la tecla E. */
function PlacePrompt({
  enabled,
  blocked,
  onOpen,
  at,
  reach,
  emoji,
  label,
  color,
  onNear,
}: {
  enabled: boolean;
  blocked: boolean;
  onOpen: () => void;
  at: () => { x: number; z: number };
  reach: number;
  emoji: string;
  label: string;
  color: string;
  onNear?: (near: boolean) => void;
}) {
  const [near, setNear] = useState(false);
  const live = useRef({ near, onOpen, blocked, at, onNear });
  useEffect(() => {
    live.current = { near, onOpen, blocked, at, onNear };
  });

  useEffect(() => {
    if (!enabled) {
      live.current.onNear?.(false);
      return;
    }
    const id = window.setInterval(() => {
      const p = campusRuntime.player;
      const point = live.current.at();
      const n = p.y < 1 && Math.hypot(p.x - point.x, p.z - point.z) < reach;
      setNear(n);
      live.current.onNear?.(n && !live.current.blocked);
    }, 200);
    return () => window.clearInterval(id);
  }, [enabled, reach]);

  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el?.closest?.("input, textarea, select, button, a")) return;
      if (e.code !== "KeyE" || !live.current.near || live.current.blocked) return;
      e.preventDefault();
      live.current.onOpen();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  if (!enabled || !near || blocked) return null;
  return (
    <div className="reveal-animate absolute inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] z-20 mx-auto w-fit max-md:bottom-[calc(132px+env(safe-area-inset-bottom,0px))]">
      <button
        type="button"
        onClick={onOpen}
        className="flex cursor-pointer items-center gap-2.5 rounded-full border-2 bg-[#0E061E]/85 px-5 py-2.5 text-[15px] font-bold text-[#FFF3E6] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-md transition hover:-translate-y-0.5"
        style={{ borderColor: color }}
      >
        <span aria-hidden>{emoji}</span>
        {label}
        <kbd className="rounded-md border border-white/40 px-1.5 font-mono text-[11px] max-md:hidden">E</kbd>
      </button>
    </div>
  );
}

const storeDoor = () => zoneDoor(STORE);
const cafeCounter = () => CAFE_COUNTER;
const setNearCounter = (n: boolean) => {
  campusRuntime.nearCounter = n;
};

/** Aviso para entrar a la tienda al acercarse a su puerta (o tecla E). */
export function CampusStorePrompt({ enabled, blocked, onOpen }: { enabled: boolean; /** Krucn o una puerta tienen prioridad. */ blocked: boolean; onOpen: () => void }) {
  const t = usePick(COPY);
  return <PlacePrompt enabled={enabled} blocked={blocked} onOpen={onOpen} at={storeDoor} reach={4} emoji="🛍️" label={t.enter} color="#F2C14E" />;
}

/** Aviso frente al mostrador de la cafetería para ver su menú (o tecla E). */
export function CampusCafePrompt({ enabled, blocked, onOpen }: { enabled: boolean; blocked: boolean; onOpen: () => void }) {
  const t = usePick(COPY);
  return (
    <PlacePrompt enabled={enabled} blocked={blocked} onOpen={onOpen} at={cafeCounter} reach={3.2} emoji="☕" label={t.menu} color="#B8743A" onNear={setNearCounter} />
  );
}

function isEquipped(item: ShopItem, a: Avatar) {
  return item.kind === "accessory" ? a.accessory === item.value : item.kind === "pet" ? a.pet === item.value : a.outfit.toLowerCase() === item.value.toLowerCase();
}

function patchFor(item: ShopItem): Partial<Avatar> {
  if (item.kind === "accessory") return { accessory: item.value as Avatar["accessory"] };
  if (item.kind === "pet") return { pet: item.value as Avatar["pet"] };
  return { outfit: item.value };
}

export function CampusShop({
  open,
  mode = "store",
  avatar,
  onEquip,
  onClose,
}: {
  open: boolean;
  /** "store": ropa, sombreros y mascotas · "cafe": el menú de comidas y bebidas. */
  mode?: "store" | "cafe";
  avatar: Avatar;
  onEquip: (patch: Partial<Avatar>) => void;
  onClose: () => void;
}) {
  const t = usePick(COPY);
  const how = usePick(HOW_TO_EARN);
  const { locale } = useLocale();
  const { coins, owned } = useWallet();
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!open) return;
    resetCampusInput();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sections: Array<[string, ShopItem["kind"]]> =
    mode === "cafe"
      ? [[t.treats, "treat"]]
      : [
          [t.hats, "accessory"],
          [t.pets, "pet"],
          [t.colors, "outfit"],
        ];
  const cafe = mode === "cafe";

  function purchase(item: ShopItem) {
    if (item.kind === "treat") {
      if (!buy(item)) return;
      startTreat(item.value as "coffee" | "juice" | "icecream", TREAT_MS);
      if (item.value === "icecream") addHappy(25);
      playChime();
      setNotice(t.enjoy(item.name[locale]));
      return;
    }
    if (!buy(item)) return;
    onEquip(patchFor(item));
    setNotice(t.bought(item.name[locale]));
  }

  return (
    <div
      className="absolute inset-0 z-[70] flex items-center justify-center bg-[#05020C]/70 p-4 backdrop-blur-md max-md:items-end max-md:p-2"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-title"
        className="reveal-animate relative flex max-h-[92dvh] w-[min(940px,100%)] flex-col overflow-hidden rounded-[28px] border border-[#F2C14E]/40 bg-[#0B0716] text-[#FFF3E6] shadow-[0_40px_100px_-30px_rgba(242,193,78,0.35)]"
      >
        <header className="flex items-center gap-4 border-b border-white/10 px-7 py-5 max-md:px-4 max-md:py-4">
          <span aria-hidden className="text-3xl max-md:text-2xl">
            {cafe ? "☕" : "🛍️"}
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="shop-title" className="m-0 font-(family-name:--font-gabarito) text-[26px] leading-tight font-black max-md:text-xl">
              {cafe ? t.cafeTitle : t.title}
            </h2>
            <p className="m-0 text-[13px] text-white/60 max-md:text-[12px]">{cafe ? t.cafeSubtitle : t.subtitle}</p>
          </div>
          <div className="rounded-full border-2 border-[#F2C14E] px-4 py-1.5 text-[16px] font-black tabular-nums max-md:px-3 max-md:text-sm">
            🪙 {coins}
          </div>
          <CampusLang />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 text-xl transition hover:bg-white/10"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-7 py-5 max-md:px-4">
          {notice && <p className="m-0 mb-4 rounded-2xl bg-[#3FA34D]/20 px-4 py-2.5 text-[14px] font-bold text-[#9BE3A5]">✓ {notice}</p>}
          {sections.map(([title, kind]) => (
            <section key={kind} className="mb-6">
              <h3 className="m-0 mb-3 font-mono text-[12px] tracking-[0.15em] text-white/55 uppercase">{title}</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
                {SHOP_ITEMS.filter((i) => i.kind === kind).map((item) => {
                  const has = item.kind !== "treat" && owned.includes(item.id);
                  const on = isEquipped(item, avatar);
                  const short = item.price - coins;
                  return (
                    <div key={item.id} className={`flex flex-col gap-3 rounded-2xl border p-4 ${on ? "border-[#3FA34D] bg-[#3FA34D]/10" : "border-white/12 bg-white/[0.04]"}`}>
                      <div className="flex items-center gap-3">
                        {item.kind === "outfit" ? (
                          <span aria-hidden className="h-11 w-11 shrink-0 rounded-full border-[3px] border-white" style={{ background: item.value }} />
                        ) : (
                          <span aria-hidden className="text-4xl leading-none">
                            {item.emoji}
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="font-(family-name:--font-gabarito) text-[16px] leading-tight font-extrabold">{item.name[locale]}</div>
                          {!has && <div className="mt-0.5 text-[13px] font-bold text-[#F2C14E]">🪙 {item.price}</div>}
                          {item.effect && <div className="mt-1 text-[12px] leading-snug text-white/65">{item.effect[locale]}</div>}
                        </div>
                      </div>
                      {has ? (
                        on ? (
                          item.kind === "outfit" ? (
                            <span className="rounded-xl bg-[#3FA34D]/25 py-2 text-center text-[13px] font-bold text-[#9BE3A5]">✓ {t.inUse}</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onEquip(item.kind === "pet" ? { pet: "none" } : { accessory: "none" })}
                              className="cursor-pointer rounded-xl border border-white/25 py-2 text-[13px] font-bold transition hover:bg-white/10"
                            >
                              ✓ {t.inUse} · {t.remove}
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => onEquip(patchFor(item))}
                            className="cursor-pointer rounded-xl bg-white/12 py-2 text-[13px] font-bold transition hover:bg-white/20"
                          >
                            {t.use}
                          </button>
                        )
                      ) : (
                        <button
                          type="button"
                          disabled={short > 0}
                          onClick={() => purchase(item)}
                          className="cursor-pointer rounded-xl bg-[#F2C14E] py-2 text-[13px] font-black text-[#24123F] transition enabled:hover:-translate-y-0.5 disabled:cursor-default disabled:bg-white/10 disabled:text-white/45"
                        >
                          {short > 0 ? t.missing(short) : `${item.kind === "treat" ? t.order : t.buy} · 🪙 ${item.price}`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="m-0 mb-2 font-mono text-[12px] tracking-[0.15em] text-white/55 uppercase">{t.howTo}</h3>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13.5px] text-white/80">
              {how.map(([icon, text]) => (
                <li key={text} className="flex gap-2">
                  <span aria-hidden>{icon}</span>
                  {text}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
