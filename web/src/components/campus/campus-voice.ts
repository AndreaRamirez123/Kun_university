// Voz de la narración (clases demo y videos de las salas). En español se
// prefiere el acento latinoamericano antes que el de España.

/** Voz de Krucn: la misma voz latina, más grave y juguetona (solo con el sonido del campus activado). */
export function speakKrucn(text: string, locale: "es" | "en") {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!synth) return;
  synth.cancel();
  // Sin emojis ni símbolos que la voz leería en voz alta.
  const clean = text.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "").replace(/[*_#>•·→]/g, " ").trim();
  if (!clean) return;
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = voiceLang(locale);
  const v = pickVoice(synth, locale);
  if (v) u.voice = v;
  u.pitch = 0.7;
  u.rate = 1.05;
  synth.speak(u);
}

export function stopKrucn() {
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

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
