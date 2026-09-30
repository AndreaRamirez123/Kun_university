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
    <div className="grid grid-cols-3 gap-6 max-md:grid-cols-2 max-md:gap-3">
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
      className="relative min-h-70 cursor-pointer max-md:min-h-40"
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
            className="px-5 py-3 text-xs font-extrabold tracking-[0.06em] uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
            style={{ fontFamily: DISPLAY, background: accent, color: CREAM }}
          >
            {cert.hours}h · online
          </div>
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center max-md:p-3">
            <div
              className="text-xl font-extrabold uppercase max-md:text-sm"
              style={{ fontFamily: DISPLAY, color: INK }}
            >
              {cert.name}
            </div>
            <span
              aria-hidden
              className="mt-3 h-[3px] w-12 rounded-full max-md:mt-2 max-md:w-8"
              style={{ background: accent }}
            />
          </div>
        </div>

        {/* back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl border-[3px] p-6 text-center max-md:p-3"
          style={{
            borderColor: INK,
            background: accent,
            color: CREAM,
            boxShadow: `5px 5px 0 ${INK}`,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-sm leading-[1.6] max-md:text-[11px] max-md:leading-[1.4]">{cert.description}</p>
          <div className="small-caps mt-4 text-xs font-bold tracking-[0.08em] uppercase opacity-80 max-md:mt-2 max-md:text-[9px]">
            Ver más
          </div>
        </div>
      </div>
    </div>
  );
}
