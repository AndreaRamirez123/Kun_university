"use client";

import { useEffect, useState } from "react";
import type { School } from "@/lib/types";

const RED = "#BF0404";
const TEAL = "#0092B6";
const INK = "#10101A";
const CREAM = "#FFF9EC";
const DISPLAY = "var(--font-archivo-black), sans-serif";

export function CollageInfoForm({ schools }: { schools: School[] }) {
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
      <div
        className="rounded-[28px] border-4 border-[#10101A] p-13 text-center max-md:p-8"
        style={{ background: CREAM, boxShadow: "10px 10px 0 #10101A" }}
      >
        <div className="mb-2 text-3xl font-extrabold uppercase" style={{ fontFamily: DISPLAY, color: INK }}>
          Solicita información
        </div>
        <p className="mx-auto mb-7 max-w-100 text-sm font-semibold" style={{ color: "#4A4636" }}>
          Te contamos todo sobre programas, becas y fechas de inicio. Sin compromiso.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border-[3px] border-[#10101A] px-8 py-4 text-sm font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5"
          style={{ background: INK, boxShadow: "5px 5px 0 " + RED }}
        >
          Llenar formulario →
        </button>
      </div>

      <div
        aria-hidden
        onClick={closeModal}
        className={`fixed inset-0 z-60 bg-[#10101A]/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed top-1/2 left-1/2 z-61 w-[min(92vw,540px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border-4 border-[#10101A] transition-[opacity,scale] duration-300 ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
        style={{ background: CREAM, boxShadow: "10px 10px 0 #10101A" }}
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={closeModal}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#10101A] text-lg leading-none font-extrabold transition hover:-translate-y-0.5"
          style={{ background: CREAM, color: INK, boxShadow: "3px 3px 0 #10101A" }}
        >
          ×
        </button>

        <div className="max-h-[85vh] overflow-y-auto p-10 max-md:p-6">
          {submitted ? (
            <div className="py-10 text-center">
              <div className="mb-2 text-3xl font-extrabold uppercase" style={{ fontFamily: DISPLAY, color: RED }}>
                ¡Listo!
              </div>
              <p className="text-sm font-semibold" style={{ color: INK }}>
                Recibimos tu información. Un asesor de KUN te va a contactar pronto.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
              <div className="col-span-2 mb-2 max-md:col-span-1">
                <div className="text-2xl font-extrabold uppercase" style={{ fontFamily: DISPLAY }}>
                  Solicita información
                </div>
                <p className="mt-1 text-sm font-semibold" style={{ color: "#4A4636" }}>
                  Te contamos todo sobre programas, becas y fechas de inicio. Sin compromiso.
                </p>
              </div>

              <label className="flex flex-col gap-1.5 text-xs font-extrabold tracking-[0.05em] uppercase">
                Nombre completo
                <input
                  required
                  type="text"
                  name="name"
                  className="rounded-xl border-[3px] border-[#10101A] bg-white px-4 py-3 text-sm font-medium normal-case focus:outline-none"
                  style={{ boxShadow: `3px 3px 0 ${RED}` }}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-extrabold tracking-[0.05em] uppercase">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  className="rounded-xl border-[3px] border-[#10101A] bg-white px-4 py-3 text-sm font-medium normal-case focus:outline-none"
                  style={{ boxShadow: `3px 3px 0 ${TEAL}` }}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-extrabold tracking-[0.05em] uppercase">
                Teléfono
                <input
                  required
                  type="tel"
                  name="phone"
                  className="rounded-xl border-[3px] border-[#10101A] bg-white px-4 py-3 text-sm font-medium normal-case focus:outline-none"
                  style={{ boxShadow: `3px 3px 0 ${RED}` }}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-extrabold tracking-[0.05em] uppercase">
                Programa de interés
                <select
                  required
                  name="program"
                  defaultValue=""
                  className="rounded-xl border-[3px] border-[#10101A] bg-white px-4 py-3 text-sm font-medium normal-case focus:outline-none"
                  style={{ boxShadow: `3px 3px 0 ${TEAL}` }}
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
                className="col-span-2 mt-2 rounded-full border-[3px] border-[#10101A] px-6.5 py-4 text-sm font-extrabold text-[#FFF9EC] transition hover:-translate-y-0.5 max-md:col-span-1"
                style={{ background: INK, boxShadow: "5px 5px 0 " + RED }}
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
