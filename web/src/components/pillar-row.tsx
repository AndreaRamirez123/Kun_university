"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export function PillarRow({
  title,
  body,
  icon,
  accent,
  bordered,
  delay,
}: {
  title: string;
  body: string;
  icon: ReactNode;
  accent: string;
  bordered: boolean;
  delay: number;
}) {
  const [active, setActive] = useState(false);

  return (
    <div
      className={`flex items-center gap-7 px-12 py-9 transition-colors duration-300 max-md:gap-4 max-md:px-5 max-md:py-5 ${bordered ? "border-t border-burgundy/25" : ""} ${active ? "bg-white/[0.06]" : ""}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onClick={() => setActive((a) => !a)}
    >
      <div
        className={`animate-pulse-soft flex h-17 w-17 shrink-0 items-center justify-center rounded-full border-2 transition-transform duration-300 max-md:h-12 max-md:w-12 ${active ? "scale-110" : ""}`}
        style={{
          borderColor: accent,
          color: accent,
          background: `${accent}1F`,
          boxShadow: `0 0 0 7px ${accent}14`,
          animationDelay: `${delay}s`,
        }}
      >
        {icon}
      </div>
      <div className={`transition-transform duration-300 ${active ? "translate-x-1.5" : ""}`}>
        <div className="mb-1.5 text-lg font-bold max-md:mb-1 max-md:text-[15px]">{title}</div>
        <div className="max-w-140 text-sm leading-[1.65] text-navy-muted max-md:text-[13px] max-md:leading-[1.5]">
          {body}
        </div>
      </div>
    </div>
  );
}
