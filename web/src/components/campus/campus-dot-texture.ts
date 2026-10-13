import * as THREE from "three";

// Textura de punto suave y redondo para las partículas: sin ella, PointsMaterial
// dibuja cuadrados, que se notan mucho cuando una luciérnaga pasa cerca de la cámara.
let cached: THREE.CanvasTexture | null = null;

export function getDotTexture() {
  if (cached || typeof document === "undefined") return cached;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  cached = new THREE.CanvasTexture(canvas);
  return cached;
}
