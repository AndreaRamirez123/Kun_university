"use client";

import Link from "next/link";

export function NoWebGLFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1D1236] px-6 text-center text-[#FFF3E6]">
      <p className="text-lg font-bold">Tu navegador no puede mostrar el campus en 3D</p>
      <p className="max-w-80 text-sm opacity-80">
        Activa la aceleración por hardware o abre esta página en una versión reciente de Chrome, Edge o Safari.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-[#FFC85C] px-6 py-3 text-sm font-bold text-[#24123F] transition hover:-translate-y-0.5"
      >
        Ver versión clásica del sitio
      </Link>
    </div>
  );
}
