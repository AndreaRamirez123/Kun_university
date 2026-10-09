"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { AccordionShowcase, type AccordionItem } from "@/components/accordion-showcase";
import { CertificationFlipGrid } from "@/components/certification-flip-grid";
import { CollageInfoForm } from "@/components/collage-info-form";
import { FlipText } from "@/components/flip-text";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { ModelSwitcher } from "@/components/model-switcher";
import { LanguageToggle } from "@/components/language-toggle";
import { Reveal } from "@/components/reveal";
import { ScrollToTop } from "@/components/scroll-to-top";
import { TiltCard } from "@/components/tilt-card";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { Certification, School, Stats } from "@/lib/types";

const RED = "#BF0404";
const NAVY = "#003D54";
const TEAL = "#0092B6";
const INK = "#10101A";
const CREAM = "#FFF9EC";

const DISPLAY = "var(--font-archivo-black), sans-serif";

const ICON_PROPS = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const SCHOOL_ICONS: Record<string, ReactNode> = {
  ingenieria: (
    <svg {...ICON_PROPS}>
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path d="M19.4 13a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V19a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  "transformacion-de-negocios": (
    <svg {...ICON_PROPS}>
      <path d="M22 7L13.5 15.5L8.5 10.5L2 17" />
      <path d="M16 7h6v6" />
    </svg>
  ),
  "bienestar-y-desarrollo-humano": (
    <svg {...ICON_PROPS}>
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 000-7.8z" />
    </svg>
  ),
  "diseno-y-tecnologias-de-comunicacion": (
    <svg {...ICON_PROPS}>
      <path d="M3 11l18-5v12L3 13v-2z" />
      <path d="M7 13v5a2 2 0 002 2h1v-6.5" />
    </svg>
  ),
};

