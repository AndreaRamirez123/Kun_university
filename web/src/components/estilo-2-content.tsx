"use client";

import Image from "next/image";
import { CertificationsSwiper } from "@/components/certifications-swiper";
import { FanStack, type FanItem } from "@/components/fan-stack";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { ModelSwitcher } from "@/components/model-switcher";
import { LanguageToggle } from "@/components/language-toggle";
import { Reveal } from "@/components/reveal";
import { RetroInfoForm } from "@/components/retro-info-form";
import { ScrollToTop } from "@/components/scroll-to-top";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { Certification, School, Stats } from "@/lib/types";

const BLUE = "#03318C";
const TEAL = "#007FA1";
const RED = "#8C0303";
const CREAM = "#FFFFFF";
const INK = "#171717";

const DISPLAY = "var(--font-bungee), sans-serif";

const SHADOW_MAP: Record<string, string> = {
  [BLUE]: "0 14px 28px rgba(3,49,140,0.32)",
  [TEAL]: "0 14px 28px rgba(0,127,161,0.28)",
  [RED]: "0 14px 28px rgba(140,3,3,0.32)",
  [INK]: "0 14px 28px rgba(23,23,23,0.25)",
};

function softShadow(hex: string) {
  return SHADOW_MAP[hex] ?? "0 14px 28px rgba(23,23,23,0.2)";
}

