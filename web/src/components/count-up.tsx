"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({
  value,
  suffix = "",
  duration = 1200,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Muestra siempre la cifra real (también antes de animar, en capturas o sin JS):
  // nunca un "0" que haga parecer que no hay escuelas ni programas.
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          // Sube desde la mitad, no desde 0, y nunca queda por debajo de 0.
          setDisplay(Math.max(0, Math.round(value * (0.5 + 0.5 * eased))));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration, prefersReducedMotion]);

  return (
    <div ref={ref}>
      {display}
      {suffix}
    </div>
  );
}
