import type { Metadata } from "next";
import { Roboto, Josefin_Sans } from "next/font/google";
import "./globals.css";

const displayFont = Roboto({
  variable: "--font-limelight",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KUN University AI — La universidad IA-Native",
  description:
    "KUN University AI forma profesionales en Salud, Tecnología, Negocios y Medios Digitales con un currículo que se actualiza a la velocidad de la ciencia, no de los semestres.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${displayFont.variable} ${josefin.variable} antialiased`}
    >
      <body className="font-body bg-cream text-ink">{children}</body>
    </html>
  );
}
