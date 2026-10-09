 "use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { Certification } from "@/lib/types";

const RED = "#BF0404";
const NAVY = "#003D54";
const INK = "#10101A";
const CREAM = "#FFF9EC";
const DISPLAY = "var(--font-archivo-black), sans-serif";

const COPY = {
  es: {
    enroll: "Inscríbete →",
    viewMore: "Ver más",
  },
  en: {
    enroll: "Enroll →",
    viewMore: "View more",
  },
};

export function CertificationFlipGrid({ certifications }: { certifications: Certification[] }) {
  return (
    <div
      className="grid grid-cols-2 justify-items-center gap-8 [--card-h:195px] [--card-w:130px] max-md:gap-3 md:grid-cols-3 md:[--card-h:260px] md:[--card-w:220px]"
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

function BriefcaseWatermark({ accent, className = "" }: { accent: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 160" className={`pointer-events-none ${className}`} style={{ color: accent }}>
      <rect x="20" y="60" width="160" height="90" rx="10" fill="currentColor" />
      <rect x="75" y="32" width="50" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="8" />
      <rect x="10" y="95" width="180" height="18" fill="#FFF9EC" opacity="0.7" />
      <rect x="90" y="88" width="20" height="20" rx="4" fill="#FFF9EC" />
    </svg>
  );
}

function ChartWatermark({ accent, className = "" }: { accent: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 160" className={`pointer-events-none ${className}`} style={{ color: accent }}>
      <rect x="30" y="95" width="24" height="55" fill="currentColor" />
      <rect x="68" y="70" width="24" height="80" fill="currentColor" />
      <rect x="106" y="45" width="24" height="105" fill="currentColor" />
      <rect x="144" y="20" width="24" height="130" fill="currentColor" />
      <polyline points="25,100 80,55 120,70 175,15" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="175,15 150,22 170,38" fill="currentColor" />
    </svg>
  );
}

function ChipWatermark({ accent, className = "" }: { accent: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 160" className={`pointer-events-none ${className}`} style={{ color: accent }}>
      <rect x="55" y="35" width="90" height="90" rx="10" fill="currentColor" />
      <rect x="80" y="60" width="40" height="40" fill="#FFF9EC" />
      <g stroke="currentColor" strokeWidth="8" strokeLinecap="round">
        <line x1="75" y1="15" x2="75" y2="35" />
        <line x1="100" y1="15" x2="100" y2="35" />
        <line x1="125" y1="15" x2="125" y2="35" />
        <line x1="75" y1="125" x2="75" y2="145" />
        <line x1="100" y1="125" x2="100" y2="145" />
        <line x1="125" y1="125" x2="125" y2="145" />
        <line x1="35" y1="60" x2="55" y2="60" />
        <line x1="35" y1="80" x2="55" y2="80" />
        <line x1="35" y1="100" x2="55" y2="100" />
        <line x1="145" y1="60" x2="165" y2="60" />
        <line x1="145" y1="80" x2="165" y2="80" />
        <line x1="145" y1="100" x2="165" y2="100" />
      </g>
    </svg>
  );
}

function ShieldWatermark({ accent, className = "" }: { accent: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 160" className={`pointer-events-none ${className}`} style={{ color: accent }}>
      <path d="M100 10 L165 32 V85 C165 120 138 142 100 150 C62 142 35 120 35 85 V32 Z" fill="currentColor" />
      <path
        d="M100 60 a16 16 0 0 0 -16 16 v8 h32 v-8 a16 16 0 0 0 -16 -16z M86 84 h28 v30 h-28z"
        fill="#FFF9EC"
      />
    </svg>
  );
}

function BrainWatermark({ accent, className = "" }: { accent: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 160" className={`pointer-events-none ${className}`} style={{ color: accent }}>
      <path
        d="M70 20 C45 20 30 40 32 62 C18 70 16 95 30 108 C28 128 46 145 68 142 C78 150 98 150 108 142 C130 145 148 128 146 108 C160 95 158 70 144 62 C146 40 131 20 106 20 C96 20 90 26 88 30 C84 24 78 20 70 20Z"
        fill="currentColor"
      />
      <g stroke="#FFF9EC" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M70 34 C56 40 50 55 58 68 C48 74 48 92 60 98" />
        <path d="M100 30 V130" />
        <path d="M118 44 C130 50 134 64 126 74 C136 82 134 98 122 104" />
      </g>
    </svg>
  );
}

function PulseBrainWatermark({ accent, className = "" }: { accent: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 160" className={`pointer-events-none ${className}`} style={{ color: accent }}>
      <path
        d="M70 20 C45 20 30 40 32 62 C18 70 16 95 30 108 C28 128 46 145 68 142 C78 150 98 150 108 142 C130 145 148 128 146 108 C160 95 158 70 144 62 C146 40 131 20 106 20 C96 20 90 26 88 30 C84 24 78 20 70 20Z"
        fill="currentColor"
      />
      <polyline
        points="24,92 60,92 70,70 85,112 98,80 108,92 176,92"
        fill="none"
        stroke="#FFF9EC"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const WATERMARKS: Record<string, typeof CampusWatermark> = {
  "ai-business-architect": BriefcaseWatermark,
  "venture-finance-pro": ChartWatermark,
  "applied-ai-systems": ChipWatermark,
  "cyber-cloud-defense": ShieldWatermark,
  "executive-brain-architecture": BrainWatermark,
  "cognitive-resilience-management": PulseBrainWatermark,
};

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
  const t = usePick(COPY);
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function scheduleOpen(next: boolean) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(next), 150);
  }

  return (
    <div
      className="relative"
      style={{
        width: "var(--card-w)",
        height: "var(--card-h)",
        zIndex: open ? 20 : 1,
      }}
      onMouseEnter={() => scheduleOpen(true)}
      onMouseLeave={() => scheduleOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      <div
        className="absolute top-0 right-0 transition-[width] duration-1000 ease-[cubic-bezier(0.4,0.1,0.2,1)]"
        style={{
          height: "var(--card-h)",
          width: open ? "calc(var(--card-w) * 2)" : "var(--card-w)",
        }}
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
          {cert.description[locale]}
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
          <span className="relative transition-colors duration-300 group-hover:text-white">{t.enroll}</span>
        </a>
      </div>

      {/* flip cover: swings open on a left hinge, revealing the inside page */}
      <div
        className="absolute top-0 right-0"
        style={{ width: "var(--card-w)", height: "var(--card-h)", perspective: "2000px" }}
      >
        <div
          className="relative h-full w-full transition-transform duration-1000 ease-[cubic-bezier(0.4,0.1,0.2,1)]"
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
              {t.viewMore}
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
            {(() => {
              const Watermark = WATERMARKS[cert.slug] ?? CampusWatermark;
              return <Watermark accent={accent} className="h-16 w-16 opacity-30 md:h-28 md:w-28" />;
            })()}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
