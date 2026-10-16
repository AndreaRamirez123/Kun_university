import type { Locale } from "@/i18n/locale-context";
import { ADMISSIONS_EMAIL } from "@/lib/contact";
import type { Certification, School, Stats } from "@/lib/types";
import type { ZoneDef } from "./campus-zones";
import { explainerChapters, type Chapter } from "./campus-explainer";

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
    return [
      {
        id: "welcome",
        menu: t.welcomeMenu,
        title: short,
        voice: t.welcomeVoice(name, school.tagline[locale]),
        accent: zone.color,
        extra: [short.charAt(0)],
      },
      ...school.programs.map((p, i): Chapter => ({
        id: `program-${i}`,
        menu: p.name,
        title: p.name,
        voice: t.programVoice(p.name, p.degree, p.totalCredits, p.semesters?.length ?? 0),
        accent: i % 2 ? zone.color : PALETTE[(i + 3) % PALETTE.length],
        graphic: "badge",
        badge: { top: p.degree, value: p.totalCredits, unit: t.credits },
      })),
      { id: "learn", menu: t.learnMenu, title: t.learnTitle, voice: t.learnVoice, accent: "#7A4FD0", graphic: "steps", extra: t.learnSteps },
      { id: "start", menu: t.enrollMenu, title: t.enrollTitle, voice: t.enrollVoice(name), accent: zone.color },
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
