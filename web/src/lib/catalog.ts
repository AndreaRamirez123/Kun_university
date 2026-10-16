import raw from "@/data/KUN_catalogo_escuelas_programas_materias.json";

// Catálogo académico oficial. La única fuente de verdad es el JSON en
// src/data: al reemplazar ese archivo, el campus muestra los datos nuevos.
// Aquí solo hay tipos y utilidades para leerlo, nunca datos escritos a mano.

export type CatalogCourse = { periodo: number | string; codigo: string; materia: string; creditos: number };
export type CatalogProgram = { programa: string; credencial: string; creditos: string; modalidad: string; materias: CatalogCourse[] };
export type CatalogCert = { certificado: string; horas: number };
export type CatalogSchool = { escuela: string; programas: CatalogProgram[]; educacion_continua: CatalogCert[] };
export type Catalog = { institucion: string; escuelas: CatalogSchool[] };

export const catalog = raw as Catalog;

export type CourseGroup = {
  /** Periodo tal como viene en el JSON (número de semestre o nombre del nivel). */
  periodo: number | string;
  courses: CatalogCourse[];
  credits: number;
};

/** Agrupa las materias por semestre (o por nivel), respetando el orden del archivo. */
export function groupCourses(program: CatalogProgram): CourseGroup[] {
  const groups: CourseGroup[] = [];
  for (const course of program.materias) {
    let g = groups.find((x) => x.periodo === course.periodo);
    if (!g) {
      g = { periodo: course.periodo, courses: [], credits: 0 };
      groups.push(g);
    }
    g.courses.push(course);
    g.credits += course.creditos;
  }
  return groups;
}

export function totalCredits(program: CatalogProgram) {
  return program.materias.reduce((sum, c) => sum + c.creditos, 0);
}

/** "Semestre 3" para periodos numéricos; el nombre del nivel tal cual en otro caso. */
export function periodLabel(periodo: number | string, locale: "es" | "en") {
  return typeof periodo === "number" ? `${locale === "es" ? "Semestre" : "Semester"} ${periodo}` : periodo;
}

/** Para un programa agrupado por niveles (no por semestres), p. ej. Digital Media. */
export function isByLevel(program: CatalogProgram) {
  return program.materias.some((m) => typeof m.periodo !== "number");
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Busca la escuela del catálogo por nombre. Acepta el nombre completo de la API
 * ("Escuela de Ingeniería") o el corto del JSON ("Ingeniería").
 */
export function findCatalogSchool(name: string): CatalogSchool | undefined {
  const n = norm(name);
  return catalog.escuelas.find((s) => {
    const e = norm(s.escuela);
    return n === e || n.includes(e) || e.includes(n);
  });
}

export function allCertifications() {
  return catalog.escuelas.flatMap((s) => s.educacion_continua.map((c) => ({ ...c, escuela: s.escuela })));
}
