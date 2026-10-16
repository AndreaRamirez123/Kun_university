import type { Locale } from "@/i18n/locale-context";
import type { Stats } from "@/lib/types";
import { ADMISSIONS_EMAIL } from "@/lib/contact";

// Video explicativo de Admisiones, generado en tiempo real sobre un canvas
// (tipografía en movimiento al estilo Active Theory). Mientras no exista un
// video grabado de KUN, esto hace las veces de video: capítulos, subtítulos y
// narración opcional con la voz del navegador.
//
// Para usar un video real más adelante, pon su ruta en ADMISSIONS_VIDEO_URL
// (p. ej. "/videos/admisiones.mp4" dentro de web/public) y la pantalla lo
// reproducirá en lugar de esta animación.
export const ADMISSIONS_VIDEO_URL: string | null = null;

// Videos reales por lugar (id de campus-zones). Si un lugar no tiene video
// grabado, su pantalla muestra la animación generada con sus capítulos.
export const ZONE_VIDEO_URLS: Record<string, string | null> = {
  adm: ADMISSIONS_VIDEO_URL,
  ing: null,
  neg: null,
  bie: null,
  dis: null,
  cur: null,
  cont: null,
};

export const CHAPTER_SECONDS = 9;

export type Chapter = {
  id: string;
  menu: string;
  title: string;
  /** Lo que dice la narración (y el subtítulo). */
  voice: string;
  accent: string;
  // Rótulos de la gráfica del capítulo, ya en el idioma elegido.
  extra?: string[];
  /** Gráfica a dibujar; por defecto se deduce del id. */
  graphic?: "logo" | "world" | "numbers" | "steps" | "seals" | "badge" | "career";
  /** Fondo animado de la escuela. */
  theme?: Theme;
  /** Para la gráfica "career": datos de la carrera y materias destacadas. */
  career?: {
    kicker: string;
    credential: string;
    credits: string;
    modality: string;
    coursesLabel: string;
    courses: Array<{ code: string; name: string }>;
    footer: string;
  };
  /** Para la gráfica "badge": sello arriba, número grande y su unidad. */
  badge?: { top: string; value: number; unit: string };
};

