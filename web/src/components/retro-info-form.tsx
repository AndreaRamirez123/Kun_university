"use client";

import { useState } from "react";
import type { School } from "@/lib/types";

const BLUE = "#03318C";
const RED = "#8C0303";
const INK = "#171717";
const DISPLAY = "var(--font-bungee), sans-serif";

const SOFT_TEAL_SHADOW = "0 14px 28px rgba(0,127,161,0.28)";
const SOFT_INK_SHADOW = "0 14px 28px rgba(23,23,23,0.25)";

export function RetroInfoForm({ schools }: { schools: School[] }) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className="rounded-[24px] border-4 bg-white p-14 text-center max-md:p-8"
        style={{ borderColor: BLUE, boxShadow: SOFT_TEAL_SHADOW }}
      >
        <div className="mb-3 text-2xl uppercase" style={{ fontFamily: DISPLAY, color: RED }}>
          ¡Listo!
        </div>
        <p className="text-sm font-medium" style={{ color: INK }}>
          Recibimos tu información. Un asesor de KUN te va a contactar pronto.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-5 rounded-[24px] border-4 bg-white p-10 max-md:grid-cols-1 max-md:p-6"
      style={{ borderColor: BLUE, boxShadow: SOFT_TEAL_SHADOW }}
    >
      <div className="col-span-2 mb-2 max-md:col-span-1">
        <div className="text-2xl uppercase" style={{ fontFamily: DISPLAY, color: BLUE }}>
          Solicita información
        </div>
        <p className="mt-2 text-sm font-medium" style={{ color: "#5A5A5A" }}>
          Te contamos todo sobre programas, becas y fechas de inicio. Sin compromiso.
        </p>
      </div>

      <label className="flex flex-col gap-1.5 text-xs font-bold tracking-[0.05em] uppercase" style={{ color: BLUE }}>
        Nombre completo
        <input
          required
          type="text"
          name="name"
          className="rounded-full border-[3px] px-4 py-3 text-sm font-medium normal-case focus:outline-none"
          style={{ borderColor: BLUE, color: INK, background: "#fff" }}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-bold tracking-[0.05em] uppercase" style={{ color: BLUE }}>
        Email
        <input
          required
          type="email"
          name="email"
          className="rounded-full border-[3px] px-4 py-3 text-sm font-medium normal-case focus:outline-none"
          style={{ borderColor: BLUE, color: INK, background: "#fff" }}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-bold tracking-[0.05em] uppercase" style={{ color: BLUE }}>
        Teléfono
        <input
          required
          type="tel"
          name="phone"
          className="rounded-full border-[3px] px-4 py-3 text-sm font-medium normal-case focus:outline-none"
          style={{ borderColor: BLUE, color: INK, background: "#fff" }}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-bold tracking-[0.05em] uppercase" style={{ color: BLUE }}>
        Programa de interés
        <select
          required
          name="program"
          defaultValue=""
          className="rounded-full border-[3px] px-4 py-3 text-sm font-medium normal-case focus:outline-none"
          style={{ borderColor: BLUE, color: INK, background: "#fff" }}
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
        className="col-span-2 mt-2 rounded-full border-[3px] px-7 py-4 text-sm font-bold text-white uppercase transition hover:-translate-y-0.5 max-md:col-span-1"
        style={{ background: RED, borderColor: INK, boxShadow: SOFT_INK_SHADOW }}
      >
        Enviar solicitud →
      </button>
    </form>
  );
}
