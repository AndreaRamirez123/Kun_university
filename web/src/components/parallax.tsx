"use client";

import { useEffect, useRef } from "react";

export function Parallax({
  children,
  speed = 0.2,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

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
      const offset = (viewportMiddle - elementMiddle) * speed;
      node.style.transform = `translate3d(0, ${-offset}px, 0)`;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