export function explainerChapters(locale: Locale, stats: Stats): Chapter[] {
  if (locale === "en") {
    return [
      { id: "welcome", menu: "Welcome", title: "KUN University AI", voice: "Welcome to KUN University AI, the AI-Native university based in Florida.", accent: "#E8735A" },
      { id: "online", menu: "100% online", title: "Study from anywhere", voice: "Everything is one hundred percent online, so you can study from anywhere in the world, at your own pace.", accent: "#3D6FD9" },
      { id: "numbers", menu: "Programs", title: `${stats.schools} schools · ${stats.programs} programs`, voice: `We have ${stats.schools} schools, ${stats.programs} programs and ${stats.certifications} AI certifications, with a curriculum that updates at the speed of science.`, accent: "#1E9C7E", extra: ["SCHOOLS", "PROGRAMS", "AI CERTS", "% ONLINE"] },
      { id: "steps", menu: "How to enroll", title: "Enrolling takes 3 steps", voice: "Enrolling is easy: pick your program, fill out the form, and an advisor will contact you.", accent: "#FFC85C", extra: ["Pick a program", "Fill out the form", "Talk to an advisor"] },
      { id: "support", menu: "Scholarships & dates", title: "Ask with no commitment", voice: "Ask us about scholarships and start dates. We'll tell you everything, with no commitment.", accent: "#C2387A" },
      { id: "trust", menu: "Accreditation", title: "Florida CIE · SACSCOC", voice: "KUN is listed with the Florida Commission for Independent Education, and SACSCOC institutional accreditation is in progress.", accent: "#7A4FD0" },
      { id: "start", menu: "Start today", title: "Your career starts here", voice: `Ready? Sign up now, or email us at ${ADMISSIONS_EMAIL}.`, accent: "#FF8A4C" },
    ];
  }
  return [
    { id: "welcome", menu: "Bienvenida", title: "KUN University AI", voice: "Bienvenido a KUN University AI, la universidad IA-Native con sede en Florida.", accent: "#E8735A" },
    { id: "online", menu: "100% online", title: "Estudia desde donde estés", voice: "Todo es cien por ciento online: estudias desde cualquier lugar del mundo y a tu ritmo.", accent: "#3D6FD9" },
    { id: "numbers", menu: "Programas", title: `${stats.schools} escuelas · ${stats.programs} programas`, voice: `Tenemos ${stats.schools} escuelas, ${stats.programs} programas y ${stats.certifications} certificaciones en inteligencia artificial, con un currículo que se actualiza a la velocidad de la ciencia.`, accent: "#1E9C7E", extra: ["ESCUELAS", "PROGRAMAS", "CERTIF. IA", "% ONLINE"] },
    { id: "steps", menu: "Cómo inscribirte", title: "Inscribirte son 3 pasos", voice: "Inscribirte es fácil: eliges tu programa, llenas el formulario y un asesor te contacta.", accent: "#FFC85C", extra: ["Elige tu programa", "Llena el formulario", "Habla con un asesor"] },
    { id: "support", menu: "Becas y fechas", title: "Pregunta sin compromiso", voice: "Pregúntanos por becas y fechas de inicio. Te contamos todo, sin compromiso.", accent: "#C2387A" },
    { id: "trust", menu: "Acreditación", title: "Florida CIE · SACSCOC", voice: "KUN está registrada ante la Comisión de Educación Independiente de Florida, y la acreditación institucional SACSCOC está en proceso.", accent: "#7A4FD0" },
    { id: "start", menu: "Empieza hoy", title: "Tu carrera arranca aquí", voice: `¿Listo? Inscríbete ahora o escríbenos a ${ADMISSIONS_EMAIL}.`, accent: "#FF8A4C" },
  ];
}

// ---------------------------------------------------------------- dibujo

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

/** Achica la fuente hasta que el texto quepa en `maxW`. */
function fitFont(ctx: CanvasRenderingContext2D, text: string, size: number, maxW: number, weight: number, family: string) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (s > 22 && ctx.measureText(text).width > maxW) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

/** Corta un texto en líneas que quepan en `maxW` (con la fuente ya puesta). */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxW && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export type Theme = "engineering" | "business" | "wellness" | "design" | "default";

type TitleStyle = "terminal" | "serif" | "soft" | "colorful" | "glitch";

/** Identidad visual de cada escuela: fondo, colores, tipografía y la sala 3D. */
export const THEME_STYLE: Record<
  Theme,
  {
    bg: string;
    blobs: [string, string, string];
    /** Colores de los capítulos, en orden. */
    accents: string[];
    title: TitleStyle;
    /** Color del texto principal. */
    ink: string;
    /** Colores de las nubes de partículas de la sala 3D (RGB > 1 para el brillo). */
    particles: Array<[number, number, number]>;
    sculpture: { kind: "wire" | "metal" | "breath" | "rainbow"; color: string };
  }
