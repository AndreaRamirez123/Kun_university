import { Archivo_Black, Caveat, DM_Sans } from "next/font/google";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export default function Estilo3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${archivoBlack.variable} ${dmSans.variable} ${caveat.variable} overflow-hidden bg-[#FFF9EC] text-[#10101A]`}
      style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
