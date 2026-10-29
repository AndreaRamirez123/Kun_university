import type { Metadata } from "next";
import { PrivacyContent } from "./privacy-content";

export const metadata: Metadata = {
  title: "Política de privacidad — KUN University AI",
  description: "Qué datos recoge el sitio de KUN University AI, para qué los usa y cómo pedir que se borren.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
