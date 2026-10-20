"use client";

import { earn } from "./campus-wallet";
import { useEffect, useMemo, useState } from "react";
import { useLocale, usePick } from "@/i18n/locale-context";
import { catalog, catalogText, findCatalogSchool, schoolLabel, type CatalogProgram } from "@/lib/catalog";
import { ADMISSIONS_EMAIL } from "@/lib/contact";

// Inscripción dentro de una sala: tarjeta centrada y enfocada (el resto de la
// sala se oscurece). A la izquierda, la carrera elegida con sus datos del
// catálogo y qué pasa después; a la derecha, el formulario. Al enviar, la
// confirmación aparece en la misma tarjeta.

const COPY = {
  es: {
    kicker: "Inscripción",
    title: "Empieza tu carrera en KUN",
    close: "Volver al video",
    yourProgram: "Tu carrera",
    credential: "Credencial",
    credits: "Créditos",
    modality: "Modalidad",
    courses: (n: number) => `${n} materias`,
    nextTitle: "¿Qué pasa después?",
    steps: ["Un asesor de admisiones te escribe en menos de 24 horas.", "Resuelves dudas sobre becas, fechas y requisitos.", "Empiezas a estudiar 100% online, desde donde estés."],
    name: "Nombre completo",
    email: "Correo electrónico",
    phone: "Teléfono (con indicativo)",
    program: "Carrera de interés",
    choose: "Elige una carrera",
    thisSchool: "En esta escuela",
    otherSchools: "Otras escuelas",
    consent: "Acepto que KUN University AI me contacte sobre esta inscripción.",
    send: "Enviar inscripción",
    orEmail: "¿Prefieres escribirnos?",
    doneTitle: (name: string) => `¡Listo${name ? `, ${name}` : ""}!`,
    doneBody: (p: string) => `Recibimos tu interés en ${p}. Un asesor de admisiones te contactará muy pronto.`,
    doneNote: "Prototipo: en la versión final, esta inscripción llegará al equipo de admisiones.",
    back: "Volver al video",
  },
  en: {
    kicker: "Sign up",
    title: "Start your career at KUN",
    close: "Back to the video",
    yourProgram: "Your program",
    credential: "Credential",
    credits: "Credits",
    modality: "Format",
    courses: (n: number) => `${n} courses`,
    nextTitle: "What happens next?",
    steps: ["An admissions advisor writes to you within 24 hours.", "You get answers on scholarships, dates and requirements.", "You start studying 100% online, from wherever you are."],
    name: "Full name",
    email: "Email",
    phone: "Phone (with country code)",
    program: "Program of interest",
    choose: "Choose a program",
    thisSchool: "In this school",
    otherSchools: "Other schools",
    consent: "I agree that KUN University AI may contact me about this sign-up.",
    send: "Send sign-up",
    orEmail: "Prefer email?",
    doneTitle: (name: string) => `All set${name ? `, ${name}` : ""}!`,
    doneBody: (p: string) => `We received your interest in ${p}. An admissions advisor will contact you very soon.`,
    doneNote: "Prototype: in the final version, this sign-up will reach the admissions team.",
    back: "Back to the video",
  },
};

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s*\(.*\)\s*$/, "")
    .trim();

/** Busca un programa del catálogo por nombre (los nombres de la API pueden variar un poco). */
function findProgram(name: string): CatalogProgram | undefined {
  if (!name) return undefined;
  const n = norm(name);
  for (const s of catalog.escuelas) {
    const p = s.programas.find((x) => norm(x.programa) === n || norm(x.programa).startsWith(n) || n.startsWith(norm(x.programa)));
    if (p) return p;
  }
  return undefined;
}

const FIELD =
  "h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[15px] text-[#FFF3E6] placeholder:text-white/35 focus:border-white/60 focus:bg-white/[0.09] focus:outline-none";
const LABEL = "flex flex-col gap-1.5 text-[12px] font-bold tracking-[0.06em] text-white/70 uppercase";