> = {
  engineering: {
    bg: "#030A1C",
    blobs: ["#1D4ED8AA", "#06B6D488", "#0F2A6B88"],
    accents: ["#3DD6FF", "#3D6FD9", "#22D3EE", "#60A5FA", "#38BDF8"],
    title: "terminal",
    ink: "#D6F3FF",
    particles: [
      [0.4, 1.2, 2.2],
      [0.3, 1.8, 2.0],
      [0.6, 0.8, 2.4],
      [0.9, 1.4, 1.8],
    ],
    sculpture: { kind: "wire", color: "#3DD6FF" },
  },
  business: {
    bg: "#0E0A04",
    blobs: ["#B4831FAA", "#7C5A1288", "#3A2A0A88"],
    accents: ["#FFC85C", "#D99A1E", "#F2C14E", "#E0B04A", "#FFD98A"],
    title: "serif",
    ink: "#FFF4DA",
    particles: [
      [2.2, 1.6, 0.5],
      [1.8, 1.3, 0.4],
      [2.4, 1.9, 0.9],
      [1.4, 1.1, 0.6],
    ],
    sculpture: { kind: "metal", color: "#D9A63A" },
  },
  wellness: {
    bg: "#03130F",
    blobs: ["#14B8A6AA", "#34D39988", "#0F5C4E88"],
    accents: ["#5EEAD4", "#1E9C7E", "#86EFAC", "#2DD4BF", "#A7F3D0"],
    title: "soft",
    ink: "#E8FFF6",
    particles: [
      [0.5, 2.0, 1.5],
      [0.8, 2.2, 1.0],
      [0.4, 1.6, 1.8],
      [1.2, 1.9, 1.4],
    ],
    sculpture: { kind: "breath", color: "#5EEAD4" },
  },
  design: {
    bg: "#14041A",
    blobs: ["#C2387AAA", "#FF7A5988", "#8E3FB888"],
    accents: ["#FF4FA3", "#FF7A59", "#B26BFF", "#FFC85C", "#3D6FD9"],
    title: "colorful",
    ink: "#FFF0F7",
    particles: [
      [2.2, 0.5, 1.4],
      [2.4, 1.1, 0.5],
      [1.3, 0.6, 2.4],
      [2.2, 1.9, 0.6],
    ],
    sculpture: { kind: "rainbow", color: "#FF4FA3" },
  },
  default: {
    bg: "#0B0618",
    blobs: ["#7A4FD066", "#E8735A88", "#E8735A55"],
    accents: ["#E8735A", "#3D6FD9", "#1E9C7E", "#FFC85C", "#C2387A", "#7A4FD0", "#FF8A4C"],
    title: "glitch",
    ink: "#FFF3E6",
    particles: [
      [1.6, 0.5, 1.4],
      [0.6, 1.5, 0.9],
      [0.9, 0.7, 1.8],
      [1.4, 1.1, 0.6],
    ],
    sculpture: { kind: "rainbow", color: "#C9A0FF" },
  },
};

const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "ui-monospace, Consolas, monospace";

/** Fuente de títulos según el estilo de la escuela. */
function titleFamily(style: TitleStyle, family: string) {
  return style === "serif" ? SERIF : style === "terminal" ? MONO : family;
}

