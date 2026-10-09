"use client";

import { useState } from "react";

const MODELS = [
  { n: 1, href: "/", label: "Miami Deco" },
  { n: 2, href: "/estilo-2", label: "Retro USA" },
  { n: 3, href: "/estilo-3", label: "Collage" },
  { n: 4, href: "/campus", label: "Campus 3D" },
];

export function ModelSwitcher({ current }: { current: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 left-5 z-50 max-md:bottom-20">
      {open && (
        <div className="mb-2 flex flex-col gap-1 rounded-2xl bg-[#10182B] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          {MODELS.map((m) => (
            <a
              key={m.n}
              href={m.href}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
                m.n === current ? "bg-white text-[#10182B]" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Modelo {m.n} · {m.label}
            </a>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Comparar los modelos"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#10182B] text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l8 4-8 4-8-4 8-4z" />
          <path d="M4 12l8 4 8-4" />
          <path d="M4 17l8 4 8-4" />
        </svg>
      </button>
    </div>
  );
}
