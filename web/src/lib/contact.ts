// Datos de contacto oficiales, compartidos por todos los modelos del sitio.
export const ADMISSIONS_EMAIL = "admissions@kununiversityai.com";

export type SocialNetwork = "youtube" | "linkedin" | "instagram" | "x";

// Redes sociales de KUN. Cuando se creen las cuentas, pon aquí sus URLs y se
// actualizan a la vez el footer de los modelos 1–3 y el campus 3D.
export const SOCIAL_LINKS: Array<{ network: SocialNetwork; label: string; href: string }> = [
  { network: "youtube", label: "YouTube", href: "" },
  { network: "linkedin", label: "LinkedIn", href: "" },
  { network: "instagram", label: "Instagram", href: "" },
  { network: "x", label: "X (Twitter)", href: "" },
];

/** Enlace utilizable: la URL real o "#" mientras la cuenta no exista. */
export function socialHref(href: string) {
  return href || "#";
}
