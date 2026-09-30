"use client";

import { useState } from "react";
import type { Certification } from "@/lib/types";

const RED = "#BF0404";
const NAVY = "#003D54";
const INK = "#10101A";
const CREAM = "#FFF9EC";
const DISPLAY = "var(--font-archivo-black), sans-serif";

export function CertificationFlipGrid({ certifications }: { certifications: Certification[] }) {
  return (
    <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
      {certifications.map((cert, i) => (
        <FlipCard key={cert.slug} cert={cert} accent={i % 2 === 0 ? RED : NAVY} />
      ))}
    </div>
  );
}

function FlipCard({ cert, accent }: { cert: Certification; accent: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative min-h-70 cursor-pointer"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onTouchStart={() => setFlipped((f) => !f)}
    >
      <div
        className="relative h-full w-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* front */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border-[3px]"
          style={{ borderColor: INK, background: CREAM, boxShadow: `5px 5px 0 ${INK}`, backfaceVisibility: "hidden" }}
        >
          <div
            className="px-5 py-3 text-xs font-extrabold tracking-[0.06em] uppercase"
            style={{ fontFamily: DISPLAY, background: accent, color: CREAM }}
          >
            {cert.hours}h · online
          </div>
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="text-xl font-extrabold uppercase" style={{ fontFamily: DISPLAY, color: INK }}>
              {cert.name}
            </div>
            <span
              aria-hidden
              className="mt-3 h-[3px] w-12 rounded-full"
              style={{ background: accent }}
            />
          </div>
        </div>

        {/* back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl border-[3px] p-6 text-center"
          style={{
            borderColor: INK,
            background: accent,
            color: CREAM,
            boxShadow: `5px 5px 0 ${INK}`,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-sm leading-[1.6]">{cert.description}</p>
          <div className="small-caps mt-4 text-xs font-bold tracking-[0.08em] uppercase opacity-80">
            Ver más
          </div>
        </div>
      </div>
    </div>
  );
}
