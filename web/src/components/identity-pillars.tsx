import { Parallax } from "./parallax";
import { PillarRow } from "./pillar-row";
import { Reveal } from "./reveal";

const PILLARS = [
  {
    slug: "frontera",
    title: "Conocimiento de frontera, fácil de usar",
    body: "Hacemos que el conocimiento más avanzado del mundo sea fácil de entender y de aplicar — sin importar de dónde vengas.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <path d="M12 12l4-5" />
      </svg>
    ),
  },
  {
    slug: "curriculo-vivo",
    title: "Un currículo vivo, no un plan fijo",
    body: "Programas diseñados y actualizados con IA, validados por criterio experto humano. Cuando cambia la industria, el curso cambia con ella.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21V9" />
        <path d="M12 13c0-4 3-5 6-5-.5 3-2 5-6 5z" />
        <path d="M12 17c0-3-2.5-4-5-4 .5 2.5 2 4 5 4z" />
      </svg>
    ),
  },
  {
    slug: "comunidad",
    title: "Comunidad antes que matrícula",
    body: "Certifícate en competencias reales desde el primer día, con o sin título. El valor se demuestra antes de pedirte que te matricules.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5V6a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0 0 4h13" />
      </svg>
    ),
  },
];

const ACCENTS = ["#0092B6", "#D4AF37", "#A9BFD1"];

export function IdentityPillars() {
  return (
    <div className="relative z-10 overflow-hidden bg-surface-alt py-22">
      <div className="animate-roam pointer-events-none absolute top-40 right-0 h-96 w-96 translate-x-1/3">
        <Parallax speed={0.12} mouseDepth={20} className="h-full w-full">
          <div
            aria-hidden
            className="deco-sunburst h-full w-full opacity-[0.08]"
            style={{ ["--ray-a" as string]: "var(--color-navy)", ["--ray-b" as string]: "transparent" }}
          />
        </Parallax>
      </div>
      <div className="relative mx-auto max-w-220 px-14 max-md:px-6">
        <div className="mb-12 text-center">
          <div className="small-caps mb-3.5 text-xs font-bold text-teal">Identidad estratégica</div>
          <h2 className="font-display mx-auto max-w-[620px] text-4xl font-normal">
            No enseñamos lo que se enseñaba hace cinco años
          </h2>
        </div>

        <div className="overflow-hidden rounded-t-[56px] rounded-b-2xl border-2 border-burgundy/50 bg-navy text-cream shadow-[0_30px_60px_rgba(3,62,140,0.32)] max-md:rounded-t-[28px]">
          {PILLARS.map((p, i) => (
            <Reveal key={p.slug} delay={i * 120} variant={i % 2 === 0 ? "left" : "right"}>
              <PillarRow
                title={p.title}
                body={p.body}
                icon={p.icon}
                accent={ACCENTS[i]}
                bordered={i > 0}
                delay={i * 0.3}
              />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full bg-navy px-7 py-4 text-[15px] font-bold text-cream shadow-[0_14px_28px_rgba(3,62,140,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(3,62,140,0.55)]"
          >
            Agenda una asesoría gratuita
          </a>
        </div>
      </div>
    </div>
  );
}
