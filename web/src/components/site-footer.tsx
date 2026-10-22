"use client";

import { ADMISSIONS_EMAIL, SOCIAL_LINKS, socialHref } from "@/lib/contact";
import { SocialIcon } from "./social-icons";
import Image from "next/image";
import { usePick } from "@/i18n/locale-context";

const COPY = {
  es: {
    tagline: "La universidad IA-Native que puso la inteligencia artificial en el centro de su evolución.",
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
    tagline: "The AI-Native university that put artificial intelligence at the center of its evolution.",
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
              <a key={label} href={socialHref(SOCIAL_LINKS[i]?.href ?? "")} className="flex items-center gap-2 text-cream no-underline transition-colors hover:text-cyan">
                {SOCIAL_LINKS[i] && <SocialIcon network={SOCIAL_LINKS[i].network} />}
                {label}
              </a>
            ))}
          </FooterColumn>
        </div>

        <div className="py-6 text-center">
          <a href={`mailto:${ADMISSIONS_EMAIL}`} className="mb-2 inline-block text-sm font-bold text-cream hover:text-cyan">
            {ADMISSIONS_EMAIL}
          </a>
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
