"use client";

import { usePick } from "@/i18n/locale-context";
import { SHIRT_COLORS, type Accessory, type Avatar } from "./campus-zones";

const COPY = {
  es: {
    eyebrow: "KUN University AI, Florida",
    title: "Recorre el campus",
    body: "Crea tu estudiante y camina por las cuatro escuelas, el currículo vivo, admisiones y la plataforma de lanzamiento de las certificaciones.",
    nameLabel: "Tu nombre",
    namePlaceholder: "Escribe tu nombre",
    shirt: "Color de tu camiseta",
    color: "Color",
    accessory: "Accesorio",
    accessories: { cap: "Gorra", headphones: "Audífonos", none: "Ninguno" } as Record<Accessory, string>,
    start: "Entrar al campus",
    legend: "Muévete con las flechas o WASD, corre con Shift y salta con Espacio. En el celular, arrastra el dedo sobre la pantalla.",
  },
  en: {
    eyebrow: "KUN University AI, Florida",
    title: "Explore the campus",
    body: "Create your student and walk through the four schools, the living curriculum, admissions and the certifications launch pad.",
    nameLabel: "Your name",
    namePlaceholder: "Type your name",
    shirt: "T-shirt color",
    color: "Color",
    accessory: "Accessory",
    accessories: { cap: "Cap", headphones: "Headphones", none: "None" } as Record<Accessory, string>,
    start: "Enter the campus",
    legend: "Move with the arrow keys or WASD, run with Shift and jump with Space. On your phone, drag your finger across the screen.",
  },
};

const ACCESSORIES: Accessory[] = ["cap", "headphones", "none"];
const FADE = "transition-[translate,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)]";

// Titular que entra letra por letra, como los títulos de Active Theory.
function SplitTitle({ text, visible, reduceMotion }: { text: string; visible: boolean; reduceMotion: boolean }) {
  return (
    <span aria-label={text} className="block">
      {text.split(" ").map((word, wi, words) => (
        <span key={`${word}-${wi}`} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom whitespace-nowrap">
          {Array.from(word).map((ch, ci) => {
            const index = words.slice(0, wi).join(" ").length + ci;
            return (
              <span
                key={ci}
                className="inline-block transition-[translate,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
                style={{
                  translate: visible || reduceMotion ? "0 0" : "0 110%",
                  opacity: visible || reduceMotion ? 1 : 0,
                  transitionDelay: reduceMotion ? "0ms" : `${200 + index * 28}ms`,
                }}
              >
                {ch}
              </span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

export function CampusIntro({
  visible,
  leaving,
  avatar,
  reduceMotion,
  onChange,
  onStart,
}: {
  visible: boolean;
  leaving: boolean;
  avatar: Avatar;
  reduceMotion: boolean;
  onChange: (avatar: Avatar) => void;
  onStart: () => void;
}) {
  const t = usePick(COPY);
  const shown = visible && !leaving;
  const fade = (delay: number): React.CSSProperties => ({
    translate: shown || reduceMotion ? "0 0" : "0 24px",
    opacity: shown ? 1 : 0,
    transitionDelay: shown && !reduceMotion ? `${delay}ms` : "0ms",
  });

  return (
    <section
      aria-labelledby="campus-intro-title"
      className={`absolute inset-0 z-20 flex items-end justify-start overflow-y-auto px-6 pt-6 pb-6 max-md:pb-28 ${
        shown ? "" : "pointer-events-none"
      }`}
      style={{
        background:
          "linear-gradient(90deg, rgba(29,12,60,0.8) 0%, rgba(29,12,60,0.35) 45%, rgba(29,12,60,0) 70%)",
        opacity: visible && !leaving ? 1 : 0,
        transition: "opacity 700ms ease",
      }}
    >
      <form
        className="flex w-full max-w-115 flex-col gap-5 pb-4 text-[#FFF3E6] md:pb-14 md:pl-4"
        onSubmit={(e) => {
          e.preventDefault();
          onStart();
        }}
      >
        <h1
          id="campus-intro-title"
          className="font-(family-name:--font-gabarito) text-[clamp(44px,7vw,80px)] leading-[0.92] font-black tracking-[-0.02em]"
        >
          <span style={fade(80)} className={`${FADE} mb-3 block text-[0.3em] font-bold tracking-normal text-[#FFC85C]`}>
            {t.eyebrow}
          </span>
          <SplitTitle text={t.title} visible={shown} reduceMotion={reduceMotion} />
        </h1>
        <p style={fade(520)} className={`${FADE} m-0 max-w-[40ch] text-lg leading-relaxed text-[#F2E2F0] max-md:hidden`}>
          {t.body}
        </p>

        <div
          style={fade(640)}
          className={`${FADE} flex flex-col gap-4 rounded-[26px] bg-[#FFF8F0]/95 p-5 text-[#24123F] shadow-[0_30px_60px_-20px_rgba(10,4,30,0.7)] backdrop-blur-md`}
        >
          <label className="flex flex-col gap-1.5 text-[15px] font-bold">
            {t.nameLabel}
            <input
              type="text"
              maxLength={16}
              value={avatar.name}
              placeholder={t.namePlaceholder}
              autoComplete="given-name"
              onChange={(e) => onChange({ ...avatar, name: e.target.value })}
              className="h-12 rounded-[14px] border-2 border-[#E2D4EC] bg-white px-3.5 text-[17px] font-normal text-[#24123F] focus:border-[#24123F] focus:outline-none"
            />
          </label>

          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 p-0 text-[15px] font-bold">{t.shirt}</legend>
            <div className="flex flex-wrap gap-2.5">
              {SHIRT_COLORS.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`${t.color} ${i + 1}`}
                  aria-pressed={avatar.shirt === c}
                  onClick={() => onChange({ ...avatar, shirt: c })}
                  className="h-11 w-11 cursor-pointer rounded-full border-[3px] border-white transition hover:scale-110 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#FFC85C]"
                  style={{
                    background: c,
                    boxShadow: avatar.shirt === c ? "0 0 0 3px #24123F" : "0 0 0 2px #E2D4EC",
                  }}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 p-0 text-[15px] font-bold">{t.accessory}</legend>
            <div className="flex flex-wrap gap-2.5">
              {ACCESSORIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-pressed={avatar.accessory === a}
                  onClick={() => onChange({ ...avatar, accessory: a })}
                  className={`h-11 cursor-pointer rounded-full border-2 px-4 text-[15px] font-bold transition ${
                    avatar.accessory === a
                      ? "border-[#24123F] bg-[#24123F] text-[#FFF3E6]"
                      : "border-[#E2D4EC] bg-white text-[#24123F] hover:border-[#24123F]"
                  }`}
                >
                  {t.accessories[a]}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="group relative h-14 cursor-pointer overflow-hidden rounded-[18px] font-(family-name:--font-gabarito) text-xl font-extrabold text-[#24123F] shadow-[0_14px_30px_-12px_rgba(255,140,80,0.9)] transition hover:-translate-y-0.5"
            style={{ background: "linear-gradient(180deg, #FFD47A, #FF9A5C)" }}
          >
            <span className="relative z-10">{t.start} →</span>
            {/* Destello que cruza el botón al pasar el mouse */}
            <span
              aria-hidden
              className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/40 transition-[left] duration-700 group-hover:left-[120%]"
            />
          </button>
          <p className="m-0 text-[13px] leading-snug text-[#5C4A72]">{t.legend}</p>
        </div>
      </form>
    </section>
  );
}
