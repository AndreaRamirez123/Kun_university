"use client";

import { useLocale, usePick } from "@/i18n/locale-context";
import { CHARACTERS, OUTFIT_COLORS, SKIN_TONES, characterById, type Accessory, type Gender } from "./campus-characters";
import type { Avatar } from "./campus-zones";

const COPY = {
  es: {
    eyebrow: "KUN University AI, Florida",
    title: "Recorre el campus",
    body: "Crea tu estudiante y camina por las cuatro escuelas, el currículo vivo, admisiones y la plataforma de lanzamiento de las certificaciones.",
    nameLabel: "Tu nombre",
    namePlaceholder: "Escribe tu nombre",
    gender: "Personaje",
    genders: { male: "Hombre", female: "Mujer", other: "Otro" } as Record<Gender, string>,
    style: "Estilo",
    skin: "Tono de piel",
    skinTone: "Tono",
    helmet: "Con casco: el tono de piel no se ve.",
    outfit: "Color de la ropa",
    color: "Color",
    accessory: "Accesorio",
    accessories: { cap: "Gorra KUN", headphones: "Audífonos", backpack: "Mochila KUN", none: "Ninguno" } as Record<Accessory, string>,
    start: "Entrar al campus",
    legend: "Muévete con las flechas o WASD, corre con Shift y salta con Espacio. En el celular, arrastra el dedo sobre la pantalla.",
  },
  en: {
    eyebrow: "KUN University AI, Florida",
    title: "Explore the campus",
    body: "Create your student and walk through the four schools, the living curriculum, admissions and the certifications launch pad.",
    nameLabel: "Your name",
    namePlaceholder: "Type your name",
    gender: "Character",
    genders: { male: "Man", female: "Woman", other: "Other" } as Record<Gender, string>,
    style: "Style",
    skin: "Skin tone",
    skinTone: "Tone",
    helmet: "Wearing a helmet: skin tone isn't visible.",
    outfit: "Outfit color",
    color: "Color",
    accessory: "Accessory",
    accessories: { cap: "KUN cap", headphones: "Headphones", backpack: "KUN backpack", none: "None" } as Record<Accessory, string>,
    start: "Enter the campus",
    legend: "Move with the arrow keys or WASD, run with Shift and jump with Space. On your phone, drag your finger across the screen.",
  },
};

const ACCESSORIES: Accessory[] = ["cap", "headphones", "backpack", "none"];
const GENDERS: Gender[] = ["male", "female", "other"];

const PILL = "h-10 cursor-pointer rounded-full border-2 px-3.5 text-[14px] font-bold transition";
const PILL_ON = "border-[#24123F] bg-[#24123F] text-[#FFF3E6]";
const PILL_OFF = "border-[#E2D4EC] bg-white text-[#24123F] hover:border-[#24123F]";

function Swatches({
  colors,
  value,
  label,
  onPick,
  disabled,
}: {
  colors: string[];
  value: string;
  label: string;
  onPick: (c: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${disabled ? "pointer-events-none opacity-40" : ""}`}>
      {colors.map((c, i) => (
        <button
          key={c}
          type="button"
          disabled={disabled}
          aria-label={`${label} ${i + 1}`}
          aria-pressed={value === c}
          onClick={() => onPick(c)}
          className="h-9 w-9 cursor-pointer rounded-full border-[3px] border-white transition hover:scale-110 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#FFC85C]"
          style={{ background: c, boxShadow: value === c ? "0 0 0 3px #24123F" : "0 0 0 2px #E2D4EC" }}
        />
      ))}
    </div>
  );
}
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
  const { locale } = useLocale();
  const character = characterById(avatar.character);
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
            <legend className="mb-2 p-0 text-[15px] font-bold">{t.gender}</legend>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => {
                const on = character.gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      if (on) return;
                      const first = CHARACTERS.find((ch) => ch.gender === g);
                      if (first) onChange({ ...avatar, character: first.id });
                    }}
                    className={`${PILL} ${on ? PILL_ON : PILL_OFF}`}
                  >
                    {t.genders[g]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 p-0 text-[15px] font-bold">{t.style}</legend>
            <div className="flex flex-wrap gap-2">
              {CHARACTERS.filter((ch) => ch.gender === character.gender).map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  aria-pressed={avatar.character === ch.id}
                  onClick={() => onChange({ ...avatar, character: ch.id })}
                  className={`${PILL} ${avatar.character === ch.id ? PILL_ON : PILL_OFF}`}
                >
                  {ch.label[locale]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-2 p-0 text-[15px] font-bold">{t.skin}</legend>
              <Swatches
                colors={SKIN_TONES}
                value={avatar.skin}
                label={t.skinTone}
                disabled={character.helmet}
                onPick={(skin) => onChange({ ...avatar, skin })}
              />
              {character.helmet && <p className="m-0 mt-1.5 text-[12px] text-[#5C4A72]">{t.helmet}</p>}
            </fieldset>
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-2 p-0 text-[15px] font-bold">{t.outfit}</legend>
              <Swatches colors={OUTFIT_COLORS} value={avatar.outfit} label={t.color} onPick={(outfit) => onChange({ ...avatar, outfit })} />
            </fieldset>
          </div>

          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 p-0 text-[15px] font-bold">{t.accessory}</legend>
            <div className="flex flex-wrap gap-2">
              {ACCESSORIES.map((a) => {
                // Con casco solo tiene sentido la mochila.
                const blocked = character.helmet && (a === "cap" || a === "headphones");
                return (
                  <button
                    key={a}
                    type="button"
                    disabled={blocked}
                    aria-pressed={avatar.accessory === a}
                    onClick={() => onChange({ ...avatar, accessory: a })}
                    className={`${PILL} ${avatar.accessory === a ? PILL_ON : PILL_OFF} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {t.accessories[a]}
                  </button>
                );
              })}
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
