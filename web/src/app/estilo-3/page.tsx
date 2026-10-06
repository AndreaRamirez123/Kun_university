import type { ReactNode } from "react";
import Image from "next/image";
import { getCertifications, getSchools, getStats } from "@/lib/api";
import { AccordionShowcase, type AccordionItem } from "@/components/accordion-showcase";
import { CertificationFlipGrid } from "@/components/certification-flip-grid";
import { CollageInfoForm } from "@/components/collage-info-form";
import { FlipText } from "@/components/flip-text";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { ModelSwitcher } from "@/components/model-switcher";
import { Reveal } from "@/components/reveal";
import { ScrollToTop } from "@/components/scroll-to-top";
import { TiltCard } from "@/components/tilt-card";

const RED = "#BF0404";
const NAVY = "#003D54";
const TEAL = "#0092B6";
const INK = "#10101A";
const CREAM = "#FFF9EC";

const DISPLAY = "var(--font-archivo-black), sans-serif";
const HAND = "var(--font-caveat), cursive";

const TICKER_ITEMS = ["★ IA-NATIVE", "4 ESCUELAS", "★ 11 PROGRAMAS", "100% ONLINE"];

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

export default async function Estilo3Page() {
  const [schools, certifications, stats] = await Promise.all([
    getSchools(),
    getCertifications(),
    getStats(),
  ]);

  return (
    <div className="relative max-md:pb-16">
      {/* NAV */}
      <div className="flex items-center justify-between border-b-4 border-[#10101A] px-14 py-5.5 max-md:px-6">
        <div className="flex items-center gap-3">
          <Image src="/kun-logo-model3.png" alt="KUN University AI" width={253} height={68} priority className="h-17 w-auto" />
        </div>
        <div className="flex items-center gap-7.5 max-md:hidden">
          <a href="#programas" className="text-sm font-bold hover:text-[#BF0404]">
            Programas
          </a>
          <a href="#continua" className="text-sm font-bold hover:text-[#BF0404]">
            Educación continua
          </a>
          <a href="#comunidad" className="text-sm font-bold hover:text-[#BF0404]">
            Comunidad
          </a>
          <a href="#informacion" className="text-sm font-bold hover:text-[#BF0404]">
            Información
          </a>
          <a
            href="#registro"
            className="rounded-full border-[3px] border-[#10101A] px-5 py-2.75 text-sm font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
            style={{ background: RED, boxShadow: "4px 4px 0 #10101A" }}
          >
            Certifícate gratis
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
            Educación superior IA-Native · Florida
          </div>
        </Reveal>

        <Reveal delay={80} variant="left" className="mb-2">
          <h1
            className="text-[64px] leading-[1.05] font-extrabold uppercase max-md:text-[32px]"
            style={{ fontFamily: DISPLAY }}
          >
            La universidad que se
          </h1>
        </Reveal>
        <Reveal delay={200} variant="left" className="mb-2">
          <h1
            className="text-[64px] leading-[1.05] font-extrabold uppercase max-md:text-[32px]"
            style={{ fontFamily: DISPLAY, color: RED, WebkitTextStroke: "3px #10101A" }}
          >
            Rediseñó alrededor
          </h1>
        </Reveal>
        <div className="mb-9 flex flex-wrap items-center justify-center gap-5">
          <Reveal delay={320} variant="left">
            <h1
              className="text-[64px] leading-[1.05] font-extrabold uppercase max-md:text-[32px]"
              style={{ fontFamily: DISPLAY }}
            >
              <span className="relative inline-block" style={{ color: RED, WebkitTextStroke: "3px #10101A" }}>
                de la IA
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
              className="px-5 py-2.5 text-[22px] font-extrabold tracking-[0.04em] uppercase max-md:text-base"
              style={{ fontFamily: DISPLAY, background: "#10101A", color: CREAM, transform: "rotate(-2deg)", boxShadow: "5px 5px 0 rgba(16,16,26,0.4)" }}
            >
              <FlipText>no al revés.</FlipText>
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-[1.3fr_1fr] items-center gap-10 max-md:grid-cols-1">
          <Reveal delay={160}>
            <p className="max-w-140 text-lg leading-[1.55] font-medium">
              KUN University AI forma profesionales en Salud, Tecnología, Negocios y Medios
              Digitales con un currículo que se actualiza a la velocidad de la ciencia, no de los
              semestres.
            </p>
          </Reveal>
          <Reveal delay={240} className="relative mt-14 flex flex-col gap-3.5 max-md:mt-0">
            <a
              href="#programas"
              className="rounded-full border-[3px] border-[#10101A] px-6.5 py-4 text-center text-[15px] font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
              style={{ background: "#10101A", boxShadow: "5px 5px 0 #BF0404" }}
            >
              Explora los programas →
            </a>
            <a
              href="#continua"
              className="rounded-full border-[3px] border-[#10101A] px-6.5 py-4 text-center text-[15px] font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
              style={{ background: NAVY, boxShadow: "5px 5px 0 #10101A" }}
            >
              Certifícate gratis en 40 horas
            </a>
          </Reveal>
        </div>
      </div>

      {/* TICKER */}
      <div className="mask-fade-x overflow-hidden bg-[#10101A] py-4 whitespace-nowrap">
        <div className="animate-marquee flex w-max items-center gap-3">
          {[0, 1].map((rep) => (
            <span key={rep} className="flex items-center gap-3">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
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
                  {t.replace("★ ", "")}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* TORN DIVIDER */}
      <div aria-hidden className="cm-torn-bottom relative z-10 -mb-1 h-7 bg-[#10101A]" />

      {/* STATS BLOCKS */}
      <div className="grid grid-cols-4 border-b-4 border-[#10101A] max-md:grid-cols-2">
        <Stat value={stats.schools} label="Escuelas" bg={RED} text={CREAM} border />
        <Stat value={stats.programs} label="Programas" bg={CREAM} border />
        <Stat value={stats.certifications} label="Certif. IA" bg={NAVY} text={CREAM} border />
        <Stat value={`${stats.online}%`} label="Online" bg={CREAM} />
      </div>

      {/* IDENTIDAD */}
      <div className="mx-auto max-w-300 px-14 py-18 max-md:px-6">
        <Reveal>
          <h2
            className="mb-12 max-w-225 text-[46px] leading-[1.05] font-extrabold uppercase max-md:text-3xl"
            style={{ fontFamily: DISPLAY }}
          >
            No enseñamos lo que se enseñaba hace cinco años
          </h2>
        </Reveal>
        <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
          {[
            {
              n: "01",
              title: "Conocimiento de frontera, fácil de usar",
              body: "Hacemos que el conocimiento más avanzado del mundo sea fácil de entender y de aplicar — sin importar de dónde vengas.",
              bg: "#10101A",
              text: CREAM,
              numColor: CREAM,
              rotate: -2.5,
              shadow: RED,
              lift: "md:mt-6",
            },
            {
              n: "02",
              title: "Un currículo vivo, no un plan fijo",
              body: "Programas diseñados y actualizados con IA, validados por criterio experto humano. Cuando cambia la industria, el curso cambia con ella.",
              bg: RED,
              text: CREAM,
              numColor: CREAM,
              rotate: 3,
              shadow: TEAL,
              lift: "md:-mt-3",
              tape: true,
            },
            {
              n: "03",
              title: "Comunidad antes que matrícula",
              body: "Certifícate en competencias reales desde el primer día, con o sin título. El valor se demuestra antes de pedirte que te matricules.",
              bg: "#10101A",
              text: CREAM,
              numColor: CREAM,
              rotate: -2,
              shadow: TEAL,
              lift: "md:mt-8",
            },
          ].map((card, i) => (
            <Reveal key={card.n} delay={i * 120} className={card.lift}>
              <TiltCard
                baseRotate={card.rotate}
                restShadow={`7px 7px 0 ${card.shadow}`}
                className="relative rounded-3xl p-7.5"
                style={{ background: card.bg, color: card.text }}
              >
                {card.tape && (
                  <div
                    className="cm-tape"
                    style={{ top: -16, right: 24, transform: "rotate(6deg)", background: `repeating-linear-gradient(-45deg, ${CREAM} 0 6px, rgba(255,249,236,0.65) 6px 12px)` }}
                  />
                )}
                <div className="mb-3 text-3xl font-extrabold" style={{ fontFamily: DISPLAY, color: card.numColor }}>
                  {card.n}
                </div>
                <div className="mb-2.5 text-lg font-extrabold">{card.title}</div>
                <div className="text-[13px] leading-[1.6] opacity-85">{card.body}</div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={360} className="mt-11 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full border-[3px] border-[#10101A] px-6.5 py-4 text-[15px] font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
            style={{ background: RED, boxShadow: "5px 5px 0 #10101A" }}
          >
            Agenda una asesoría gratuita
          </a>
        </Reveal>
      </div>

      {/* GALERÍA (marcadores de foto) */}
      <div className="mx-auto max-w-300 px-14 pb-18 max-md:px-6">
        <Reveal className="mb-9 flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-2xl font-extrabold uppercase" style={{ fontFamily: DISPLAY }}>
            La vida en KUN
          </h3>
          <span className="text-lg" style={{ fontFamily: HAND, color: "#8a8270" }}>
            (espacio reservado para fotos reales del campus)
          </span>
        </Reveal>
        <div className="flex flex-wrap items-start gap-8 max-md:justify-center">
          <Reveal delay={0}>
            <PhotoPlaceholder label="Campus" rotate={-4} accent={RED} />
          </Reveal>
          <Reveal delay={100} className="md:mt-9">
            <PhotoPlaceholder label="Estudiantes" rotate={3} accent={TEAL} />
          </Reveal>
          <Reveal delay={200}>
            <PhotoPlaceholder label="Comunidad" rotate={-2} accent={RED} />
          </Reveal>
          <Reveal delay={300} className="md:mt-6 max-md:hidden">
            <PhotoPlaceholder label="Equipo docente" rotate={2.5} accent={TEAL} />
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
              Cuatro escuelas.
            </h2>
            <h2 className="mb-11 text-[42px] font-extrabold uppercase max-md:text-3xl" style={{ fontFamily: DISPLAY }}>
              Un mismo motor IA-Native.
            </h2>
          </Reveal>
          <AccordionShowcase
            variant="accordion"
            items={schools.map(
              (school): AccordionItem => ({
                id: school.slug,
                eyebrow: school.programs.map((p) => p.degree).join(" · "),
                title: school.name.replace("Escuela de ", ""),
                description: school.tagline,
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
              Quiero información de mi escuela
            </a>
          </Reveal>
        </div>
      </div>

      {/* MOTOR CURRICULAR */}
      <div className="mx-auto max-w-300 px-14 py-20 max-md:px-6">
        <Reveal>
          <h2 className="mb-12 text-[42px] font-extrabold uppercase max-md:text-3xl" style={{ fontFamily: DISPLAY }}>
            Así se construye un curso en KUN
          </h2>
        </Reveal>
        <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
          {[
            { n: "01", title: "LA IA RASTREA LA FRONTERA", body: "Nuestros agentes de IA monitorean lo último que publica la ciencia, la industria y la regulación en cada campo que enseñamos.", bg: CREAM, text: INK, rotate: -1.5, tape: false },
            { n: "02", title: "EL CRITERIO HUMANO DECIDE", body: "Nuestro equipo académico experto revisa, valida y da forma al contenido. La IA propone, las personas deciden.", bg: NAVY, text: CREAM, rotate: 2, tape: true },
            { n: "03", title: "APRENDES LO QUE EL MERCADO NECESITA HOY", body: "No lo que se enseñaba hace cinco años. Aprendes las competencias que las empresas buscan hoy.", bg: CREAM, text: INK, rotate: -1, tape: false },
          ].map((step, i) => (
            <Reveal key={step.n} delay={i * 120}>
              <TiltCard
                baseRotate={step.rotate}
                className="relative rounded-2xl border-4 border-[#10101A] p-7.5"
                style={{ background: step.bg, color: step.text }}
              >
                {step.tape && (
                  <div
                    className="cm-tape"
                    style={{ top: -16, right: 20, transform: "rotate(9deg)", background: `repeating-linear-gradient(-45deg, ${INK} 0 6px, rgba(16,16,26,0.6) 6px 12px)` }}
                  />
                )}
                <div className="mb-3.5 text-[42px] font-extrabold" style={{ fontFamily: DISPLAY }}>
                  {step.n}
                </div>
                <div className="mb-2 text-[15px] font-extrabold">{step.title}</div>
                <div className="text-[13px] leading-[1.6]">{step.body}</div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={360} className="mt-12 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full border-[3px] border-[#10101A] bg-[#10101A] px-6.5 py-4 text-[15px] font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
            style={{ boxShadow: "5px 5px 0 " + RED }}
          >
            Habla con admisiones
          </a>
        </Reveal>
      </div>

      {/* EDUCACIÓN CONTINUA */}
      <div id="continua" className="mx-auto max-w-300 px-14 pb-20 max-md:px-6">
        <Reveal className="mb-11 text-center">
          <h2 className="mb-2 text-[38px] font-extrabold uppercase max-md:text-3xl" style={{ fontFamily: DISPLAY }}>
            No tienes que esperar a graduarte
          </h2>
          <p className="mx-auto max-w-120 text-sm font-semibold">
            Seis certificaciones de 36 a 40 horas, diseñadas para aplicar lo aprendido desde la
            primera semana.
          </p>
        </Reveal>
        <CertificationFlipGrid certifications={certifications} />
        <Reveal className="mt-11 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full border-[3px] border-[#10101A] px-6.5 py-4 text-[15px] font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
            style={{ background: NAVY, boxShadow: "5px 5px 0 #10101A" }}
          >
            Inscríbete a una certificación
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
            Sin compromiso
          </div>
          <h2 className="text-[38px] font-extrabold uppercase max-md:text-3xl" style={{ fontFamily: DISPLAY }}>
            ¿Quieres que te contemos más?
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
            Antes de matricularte, síguenos
          </h2>
          <div>
            <p className="mb-5.5 text-sm leading-[1.6] font-semibold">
              El valor se demuestra antes de pedirte que pagues por él. Clases abiertas y
              conversaciones con expertos, sin matrícula.
            </p>
            <a
              href="#"
              className="inline-block rounded-full border-[3px] border-[#10101A] bg-[#10101A] px-6.5 py-3.75 text-sm font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
            >
              Únete a la comunidad
            </a>
          </div>
        </Reveal>

        <div id="comunidad" className="mb-10 grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <Reveal className="rounded-2xl border-[3px] border-[#10101A] px-6 py-5 transition hover:-translate-y-1">
            <div className="text-[13px] font-extrabold">FLORIDA CIE</div>
            <div className="mt-1 text-xs" style={{ color: "#4A4636" }}>
              Comisión de Educación Independiente
            </div>
          </Reveal>
          <Reveal delay={100} className="rounded-2xl border-[3px] border-[#10101A] px-6 py-5 transition hover:-translate-y-1">
            <div className="text-[13px] font-extrabold">SACSCOC · EN PROCESO</div>
            <div className="mt-1 text-xs" style={{ color: "#4A4636" }}>
              Acreditación institucional en avance
            </div>
          </Reveal>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-[#10101A] pt-6">
          <div className="text-[13px] font-semibold">
            © 2026 KUN University AI
          </div>
          <div className="flex gap-5">
            <a href="#" className="text-[13px] font-bold hover:text-[#BF0404]">YouTube</a>
            <a href="#" className="text-[13px] font-bold hover:text-[#BF0404]">LinkedIn</a>
            <a href="#" className="text-[13px] font-bold hover:text-[#BF0404]">Instagram</a>
            <a href="#" className="text-[13px] font-bold hover:text-[#BF0404]">X</a>
          </div>
        </div>
      </div>

      <ScrollToTop bg="#10101A" />
      <MobileTabBar bg="#FFF9EC" ink="#10101A" border="rgba(16,16,26,0.15)" />
      <ModelSwitcher current={3} />
    </div>
  );
}

function Stat({
  value,
  label,
  bg,
  text,
  border,
}: {
  value: string | number;
  label: string;
  bg: string;
  text?: string;
  border?: boolean;
}) {
  return (
    <div
      tabIndex={0}
      className={`stat-unfold px-6.5 py-8.5 outline-none max-md:px-4 max-md:py-5 ${border ? "border-r-4 border-[#10101A] max-md:border-b-4" : ""}`}
      style={{ background: bg, color: text }}
    >
      <div
        aria-hidden
        className="stat-unfold-box stat-unfold-box1"
        style={{ background: `radial-gradient(circle at 30% 107%, ${CREAM} 0%, ${TEAL} 90%)` }}
      />
      <div
        aria-hidden
        className="stat-unfold-box stat-unfold-box2"
        style={{ background: `radial-gradient(circle at 30% 107%, ${TEAL} 0%, ${NAVY} 90%)` }}
      />
      <div
        aria-hidden
        className="stat-unfold-box stat-unfold-box3"
        style={{ background: `radial-gradient(circle at 30% 107%, ${RED} 0%, ${NAVY} 90%)` }}
      />
      <div aria-hidden className="stat-unfold-box stat-unfold-box4" style={{ background: CREAM }} />

      <div className="stat-unfold-logo">
        <div className="text-5xl font-extrabold max-md:text-3xl" style={{ fontFamily: DISPLAY }}>
          {value}
        </div>
        <div className="mt-1.5 text-xs font-extrabold uppercase max-md:mt-1">{label}</div>
      </div>
    </div>
  );
}

function PhotoPlaceholder({
  label,
  rotate,
  accent,
  className = "",
}: {
  label: string;
  rotate: number;
  accent: string;
  className?: string;
}) {
  return (
    <div
      className={`w-56 shrink-0 rounded-xl border-4 border-[#10101A] p-2 max-md:w-44 ${className}`}
      style={{ background: CREAM, transform: `rotate(${rotate}deg)`, boxShadow: "6px 6px 0 #10101A" }}
    >
      <div
        className="flex h-40 items-center justify-center rounded-md max-md:h-32"
        style={{ background: `linear-gradient(135deg, ${accent}55, ${accent}22)` }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.6">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.8" />
          <path d="M21 16l-5.5-5-4 4-2.5-2.5L3 17" />
        </svg>
      </div>
      <div
        className="mt-2 text-center text-[11px] font-extrabold tracking-[0.06em] uppercase"
        style={{ color: "#8a8270" }}
      >
        📷 {label}
      </div>
    </div>
  );
}
