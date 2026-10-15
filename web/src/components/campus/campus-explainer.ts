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

/** Título con separación RGB y un temblor tipo glitch al entrar. */
function glitchText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, family: string, t: number, color: string) {
  ctx.font = `900 ${size}px ${family}`;
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
  // Fondo oscuro con manchas de color que respiran.
  ctx.fillStyle = "#0B0618";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 3; i++) {
    const gx = w * (0.25 + 0.25 * i) + Math.sin(time * 0.4 + i * 2) * 80;
    const gy = h * 0.5 + Math.cos(time * 0.3 + i) * 90;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, h * 0.7);
    g.addColorStop(0, i === 1 ? `${ch.accent}AA` : i === 0 ? "#7A4FD066" : "#E8735A55");
    g.addColorStop(1, "rgba(11,6,24,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
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
  glitchText(ctx, ch.title, cx, h * 0.34, ch.title.length > 22 ? 70 : 92, family, local, "#FFF3E6");
  ctx.restore();

  // Gráfica propia de cada capítulo.
  const k = ease((local - 0.15) / 0.5);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (ch.id === "welcome" || ch.id === "start") {
    // Logo "K" en un anillo que se dibuja.
    ctx.strokeStyle = ch.accent;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, h * 0.64, 110, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k);
    ctx.stroke();
    ctx.font = `900 130px ${family}`;
    ctx.fillStyle = "#FFF3E6";
    ctx.globalAlpha = exit * k;
    ctx.fillText(ch.id === "start" ? "→" : "K", cx, h * 0.645);
    ctx.globalAlpha = exit;
    if (ch.id === "start") {
      ctx.font = `700 34px ui-monospace, Consolas, monospace`;
      ctx.fillStyle = "#FFC85C";
      ctx.fillText(ADMISSIONS_EMAIL, cx, h * 0.85);
    }
  } else if (ch.id === "online") {
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
  } else if (ch.id === "numbers") {
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
  } else if (ch.id === "steps") {
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
    const labels = ch.id === "trust" ? ["Florida CIE", "SACSCOC"] : ["?", "✓"];
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