/** Título central con el estilo propio de cada escuela. */
function drawTitle(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, family: string, local: number, time: number, theme: Theme) {
  const st = THEME_STYLE[theme];
  if (st.title === "glitch") {
    glitchText(ctx, text, x, y, size, family, local, st.ink);
    return;
  }
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (st.title === "terminal") {
    // Se escribe letra por letra, con prompt y cursor parpadeante.
    const s = fitFont(ctx, `> ${text}_`, size * 0.82, 1280 * 0.86, 800, MONO);
    const shown = text.slice(0, Math.ceil(Math.min(1, local / 0.25) * text.length));
    const full = `> ${text}`;
    const fullW = ctx.measureText(full).width;
    ctx.textAlign = "left";
    const left = x - fullW / 2;
    ctx.fillStyle = st.accents[0];
    ctx.fillText(">", left, y);
    ctx.fillStyle = st.ink;
    ctx.shadowColor = st.accents[0];
    ctx.shadowBlur = 18;
    ctx.fillText(shown, left + ctx.measureText("> ").width, y);
    if (Math.floor(time * 2) % 2 === 0) {
      ctx.fillStyle = st.accents[0];
      ctx.fillRect(left + ctx.measureText(`> ${shown}`).width + 4, y - s * 0.4, s * 0.45, s * 0.8);
    }
  } else if (st.title === "serif") {
    // Serif elegante con filetes dorados arriba y abajo.
    const s = fitFont(ctx, text, size * 0.95, 1280 * 0.8, 700, SERIF);
    const reveal = ease(local / 0.2);
    const g = ctx.createLinearGradient(x - 300, y - s, x + 300, y + s);
    g.addColorStop(0, "#FFE7A3");
    g.addColorStop(0.5, "#D9A63A");
    g.addColorStop(1, "#FFF4DA");
    ctx.fillStyle = g;
    ctx.globalAlpha *= reveal;
    ctx.fillText(text, x, y);
    const tw = ctx.measureText(text).width * reveal;
    ctx.fillStyle = "#D9A63A";
    ctx.fillRect(x - tw / 2, y - s * 0.75, tw, 2);
    ctx.fillRect(x - tw / 2, y + s * 0.7, tw, 2);
  } else if (st.title === "soft") {
    // Aparece despacio, como una respiración.
    const s = fitFont(ctx, text, size * 0.95, 1280 * 0.84, 700, family);
    const breathe = 1 + Math.sin(time * 1.6) * 0.015;
    ctx.globalAlpha *= ease(local / 0.35);
    ctx.translate(x, y);
    ctx.scale(breathe, breathe);
    ctx.shadowColor = st.accents[0];
    ctx.shadowBlur = 30;
    ctx.fillStyle = st.ink;
    ctx.fillText(text, 0, 0);
    void s;
  } else {
    // Cada letra de un color, con un leve bamboleo.
    const s = fitFont(ctx, text, size * 1.05, 1280 * 0.86, 900, family);
    const total = ctx.measureText(text).width;
    let cx = x - total / 2;
    ctx.textAlign = "left";
    [...text].forEach((ch, i) => {
      const cw = ctx.measureText(ch).width;
      const appear = ease((local - i * 0.012) / 0.15);
      ctx.save();
      ctx.translate(cx + cw / 2, y + Math.sin(time * 3 + i * 0.6) * 6 + (1 - appear) * 40);
      ctx.rotate(Math.sin(time * 2 + i) * 0.05);
      ctx.globalAlpha *= appear;
      ctx.fillStyle = ch === " " ? "transparent" : st.accents[i % st.accents.length];
      ctx.textAlign = "center";
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      cx += cw;
    });
    void s;
  }
  ctx.restore();
}

