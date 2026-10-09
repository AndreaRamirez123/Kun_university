"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { Certification, School, Stats } from "@/lib/types";

const CampusScene = dynamic(() => import("./campus-scene").then((m) => m.CampusScene), {
  ssr: false,
  loading: () => <CampusLoading />,
});

function CampusLoading() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[#FFF3E6]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FFF3E6]/25 border-t-[#FFC85C]" />
      <p className="text-sm font-semibold">Cargando el campus…</p>
      <Link href="/" className="text-xs underline opacity-70 hover:opacity-100">
        Ver versión clásica del sitio
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
  return <CampusScene schools={schools} certifications={certifications} stats={stats} />;
}
