import faq from "@/data/KUN_preguntas_frecuentes.json";
import type { Locale } from "@/i18n/locale-context";
import { ADMISSIONS_EMAIL } from "@/lib/contact";
import { allCertifications, catalog, catalogText, findCatalogSchool, schoolLabel, type CatalogProgram, type CatalogSchool } from "@/lib/catalog";
import type { KrucnAction } from "@/lib/krucn-agent";
import { ZONES } from "./campus-zones";

// "Cerebro" de Krucn sin IA: entiende preguntas escritas buscando palabras clave
// y responde con el catálogo y las preguntas frecuentes (src/data). Funciona en el
// navegador, sin servidor ni costo. Si la API tiene IA encendida, se usa la IA y
// esto queda como respaldo.

export type BrainMemory = { program?: CatalogProgram };

export type BrainReply = {
  text: string;
  action?: KrucnAction;
  /** Mostrar los botones de lugares para elegir a dónde ir. */
  picker?: boolean;
  /** Respuestas fijas del diálogo (dependen de la posición del jugador). */
  canned?: "where" | "what" | "why";
  /** Programa del que se habló, para entender "muéstrame las materias" después. */
  program?: CatalogProgram;
};

type Faq = { tema: string; pregunta: string; claves: string[]; respuesta: string };
const FAQ = (faq as { preguntas: Faq[] }).preguntas;

export function normalize(s: string) {
  return ` ${s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9@.]+/g, " ")
    .trim()} `;
}

/** ¿Aparece la palabra o raíz? Las de 3 letras o menos deben ser palabra completa ("ia", no "materias"). */
function has(text: string, key: string) {
  const k = normalize(key).trim();
  if (!k) return false;
  return k.length <= 3 ? text.includes(` ${k} `) : text.includes(` ${k}`);
}

const any = (text: string, keys: string[]) => keys.some((k) => has(text, k));

const shortName = (p: CatalogProgram) => p.programa.replace(/\s*\(.*?\)\s*/g, " ").trim();
const schoolOf = (p: CatalogProgram) => catalog.escuelas.find((s) => s.programas.includes(p))!;
const zoneOfSchool = (s: CatalogSchool) => ZONES.find((z) => z.kind === "school" && findCatalogSchool(z.label.es) === s);

// Cómo nombra la gente cada programa (español e inglés). Se busca por raíz.
const PROGRAM_ALIASES: Record<string, string[]> = {
  Cybersecurity: ["cybersecurity", "ciberseg", "cyber", "seguridad informatica", "hacking", "hacker"],
  "Data Science & Applied AI": ["data science", "ciencia de datos", "ciencias de datos", "analitica", "datos", "data"],
  "Artificial Intelligence Engineering": [
    "artificial intelligence",
    "ingenieria de ia",
    "ingenieria en ia",
    "ingenieria de inteligencia",
    "msaie",
    "maestria en ia",
    "maestria en inteligencia",
  ],
  "Business Management and Entrepreneurship": ["business management", "administracion de empresas", "administracion", "emprendimiento", "emprender"],
  "Management and Entrepreneurship": ["msme", "maestria en administracion", "maestria en emprendimiento", "maestria en gerencia", "mba"],
  "Integrative Wellness and Human Performance": [
    "integrative wellness",
    "wellness",
    "bienestar integral",
    "rendimiento humano",
    "human performance",
    "deporte",
  ],
  "Aging Sciences and Health Management": ["aging", "envejecimiento", "adulto mayor", "adultos mayores", "gerontolog", "gestion de salud", "health management"],
  "Applied Neuroscience": ["neurociencia", "neuroscience", "cerebro"],
  "Executive Strategic Longevity Management": ["longevidad", "longevity"],
  "Digital Media": ["digital media", "medios digitales", "multimedia", "contenido digital"],
  "Digital Media, Film & Visual Design": ["film", "cine", "diseno visual", "visual design", "mfa", "audiovisual"],
};

// Intereses → escuela, para asesorar a quien no sabe qué estudiar.
const INTERESTS: Record<string, string[]> = {
  ing: [
    "tecnolog",
    "programa",
    "computa",
    "software",
    "datos",
    "ia",
    "inteligencia artificial",
    "ciberseg",
    "robot",
    "ingenier",
    "sistemas",
    "hack",
    "codigo",
    "technology",
    "coding",
  ],
  neg: ["negocio", "empresa", "emprend", "finanz", "venta", "administr", "marketing", "mercadeo", "gerenc", "liderazgo", "economia", "startup", "business"],
  bie: [
    "salud",
    "bienestar",
    "deporte",
    "ejercicio",
    "psicolog",
    "mente",
    "cerebro",
    "neuro",
    "nutric",
    "envejec",
    "adulto mayor",
    "medicin",
    "cuidar",
    "longevidad",
    "health",
  ],
  dis: [
    "diseno",
    "arte",
    "cine",
    "video",
    "fotograf",
    "comunic",
    "medios",
    "redes sociales",
    "contenido",
    "animacion",
    "creativ",
    "audiovisual",
    "film",
    "design",
  ],
};

