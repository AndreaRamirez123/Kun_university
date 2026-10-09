import { getCertifications, getSchools, getStats } from "@/lib/api";
import { Estilo3Content } from "./estilo-3-content";

export default async function Estilo3Page() {
  const [schools, certifications, stats] = await Promise.all([
    getSchools(),
    getCertifications(),
    getStats(),
  ]);

  return <Estilo3Content schools={schools} certifications={certifications} stats={stats} />;
}
