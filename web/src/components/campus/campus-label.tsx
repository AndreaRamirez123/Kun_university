"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

// Letrero flotante renderizado en un canvas 2D y usado como textura de un sprite.
// Evita depender de una fuente remota (a diferencia de drei <Text>, que por defecto
// descarga una fuente de un CDN externo — el mismo tipo de dependencia frágil que
// ya nos rompió la Fase 1 con <Environment preset>). Usa la Gabarito que ya cargó
// next/font en el layout del campus, leyendo su nombre real desde la variable CSS.
function labelFontFamily() {
  const root = document.getElementById("campus-root") ?? document.body;
  const family = getComputedStyle(root).getPropertyValue("--font-gabarito").trim();
  return family || "system-ui, -apple-system, Segoe UI, sans-serif";
}

function makeLabelTexture(text: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.font = `800 104px ${labelFontFamily()}`;
  const paddingX = 64;
  const textWidth = ctx.measureText(text).width;
  const boxWidth = Math.min(1000, textWidth + paddingX * 2);
  const boxHeight = 184;
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
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// Re-dibuja los letreros cuando termina de cargar la fuente, para no quedarse
// con la tipografía de respaldo si el canvas se pintó antes.
function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}

export function CampusLabel({
  text,
  color,
  position,
  width = 8,
}: {
  text: string;
  color: string;
  position: [number, number, number];
  width?: number;
}) {
  const fontsReady = useFontsReady();
  const texture = useMemo(
    () => (typeof document !== "undefined" ? makeLabelTexture(text, color) : null),
    // fontsReady fuerza a regenerar la textura con la fuente definitiva.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, color, fontsReady],
  );
  useEffect(() => () => texture?.dispose(), [texture]);
  if (!texture) return null;

  return (
    <sprite position={position} scale={[width, width / 4, 1]} renderOrder={5}>
      <spriteMaterial map={texture} depthTest={false} transparent toneMapped={false} fog={false} />
    </sprite>
  );
}
