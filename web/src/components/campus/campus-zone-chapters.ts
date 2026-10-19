import type { Locale } from "@/i18n/locale-context";
import { ADMISSIONS_EMAIL } from "@/lib/contact";
import type { Certification, School, Stats } from "@/lib/types";
import type { ZoneDef } from "./campus-zones";
import { explainerChapters, THEME_STYLE, type Chapter, type Theme } from "./campus-explainer";
import { catalogText, findCatalogSchool, groupCourses, isByLevel, type CatalogProgram } from "@/lib/catalog";

// Capítulos del video de cada lugar del campus, armados con los datos reales
// de la API: cada escuela narra sus programas, Certificaciones cada curso y el
// Currículo vivo cómo se construye un curso. Admisiones usa explainerChapters.

const T = {
  es: {
    welcomeMenu: "Bienvenida",
    welcomeVoice: (name: string, tagline: string) => `Bienvenido a la ${name}. ${tagline}`,
    programVoice: (name: string, degree: string, credits: number, sem: number) =>
      `${name}: un programa ${degree} de ${credits} créditos${sem ? `, en ${sem} semestres` : ""}, cien por ciento online.`,
    credits: "CRÉDITOS",
    careersIntro: (n: number) => `Aquí conocerás sus ${n} carreras, una por una.`,
    careerKicker: (i: number, n: number) => `Carrera ${i} de ${n}`,
    creditsLabel: (c: string) => `${c} créditos`,
    featured: "Algunas materias que vas a estudiar",
    careerVoice: (name: string, cred: string, mod: string, courses: number, groups: number, byLevel: boolean) =>
      `${name}. Te gradúas con el título ${cred}. Modalidad: ${mod}. Son ${courses} materias en ${groups} ${byLevel ? "niveles" : "semestres"}, y aquí ves algunas de ellas.`,
    careerFooter: (courses: number, groups: number, byLevel: boolean) =>
      `${courses} materias · ${groups} ${byLevel ? "niveles" : "semestres"} · Plan completo en “Programas y materias”`,
    schoolCertsMenu: "Certificaciones",
    schoolCertsTitle: "Certifícate sin esperar a graduarte",
    schoolCertsVoice: (list: string) => `Esta escuela también ofrece educación continua: ${list}.`,
    hoursWord: "horas",
    learnMenu: "Cómo aprendes",
    learnTitle: "La IA propone, las personas deciden",
    learnVoice: "Nuestros agentes de IA rastrean lo último de la ciencia y la industria, el equipo académico valida y tú aprendes lo que el mercado necesita hoy.",
    learnSteps: ["La IA rastrea", "El experto valida", "Tú aprendes"],
    enrollMenu: "Inscríbete",
    enrollTitle: "Tu carrera arranca aquí",
    enrollVoice: (name: string) => `¿Te interesa la ${name}? Inscríbete ahora o escríbenos a ${ADMISSIONS_EMAIL}.`,
    curWelcome: "No enseñamos lo que se enseñaba hace cinco años",
    curWelcomeVoice: "Bienvenido al Currículo vivo, el corazón del campus. Aquí ves cómo se construye cada curso de KUN.",
    cur1: ["La IA rastrea la frontera", "Agentes de IA monitorean lo último que publica la ciencia, la industria y la regulación en cada campo que enseñamos."],
    cur2: ["El criterio humano decide", "El equipo académico experto revisa, valida y da forma al contenido. La IA propone, las personas deciden."],
    cur3: ["Aprendes lo de hoy", "No lo que se enseñaba hace cinco años: las competencias que las empresas buscan hoy."],
    curMenu: ["La IA rastrea", "El humano decide", "Lo que el mercado pide"],
    curSchools: "Cuatro escuelas, un motor",
    curSchoolsVoice: (n: number, p: number) => `El mismo motor IA-Native impulsa nuestras ${n} escuelas y ${p} programas.`,
    certWelcome: "No tienes que esperar a graduarte",
    certWelcomeVoice: (n: number) => `Bienvenido a la plataforma de lanzamiento. Tenemos ${n} certificaciones de 36 a 40 horas para aplicar lo aprendido desde la primera semana.`,
    hours: "HORAS",
    certVoice: (name: string, h: number, desc: string) => `${name}: ${h} horas, cien por ciento online. ${desc}`,
    certStart: "Despega hoy",
    certStartVoice: `Elige tu certificación e inscríbete, o escríbenos a ${ADMISSIONS_EMAIL}. ¡Y no olvides despegar el cohete!`,
  },
  en: {
    welcomeMenu: "Welcome",
    welcomeVoice: (name: string, tagline: string) => `Welcome to the ${name}. ${tagline}`,
    programVoice: (name: string, degree: string, credits: number, sem: number) =>
      `${name}: a ${degree} program of ${credits} credits${sem ? `, over ${sem} semesters` : ""}, one hundred percent online.`,
    credits: "CREDITS",
    careersIntro: (n: number) => `Here you'll meet its ${n} programs, one by one.`,
    careerKicker: (i: number, n: number) => `Program ${i} of ${n}`,
    creditsLabel: (c: string) => `${c} credits`,
    featured: "Some of the courses you'll take",
    careerVoice: (name: string, cred: string, mod: string, courses: number, groups: number, byLevel: boolean) =>
      `${name}. You graduate with the ${cred}. Format: ${mod}. It's ${courses} courses over ${groups} ${byLevel ? "levels" : "semesters"}, and here are some of them.`,
    careerFooter: (courses: number, groups: number, byLevel: boolean) =>
      `${courses} courses · ${groups} ${byLevel ? "levels" : "semesters"} · Full plan in “Programs and courses”`,
    schoolCertsMenu: "Certifications",
    schoolCertsTitle: "Get certified before you graduate",
    schoolCertsVoice: (list: string) => `This school also offers continuing education: ${list}.`,
    hoursWord: "hours",
    learnMenu: "How you learn",
    learnTitle: "AI proposes, people decide",
    learnVoice: "Our AI agents track the latest in science and industry, the academic team validates it, and you learn what the market needs today.",
    learnSteps: ["AI tracks", "Experts validate", "You learn"],
    enrollMenu: "Sign up",
    enrollTitle: "Your career starts here",
    enrollVoice: (name: string) => `Interested in the ${name}? Sign up now or email us at ${ADMISSIONS_EMAIL}.`,
    curWelcome: "We don't teach what was taught five years ago",
    curWelcomeVoice: "Welcome to the Living curriculum, the heart of the campus. Here you see how every KUN course gets built.",
    cur1: ["AI tracks the frontier", "AI agents monitor the latest published science, industry and regulation in every field we teach."],
    cur2: ["Human judgment decides", "The expert academic team reviews, validates and shapes the content. AI proposes, people decide."],
    cur3: ["You learn today's skills", "Not what was taught five years ago: the skills companies are looking for today."],
    curMenu: ["AI tracks", "Humans decide", "What the market needs"],
    curSchools: "Four schools, one engine",
    curSchoolsVoice: (n: number, p: number) => `The same AI-Native engine powers our ${n} schools and ${p} programs.`,
    certWelcome: "You don't have to wait until you graduate",
    certWelcomeVoice: (n: number) => `Welcome to the launch pad. We have ${n} certifications of 36 to 40 hours so you apply what you learn from the first week.`,
    hours: "HOURS",
    certVoice: (name: string, h: number, desc: string) => `${name}: ${h} hours, one hundred percent online. ${desc}`,
    certStart: "Lift off today",
    certStartVoice: `Pick your certification and sign up, or email us at ${ADMISSIONS_EMAIL}. And don't forget to launch the rocket!`,
  },
};

