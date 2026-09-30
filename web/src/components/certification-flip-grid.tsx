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
        <ExpandCard key={cert.slug} cert={cert} accent={i % 2 === 0 ? RED : NAVY} />
      ))}
    </div>
  );
}

function CampusWatermark({ accent }: { accent: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 160"
      className="pointer-events-none absolute -right-6 -bottom-8 h-40 w-40 opacity-[0.14] max-md:h-24 max-md:w-24"
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

function ExpandCard({ cert, accent }: { cert: Certification; accent: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-[3px] transition-transform duration-300"
      style={{
        borderColor: INK,
        background: CREAM,
        boxShadow: open ? `7px 7px 0 ${INK}` : `5px 5px 0 ${INK}`,
        transform: open ? "translate(-2px,-2px)" : "translate(0,0)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="relative flex w-full flex-col items-stretch text-left"
      >
        <CampusWatermark accent={accent} />
        <div
          className="flex items-center justify-between px-5 py-3 text-xs font-extrabold tracking-[0.06em] uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
          style={{ fontFamily: DISPLAY, background: accent, color: CREAM }}
        >
          <span>{cert.hours}h · online</span>
          <span
            aria-hidden
            className="inline-block text-sm transition-transform duration-300 max-md:text-xs"
            style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          >
            +
          </span>
        </div>
        <div className="relative flex min-h-56 flex-1 flex-col items-center justify-center p-6 text-center max-md:min-h-32 max-md:p-3">
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
      </button>

      {/* staged reveal: description drawer, then CTA fades in after */}
      <div
        className="grid transition-[grid-template-rows] duration-500 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div
            className="border-t-[3px] p-6 text-center max-md:p-3"
            style={{ borderColor: INK, background: accent, color: CREAM }}
          >
            <p className="text-sm leading-[1.6] max-md:text-[11px] max-md:leading-[1.4]">
              {cert.description}
            </p>
            <a
              href="#informacion"
              className="mt-4 inline-block rounded-full border-2 px-5 py-2 text-xs font-extrabold tracking-[0.04em] uppercase transition-opacity duration-300 max-md:mt-2 max-md:px-4 max-md:py-1.5 max-md:text-[10px]"
              style={{
                borderColor: CREAM,
                color: CREAM,
                opacity: open ? 1 : 0,
                transitionDelay: open ? "250ms" : "0ms",
              }}
            >
              Inscríbete →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
