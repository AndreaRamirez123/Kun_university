import Image from "next/image";

export function Nav() {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-hairline bg-cream px-16 py-5.5 max-md:px-6 max-md:py-3">
      <div className="flex items-center gap-3.5">
        <Image src="/kun-logo-full.png" alt="KUN University AI" width={96} height={100} priority className="h-25 w-auto max-md:h-14" />
      </div>
      <div className="flex items-center gap-8 max-md:hidden">
        <a href="#programas" className="small-caps text-[13px] font-semibold hover:text-teal">
          Programas
        </a>
        <a href="#continua" className="small-caps text-[13px] font-semibold hover:text-teal">
          Educación continua
        </a>
        <a href="#comunidad" className="small-caps text-[13px] font-semibold hover:text-teal">
          Comunidad
        </a>
        <a href="#informacion" className="small-caps text-[13px] font-semibold hover:text-teal">
          Información
        </a>
        <a
          href="#registro"
          className="rounded-lg bg-linear-to-br from-navy to-cyan-deep px-5.5 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_30px_rgba(3,62,140,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_15px_38px_rgba(3,62,140,0.55)]"
        >
          Certifícate gratis
        </a>
      </div>
    </div>
  );
}
