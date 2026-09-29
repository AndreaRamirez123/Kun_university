"use client";

import { useEffect, useState } from "react";
import type { School } from "@/lib/types";

export function DecoInfoForm({ schools }: { schools: School[] }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  function closeModal() {
    setOpen(false);
    setTimeout(() => setSubmitted(false), 400);
  }

  return (
    <>
      <div className="border-hairline bg-cream rounded-[32px] border p-14 text-center shadow-[0_24px_50px_rgba(3,62,140,0.2)] max-md:p-8">
        <div className="font-display mb-2 text-2xl font-normal">Solicita información</div>
        <p className="mx-auto mb-7 max-w-100 text-sm text-muted-ink">
          Te contamos todo sobre programas, becas y fechas de inicio. Sin compromiso.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-navy px-9 py-4 text-[15px] font-bold text-cream shadow-[0_14px_28px_rgba(3,62,140,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(3,62,140,0.55)]"
        >
          Quiero información →
        </button>
      </div>

      <div
        aria-hidden
        onClick={closeModal}
        className={`fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm transition-opacity duration-500 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed top-1/2 left-1/2 z-[61] w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-cream shadow-[0_40px_80px_rgba(3,62,140,0.4)] transition-[opacity,scale] duration-500 ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={closeModal}
          className="text-muted-ink hover:bg-surface-alt absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-lg leading-none transition"
        >
          ×
        </button>

        <div className="max-h-[85vh] overflow-y-auto p-8 max-md:p-6">
          {submitted ? (
            <div className="py-10 text-center">
              <div className="font-display text-burgundy mb-2 text-2xl font-normal">¡Listo!</div>
              <p className="text-sm text-muted-ink">
                Recibimos tu información. Un asesor de KUN te va a contactar pronto.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
              <div className="col-span-2 mb-1 text-center max-md:col-span-1">
                <div className="font-display text-2xl font-normal">Solicita información</div>
                <p className="mt-1 text-sm text-muted-ink">
                  Te contamos todo sobre programas, becas y fechas de inicio. Sin compromiso.
                </p>
              </div>

              <label className="small-caps text-muted-brown flex flex-col gap-1.5 text-xs font-bold">
                Nombre completo
                <input
                  required
                  type="text"
                  name="name"
                  className="border-hairline focus:border-burgundy rounded-lg border px-4 py-3 text-sm font-medium text-ink normal-case focus:outline-none"
                />
              </label>

              <label className="small-caps text-muted-brown flex flex-col gap-1.5 text-xs font-bold">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  className="border-hairline focus:border-burgundy rounded-lg border px-4 py-3 text-sm font-medium text-ink normal-case focus:outline-none"
                />
              </label>

              <label className="small-caps text-muted-brown flex flex-col gap-1.5 text-xs font-bold">
                Teléfono
                <input
                  required
                  type="tel"
                  name="phone"
                  className="border-hairline focus:border-burgundy rounded-lg border px-4 py-3 text-sm font-medium text-ink normal-case focus:outline-none"
                />
              </label>

              <label className="small-caps text-muted-brown flex flex-col gap-1.5 text-xs font-bold">
                Programa de interés
                <select
                  required
                  name="program"
                  defaultValue=""
                  className="border-hairline focus:border-burgundy rounded-lg border px-4 py-3 text-sm font-medium text-ink normal-case focus:outline-none"
                >
                  <option value="" disabled>
                    Elige un programa
                  </option>
                  {schools.flatMap((school) =>
                    school.programs.map((p) => (
                      <option key={`${school.slug}-${p.name}`} value={p.name}>
                        {p.name} · {school.name}
                      </option>
                    )),
                  )}
                </select>
              </label>

              <button
                type="submit"
                className="col-span-2 mt-2 rounded-lg bg-navy px-7 py-3.5 text-sm font-bold text-cream transition hover:-translate-y-0.5 max-md:col-span-1"
              >
                Enviar solicitud →
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