const COPY = {
  es: {
    nav: {
      programs: "Programas",
      continuing: "Educación continua",
      community: "Comunidad",
      info: "Información",
      cta: "Certifícate gratis",
    },
    hero: {
      eyebrow: "Educación superior IA-Native · Florida",
      title1: "La universidad que se",
      title2: "Rediseñó alrededor",
      title3: "de la IA",
      flip: "no al revés.",
      body: "KUN University AI forma profesionales en Salud, Tecnología, Negocios y Medios Digitales con un currículo que se actualiza a la velocidad de la ciencia, no de los semestres.",
      ctaPrimary: "Explora los programas →",
      ctaSecondary: "Certifícate gratis en 40 horas",
    },
    ticker: ["IA-NATIVE", "4 ESCUELAS", "11 PROGRAMAS", "100% ONLINE"],
    stats: {
      schools: "Escuelas",
      programs: "Programas",
      certifications: "Certif. IA",
      online: "Online",
    },
    identity: {
      heading: "No enseñamos lo que se enseñaba hace cinco años",
      card1Title: "Conocimiento de frontera, fácil de usar",
      card1Body: "Hacemos que el conocimiento más avanzado del mundo sea fácil de entender y de aplicar — sin importar de dónde vengas.",
      card2Title: "Un currículo vivo, no un plan fijo",
      card2Body: "Programas diseñados y actualizados con IA, validados por criterio experto humano. Cuando cambia la industria, el curso cambia con ella.",
      card3Title: "Comunidad antes que matrícula",
      card3Body: "Certifícate en competencias reales desde el primer día, con o sin título. El valor se demuestra antes de pedirte que te matricules.",
      cta: "Agenda una asesoría gratuita",
    },
    gallery: {
      heading: "La vida en KUN",
      campus: "Campus",
      students: "Estudiantes",
      community: "Comunidad",
      faculty: "Equipo docente",
    },
    schools: {
      heading1: "Cuatro escuelas.",
      heading2: "Un mismo motor IA-Native.",
      cta: "Quiero información de mi escuela",
    },
    curriculum: {
      heading: "Así se construye un curso en KUN",
      step1Title: "LA IA RASTREA LA FRONTERA",
      step1Body: "Nuestros agentes de IA monitorean lo último que publica la ciencia, la industria y la regulación en cada campo que enseñamos.",
      step2Title: "EL CRITERIO HUMANO DECIDE",
      step2Body: "Nuestro equipo académico experto revisa, valida y da forma al contenido. La IA propone, las personas deciden.",
      step3Title: "APRENDES LO QUE EL MERCADO NECESITA HOY",
      step3Body: "No lo que se enseñaba hace cinco años. Aprendes las competencias que las empresas buscan hoy.",
      cta: "Habla con admisiones",
    },
    continuing: {
      heading: "No tienes que esperar a graduarte",
      body: "Seis certificaciones de 36 a 40 horas, diseñadas para aplicar lo aprendido desde la primera semana.",
      cta: "Inscríbete a una certificación",
    },
    info: {
      badge: "Sin compromiso",
      heading: "¿Quieres que te contemos más?",
    },
    ctaBlock: {
      heading: "Antes de matricularte, síguenos",
      body: "El valor se demuestra antes de pedirte que pagues por él. Clases abiertas y conversaciones con expertos, sin matrícula.",
      cta: "Únete a la comunidad",
    },
    accreditation: {
      commissionDesc: "Comisión de Educación Independiente",
      sacscocLabel: "SACSCOC · EN PROCESO",
      sacscocDesc: "Acreditación institucional en avance",
    },
    footer: {
      copyright: "© 2026 KUN University AI",
    },
  },
  en: {
    nav: {
      programs: "Programs",
      continuing: "Continuing Education",
      community: "Community",
      info: "Info",
      cta: "Get certified free",
    },
    hero: {
      eyebrow: "AI-Native higher education · Florida",
      title1: "The university that",
      title2: "Redesigned itself",
      title3: "around AI",
      flip: "not the other way around.",
      body: "KUN University AI trains professionals in Health, Technology, Business and Digital Media with a curriculum that updates at the speed of science, not of semesters.",
      ctaPrimary: "Explore the programs →",
      ctaSecondary: "Get certified free in 40 hours",
    },
    ticker: ["AI-NATIVE", "4 SCHOOLS", "11 PROGRAMS", "100% ONLINE"],
    stats: {
      schools: "Schools",
      programs: "Programs",
      certifications: "AI Certs.",
      online: "Online",
    },
    identity: {
      heading: "We don't teach what was taught five years ago",
      card1Title: "Frontier knowledge, made easy to use",
      card1Body: "We make the world's most advanced knowledge easy to understand and apply — no matter where you're coming from.",
      card2Title: "A living curriculum, not a fixed plan",
      card2Body: "Programs designed and updated with AI, validated by expert human judgment. When the industry changes, the course changes with it.",
      card3Title: "Community before enrollment",
      card3Body: "Get certified in real-world skills from day one, with or without a degree. The value proves itself before we ask you to enroll.",
      cta: "Schedule a free consultation",
    },
    gallery: {
      heading: "Life at KUN",
      campus: "Campus",
      students: "Students",
      community: "Community",
      faculty: "Faculty",
    },
    schools: {
      heading1: "Four schools.",
      heading2: "One AI-Native engine.",
      cta: "I want information about my school",
    },
    curriculum: {
      heading: "This is how a course gets built at KUN",
      step1Title: "AI TRACKS THE FRONTIER",
      step1Body: "Our AI agents monitor the latest published science, industry developments, and regulation in every field we teach.",
      step2Title: "HUMAN JUDGMENT DECIDES",
      step2Body: "Our expert academic team reviews, validates, and shapes the content. AI proposes, people decide.",
      step3Title: "YOU LEARN WHAT THE MARKET NEEDS TODAY",
      step3Body: "Not what was taught five years ago. You learn the skills companies are looking for today.",
      cta: "Talk to admissions",
    },
    continuing: {
      heading: "You don't have to wait until graduation",
      body: "Six certifications of 36 to 40 hours, designed to apply what you learn from the very first week.",
      cta: "Enroll in a certification",
    },
    info: {
      badge: "No commitment",
      heading: "Want us to tell you more?",
    },
    ctaBlock: {
      heading: "Before you enroll, follow us",
      body: "The value proves itself before we ask you to pay for it. Open classes and conversations with experts, no enrollment required.",
      cta: "Join the community",
    },
    accreditation: {
      commissionDesc: "Commission for Independent Education",
      sacscocLabel: "SACSCOC · IN PROGRESS",
      sacscocDesc: "Institutional accreditation underway",
    },
    footer: {
      copyright: "© 2026 KUN University AI",
    },
  },
};

