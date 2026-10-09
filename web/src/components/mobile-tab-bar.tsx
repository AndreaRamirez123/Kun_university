"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePick } from "@/i18n/locale-context";

const LABELS = {
  es: { programas: "Programas", educacion: "Educación", comunidad: "Comunidad", informacion: "Información" },
  en: { programas: "Programs", educacion: "Education", comunidad: "Community", informacion: "Information" },
};

const ITEMS = [
  {
    href: "#programas",
    key: "programas" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 10L12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
      </svg>
    ),
  },
  {
    href: "#continua",
    key: "educacion" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="5" />
        <path d="M8.5 12.5L7 22l5-3 5 3-1.5-9.5" />
      </svg>
    ),
  },
  {
    href: "#comunidad",
    key: "comunidad" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
        <circle cx="18" cy="8.5" r="2.3" />
        <path d="M16.5 14.2c2.6.5 4.5 2.5 4.5 5" />
      </svg>
    ),
  },
  {
    href: "#informacion",
    key: "informacion" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7.5v.01" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function MobileTabBar({ pillBg, accents }: { pillBg: string; accents: [string, string, string, string] }) {
  const labels = usePick(LABELS);
  const [active, setActive] = useState(0);
  const menuRef = useRef<HTMLElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const clipId = useId();

  const positionBorder = (index: number) => {
    const menu = menuRef.current;
    const border = borderRef.current;
    const item = itemRefs.current[index];
    if (!menu || !border || !item) return;
    const menuRect = menu.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const left = itemRect.left - menuRect.left - (border.offsetWidth - itemRect.width) / 2;
    border.style.transform = `translate3d(${Math.floor(left)}px, 0, 0)`;
  };

  useEffect(() => {
    positionBorder(active);
    const handleResize = () => {
      menuRef.current?.style.setProperty("--mtb-timeout", "0s");
      positionBorder(active);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (index: number) => {
    if (index === active) return;
    menuRef.current?.style.removeProperty("--mtb-timeout");
    setActive(index);
    positionBorder(index);
  };

  return (
    <nav
      ref={menuRef}
      className="mtb-menu fixed bottom-4 left-1/2 z-40 hidden -translate-x-1/2 max-md:flex"
      style={{ background: pillBg }}
    >
      {ITEMS.map((item, i) => (
        <a
          key={item.href}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          href={item.href}
          aria-label={labels[item.key]}
          className={`mtb-item ${i === active ? "active" : ""}`}
          style={{ "--mtb-accent": accents[i] } as React.CSSProperties}
          onClick={() => handleClick(i)}
        >
          <span className="mtb-icon">{item.icon}</span>
        </a>
      ))}
      <div ref={borderRef} className="mtb-border" style={{ clipPath: `url(#${clipId})`, background: pillBg }} />
      <svg width="0" height="0" aria-hidden className="absolute">
        <clipPath id={clipId} clipPathUnits="objectBoundingBox" transform="scale(0.0049285362247413 0.021978021978022)">
          <path d="M6.7,45.5c5.7,0.1,14.1-0.4,23.3-4c5.7-2.3,9.9-5,18.1-10.5c10.7-7.1,11.8-9.2,20.6-14.3c5-2.9,9.2-5.2,15.2-7c7.1-2.1,13.3-2.3,17.6-2.1c4.2-0.2,10.5,0.1,17.6,2.1c6.1,1.8,10.2,4.1,15.2,7c8.8,5,9.9,7.1,20.6,14.3c8.3,5.5,12.4,8.2,18.1,10.5c9.2,3.6,17.6,4.2,23.3,4H6.7z" />
        </clipPath>
      </svg>
    </nav>
  );
}
