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
    <div
      className="flex flex-wrap justify-center gap-8 [--card-h:195px] [--card-w:130px] max-md:gap-3 md:[--card-h:260px] md:[--card-w:220px]"
    >
      {certifications.map((cert, i) => (
        <BookFlipCard key={cert.slug} cert={cert} accent={i % 2 === 0 ? RED : NAVY} />
      ))}
    </div>
  );
}

function CampusWatermark({ accent, className = "" }: { accent: string; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 160"
      className={`pointer-events-none ${className}`}
      style={{ color: accent }}
    >
      <rect x="30" y="90" width="140" height="60" fill="currentColor" />
      <rect x="50" y="65" width="100" height="30" fill="currentColor" />
      <rect x="70" y="45" width="60" height="25" fill="currentColor" />
      <rect x="88" y="25" width="24" height="24" fill="currentColor" />
      <polygon points="100,10 122,25 78,25" fill="currentColor" />
      <rect x="94" y="118" width="12" height="32" fill="#FFF9EC" />
    </svg>
  );
}

function GradCapIcon({ color }: { color: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      className="h-6 w-6 md:h-9 md:w-9"
    >
      <path d="M2 9l10-5 10 5-10 5-10-5z" />
      <path d="M6 11.5V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.5" />
      <path d="M22 9v6" strokeLinecap="round" />
    </svg>
  );
}

function BookFlipCard({ cert, accent }: { cert: Certification; accent: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative transition-[width] duration-700 ease-[cubic-bezier(0.4,0.1,0.2,1)]"
      style={{
        height: "var(--card-h)",
        width: open ? "calc(var(--card-w) * 2)" : "var(--card-w)",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      {/* inside page: revealed on the right once the cover swings away */}
      <div
        className="absolute top-0 right-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl border-[3px] p-3 text-center md:p-6"
        style={{
          width: "var(--card-w)",
          height: "var(--card-h)",
          borderColor: INK,
          background: CREAM,
          boxShadow: `5px 5px 0 ${INK}`,
        }}
      >
        <div
          className="text-[11px] leading-tight font-extrabold uppercase md:text-base"
          style={{ fontFamily: DISPLAY, color: accent }}
        >
          {cert.name}
        </div>
        <p className="mt-1.5 text-[9px] leading-[1.4] md:mt-2.5 md:text-[13px] md:leading-[1.5]" style={{ color: INK }}>
          {cert.description}
        </p>
        <a
          href="#informacion"
          className="group relative mt-2 overflow-hidden rounded-lg border-2 px-3 py-1.5 text-[8px] font-extrabold tracking-[0.04em] uppercase md:mt-4 md:px-5 md:py-2 md:text-xs"
          style={{ borderColor: accent, color: accent }}
        >
          <span
            aria-hidden
            className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
            style={{ background: accent }}
          />
          <span className="relative transition-colors duration-300 group-hover:text-white">Inscríbete →</span>
        </a>
      </div>

      {/* flip cover: swings open on a left hinge, revealing the inside page */}
      <div
        className="absolute top-0 right-0"
        style={{ width: "var(--card-w)", height: "var(--card-h)", perspective: "2000px" }}
      >
        <div
          className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.4,0.1,0.2,1)]"
          style={{
            transformOrigin: "left",
            transformStyle: "preserve-3d",
            transform: open ? "rotateY(-180deg)" : "rotateY(0deg)",
          }}
        >
          {/* front */}
          <div
            className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border-[3px]"
            style={{ borderColor: INK, background: accent, boxShadow: `5px 5px 0 ${INK}`, backfaceVisibility: "hidden" }}
          >
            <div
              className="flex flex-1 flex-col items-center justify-center gap-1 p-2 text-center md:gap-2 md:p-5"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 88%, 57% 88%, 50% 100%, 43% 88%, 0 88%)",
              }}
            >
              <GradCapIcon color={CREAM} />
              <div
                className="text-[11px] font-extrabold uppercase md:text-base"
                style={{ fontFamily: DISPLAY, color: CREAM }}
              >
                {cert.name}
              </div>
              <span className="text-[9px] font-bold md:text-xs" style={{ color: CREAM, opacity: 0.85 }}>
                {cert.hours}h · online
              </span>
            </div>
            <div
              className="py-1.5 text-center text-[9px] font-extrabold tracking-[0.06em] uppercase md:py-2.5 md:text-xs"
              style={{ color: CREAM }}
            >
              Ver más
            </div>
          </div>

          {/* back */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl border-[3px]"
            style={{
              borderColor: INK,
              background: CREAM,
              boxShadow: `5px 5px 0 ${INK}`,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              clipPath: "polygon(0% 0%, 100% 0%, 88% 50%, 100% 100%, 0% 100%)",
            }}
          >
            <CampusWatermark accent={accent} className="h-16 w-16 opacity-30 md:h-28 md:w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
