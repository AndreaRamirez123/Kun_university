"use client";

import { useState } from "react";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { School } from "@/lib/types";

const COPY = {
  es: {
    successTitle: "¡Listo!",
    successBody: "Recibimos tu información. Un asesor de KUN te va a contactar pronto.",
    title: "Solicita información",
    subtitle: "Te contamos todo sobre programas, becas y fechas de inicio. Sin compromiso.",
    name: "Nombre completo",
    email: "Email",
    phone: "Teléfono",
    program: "Programa de interés",
    choose: "Elige un programa",
    submit: "Enviar solicitud →",
  },
  en: {
    successTitle: "All set!",
    successBody: "We received your information. A KUN advisor will contact you soon.",
    title: "Request information",
    subtitle: "We'll tell you everything about programs, scholarships and start dates. No commitment.",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    program: "Program of interest",
    choose: "Choose a program",
    submit: "Send request →",
  },
};

export function DecoInfoForm({ schools }: { schools: School[] }) {
  const t = usePick(COPY);
  const { locale } = useLocale();
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
            <div className="font-display text-burgundy mb-2 text-2xl font-normal">{t.successTitle}</div>
            <p className="mx-auto max-w-100 text-sm text-muted-ink">{t.successBody}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
            <div className="col-span-2 mb-1 text-center max-md:col-span-1">
              <div className="font-display mb-2 text-2xl font-normal">{t.title}</div>
              <p className="mx-auto max-w-100 text-sm text-muted-ink">{t.subtitle}</p>
            </div>

            <label className="small-caps text-muted-brown flex flex-col gap-1.5 text-xs font-bold">
              {t.name}
              <input
                required
                type="text"
                name="name"
                className="border-hairline focus:border-burgundy rounded-lg border px-4 py-3 text-sm font-medium text-ink normal-case focus:outline-none"
              />
            </label>

            <label className="small-caps text-muted-brown flex flex-col gap-1.5 text-xs font-bold">
              {t.email}
              <input
                required
                type="email"
                name="email"
                className="border-hairline focus:border-burgundy rounded-lg border px-4 py-3 text-sm font-medium text-ink normal-case focus:outline-none"
              />
            </label>

            <label className="small-caps text-muted-brown flex flex-col gap-1.5 text-xs font-bold">
              {t.phone}
              <input
                required
                type="tel"
                name="phone"
                className="border-hairline focus:border-burgundy rounded-lg border px-4 py-3 text-sm font-medium text-ink normal-case focus:outline-none"
              />
            </label>

            <label className="small-caps text-muted-brown flex flex-col gap-1.5 text-xs font-bold">
              {t.program}
              <select
                required
                name="program"
                defaultValue=""
                className="border-hairline focus:border-burgundy rounded-lg border px-4 py-3 text-sm font-medium text-ink normal-case focus:outline-none"
              >
                <option value="" disabled>
                  {t.choose}
                </option>
                {schools.flatMap((school) =>
                  school.programs.map((p) => (
                    <option key={`${school.slug}-${p.name}`} value={p.name}>
                      {p.name} · {school.name[locale]}
                    </option>
                  )),
                )}
              </select>
            </label>

            <button
              type="submit"
              className="col-span-2 mt-2 rounded-full bg-navy px-9 py-4 text-[15px] font-bold text-cream shadow-[0_14px_28px_rgba(3,62,140,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(3,62,140,0.55)] max-md:col-span-1"
            >
              {t.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