const PLACE_WORDS: Record<string, string[]> = {
  ing: ["ingenieria", "engineering"],
  neg: ["negocios", "transformacion de negocios", "business"],
  bie: ["bienestar", "desarrollo humano", "wellness", "well 101", "well101", "clase demo", "clases demo", "demo class", "sauna", "spa", "circuito de repaso", "juego de repaso"],
  dis: ["diseno", "tecnologias de comunicacion", "design"],
  adm: ["admision", "admissions", "inscripciones"],
  cur: ["curriculo", "curriculum"],
  cont: ["certificacion", "educacion continua", "cohete", "plataforma", "lanzamiento", "certification", "rocket"],
  cafe: ["cafeteria", "cafe", "comer", "tomar algo", "conocer gente", "otras personas", "otros estudiantes", "coffee", "meet people"],
  store: ["tienda", "store", "shop", "comprar", "monedas", "coins", "ropa nueva", "accesorios"],
};

const INTENT = {
  where: ["donde estoy", "where am i", "estoy perdid", "me perdi", "i am lost", "im lost"],
  what: ["que es este lugar", "que es esto", "que lugar es", "what is this place"],
  why: ["por que eres un cocodrilo", "porque eres un cocodrilo", "por que cocodrilo", "why are you a crocodile"],
  hello: ["hola", "buenas", "buenos dias", "buenas tardes", "hey", "hi", "hello"],
  thanks: ["gracias", "thank", "genial", "perfecto", "excelente"],
  guide: [
    "llevame",
    "llevarme",
    "lleva me",
    "como llego",
    "como voy",
    "donde queda",
    "donde esta",
    "quiero ir",
    "guiame",
    "acompaname",
    "ir a la",
    "ir al",
    "take me",
    "how do i get",
    "where is",
    "show me the way",
  ],
  signup: ["inscrib", "matricul", "aplicar", "postular", "registrar", "sign up", "enroll", "apply"],
  courses: [
    "materia",
    "asignatura",
    "curso",
    "plan de estudio",
    "pensum",
    "malla",
    "semestre",
    "clases de",
    "que se ve",
    "que veo",
    "courses",
    "subjects",
    "curriculum of",
  ],
  certs: ["certificad", "certificacion", "educacion continua", "curso corto", "cursos cortos", "diplomado", "certificate"],
  master: ["maestria", "master", "posgrado", "postgrado", "graduate"],
  bachelor: ["pregrado", "licenciatura", "bachelor", "carrera profesional", "undergraduate"],
  associate: ["associate", "tecnico", "tecnologo", "carrera corta"],
  advise: [
    "recomiend",
    "aconsej",
    "que estudio",
    "que estudiar",
    "no se que",
    "ayudame a elegir",
    "elegir carrera",
    "me gusta",
    "me gustan",
    "me interesa",
    "me apasiona",
    "soy bueno",
    "soy buena",
    "cual me sirve",
    "help me choose",
    "what should i study",
  ],
  list: ["programas", "carreras", "que puedo estudiar", "que ofrecen", "oferta", "que hay", "programs", "degrees"],
  yes: ["si", "dale", "ok", "listo", "claro", "bueno", "va", "yes", "sure"],
};

const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;

type T = {
  where: string;
  follow: (place: string) => string;
  pick: string;
  program: (p: CatalogProgram, school: string) => string;
  courses: (p: CatalogProgram, groups: number) => string;
  signup: (p?: CatalogProgram) => string;
  email: string;
  certs: (list: string, school?: string) => string;
  noCerts: (school: string) => string;
  level: (label: string, list: string) => string;
  levels: { master: string; bachelor: string; associate: string };
  school: (school: string, list: string) => string;
  advise: (school: string, list: string) => string;
  askInterest: string;
  overview: (list: string) => string;
  faqPending: (q: string) => string;
  faqPartial: string;
  hello: string;
  thanks: string;
  fallback: string;
};

