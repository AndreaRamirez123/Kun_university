const ACCENTS = ["#0092B6", "#D4AF37", "#A9BFD1"];

const STEPS = [
  {
    number: "I",
    title: "La IA rastrea la frontera",
    body: "Nuestros agentes de IA monitorean lo último que publica la ciencia, la industria y la regulación en cada campo que enseñamos.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="10" cy="10" r="6" />
        <path d="M20 20l-5-5" />
        <path d="M10 7v6M7 10h6" />
      </svg>
    ),
  },
  {
    number: "II",
    title: "El criterio humano decide",
    body: "Nuestro equipo académico experto revisa, valida y da forma al contenido. La IA propone, las personas deciden.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.5l2.3 2.3L16 9.5" />
      </svg>
    ),
  },
  {
    number: "III",
    title: "Aprendes lo que el mercado necesita hoy",
    body: "No lo que se enseñaba hace cinco años. Aprendes las competencias que las empresas buscan hoy.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 20V10M10 20V4M16 20v-7M20 20v-3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function CurriculumEngine() {
  return (
    <div className="relative mx-auto max-w-260 px-14 pb-24 max-md:px-6">
      <h2 className="font-display mb-16 text-center text-4xl font-normal max-md:mb-8">
        Así se construye un curso en KUN
      </h2>
      <div className="grid grid-cols-3 items-start justify-items-center gap-8 max-md:grid-cols-1 max-md:gap-6">
        {STEPS.map((step, i) => (
          <div key={step.number} className="ce-card-effect">
            <div className="ce-card-tilt">
              <div className="ce-card-inner" style={{ "--card-accent": ACCENTS[i] } as React.CSSProperties}>
                <div className="ce-liquid" />
                <div className="ce-shine" />
                <div className="ce-glow" />
                <div className="ce-content">
                  <div className="ce-badge">{step.number}</div>
                  <div className="ce-image" style={{ background: ACCENTS[i] }}>
                    {step.icon}
                  </div>
                  <div className="ce-text">
                    <p className="ce-title">{step.title}</p>
                    <p className="ce-description">{step.body}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <a
          href="#informacion"
          className="inline-block rounded-full bg-navy px-7 py-4 text-[15px] font-bold text-cream shadow-[0_14px_28px_rgba(3,62,140,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(3,62,140,0.55)]"
        >
          Habla con admisiones
        </a>
      </div>
    </div>
  );
}
