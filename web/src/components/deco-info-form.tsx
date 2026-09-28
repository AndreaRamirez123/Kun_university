"use client";

import { useState } from "react";
import type { School } from "@/lib/types";

export function DecoInfoForm({ schools }: { schools: School[] }) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-t-[56px] max-md:rounded-t-[28px] rounded-b-2xl border border-hairline bg-cream p-14 text-center shadow-[0_24px_50px_rgba(3,62,140,0.2)] max-md:p-8">
        <div className="font-display mb-2 text-2xl font-normal text-burgundy">¡Listo!</div>
        <p className="text-sm text-muted-ink">
          Recibimos tu información. Un asesor de KUN te va a contactar pronto.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-5 rounded-t-[56px] max-md:rounded-t-[28px] rounded-b-2xl border border-hairline bg-cream p-10 shadow-[0_24px_50px_rgba(3,62,140,0.16)] max-md:grid-cols-1 max-md:p-6"
    >
      <div className="col-span-2 mb-1 text-center max-md:col-span-1">
        <div className="font-display text-2xl font-normal">Solicita información</div>
        <p className="mt-1 text-sm text-muted-ink">
          Te contamos todo sobre programas, becas y fechas de inicio. Sin compromiso.
        </p>
      </div>

      <label className="small-caps flex flex-col gap-1.5 text-xs font-bold text-muted-brown">
        Nombre completo
        <input
          required
          type="text"
          name="name"
          className="rounded-lg border border-hairline px-4 py-3 text-sm font-medium text-ink normal-case focus:border-burgundy focus:outline-none"
        />
      </label>

      <label className="small-caps flex flex-col gap-1.5 text-xs font-bold text-muted-brown">
        Email
        <input
          required
          type="email"
          name="email"
          className="rounded-lg border border-hairline px-4 py-3 text-sm font-medium text-ink normal-case focus:border-burgundy focus:outline-none"
        />
      </label>

      <label className="small-caps flex flex-col gap-1.5 text-xs font-bold text-muted-brown">
        Teléfono
        <input
          required
          type="tel"
          name="phone"
          className="rounded-lg border border-hairline px-4 py-3 text-sm font-medium text-ink normal-case focus:border-burgundy focus:outline-none"
        />
      </label>

      <label className="small-caps flex flex-col gap-1.5 text-xs font-bold text-muted-brown">
        Programa de interés
        <select
          required
          name="program"
          defaultValue=""
          className="rounded-lg border border-hairline px-4 py-3 text-sm font-medium text-ink normal-case focus:border-burgundy focus:outline-none"
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
  );
}