const COPY = {
  es: {
    nav: {
      programs: "Programas",
      continuingEd: "Educación continua",
      community: "Comunidad",
      info: "Información",
      ctaFree: "Certifícate gratis",
    },
    hero: {
      badgeAi: "IA",
      badge: "★ Educación superior IA-Native · Florida ★",
      titleStart: "La universidad que se",
      titleHighlight: "rediseñó alrededor de la IA",
      titleEnd: ", no al revés.",
      body: "KUN University AI forma profesionales en Salud, Tecnología, Negocios y Medios Digitales con un currículo que se actualiza a la velocidad de la ciencia, no de los semestres.",
      ctaPrimary: "Explora los programas →",
      ctaSecondary: "Certifícate gratis en 40 horas",
      statSchools: "Escuelas",
      statPrograms: "Programas",
      statCerts: "Certif. IA",
      statOnline: "Online",
    },
    identity: {
      eyebrow: "★ Identidad estratégica ★",
      heading: "No enseñamos lo que se enseñaba hace cinco años",
      cards: [
        {
          title: "Conocimiento de frontera, fácil de usar",
          body: "Hacemos que el conocimiento más avanzado del mundo sea fácil de entender y de aplicar — sin importar de dónde vengas.",
        },
        {
          title: "Un currículo vivo, no un plan fijo",
          body: "Programas diseñados y actualizados con IA, validados por criterio experto humano. Cuando cambia la industria, el curso cambia con ella.",
        },
        {
          title: "Comunidad antes que matrícula",
          body: "Certifícate en competencias reales desde el primer día, con o sin título. El valor se demuestra antes de pedirte que te matricules.",
        },
      ],
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
      headingStart: "Cuatro escuelas. ",
      headingHighlight: "Un mismo motor IA-Native.",
      cta: "Quiero información de mi escuela",
    },
    curriculum: {
      heading: "Así se construye un curso en KUN",
      steps: [
        {
          n: "1",
          title: "LA IA RASTREA LA FRONTERA",
          body: "Nuestros agentes de IA monitorean lo último que publica la ciencia, la industria y la regulación en cada campo que enseñamos.",
          watermark: "/step-icons/step-radar.png",
        },
        {
          n: "2",
          title: "EL CRITERIO HUMANO DECIDE",
          body: "Nuestro equipo académico experto revisa, valida y da forma al contenido. La IA propone, las personas deciden.",
          watermark: "/step-icons/step-decision.png",
        },
        {
          n: "3",
          title: "APRENDES LO QUE EL MERCADO NECESITA HOY",
          body: "No lo que se enseñaba hace cinco años. Aprendes las competencias que las empresas buscan hoy.",
          watermark: "/step-icons/step-growth.png",
        },
      ],
      cta: "Habla con admisiones",
    },
    continuingEd: {
      heading: "No tienes que esperar a graduarte",
      body: "Seis certificaciones de 36 a 40 horas, diseñadas para aplicar lo aprendido desde la primera semana.",
      cta: "Inscríbete a una certificación",
    },
    infoRequest: {
      badge: "Sin compromiso",
      heading: "¿Quieres que te contemos más?",
    },
    ctaTransparency: {
      heading: "Antes de matricularte, síguenos",
      body: "El valor se demuestra antes de pedirte que pagues por él. Clases abiertas y conversaciones con expertos, sin matrícula.",
      cta: "Únete a la comunidad",
    },
    seals: {
      cie: { label: "Florida CIE", detail: "Comisión de Educación Independiente" },
      sacscoc: { label: "SACSCOC · En proceso", detail: "Acreditación institucional en avance" },
    },
    footer: {
      copyright: "© 2026 KUN University AI",
      youtube: "YouTube",
      linkedin: "LinkedIn",
      instagram: "Instagram",
      x: "X",
    },
  },
  en: {
    nav: {
      programs: "Programs",
      continuingEd: "Continuing Ed",
      community: "Community",
      info: "Information",
      ctaFree: "Get certified free",
    },
    hero: {
      badgeAi: "AI",
      badge: "★ AI-Native higher education · Florida ★",
      titleStart: "The university that",
      titleHighlight: "redesigned itself around AI",
      titleEnd: ", not the other way around.",
      body: "KUN University AI trains professionals in Health, Technology, Business and Digital Media with a curriculum that updates at the speed of science, not of semesters.",
      ctaPrimary: "Explore the programs →",
      ctaSecondary: "Get certified free in 40 hours",
      statSchools: "Schools",
      statPrograms: "Programs",
      statCerts: "AI Certs.",
      statOnline: "Online",
    },
    identity: {
      eyebrow: "★ Strategic identity ★",
      heading: "We don't teach what was taught five years ago",
      cards: [
        {
          title: "Frontier knowledge, made easy to use",
          body: "We make the world's most advanced knowledge easy to understand and apply — no matter where you're starting from.",
        },
        {
          title: "A living curriculum, not a fixed plan",
          body: "Programs designed and updated with AI, validated by expert human judgment. When the industry changes, the course changes with it.",
        },
        {
          title: "Community before enrollment",
          body: "Get certified in real-world skills from day one, with or without a degree. We prove the value before asking you to enroll.",
        },
      ],
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
      headingStart: "Four schools. ",
      headingHighlight: "One AI-Native engine.",
      cta: "I want information about my school",
    },
    curriculum: {
      heading: "This is how a course gets built at KUN",
      steps: [
        {
          n: "1",
          title: "AI TRACKS THE FRONTIER",
          body: "Our AI agents monitor the latest published in science, industry, and regulation across every field we teach.",
          watermark: "/step-icons/step-radar.png",
        },
        {
          n: "2",
          title: "HUMAN JUDGMENT DECIDES",
          body: "Our expert academic team reviews, validates, and shapes the content. AI proposes, people decide.",
          watermark: "/step-icons/step-decision.png",
        },
        {
          n: "3",
          title: "YOU LEARN WHAT THE MARKET NEEDS TODAY",
          body: "Not what was taught five years ago. You learn the skills companies are looking for today.",
          watermark: "/step-icons/step-growth.png",
        },
      ],
      cta: "Talk to admissions",
    },
    continuingEd: {
      heading: "You don't have to wait until you graduate",
      body: "Six certifications of 36 to 40 hours, designed to apply what you learn from week one.",
      cta: "Enroll in a certification",
    },
    infoRequest: {
      badge: "No commitment",
      heading: "Want us to tell you more?",
    },
    ctaTransparency: {
      heading: "Before you enroll, follow us",
      body: "We prove the value before asking you to pay for it. Open classes and conversations with experts, no enrollment required.",
      cta: "Join the community",
    },
    seals: {
      cie: { label: "Florida CIE", detail: "Commission for Independent Education" },
      sacscoc: { label: "SACSCOC · In progress", detail: "Institutional accreditation underway" },
    },
    footer: {
      copyright: "© 2026 KUN University AI",
      youtube: "YouTube",
      linkedin: "LinkedIn",
      instagram: "Instagram",
      x: "X",
    },
  },
};

