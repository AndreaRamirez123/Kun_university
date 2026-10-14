"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, usePick, type Dict } from "@/i18n/locale-context";
import type { Certification, School, Stats } from "@/lib/types";
import type { ZoneDef } from "./campus-zones";
import { ADMISSIONS_EMAIL } from "@/lib/contact";

// Tablero del aula, al estilo de las interfaces de Active Theory: vidrio oscuro,
// esquinas de HUD, secciones numeradas, títulos que se "descifran" letra por
// letra y una leve inclinación 3D que sigue al mouse. Reúne toda la información
// que en los modelos 1–3 vivía en secciones sueltas de la página.

// ---------------------------------------------------------------- textos

const COMMON = {
  es: {
    classroom: "Aula virtual",
    florida: "Florida, EE. UU.",
    online: "100% online",
    miamiTime: "Hora en Miami",
    exit: "Salir al campus",
    requestInfo: "Solicitar información",
    advising: "Agendar asesoría gratuita",
    credits: "créditos",
    semesters: (n: number) => `${n} semestres`,
    semester: (n: number) => `Semestre ${n}`,
    comingSoon: "El plan de materias de este programa se publicará próximamente.",
    seePlan: "Ver plan de estudios →",
    heroTitle: "La universidad que se rediseñó alrededor de la IA, no al revés.",
    heroBody:
      "KUN University AI forma profesionales en Salud, Tecnología, Negocios y Medios Digitales con un currículo que se actualiza a la velocidad de la ciencia, no de los semestres.",
    statSchools: "Escuelas",
    statPrograms: "Programas",
    statCerts: "Certif. IA",
    statOnline: "Online / Global",
    floridaNote:
      "Una universidad IA-Native con sede en Florida. El aula es virtual: estudias 100% online, desde cualquier lugar del mundo y a tu ritmo.",
    pillarsTitle: "No enseñamos lo que se enseñaba hace cinco años",
    pillars: [
      ["Conocimiento de frontera, fácil de usar", "Hacemos que el conocimiento más avanzado del mundo sea fácil de entender y de aplicar — sin importar de dónde vengas."],
      ["Un currículo vivo, no un plan fijo", "Programas diseñados y actualizados con IA, validados por criterio experto humano. Cuando cambia la industria, el curso cambia con ella."],
      ["Comunidad antes que matrícula", "Certifícate en competencias reales desde el primer día, con o sin título. El valor se demuestra antes de pedirte que te matricules."],
    ],
    engineTitle: "Así se construye un curso en KUN",
    engine: [
      ["La IA rastrea la frontera", "Nuestros agentes de IA monitorean lo último que publica la ciencia, la industria y la regulación en cada campo que enseñamos."],
      ["El criterio humano decide", "Nuestro equipo académico experto revisa, valida y da forma al contenido. La IA propone, las personas deciden."],
      ["Aprendes lo que el mercado necesita hoy", "No lo que se enseñaba hace cinco años. Aprendes las competencias que las empresas buscan hoy."],
    ],
    accTitle: "Acreditación y licencias",
    acc: [
      ["Florida CIE", "Comisión de Educación Independiente"],
      ["SACSCOC · En proceso", "Acreditación institucional en avance"],
    ],
    communityTitle: "Antes de matricularte, síguenos",
    communityBody:
      "El valor se demuestra antes de pedirte que pagues por él. Clases abiertas y conversaciones con expertos, sin matrícula.",
    lifeTitle: "La vida en KUN",
    life: ["Campus", "Estudiantes", "Comunidad", "Equipo docente"],
    contactTitle: "¿Quieres que te contemos más?",
    contactBody: "Te contamos todo sobre programas, becas y fechas de inicio. Sin compromiso.",
    writeUs: "Escríbenos a admisiones",
    certsTitle: "No tienes que esperar a graduarte",
    certsBody: (n: number) =>
      `${n} certificaciones de 36 a 40 horas, diseñadas para aplicar lo aprendido desde la primera semana.`,
    hours: (h: number) => `${h} horas · 100% online`,
    enrollCert: "Inscríbete a una certificación",
    launch: "Despegar el cohete",
    schoolsTitle: "Cuatro escuelas. Un mismo motor IA-Native.",
    schoolsBody:
      "Cada programa se rediseña continuamente con IA y expertos humanos para reflejar lo que la industria necesita hoy.",
    tagline: "La universidad IA-Native. Rediseñada alrededor de la inteligencia artificial, no al revés.",
  },
  en: {
    classroom: "Virtual classroom",
    florida: "Florida, USA",
    online: "100% online",
    miamiTime: "Miami time",
    exit: "Back to campus",
    requestInfo: "Request information",
    advising: "Book a free advising session",
    credits: "credits",
    semesters: (n: number) => `${n} semesters`,
    semester: (n: number) => `Semester ${n}`,
    comingSoon: "This program's course plan will be published soon.",
    seePlan: "View course plan →",
    heroTitle: "The university that redesigned itself around AI, not the other way around.",
    heroBody:
      "KUN University AI trains professionals in Health, Technology, Business and Digital Media with a curriculum that updates at the speed of science, not of semesters.",
    statSchools: "Schools",
    statPrograms: "Programs",
    statCerts: "AI Certs.",
    statOnline: "Online / Global",
    floridaNote:
      "An AI-Native university based in Florida. The classroom is virtual: you study 100% online, from anywhere in the world, at your own pace.",
    pillarsTitle: "We don't teach what was taught five years ago",
    pillars: [
      ["Frontier knowledge, made easy to use", "We make the world's most advanced knowledge easy to understand and apply — no matter where you come from."],
      ["A living curriculum, not a fixed plan", "Programs designed and updated with AI, validated by expert human judgment. When the industry changes, the course changes with it."],
      ["Community before enrollment", "Get certified in real-world skills from day one, with or without a degree. The value is proven before we ask you to enroll."],
    ],
    engineTitle: "This is how a KUN course gets built",
    engine: [
      ["AI tracks the frontier", "Our AI agents monitor the latest published science, industry and regulation in every field we teach."],
      ["Human judgment decides", "Our expert academic team reviews, validates and shapes the content. AI proposes, people decide."],
      ["You learn what the market needs today", "Not what was taught five years ago. You learn the skills companies are looking for today."],
    ],
    accTitle: "Accreditation and licensing",
    acc: [
      ["Florida CIE", "Commission for Independent Education"],
      ["SACSCOC · In progress", "Institutional accreditation underway"],
    ],
    communityTitle: "Before you enroll, follow us",
    communityBody:
      "The value is proven before we ask you to pay for it. Open classes and conversations with experts, no enrollment required.",
    lifeTitle: "Life at KUN",
    life: ["Campus", "Students", "Community", "Faculty"],
    contactTitle: "Want to hear more?",
    contactBody: "We'll tell you everything about programs, scholarships and start dates. No commitment.",
    writeUs: "Email admissions",
    certsTitle: "You don't have to wait until you graduate",
    certsBody: (n: number) => `${n} certifications of 36 to 40 hours, designed so you apply what you learn from the first week.`,
    hours: (h: number) => `${h} hours · 100% online`,
    enrollCert: "Enroll in a certification",
    launch: "Launch the rocket",
    schoolsTitle: "Four schools. One AI-Native engine.",
    schoolsBody: "Every program is continuously redesigned with AI and human experts to reflect what industry needs today.",
    tagline: "The AI-Native university. Redesigned around artificial intelligence, not the other way around.",
  },
};

