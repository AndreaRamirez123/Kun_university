import Image from "next/image";

const SCHOOLS = [
  "Ingeniería",
  "Transformación de Negocios",
  "Bienestar y Desarrollo Humano",
  "Diseño y Tecnologías de Comunicación",
];

const INSTITUTION_LINKS = [
  { label: "Sobre KUN", href: "#" },
  { label: "Licenciamiento y acreditación", href: "#registro" },
  { label: "Contacto", href: "#" },
];

const SOCIAL_LINKS = ["YouTube", "LinkedIn", "Instagram", "X (Twitter)"];

export function SiteFooter() {
  return (
    <div className="relative z-10 bg-navy pt-18 text-cream">
      <div className="mx-auto max-w-[1140px] px-14 max-md:px-6">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 border-b border-cream/15 pb-14 max-md:grid-cols-1 max-md:gap-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Image src="/kun-logo-full.png" alt="KUN University AI" width={86} height={90} className="h-22.5 w-auto" />
            </div>
            <p className="max-w-65 text-[13px] leading-[1.6] text-navy-muted">
              La universidad IA-Native. Rediseñada alrededor de la inteligencia artificial, no al
              revés.
            </p>
          </div>

          <FooterColumn title="Escuelas">
            {SCHOOLS.map((s) => (
              <a key={s} href="#programas" className="text-cream no-underline">
                {s}
              </a>
            ))}
          </FooterColumn>

          <FooterColumn title="Institución">
            {INSTITUTION_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="text-cream no-underline">
                {l.label}
              </a>
            ))}
          </FooterColumn>

          <FooterColumn title="Síguenos">
            {SOCIAL_LINKS.map((s) => (
              <a key={s} href="#" className="text-cream no-underline">
                {s}
              </a>
            ))}
          </FooterColumn>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 py-6">
          <div className="small-caps text-xs text-navy-muted">
            © 2026 KUN University AI
          </div>
          <a href="#" className="text-xs text-cyan no-underline">
            Documento base de marca disponible para inversionistas →
          </a>
        </div>
      </div>
    </div>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="small-caps mb-4.5 text-[11px] font-bold tracking-[0.1em] text-navy-muted">
        {title}
      </div>
      <div className="flex flex-col gap-3 text-[13px]">{children}</div>
    </div>
  );
}
