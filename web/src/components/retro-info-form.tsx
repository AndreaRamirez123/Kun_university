"use client";

import { useState } from "react";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { School } from "@/lib/types";

const COPY = {
  es: {
    successTitle: "¡Listo!",
    successBody: "Recibimos tu información. Un asesor de KUN te va a contactar pronto.",
    formTitle: "Solicita información",
    formSubtitle: "Te contamos todo sobre programas, becas y fechas de inicio. Sin compromiso.",
    name: "Nombre completo",
    email: "Email",
    phone: "Teléfono",
    program: "Programa de interés",
    programPlaceholder: "Elige un programa",
    submit: "Enviar solicitud →",
  },
  en: {
    successTitle: "All set!",
    successBody: "We've received your information. A KUN advisor will reach out soon.",
    formTitle: "Request information",
    formSubtitle: "We'll tell you everything about programs, scholarships, and start dates. No commitment.",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    program: "Program of interest",
    programPlaceholder: "Choose a program",
    submit: "Submit request →",
  },
};

const BLUE = "#03318C";
const RED = "#8C0303";
const INK = "#171717";
const CREAM = "#FFFFFF";
const TINT = "#E3ECFB";
const DISPLAY = "var(--font-bungee), sans-serif";

const SOFT_TEAL_SHADOW = "0 14px 28px rgba(0,127,161,0.28)";
const SOFT_INK_SHADOW = "0 14px 28px rgba(23,23,23,0.25)";

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function IconField({
  icon,
  children,
  hasChevron,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  hasChevron?: boolean;
}) {
  return (
    <div
      className="flex items-stretch overflow-hidden rounded-full border-[3px] bg-white transition focus-within:-translate-x-0.5"
      style={{ borderColor: BLUE }}
    >
      <span className="flex items-center pr-2 pl-4" style={{ color: BLUE }}>
        {icon}
      </span>
      <div className="relative flex-1">{children}</div>
      {hasChevron && (
        <span className="pointer-events-none flex items-center pr-4" style={{ color: BLUE }}>
          <ChevronIcon />
        </span>
      )}
    </div>
  );
}

export function RetroInfoForm({ schools }: { schools: School[] }) {
  const [submitted, setSubmitted] = useState(false);
  const t = usePick(COPY);
  const { locale } = useLocale();

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
          {t.successTitle}
        </div>
        <p className="text-sm font-medium" style={{ color: INK }}>
          {t.successBody}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative grid grid-cols-2 gap-5 overflow-hidden rounded-[28px] border-4 p-10 max-md:grid-cols-1 max-md:p-6"
      style={{
        borderColor: BLUE,
        boxShadow: SOFT_TEAL_SHADOW,
        backgroundImage: `linear-gradient(-225deg, ${CREAM} 55%, ${TINT} 55%)`,
      }}
    >
      <header className="col-span-2 mb-6 text-center max-md:col-span-1 max-md:mb-3">
        <div className="text-3xl uppercase" style={{ fontFamily: DISPLAY, color: BLUE }}>
          {t.formTitle}
        </div>
        <p className="mx-auto mt-2 max-w-100 text-sm font-medium" style={{ color: "#5A5A5A" }}>
          {t.formSubtitle}
        </p>
      </header>

      <label className="flex flex-col gap-1.5 text-xs font-bold tracking-[0.05em] uppercase" style={{ color: BLUE }}>
        {t.name}
        <IconField icon={<UserIcon />}>
          <input
            required
            type="text"
            name="name"
            className="w-full bg-transparent py-3 pr-4 text-sm font-medium normal-case focus:outline-none"
            style={{ color: INK }}
          />
        </IconField>
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-bold tracking-[0.05em] uppercase" style={{ color: BLUE }}>
        {t.email}
        <IconField icon={<MailIcon />}>
          <input
            required
            type="email"
            name="email"
            className="w-full bg-transparent py-3 pr-4 text-sm font-medium normal-case focus:outline-none"
            style={{ color: INK }}
          />
        </IconField>
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-bold tracking-[0.05em] uppercase" style={{ color: BLUE }}>
        {t.phone}
        <IconField icon={<PhoneIcon />}>
          <input
            required
            type="tel"
            name="phone"
            className="w-full bg-transparent py-3 pr-4 text-sm font-medium normal-case focus:outline-none"
            style={{ color: INK }}
          />
        </IconField>
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-bold tracking-[0.05em] uppercase" style={{ color: BLUE }}>
        {t.program}
        <IconField icon={<ListIcon />} hasChevron>
          <select
            required
            name="program"
            defaultValue=""
            className="w-full appearance-none bg-transparent py-3 pr-2 text-sm font-medium normal-case focus:outline-none"
            style={{ color: INK }}
          >
            <option value="" disabled>
              {t.programPlaceholder}
            </option>
            {schools.flatMap((school) =>
              school.programs.map((p) => (
                <option key={`${school.slug}-${p.name}`} value={p.name}>
                  {p.name} · {school.name[locale]}
                </option>
              )),
            )}
          </select>
        </IconField>
      </label>

      <button
        type="submit"
        className="btn-jelly col-span-2 mt-2 rounded-full border-[3px] px-7 py-4 text-sm font-bold text-white uppercase transition hover:-translate-y-0.5 max-md:col-span-1"
        style={{ background: RED, borderColor: INK, boxShadow: SOFT_INK_SHADOW }}
      >
        {t.submit}
      </button>
    </form>
  );
}
