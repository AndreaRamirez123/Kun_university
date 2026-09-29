export function TransparencyCta() {
  return (
    <div id="registro" className="relative z-10 mx-auto max-w-260 px-14 pt-22 pb-10 max-md:px-6">
      <div
        className="relative overflow-hidden rounded-[40px] max-md:rounded-[28px]"
        style={{
          boxShadow:
            "10px 10px 24px rgba(3,12,30,0.45), -8px -8px 20px rgba(0,146,182,0.28), 0 28px 56px rgba(3,62,140,0.3)",
        }}
      >
        <div className="relative bg-linear-to-br from-navy to-cyan-deep p-14 text-center max-md:p-8">
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
            className="inline-block rounded-lg bg-navy px-7 py-3.5 text-sm font-bold text-white shadow-[4px_4px_10px_rgba(0,0,0,0.35),-3px_-3px_8px_rgba(0,146,182,0.25)] transition-[box-shadow,transform] duration-200 hover:scale-[0.98] hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(0,146,182,0.3)]"
          >
            Únete a la comunidad
          </a>
        </div>

        <div
          id="comunidad"
          className="bg-surface-alt relative flex justify-center gap-16 px-10 py-12 max-md:flex-col max-md:items-center max-md:gap-10 max-md:px-6 max-md:py-9"
        >
          <div aria-hidden className="absolute top-17 right-16 left-16 h-px bg-hairline max-md:hidden" />
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
      <div className="bg-surface-alt flex h-22 w-22 items-center justify-center rounded-full shadow-[8px_8px_16px_rgba(3,62,140,0.3),-8px_-8px_16px_rgba(255,255,255,1)] transition-[box-shadow,transform] duration-300 hover:scale-[0.96] hover:shadow-[inset_6px_6px_12px_rgba(3,62,140,0.32),inset_-6px_-6px_12px_rgba(255,255,255,1)]">
        {icon}
      </div>
      <div className="mt-3 text-[13px] font-bold">{label}</div>
      <div className="mt-0.5 max-w-45 text-xs text-muted-ink">{detail}</div>
    </div>
  );
}