const SCHOOL_THEME: Record<string, Theme> = { ing: "engineering", neg: "business", bie: "wellness", dis: "design" };

/** Quita aclaraciones entre paréntesis del nombre ("… (en la Planeación: …)"). */
function shortName(name: string) {
  return name.replace(/\s*\(.*\)\s*$/, "").trim();
}

/**
 * Materias que representan la carrera: las de la segunda mitad del plan (las
 * propias del programa, no las de educación general), repartidas a lo largo.
 */
function featuredCourses(p: CatalogProgram, count = 5) {
  const groups = groupCourses(p);
  const pool = groups.slice(Math.floor(groups.length / 2)).flatMap((g) => g.courses);
  const list = pool.length >= count ? pool : p.materias;
  if (list.length <= count) return list;
  return Array.from({ length: count }, (_, i) => list[Math.round((i * (list.length - 1)) / (count - 1))]);
}

const PALETTE = ["#E8735A", "#3D6FD9", "#1E9C7E", "#FFC85C", "#C2387A", "#7A4FD0", "#FF8A4C"];

export function zoneChapters(
  zone: ZoneDef,
  locale: Locale,
  stats: Stats,
  schools: School[],
  certifications: Certification[],
): Chapter[] {
  const t = T[locale];
  if (zone.kind === "admissions") return explainerChapters(locale, stats);

  if (zone.kind === "school") {
    const school = schools.find((s) => s.slug === zone.schoolSlug);
    if (!school) return explainerChapters(locale, stats);
    const name = school.name[locale];
    const short = zone.label[locale];
    const theme = SCHOOL_THEME[zone.id] ?? "default";
    // Colores propios de la escuela para todos sus capítulos.
    const pal = THEME_STYLE[theme].accents;
    // Las carreras salen del catálogo oficial (src/data), no de la API.
    const catalogSchool = findCatalogSchool(school.name.es);
    const programs = catalogSchool?.programas ?? [];
    const certs = catalogSchool?.educacion_continua ?? [];
    return [
      {
        id: "welcome",
        menu: t.welcomeMenu,
        title: short,
        voice: t.welcomeVoice(name, school.tagline[locale]) + " " + t.careersIntro(programs.length),
        accent: pal[0],
        theme,
        extra: [short.charAt(0)],
      },
      ...programs.map((p, i): Chapter => {
        const groups = groupCourses(p);
        return {
          id: `program-${i}`,
          menu: shortName(p.programa),
          title: shortName(p.programa),
          voice: t.careerVoice(shortName(p.programa), catalogText(p.credencial, locale), catalogText(p.modalidad, locale), p.materias.length, groups.length, isByLevel(p)),
          accent: pal[(i + 1) % pal.length],
          theme,
          graphic: "career",
          career: {
            kicker: t.careerKicker(i + 1, programs.length),
            credential: catalogText(p.credencial, locale),
            credits: t.creditsLabel(catalogText(p.creditos, locale)),
            modality: catalogText(p.modalidad, locale),
            coursesLabel: t.featured,
            courses: featuredCourses(p).map((c) => ({ code: c.codigo, name: c.materia })),
            footer: t.careerFooter(p.materias.length, groups.length, isByLevel(p)),
          },
        };
      }),
      ...(certs.length
        ? [
            {
              id: "school-certs",
              menu: t.schoolCertsMenu,
              title: t.schoolCertsTitle,
              voice: t.schoolCertsVoice(certs.map((c) => `${c.certificado}, ${c.horas} ${t.hoursWord}`).join("; ")),
              accent: pal[2 % pal.length],
              theme,
              graphic: "seals" as const,
              extra: certs.slice(0, 2).map((c) => `${c.horas}h`),
            },
          ]
        : []),
      { id: "learn", menu: t.learnMenu, title: t.learnTitle, voice: t.learnVoice, accent: pal[3 % pal.length], theme, graphic: "steps", extra: t.learnSteps },
      { id: "start", menu: t.enrollMenu, title: t.enrollTitle, voice: t.enrollVoice(name), accent: pal[0], theme },
    ];
  }

  if (zone.kind === "curriculum") {
    return [
      { id: "welcome", menu: t.welcomeMenu, title: t.curWelcome, voice: t.curWelcomeVoice, accent: zone.color, extra: ["∞"] },
      { id: "cur1", menu: t.curMenu[0], title: t.cur1[0], voice: t.cur1[1], accent: "#3D6FD9", graphic: "world" },
      { id: "cur2", menu: t.curMenu[1], title: t.cur2[0], voice: t.cur2[1], accent: "#7A4FD0", graphic: "seals", extra: ["IA", "✓"] },
      { id: "cur3", menu: t.curMenu[2], title: t.cur3[0], voice: t.cur3[1], accent: "#E8735A", graphic: "steps", extra: t.learnSteps },
      {
        id: "numbers",
        menu: t.curSchools,
        title: t.curSchools,
        voice: t.curSchoolsVoice(stats.schools, stats.programs),
        accent: "#1E9C7E",
        extra: locale === "es" ? ["ESCUELAS", "PROGRAMAS", "CERTIF. IA", "% ONLINE"] : ["SCHOOLS", "PROGRAMS", "AI CERTS", "% ONLINE"],
      },
    ];
  }

  // Certificaciones
  return [
    { id: "welcome", menu: t.welcomeMenu, title: t.certWelcome, voice: t.certWelcomeVoice(certifications.length), accent: zone.color, extra: ["🚀"] },
    ...certifications.map((c, i): Chapter => ({
      id: `cert-${i}`,
      menu: c.name,
      title: c.name,
      voice: t.certVoice(c.name, c.hours, c.description[locale]),
      accent: PALETTE[i % PALETTE.length],
      graphic: "badge",
      badge: { top: "AI", value: c.hours, unit: t.hours },
    })),
    { id: "start", menu: t.certStart, title: t.certStart, voice: t.certStartVoice, accent: zone.color },
  ];
}
