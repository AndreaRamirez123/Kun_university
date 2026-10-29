"use client";

import Link from "next/link";
import { usePick } from "@/i18n/locale-context";
import { ADMISSIONS_EMAIL } from "@/lib/contact";
import { LICENSE_NOTICE } from "@/lib/compliance";

// Política de privacidad: describe lo que el sitio hace hoy con los datos.
// Versión preliminar: debe revisarla asesoría legal antes de promocionar el sitio.

type Section = { title: string; body: string[] };

const COPY: Record<"es" | "en", { title: string; draft: string; updated: string; back: string; sections: Section[] }> = {
  es: {
    title: "Política de privacidad",
    draft: "Versión preliminar, pendiente de revisión legal.",
    updated: "Última actualización: octubre de 2026",
    back: "← Volver al inicio",
    sections: [
      {
        title: "Quiénes somos",
        body: [`KUN University AI ("KUN"). ${LICENSE_NOTICE.es}`, `Para cualquier tema de privacidad escríbenos a ${ADMISSIONS_EMAIL}.`],
      },
      {
        title: "Qué datos recogemos",
        body: [
          "Formularios de información y lista de interés: nombre, correo, teléfono y programa de interés. Solo los que tú escribes.",
          "Campus virtual: el nombre y el personaje que eliges y tu posición dentro del campus, para que otras personas conectadas te vean. Se borran al salir del campus.",
          "En tu navegador (no en nuestros servidores): tus KUN Coins, tu avance en las clases demo, tu mascota y tus preferencias (idioma, sonido).",
          "Foto para crear tu personaje: se procesa solo en tu dispositivo para tomar los colores de piel y cabello; no se envía ni se guarda.",
          "Conversación con Krucn: tus preguntas se procesan para responderte. Si se usa inteligencia artificial, se envían a nuestro servidor solo para generar la respuesta.",
        ],
      },
      {
        title: "Para qué los usamos",
        body: [
          "Responder tus preguntas sobre programas, becas, fechas y requisitos.",
          "Avisarte cuando abran las inscripciones, si te uniste a la lista de interés.",
          "Hacer funcionar el campus virtual (ver a otras personas conectadas, guardar tu avance).",
          "No vendemos ni alquilamos tus datos personales.",
        ],
      },
      {
        title: "Mensajes y llamadas",
        body: [
          "Solo te contactamos por teléfono, WhatsApp o mensajes de texto si marcaste la casilla de consentimiento. No es requisito para nada.",
          `Puedes darte de baja cuando quieras respondiendo STOP a un mensaje o escribiendo a ${ADMISSIONS_EMAIL}.`,
        ],
      },
      {
        title: "Con quién los compartimos",
        body: [
          "Con proveedores que nos ayudan a operar el sitio (alojamiento y base de datos del campus en Google Firebase) y, si se activa, el servicio de inteligencia artificial de Krucn. Solo para prestar el servicio.",
          "Con autoridades, cuando la ley lo exija.",
        ],
      },
      {
        title: "Tus derechos",
        body: [
          `Puedes pedirnos ver, corregir o borrar tus datos escribiendo a ${ADMISSIONS_EMAIL}.`,
          "Puedes borrar lo guardado en tu navegador (monedas, avance, preferencias) desde la configuración del navegador.",
        ],
      },
      {
        title: "Menores de edad",
        body: ["El sitio no está dirigido a menores de 13 años y no recogemos a sabiendas sus datos."],
      },
      {
        title: "Seguridad",
        body: ["Usamos conexiones cifradas (HTTPS) y limitamos el acceso a los datos a quienes los necesitan para atenderte."],
      },
    ],
  },
  en: {
    title: "Privacy policy",
    draft: "Preliminary version, pending legal review.",
    updated: "Last updated: October 2026",
    back: "← Back to home",
    sections: [
      {
        title: "Who we are",
        body: [`KUN University AI ("KUN"). ${LICENSE_NOTICE.en}`, `For any privacy matter, write to ${ADMISSIONS_EMAIL}.`],
      },
      {
        title: "What data we collect",
        body: [
          "Information and interest-list forms: name, email, phone and program of interest. Only what you type.",
          "Virtual campus: the name and character you choose and your position on campus, so other connected people can see you. It is deleted when you leave the campus.",
          "In your browser (not on our servers): your KUN Coins, your progress in demo classes, your pet and your preferences (language, sound).",
          "Photo to create your character: it is processed only on your device to pick skin and hair colors; it is not sent or stored.",
          "Conversation with Krucn: your questions are processed to answer you. If artificial intelligence is used, they are sent to our server only to generate the answer.",
        ],
      },
      {
        title: "How we use it",
        body: [
          "To answer your questions about programs, scholarships, dates and requirements.",
          "To let you know when enrollment opens, if you joined the interest list.",
          "To run the virtual campus (see other connected people, save your progress).",
          "We do not sell or rent your personal data.",
        ],
      },
      {
        title: "Messages and calls",
        body: [
          "We only contact you by phone, WhatsApp or text messages if you checked the consent box. It is not a condition of anything.",
          `You can opt out anytime by replying STOP to a message or writing to ${ADMISSIONS_EMAIL}.`,
        ],
      },
      {
        title: "Who we share it with",
        body: [
          "With providers that help us run the site (hosting and the campus database on Google Firebase) and, if enabled, Krucn's artificial intelligence service. Only to provide the service.",
          "With authorities, when required by law.",
        ],
      },
      {
        title: "Your rights",
        body: [
          `You can ask us to see, correct or delete your data by writing to ${ADMISSIONS_EMAIL}.`,
          "You can delete what is saved in your browser (coins, progress, preferences) from your browser settings.",
        ],
      },
      {
        title: "Minors",
        body: ["The site is not directed to children under 13 and we do not knowingly collect their data."],
      },
      {
        title: "Security",
        body: ["We use encrypted connections (HTTPS) and limit access to data to those who need it to assist you."],
      },
    ],
  },
};

export function PrivacyContent() {
  const t = usePick(COPY);
  return (
    <main className="mx-auto max-w-[760px] px-6 py-14 text-[#10182B] max-md:py-10">
      <Link href="/" className="text-[13px] font-bold text-[#033E8C] no-underline hover:underline">
        {t.back}
      </Link>
      <h1 className="mt-6 mb-2 text-[38px] leading-tight font-bold max-md:text-[28px]">{t.title}</h1>
      <p className="m-0 text-[13px] text-[#5b6478]">
        {t.updated} · {t.draft}
      </p>
      {t.sections.map((s) => (
        <section key={s.title} className="mt-8">
          <h2 className="mb-2 text-[20px] font-bold">{s.title}</h2>
          <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed">
            {s.body.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
