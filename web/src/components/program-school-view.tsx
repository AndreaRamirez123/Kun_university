"use client";

import Link from "next/link";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { Program, School } from "@/lib/types";

const COPY = {
  es: {
    back: "← Volver a las escuelas",
    credits: "créditos",
    semester: (n: number) => `Semestre ${n}`,
    comingSoon: "El plan de materias de este programa se publicará próximamente.",
  },
  en: {
    back: "← Back to schools",
    credits: "credits",
    semester: (n: number) => `Semester ${n}`,
    comingSoon: "This program's course plan will be published soon.",
  },
};

function ProgramCurriculum({ program }: { program: Program }) {
  const t = usePick(COPY);
  return (
    <div className="rounded-2xl border border-hairline bg-cream p-7 max-md:p-5">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-2xl font-normal">{program.name}</h3>
        <div className="flex items-center gap-2 text-sm font-bold text-navy">
          <span className="rounded-full border border-navy/30 px-3 py-1 text-xs">{program.degree}</span>
          <span>
            {program.totalCredits} {t.credits}
          </span>
        </div>
      </div>

      {program.semesters && program.semesters.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          {program.semesters.map((semester) => {
            const semesterCredits = semester.courses.reduce((sum, c) => sum + c.credits, 0);
            return (
              <div key={semester.number} className="rounded-xl bg-surface-alt p-4">
                <div className="small-caps mb-2.5 flex items-center justify-between text-xs font-bold text-teal">
                  <span>{t.semester(semester.number)}</span>
                  <span>
                    {semesterCredits} {t.credits}
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {semester.courses.map((course) => (
                    <li key={course.code} className="flex items-start justify-between gap-3 text-[13px]">
                      <span>
                        <span className="font-bold text-muted-brown">{course.code}</span>{" "}
                        <span className="text-muted-ink">{course.title}</span>
                      </span>
                      <span className="shrink-0 font-bold text-navy">{course.credits}cr</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-ink">{t.comingSoon}</p>
      )}
    </div>
  );
}

export function ProgramSchoolView({ school }: { school: School }) {
  const t = usePick(COPY);
  const { locale } = useLocale();

  return (
    <div className="mx-auto max-w-260 px-14 py-16 max-md:px-6">
      <Link href="/#programas" className="small-caps mb-6 inline-block text-xs font-bold text-teal hover:underline">
        {t.back}
      </Link>
      <h1 className="font-display mb-2 text-4xl font-normal">{school.name[locale]}</h1>
      <p className="mb-10 max-w-140 text-[15px] text-muted-ink">{school.tagline[locale]}</p>

      <div className="flex flex-col gap-6">
        {school.programs.map((program) => (
          <ProgramCurriculum key={program.name} program={program} />
        ))}
      </div>
    </div>
  );
}
