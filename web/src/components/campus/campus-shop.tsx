"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { Avatar } from "./campus-avatar";
import { campusRuntime, resetCampusInput } from "./campus-runtime";
import { STORE, zoneDoor } from "./campus-zones";
import { buy, HOW_TO_EARN, onEarn, REWARD_LABELS, SHOP_ITEMS, useWallet, type ShopItem } from "./campus-wallet";

// Interfaz de la tienda: el contador de monedas del HUD, el aviso para entrar a
// la KUN Store y la ventana con los artículos.

const COPY = {
  es: {
    title: "KUN Store",
    subtitle: "Canjea tus KUN Coins por cosas para tu personaje",
    hats: "Sombreros",
    pets: "Mascotas",
    colors: "Colores de ropa",
    buy: "Comprar",
    use: "Usar",
    inUse: "En uso",
    remove: "Quitar",
    missing: (n: number) => `Te faltan ${n}`,
    howTo: "Cómo ganar KUN Coins",
    close: "Cerrar",
    enter: "Entrar a la tienda",
    coins: "monedas",
    bought: (n: string) => `¡Compraste ${n}! Ya lo llevas puesto.`,
  },
  en: {
    title: "KUN Store",
    subtitle: "Trade your KUN Coins for things for your character",
    hats: "Hats",
    pets: "Pets",
    colors: "Outfit colors",
    buy: "Buy",
    use: "Use",
    inUse: "In use",
    remove: "Remove",
    missing: (n: number) => `${n} more needed`,
    howTo: "How to earn KUN Coins",
    close: "Close",
    enter: "Enter the store",
    coins: "coins",
    bought: (n: string) => `You bought ${n}! You're wearing it now.`,
  },
};

/** Contador de monedas con la animación "+5 🪙" al ganar; al tocarlo abre la tienda. */
export function CampusCoinsHud({ visible, onOpen }: { visible: boolean; onOpen: () => void }) {
  const t = usePick(COPY);
  const labels = usePick(REWARD_LABELS);
  const { coins } = useWallet();
  const [pops, setPops] = useState<Array<{ id: number; text: string }>>([]);
  const next = useRef(0);

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
    <div className="absolute top-[calc(258px+env(safe-area-inset-top,0px))] left-5 z-20 flex flex-col items-start gap-1.5 max-md:top-[calc(222px+env(safe-area-inset-top,0px))] max-md:left-3">
      <button
        type="button"
        onClick={onOpen}
        title={t.title}
        className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-[#F2C14E] bg-[#0E061E]/75 px-3.5 py-1.5 text-[13px] font-bold text-[#FFF3E6] backdrop-blur-md transition hover:bg-[#0E061E]/90 max-md:px-3 max-md:text-xs"
      >
        <span aria-hidden>🪙</span>
        <span className="tabular-nums">{coins}</span>
        <span className="text-[11px] font-semibold text-[#F2C14E]">KUN Coins</span>
        <span className="text-white/60 max-md:hidden">· 🛍️ {t.title}</span>
      </button>
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

/** Aviso para entrar a la tienda al acercarse a su puerta (o tecla E). */
export function CampusStorePrompt({ enabled, blocked, onOpen }: { enabled: boolean; /** Krucn o una puerta tienen prioridad. */ blocked: boolean; onOpen: () => void }) {
  const t = usePick(COPY);
  const [near, setNear] = useState(false);
  const live = useRef({ near, onOpen, blocked });
  useEffect(() => {
    live.current = { near, onOpen, blocked };
  });

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      const p = campusRuntime.player;
      const door = zoneDoor(STORE);
      setNear(Math.hypot(p.x - door.x, p.z - door.z) < 4);
    }, 200);
    return () => window.clearInterval(id);
  }, [enabled]);

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
        className="flex cursor-pointer items-center gap-2.5 rounded-full border-2 border-[#F2C14E] bg-[#0E061E]/85 px-5 py-2.5 text-[15px] font-bold text-[#FFF3E6] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-md transition hover:-translate-y-0.5"
      >
        <span aria-hidden>🛍️</span>
        {t.enter}
        <kbd className="rounded-md border border-white/40 px-1.5 font-mono text-[11px] max-md:hidden">E</kbd>
      </button>
    </div>
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
  avatar,
  onEquip,
  onClose,
}: {
  open: boolean;
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

  const sections: Array<[string, ShopItem["kind"]]> = [
    [t.hats, "accessory"],
    [t.pets, "pet"],
    [t.colors, "outfit"],
  ];

  function purchase(item: ShopItem) {
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
            🛍️
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="shop-title" className="m-0 font-(family-name:--font-gabarito) text-[26px] leading-tight font-black max-md:text-xl">
              {t.title}
            </h2>
            <p className="m-0 text-[13px] text-white/60 max-md:text-[12px]">{t.subtitle}</p>
          </div>
          <div className="rounded-full border-2 border-[#F2C14E] px-4 py-1.5 text-[16px] font-black tabular-nums max-md:px-3 max-md:text-sm">
            🪙 {coins}
          </div>
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
                  const has = owned.includes(item.id);
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
                          {short > 0 ? t.missing(short) : `${t.buy} · 🪙 ${item.price}`}
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
