"use client";

import Image from "next/image";
import { usePick } from "@/i18n/locale-context";

const SOCIAL_ICONS = [
  <svg key="YouTube" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="4" />
    <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
  </svg>,
  <svg key="LinkedIn" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <line x1="8" y1="10" x2="8" y2="17" />
    <circle cx="8" cy="6.5" r="0.5" fill="currentColor" />
    <path d="M12 17v-4.5c0-1.5 1-2.5 2.3-2.5s2.2 1 2.2 2.5V17" />
  </svg>,
  <svg key="Instagram" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>,
  <svg key="X" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>,
];

const COPY = {
  es: {
    tagline: "La universidad IA-Native. Rediseñada alrededor de la inteligencia artificial, no al revés.",
    schoolsTitle: "Escuelas",
    schools: ["Ingeniería", "Transformación de Negocios", "Bienestar y Desarrollo Humano", "Diseño y Tecnologías de Comunicación"],
    institutionTitle: "Institución",
    institutionLinks: [
      { label: "Sobre KUN", href: "#" },
      { label: "Licenciamiento y acreditación", href: "#registro" },
      { label: "Contacto", href: "#" },
    ],
    followTitle: "Síguenos",
    socialLabels: ["YouTube", "LinkedIn", "Instagram", "X (Twitter)"],
    copyright: "© 2026 KUN University AI",
  },
  en: {
    tagline: "The AI-Native university. Redesigned around artificial intelligence, not the other way around.",
    schoolsTitle: "Schools",
    schools: ["Engineering", "Business Transformation", "Wellness and Human Development", "Design and Communication Technologies"],
    institutionTitle: "Institution",
    institutionLinks: [
      { label: "About KUN", href: "#" },
      { label: "Licensing and accreditation", href: "#registro" },
      { label: "Contact", href: "#" },
    ],
    followTitle: "Follow us",
    socialLabels: ["YouTube", "LinkedIn", "Instagram", "X (Twitter)"],
    copyright: "© 2026 KUN University AI",
  },
};

export function SiteFooter() {
  const t = usePick(COPY);
  return (
    <div className="relative z-10 overflow-hidden bg-navy pt-18 text-cream max-md:pt-10">
      <div
        aria-hidden
        className="deco-sunburst pointer-events-none absolute -top-24 -right-24 h-72 w-72 opacity-[0.06]"
        style={{ ["--ray-a" as string]: "#FFFFFF", ["--ray-b" as string]: "transparent" }}
      />

      <div className="relative mx-auto max-w-[1140px] px-14 max-md:px-6">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 border-b border-cream/15 pb-14 max-md:grid-cols-2 max-md:gap-x-6 max-md:gap-y-6 max-md:pb-8">
          <div className="max-md:col-span-2">
            <div className="mb-4 flex items-center gap-3 max-md:mb-2.5">
              <div className="inline-block rounded-2xl bg-cream p-3">
                <Image src="/kun-logo-full.png" alt="KUN University AI" width={86} height={90} className="h-18 w-auto max-md:h-12" />
              </div>
            </div>
            <p className="max-w-65 text-[13px] leading-[1.6] text-navy-muted">{t.tagline}</p>
          </div>

          <FooterColumn title={t.schoolsTitle}>
            {t.schools.map((s) => (
              <a key={s} href="#programas" className="text-cream no-underline transition-colors hover:text-cyan">
                {s}
              </a>
            ))}
          </FooterColumn>

          <FooterColumn title={t.institutionTitle}>
            {t.institutionLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-cream no-underline transition-colors hover:text-cyan">
                {l.label}
              </a>
            ))}
          </FooterColumn>

          <FooterColumn title={t.followTitle}>
            {t.socialLabels.map((label, i) => (
              <a key={label} href="#" className="flex items-center gap-2 text-cream no-underline transition-colors hover:text-cyan">
                {SOCIAL_ICONS[i]}
                {label}
              </a>
            ))}
          </FooterColumn>
        </div>

        <div className="py-6 text-center">
          <div className="small-caps text-xs text-navy-muted">{t.copyright}</div>
        </div>
      </div>
    </div>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="small-caps mb-4.5 text-[11px] font-bold tracking-[0.1em] text-navy-muted max-md:mb-2.5">
        {title}
      </div>
      <div className="flex flex-col gap-3 text-[13px] max-md:gap-2">{children}</div>
    </div>
  );
}
