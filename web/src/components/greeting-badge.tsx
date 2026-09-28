"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export function GreetingBadge({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);

  return (
    <div
      className={`small-caps mx-auto mb-7 inline-block cursor-default bg-navy px-8 py-2.5 text-xs font-bold tracking-[0.14em] text-cream transition duration-300 ${active ? "-translate-y-1 scale-[1.03] bg-burgundy shadow-[0_12px_28px_rgba(3,62,140,0.5)]" : ""}`}
      style={{ clipPath: "polygon(4% 0%, 96% 0%, 100% 50%, 96% 100%, 4% 100%, 0% 50%)" }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onClick={() => setActive((a) => !a)}
    >
      {children}
    </div>
  );
}
