"use client";

import { useEffect, useRef } from "react";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { School } from "@/lib/types";

const COPY = {
  es: {
    title: "Solicita información",
    subtitle: "Te contamos sobre programas, becas y fechas de inicio. Sin compromiso.",
    name: "Nombre completo",
    email: "Email",
    phone: "Teléfono",
    program: "Programa de interés",
    choose: "Elige un programa",
    submit: "Enviar solicitud",
    close: "Cerrar",
  },
  en: {
    title: "Request information",
    subtitle: "We'll tell you about programs, scholarships and start dates. No commitment.",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    program: "Program of interest",
    choose: "Choose a program",
    submit: "Send request",
    close: "Close",
  },
};

const FIELD =
  "h-12 rounded-[14px] border-2 border-[#24123F]/15 bg-white px-3.5 text-base font-normal text-[#24123F] focus:border-[#24123F] focus:outline-none";

export function CampusFormModal({
  open,
  schools,
  defaultName,
  defaultProgram,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  schools: School[];
  defaultName: string;
  defaultProgram: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const t = usePick(COPY);
  const { locale } = useLocale();
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) firstField.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-[#140628]/60 p-5 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="campus-form-title"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className="reveal-animate relative w-[min(440px,100%)] rounded-[26px] bg-[#FFF8F0] p-6.5 text-[#24123F] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="absolute top-4 right-4 h-11 w-11 cursor-pointer rounded-full bg-[#24123F]/10 text-2xl leading-none transition hover:bg-[#24123F]/20"
        >
          ×
        </button>
        <form
          className="flex flex-col gap-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitted();
          }}
        >
          <h2 id="campus-form-title" className="m-0 pr-12 font-(family-name:--font-gabarito) text-[28px] font-black">
            {t.title}
          </h2>
          <p className="m-0 text-[13px] text-[#5C4A72]">{t.subtitle}</p>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            {t.name}
            <input ref={firstField} required type="text" name="name" defaultValue={defaultName} className={FIELD} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            {t.email}
            <input required type="email" name="email" autoComplete="email" className={FIELD} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            {t.phone}
            <input required type="tel" name="phone" autoComplete="tel" className={FIELD} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            {t.program}
            <select required name="program" defaultValue={defaultProgram} className={FIELD}>
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
            className="mt-1 h-13 cursor-pointer rounded-2xl font-bold text-[#24123F] transition hover:-translate-y-0.5"
            style={{ background: "linear-gradient(180deg, #FFD47A, #FF9A5C)" }}
          >
            {t.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
