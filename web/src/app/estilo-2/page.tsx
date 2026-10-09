import { Estilo2Content } from "@/components/estilo-2-content";
import { getCertifications, getSchools, getStats } from "@/lib/api";

export default async function Estilo2Page() {
  const [schools, certifications, stats] = await Promise.all([
    getSchools(),
    getCertifications(),
    getStats(),
  ]);

  return <Estilo2Content schools={schools} certifications={certifications} stats={stats} />;
}
