import { ADMISSIONS_EMAIL } from "./contact";

// Textos legales del sitio en un solo lugar. Mientras KUN University AI no tenga
// su licencia de la Comisión de Educación Independiente de Florida (CIE), el
// sitio no ofrece inscripciones: solo una lista de interés.
// IMPORTANTE: estos textos son una base de trabajo y deben validarse con
// asesoría legal en Florida antes de promocionar el sitio.

/** Cambia a true solo cuando la CIE otorgue la licencia y se abran inscripciones. */
export const ENROLLMENT_OPEN = false;

export const LICENSE_NOTICE = {
  es: "KUN University AI está en proceso de licenciamiento ante la Comisión de Educación Independiente de Florida (CIE). Aún no ofrece inscripciones ni otorga títulos: puedes unirte a la lista de interés.",
  en: "KUN University AI is in the licensing process with the Florida Commission for Independent Education (CIE). It does not yet offer enrollment or award degrees: you can join the interest list.",
};

export const CONSENT = {
  es: {
    text: `Acepto que KUN University AI me contacte por correo, teléfono, WhatsApp o mensajes de texto (incluso automatizados) sobre sus programas. No es requisito para nada y puedo darme de baja cuando quiera respondiendo STOP o escribiendo a ${ADMISSIONS_EMAIL}.`,
    policy: "Política de privacidad",
  },
  en: {
    text: `I agree that KUN University AI may contact me by email, phone, WhatsApp or text messages (including automated ones) about its programs. This is not a condition of anything and I can opt out anytime by replying STOP or writing to ${ADMISSIONS_EMAIL}.`,
    policy: "Privacy policy",
  },
};

export const PRIVACY_PATH = "/privacidad";
export const TRANSPARENCY_PATH = "/transparencia";
