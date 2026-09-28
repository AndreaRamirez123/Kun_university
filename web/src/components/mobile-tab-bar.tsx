const ITEMS = [
  {
    href: "#programas",
    label: "Programas",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 10L12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
      </svg>
    ),
  },
  {
    href: "#continua",
    label: "Educación",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="5" />
        <path d="M8.5 12.5L7 22l5-3 5 3-1.5-9.5" />
      </svg>
    ),
  },
  {
    href: "#comunidad",
    label: "Comunidad",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
        <circle cx="18" cy="8.5" r="2.3" />
        <path d="M16.5 14.2c2.6.5 4.5 2.5 4.5 5" />
      </svg>
    ),
  },
  {
    href: "#informacion",
    label: "Información",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7.5v.01" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function MobileTabBar({
  bg,
  ink,
  border,
  font,
}: {
  bg: string;
  ink: string;
  border?: string;
  font?: string;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 hidden grid-cols-4 border-t max-md:grid"
      style={{ background: bg, borderColor: border ?? "rgba(0,0,0,0.1)" }}
    >
      {ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold uppercase transition active:scale-95"
          style={{ color: ink, fontFamily: font }}
        >
          {item.icon}
          {item.label}
        </a>
      ))}
    </nav>
  );
}
