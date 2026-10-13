import { Atkinson_Hyperlegible, Gabarito } from "next/font/google";

const gabarito = Gabarito({
  variable: "--font-gabarito",
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function CampusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="campus-root"
      className={`${gabarito.variable} ${atkinson.variable} bg-[#2A1758] text-[#FFF3E6]`}
      style={{ fontFamily: "var(--font-atkinson), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