export function SignupPanel({
  accent,
  schoolName,
  defaultProgram,
  playerName,
  onClose,
}: {
  accent: string;
  /** Nombre de la escuela (API o JSON); sus carreras aparecen primero. */
  schoolName?: string;
  defaultProgram?: string;
  playerName: string;
  onClose: () => void;
}) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  const school = schoolName ? findCatalogSchool(schoolName) : undefined;
  const initial = findProgram(defaultProgram ?? "")?.programa ?? school?.programas[0]?.programa ?? "";
  const [program, setProgram] = useState(initial);
  const [name, setName] = useState(playerName);
  const [done, setDone] = useState(false);
  const selected = useMemo(() => findProgram(program), [program]);
  const others = catalog.escuelas.filter((s) => s !== school);

  // Esc cierra la inscripción y vuelve al video (no sale de la sala).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-[#05020C]/70 p-4 backdrop-blur-md max-md:items-end max-md:p-2"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-title"
        className="reveal-animate relative grid max-h-[92dvh] w-[min(980px,100%)] grid-cols-[0.95fr_1.05fr] overflow-hidden rounded-[28px] border border-white/12 bg-[#0B0716] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] max-md:grid-cols-1 max-md:overflow-y-auto"
        style={{ boxShadow: `0 0 120px -40px ${accent}` }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/30 text-xl leading-none text-white transition hover:bg-white/10"
        >
          ×
        </button>

        {/* Izquierda: la carrera y qué pasa después */}
        <aside
          className="relative flex flex-col gap-5 overflow-x-hidden overflow-y-auto p-8 text-[#FFF3E6] [@media(max-height:820px)]:gap-3.5 [@media(max-height:820px)]:p-6 max-md:p-5 max-md:pr-16 max-md:pb-0"
          style={{ background: `linear-gradient(160deg, ${accent}55 0%, ${accent}18 45%, transparent 100%)` }}
        >
          <span aria-hidden className="absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-40 blur-3xl" style={{ background: accent }} />
          <div className="relative">
            <div className="font-mono text-[11px] tracking-[0.25em] text-white/70 uppercase">{t.kicker}</div>
            <h2 id="signup-title" className="m-0 mt-2 font-(family-name:--font-gabarito) text-[30px] leading-[1.05] font-black max-md:text-2xl">
              {t.title}
            </h2>
            {school && <p className="m-0 mt-2 text-[14px] text-white/70">{schoolLabel(school, locale)}</p>}
          </div>

          {selected && (
            <div key={selected.programa} className="reveal-animate relative rounded-2xl border border-white/15 bg-black/25 p-5 max-md:hidden">
              <div className="font-mono text-[10px] tracking-[0.2em] text-white/55 uppercase">{t.yourProgram}</div>
              <div className="mt-1 font-(family-name:--font-gabarito) text-[20px] leading-snug font-extrabold">
                {selected.programa.replace(/\s*\(.*\)\s*$/, "")}
              </div>
              <dl className="m-0 mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                <div className="col-span-2">
                  <dt className="font-mono text-[10px] tracking-[0.15em] text-white/50 uppercase">{t.credential}</dt>
                  <dd className="m-0 text-white/90">{catalogText(selected.credencial, locale)}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] tracking-[0.15em] text-white/50 uppercase">{t.credits}</dt>
                  <dd className="m-0 text-white/90">{catalogText(selected.creditos, locale)}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] tracking-[0.15em] text-white/50 uppercase">{t.modality}</dt>
                  <dd className="m-0 text-white/90">{catalogText(selected.modalidad, locale)}</dd>
                </div>
              </dl>
              <div className="mt-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold text-[#0B0716]" style={{ background: accent }}>
                {t.courses(selected.materias.length)}
              </div>
            </div>
          )}

          <div className="relative max-md:hidden">
            <div className="mb-3 font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase">{t.nextTitle}</div>
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {t.steps.map((step, i) => (
                <li key={step} className="flex items-start gap-3 text-[14px] leading-snug text-white/85">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-bold text-[#0B0716]" style={{ background: accent }}>
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* Derecha: formulario o confirmación */}
        <div className="flex flex-col justify-center p-8 max-md:p-5">
          {done ? (
            <div className="reveal-animate flex flex-col items-center gap-4 py-8 text-center text-[#FFF3E6]">
              <span className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: `${accent}33`, boxShadow: `0 0 0 2px ${accent}` }}>
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12.5l4.5 4.5L19 7.5" style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: "signup-check 600ms ease-out both" }} />
                </svg>
              </span>
              <h3 className="m-0 font-(family-name:--font-gabarito) text-[28px] font-black">{t.doneTitle(name.trim().split(" ")[0] ?? "")}</h3>
              <p className="m-0 max-w-80 text-[15px] leading-relaxed text-white/75">{t.doneBody(program.replace(/\s*\(.*\)\s*$/, ""))}</p>
              <p className="m-0 text-[12px] text-white/45">{t.doneNote}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 h-12 cursor-pointer rounded-full px-8 text-[14px] font-bold text-[#0B0716] transition hover:-translate-y-0.5"
                style={{ background: accent }}
              >
                {t.back}
              </button>
              <style>{`@keyframes signup-check { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }`}</style>
            </div>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
                earn("signup");
              }}
            >
              <label className={LABEL}>
                {t.name}
                <input required name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={FIELD} />
              </label>
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <label className={LABEL}>
                  {t.email}
                  <input required type="email" name="email" autoComplete="email" placeholder="tu@correo.com" className={FIELD} />
                </label>
                <label className={LABEL}>
                  {t.phone}
                  <input required type="tel" name="phone" autoComplete="tel" placeholder="+1 305 000 0000" className={FIELD} />
                </label>
              </div>
              <label className={LABEL}>
                {t.program}
                <select required name="program" value={program} onChange={(e) => setProgram(e.target.value)} className={`${FIELD} cursor-pointer`}>
                  <option value="" disabled className="bg-[#0B0716]">
                    {t.choose}
                  </option>
                  {school && (
                    <optgroup label={`${t.thisSchool} · ${schoolLabel(school, locale)}`} className="bg-[#0B0716]">
                      {school.programas.map((p) => (
                        <option key={p.programa} value={p.programa} className="bg-[#0B0716]">
                          {p.programa.replace(/\s*\(.*\)\s*$/, "")} · {catalogText(p.credencial, locale)}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label={school ? t.otherSchools : catalog.institucion} className="bg-[#0B0716]">
                    {others.flatMap((s) =>
                      s.programas.map((p) => (
                        <option key={`${s.escuela}-${p.programa}`} value={p.programa} className="bg-[#0B0716]">
                          {p.programa.replace(/\s*\(.*\)\s*$/, "")} · {schoolLabel(s, locale)}
                        </option>
                      )),
                    )}
                  </optgroup>
                </select>
              </label>
              <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-white/70">
                <input required type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer" style={{ accentColor: accent }} />
                {t.consent}
              </label>
              <button
                type="submit"
                className="mt-1 h-13 cursor-pointer rounded-full text-[15px] font-bold text-[#0B0716] transition hover:-translate-y-0.5 hover:brightness-110"
                style={{ background: accent, boxShadow: `0 18px 40px -16px ${accent}` }}
              >
                {t.send} →
              </button>
              <p className="m-0 text-center text-[12.5px] text-white/55" lang={locale}>
                {t.orEmail}{" "}
                <a href={`mailto:${ADMISSIONS_EMAIL}`} className="font-bold underline" style={{ color: accent }}>
                  {ADMISSIONS_EMAIL}
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