export function Estilo2Content({
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

  const identityVisuals = [
    {
      ring: BLUE,
      rotate: -3,
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
          <path d="M12 12l4-5" />
        </svg>
      ),
    },
    {
      ring: RED,
      rotate: 2,
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="1.6">
          <path d="M12 21V9" />
          <path d="M12 13c0-4 3-5 6-5-.5 3-2 5-6 5z" />
          <path d="M12 17c0-3-2.5-4-5-4 .5 2.5 2 4 5 4z" />
        </svg>
      ),
    },
    {
      ring: BLUE,
      rotate: -2,
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="1.6">
          <path d="M4 19.5V6a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0 0 4h13" />
        </svg>
      ),
    },
  ];

  const galleryItems = [
    { label: t.gallery.campus, accent: BLUE, rotate: -3, icon: <CampusIllustration accent={BLUE} /> },
    { label: t.gallery.students, accent: RED, rotate: 2, icon: <StudentsIllustration accent={RED} /> },
    { label: t.gallery.community, accent: BLUE, rotate: -2, icon: <CommunityIllustration accent={BLUE} /> },
    {
      label: t.gallery.faculty,
      accent: RED,
      rotate: 3,
      hideOnMobile: true,
      icon: <FacultyIllustration accent={RED} />,
    },
  ];

  return (
    <div className="relative max-md:pb-16">
      {/* NAV */}
      <div
        className="flex items-center justify-between border-b-[6px] px-14 py-5 max-md:px-6"
        style={{ borderColor: INK }}
      >
        <div className="flex items-center gap-3">
          <Image src="/kun-logo-model2.png" alt="KUN University AI" width={271} height={96} priority className="h-24 w-auto max-md:h-14" />
        </div>
        <div className="flex items-center gap-7 max-md:hidden">
          <a href="#programas" className="text-sm font-bold hover:text-[#8C0303]">
            {t.nav.programs}
          </a>
          <a href="#continua" className="text-sm font-bold hover:text-[#8C0303]">
            {t.nav.continuingEd}
          </a>
          <a href="#comunidad" className="text-sm font-bold hover:text-[#8C0303]">
            {t.nav.community}
          </a>
          <a href="#informacion" className="text-sm font-bold hover:text-[#8C0303]">
            {t.nav.info}
          </a>
          <a
            href="#registro"
            className="rounded-full border-[3px] px-5 py-2.5 text-sm font-bold text-white uppercase transition hover:-translate-y-0.5"
            style={{ background: RED, borderColor: INK, boxShadow: softShadow(INK) }}
          >
            {t.nav.ctaFree}
          </a>
        </div>
      </div>

      {/* HERO */}
      <div className="relative mx-auto max-w-300 overflow-hidden px-14 pt-20 pb-14 text-center max-md:px-6">
        <div
          aria-hidden
          className="retro-sunburst pointer-events-none absolute top-1/2 left-1/2 -z-10 h-170 w-170 -translate-x-1/2 -translate-y-1/2 opacity-25"
          style={{ ["--ray-a" as string]: TEAL, ["--ray-b" as string]: "transparent" }}
        />

        <div
          className="animate-badge-wobble absolute top-5 right-4 z-10 flex h-30 w-30 flex-col items-center justify-center rounded-full border-4 text-center max-md:hidden"
          style={{ borderColor: INK, background: CREAM, boxShadow: softShadow(BLUE) }}
        >
          <div
            aria-hidden
            className="animate-spin-slow absolute h-24 w-24 rounded-full border-2 border-dashed"
            style={{ borderColor: RED }}
          />
          <div className="relative flex h-24 w-24 flex-col items-center justify-center">
            <span className="text-[10px] font-bold tracking-[0.1em]" style={{ color: BLUE }}>
              EST. · FLORIDA
            </span>
            <span className="mt-1 text-xs" style={{ fontFamily: DISPLAY, color: RED }}>
              {t.hero.badgeAi}
            </span>
            <span className="mt-1 text-[10px] font-bold tracking-[0.1em]" style={{ color: BLUE }}>
              NATIVE
            </span>
          </div>
        </div>

        <Reveal className="relative mb-8 inline-flex items-center gap-3">
          <span
            className="px-5 py-2 text-xs font-bold tracking-[0.1em] text-white uppercase"
            style={{ background: BLUE, borderRadius: "999px 4px 999px 4px", boxShadow: softShadow(INK) }}
          >
            {t.hero.badge}
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1
            className="mx-auto mb-6 max-w-260 text-[50px] leading-[1.1] uppercase max-md:text-[30px]"
            style={{ fontFamily: DISPLAY, color: INK }}
          >
            {t.hero.titleStart}{" "}
            <span style={{ color: RED }}>{t.hero.titleHighlight}</span>
            {t.hero.titleEnd}
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mb-9 max-w-140 text-lg leading-[1.6] font-medium">{t.hero.body}</p>
        </Reveal>

        <Reveal delay={240} className="mb-16 flex justify-center gap-4 max-md:flex-col">
          <a
            href="#programas"
            className="rounded-full border-[3px] px-7.5 py-4 text-sm font-bold text-white uppercase transition hover:-translate-y-0.5"
            style={{ background: BLUE, borderColor: INK, boxShadow: softShadow(INK) }}
          >
            {t.hero.ctaPrimary}
          </a>
          <a
            href="#continua"
            className="rounded-full border-[3px] px-7.5 py-4 text-sm font-bold uppercase transition hover:-translate-y-0.5"
            style={{ background: CREAM, borderColor: INK, boxShadow: softShadow(RED) }}
          >
            {t.hero.ctaSecondary}
          </a>
        </Reveal>

        <div className="relative mx-auto max-w-260">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 max-md:h-96 max-md:w-96"
          >
            <div className="animate-glow-orbit absolute inset-0">
              <div
                className="animate-glow-hue absolute top-0 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 max-md:h-16 max-md:w-16"
                style={{
                  background: "conic-gradient(#ff2d55, #ffd60a, #30d5c8, #5e60ff, #ff2d55)",
                }}
              />
            </div>
          </div>

          <Reveal
            delay={320}
            className="relative z-10 grid grid-cols-4 overflow-hidden rounded-2xl border-4 max-md:grid-cols-2"
            style={{ borderColor: INK }}
          >
            <StatBlock value={stats.schools} label={t.hero.statSchools} bg={BLUE} text={CREAM} />
            <StatBlock value={stats.programs} label={t.hero.statPrograms} bg={CREAM} text={INK} />
            <StatBlock value={stats.certifications} label={t.hero.statCerts} bg={RED} text={CREAM} />
            <StatBlock value={`${stats.online}%`} label={t.hero.statOnline} bg={TEAL} text={INK} />
          </Reveal>
        </div>
      </div>

      {/* CHECKERED DIVIDER */}
      <div aria-hidden className="retro-checker animate-checker-scroll h-5 border-y-4" style={{ borderColor: INK }} />

      {/* IDENTIDAD */}
      <div className="mx-auto max-w-300 px-14 py-20 max-md:px-6">
        <Reveal className="mb-14 text-center">
          <div className="mb-3 text-xs font-bold tracking-[0.14em] uppercase" style={{ color: RED }}>
            {t.identity.eyebrow}
          </div>
          <h2 className="mx-auto max-w-160 text-3xl uppercase" style={{ fontFamily: DISPLAY, color: BLUE }}>
            {t.identity.heading}
          </h2>
        </Reveal>
        <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1">
          {t.identity.cards.map((card, i) => {
            const visual = identityVisuals[i];
            return (
              <Reveal
                key={card.title}
                delay={i * 120}
                className="text-center transition hover:-translate-y-1.5"
                style={{ transform: `rotate(${visual.rotate}deg)` }}
              >
                <div className="group relative z-0 mx-auto mb-5 h-27 w-24">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-36 w-36 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="hex-glow-spin animate-glow-orbit absolute inset-0" style={{ animationDuration: "6s" }}>
                      <div
                        className="hex-glow-blob absolute top-0 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-md transition-[opacity,filter,transform] duration-300"
                        style={{
                          background: `conic-gradient(from 0deg, ${visual.ring}, ${TEAL}, ${CREAM}, ${TEAL}, ${visual.ring})`,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="hex-badge relative flex h-full w-full items-center justify-center"
                    style={{
                      background: visual.ring,
                      boxShadow: softShadow(visual.ring),
                      clipPath: "polygon(50% 0%, 100% 18%, 100% 65%, 50% 100%, 0% 65%, 0% 18%)",
                    }}
                  >
                    <div
                      aria-hidden
                      className="absolute top-2.5 h-1 w-9 rounded-full"
                      style={{ background: "rgba(255,255,255,0.5)" }}
                    />
                    {visual.icon}
                  </div>
                </div>
                <div className="mb-2.5 text-base font-bold" style={{ color: BLUE }}>
                  {card.title}
                </div>
                <div className="mx-auto max-w-70 text-sm leading-[1.65]" style={{ color: "#5A4E40" }}>
                  {card.body}
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={360} className="mt-12 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full border-[3px] px-7.5 py-4 text-sm font-bold text-white uppercase transition hover:-translate-y-0.5"
            style={{ background: BLUE, borderColor: INK, boxShadow: softShadow(INK) }}
          >
            {t.identity.cta}
          </a>
        </Reveal>
      </div>

      {/* GALERÍA (marcadores de foto estilo postal) */}
      <div className="mx-auto max-w-300 px-14 pb-20 max-md:px-6">
        <Reveal className="mb-9 flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-xl uppercase" style={{ fontFamily: DISPLAY, color: BLUE }}>
            {t.gallery.heading}
          </h3>
        </Reveal>
        <div className="flex flex-wrap items-start gap-7 max-md:justify-center">
          {galleryItems.map((p, i) => (
            <Reveal key={p.label} delay={i * 100}>
              <PostcardPlaceholder
                label={p.label}
                accent={p.accent}
                rotate={p.rotate}
                hideOnMobile={p.hideOnMobile}
                icon={p.icon}
              />
            </Reveal>
          ))}
        </div>
      </div>

      {/* ESCUELAS */}
      <div id="programas" className="relative py-20" style={{ background: BLUE }}>
        <div className="mx-auto max-w-300 px-14 max-md:px-6">
          <Reveal className="mb-12 text-center">
            <h2 className="text-3xl uppercase" style={{ fontFamily: DISPLAY, color: CREAM }}>
              {t.schools.headingStart}
              <span style={{ color: TEAL }}>{t.schools.headingHighlight}</span>
            </h2>
          </Reveal>
          <FanStack
            items={schools.map(
              (school, i): FanItem => ({
                id: school.slug,
                eyebrow: school.programs.map((p) => p.degree).join(" · "),
                title: school.name[locale].replace(/^(Escuela de |School of )/, ""),
                description: school.tagline[locale],
                accent: i % 2 === 0 ? RED : TEAL,
              }),
            )}
            fontDisplay={DISPLAY}
            ink={CREAM}
            mutedText="rgba(255,255,255,0.95)"
            hintColor="#C9CDD1"
          />
          <Reveal className="mt-10 text-center">
            <a
              href="#informacion"
              className="inline-block rounded-full border-[3px] px-7.5 py-4 text-sm font-bold uppercase transition hover:-translate-y-0.5"
              style={{ background: CREAM, color: INK, borderColor: INK, boxShadow: softShadow(RED) }}
            >
              {t.schools.cta}
            </a>
          </Reveal>
        </div>
      </div>

      {/* CHECKERED DIVIDER */}
      <div aria-hidden className="retro-checker animate-checker-scroll h-5 border-y-4" style={{ borderColor: INK }} />

      {/* MOTOR CURRICULAR */}
      <div className="mx-auto max-w-300 px-14 py-20 max-md:px-6">
        <Reveal className="mb-14 text-center">
          <h2 className="text-3xl uppercase" style={{ fontFamily: DISPLAY, color: BLUE }}>
            {t.curriculum.heading}
          </h2>
        </Reveal>
        <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1">
          {t.curriculum.steps.map((step, i) => {
            const accent = i % 2 === 0 ? BLUE : RED;
            return (
              <Reveal key={step.n} delay={i * 120}>
                <div
                  tabIndex={0}
                  className="step-card rounded-xl border-4 outline-none"
                  style={{
                    borderColor: INK,
                    boxShadow: softShadow(INK),
                    ["--step-accent" as string]: accent,
                  }}
                >
                  <div aria-hidden className="step-card-watermark">
                    <Image src={step.watermark} alt="" width={220} height={220} className="h-44 w-44 object-contain" />
                  </div>
                  <div className="step-card-pin">
                    <div
                      className="mx-auto flex h-20 w-18 items-center justify-center text-2xl text-white"
                      style={{
                        fontFamily: DISPLAY,
                        background: accent,
                        clipPath: "polygon(50% 0%, 100% 22%, 100% 100%, 0% 100%, 0% 22%)",
                      }}
                    >
                      {step.n}
                    </div>
                    <div className="text-sm font-bold text-balance text-white">{step.title}</div>
                  </div>
                  <div className="step-card-reveal">
                    <p className="text-[13px] leading-[1.6] text-white/90">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={360} className="mt-12 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full border-[3px] px-7.5 py-4 text-sm font-bold text-white uppercase transition hover:-translate-y-0.5"
            style={{ background: BLUE, borderColor: INK, boxShadow: softShadow(INK) }}
          >
            {t.curriculum.cta}
          </a>
        </Reveal>
      </div>

      {/* EDUCACIÓN CONTINUA */}
      <div id="continua" className="relative z-0 mx-auto max-w-300 overflow-hidden px-14 pb-20 max-md:px-6">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {[
            { top: "10%", size: 70, delay: 0, duration: 16, from: BLUE, to: TEAL },
            { top: "68%", size: 24, delay: 2, duration: 10, from: RED, to: BLUE },
            { top: "35%", size: 90, delay: 5, duration: 20, from: TEAL, to: RED },
            { top: "80%", size: 40, delay: 1, duration: 13, from: BLUE, to: RED },
            { top: "22%", size: 18, delay: 7, duration: 11, from: RED, to: TEAL },
            { top: "55%", size: 55, delay: 3, duration: 18, from: TEAL, to: BLUE },
            { top: "92%", size: 30, delay: 9, duration: 14, from: BLUE, to: TEAL },
            { top: "4%", size: 45, delay: 4, duration: 22, from: RED, to: BLUE },
          ].map((sq, i) => (
            <span
              key={i}
              className="animate-float-horizontal absolute rounded-lg opacity-0"
              style={{
                top: sq.top,
                left: "-10%",
                width: `clamp(8px, ${((sq.size / 1200) * 100).toFixed(2)}vw, ${sq.size}px)`,
                height: `clamp(8px, ${((sq.size / 1200) * 100).toFixed(2)}vw, ${sq.size}px)`,
                background: `linear-gradient(135deg, ${sq.from}55, ${sq.to}55)`,
                animationDelay: `${sq.delay}s`,
                animationDuration: `${sq.duration}s`,
              }}
            />
          ))}
        </div>
        <Reveal className="mb-14 text-center">
          <h2 className="mb-2 text-3xl uppercase" style={{ fontFamily: DISPLAY, color: BLUE }}>
            {t.continuingEd.heading}
          </h2>
          <p className="mx-auto max-w-120 text-sm font-medium" style={{ color: "#5A4E40" }}>
            {t.continuingEd.body}
          </p>
        </Reveal>
        <CertificationsSwiper
          certifications={certifications}
          accents={[BLUE, RED, TEAL]}
          fontDisplay={DISPLAY}
          ink={INK}
        />
        <Reveal className="mt-10 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full border-[3px] px-7.5 py-4 text-sm font-bold text-white uppercase transition hover:-translate-y-0.5"
            style={{ background: RED, borderColor: INK, boxShadow: softShadow(INK) }}
          >
            {t.continuingEd.cta}
          </a>
        </Reveal>
      </div>

      {/* SOLICITA INFORMACIÓN */}
      <div id="informacion" className="mx-auto max-w-300 px-14 pb-20 max-md:px-6">
        <Reveal className="mb-10 text-center">
          <span
            className="mb-3.5 inline-block px-4 py-1.5 text-xs font-bold tracking-[0.1em] text-white uppercase"
            style={{ background: RED, borderRadius: "999px 4px 999px 4px" }}
          >
            {t.infoRequest.badge}
          </span>
          <h2 className="text-3xl uppercase" style={{ fontFamily: DISPLAY, color: BLUE }}>
            {t.infoRequest.heading}
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <RetroInfoForm schools={schools} />
        </Reveal>
      </div>

      {/* CTA + TRANSPARENCIA */}
      <div id="registro" className="mx-auto max-w-300 px-14 pb-20 max-md:px-6">
        <Reveal
          className="relative mb-10 overflow-hidden rounded-2xl border-4 p-13 text-center max-md:p-8"
          style={{ background: BLUE, color: CREAM, borderColor: INK, boxShadow: softShadow(TEAL) }}
        >
          <div
            aria-hidden
            className="animate-spin-slow pointer-events-none absolute -inset-[70%] opacity-25"
            style={{ background: `conic-gradient(from 0deg, ${RED}, ${TEAL}, ${CREAM}, ${TEAL}, ${RED})` }}
          />
          <div className="relative">
            <h2 className="mb-3.5 text-2xl uppercase" style={{ fontFamily: DISPLAY }}>
              {t.ctaTransparency.heading}
            </h2>
            <p className="mx-auto mb-7 max-w-120 text-sm font-medium opacity-90">{t.ctaTransparency.body}</p>
            <a
              href="#"
              className="inline-block rounded-full border-[3px] px-7 py-3.5 text-sm font-bold uppercase transition hover:-translate-y-0.5 active:-translate-y-0.5"
              style={{ background: CREAM, color: INK, borderColor: INK }}
            >
              {t.ctaTransparency.cta}
            </a>
          </div>
        </Reveal>

        <div id="comunidad" className="mb-10 grid grid-cols-2 gap-6 max-md:grid-cols-1">
          <SealCard
            label={t.seals.cie.label}
            detail={t.seals.cie.detail}
            accent={BLUE}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            }
          />
          <SealCard
            label={t.seals.sacscoc.label}
            detail={t.seals.sacscoc.detail}
            accent={RED}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            }
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-4 pt-6" style={{ borderColor: INK }}>
          <div className="text-[13px] font-semibold">{t.footer.copyright}</div>
          <div className="flex gap-5">
            <a href="#" className="text-[13px] font-bold hover:text-[#8C0303]">{t.footer.youtube}</a>
            <a href="#" className="text-[13px] font-bold hover:text-[#8C0303]">{t.footer.linkedin}</a>
            <a href="#" className="text-[13px] font-bold hover:text-[#8C0303]">{t.footer.instagram}</a>
            <a href="#" className="text-[13px] font-bold hover:text-[#8C0303]">{t.footer.x}</a>
          </div>
        </div>
      </div>

      <ScrollToTop bg="#03318C" />
      <MobileTabBar pillBg="#03318C" accents={["#ff2d55", "#ffd60a", "#30d5c8", "#5e60ff"]} />
      <ModelSwitcher current={2} />
      <LanguageToggle />
    </div>
  );
}

function StatBlock({
  value,
  label,
  bg,
  text,
}: {
  value: string | number;
  label: string;
  bg: string;
  text: string;
}) {
  return (
    <div className="px-6 py-8 text-center" style={{ background: bg, color: text }}>
      <div className="text-4xl" style={{ fontFamily: DISPLAY }}>
        {value}
      </div>
      <div className="mt-1.5 text-xs font-bold uppercase">{label}</div>
    </div>
  );
}

function PostcardPlaceholder({
  label,
  accent,
  rotate,
  hideOnMobile,
  icon,
}: {
  label: string;
  accent: string;
  rotate: number;
  hideOnMobile?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`w-56 shrink-0 overflow-hidden rounded-lg border-4 max-md:w-44 ${hideOnMobile ? "max-md:hidden" : ""}`}
      style={{ borderColor: INK, background: CREAM, transform: `rotate(${rotate}deg)`, boxShadow: softShadow(INK) }}
    >
      <div aria-hidden className="retro-airmail h-2" />
      <div
        className="relative flex h-36 items-center justify-center overflow-hidden max-md:h-28"
        style={{ background: `linear-gradient(135deg, ${accent}45, ${accent}18)` }}
      >
        <div
          aria-hidden
          className="retro-sunburst absolute h-24 w-24 opacity-25 max-md:h-20 max-md:w-20"
          style={{ "--ray-a": accent, "--ray-b": "transparent" } as React.CSSProperties}
        />
        <div className="relative">{icon}</div>
      </div>
      <div className="border-t-2 px-3 py-2 text-center text-[11px] font-bold tracking-[0.05em] uppercase" style={{ borderColor: INK, color: "#8a7a63" }}>
        📮 {label}
      </div>
    </div>
  );
}

function CampusIllustration({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 md:h-16 md:w-16" aria-hidden>
      <line x1="32" y1="8" x2="32" y2="2" stroke={INK} strokeWidth="2" />
      <polygon points="32,2 40,5 32,8" fill={accent} />
      <polygon points="32,10 54,26 10,26" fill={accent} />
      <rect x="12" y="26" width="40" height="24" fill={INK} opacity="0.1" />
      <rect x="15" y="28" width="6" height="22" fill={accent} />
      <rect x="25" y="28" width="6" height="22" fill={accent} />
      <rect x="35" y="28" width="6" height="22" fill={accent} />
      <rect x="45" y="28" width="4" height="22" fill={accent} />
      <rect x="9" y="50" width="46" height="4" fill={INK} />
    </svg>
  );
}

function StudentsIllustration({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 md:h-16 md:w-16" aria-hidden>
      <circle cx="40" cy="24" r="7" fill={INK} opacity="0.15" />
      <path d="M30 50c0-9 7-14 10-14s10 5 10 14" fill={INK} opacity="0.15" />
      <circle cx="24" cy="20" r="8" fill={accent} />
      <path d="M12 50c0-10 8-16 12-16s12 6 12 16" fill={accent} />
      <polygon points="24,10 35,14 24,18 13,14" fill={INK} />
    </svg>
  );
}

function CommunityIllustration({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 md:h-16 md:w-16" aria-hidden>
      <circle cx="16" cy="26" r="7" fill={CREAM} stroke={INK} strokeWidth="2" />
      <path d="M4 50c0-8 6-13 12-13s12 5 12 13" fill={CREAM} stroke={INK} strokeWidth="2" />
      <circle cx="48" cy="26" r="7" fill={CREAM} stroke={INK} strokeWidth="2" />
      <path d="M36 50c0-8 6-13 12-13s12 5 12 13" fill={CREAM} stroke={INK} strokeWidth="2" />
      <circle cx="32" cy="22" r="9" fill={accent} stroke={INK} strokeWidth="2" />
      <path d="M17 50c0-9.5 7-15 15-15s15 5.5 15 15" fill={accent} stroke={INK} strokeWidth="2" />
    </svg>
  );
}

function FacultyIllustration({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 md:h-16 md:w-16" aria-hidden>
      <circle cx="32" cy="16" r="8" fill={accent} />
      <path d="M18 48c0-11 8-17 14-17s14 6 14 17" fill={accent} />
      <rect x="22" y="36" width="20" height="12" fill={CREAM} stroke={INK} strokeWidth="2" />
      <line x1="25" y1="40" x2="39" y2="40" stroke={INK} strokeWidth="1.4" />
      <line x1="25" y1="44" x2="35" y2="44" stroke={INK} strokeWidth="1.4" />
      <rect x="10" y="50" width="44" height="3" fill={INK} />
    </svg>
  );
}

function SealCard({
  label,
  detail,
  accent,
  icon,
}: {
  label: string;
  detail: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl p-2" style={{ boxShadow: softShadow(accent) }}>
      <div
        aria-hidden
        className="animate-spin-slow pointer-events-none absolute -inset-[75%]"
        style={{
          animationDuration: "5s",
          background: `conic-gradient(from 0deg, ${BLUE}, ${RED}, ${TEAL}, ${RED}, ${BLUE})`,
        }}
      />
      <div
        className="relative flex items-center gap-4 rounded-lg border-4 p-5 transition hover:-translate-y-1 active:-translate-y-1"
        style={{ borderColor: INK, background: CREAM }}
      >
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed text-center"
          style={{ borderColor: accent, transform: "rotate(-6deg)" }}
        >
          {icon}
        </div>
        <div>
          <div className="text-[13px] font-bold" style={{ color: BLUE }}>
            {label}
          </div>
          <div className="mt-0.5 text-xs" style={{ color: "#5A4E40" }}>
            {detail}
          </div>
        </div>
      </div>
    </div>
  );
}