export function Estilo3Content({
  schools,
  certifications,
  stats,
}: {
  schools: School[];
  certifications: Certification[];
  stats: Stats;
}) {
  const t = usePick(COPY);
  const { locale } = useLocale();

  return (
    <div className="relative max-md:pb-16">
      {/* NAV */}
      <div className="flex items-center justify-between border-b-4 border-[#10101A] px-14 py-5.5 max-md:px-6">
        <div className="flex items-center gap-3">
          <Image src="/kun-logo-model3.png" alt="KUN University AI" width={253} height={68} priority className="h-17 w-auto" />
        </div>
        <div className="flex items-center gap-7.5 max-md:hidden">
          <a href="#programas" className="text-sm font-bold hover:text-[#BF0404]">
            {t.nav.programs}
          </a>
          <a href="#continua" className="text-sm font-bold hover:text-[#BF0404]">
            {t.nav.continuing}
          </a>
          <a href="#comunidad" className="text-sm font-bold hover:text-[#BF0404]">
            {t.nav.community}
          </a>
          <a href="#informacion" className="text-sm font-bold hover:text-[#BF0404]">
            {t.nav.info}
          </a>
          <a
            href="#registro"
            className="rounded-full border-[3px] border-[#10101A] px-5 py-2.75 text-sm font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
            style={{ background: RED, boxShadow: "4px 4px 0 #10101A" }}
          >
            {t.nav.cta}
          </a>
        </div>
      </div>

      {/* HERO */}
      <div className="relative mx-auto max-w-300 px-14 pt-19 pb-10 max-md:px-6">
        <div
          aria-hidden
          className="cm-halftone pointer-events-none absolute top-4 left-4 -z-10 h-40 w-40 max-md:hidden"
          style={{ color: TEAL, opacity: 0.5 }}
        />

        <div
          className="absolute top-10 right-20 z-10 flex h-33 w-33 items-center justify-center rounded-full border-4 border-[#10101A] text-center max-md:hidden"
          style={{ background: NAVY, transform: "rotate(12deg)", boxShadow: "6px 6px 0 #10101A" }}
        >
          <div className="text-[13px] leading-tight font-extrabold uppercase" style={{ fontFamily: DISPLAY, color: CREAM }}>
            100%
            <br />
            ONLINE
          </div>
          <div
            className="cm-tape"
            style={{ top: -14, right: -22, transform: "rotate(38deg)", background: `repeating-linear-gradient(-45deg, ${RED} 0 6px, rgba(191,4,4,0.6) 6px 12px)`, height: 26, width: 70 }}
          />
        </div>

        <Reveal className="relative mb-7 inline-block">
          <div
            className="px-4 py-1.75 text-[13px] font-extrabold tracking-[0.06em] uppercase"
            style={{ background: "#10101A", color: CREAM, transform: "rotate(-2deg)", boxShadow: "5px 5px 0 rgba(16,16,26,0.4)" }}
          >
            {t.hero.eyebrow}
          </div>
        </Reveal>

        <Reveal delay={80} variant="left" className="mb-2">
          <h1
            className="text-[64px] leading-[1.05] font-extrabold uppercase max-md:text-[32px]"
            style={{ fontFamily: DISPLAY }}
          >
            {t.hero.title1}
          </h1>
        </Reveal>
        <Reveal delay={200} variant="left" className="mb-2">
          <h1
            className="text-[64px] leading-[1.05] font-extrabold uppercase max-md:text-[32px]"
            style={{ fontFamily: DISPLAY, color: RED, WebkitTextStroke: "3px #10101A" }}
          >
            {t.hero.title2}
          </h1>
        </Reveal>
        <div className="mb-9 flex flex-wrap items-center justify-start gap-5">
          <Reveal delay={320} variant="left">
            <h1
              className="text-[64px] leading-[1.05] font-extrabold uppercase max-md:text-[32px]"
              style={{ fontFamily: DISPLAY }}
            >
              <span className="relative inline-block" style={{ color: RED, WebkitTextStroke: "3px #10101A" }}>
                {t.hero.title3}
                <svg
                  aria-hidden
                  className="pointer-events-none absolute -bottom-3 left-0 w-full max-md:-bottom-1.5"
                  height="14"
                  viewBox="0 0 200 14"
                  preserveAspectRatio="none"
                >
                  <path d="M2 8c30-8 60-8 90 0s90 8 106-2" fill="none" stroke={TEAL} strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
          </Reveal>
          <Reveal delay={440} variant="flip">
            <div
              className="px-5 py-2.5 text-[22px] font-extrabold tracking-[0.04em] uppercase max-md:px-2.5 max-md:py-1.5 max-md:text-[10px]"
              style={{ fontFamily: DISPLAY, background: "#10101A", color: CREAM, transform: "rotate(-2deg)", boxShadow: "5px 5px 0 rgba(16,16,26,0.4)" }}
            >
              <FlipText>{t.hero.flip}</FlipText>
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-[1.3fr_1fr] items-center gap-10 max-md:grid-cols-1">
          <Reveal delay={160}>
            <p className="max-w-140 text-lg leading-[1.55] font-medium">{t.hero.body}</p>
          </Reveal>
          <Reveal delay={240} className="relative mt-14 flex flex-col gap-3.5 max-md:mt-0">
            <a
              href="#programas"
              className="rounded-full border-[3px] border-[#10101A] px-6.5 py-4 text-center text-[15px] font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
              style={{ background: "#10101A", boxShadow: "5px 5px 0 #BF0404" }}
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#continua"
              className="rounded-full border-[3px] border-[#10101A] px-6.5 py-4 text-center text-[15px] font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
              style={{ background: NAVY, boxShadow: "5px 5px 0 #10101A" }}
            >
              {t.hero.ctaSecondary}
            </a>
          </Reveal>
        </div>
      </div>

      {/* TICKER */}
      <div className="px-[0.5cm] py-6">
        <div className="overflow-hidden bg-[#10101A] py-4 whitespace-nowrap">
          <div className="animate-marquee flex w-max items-center gap-3">
            {[0, 1].map((rep) => (
              <span key={rep} className="flex items-center gap-3">
                {[...t.ticker, ...t.ticker].map((label, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 px-5 py-2 text-xs font-extrabold tracking-[0.04em] uppercase"
                    style={{
                      fontFamily: DISPLAY,
                      background: [RED, NAVY, TEAL][i % 3],
                      borderColor: "rgba(255,249,236,0.25)",
                      color: CREAM,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* STATS BLOCKS */}
      <div className="grid grid-cols-4 gap-4 px-14 py-10 max-md:grid-cols-2 max-md:gap-3 max-md:px-6">
        <Stat
          value={stats.schools}
          label={t.stats.schools}
          gradient={`linear-gradient(135deg, ${RED} 0%, ${INK} 100%)`}
          text={CREAM}
          icon={<CapIcon />}
        />
        <Stat
          value={stats.programs}
          label={t.stats.programs}
          gradient={`linear-gradient(135deg, ${CREAM} 0%, #EADFC4 100%)`}
          text={INK}
          icon={<BookIcon />}
        />
        <Stat
          value={stats.certifications}
          label={t.stats.certifications}
          gradient={`linear-gradient(135deg, ${NAVY} 0%, ${INK} 100%)`}
          text={CREAM}
          icon={<AwardIcon />}
        />
        <Stat
          value={`${stats.online}%`}
          label={t.stats.online}
          gradient={`linear-gradient(135deg, ${CREAM} 0%, #EADFC4 100%)`}
          text={INK}
          icon={<GlobeIcon />}
        />
      </div>

      {/* IDENTIDAD */}
      <div className="mx-auto max-w-300 px-14 py-18 max-md:px-6">
        <Reveal>
          <h2
            className="mb-12 max-w-225 text-[46px] leading-[1.05] font-extrabold uppercase max-md:text-3xl"
            style={{ fontFamily: DISPLAY }}
          >
            {t.identity.heading}
          </h2>
        </Reveal>
        <div className="grid grid-cols-3 gap-14 max-md:grid-cols-1 max-md:gap-10">
          {[
            {
              n: "01",
              title: t.identity.card1Title,
              body: t.identity.card1Body,
              bg: "#10101A",
              text: CREAM,
              numColor: CREAM,
              rotate: -2.5,
              shadow: RED,
              glowFrom: RED,
              glowTo: NAVY,
              lift: "md:mt-6",
            },
            {
              n: "02",
              title: t.identity.card2Title,
              body: t.identity.card2Body,
              bg: RED,
              text: CREAM,
              numColor: CREAM,
              rotate: 3,
              shadow: TEAL,
              glowFrom: TEAL,
              glowTo: RED,
              lift: "md:-mt-3",
              tape: true,
            },
            {
              n: "03",
              title: t.identity.card3Title,
              body: t.identity.card3Body,
              bg: "#10101A",
              text: CREAM,
              numColor: CREAM,
              rotate: -2,
              shadow: TEAL,
              glowFrom: NAVY,
              glowTo: TEAL,
              lift: "md:mt-8",
            },
          ].map((card, i) => (
            <Reveal key={card.n} delay={i * 120} className={card.lift}>
              <div
                className="glow-card relative rounded-3xl"
                style={
                  {
                    "--glow-from": card.glowFrom,
                    "--glow-to": card.glowTo,
                  } as React.CSSProperties
                }
              >
                <TiltCard
                  baseRotate={card.rotate}
                  restShadow={`7px 7px 0 ${card.shadow}`}
                  className="relative rounded-3xl p-7.5 max-md:p-4"
                  style={{ background: card.bg, color: card.text }}
                >
                  {card.tape && (
                    <div
                      className="cm-tape"
                      style={{ top: -16, right: 24, transform: "rotate(6deg)", background: `repeating-linear-gradient(-45deg, ${CREAM} 0 6px, rgba(255,249,236,0.65) 6px 12px)` }}
                    />
                  )}
                  <div className="flip-card-wrap relative flex min-h-56 flex-col items-center justify-center text-center max-md:min-h-40">
                    <div
                      className="flip-card-logo text-6xl font-extrabold max-md:text-4xl"
                      style={{ fontFamily: DISPLAY, color: card.numColor }}
                    >
                      {card.n}
                    </div>
                    <div className="flip-card-text absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-2">
                      <div className="text-lg font-extrabold max-md:text-sm">{card.title}</div>
                      <div className="text-[13px] leading-[1.6] opacity-85 max-md:text-[11px] max-md:leading-[1.45]">{card.body}</div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={360} className="mt-11 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full border-[3px] border-[#10101A] px-6.5 py-4 text-[15px] font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
            style={{ background: RED, boxShadow: "5px 5px 0 #10101A" }}
          >
            {t.identity.cta}
          </a>
        </Reveal>
      </div>

      {/* GALERÍA (marcadores de foto) */}
      <div className="mx-auto max-w-300 px-14 pb-18 max-md:px-6">
        <Reveal className="mb-9 flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-2xl font-extrabold uppercase" style={{ fontFamily: DISPLAY }}>
            {t.gallery.heading}
          </h3>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 max-md:gap-3 md:flex md:flex-wrap md:items-start md:justify-center md:gap-8">
          <Reveal delay={0}>
            <PhotoPlaceholder label={t.gallery.campus} rotate={-4} accent={RED} image="/campus-photos/campus.jpg" />
          </Reveal>
          <Reveal delay={100} className="md:mt-9">
            <PhotoPlaceholder label={t.gallery.students} rotate={3} accent={TEAL} image="/campus-photos/estudiantes.jpg" />
          </Reveal>
          <Reveal delay={200}>
            <PhotoPlaceholder label={t.gallery.community} rotate={-2} accent={RED} image="/campus-photos/comunidad.jpg" />
          </Reveal>
          <Reveal delay={300} className="md:mt-6">
            <PhotoPlaceholder label={t.gallery.faculty} rotate={2.5} accent={TEAL} image="/campus-photos/docentes.jpg" />
          </Reveal>
        </div>
      </div>

      {/* ESCUELAS */}
      <div id="programas" className="relative py-20 text-[#FFF9EC]" style={{ background: NAVY }}>
        <div
          aria-hidden
          className="cm-halftone pointer-events-none absolute -top-10 -right-10 h-64 w-64"
          style={{ color: TEAL, opacity: 0.3 }}
        />
        <div className="relative mx-auto max-w-300 px-14 max-md:px-6">
          <Reveal>
            <h2 className="mb-1 text-[42px] font-extrabold uppercase max-md:text-3xl" style={{ fontFamily: DISPLAY, color: CREAM }}>
              {t.schools.heading1}
            </h2>
            <h2 className="mb-11 text-[42px] font-extrabold uppercase max-md:text-3xl" style={{ fontFamily: DISPLAY }}>
              {t.schools.heading2}
            </h2>
          </Reveal>
          <AccordionShowcase
            variant="accordion"
            items={schools.map(
              (school): AccordionItem => ({
                id: school.slug,
                eyebrow: school.programs.map((p) => p.degree).join(" · "),
                title: school.name[locale].replace(/^(Escuela de |School of )/, ""),
                description: school.tagline[locale],
                accent: RED,
                icon: SCHOOL_ICONS[school.slug],
              }),
            )}
            theme={{
              fontDisplay: DISPLAY,
              ink: CREAM,
              mutedText: "#F0EAD8",
              border: "rgba(255,249,236,0.35)",
              shape: "rounded-2xl",
            }}
          />
          <Reveal className="mt-11 text-center">
            <a
              href="#informacion"
              className="inline-block rounded-full border-[3px] border-[#10101A] px-6.5 py-4 text-[15px] font-extrabold text-[#10101A] transition hover:-translate-y-0.5"
              style={{ background: CREAM, boxShadow: "5px 5px 0 #10101A" }}
            >
              {t.schools.cta}
            </a>
          </Reveal>
        </div>
      </div>

      {/* MOTOR CURRICULAR */}
      <div className="mx-auto max-w-300 px-14 py-20 max-md:px-6">
        <Reveal>
          <h2 className="mb-12 text-[42px] font-extrabold uppercase max-md:text-3xl" style={{ fontFamily: DISPLAY }}>
            {t.curriculum.heading}
          </h2>
        </Reveal>
        <div className="grid grid-cols-3 gap-10 max-md:grid-cols-1 max-md:gap-6">
          {[
            {
              n: "01",
              title: t.curriculum.step1Title,
              body: t.curriculum.step1Body,
              bg: RED,
              numberColor: CREAM,
            },
            {
              n: "02",
              title: t.curriculum.step2Title,
              body: t.curriculum.step2Body,
              bg: NAVY,
              numberColor: CREAM,
            },
            {
              n: "03",
              title: t.curriculum.step3Title,
              body: t.curriculum.step3Body,
              bg: TEAL,
              numberColor: CREAM,
            },
          ].map((step, i) => (
            <Reveal key={step.n} delay={i * 120}>
              <div className="corner-card" style={{ background: step.bg }}>
                <div className="corner-card-number" style={{ fontFamily: DISPLAY, color: step.numberColor }}>
                  {step.n}
                </div>
                <div className="corner-card-text" style={{ color: INK }}>
                  <div className="text-lg font-extrabold uppercase max-md:text-base">{step.title}</div>
                  <div className="text-[13px] leading-[1.6] max-md:text-[12px]">{step.body}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={360} className="mt-12 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full border-[3px] border-[#10101A] bg-[#10101A] px-6.5 py-4 text-[15px] font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
            style={{ boxShadow: "5px 5px 0 " + RED }}
          >
            {t.curriculum.cta}
          </a>
        </Reveal>
      </div>

      {/* EDUCACIÓN CONTINUA */}
      <div id="continua" className="mx-auto max-w-300 px-14 pb-20 max-md:px-6">
        <Reveal className="mb-11 text-center">
          <h2 className="mb-2 text-[38px] font-extrabold uppercase max-md:text-3xl" style={{ fontFamily: DISPLAY }}>
            {t.continuing.heading}
          </h2>
          <p className="mx-auto max-w-120 text-sm font-semibold">{t.continuing.body}</p>
        </Reveal>
        <CertificationFlipGrid certifications={certifications} />
        <Reveal className="mt-11 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full border-[3px] border-[#10101A] px-6.5 py-4 text-[15px] font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
            style={{ background: NAVY, boxShadow: "5px 5px 0 #10101A" }}
          >
            {t.continuing.cta}
          </a>
        </Reveal>
      </div>

      {/* SOLICITA INFORMACIÓN */}
      <div id="informacion" className="mx-auto max-w-300 px-14 pb-20 max-md:px-6">
        <Reveal className="mb-10 text-center">
          <div
            className="mb-3.5 inline-block px-4 py-1.75 text-[13px] font-extrabold tracking-[0.06em] uppercase"
            style={{ background: "#10101A", color: CREAM, transform: "rotate(1.5deg)" }}
          >
            {t.info.badge}
          </div>
          <h2 className="text-[38px] font-extrabold uppercase max-md:text-3xl" style={{ fontFamily: DISPLAY }}>
            {t.info.heading}
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <CollageInfoForm schools={schools} />
        </Reveal>
      </div>

      {/* CTA + TRANSPARENCIA */}
      <div id="registro" className="mx-auto max-w-300 px-14 pb-20 max-md:px-6">
        <Reveal
          className="relative mb-10 grid grid-cols-[1.3fr_1fr] items-center gap-10 rounded-[28px] border-4 border-[#10101A] p-13 max-md:grid-cols-1 max-md:p-8"
          style={{ background: NAVY, color: CREAM, boxShadow: "10px 10px 0 #10101A" }}
        >
          <div
            className="cm-tape"
            style={{ top: -18, left: 48, transform: "rotate(-6deg)", background: `repeating-linear-gradient(-45deg, ${RED} 0 6px, rgba(191,4,4,0.6) 6px 12px)` }}
          />
          <div
            className="cm-tape"
            style={{ bottom: -18, right: 60, transform: "rotate(8deg)" }}
          />
          <h2 className="text-[38px] leading-[1.05] font-extrabold uppercase max-md:text-2xl" style={{ fontFamily: DISPLAY }}>
            {t.ctaBlock.heading}
          </h2>
          <div>
            <p className="mb-5.5 text-sm leading-[1.6] font-semibold">{t.ctaBlock.body}</p>
            <a
              href="#"
              className="inline-block rounded-full border-[3px] border-[#10101A] bg-[#10101A] px-6.5 py-3.75 text-sm font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
            >
              {t.ctaBlock.cta}
            </a>
          </div>
        </Reveal>

        <div id="comunidad" className="mb-10 grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <Reveal className="rounded-2xl border-[3px] border-[#10101A] px-6 py-5 transition hover:-translate-y-1">
            <div className="text-[13px] font-extrabold">FLORIDA CIE</div>
            <div className="mt-1 text-xs" style={{ color: "#4A4636" }}>
              {t.accreditation.commissionDesc}
            </div>
          </Reveal>
          <Reveal delay={100} className="rounded-2xl border-[3px] border-[#10101A] px-6 py-5 transition hover:-translate-y-1">
            <div className="text-[13px] font-extrabold">{t.accreditation.sacscocLabel}</div>
            <div className="mt-1 text-xs" style={{ color: "#4A4636" }}>
              {t.accreditation.sacscocDesc}
            </div>
          </Reveal>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-[#10101A] pt-6">
          <div className="text-[13px] font-semibold">{t.footer.copyright}</div>
          <div className="flex gap-5">
            <a href="#" className="text-[13px] font-bold hover:text-[#BF0404]">YouTube</a>
            <a href="#" className="text-[13px] font-bold hover:text-[#BF0404]">LinkedIn</a>
            <a href="#" className="text-[13px] font-bold hover:text-[#BF0404]">Instagram</a>
            <a href="#" className="text-[13px] font-bold hover:text-[#BF0404]">X</a>
          </div>
        </div>
      </div>

      <ScrollToTop bg="#10101A" />
      <MobileTabBar pillBg="#10101A" accents={["#BF0404", "#003D54", "#0092B6", "#BF0404"]} />
      <ModelSwitcher current={3} />
      <LanguageToggle />
    </div>
  );
}

function Stat({
  value,
  label,
  gradient,
  text,
  icon,
}: {
  value: string | number;
  label: string;
  gradient: string;
  text: string;
  icon: ReactNode;
}) {
  return (
    <div tabIndex={0} className="stat3d-wrap outline-none">
      <div
        className="stat3d-card rounded-2xl border-4 border-[#10101A]"
        style={{ background: gradient, color: text }}
      >
        <div aria-hidden className="stat3d-logo">
          <span className="stat3d-circle stat3d-circle1" />
          <span className="stat3d-circle stat3d-circle2" />
          <span className="stat3d-circle stat3d-circle3" />
          <span className="stat3d-circle stat3d-circle4" style={{ color: text }}>
            {icon}
          </span>
        </div>
        <div aria-hidden className="stat3d-glass" />
        <div className="stat3d-content px-6.5 py-8.5 max-md:px-4 max-md:py-5">
          <div className="text-5xl font-extrabold max-md:text-3xl" style={{ fontFamily: DISPLAY }}>
            {value}
          </div>
          <div className="mt-1.5 text-xs font-extrabold uppercase max-md:mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}

function CapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9l10-5 10 5-10 5-10-5z" />
      <path d="M6 11.5V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.5" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5V6a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0 0 4h13" />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M8.5 12.5 7 21l5-2.5L17 21l-1.5-8.5" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
    </svg>
  );
}

function PhotoPlaceholder({
  label,
  rotate,
  accent,
  image,
  className = "",
}: {
  label: string;
  rotate: number;
  accent: string;
  image: string;
  className?: string;
}) {
  return (
    <div
      className={`w-56 shrink-0 rounded-xl border-4 border-[#10101A] p-2 max-md:w-full max-md:p-1.5 ${className}`}
      style={{ background: CREAM, transform: `rotate(${rotate * 0.6}deg)`, boxShadow: "6px 6px 0 #10101A" }}
    >
      <div
        className="relative h-40 overflow-hidden rounded-md max-md:h-20"
        style={{ background: `linear-gradient(135deg, ${accent}55, ${accent}22)` }}
      >
        <Image src={image} alt="" fill sizes="(max-width: 767px) 50vw, 224px" className="object-cover opacity-80" />
      </div>
      <div
        className="mt-2 text-center text-[11px] font-extrabold tracking-[0.06em] uppercase max-md:mt-1 max-md:text-[9px]"
        style={{ color: "#8a8270" }}
      >
        📷 {label}
      </div>
    </div>
  );
}
