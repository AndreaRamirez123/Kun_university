"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "./reveal";

export type FanItem = {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  accent: string;
};

export function FanStack({
  items,
  ink = "#FFFFFF",
  mutedText = "rgba(255,255,255,0.92)",
  fontDisplay,
  hintColor,
}: {
  items: FanItem[];
  ink?: string;
  mutedText?: string;
  fontDisplay: string;
  hintColor?: string;
}) {
  const [isNarrow, setIsNarrow] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onResize() {
      setIsNarrow(window.innerWidth < 768);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // On mobile there's no hover: fan out automatically once the stack scrolls
  // into view, so there's still visible motion without requiring a tap.
  useEffect(() => {
    if (!isNarrow) return;
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setMobileOpen(true);
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isNarrow]);

  const open = (isNarrow ? mobileOpen : hovering) || selected !== null;
  const mid = (items.length - 1) / 2;
  const cardWidth = isNarrow ? 138 : 210;
  const selectedWidth = isNarrow ? 260 : 340;
  const step = isNarrow ? 62 : 145;
  const collapsedStep = isNarrow ? 10 : 18;
  const containerHeight = selected !== null ? (isNarrow ? 300 : 380) : isNarrow ? 260 : open ? 340 : 220;

  return (
    <Reveal>
      <div
        ref={containerRef}
        className="relative mx-auto flex justify-center transition-[height] duration-500"
        style={{ height: containerHeight, maxWidth: "100%" }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => setSelected(null)}
      >
        {items.map((item, i) => {
          const offset = i - mid;
          const isSelected = selected === i;
          const anySelected = selected !== null;
          const dir = offset === 0 ? -1 : Math.sign(offset);

          let x: number;
          let y: number;
          let rotate: number;
          let width: number;
          let z: number;
          let opacity = 1;

          if (isSelected) {
            x = 0;
            y = 0;
            rotate = 0;
            width = selectedWidth;
            z = 50;
          } else if (anySelected) {
            x = dir * cardWidth * 0.95;
            y = 24;
            rotate = dir * 12;
            width = cardWidth;
            z = 10 - Math.abs(i - (selected ?? 0));
            opacity = 0.45;
          } else if (open) {
            x = offset * step;
            y = Math.abs(offset) * (isNarrow ? 8 : 16);
            rotate = offset * 6;
            width = cardWidth;
            z = 10 - Math.abs(offset);
          } else {
            x = offset * collapsedStep;
            y = Math.abs(offset) * 4;
            rotate = offset * 4;
            width = cardWidth;
            z = i;
          }

          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(isSelected ? null : i);
              }}
              className="absolute top-0 cursor-pointer rounded-2xl border p-4 text-center backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] md:p-6"
              style={{
                width,
                transform: `translateX(${x}px) translateY(${y}px) rotate(${rotate}deg)`,
                zIndex: z,
                opacity,
                background: `linear-gradient(160deg, ${item.accent}b0, ${item.accent}70)`,
                borderColor: `${item.accent}`,
                boxShadow: isSelected ? "0 28px 56px rgba(0,0,0,0.4)" : "0 20px 40px rgba(0,0,0,0.32)",
              }}
            >
              {item.eyebrow && (
                <div
                  className="mb-2 inline-block rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold whitespace-nowrap uppercase md:text-[10px]"
                  style={{ color: item.accent }}
                >
                  {item.eyebrow}
                </div>
              )}
              <div
                className="mb-1.5 text-sm leading-tight font-bold break-words md:text-base"
                style={{ fontFamily: fontDisplay, color: ink }}
              >
                {item.title}
              </div>
              <p
                className={`${isSelected ? "" : "line-clamp-3"} text-[11px] leading-snug font-semibold break-words md:text-xs`}
                style={{ color: mutedText }}
              >
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-center text-[11px] font-medium" style={{ color: hintColor ?? mutedText }}>
        {selected !== null
          ? "Toca de nuevo para volver"
          : isNarrow
            ? "Toca una escuela para leerla completa"
            : "Pasa el mouse y toca una escuela para leerla completa"}
      </div>
    </Reveal>
  );
}