const COPY: Record<Locale, T> = {
  es: {
    where: "",
    follow: (place) => `¡Sígueme! Te llevo a ${place}. Camina detrás de mí y busca la luz sobre el edificio.`,
    pick: "¡Claro! ¿A dónde quieres ir? Elige un lugar y te acompaño hasta la puerta.",
    program: (p, school) =>
      `${shortName(p)} es un ${p.credencial} de la Escuela de ${school}: ${p.creditos} créditos, ${p.modalidad}, con ${p.materias.length} materias. ¿Te muestro sus materias, te llevo a su escuela o prefieres inscribirte?`,
    courses: (p, groups) =>
      `${shortName(p)} tiene ${p.materias.length} materias repartidas en ${groups} ${groups === 1 ? "bloque" : "bloques"}. ¡Te abro el plan completo en el catálogo!`,
    signup: (p) =>
      p
        ? `¡Qué bien! Te abro la lista de interés de ${shortName(p)}: te avisamos cuando abran las inscripciones.`
        : "¡Qué bien! Te abro la lista de interés; ahí eliges tu programa y te avisamos cuando abran las inscripciones.",
    email: "¡Gracias! Para que un asesor te contacte, te abro la lista de interés: así llegan tus datos completos.",
    certs: (list, school) =>
      `${school ? `En ${school} hay` : "Estos son los"} certificados de educación continua: ${list}. ¡Ideales si quieres algo corto y práctico!`,
    noCerts: (school) =>
      `La Escuela de ${school} todavía no tiene certificados de educación continua. Mira los de las otras escuelas en el Catálogo académico.`,
    level: (label, list) => `${label}: ${list}. ¿Cuál te llama la atención? Te cuento más de cualquiera.`,
    levels: { master: "Las maestrías que hay son", bachelor: "Los pregrados (bachelor) que hay son", associate: "El programa associate (carrera corta) es" },
    school: (school, list) => `En la Escuela de ${school} puedes estudiar: ${list}. ¿Te cuento de alguno o te llevo a su edificio?`,
    advise: (school, list) =>
      `¡Eso suena a la Escuela de ${school}! Te recomiendo mirar: ${list}. ¿Te cuento más de alguno, te muestro sus materias o te llevo a la escuela?`,
    askInterest: "¡Te ayudo a elegir! Cuéntame, ¿qué te apasiona más: la tecnología, los negocios, la salud y el bienestar, o el diseño y los medios?",
    overview: (list) =>
      `KUN tiene cuatro escuelas, todas 100% online: ${list}. Además hay certificados cortos de educación continua. ¿Qué te interesa? También puedo ayudarte a elegir.`,
    faqPending: (q) =>
      `Buena pregunta (“${q}”). Todavía no tengo ese dato oficial, ¡no quiero inventarte nada! Escríbele a admisiones a ${ADMISSIONS_EMAIL} y te responden.`,
    faqPartial: `El resto todavía no lo tengo confirmado; escríbele a admisiones a ${ADMISSIONS_EMAIL} y te cuentan.`,
    hello: "¡Hola! 🐊 Pregúntame lo que quieras: carreras, materias, certificados, cómo unirte a la lista de interés… o pídeme que te lleve a algún lugar.",
    thanks: "¡Con gusto! Aquí sigo paseando por el campus si necesitas algo más.",
    fallback: `Mmm, no estoy seguro de haber entendido 🐊. Puedo llevarte a un lugar, contarte de carreras y materias, certificados o la lista de interés. Prueba con: “¿Qué maestrías hay?” o “Llévame a Ingeniería”. Si es otra cosa, escribe a ${ADMISSIONS_EMAIL}.`,
  },
  en: {
    where: "",
    follow: (place) => `Follow me! I'm taking you to ${place}. Walk behind me and look for the light above the building.`,
    pick: "Sure! Where do you want to go? Pick a place and I'll walk you to the door.",
    program: (p, school) =>
      `${shortName(p)} is a ${catalogText(p.credencial, "en")} from the School of ${schoolLabel(school, "en")}: ${catalogText(p.creditos, "en")} credits, ${catalogText(p.modalidad, "en")}, with ${p.materias.length} courses. Want to see its courses, go to its school, or sign up?`,
    courses: (p, groups) =>
      `${shortName(p)} has ${p.materias.length} courses across ${groups} ${groups === 1 ? "block" : "blocks"}. I'm opening the full plan in the catalog!`,
    signup: (p) =>
      p ? `Great! I'm opening the interest list for ${shortName(p)}: we'll let you know when enrollment opens.` : "Great! I'm opening the interest list; pick your program there and we'll let you know when enrollment opens.",
    email: "Thanks! So an advisor can reach you, I'm opening the interest list so your details arrive complete.",
    certs: (list, school) =>
      `${school ? `${schoolLabel(school, "en")} offers these` : "These are the"} continuing education certificates: ${list}. Great if you want something short and practical!`,
    noCerts: (school) => `The School of ${schoolLabel(school, "en")} has no continuing education certificates yet. Check the other schools in the Academic catalog.`,
    level: (label, list) => `${label}: ${list}. Which one catches your eye? I can tell you more about any of them.`,
    levels: { master: "The master's programs are", bachelor: "The bachelor's programs are", associate: "The associate program is" },
    school: (school, list) => `At the School of ${schoolLabel(school, "en")} you can study: ${list}. Want to hear about one, or shall I take you to its building?`,
    advise: (school, list) =>
      `That sounds like the School of ${schoolLabel(school, "en")}! I'd look at: ${list}. Want to know more about one, see its courses, or go to the school?`,
    askInterest: "I'll help you choose! Tell me, what excites you most: technology, business, health and wellness, or design and media?",
    overview: (list) =>
      `KUN has four schools, all 100% online: ${list}. There are also short continuing education certificates. What interests you? I can also help you choose.`,
    faqPending: (q) =>
      `Good question (“${q}”). I don't have that official info yet, and I don't want to make anything up! Write to admissions at ${ADMISSIONS_EMAIL} and they'll answer.`,
    faqPartial: `I don't have the rest confirmed yet; write to admissions at ${ADMISSIONS_EMAIL} and they'll tell you.`,
    hello: "Hi! 🐊 Ask me anything: programs, courses, certificates, the interest list… or ask me to take you somewhere.",
    thanks: "My pleasure! I'll keep strolling around campus if you need anything else.",
    fallback: `Hmm, I'm not sure I understood 🐊. I can take you somewhere, tell you about programs and courses, certificates or the interest list. Try: “What master's programs are there?” or “Take me to Engineering”. For anything else, write to ${ADMISSIONS_EMAIL}.`,
  },
};

