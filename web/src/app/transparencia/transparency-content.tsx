"use client";

import Link from "next/link";
import { useLocale, usePick } from "@/i18n/locale-context";
import raw from "@/data/transparencia.json";
import { PRIVACY_PATH } from "@/lib/compliance";

// Página "Transparencia": lo que una persona (o un regulador) necesita para
// confiar. Todo sale de src/data/transparencia.json. Solo se muestra lo que
// tiene datos reales: las secciones y filas vacías no aparecen (nada se inventa).

type Text = { es: string; en: string };
type Person = { nombre: string; cargo: Text; bio?: Text; foto?: string };
type Faculty = { nombre: string; titulo: Text; escuela: Text };
type Cost = { concepto: Text; valor: string };
type Doc = { titulo: Text; url: string };
type Data = {
  licencia: { estado: Text; numero: string; fecha: string; acreditacion: Text };
  institucion: { razonSocial: string; direccion: string; telefono: string; correo: string };
  liderazgo: Person[];
  profesores: Faculty[];
  costos: { nota: Text; items: Cost[] };
  documentos: Doc[];
};
const data = raw as unknown as Data;

const COPY = {
  es: {
    title: "Transparencia",
    lead: "Lo que necesitas saber para confiar en KUN University AI, en un solo lugar.",
    back: "← Volver al inicio",
    pending: "En preparación",
    license: "Licenciamiento",
    number: "Número de licencia",
    date: "Fecha",
    accreditation: "Acreditación",
    institution: "La institución",
    legalName: "Razón social",
    address: "Dirección en Florida",
    phone: "Teléfono",
    email: "Correo",
    leadership: "Quién dirige KUN",
    faculty: "Profesores",
    costs: "Costos",
    docs: "Documentos",
    privacy: "Política de privacidad",
  },
  en: {
    title: "Transparency",
    lead: "What you need to know to trust KUN University AI, in one place.",
    back: "← Back to home",
    pending: "Coming soon",
    license: "Licensing",
    number: "License number",
    date: "Date",
    accreditation: "Accreditation",
    institution: "The institution",
    legalName: "Legal name",
    address: "Address in Florida",
    phone: "Phone",
    email: "Email",
    leadership: "Who leads KUN",
    faculty: "Faculty",
    costs: "Costs",
    docs: "Documents",
    privacy: "Privacy policy",
  },
};

function Row({ label, value }: { label: string; value: string; pending?: string }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[200px_1fr] gap-3 border-b border-[#10182B]/10 py-2.5 text-[15px] max-md:grid-cols-1 max-md:gap-0.5">
      <dt className="font-bold text-[#5b6478]">{label}</dt>
      <dd className="m-0">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-[22px] font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function TransparencyContent() {
  const t = usePick(COPY);
  const { locale } = useLocale();
  const lic = data.licencia;
  const inst = data.institucion;
  const hasLicenseRows = !!(lic.numero || lic.fecha || lic.acreditacion[locale]);
  const hasInstitution = !!(inst.razonSocial || inst.direccion || inst.telefono || inst.correo);
  return (
    <main className="mx-auto max-w-[860px] px-6 py-14 text-[#10182B] max-md:py-10">
      <Link href="/" className="text-[13px] font-bold text-[#033E8C] no-underline hover:underline">
        {t.back}
      </Link>
      <h1 className="mt-6 mb-2 text-[40px] leading-tight font-bold max-md:text-[30px]">{t.title}</h1>
      <p className="m-0 text-[16px] text-[#5b6478]">{t.lead}</p>

      <Section title={t.license}>
        <p className="m-0 mb-3 rounded-xl bg-[#10182B] px-4 py-3 text-[15px] text-white">ⓘ {data.licencia.estado[locale]}</p>
        {hasLicenseRows && (
          <dl className="m-0">
            <Row label={t.number} value={lic.numero} />
            <Row label={t.date} value={lic.fecha} />
            <Row label={t.accreditation} value={lic.acreditacion[locale]} />
          </dl>
        )}
      </Section>

      {hasInstitution && (
      <Section title={t.institution}>
        <dl className="m-0">
          <Row label={t.legalName} value={data.institucion.razonSocial} />
          <Row label={t.address} value={data.institucion.direccion} />
          <Row label={t.phone} value={data.institucion.telefono} />
          <Row label={t.email} value={data.institucion.correo} />
        </dl>
      </Section>
      )}

      {data.liderazgo.length > 0 && (
      <Section title={t.leadership}>
        {(
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {data.liderazgo.map((p) => (
              <div key={p.nombre} className="flex gap-4 rounded-2xl border border-[#10182B]/12 p-4">
                {p.foto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.foto} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
                )}
                <div>
                  <div className="text-[16px] font-bold">{p.nombre}</div>
                  <div className="text-[14px] text-[#033E8C]">{p.cargo[locale]}</div>
                  {p.bio && <p className="m-0 mt-1 text-[13.5px] text-[#5b6478]">{p.bio[locale]}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
      )}

      {data.profesores.length > 0 && (
      <Section title={t.faculty}>
        {(
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 max-md:grid-cols-1">
            {data.profesores.map((f) => (
              <li key={f.nombre} className="rounded-xl border border-[#10182B]/12 p-3 text-[14px]">
                <b>{f.nombre}</b>
                <div className="text-[#5b6478]">
                  {f.titulo[locale]} · {f.escuela[locale]}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
      )}

      {data.costos.items.length > 0 && (
      <Section title={t.costs}>
        {(
          <dl className="m-0">
            {data.costos.items.map((c) => (
              <Row key={c.concepto.es} label={c.concepto[locale]} value={c.valor} />
            ))}
          </dl>
        )}
        {data.costos.nota[locale] && <p className="m-0 mt-2 text-[13px] text-[#5b6478]">{data.costos.nota[locale]}</p>}
      </Section>
      )}

      <Section title={t.docs}>
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px]">
          {data.documentos.map((d) => (
            <li key={d.url}>
              <a href={d.url} target="_blank" rel="noopener" className="text-[#033E8C] underline">
                {d.titulo[locale]}
              </a>
            </li>
          ))}
          <li>
            <a href={PRIVACY_PATH} className="text-[#033E8C] underline">
              {t.privacy}
            </a>
          </li>
        </ul>
      </Section>
    </main>
  );
}