const TABS: Record<ZoneDef["kind"], Dict<string[]>> = {
  school: {
    es: ["Resumen", "Programas", "Plan de estudios", "Cómo aprendes", "Admisión"],
    en: ["Overview", "Programs", "Course plan", "How you learn", "Admission"],
  },
  curriculum: {
    es: ["Manifiesto", "Cómo se construye", "Pilares", "Escuelas"],
    en: ["Manifesto", "How it's built", "Pillars", "Schools"],
  },
  certifications: {
    es: ["Certificaciones", "Por qué ahora"],
    en: ["Certifications", "Why now"],
  },
  admissions: {
    es: ["Bienvenida", "Acreditación", "Comunidad", "Contacto"],
    en: ["Welcome", "Accreditation", "Community", "Contact"],
  },
};

const KICKER: Record<ZoneDef["kind"], Dict<string>> = {
  school: { es: "Escuela", en: "School" },
  curriculum: { es: "Centro del campus", en: "Heart of the campus" },
  certifications: { es: "Educación continua", en: "Continuing education" },
  admissions: { es: "Edificio principal", en: "Main building" },
};

// Qué significa cada sigla de título, para quien no conoce el sistema de EE. UU.
const DEGREES: Record<string, Dict<string>> = {
  AAS: { es: "Grado asociado en Ciencias Aplicadas", en: "Associate of Applied Science" },
  BS: { es: "Licenciatura · Bachelor of Science", en: "Bachelor of Science" },
  MS: { es: "Maestría · Master of Science", en: "Master of Science" },
  MSAIE: { es: "Maestría en Ingeniería de Inteligencia Artificial", en: "Master of Science in AI Engineering" },
  MSME: { es: "Maestría en Gestión y Emprendimiento", en: "Master of Science in Management and Entrepreneurship" },
  MFA: { es: "Maestría en Bellas Artes · Master of Fine Arts", en: "Master of Fine Arts" },
};

