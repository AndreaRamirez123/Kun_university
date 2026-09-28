export function TransparencyCta() {
  return (
    <div id="registro" className="relative z-10 mx-auto max-w-260 px-14 pt-22 pb-10 max-md:px-6">
      <div className="relative mb-10 overflow-hidden rounded-t-[72px] rounded-b-3xl bg-linear-to-br from-navy to-cyan-deep p-14 text-center shadow-[0_28px_56px_rgba(3,62,140,0.38)] max-md:rounded-t-[32px] max-md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/15 blur-[80px]"
        />
        <h2 className="font-display mb-3.5 text-[28px] font-normal text-white">
          Antes de matricularte, síguenos
        </h2>
        <p className="mx-auto mb-7 max-w-[480px] text-sm text-white/85">
          El valor se demuestra antes de pedirte que pagues por él. Contenido educativo real, sin
          necesidad de estar matriculado.
        </p>
        <a
          href="#"
          className="inline-block rounded-lg bg-navy px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
        >
          Únete a la comunidad
        </a>
      </div>

      <div id="comunidad" className="relative flex justify-center gap-16 pt-4 max-md:flex-col max-md:items-center max-md:gap-10">
        <div aria-hidden className="absolute top-11 right-16 left-16 h-px bg-hairline max-md:hidden" />
        <Porthole
          label="Florida CIE"
          detail="Comisión de Educación Independiente"
          iconColor="#005F7F"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#005F7F" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          }
        />
        <Porthole
          label="SACSCOC · En proceso"
          detail="Acreditación institucional en avance"
          iconColor="#0092B6"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0092B6" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

function Porthole({
  label,
  detail,
  icon,
}: {
  label: string;
  detail: string;
  icon: React.ReactNode;
  iconColor: string;
}) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="flex h-22 w-22 items-center justify-center rounded-full border-4 border-cream bg-surface-alt shadow-[0_14px_28px_rgba(3,62,140,0.2)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-burgundy/50">
          {icon}
        </div>
      </div>
      <div className="mt-3 text-[13px] font-bold">{label}</div>
      <div className="mt-0.5 max-w-45 text-xs text-muted-ink">{detail}</div>
    </div>
  );
}
