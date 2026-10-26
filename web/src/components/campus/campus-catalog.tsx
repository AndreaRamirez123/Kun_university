"use client";

import { useEffect, useState } from "react";
import { CampusLang } from "./campus-lang";
import { useLocale, usePick } from "@/i18n/locale-context";
import {
  allCertifications,
  catalogText,
  catalog,
  findCatalogProgram,
  findCatalogSchool,
  groupCourses,
  isByLevel,
  periodLabel,
  schoolLabel,
  totalCredits,
  type CatalogProgram,
  type CatalogSchool,
} from "@/lib/catalog";
import { findDemo, useDemoProgress } from "./campus-demo";
import { ZONES } from "./campus-zones";

// Catálogo académico dentro del campus: escuelas → programas → materias por
// semestre, más la educación continua. Todo se lee de src/data (ver lib/catalog).

const COPY = {
  es: {
    title: "Catálogo académico",
    close: "Cerrar",
    schools: "Escuelas",
    allSchools: "← Todas las escuelas",
    backSchool: (s: string) => `← ${s}`,
    programs: (n: number) => `${n} ${n === 1 ? "programa" : "programas"}`,
    programsTitle: "Programas",
    credential: "Credencial",
    credits: "Créditos",
    modality: "Modalidad",
    courses: (n: number) => `${n} materias`,
    seeCourses: "Ver materias →",
    cr: "cr",
    semesterTotal: "Total",
    programTotal: (n: number) => `Suma de materias: ${n} créditos`,
    continuing: "Educación continua",
    continuingAll: "Educación continua de todas las escuelas",
    hours: (h: number) => `${h} horas`,
    noContinuing: "Esta escuela aún no tiene certificaciones de educación continua.",
    signup: "Inscribirme en este programa",
    byLevel: "Agrupado por nivel",
    demos: "Clases demo",
    demosHint: "Mira una clase real de este programa, con preguntas rápidas y su juego de repaso. Es una vista previa: no es una inscripción.",
    demoBadge: "🎬 Clase demo",
    demoCount: (n: number) => `🎬 ${n} ${n === 1 ? "clase demo" : "clases demo"}`,
    watch: "Ver clase →",
    seen: (d: number, n: number) => `${d}/${n} lecciones`,
    bySemester: "Agrupado por semestre",
  },
  en: {
    title: "Academic catalog",
    close: "Close",
    schools: "Schools",
    allSchools: "← All schools",
    backSchool: (s: string) => `← ${s}`,
    programs: (n: number) => `${n} ${n === 1 ? "program" : "programs"}`,
    programsTitle: "Programs",
    credential: "Credential",
    credits: "Credits",
    modality: "Format",
    courses: (n: number) => `${n} courses`,
    seeCourses: "View courses →",
    cr: "cr",
    semesterTotal: "Total",
    programTotal: (n: number) => `Course total: ${n} credits`,
    continuing: "Continuing education",
    continuingAll: "Continuing education across all schools",
    hours: (h: number) => `${h} hours`,
    noContinuing: "This school has no continuing education certificates yet.",
    signup: "Sign up for this program",
    byLevel: "Grouped by level",
    demos: "Demo classes",
    demosHint: "Watch a real class from this program, with quick questions and its review game. It is a preview, not an enrollment.",
    demoBadge: "🎬 Demo class",
    demoCount: (n: number) => `🎬 ${n} ${n === 1 ? "demo class" : "demo classes"}`,
    watch: "Watch class →",
    seen: (d: number, n: number) => `${d}/${n} lessons`,
    bySemester: "Grouped by semester",
  },
};

const MONO = "font-mono uppercase tracking-[0.12em]";
const CARD = "rounded-2xl border border-white/12 bg-white/[0.04]";

/** Color de la escuela en el campus (mismo que su edificio y su punto del minimapa). */
function schoolColor(s: CatalogSchool) {
  const zone = ZONES.find((z) => z.kind === "school" && findCatalogSchool(z.label.es) === s);
  return zone?.color ?? "#C9A0FF";
}

type View = { school: CatalogSchool | null; program: CatalogProgram | null };

