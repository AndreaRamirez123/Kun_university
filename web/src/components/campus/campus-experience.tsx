"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { CampusCharacterSelect, type Gender } from "./campus-character-select";
import { hasWebGL } from "./has-webgl";
import { NoWebGLFallback } from "./no-webgl-fallback";
import { usePick } from "@/i18n/locale-context";
import type { Certification, School, Stats } from "@/lib/types";

const CampusScene = dynamic(() => import("./campus-scene").then((m) => m.CampusScene), {
  ssr: false,
  loading: () => <CampusLoading />,
});

const COPY = {
  es: { loading: "Cargando el campus…", classicSite: "Ver versión clásica del sitio" },
  en: { loading: "Loading the campus…", classicSite: "View the classic site" },
};

function CampusLoading() {
  const t = usePick(COPY);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#1D1236] text-[#FFF3E6]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FFF3E6]/25 border-t-[#FFC85C]" />
      <p className="text-sm font-semibold">{t.loading}</p>
      <Link href="/" className="text-xs underline opacity-70 hover:opacity-100">
        {t.classicSite}
      </Link>
    </div>
  );
}

export function CampusExperience({
  schools,
  certifications,
  stats,
}: {
  schools: School[];
  certifications: Certification[];
  stats: Stats;
}) {
  const [webglOk] = useState(() => (typeof window !== "undefined" ? hasWebGL() : true));
  const [gender, setGender] = useState<Gender | null>(null);

  if (!webglOk) return <NoWebGLFallback />;
  if (!gender) return <CampusCharacterSelect onSelect={setGender} />;

  return <CampusScene schools={schools} certifications={certifications} stats={stats} gender={gender} />;
}
