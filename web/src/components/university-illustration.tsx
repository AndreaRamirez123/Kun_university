export function UniversityIllustration() {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-50 items-center justify-center">
      <div
        aria-hidden
        className="deco-sunburst absolute h-40 w-40 opacity-[0.3]"
        style={{ ["--ray-a" as string]: "#0092B6", ["--ray-b" as string]: "transparent" }}
      />
      <svg viewBox="0 0 260 220" className="relative h-36 w-36" aria-hidden>
        {/* stepped Art Deco tower */}
        <rect x="42" y="148" width="176" height="48" fill="#033E8C" />
        <rect x="60" y="110" width="140" height="40" fill="#033E8C" />
        <rect x="80" y="76" width="100" height="36" fill="#033E8C" />
        <rect x="98" y="48" width="64" height="30" fill="#033E8C" />
        <rect x="112" y="22" width="36" height="28" fill="#033E8C" />

        {/* window texture per tier */}
        <g stroke="#FFFFFF" strokeWidth="2.5" opacity="0.35" strokeLinecap="round">
          <line x1="62" y1="158" x2="62" y2="188" />
          <line x1="82" y1="158" x2="82" y2="188" />
          <line x1="178" y1="158" x2="178" y2="188" />
          <line x1="198" y1="158" x2="198" y2="188" />
          <line x1="78" y1="120" x2="78" y2="144" />
          <line x1="182" y1="120" x2="182" y2="144" />
          <line x1="96" y1="86" x2="96" y2="106" />
          <line x1="164" y1="86" x2="164" y2="106" />
        </g>

        {/* arched doorway */}
        <path d="M113 196 v-22 a17 17 0 0 1 34 0 v22 z" fill="#0092B6" />

        {/* graduation cap */}
        <g transform="translate(130,12)">
          <polygon points="0,-12 32,6 0,18 -32,6" fill="#0092B6" />
          <rect x="-18" y="6" width="36" height="7" rx="2" fill="#033E8C" />
          <circle cx="0" cy="-12" r="3" fill="#FFFFFF" />
          <line x1="24" y1="2" x2="28" y2="22" stroke="#033E8C" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