export function CampusCatalog({
  open,
  initialSchool,
  initialProgram,
  onClose,
  onSignup,
  onDemo,
}: {
  open: boolean;
  /** Nombre de la escuela con la que abre (API o JSON). Si falta, abre en la lista de escuelas. */
  initialSchool?: string;
  /** Programa con el que abre, directo en sus materias (p. ej. cuando lo pide Krucn). */
  initialProgram?: string;
  onClose: () => void;
  onSignup?: (program: string) => void;
  /** Abre la clase demo de una materia (por su código). */
  onDemo?: (course: string) => void;
}) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  const [view, setView] = useState<View>(() => {
    const found = initialProgram ? findCatalogProgram(initialProgram) : undefined;
    if (found) return found;
    return { school: initialSchool ? (findCatalogSchool(initialSchool) ?? null) : null, program: null };
  });

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const { school, program } = view;
  const accent = school ? schoolColor(school) : "#C9A0FF";

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-[#05020C]/55 p-4 backdrop-blur-sm max-md:p-2"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-title"
        className="reveal-animate flex h-[min(860px,92dvh)] w-[min(1080px,100%)] flex-col overflow-hidden rounded-[26px] border border-white/15 bg-[#0A0516]/92 text-[#FFF3E6] shadow-[0_0_80px_-20px_rgba(201,160,255,0.6)] backdrop-blur-xl"
      >
        {/* Encabezado con migas de pan */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-7 pt-6 pb-4 max-md:px-4">
          <div className="min-w-0">
            <div className={`${MONO} text-[10px] text-white/50`}>
              {catalog.institucion} · {t.title}
            </div>
            <h2 id="catalog-title" className="m-0 mt-1.5 truncate font-(family-name:--font-gabarito) text-[26px] leading-tight font-black max-md:line-clamp-2 max-md:text-xl max-md:whitespace-normal" style={{ color: school ? accent : undefined }}>
              {program ? catalogText(program.programa, locale) : school ? schoolLabel(school, locale) : t.schools}
            </h2>
            <div className="mt-2 flex flex-wrap gap-3">
              {school && (
                <button type="button" onClick={() => setView({ school: null, program: null })} className={`${MONO} cursor-pointer text-[11px] text-white/60 hover:text-white`}>
                  {t.allSchools}
                </button>
              )}
              {program && school && (
                <button type="button" onClick={() => setView({ school, program: null })} className={`${MONO} cursor-pointer text-[11px] text-white/60 hover:text-white`}>
                  {t.backSchool(schoolLabel(school, locale))}
                </button>
              )}
            </div>
          </div>
          <CampusLang className="ml-auto" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="h-10 w-10 shrink-0 cursor-pointer rounded-full border border-white/20 text-xl leading-none transition hover:bg-white/10"
          >
            ×
          </button>
        </div>

        <div key={`${school?.escuela ?? "all"}-${program?.programa ?? ""}`} className="reveal-animate min-h-0 flex-1 overflow-y-auto overscroll-contain px-7 py-6 max-md:px-4">
          {!school && <SchoolsView onPick={(s) => setView({ school: s, program: null })} />}
          {school && !program && <SchoolView school={school} accent={accent} onPick={(p) => setView({ school, program: p })} />}
          {school && program && <ProgramView program={program} accent={accent} locale={locale} onSignup={onSignup} onDemo={onDemo} />}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 1. escuelas

function SchoolsView({ onPick }: { onPick: (s: CatalogSchool) => void }) {
  const { locale } = useLocale();
  const t = usePick(COPY);
  const certs = allCertifications();
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        {catalog.escuelas.map((s) => {
          const color = schoolColor(s);
          const credentials = [...new Set(s.programas.map((p) => p.credencial))];
          return (
            <button
              key={s.escuela}
              type="button"
              onClick={() => onPick(s)}
              className={`${CARD} group flex cursor-pointer flex-col gap-3 overflow-hidden p-5 text-left transition hover:-translate-y-0.5 hover:border-white/35`}
            >
              <span aria-hidden className="h-1.5 w-14 rounded-full" style={{ background: color }} />
              <span className="font-(family-name:--font-gabarito) text-[22px] leading-tight font-black">{schoolLabel(s, locale)}</span>
              <span className={`${MONO} text-[11px] text-white/55`}>
                {t.programs(s.programas.length)} · {t.continuing}: {s.educacion_continua.length}
              </span>
              <span className="flex flex-col gap-1">
                {s.programas.map((p) => (
                  <span key={p.programa} className="truncate text-[13px] text-white/75">
                    · {catalogText(p.programa, locale)}
                  </span>
                ))}
              </span>
              <span className="sr-only">{credentials.join(", ")}</span>
              <span className="mt-auto pt-1 text-[13px] font-bold" style={{ color }}>
                {t.seeCourses}
              </span>
            </button>
          );
        })}
      </div>
      <ContinuingSection title={t.continuingAll} certs={certs} showSchool />
    </div>
  );
}

// ---------------------------------------------------------------- 2. programas de una escuela

function SchoolView({ school, accent, onPick }: { school: CatalogSchool; accent: string; onPick: (p: CatalogProgram) => void }) {
  const { locale } = useLocale();
  const t = usePick(COPY);
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className={`${MONO} m-0 mb-3 text-[12px] text-white/55`}>{t.programsTitle}</h3>
        <div className="flex flex-col gap-3">
          {school.programas.map((p) => (
            <button
              key={p.programa}
              type="button"
              onClick={() => onPick(p)}
              className={`${CARD} grid cursor-pointer grid-cols-[1fr_auto] items-center gap-4 p-5 text-left transition hover:border-white/35 max-md:grid-cols-1`}
            >
              <span className="min-w-0">
                <span className="block font-(family-name:--font-gabarito) text-[19px] leading-snug font-extrabold">{catalogText(p.programa, locale)}</span>
                <span className="mt-2 grid grid-cols-3 gap-3 text-[13px] max-sm:grid-cols-1">
                  <Fact label={t.credential} value={catalogText(p.credencial, locale)} />
                  <Fact label={t.credits} value={catalogText(p.creditos, locale)} />
                  <Fact label={t.modality} value={catalogText(p.modalidad, locale)} />
                </span>
              </span>
              <span className="flex flex-col items-end gap-1 max-md:items-start">
                <span className={`${MONO} text-[11px] text-white/50`}>{t.courses(p.materias.length)}</span>
                {programDemos(p).length > 0 && (
                  <span className="rounded-full px-2.5 py-0.5 text-[11.5px] font-bold text-[#06131A]" style={{ background: accent }}>
                    {t.demoCount(programDemos(p).length)}
                  </span>
                )}
                <span className="text-[14px] font-bold whitespace-nowrap" style={{ color: accent }}>
                  {t.seeCourses}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
      <ContinuingSection title={t.continuing} certs={school.educacion_continua} emptyText={t.noContinuing} />
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <span className="min-w-0">
      <span className={`${MONO} block text-[10px] text-white/45`}>{label}</span>
      <span className="block text-white/85">{value}</span>
    </span>
  );
}

// ---------------------------------------------------------------- 3. materias de un programa

function ProgramView({
  program,
  accent,
  locale,
  onSignup,
  onDemo,
}: {
  program: CatalogProgram;
  accent: string;
  locale: "es" | "en";
  onSignup?: (program: string) => void;
  onDemo?: (course: string) => void;
}) {
  const t = usePick(COPY);
  const groups = groupCourses(program);
  const demos = onDemo ? programDemos(program) : [];
  const progress = useDemoProgress();
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
        <div className={`${CARD} p-4`}>
          <Fact label={t.credential} value={catalogText(program.credencial, locale)} />
        </div>
        <div className={`${CARD} p-4`}>
          <Fact label={t.credits} value={catalogText(program.creditos, locale)} />
        </div>
        <div className={`${CARD} p-4`}>
          <Fact label={t.modality} value={catalogText(program.modalidad, locale)} />
        </div>
      </div>
      {demos.length > 0 && onDemo && (
        <section className="rounded-2xl border p-4" style={{ borderColor: `${accent}66`, background: `linear-gradient(120deg, ${accent}22, transparent 70%)` }}>
          <h3 className={`${MONO} m-0 text-[12px] font-bold`} style={{ color: accent }}>
            {t.demos}
          </h3>
          <p className="m-0 mt-1 text-[12.5px] text-white/65">{t.demosHint}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 max-md:grid-cols-1">
            {demos.map((d) => {
              const seen = progress.done[d.code]?.length ?? 0;
              return (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => onDemo(d.code)}
                  className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-white/15 bg-[#06131A]/70 p-3 text-left transition hover:-translate-y-0.5 hover:border-white/40"
                >
                  <span aria-hidden className="grid h-16 w-24 shrink-0 place-items-center rounded-xl text-2xl text-[#06131A]" style={{ background: accent }}>
                    ▶
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[11px] text-white/50">{d.code}</span>
                    <span className="block text-[15px] leading-snug font-bold">{d.name[locale]}</span>
                    <span className="mt-1 block text-[11.5px] text-white/55">
                      {t.seen(seen, d.class.length)} · ES / EN · ♨️
                    </span>
                  </span>
                  <span className="shrink-0 text-[13px] font-bold max-sm:hidden" style={{ color: accent }}>
                    {t.watch}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`${MONO} text-[11px] text-white/55`}>
          {isByLevel(program) ? t.byLevel : t.bySemester} · {t.courses(program.materias.length)} · {t.programTotal(totalCredits(program))}
        </span>
        {onSignup && (
          <button
            type="button"
            onClick={() => onSignup(program.programa)}
            className={`${MONO} cursor-pointer rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-[#0A0516] transition hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.8)]`}
          >
            {t.signup} →
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        {groups.map((g) => (
          <section key={String(g.periodo)} className={`${CARD} flex flex-col p-4`}>
            <h3 className={`${MONO} m-0 mb-3 flex items-center justify-between text-[12px] font-bold`} style={{ color: accent }}>
              <span>{periodLabel(g.periodo, locale)}</span>
              <span>
                {g.credits} {t.cr}
              </span>
            </h3>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {g.courses.map((c) => (
                <li key={`${c.codigo}-${c.materia}`} className="grid grid-cols-[5.5rem_1fr_auto] items-baseline gap-2 text-[13px] leading-snug">
                  <span className="font-mono text-[11.5px] text-white/50">{c.codigo}</span>
                  <span className="text-white/90">
                    {c.materia}
                    {onDemo && findDemo(c.codigo) && (
                      <button
                        type="button"
                        onClick={() => onDemo(c.codigo)}
                        className="ml-2 cursor-pointer rounded-full px-2 py-0.5 align-middle text-[10.5px] font-bold text-[#06131A]"
                        style={{ background: accent }}
                      >
                        {t.demoBadge}
                      </button>
                    )}
                  </span>
                  <span className="font-mono text-[12px] text-white/60">{c.creditos}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-white/10 pt-2 text-[12px]">
              <span className={`${MONO} text-white/50`}>{t.semesterTotal}</span>
              <span className="font-mono font-bold">
                {g.credits} {t.cr}
              </span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/** Demos de materias que tiene un programa. */
function programDemos(program: CatalogProgram) {
  return program.materias.map((m) => findDemo(m.codigo)).filter((d) => d !== undefined);
}

// ---------------------------------------------------------------- 4. educación continua

function ContinuingSection({
  title,
  certs,
  showSchool,
  emptyText,
}: {
  title: string;
  certs: Array<{ certificado: string; horas: number; escuela?: string }>;
  showSchool?: boolean;
  emptyText?: string;
}) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  return (
    <section>
      <h3 className={`${MONO} m-0 mb-3 text-[12px] text-white/55`}>{title}</h3>
      {certs.length === 0 ? (
        <p className="m-0 rounded-2xl border border-dashed border-white/20 p-4 text-[13px] text-white/60">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          {certs.map((c) => (
            <div key={`${c.escuela ?? ""}-${c.certificado}`} className={`${CARD} flex items-center justify-between gap-3 p-4`}>
              <span className="min-w-0">
                <span className="block text-[14.5px] leading-snug font-bold">{c.certificado}</span>
                {showSchool && c.escuela && <span className="mt-0.5 block text-[12px] text-white/55">{schoolLabel(c.escuela, locale)}</span>}
              </span>
              <span className={`${MONO} shrink-0 rounded-full border border-white/20 px-3 py-1 text-[11px]`}>{t.hours(c.horas)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
