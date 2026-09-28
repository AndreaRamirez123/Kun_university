"use client";

import { useState } from "react";

export function FlipText({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [spinKey, setSpinKey] = useState(0);

  const trigger = () => setSpinKey((k) => k + 1);

  return (
    <span
      className="inline-block cursor-pointer"
      onMouseEnter={trigger}
      onClick={trigger}
    >
      <span
        key={spinKey}
        className={`inline-block ${spinKey > 0 ? "flip-once" : ""} ${className}`}
        style={style}
      >
        {children}
      </span>
    </span>
  );
}
