"use client";

import { useEffect, useRef } from "react";

export function Parallax({
  children,
  speed = 0.2,
  mouseDepth = 0,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  mouseDepth?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    function update() {
      ticking = false;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewportMiddle = window.innerHeight / 2;
      const elementMiddle = rect.top + rect.height / 2;
      const scrollOffset = (viewportMiddle - elementMiddle) * speed;
      const mouseX = mouseDepth ? mouse.current.x * mouseDepth : 0;
      const mouseY = mouseDepth ? mouse.current.y * mouseDepth : 0;
      node.style.transform = `translate3d(${mouseX}px, ${-scrollOffset + mouseY}px, 0)`;
    }

    function schedule() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    function onMouseMove(e: MouseEvent) {
      mouse.current = {
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      };
      schedule();
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    if (mouseDepth) window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (mouseDepth) window.removeEventListener("mousemove", onMouseMove);
    };
  }, [speed, mouseDepth]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
