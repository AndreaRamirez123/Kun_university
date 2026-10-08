"use client";

import { useState } from "react";
import type { School } from "@/lib/types";

export function DecoInfoForm({ schools }: { schools: School[] }) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div
      className="relative overflow-hidden rounded-[36px] p-2.5"
      style={{ boxShadow: "0 30px 60px rgba(3,12,30,0.22), 0 10px 20px rgba(3,12,30,0.14)" }}
    >
      <div
        aria-hidden
        className="animate-spin-slow absolute -inset-[75%]"
        style={{
          animationDuration: "5s",
          background:
            "conic-gradient(from 0deg, #033E8C, #0092B6, #005F7F, #0092B6, #033E8C, #0092B6, #005F7F, #0092B6, #033E8C)",
        }}
      />

      <div
        className="border-hairline bg-cream relative rounded-[30px] border p-14 max-md:p-8"
        style={{
          boxShadow: "inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -10px 24px rgba(3,62,140,0.08)",
        }}
      >
        {submitted ? (
          <div className="py-10 text-center">
            <div className="font-display text-burgundy mb-2 text-2xl font-normal">¡Listo!</div>
            <p className="mx-auto max-w-100 text-sm text-muted-ink">
              Recibimos tu información. Un asesor de KUN te va a contactar pronto.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
            <div className="col-span-2 mb-1 text-center max-md:col-span-1">
              <div className="font-display mb-2 text-2xl font-normal">Solicita información</div>
              <p className="mx-auto max-w-100 text-sm text-muted-ink">
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
              className="col-span-2 mt-2 rounded-full bg-navy px-9 py-4 text-[15px] font-bold text-cream shadow-[0_14px_28px_rgba(3,62,140,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(3,62,140,0.55)] max-md:col-span-1"
            >
              Enviar solicitud →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
