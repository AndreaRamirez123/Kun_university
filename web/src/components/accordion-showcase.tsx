"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal } from "./reveal";

export type AccordionItem = {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  accent: string;
  icon?: ReactNode;
};

export type AccordionTheme = {
  fontDisplay: string;
  ink: string;
  mutedText: string;
  border?: string;
  shape?: string;
  ctaLabel?: string;
};

function GridCard({ item, theme, delay }: { item: AccordionItem; theme: AccordionTheme; delay: number }) {
  return (
    <Reveal
      delay={delay}
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_16px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(0,0,0,0.22)] md:rounded-3xl"
    >
      <div className="flex h-11 items-center justify-center px-2 md:h-14" style={{ background: item.accent }}>
        {item.eyebrow && (
          <span className="text-center text-[9px] leading-tight font-bold tracking-[0.05em] text-white uppercase md:text-xs">
            {item.eyebrow}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 md:p-6">
        <div
          className="mb-1 text-[13px] leading-tight font-bold text-[#171717] md:mb-2 md:text-lg"
          style={{ fontFamily: theme.fontDisplay }}
        >
          {item.title}
        </div>
        <p className="mb-2.5 line-clamp-3 text-[11px] leading-snug text-[#6B7280] md:mb-4 md:text-sm md:leading-relaxed">
          {item.description}
        </p>
        <div
          className="mt-auto rounded-full py-1.5 text-center text-[10px] font-bold text-white uppercase md:py-2.5 md:text-xs"
          style={{ background: item.accent }}
        >
          Ver más
        </div>
      </div>
    </Reveal>
  );
}

export function AccordionShowcase({
  items,
  autoRotateMs = 4200,
  theme,
  variant = "grid",
}: {
  items: AccordionItem[];
  autoRotateMs?: number;
  theme: AccordionTheme;
  variant?: "grid" | "accordion";
}) {
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (variant !== "accordion") return;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      setActive((a) => (a + 1) % items.length);
    }, autoRotateMs);
    return () => clearInterval(timer);
  }, [variant, items.length, autoRotateMs]);

  if (variant !== "accordion") {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {items.map((item, i) => (
          <GridCard key={item.id} item={item} theme={theme} delay={(i % 6) * 90} />
        ))}
      </div>
    );
  }

  const activePct = 42;
  const restPct = (100 - activePct) / Math.max(items.length - 1, 1);

  return (
    <div
      className="flex h-[460px] flex-col gap-3 md:h-[300px] md:flex-row md:gap-4"
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      {items.map((item, i) => {
        const isActive = i === active;
        return (
          <button
            key={item.id}
            type="button"
            onMouseEnter={() => {
              pausedRef.current = true;
              setActive(i);
            }}
            onFocus={() => {
              pausedRef.current = true;
              setActive(i);
            }}
            onClick={() => {
              pausedRef.current = true;
              setActive(i);
            }}
            className={`relative flex flex-col justify-end overflow-hidden p-0 text-left transition-[flex-grow] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${theme.shape ?? "rounded-2xl"}`}
            style={{
              flexGrow: isActive ? activePct : restPct,
              flexBasis: 0,
              minWidth: 0,
              border: theme.border ? `1px solid ${theme.border}` : undefined,
              background: item.accent,
            }}
          >
            {isActive && (
              <div
                aria-hidden
                className="cm-tape"
                style={{ top: -8, left: "20%", transform: "rotate(-6deg)" }}
              />
            )}

            <div
              aria-hidden={isActive}
              className="absolute inset-0 flex items-end p-3 transition-opacity duration-300 md:p-5"
              style={{ opacity: isActive ? 0 : 1 }}
            >
              <span
                className="text-xs leading-tight font-bold uppercase md:text-base"
                style={{ color: theme.ink }}
              >
                {item.title}
              </span>
            </div>

            {item.icon && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-6 flex justify-center transition-opacity duration-300 md:hidden"
                style={{ opacity: isActive ? 1 : 0 }}
              >
                <div className="h-10 w-10 opacity-95 [&_svg]:h-full [&_svg]:w-full" style={{ color: theme.ink }}>
                  {item.icon}
                </div>
              </div>
            )}

            {item.icon && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 bottom-16 hidden items-center justify-center md:flex"
              >
                <div
                  className="h-14 w-14 opacity-95 [&_svg]:h-full [&_svg]:w-full"
                  style={{ color: theme.ink }}
                >
                  {item.icon}
                </div>
              </div>
            )}

            <div
              className={`relative z-10 p-4 transition-opacity duration-500 md:p-7 ${item.icon ? "pt-16 md:pt-24" : ""}`}
              style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }}
              aria-hidden={!isActive}
            >
              {item.eyebrow && (
                <div
                  className="mb-1.5 inline-block rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] whitespace-nowrap uppercase md:mb-2.5 md:px-3 md:text-xs"
                  style={{ color: item.accent }}
                >
                  {item.eyebrow}
                </div>
              )}
              <div
                className="mb-1.5 text-base leading-tight font-bold md:mb-2.5 md:text-xl"
                style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
              >
                {item.title}
              </div>
              <p
                className="line-clamp-3 max-w-100 text-xs leading-[1.5] md:line-clamp-4 md:text-sm md:leading-[1.6]"
                style={{ color: theme.mutedText }}
              >
                {item.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