// ---------------------------------------------------------------- piezas

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";

/** Texto que se "descifra" con caracteres aleatorios antes de asentarse. */
function Scramble({ text, className }: { text: string; className?: string }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setOut(text));
      return () => cancelAnimationFrame(id);
    }
    const start = performance.now();
    const duration = Math.min(1100, 350 + text.length * 22);
    let raf = 0;
    function tick(now: number) {
      const p = Math.min(1, (now - start) / duration);
      const settled = Math.floor(p * text.length);
      let s = text.slice(0, settled);
      for (let i = settled; i < text.length; i++) {
        s += text[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}

function MiamiClock() {
  const { locale } = useLocale();
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(locale === "es" ? "es-CO" : "en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
    });
    const update = () => setTime(fmt.format(new Date()));
    const first = window.setTimeout(update, 0);
    const id = window.setInterval(update, 15000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [locale]);
  return <span className="tabular-nums">{time}</span>;
}

function Corners({ color }: { color: string }) {
  const base = "pointer-events-none absolute h-5 w-5 border-solid";
  return (
    <>
      <span aria-hidden className={`${base} top-3 left-3 border-t-2 border-l-2`} style={{ borderColor: color }} />
      <span aria-hidden className={`${base} top-3 right-3 border-t-2 border-r-2`} style={{ borderColor: color }} />
      <span aria-hidden className={`${base} bottom-3 left-3 border-b-2 border-l-2`} style={{ borderColor: color }} />
      <span aria-hidden className={`${base} right-3 bottom-3 border-r-2 border-b-2`} style={{ borderColor: color }} />
    </>
  );
}

/** Entrada escalonada: mismas clases que <Reveal>, con su versión reducida. */
function In({ i, children, className = "" }: { i: number; children: React.ReactNode; className?: string }) {
  return (
    <div className={`reveal-animate ${className}`} style={{ animationDelay: `${120 + i * 70}ms` }}>
      {children}
    </div>
  );
}

function SectionTitle({ n, children }: { n: number; children: string }) {
  return (
    <div className="mb-1">
      <div className="mb-2 font-mono text-[11px] tracking-[0.25em] text-white/45">{String(n).padStart(2, "0")} /</div>
      <h3 className="m-0 font-(family-name:--font-gabarito) text-[28px] leading-[1.05] font-black text-[#FFF3E6] max-md:text-2xl">
        <Scramble text={children} />
      </h3>
    </div>
  );
}

function Btn({
  children,
  onClick,
  primary,
  color,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-12 cursor-pointer overflow-hidden rounded-full border px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5"
      style={
        primary
          ? { background: color, borderColor: color, color: "#fff" }
          : { borderColor: "rgba(255,255,255,0.25)", color: "#FFF3E6" }
      }
    >
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 transition-[left] duration-700 group-hover:left-[120%]"
      />
    </button>
  );
}

function StatTile({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
      <div className="font-(family-name:--font-gabarito) text-3xl leading-none font-black" style={{ color }}>
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[10px] tracking-[0.16em] text-white/55 uppercase">{label}</div>
    </div>
  );
}

function NumberedList({ items, color }: { items: string[][]; color: string }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0">
      {items.map(([head, body], i) => (
        <li key={head} className="reveal-animate flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4" style={{ animationDelay: `${200 + i * 90}ms` }}>
          <span className="font-mono text-sm font-bold" style={{ color }}>
            {["I", "II", "III", "IV"][i]}
          </span>
          <span>
            <b className="block font-(family-name:--font-gabarito) text-lg leading-snug text-[#FFF3E6]">{head}</b>
            <span className="text-[14px] leading-relaxed text-white/65">{body}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

// ---------------------------------------------------------------- tablero

export type BoardActions = {
  onExit: () => void;
  onRequestInfo: (program?: string) => void;
  onLaunch: () => void;
};

export function CampusBoard({
  zone,
  schools,
  certifications,
  stats,
  actions,
}: {
  zone: ZoneDef;
  schools: School[];
  certifications: Certification[];
  stats: Stats;
  actions: BoardActions;
}) {
  const t = usePick(COMMON);
  const { locale } = useLocale();
  const tabs = TABS[zone.kind][locale];
  const [tab, setTab] = useState(0);
  const [programIndex, setProgramIndex] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const c = zone.color;
  const school = zone.schoolSlug ? schools.find((s) => s.slug === zone.schoolSlug) : undefined;

  // Inclinación 3D sutil que sigue al mouse (solo con puntero fino).
  useEffect(() => {
    const el = panel.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    function move(e: PointerEvent) {
      if (!el) return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      el.style.transform = `perspective(1800px) rotateY(${-x * 4}deg) rotateX(${y * 3}deg)`;
    }
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  function go(i: number) {
    setTab(i);
    scroller.current?.scrollTo({ top: 0 });
  }

  let content: React.ReactNode = null;
  const programs = school?.programs ?? [];
  const program = programs[Math.min(programIndex, Math.max(0, programs.length - 1))];

  if (zone.kind === "school" && school) {
    if (tab === 0) {
      const degrees = [...new Set(programs.map((p) => p.degree))];
      content = (
        <>
          <SectionTitle n={1}>{school.name[locale]}</SectionTitle>
          <In i={0}>
            <p className="m-0 text-lg leading-relaxed text-white/80 italic">{school.tagline[locale]}</p>
          </In>
          <In i={1} className="grid grid-cols-3 gap-3 max-sm:grid-cols-2">
            <StatTile value={String(programs.length)} label={t.statPrograms} color={c} />
            <StatTile value={String(degrees.length)} label={locale === "es" ? "Tipos de título" : "Degree types"} color={c} />
            <StatTile value="100%" label={t.statOnline} color={c} />
          </In>
          <In i={2} className="flex flex-wrap gap-2">
            {degrees.map((d) => (
              <span key={d} className="rounded-full border px-3 py-1 font-mono text-[11px] font-bold tracking-wider" style={{ borderColor: c, color: "#FFF3E6" }}>
                {d}
              </span>
            ))}
          </In>
          <In i={3}>
            <p className="m-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[14px] leading-relaxed text-white/70">
              {t.floridaNote}
            </p>
          </In>
          <In i={4} className="flex flex-wrap gap-2.5">
            <Btn primary color={c} onClick={() => go(1)}>
              {tabs[1]} →
            </Btn>
            <Btn color={c} onClick={() => actions.onRequestInfo(programs[0]?.name)}>
              {t.requestInfo}
            </Btn>
          </In>
        </>
      );
    } else if (tab === 1) {
      content = (
        <>
          <SectionTitle n={2}>{tabs[1]}</SectionTitle>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            {programs.map((p, i) => (
              <In key={p.name} i={i}>
                <div className="flex h-full flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/30">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold text-white" style={{ background: c }}>
                      {p.degree}
                    </span>
                    <span className="font-mono text-[11px] text-white/50">
                      {p.totalCredits} {t.credits}
                    </span>
                  </div>
                  <div className="font-(family-name:--font-gabarito) text-lg leading-snug font-extrabold text-[#FFF3E6]">{p.name}</div>
                  <div className="text-[12px] text-white/55">
                    {DEGREES[p.degree]?.[locale] ?? p.degree}
                    {p.semesters?.length ? ` · ${t.semesters(p.semesters.length)}` : ""}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProgramIndex(i);
                      go(2);
                    }}
                    className="mt-auto cursor-pointer self-start pt-1 text-[13px] font-bold hover:underline"
                    style={{ color: c }}
                  >
                    {t.seePlan}
                  </button>
                </div>
              </In>
            ))}
          </div>
        </>
      );
    } else if (tab === 2) {
      content = (
        <>
          <SectionTitle n={3}>{tabs[2]}</SectionTitle>
          <In i={0} className="flex flex-wrap gap-2">
            {programs.map((p, i) => (
              <button
                key={p.name}
                type="button"
                aria-pressed={p === program}
                onClick={() => setProgramIndex(i)}
                className="cursor-pointer rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition"
                style={
                  p === program
                    ? { background: c, borderColor: c, color: "#fff" }
                    : { borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,243,230,0.75)" }
                }
              >
                {p.degree} · {p.name}
              </button>
            ))}
          </In>
          {program && (
            <div key={program.name} className="flex flex-col gap-3">
              <In i={1} className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-(family-name:--font-gabarito) text-xl font-extrabold text-[#FFF3E6]">{program.name}</div>
                <div className="font-mono text-xs text-white/55">
                  {program.degree} · {program.totalCredits} {t.credits}
                </div>
              </In>
              {program.semesters?.length ? (
                <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                  {program.semesters.map((sem, i) => (
                    <In key={sem.number} i={i + 2}>
                      <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="mb-2.5 flex items-center justify-between font-mono text-[11px] font-bold tracking-wider uppercase" style={{ color: c }}>
                          <span>{t.semester(sem.number)}</span>
                          <span>
                            {sem.courses.reduce((s, x) => s + x.credits, 0)} cr
                          </span>
                        </div>
                        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                          {sem.courses.map((course) => (
                            <li key={course.code} className="flex items-start justify-between gap-3 text-[12.5px] leading-snug">
                              <span>
                                <span className="font-mono text-white/45">{course.code}</span>{" "}
                                <span className="text-white/85">{course.title}</span>
                              </span>
                              <span className="shrink-0 font-mono text-white/50">{course.credits}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </In>
                  ))}
                </div>
              ) : (
                <In i={2}>
                  <p className="m-0 rounded-2xl border border-dashed border-white/20 p-5 text-sm text-white/65">{t.comingSoon}</p>
                </In>
              )}
            </div>
          )}
        </>
      );
    } else if (tab === 3) {
      content = (
        <>
          <SectionTitle n={4}>{t.engineTitle}</SectionTitle>
          <NumberedList items={t.engine} color={c} />
          <div className="mt-3 font-mono text-[11px] tracking-[0.2em] text-white/45 uppercase">{t.pillarsTitle}</div>
          <NumberedList items={t.pillars} color={c} />
        </>
      );
    } else {
      content = <AdmissionContent n={5} color={c} actions={actions} program={programs[0]?.name} />;
    }
  } else if (zone.kind === "curriculum") {
    if (tab === 0) {
      content = <ManifestoContent color={c} stats={stats} />;
    } else if (tab === 1) {
      content = (
        <>
          <SectionTitle n={2}>{t.engineTitle}</SectionTitle>
          <NumberedList items={t.engine} color={c} />
        </>
      );
    } else if (tab === 2) {
      content = (
        <>
          <SectionTitle n={3}>{t.pillarsTitle}</SectionTitle>
          <NumberedList items={t.pillars} color={c} />
        </>
      );
    } else {
      content = (
        <>
          <SectionTitle n={4}>{t.schoolsTitle}</SectionTitle>
          <In i={0}>
            <p className="m-0 text-[15px] leading-relaxed text-white/70">{t.schoolsBody}</p>
          </In>
          <div className="flex flex-col gap-2.5">
            {schools.map((s, i) => (
              <In key={s.slug} i={i + 1}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="font-(family-name:--font-gabarito) text-lg font-extrabold text-[#FFF3E6]">{s.name[locale]}</div>
                  <div className="text-[13px] text-white/60">{s.tagline[locale]}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.programs.map((p) => (
                      <span key={p.name} className="rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] text-white/70">
                        {p.degree} · {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              </In>
            ))}
          </div>
        </>
      );
    }
  } else if (zone.kind === "certifications") {
    if (tab === 0) {
      content = (
        <>
          <SectionTitle n={1}>{tabs[0]}</SectionTitle>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            {certifications.map((cert, i) => (
              <In key={cert.slug} i={i}>
                <div className="flex h-full flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="font-mono text-[11px] font-bold tracking-wider uppercase" style={{ color: c }}>
                    {t.hours(cert.hours)}
                  </div>
                  <div className="font-(family-name:--font-gabarito) text-lg leading-snug font-extrabold text-[#FFF3E6]">{cert.name}</div>
                  <div className="text-[13px] leading-relaxed text-white/65">{cert.description[locale]}</div>
                </div>
              </In>
            ))}
          </div>
          <In i={certifications.length} className="flex flex-wrap gap-2.5">
            <Btn primary color={c} onClick={() => actions.onRequestInfo()}>
              {t.enrollCert}
            </Btn>
            <Btn color={c} onClick={actions.onLaunch}>
              {t.launch}
            </Btn>
          </In>
        </>
      );
    } else {
      content = (
        <>
          <SectionTitle n={2}>{t.certsTitle}</SectionTitle>
          <In i={0}>
            <p className="m-0 text-lg leading-relaxed text-white/80">{t.certsBody(certifications.length)}</p>
          </In>
          <In i={1} className="grid grid-cols-3 gap-3 max-sm:grid-cols-2">
            <StatTile value={String(certifications.length)} label={t.statCerts} color={c} />
            <StatTile value="36–40h" label={locale === "es" ? "Por certificación" : "Per certification"} color={c} />
            <StatTile value="100%" label={t.statOnline} color={c} />
          </In>
          <NumberedList items={[t.pillars[2]]} color={c} />
          <In i={3} className="flex flex-wrap gap-2.5">
            <Btn primary color={c} onClick={() => actions.onRequestInfo()}>
              {t.enrollCert}
            </Btn>
          </In>
        </>
      );
    }
  } else {
    if (tab === 0) content = <ManifestoContent color={c} stats={stats} />;
    else if (tab === 1) content = <AccreditationContent n={2} color={c} />;
    else if (tab === 2) content = <CommunityContent n={3} color={c} />;
    else content = <AdmissionContent n={4} color={c} actions={actions} />;
  }

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="false"
      aria-labelledby="board-title"
      className="reveal-animate-right absolute top-[calc(24px+env(safe-area-inset-top,0px))] right-6 bottom-24 z-30 flex w-[min(780px,58vw)] flex-col overflow-hidden rounded-[28px] border border-white/12 bg-[#0E061E]/78 text-[#FFF3E6] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-transform duration-300 ease-out max-md:top-[36%] max-md:right-0 max-md:bottom-0 max-md:left-0 max-md:w-auto max-md:rounded-b-none"
      style={{ animationDelay: "120ms" }}
    >
      <Corners color={c} />
      {/* Barra superior tipo HUD */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-7 pt-6 pb-4 max-md:px-5 max-md:pt-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.22em] text-white/50 uppercase">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: c }} />
              {t.classroom}
            </span>
            <span>{t.florida}</span>
            <span className="max-sm:hidden">{t.online}</span>
            <span className="max-sm:hidden">
              {t.miamiTime} <MiamiClock />
            </span>
          </div>
          <h2 id="board-title" className="m-0 mt-2 truncate font-(family-name:--font-gabarito) text-[15px] font-extrabold" style={{ color: c }}>
            {KICKER[zone.kind][locale]} · {school ? school.name[locale] : zone.label[locale]}
          </h2>
        </div>
        <button
          type="button"
          onClick={actions.onExit}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-bold transition hover:bg-white/10"
        >
          <span aria-hidden>←</span> {t.exit}
          <kbd className="rounded border border-white/25 px-1.5 font-mono text-[10px] max-md:hidden">Esc</kbd>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 max-md:flex-col">
        {/* Navegación numerada */}
        <nav
          aria-label={KICKER[zone.kind][locale]}
          className="flex w-48 shrink-0 flex-col gap-1 border-r border-white/10 px-4 py-5 max-md:w-auto max-md:flex-row max-md:overflow-x-auto max-md:border-r-0 max-md:border-b max-md:px-4 max-md:py-3"
        >
          {tabs.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-current={tab === i ? "true" : undefined}
              onClick={() => go(i)}
              className={`group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold whitespace-nowrap transition ${
                tab === i ? "bg-white/[0.07] text-[#FFF3E6]" : "text-white/55 hover:text-[#FFF3E6]"
              }`}
            >
              <span className="font-mono text-[10px]" style={{ color: tab === i ? c : undefined }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {label}
              <span
                aria-hidden
                className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full transition-opacity max-md:top-auto max-md:bottom-0 max-md:left-3 max-md:h-[3px] max-md:w-5 max-md:translate-y-0"
                style={{ background: c, opacity: tab === i ? 1 : 0 }}
              />
            </button>
          ))}
          <div className="mt-auto hidden pt-6 pb-6 pl-2 font-mono text-[10px] leading-relaxed tracking-wider text-white/35 md:block">{t.tagline}</div>
        </nav>

        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-7 py-6 max-md:px-5">
          <div key={`${zone.id}-${tab}-${locale}`} className="flex flex-col gap-4 pb-4">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- bloques compartidos

function ManifestoContent({ color, stats }: { color: string; stats: Stats }) {
  const t = usePick(COMMON);
  return (
    <>
      <SectionTitle n={1}>{t.heroTitle}</SectionTitle>
      <In i={0}>
        <p className="m-0 text-[16px] leading-relaxed text-white/75">{t.heroBody}</p>
      </In>
      <In i={1} className="grid grid-cols-4 gap-3 max-sm:grid-cols-2">
        <StatTile value={String(stats.schools)} label={t.statSchools} color={color} />
        <StatTile value={String(stats.programs)} label={t.statPrograms} color={color} />
        <StatTile value={String(stats.certifications)} label={t.statCerts} color={color} />
        <StatTile value={`${stats.online}%`} label={t.statOnline} color={color} />
      </In>
      <In i={2}>
        <p className="m-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[14px] leading-relaxed text-white/70">{t.floridaNote}</p>
      </In>
    </>
  );
}

function AccreditationContent({ n, color }: { n: number; color: string }) {
  const t = usePick(COMMON);
  return (
    <>
      <SectionTitle n={n}>{t.accTitle}</SectionTitle>
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        {t.acc.map(([head, sub], i) => (
          <In key={head} i={i}>
            <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2" style={{ borderColor: color }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2">
                  {i === 0 ? <path d="M20 6L9 17l-5-5" /> : <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>}
                </svg>
              </span>
              <span>
                <b className="block text-[15px] text-[#FFF3E6]">{head}</b>
                <span className="text-[13px] text-white/60">{sub}</span>
              </span>
            </div>
          </In>
        ))}
      </div>
    </>
  );
}

function CommunityContent({ n, color }: { n: number; color: string }) {
  const t = usePick(COMMON);
  return (
    <>
      <SectionTitle n={n}>{t.communityTitle}</SectionTitle>
      <In i={0}>
        <p className="m-0 text-[15px] leading-relaxed text-white/75">{t.communityBody}</p>
      </In>
      <In i={1}>
        <div className="mb-2 font-mono text-[11px] tracking-[0.2em] text-white/45 uppercase">{t.lifeTitle}</div>
        <div className="grid grid-cols-4 gap-2.5 max-sm:grid-cols-2">
          {t.life.map((label, i) => (
            <div
              key={label}
              className="flex aspect-square items-end rounded-2xl border border-white/10 p-3 text-sm font-bold text-[#FFF3E6]"
              style={{ background: `linear-gradient(160deg, ${color}${["55", "40", "30", "22"][i]}, rgba(255,255,255,0.03))` }}
            >
              {label}
            </div>
          ))}
        </div>
      </In>
    </>
  );
}

function AdmissionContent({
  n,
  color,
  actions,
  program,
}: {
  n: number;
  color: string;
  actions: BoardActions;
  program?: string;
}) {
  const t = usePick(COMMON);
  return (
    <>
      <SectionTitle n={n}>{t.contactTitle}</SectionTitle>
      <In i={0}>
        <p className="m-0 text-[15px] leading-relaxed text-white/75">{t.contactBody}</p>
      </In>
      <In i={1}>
        <a
          href={`mailto:${ADMISSIONS_EMAIL}`}
          className="group flex items-center gap-4 rounded-2xl border p-4 no-underline transition hover:-translate-y-0.5"
          style={{ borderColor: `${color}88`, background: `${color}1A` }}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: color }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block font-mono text-[10px] tracking-[0.2em] text-white/55 uppercase">{t.writeUs}</span>
            <span className="block truncate text-[16px] font-bold text-[#FFF3E6] group-hover:underline">{ADMISSIONS_EMAIL}</span>
          </span>
        </a>
      </In>
      <In i={1} className="flex flex-wrap gap-2.5">
        <Btn primary color={color} onClick={() => actions.onRequestInfo(program)}>
          {t.requestInfo}
        </Btn>
        <Btn color={color} onClick={() => actions.onRequestInfo(program)}>
          {t.advising}
        </Btn>
      </In>
      <In i={2}>
        <div className="mt-2 mb-2 font-mono text-[11px] tracking-[0.2em] text-white/45 uppercase">{t.accTitle}</div>
        <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
          {t.acc.map(([head, sub]) => (
            <div key={head} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <b className="block text-[14px] text-[#FFF3E6]">{head}</b>
              <span className="text-[12px] text-white/55">{sub}</span>
            </div>
          ))}
        </div>
      </In>
      <In i={3}>
        <div className="rounded-2xl border p-4" style={{ borderColor: `${color}66`, background: `${color}14` }}>
          <b className="block font-(family-name:--font-gabarito) text-lg text-[#FFF3E6]">{t.communityTitle}</b>
          <span className="text-[13px] leading-relaxed text-white/65">{t.communityBody}</span>
        </div>
      </In>
    </>
  );
}
