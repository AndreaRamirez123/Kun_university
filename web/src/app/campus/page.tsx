import { CampusExperience } from "@/components/campus/campus-experience";
import { ModelSwitcher } from "@/components/model-switcher";
import { getCertifications, getSchools, getStats } from "@/lib/api";

export default async function CampusPage() {
  const [schools, certifications, stats] = await Promise.all([
    getSchools(),
    getCertifications(),
    getStats(),
  ]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#1D1236]">
      <CampusExperience schools={schools} certifications={certifications} stats={stats} />
      <ModelSwitcher current={4} />

      {/* Contenido real para SEO y lectores de pantalla; oculto visualmente detrás del canvas 3D. */}
      <div className="sr-only">
        <h1>KUN University AI — Campus virtual</h1>
        <p>Recorre el campus de KUN University AI en 3D y conoce nuestras escuelas y certificaciones.</p>
        {schools.map((school) => (
          <section key={school.slug}>
            <h2>{school.name}</h2>
            <p>{school.tagline}</p>
            <ul>
              {school.programs.map((p) => (
                <li key={p.name}>
                  {p.name} ({p.degree})
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section>
          <h2>Certificaciones</h2>
          <ul>
            {certifications.map((c) => (
              <li key={c.slug}>
                {c.name} — {c.hours}h — {c.description}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