function findPrograms(text: string): CatalogProgram[] {
  const all = catalog.escuelas.flatMap((s) => s.programas);
  const scored = all
    .map((p) => {
      const aliases = PROGRAM_ALIASES[shortName(p)] ?? [shortName(p)];
      const score = Math.max(0, ...aliases.filter((a) => has(text, a)).map((a) => a.length));
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return [];
  // Nivel pedido: "maestría en IA" no es el pregrado de datos.
  const wantsMaster = any(text, INTENT.master);
  const wantsBachelor = any(text, INTENT.bachelor);
  const level = scored.filter(({ p }) => (wantsMaster ? /master/i.test(p.credencial) : wantsBachelor ? /b\.s\.|bachelor/i.test(p.credencial) : true));
  const pool = level.length ? level : scored;
  return pool.filter((x) => x.score >= pool[0].score - 2).map((x) => x.p);
}

function findSchool(text: string): CatalogSchool | undefined {
  for (const [id, words] of Object.entries(PLACE_WORDS)) {
    if (!any(text, words)) continue;
    const zone = ZONES.find((z) => z.id === id);
    if (zone?.kind === "school") return findCatalogSchool(zone.label.es);
  }
  return undefined;
}

function findPlace(text: string): string | undefined {
  return Object.entries(PLACE_WORDS).find(([, words]) => any(text, words))?.[0];
}

function bestFaq(text: string): Faq | undefined {
  let best: { f: Faq; score: number } | undefined;
  for (const f of FAQ) {
    const score = Math.max(0, ...f.claves.filter((k) => has(text, k)).map((k) => k.length));
    if (score > 0 && (!best || score > best.score)) best = { f, score };
  }
  return best?.f;
}

const list = (items: string[]) => items.join(", ");
const programList = (ps: CatalogProgram[], locale: Locale) => list(ps.map((p) => `${shortName(p)} (${catalogText(p.credencial, locale)})`));
const groupsOf = (p: CatalogProgram) => new Set(p.materias.map((m) => String(m.periodo))).size;

export function krucnLocalReply(question: string, locale: Locale, memory: BrainMemory, placeName: (zoneId: string) => string): BrainReply {
  const t = COPY[locale];
  const text = normalize(question);
  const words = text.trim().split(" ").filter(Boolean);
  const programs = findPrograms(text);
  const program = programs.length === 1 ? programs[0] : undefined;
  const school = findSchool(text);
  const recent = program ?? memory.program;

  if (any(text, INTENT.where)) return { text: "", canned: "where" };
  if (any(text, INTENT.why)) return { text: "", canned: "why" };
  if (any(text, INTENT.what)) return { text: "", canned: "what" };

  // Guía: "llévame a…", "¿dónde queda…?". El programa nombrado lleva a su escuela.
  if (any(text, INTENT.guide)) {
    // "Llévame a su escuela" usa el programa del que se venía hablando; "llévame" a secas pregunta a dónde.
    const toThatSchool = any(text, ["su escuela", "esa escuela", "esa carrera", "alla", "ahi", "its school", "there"]) || !!program;
    const place = findPlace(text) ?? (toThatSchool && recent ? zoneOfSchool(schoolOf(recent))?.id : undefined);
    if (place) return { text: t.follow(placeName(place)), action: { type: "guide", place }, program: recent };
    return { text: t.pick, picker: true };
  }

  if (EMAIL.test(question)) return { text: t.email, action: { type: "signup", program: recent?.programa ?? "" }, program: recent };

  // Asesoría antes que las preguntas frecuentes: "me gustan las redes sociales" es un interés.
  const advising = any(text, INTENT.advise);
  if (advising || (!program && !school && Object.values(INTERESTS).some((keys) => any(text, keys)) && words.length <= 8)) {
    const scores = Object.entries(INTERESTS)
      .map(([id, keys]) => ({ id, n: keys.filter((k) => has(text, k)).length }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n);
    if (scores.length) {
      const zone = ZONES.find((z) => z.id === scores[0].id)!;
      const s = findCatalogSchool(zone.label.es)!;
      const levelPick = s.programas.filter((p) => (any(text, INTENT.master) ? /master/i.test(p.credencial) : true));
      return { text: t.advise(s.escuela, programList((levelPick.length ? levelPick : s.programas).slice(0, 3), locale)) };
    }
    if (advising) return { text: t.askInterest };
  }

  const wantsCourses = any(text, INTENT.courses);
  const faqHit = bestFaq(text);
  if (faqHit && !wantsCourses && !any(text, INTENT.signup)) {
    // Solo las frases confirmadas; lo que sigue PENDIENTE se remite a admisiones.
    const confirmed = faqHit.respuesta
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => !/PENDIENTE/.test(sentence))
      .join(" ");
    if (!/PENDIENTE/.test(faqHit.respuesta)) return { text: faqHit.respuesta, program: recent };
    if (!confirmed) return { text: t.faqPending(question.trim()), program: recent };
    return { text: `${confirmed} ${t.faqPartial}`, program: recent };
  }

  if (any(text, INTENT.signup)) return { text: t.signup(recent), action: { type: "signup", program: recent?.programa ?? "" }, program: recent };

  if (any(text, INTENT.certs)) {
    if (school) {
      const certs = school.educacion_continua;
      if (!certs.length) return { text: t.noCerts(school.escuela) };
      return { text: t.certs(list(certs.map((c) => `${c.certificado} (${c.horas} h)`)), school.escuela) };
    }
    return { text: t.certs(list(allCertifications().map((c) => `${c.certificado} (${c.horas} h)`))) };
  }

  if (programs.length > 1) return { text: t.level(locale === "es" ? "Encontré varios programas" : "I found several programs", programList(programs, locale)) };

  // "Sí, muéstrame las materias" justo después de hablar de un programa.
  const target = program ?? (wantsCourses || (words.length <= 3 && any(text, INTENT.yes)) ? memory.program : undefined);
  if (target && (wantsCourses || !program)) {
    return { text: t.courses(target, groupsOf(target)), action: { type: "catalog", program: target.programa }, program: target };
  }
  if (program) return { text: t.program(program, schoolOf(program).escuela), program };

  const all = catalog.escuelas.flatMap((s) => s.programas);
  for (const key of ["master", "bachelor", "associate"] as const) {
    if (!any(text, INTENT[key])) continue;
    const re = key === "master" ? /master/i : key === "bachelor" ? /b\.s\.|bachelor/i : /associate/i;
    const ps = all.filter((p) => re.test(p.credencial));
    if (ps.length) return { text: t.level(t.levels[key], programList(ps, locale)) };
  }

  if (school) return { text: t.school(school.escuela, programList(school.programas, locale)) };
  if (any(text, INTENT.list)) return { text: t.overview(list(catalog.escuelas.map((s) => `${schoolLabel(s, locale)} (${s.programas.length})`))) };
  if (any(text, INTENT.thanks)) return { text: t.thanks };
  if (any(text, INTENT.hello)) return { text: t.hello };
  return { text: t.fallback };
}
