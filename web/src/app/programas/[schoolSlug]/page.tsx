import { notFound } from "next/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { ProgramSchoolView } from "@/components/program-school-view";
import { getSchools } from "@/lib/api";

export async function generateStaticParams() {
  const schools = await getSchools();
  return schools.map((school) => ({ schoolSlug: school.slug }));
}

export default async function SchoolProgramsPage({
  params,
}: {
  params: Promise<{ schoolSlug: string }>;
}) {
  const { schoolSlug } = await params;
  const schools = await getSchools();
  const school = schools.find((s) => s.slug === schoolSlug);
  if (!school) notFound();

  return (
    <>
      <ProgramSchoolView school={school} />
      <LanguageToggle />
    </>
  );
}
