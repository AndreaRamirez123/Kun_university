import type { Metadata } from "next";
import { TransparencyContent } from "./transparency-content";

export const metadata: Metadata = {
  title: "Transparencia — KUN University AI",
  description: "Estado de licenciamiento, quién dirige KUN University AI, dónde está, sus profesores y costos.",
};

export default function TransparencyPage() {
  return <TransparencyContent />;
}
