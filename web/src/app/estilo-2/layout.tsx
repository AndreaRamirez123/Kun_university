import { Bungee, Poppins } from "next/font/google";

const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default function Estilo2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${bungee.variable} ${poppins.variable} bg-[#E7E8E8] text-[#171717]`}
      style={{ fontFamily: "var(--font-poppins), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
