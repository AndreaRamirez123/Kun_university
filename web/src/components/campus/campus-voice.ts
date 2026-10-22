// Voz de la narración (clases demo y videos de las salas). En español se
// prefiere el acento latinoamericano antes que el de España.

export const voiceLang = (locale: "es" | "en") => (locale === "es" ? "es-MX" : "en-US");

/** Español latino (México, EE. UU., Colombia…) antes que el de España; si no hay, la que exista. */
const LATAM = ["es-MX", "es-US", "es-419", "es-CO", "es-AR", "es-CL", "es-PE", "es-VE"];
export function pickVoice(synth: SpeechSynthesis, locale: "es" | "en") {
  const voices = synth.getVoices();
  if (locale === "en") return voices.find((v) => v.lang === "en-US") ?? null;
  const norm = (l: string) => l.replace("_", "-");
  for (const lang of LATAM) {
    const list = voices.filter((v) => norm(v.lang) === lang);
    // Las voces "Google" o "Natural" suenan mejor que las básicas del sistema.
    const v = list.find((x) => /google|natural|online/i.test(x.name)) ?? list[0];
    if (v) return v;
  }
  return voices.find((v) => norm(v.lang).startsWith("es") && norm(v.lang) !== "es-ES") ?? null;
}

// Chrome carga la lista de voces en segundo plano: pedirla una vez al inicio
// hace que ya esté lista cuando empiece la primera narración.
if (typeof window !== "undefined") window.speechSynthesis?.getVoices();