/** Fondo animado propio de cada escuela, para que cada video se sienta distinto. */
function drawTheme(ctx: CanvasRenderingContext2D, w: number, h: number, theme: Theme, accent: string, time: number) {
  ctx.save();
  if (theme === "engineering") {
    // Lluvia de código binario.
    ctx.font = `700 18px ui-monospace, Consolas, monospace`;
    ctx.textAlign = "center";
    for (let c = 0; c < 34; c++) {
      const x = (c + 0.5) * (w / 34);
      const speed = 60 + ((c * 37) % 90);
      for (let r = 0; r < 9; r++) {
        const y = ((time * speed + r * 90 + c * 53) % (h + 90)) - 45;
        ctx.fillStyle = `rgba(110,170,255,${0.07 + (r === 0 ? 0.18 : 0)})`;
        ctx.fillText((c * 7 + r + Math.floor(time * 3)) % 2 ? "1" : "0", x, y);
      }
    }
    // Circuito.
    ctx.strokeStyle = `${accent}55`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const y = h * (0.12 + i * 0.15);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w * 0.12, y);
      ctx.lineTo(w * 0.16, y + 30);
      ctx.moveTo(w, y + 20);
      ctx.lineTo(w * 0.88, y + 20);
      ctx.lineTo(w * 0.84, y - 10);
      ctx.stroke();
    }
  } else if (theme === "business") {
    // Gráfica de mercado que sube y velas.
    ctx.strokeStyle = `${accent}66`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 16) {
      const y = h * 0.92 - (x / w) * h * 0.45 - Math.sin(x * 0.02 + time * 1.4) * 30 - Math.sin(x * 0.007) * 40;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (let i = 0; i < 22; i++) {
      const x = 30 + i * (w / 22);
      const bh = 40 + ((i * 53 + Math.floor(time * 2) * 7) % 110);
      ctx.fillStyle = i % 3 ? "rgba(255,200,92,0.09)" : "rgba(30,156,126,0.12)";
      ctx.fillRect(x, h - bh - 10, 22, bh);
    }
  } else if (theme === "wellness") {
    // Ondas de pulso que se expanden y línea de latido.
    for (let i = 0; i < 4; i++) {
      const r = ((time * 90 + i * 160) % 640) + 20;
      ctx.strokeStyle = `rgba(82,199,167,${0.28 * (1 - r / 660)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = `${accent}88`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    const base = h * 0.88;
    for (let x = 0; x <= w; x += 6) {
      const phase = (x + time * 260) % 320;
      const beat = phase > 140 && phase < 180 ? -Math.sin(((phase - 140) / 40) * Math.PI * 2) * 60 : 0;
      if (x === 0) ctx.moveTo(x, base + beat);
      else ctx.lineTo(x, base + beat);
    }
    ctx.stroke();
  } else if (theme === "design") {
    // Formas de colores flotando y tira de película.
    const colors = ["#C2387A", "#FFC85C", "#3D6FD9", "#FF7A59", "#8E3FB8"];
    for (let i = 0; i < 12; i++) {
      const x = ((i * 137 + time * (20 + i * 4)) % (w + 120)) - 60;
      const y = h * (0.1 + ((i * 61) % 80) / 100);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(time * 0.4 + i);
      ctx.fillStyle = `${colors[i % colors.length]}2E`;
      if (i % 3 === 0) ctx.fillRect(-26, -26, 52, 52);
      else if (i % 3 === 1) {
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -34);
        ctx.lineTo(30, 24);
        ctx.lineTo(-30, 24);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, h - 64, w, 64);
    ctx.fillStyle = "rgba(255,243,230,0.16)";
    const off = (time * 80) % 60;
    for (let x = -60 + off; x < w; x += 60) {
      ctx.fillRect(x, h - 56, 34, 14);
      ctx.fillRect(x, h - 22, 34, 14);
    }
  }
  ctx.restore();
}

/** Pantalla de una carrera: qué es, cuánto dura y qué materias vas a ver. */
function drawCareer(ctx: CanvasRenderingContext2D, w: number, h: number, chapters: Chapter[], index: number, local: number, family: string) {
  const ch = chapters[index];
  const c = ch.career!;
  const enter = ease(local / 0.18);
  const exit = local > 0.9 ? 1 - (local - 0.9) / 0.1 : 1;
  ctx.globalAlpha = exit;
  const left = 90;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 22px ui-monospace, Consolas, monospace`;
  ctx.fillStyle = "rgba(255,243,230,0.6)";
  ctx.fillText(`0${index + 1} / 0${chapters.length}  ·  ${c.kicker.toUpperCase()}`, left, 92);

  // Nombre de la carrera, en hasta dos líneas.
  ctx.save();
  ctx.translate((1 - enter) * -50, 0);
  const st = THEME_STYLE[ch.theme ?? "default"];
  const tFamily = titleFamily(st.title, family);
  const tWeight = st.title === "serif" || st.title === "soft" ? 700 : 900;
  const size = fitFont(ctx, ch.title, st.title === "terminal" ? 52 : 64, (w - left * 2) * 1.6, tWeight, tFamily);
  const lines = wrapLines(ctx, ch.title, w - left * 2).slice(0, 2);
  ctx.fillStyle = st.ink;
  if (st.title === "terminal" || st.title === "soft") {
    ctx.shadowColor = st.accents[0];
    ctx.shadowBlur = st.title === "soft" ? 26 : 14;
  }
  lines.forEach((ln, i) => {
    if (st.title === "colorful") ctx.fillStyle = st.accents[i % st.accents.length];
    ctx.fillText(st.title === "terminal" && i === 0 ? `> ${ln}` : ln, left, 165 + i * (size + 6));
  });
  ctx.shadowBlur = 0;
  if (st.title === "serif") {
    ctx.fillStyle = "#D9A63A";
    ctx.fillRect(left, 165 + (lines.length - 1) * (size + 6) + 16, 220, 2);
  }
  ctx.restore();
  const afterTitle = 165 + (lines.length - 1) * (size + 6);

  // Datos: credencial, créditos y modalidad.
  const facts = [c.credential, c.credits, c.modality];
  let fx = left;
  ctx.font = `800 22px ${family}`;
  facts.forEach((f, i) => {
    const text = fitText(ctx, f, 360);
    const tw = ctx.measureText(text).width + 36;
    const a = Math.max(0, Math.min(1, (local - 0.08 - i * 0.05) / 0.12));
    ctx.globalAlpha = exit * a;
    ctx.fillStyle = i === 0 ? ch.accent : "rgba(255,255,255,0.1)";
    roundRect(ctx, fx, afterTitle + 34, tw, 46, 23);
    ctx.fill();
    ctx.fillStyle = i === 0 ? "#FFFFFF" : "#FFF3E6";
    ctx.fillText(text, fx + 18, afterTitle + 65);
    fx += tw + 12;
  });
  ctx.globalAlpha = exit;

  // Materias destacadas que aparecen una a una.
  const top = afterTitle + 130;
  ctx.font = `700 20px ui-monospace, Consolas, monospace`;
  ctx.fillStyle = "rgba(255,243,230,0.55)";
  ctx.fillText(c.coursesLabel.toUpperCase(), left, top);
  c.courses.forEach((course, i) => {
    const a = Math.max(0, Math.min(1, (local - 0.22 - i * 0.07) / 0.1));
    if (a <= 0) return;
    const y = top + 26 + i * 54;
    ctx.globalAlpha = exit * a;
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundRect(ctx, left + (1 - a) * 40, y, w - left * 2, 44, 12);
    ctx.fill();
    ctx.fillStyle = ch.accent;
    ctx.fillRect(left + (1 - a) * 40, y, 5, 44);
    ctx.font = `700 18px ui-monospace, Consolas, monospace`;
    ctx.fillStyle = "rgba(255,243,230,0.55)";
    ctx.fillText(course.code, left + 22 + (1 - a) * 40, y + 29);
    ctx.font = `800 23px ${family}`;
    ctx.fillStyle = "#FFF3E6";
    ctx.fillText(fitText(ctx, course.name, w - left * 2 - 220), left + 150 + (1 - a) * 40, y + 30);
  });
  ctx.globalAlpha = exit;
  ctx.font = `700 19px ui-monospace, Consolas, monospace`;
  ctx.fillStyle = "rgba(255,243,230,0.5)";
  ctx.fillText(c.footer, left, h - 40);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(0, h - 8, w, 8);
  ctx.fillStyle = ch.accent;
  ctx.fillRect(0, h - 8, w * ((index + local) / chapters.length), 8);
}

/** Recorta con "…" si no cabe. */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 4 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t}…`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Título con separación RGB y un temblor tipo glitch al entrar. */
function glitchText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, family: string, t: number, color: string) {
  fitFont(ctx, text, size, 1280 * 0.86, 900, family);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Glitch fuerte solo al entrar; después, un parpadeo muy ocasional.
  const jitter = t < 0.2 ? (1 - t / 0.2) * 16 : Math.random() < 0.01 ? 5 : 0;
  ctx.globalCompositeOperation = "lighter";
  const split = jitter > 0 ? 0.55 : 0.28;
  ctx.fillStyle = `rgba(255,40,90,${split})`;
  ctx.fillText(text, x - jitter - 2, y);
  ctx.fillStyle = `rgba(40,200,255,${split})`;
  ctx.fillText(text, x + jitter + 2, y);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

/**
 * Dibuja el frame del capítulo `index` en el instante `local` (0–1 del capítulo).
 * `time` es el reloj global, para animaciones continuas del fondo.
 */
export function drawExplainer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  chapters: Chapter[],
  index: number,
  local: number,
  time: number,
  family: string,
  stats: Stats,
) {
  const ch = chapters[index];
  const theme = ch.theme ?? "default";
  const style = THEME_STYLE[theme];
  // Fondo oscuro con manchas de color que respiran, en la paleta de la escuela.
  ctx.fillStyle = style.bg;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 3; i++) {
    const gx = w * (0.25 + 0.25 * i) + Math.sin(time * 0.4 + i * 2) * 80;
    const gy = h * 0.5 + Math.cos(time * 0.3 + i) * 90;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, h * 0.7);
    g.addColorStop(0, i === 1 ? `${ch.accent}AA` : style.blobs[i]);
    g.addColorStop(1, "rgba(11,6,24,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  drawTheme(ctx, w, h, ch.theme ?? "default", ch.accent, time);

  if ((ch.graphic ?? "") === "career" && ch.career) {
    drawCareer(ctx, w, h, chapters, index, local, family);
    return;
  }

  const cx = w / 2;
  const enter = ease(local / 0.18);
  const exit = local > 0.9 ? 1 - (local - 0.9) / 0.1 : 1;
  ctx.globalAlpha = exit;

  // Etiqueta del capítulo.
  ctx.font = `700 26px ui-monospace, Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,243,230,0.6)";
  ctx.fillText(`0${index + 1} / 0${chapters.length}  ·  ${ch.menu.toUpperCase()}`, cx, h * 0.16);

  ctx.save();
  ctx.translate(0, (1 - enter) * 60);
  drawTitle(ctx, ch.title, cx, h * 0.34, ch.title.length > 22 ? 70 : 92, family, local, time, theme);
  ctx.restore();

  // Gráfica propia de cada capítulo.
  const k = ease((local - 0.15) / 0.5);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const graphic =
    ch.graphic ??
    (ch.id === "welcome" || ch.id === "start"
      ? "logo"
      : ch.id === "online"
        ? "world"
        : ch.id === "numbers"
          ? "numbers"
          : ch.id === "steps"
            ? "steps"
            : "seals");
  if (graphic === "badge" && ch.badge) {
    // Sello con el título del programa a la izquierda y un contador grande a la derecha.
    const bx = cx - 230;
    ctx.save();
    ctx.translate(bx, h * 0.64);
    ctx.rotate(time * 0.25);
    ctx.strokeStyle = ch.accent;
    ctx.lineWidth = 8;
    ctx.setLineDash([22, 12]);
    ctx.beginPath();
    ctx.arc(0, 0, 120 * k, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.globalAlpha = exit * k;
    ctx.fillStyle = ch.accent;
    ctx.beginPath();
    ctx.arc(bx, h * 0.64, 92, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `900 ${ch.badge.top.length > 4 ? 44 : 64}px ${family}`;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(ch.badge.top, bx, h * 0.645);
    ctx.font = `900 150px ${family}`;
    ctx.fillStyle = "#FFF3E6";
    ctx.fillText(String(Math.round(ch.badge.value * k)), cx + 200, h * 0.6);
    ctx.font = `700 28px ui-monospace, Consolas, monospace`;
    ctx.fillStyle = "rgba(255,243,230,0.7)";
    ctx.fillText(ch.badge.unit, cx + 200, h * 0.76);
    ctx.globalAlpha = exit;
  } else if (graphic === "logo") {
    // Logo "K" en un anillo que se dibuja.
    ctx.strokeStyle = ch.accent;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, h * 0.64, 110, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k);
    ctx.stroke();
    ctx.font = `900 130px ${family}`;
    ctx.fillStyle = "#FFF3E6";
    ctx.globalAlpha = exit * k;
    ctx.fillText(ch.id === "start" ? "→" : (ch.extra?.[0] ?? "K"), cx, h * 0.645);
    ctx.globalAlpha = exit;
    if (ch.id === "start" && !ch.extra) {
      ctx.font = `700 34px ui-monospace, Consolas, monospace`;
      ctx.fillStyle = "#FFC85C";
      ctx.fillText(ADMISSIONS_EMAIL, cx, h * 0.85);
    }
  } else if (graphic === "world") {
    // Puntos del mundo conectados con Florida.
    const fl = { x: cx - 120, y: h * 0.62 };
    const cities = [
      [-420, -60], [-300, 80], [-150, -110], [60, -40], [200, 90], [330, -90], [430, 40], [120, 140],
    ];
    cities.forEach(([dx, dy], i) => {
      const p = Math.max(0, Math.min(1, k * 1.6 - i * 0.08));
      const x = cx + dx;
      const y = h * 0.62 + dy;
      ctx.strokeStyle = `rgba(255,243,230,${0.5 * p})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fl.x, fl.y);
      ctx.quadraticCurveTo((fl.x + x) / 2, Math.min(fl.y, y) - 80, fl.x + (x - fl.x) * p, fl.y + (y - fl.y) * p);
      ctx.stroke();
      ctx.fillStyle = ch.accent;
      ctx.beginPath();
      ctx.arc(x, y, 8 * p, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#FFC85C";
    ctx.beginPath();
    ctx.arc(fl.x, fl.y, 16 + Math.sin(time * 4) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `800 28px ${family}`;
    ctx.fillText("Florida", fl.x, fl.y + 40);
  } else if (graphic === "numbers") {
    const names = ch.extra ?? [];
    const items = [
      [stats.schools, names[0]],
      [stats.programs, names[1]],
      [stats.certifications, names[2]],
      [stats.online, names[3]],
    ] as const;
    items.forEach(([n, label], i) => {
      const x = cx + (i - 1.5) * 250;
      ctx.font = `900 120px ${family}`;
      ctx.fillStyle = i % 2 ? ch.accent : "#FFF3E6";
      ctx.fillText(String(Math.round(n * k)), x, h * 0.62);
      ctx.font = `700 24px ui-monospace, Consolas, monospace`;
      ctx.fillStyle = "rgba(255,243,230,0.65)";
      ctx.fillText(label ?? "", x, h * 0.75);
    });
  } else if (graphic === "steps") {
    ["1", "2", "3"].forEach((n, i) => {
      const p = Math.max(0, Math.min(1, k * 1.8 - i * 0.35));
      const x = cx + (i - 1) * 330;
      ctx.globalAlpha = exit * p;
      ctx.fillStyle = ch.accent;
      ctx.beginPath();
      ctx.arc(x, h * 0.6, 64, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `900 72px ${family}`;
      ctx.fillStyle = "#24123F";
      ctx.fillText(n, x, h * 0.605);
      const labels = ch.extra ?? [];
      ctx.font = `800 30px ${family}`;
      ctx.fillStyle = "#FFF3E6";
      ctx.fillText(labels[i] ?? "", x, h * 0.76);
      if (i < 2) {
        ctx.strokeStyle = "rgba(255,243,230,0.4)";
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(x + 80, h * 0.6);
        ctx.lineTo(x + 250, h * 0.6);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    ctx.globalAlpha = exit;
  } else {
    // Becas / acreditación: sellos que giran.
    const labels = ch.extra ?? (ch.id === "trust" ? ["Florida CIE", "SACSCOC"] : ["?", "✓"]);
    labels.forEach((label, i) => {
      const x = cx + (i ? 200 : -200);
      ctx.save();
      ctx.translate(x, h * 0.64);
      ctx.rotate((i ? -1 : 1) * time * 0.3);
      ctx.strokeStyle = i ? ch.accent : "#FFC85C";
      ctx.lineWidth = 6;
      ctx.setLineDash([16, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, 130 * k, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.font = `900 ${label.length > 3 ? 40 : 90}px ${family}`;
      ctx.fillStyle = "#FFF3E6";
      ctx.globalAlpha = exit * k;
      ctx.fillText(label, x, h * 0.645);
      ctx.globalAlpha = exit;
    });
  }

  ctx.globalAlpha = 1;
  // Líneas de escaneo y barra de progreso del capítulo.
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(0, h - 8, w, 8);
  ctx.fillStyle = ch.accent;
  ctx.fillRect(0, h - 8, w * ((index + local) / chapters.length), 8);
}
