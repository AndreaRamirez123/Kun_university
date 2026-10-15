// Toma una foto (selfie o archivo) y estima el tono de piel y el color de pelo
// para parecerse a la persona, como cuando un Mii se arma "a partir de una foto".
// Todo ocurre en el navegador: la imagen no se envía ni se guarda en ningún lado.

type Box = { x: number; y: number; w: number; h: number };

type FaceDetectorLike = { detect: (img: ImageBitmap) => Promise<Array<{ boundingBox: DOMRectReadOnly }>> };

async function detectFace(bitmap: ImageBitmap): Promise<Box | null> {
  // Shape Detection API: existe en algunos navegadores (p. ej. Chrome en Android
  // y macOS). Si no está, se asume una selfie con la cara centrada.
  const Ctor = (window as unknown as { FaceDetector?: new (o: object) => FaceDetectorLike }).FaceDetector;
  if (!Ctor) return null;
  try {
    const faces = await new Ctor({ fastMode: true, maxDetectedFaces: 1 }).detect(bitmap);
    const b = faces[0]?.boundingBox;
    return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null;
  } catch {
    return null;
  }
}

function average(data: Uint8ClampedArray, w: number, box: Box) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const x0 = Math.max(0, Math.floor(box.x));
  const y0 = Math.max(0, Math.floor(box.y));
  const x1 = Math.min(w, Math.floor(box.x + box.w));
  const y1 = Math.floor(box.y + box.h);
  const lum: number[] = [];
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * w + x) * 4;
      lum.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }
  }
  // Descarta brillos y sombras extremas (reflejos, fondo) usando el rango medio.
  const sorted = [...lum].sort((a, z) => a - z);
  const lo = sorted[Math.floor(sorted.length * 0.2)] ?? 0;
  const hi = sorted[Math.floor(sorted.length * 0.8)] ?? 255;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * w + x) * 4;
      const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (l < lo || l > hi) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  if (!n) return null;
  return [r / n, g / n, b / n] as const;
}

const hex = ([r, g, b]: readonly [number, number, number]) =>
  `#${[r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;

export type PhotoTraits = { skin: string; hair: string; preview: string; detected: boolean };

export async function analyzePhoto(file: File): Promise<PhotoTraits> {
  const bitmap = await createImageBitmap(file);
  const size = 320;
  const scale = size / Math.max(bitmap.width, bitmap.height);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);

  const detected = await detectFace(bitmap);
  const face: Box = detected
    ? { x: detected.x * scale, y: detected.y * scale, w: detected.w * scale, h: detected.h * scale }
    : { x: w * 0.3, y: h * 0.22, w: w * 0.4, h: h * 0.5 };
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, w, h);
  // Mejillas: franja media de la cara, evitando ojos y boca.
  const skin = average(data, w, { x: face.x + face.w * 0.18, y: face.y + face.h * 0.5, w: face.w * 0.64, h: face.h * 0.18 });
  // Pelo: justo encima de la frente.
  const hair = average(data, w, { x: face.x + face.w * 0.25, y: face.y - face.h * 0.12, w: face.w * 0.5, h: face.h * 0.16 });

  // Miniatura circular para mostrarle a la persona qué foto se usó.
  const thumb = document.createElement("canvas");
  thumb.width = 96;
  thumb.height = 96;
  const tctx = thumb.getContext("2d");
  if (tctx) {
    const side = Math.max(face.w, face.h) * 1.4;
    tctx.drawImage(canvas, face.x + face.w / 2 - side / 2, face.y + face.h / 2 - side / 2, side, side, 0, 0, 96, 96);
  }

  return {
    skin: skin ? hex(skin) : "#D49A6A",
    hair: hair ? hex(hair) : "#3B2618",
    preview: thumb.toDataURL("image/jpeg", 0.8),
    detected: !!detected,
  };
}
