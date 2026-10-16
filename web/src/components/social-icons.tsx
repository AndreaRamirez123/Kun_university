import type { SocialNetwork } from "@/lib/contact";

// Íconos de redes sociales compartidos por el footer clásico y el campus 3D.
export function SocialIcon({ network, size = 16 }: { network: SocialNetwork; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": true };
  if (network === "youtube")
    return (
      <svg {...common}>
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
      </svg>
    );
  if (network === "linkedin")
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <line x1="8" y1="10" x2="8" y2="17" />
        <circle cx="8" cy="6.5" r="0.5" fill="currentColor" />
        <path d="M12 17v-4.5c0-1.5 1-2.5 2.3-2.5s2.2 1 2.2 2.5V17" />
      </svg>
    );
  if (network === "instagram")
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  );
}
