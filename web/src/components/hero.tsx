import { CountUp } from "./count-up";
import { GreetingBadge } from "./greeting-badge";
import { Parallax } from "./parallax";
import type { Stats } from "@/lib/types";

function PalmSilhouette({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 220"
      className={`h-120 w-auto xl:h-150 ${flip ? "scale-x-[-1]" : ""}`}
      style={{ color: "var(--color-navy)" }}
    >
      <path d="M56 220V110" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
      <g fill="currentColor" opacity="0.5">
        <path d="M56 108C40 90 20 84 4 90c14 10 30 14 44 20 -20-2-38 4-50 16 18 2 38-2 54-10" />
        <path d="M56 108C64 84 84 70 106 68c-8 16-20 26-32 36 18-6 36-4 50 6-16 8-36 10-54 4" />
        <path d="M56 108C48 82 54 58 70 42c2 18-2 34-10 48 14-12 32-16 50-12-10 14-26 22-44 22" />
        <path d="M56 108C52 82 38 62 18 52c6 18 16 32 30 42-16-6-32-4-44 6 12 10 28 14 44 10" />
      </g>
    </svg>
  );
}

export function Hero({ stats }: { stats: Stats }) {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-175"
        style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #E7E8E8 55%, #C7D6E4 100%)" }}
      />
      <div
        className="animate-drift pointer-events-none absolute left-1/2 -z-10 h-115 w-115 -translate-x-1/2"
        style={{ top: 210 }}
      >
        <Parallax speed={0.15} mouseDepth={26} className="h-full w-full">
          <div
            aria-hidden
            className="deco-sunburst h-full w-full opacity-40"
            style={{ ["--ray-a" as string]: "var(--color-burgundy)", ["--ray-b" as string]: "transparent" }}
          />
        </Parallax>
      </div>
      <div className="animate-sway pointer-events-none absolute -bottom-6 left-4 -z-10 opacity-60 max-lg:hidden">
        <Parallax speed={-0.1} mouseDepth={-14}>
          <PalmSilhouette />
        </Parallax>
      </div>
      <div className="animate-sway-reverse pointer-events-none absolute -right-2 -bottom-6 -z-10 opacity-60 max-lg:hidden">
        <Parallax speed={-0.1} mouseDepth={-14}>
          <PalmSilhouette flip />
        </Parallax>
      </div>

      <div className="relative z-10 mx-auto max-w-220 px-14 pt-16 pb-10 text-center max-md:px-6 max-md:pt-6 lg:max-w-320">
        <div className="mx-auto max-w-170 rounded-t-[110px] rounded-b-3xl border-2 border-burgundy/50 bg-cream/95 px-12 py-14 shadow-[0_40px_80px_rgba(3,62,140,0.28)] backdrop-blur-sm max-md:rounded-t-[36px] max-md:px-6 max-md:py-10 lg:max-w-none lg:w-full">
          <GreetingBadge>Saludos desde KUN University · Florida</GreetingBadge>

          <h1 className="font-display mb-5.5 text-[46px] leading-[1.2] font-normal max-md:text-[30px]">
            La universidad que se{" "}
            <span className="bg-linear-to-r from-cyan to-burgundy bg-clip-text text-transparent">
              rediseñó alrededor de la IA
            </span>
            , no al revés.
          </h1>
          <p className="mx-auto mb-8 max-w-120 text-[16px] leading-[1.65] text-muted-ink">
            KUN University AI forma profesionales en Salud, Tecnología, Negocios y Medios
            Digitales con un currículo que se actualiza a la velocidad de la ciencia, no de los
            semestres.
          </p>

          <div className="flex flex-wrap justify-center gap-3.5">
            <a
              href="#programas"
              className="rounded-full bg-navy px-7 py-4 text-[15px] font-bold text-cream shadow-[0_14px_28px_rgba(3,62,140,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(3,62,140,0.55)]"
            >
              Explora los programas
            </a>
            <a
              href="#continua"
              className="rounded-full border-[1.5px] border-hairline px-7 py-4 text-[15px] font-bold transition hover:border-teal/40 hover:bg-surface-alt"
            >
              Certifícate gratis en 40h
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-6 md:justify-between md:gap-4">
          <StampStat label="Escuelas" value={stats.schools} />
          <StampStat label="Programas" value={stats.programs} />
          <StampStat label="Certif. IA" value={stats.certifications} />
          <StampStat label="Online/Global" value={stats.online} suffix="%" />
        </div>
      </div>
    </div>
  );
}

function StampStat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div
      className="group relative flex h-30 w-30 flex-col items-center justify-center rounded-full border-2 border-navy/70 bg-cream text-center transition duration-200 hover:-translate-y-1 hover:border-burgundy md:h-42 md:w-42"
      style={{ boxShadow: "0 16px 32px rgba(3,62,140,0.22)" }}
    >
      <div
        aria-hidden
        className="animate-spin-slow pointer-events-none absolute inset-3 rounded-full border border-dashed"
        style={{ borderColor: "var(--color-burgundy)" }}
      />
      <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full md:h-34 md:w-34">
        <div className="font-display text-2xl font-normal text-teal">
          <CountUp value={value} suffix={suffix} />
        </div>
        <div className="small-caps mt-0.5 text-[9px] font-bold text-muted-brown md:text-[11px]">{label}</div>
      </div>
    </div>
  );
}
