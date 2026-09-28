"use client";

import { useEffect, useRef, useState } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
  style,
  variant = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  variant?: "up" | "left" | "right" | "flip";
}) {
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [phase, setPhase] = useState<"hidden" | "animating" | "done">(
    prefersReducedMotion ? "done" : "hidden",
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPhase("animating");
        observer.disconnect();
      },
      { threshold: 0.2, rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (phase !== "animating") return;
    const node = ref.current;
    if (!node) return;

    function onEnd() {
      setPhase("done");
    }
    node.addEventListener("animationend", onEnd);
    return () => node.removeEventListener("animationend", onEnd);
  }, [phase]);

  const suffix = variant === "up" ? "" : `-${variant}`;
  const phaseClass =
    phase === "hidden"
      ? `reveal-hidden${suffix}`
      : phase === "animating"
        ? `reveal-animate${suffix}`
        : "reveal-done";

  return (
    <div
      ref={ref}
      className={`${phaseClass} ${className}`}
      style={{ ...style, animationDelay: phase === "animating" ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}
