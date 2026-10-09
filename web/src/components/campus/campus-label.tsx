"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Letrero flotante renderizado en un canvas 2D y usado como textura de un sprite.
// Evita depender de una fuente remota (a diferencia de drei <Text>, que por defecto
// descarga una fuente de un CDN externo — el mismo tipo de dependencia frágil que
// ya nos rompió la Fase 1 con <Environment preset>).
function makeLabelTexture(text: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.font = "700 46px system-ui, -apple-system, Segoe UI, sans-serif";
  const paddingX = 32;
  const textWidth = ctx.measureText(text).width;
  const boxWidth = Math.min(480, textWidth + paddingX * 2);
  const boxHeight = 88;
  const x = (canvas.width - boxWidth) / 2;
  const y = (canvas.height - boxHeight) / 2;
  const radius = boxHeight / 2;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + boxWidth, y, x + boxWidth, y + boxHeight, radius);
  ctx.arcTo(x + boxWidth, y + boxHeight, x, y + boxHeight, radius);
  ctx.arcTo(x, y + boxHeight, x, y, radius);
  ctx.arcTo(x, y, x + boxWidth, y, radius);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#FFF8F0";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function CampusLabel({
  text,
  color,
  position,
}: {
  text: string;
  color: string;
  position: [number, number, number];
}) {
  const texture = useMemo(() => (typeof document !== "undefined" ? makeLabelTexture(text, color) : null), [text, color]);
  if (!texture) return null;

  return (
    <sprite position={position} scale={[4, 1, 1]} renderOrder={5}>
      <spriteMaterial map={texture} depthTest={false} transparent />
    </sprite>
  );
}
