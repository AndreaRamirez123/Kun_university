"use client";

import { useState } from "react";
import type { Certification } from "@/lib/types";

const RED = "#BF0404";
const NAVY = "#003D54";
const INK = "#10101A";
const CREAM = "#FFF9EC";
const DISPLAY = "var(--font-archivo-black), sans-serif";

const CARD_W = 220;
const CARD_H = 260;

export function CertificationFlipGrid({ certifications }: { certifications: Certification[] }) {
  return (
    <>
      {/* Desktop: card widens and the cover opens like a book, hinged on the left */}
      <div className="flex flex-wrap justify-center gap-10 max-md:hidden">
        {certifications.map((cert, i) => (
          <BookFlipCard key={cert.slug} cert={cert} accent={i % 2 === 0 ? RED : NAVY} />
        ))}
      </div>

      {/* Mobile: click-to-expand drawer (widening would overflow a phone screen) */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {certifications.map((cert, i) => (
          <ExpandCard key={cert.slug} cert={cert} accent={i % 2 === 0 ? RED : NAVY} />
        ))}
      </div>
    </>
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
    <svg aria-hidden width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
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
      style={{ height: CARD_H, width: open ? CARD_W * 2 : CARD_W }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      {/* inside page: revealed on the right once the cover swings away */}
      <div
        className="absolute top-0 right-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl border-[3px] p-6 text-center"
        style={{
          width: CARD_W,
          height: CARD_H,
          borderColor: INK,
          background: CREAM,
          boxShadow: `5px 5px 0 ${INK}`,
        }}
      >
        <div className="text-base leading-tight font-extrabold uppercase" style={{ fontFamily: DISPLAY, color: accent }}>
          {cert.name}
        </div>
        <p className="mt-2.5 text-[13px] leading-[1.5]" style={{ color: INK }}>
          {cert.description}
        </p>
        <a
          href="#informacion"
          className="group relative mt-4 overflow-hidden rounded-lg border-2 px-5 py-2 text-xs font-extrabold tracking-[0.04em] uppercase"
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
        style={{ width: CARD_W, height: CARD_H, perspective: "2000px" }}
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
              className="flex flex-1 flex-col items-center justify-center gap-2 p-5 text-center"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 88%, 57% 88%, 50% 100%, 43% 88%, 0 88%)",
              }}
            >
              <GradCapIcon color={CREAM} />
              <div className="text-base font-extrabold uppercase" style={{ fontFamily: DISPLAY, color: CREAM }}>
                {cert.name}
              </div>
              <span className="text-xs font-bold" style={{ color: CREAM, opacity: 0.85 }}>
                {cert.hours}h · online
              </span>
            </div>
            <div
              className="py-2.5 text-center text-xs font-extrabold tracking-[0.06em] uppercase"
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
            <CampusWatermark accent={accent} className="h-28 w-28 opacity-30" />
          </div>
        </div>
      </div>
    </div>
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
        <CampusWatermark accent={accent} className="absolute -right-6 -bottom-8 h-24 w-24 opacity-[0.14]" />
        <div
          className="flex items-center justify-between px-3 py-2 text-[10px] font-extrabold tracking-[0.06em] uppercase"
          style={{ fontFamily: DISPLAY, background: accent, color: CREAM }}
        >
          <span>{cert.hours}h · online</span>
          <span
            aria-hidden
            className="inline-block text-xs transition-transform duration-300"
            style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          >
            +
          </span>
        </div>
        <div className="relative flex min-h-32 flex-1 flex-col items-center justify-center p-3 text-center">
          <div className="text-sm font-extrabold uppercase" style={{ fontFamily: DISPLAY, color: INK }}>
            {cert.name}
          </div>
          <span aria-hidden className="mt-2 h-[3px] w-8 rounded-full" style={{ background: accent }} />
        </div>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-500 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div
            className="border-t-[3px] p-3 text-center"
            style={{ borderColor: INK, background: accent, color: CREAM }}
          >
            <p className="text-[11px] leading-[1.4]">{cert.description}</p>
            <a
              href="#informacion"
              className="mt-2 inline-block rounded-full border-2 px-4 py-1.5 text-[10px] font-extrabold tracking-[0.04em] uppercase transition-opacity duration-300"
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
