"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/locale-context";
import { CONSENT, LICENSE_NOTICE, PRIVACY_PATH, TRANSPARENCY_PATH } from "@/lib/compliance";

/** Franja superior con el estado de licenciamiento (en el campus 3D va dentro de sus ventanas). */
export function LicenseBar() {
  const { locale } = useLocale();
  const path = usePathname();
  if (path?.startsWith("/campus")) return null;
  return (
    <div role="note" className="relative z-[60] bg-[#10182B] px-4 py-2 text-center text-[12px] leading-snug text-white/85">
      <span aria-hidden>ⓘ </span>
      {LICENSE_NOTICE[locale]}{" "}
      <a href={TRANSPARENCY_PATH} className="whitespace-nowrap text-white underline underline-offset-2">
        {locale === "es" ? "Transparencia" : "Transparency"}
      </a>
      {" · "}
      <a href={PRIVACY_PATH} className="whitespace-nowrap text-white underline underline-offset-2">
        {CONSENT[locale].policy}
      </a>
    </div>
  );
}

/** Aviso corto de licenciamiento para formularios y fichas de programas. */
export function LicenseNote({ className = "" }: { className?: string }) {
  const { locale } = useLocale();
  return <p className={`m-0 text-[11.5px] leading-snug opacity-70 ${className}`}>ⓘ {LICENSE_NOTICE[locale]}</p>;
}

/** Casilla de consentimiento obligatoria (correo, llamadas y mensajes de texto, ley FTSA de Florida). */
export function ConsentCheckbox({ accent = "currentColor", className = "" }: { accent?: string; className?: string }) {
  const { locale } = useLocale();
  return (
    <label className={`flex cursor-pointer items-start gap-2.5 text-left text-[12px] leading-snug normal-case tracking-normal font-normal ${className}`}>
      <input required type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer" style={{ accentColor: accent }} />
      <span>
        {CONSENT[locale].text}{" "}
        <a href={PRIVACY_PATH} target="_blank" rel="noopener" className="underline underline-offset-2">
          {CONSENT[locale].policy}
        </a>
        .
      </span>
    </label>
  );
}
