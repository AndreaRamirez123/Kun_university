import Image from "next/image";
import { getCertifications, getSchools, getStats } from "@/lib/api";
import { AccordionShowcase, type AccordionItem } from "@/components/accordion-showcase";
import { FanStack, type FanItem } from "@/components/fan-stack";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { ModelSwitcher } from "@/components/model-switcher";
import { Reveal } from "@/components/reveal";
import { RetroInfoForm } from "@/components/retro-info-form";
import { ScrollToTop } from "@/components/scroll-to-top";

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


export default async function Estilo2Page() {
  const [schools, certifications, stats] = await Promise.all([
    getSchools(),
    getCertifications(),
    getStats(),
  ]);

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
            Programas
          </a>
          <a href="#continua" className="text-sm font-bold hover:text-[#8C0303]">
            Educación continua
          </a>
          <a href="#comunidad" className="text-sm font-bold hover:text-[#8C0303]">
            Comunidad
          </a>
          <a href="#informacion" className="text-sm font-bold hover:text-[#8C0303]">
            Información
          </a>
          <a
            href="#registro"
            className="rounded-full border-[3px] px-5 py-2.5 text-sm font-bold text-white uppercase transition hover:-translate-y-0.5"
            style={{ background: RED, borderColor: INK, boxShadow: softShadow(INK) }}
          >
            Certifícate gratis
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
          className="absolute top-8 right-14 z-10 flex h-30 w-30 flex-col items-center justify-center rounded-full border-4 text-center max-md:hidden"
          style={{ borderColor: INK, background: CREAM, transform: "rotate(-8deg)", boxShadow: softShadow(BLUE) }}
        >
          <div
            className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-dashed"
            style={{ borderColor: RED }}
          >
            <span className="text-[10px] font-bold tracking-[0.1em]" style={{ color: BLUE }}>
              EST. · FLORIDA
            </span>
            <span className="mt-1 text-xs" style={{ fontFamily: DISPLAY, color: RED }}>
              IA
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
            ★ Educación superior IA-Native · Florida ★
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1
            className="mx-auto mb-6 max-w-260 text-[50px] leading-[1.1] uppercase max-md:text-[30px]"
            style={{ fontFamily: DISPLAY, color: INK }}
          >
            La universidad que se{" "}
            <span style={{ color: RED }}>rediseñó alrededor de la IA</span>, no al revés.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mb-9 max-w-140 text-lg leading-[1.6] font-medium">
            KUN University AI forma profesionales en Salud, Tecnología, Negocios y Medios
            Digitales con un currículo que se actualiza a la velocidad de la ciencia, no de los
            semestres.
          </p>
        </Reveal>

        <Reveal delay={240} className="mb-16 flex justify-center gap-4 max-md:flex-col">
          <a
            href="#programas"
            className="rounded-full border-[3px] px-7.5 py-4 text-sm font-bold text-white uppercase transition hover:-translate-y-0.5"
            style={{ background: BLUE, borderColor: INK, boxShadow: softShadow(INK) }}
          >
            Explora los programas →
          </a>
          <a
            href="#continua"
            className="rounded-full border-[3px] px-7.5 py-4 text-sm font-bold uppercase transition hover:-translate-y-0.5"
            style={{ background: CREAM, borderColor: INK, boxShadow: softShadow(RED) }}
          >
            Certifícate gratis en 40 horas
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
            <StatBlock value={stats.schools} label="Escuelas" bg={BLUE} text={CREAM} />
            <StatBlock value={stats.programs} label="Programas" bg={CREAM} text={INK} />
            <StatBlock value={stats.certifications} label="Certif. IA" bg={RED} text={CREAM} />
            <StatBlock value={`${stats.online}%`} label="Online" bg={TEAL} text={INK} />
          </Reveal>
        </div>
      </div>

      {/* CHECKERED DIVIDER */}
      <div aria-hidden className="retro-checker animate-checker-scroll h-5 border-y-4" style={{ borderColor: INK }} />

      {/* IDENTIDAD */}
      <div className="mx-auto max-w-300 px-14 py-20 max-md:px-6">
        <Reveal className="mb-14 text-center">
          <div className="mb-3 text-xs font-bold tracking-[0.14em] uppercase" style={{ color: RED }}>
            ★ Identidad estratégica ★
          </div>
          <h2 className="mx-auto max-w-160 text-3xl uppercase" style={{ fontFamily: DISPLAY, color: BLUE }}>
            No enseñamos lo que se enseñaba hace cinco años
          </h2>
        </Reveal>
        <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1">
          {[
            {
              title: "Conocimiento de frontera, fácil de usar",
              body: "Hacemos que el conocimiento más avanzado del mundo sea fácil de entender y de aplicar — sin importar de dónde vengas.",
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
              title: "Un currículo vivo, no un plan fijo",
              body: "Programas diseñados y actualizados con IA, validados por criterio experto humano. Cuando cambia la industria, el curso cambia con ella.",
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
              title: "Comunidad antes que matrícula",
              body: "Certifícate en competencias reales desde el primer día, con o sin título. El valor se demuestra antes de pedirte que te matricules.",
              ring: BLUE,
              rotate: -2,
              icon: (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="1.6">
                  <path d="M4 19.5V6a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0 0 4h13" />
                </svg>
              ),
            },
          ].map((card, i) => (
            <Reveal
              key={card.title}
              delay={i * 120}
              className="text-center transition hover:-translate-y-1.5"
              style={{ transform: `rotate(${card.rotate}deg)` }}
            >
              <div
                className="relative mx-auto mb-5 flex h-27 w-24 items-center justify-center border-3"
                style={{
                  borderColor: INK,
                  background: card.ring,
                  boxShadow: softShadow(card.ring),
                  clipPath: "polygon(50% 0%, 100% 18%, 100% 65%, 50% 100%, 0% 65%, 0% 18%)",
                }}
              >
                <div
                  aria-hidden
                  className="absolute top-2.5 h-1 w-9 rounded-full"
                  style={{ background: "rgba(255,255,255,0.5)" }}
                />
                {card.icon}
              </div>
              <div className="mb-2.5 text-base font-bold" style={{ color: BLUE }}>
                {card.title}
              </div>
              <div className="mx-auto max-w-70 text-sm leading-[1.65]" style={{ color: "#5A4E40" }}>
                {card.body}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={360} className="mt-12 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full border-[3px] px-7.5 py-4 text-sm font-bold text-white uppercase transition hover:-translate-y-0.5"
            style={{ background: BLUE, borderColor: INK, boxShadow: softShadow(INK) }}
          >
            Agenda una asesoría gratuita
          </a>
        </Reveal>
      </div>

      {/* GALERÍA (marcadores de foto estilo postal) */}
      <div className="mx-auto max-w-300 px-14 pb-20 max-md:px-6">
        <Reveal className="mb-9 flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-xl uppercase" style={{ fontFamily: DISPLAY, color: BLUE }}>
            La vida en KUN
          </h3>
          <span className="text-sm font-medium" style={{ color: "#8a7a63" }}>
            (ilustraciones mientras sumamos fotos reales del campus)
          </span>
        </Reveal>
        <div className="flex flex-wrap items-start gap-7 max-md:justify-center">
          {[
            { label: "Campus", accent: BLUE, rotate: -3, icon: <CampusIllustration accent={BLUE} /> },
            { label: "Estudiantes", accent: RED, rotate: 2, icon: <StudentsIllustration accent={RED} /> },
            { label: "Comunidad", accent: BLUE, rotate: -2, icon: <CommunityIllustration accent={BLUE} /> },
            {
              label: "Equipo docente",
              accent: RED,
              rotate: 3,
              hideOnMobile: true,
              icon: <FacultyIllustration accent={RED} />,
            },
          ].map((p, i) => (
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
              Cuatro escuelas.{" "}
              <span style={{ color: TEAL }}>Un mismo motor IA-Native.</span>
            </h2>
          </Reveal>
          <FanStack
            items={schools.map(
              (school, i): FanItem => ({
                id: school.slug,
                eyebrow: school.programs.map((p) => p.degree).join(" · "),
                title: school.name.replace("Escuela de ", ""),
                description: school.tagline,
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
              Quiero información de mi escuela
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
            Así se construye un curso en KUN
          </h2>
        </Reveal>
        <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1">
          {[
            { n: "1", title: "LA IA RASTREA LA FRONTERA", body: "Nuestros agentes de IA monitorean lo último que publica la ciencia, la industria y la regulación en cada campo que enseñamos." },
            { n: "2", title: "EL CRITERIO HUMANO DECIDE", body: "Nuestro equipo académico experto revisa, valida y da forma al contenido. La IA propone, las personas deciden." },
            { n: "3", title: "APRENDES LO QUE EL MERCADO NECESITA HOY", body: "No lo que se enseñaba hace cinco años. Aprendes las competencias que las empresas buscan hoy." },
          ].map((step, i) => (
            <Reveal key={step.n} delay={i * 120} className="text-center">
              <div
                className="mx-auto mb-5 flex h-24 w-22 items-center justify-center border-4 text-3xl text-white"
                style={{
                  fontFamily: DISPLAY,
                  borderColor: INK,
                  background: i % 2 === 0 ? BLUE : RED,
                  clipPath: "polygon(50% 0%, 100% 22%, 100% 100%, 0% 100%, 0% 22%)",
                  boxShadow: softShadow(INK),
                }}
              >
                {step.n}
              </div>
              <div className="mb-2 text-sm font-bold" style={{ color: BLUE }}>
                {step.title}
              </div>
              <div className="mx-auto max-w-70 text-[13px] leading-[1.65]" style={{ color: "#5A4E40" }}>
                {step.body}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={360} className="mt-12 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full border-[3px] px-7.5 py-4 text-sm font-bold text-white uppercase transition hover:-translate-y-0.5"
            style={{ background: BLUE, borderColor: INK, boxShadow: softShadow(INK) }}
          >
            Habla con admisiones
          </a>
        </Reveal>
      </div>

      {/* EDUCACIÓN CONTINUA */}
      <div id="continua" className="mx-auto max-w-300 px-14 pb-20 max-md:px-6">
        <Reveal className="mb-14 text-center">
          <h2 className="mb-2 text-3xl uppercase" style={{ fontFamily: DISPLAY, color: BLUE }}>
            No tienes que esperar a graduarte
          </h2>
          <p className="mx-auto max-w-120 text-sm font-medium" style={{ color: "#5A4E40" }}>
            Seis certificaciones de 36 a 40 horas, diseñadas para aplicar lo aprendido desde la
            primera semana.
          </p>
        </Reveal>
        <AccordionShowcase
          items={certifications.map(
            (cert, i): AccordionItem => ({
              id: cert.slug,
              eyebrow: `${cert.hours}h · 100% online`,
              title: cert.name,
              description: cert.description,
              accent: i % 2 === 0 ? BLUE : RED,
            }),
          )}
          autoRotateMs={3800}
          theme={{
            fontDisplay: DISPLAY,
            ink: INK,
            mutedText: "#5A4E40",
            border: INK,
            shape: "rounded-xl",
          }}
        />
        <Reveal className="mt-10 text-center">
          <a
            href="#informacion"
            className="inline-block rounded-full border-[3px] px-7.5 py-4 text-sm font-bold text-white uppercase transition hover:-translate-y-0.5"
            style={{ background: RED, borderColor: INK, boxShadow: softShadow(INK) }}
          >
            Inscríbete a una certificación
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
            Sin compromiso
          </span>
          <h2 className="text-3xl uppercase" style={{ fontFamily: DISPLAY, color: BLUE }}>
            ¿Quieres que te contemos más?
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
              Antes de matricularte, síguenos
            </h2>
            <p className="mx-auto mb-7 max-w-120 text-sm font-medium opacity-90">
              El valor se demuestra antes de pedirte que pagues por él. Clases abiertas y
              conversaciones con expertos, sin matrícula.
            </p>
            <a
              href="#"
              className="inline-block rounded-full border-[3px] px-7 py-3.5 text-sm font-bold uppercase transition hover:-translate-y-0.5 active:-translate-y-0.5"
              style={{ background: CREAM, color: INK, borderColor: INK }}
            >
              Únete a la comunidad
            </a>
          </div>
        </Reveal>

        <div id="comunidad" className="mb-10 grid grid-cols-2 gap-6 max-md:grid-cols-1">
          <SealCard
            label="Florida CIE"
            detail="Comisión de Educación Independiente"
            accent={BLUE}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            }
          />
          <SealCard
            label="SACSCOC · En proceso"
            detail="Acreditación institucional en avance"
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
          <div className="text-[13px] font-semibold">
            © 2026 KUN University AI 
          </div>
          <div className="flex gap-5">
            <a href="#" className="text-[13px] font-bold hover:text-[#8C0303]">YouTube</a>
            <a href="#" className="text-[13px] font-bold hover:text-[#8C0303]">LinkedIn</a>
            <a href="#" className="text-[13px] font-bold hover:text-[#8C0303]">Instagram</a>
            <a href="#" className="text-[13px] font-bold hover:text-[#8C0303]">X</a>
          </div>
        </div>
      </div>

      <ScrollToTop bg="#03318C" />
      <MobileTabBar bg="#FFFFFF" ink="#03318C" border="#D8DADC" />
      <ModelSwitcher current={2} />
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
