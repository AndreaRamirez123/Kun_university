"use client";

import Link from "next/link";
import { usePick } from "@/i18n/locale-context";

const COPY = {
  es: {
    title: "Tu navegador no puede mostrar el campus en 3D",
    body: "Activa la aceleración por hardware o abre esta página en una versión reciente de Chrome, Edge o Safari.",
    classicSite: "Ver versión clásica del sitio",
  },
  en: {
    title: "Your browser can't display the 3D campus",
    body: "Enable hardware acceleration or open this page in a recent version of Chrome, Edge or Safari.",
    classicSite: "View the classic site",
  },
};

export function NoWebGLFallback() {
  const t = usePick(COPY);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1D1236] px-6 text-center text-[#FFF3E6]">
      <p className="text-lg font-bold">{t.title}</p>
      <p className="max-w-80 text-sm opacity-80">{t.body}</p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-[#FFC85C] px-6 py-3 text-sm font-bold text-[#24123F] transition hover:-translate-y-0.5"
      >
        {t.classicSite}
      </Link>
    </div>
  );
}
