import { AccordionShowcase, type AccordionItem } from "./accordion-showcase";
import type { Certification } from "@/lib/types";

const ACCENTS = ["#0092B6", "#033E8C"];
// A single left-to-right pattern can't checkerboard both a 2-column (mobile)
// and a 3-column (desktop) grid at once — the two layouts need different
// sequences, so we build one of each and only show the one that applies.
const MOBILE_PATTERN = [0, 1, 1, 0, 0, 1];
const DESKTOP_PATTERN = [0, 1, 0, 1, 0, 1];

function buildItems(certifications: Certification[], pattern: number[]): AccordionItem[] {
  return certifications.map((cert, i) => ({
    id: cert.slug,
    eyebrow: `${cert.hours} horas · 100% online`,
    title: cert.name,
    description: cert.description,
    accent: ACCENTS[pattern[i % pattern.length]],
  }));
}

export function CertificationsCarousel({ certifications }: { certifications: Certification[] }) {
  const mobileItems = buildItems(certifications, MOBILE_PATTERN);
  const desktopItems = buildItems(certifications, DESKTOP_PATTERN);

  return (
    <div id="continua" className="relative z-10 bg-navy py-22 text-cream">
      <div className="mx-auto max-w-[1100px] px-14 max-md:px-6">
        <div className="mb-12 text-center">
          <div className="small-caps mb-3.5 text-xs font-bold tracking-[0.14em] text-cyan">
            Educación continua
          </div>
          <h2 className="font-display mb-3.5 text-4xl font-normal">
            No tienes que esperar a graduarte
          </h2>
          <p className="mx-auto max-w-[480px] text-sm text-navy-muted">
            Seis certificaciones de 36 a 40 horas, diseñadas para aplicar lo aprendido desde la
            primera semana.
          </p>
        </div>

        <div className="md:hidden">
          <AccordionShowcase
            items={mobileItems}
            autoRotateMs={3800}
            theme={{
              fontDisplay: "var(--font-limelight), serif",
              ink: "var(--color-cream)",
              mutedText: "var(--color-navy-muted)",
              border: "rgba(255,255,255,0.15)",
              shape: "rounded-t-[64px] rounded-b-2xl",
            }}
          />
        </div>
        <div className="hidden md:block">
          <AccordionShowcase
            items={desktopItems}
            autoRotateMs={3800}
            theme={{
              fontDisplay: "var(--font-limelight), serif",
              ink: "var(--color-cream)",
              mutedText: "var(--color-navy-muted)",
              border: "rgba(255,255,255,0.15)",
              shape: "rounded-t-[64px] rounded-b-2xl",
            }}
          />
        </div>

        <div className="mt-10 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full bg-burgundy px-7 py-4 text-[15px] font-bold text-cream shadow-[0_14px_28px_rgba(0,146,182,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,146,182,0.55)]"
          >
            Inscríbete a una certificación
          </a>
        </div>
      </div>
    </div>
  );
}
