"use client";

import { useRef } from "react";

export function TiltCard({
  children,
  baseRotate = 0,
  restShadow = "6px 6px 0 #10101A",
  className = "",
  style,
}: {
  children: React.ReactNode;
  baseRotate?: number;
  restShadow?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function applyTilt(clientX: number, clientY: number) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width - 0.5;
    const py = (clientY - rect.top) / rect.height - 0.5;
    const rotateY = px * 24;
    const rotateX = -py * 24;
    node.style.transition = "transform 0.1s ease-out, box-shadow 0.3s ease-out";
    node.style.transform = `rotate(${baseRotate}deg) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    node.style.boxShadow = "10px 14px 0 #10101A, 0 25px 50px rgba(0,0,0,0.35)";
  }

  function resetTilt() {
    const node = ref.current;
    if (!node) return;
    node.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s ease-out";
    node.style.transform = `rotate(${baseRotate}deg)`;
    node.style.boxShadow = restShadow;
  }

  return (
    <div
      ref={ref}
      onMouseMove={(e) => applyTilt(e.clientX, e.clientY)}
      onMouseLeave={resetTilt}
      onTouchStart={(e) => applyTilt(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => applyTilt(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={resetTilt}
      className={className}
      style={{
        transform: `rotate(${baseRotate}deg)`,
        boxShadow: restShadow,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
