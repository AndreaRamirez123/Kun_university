"use client";

import { useEffect, useRef, useState } from "react";
import { PRIVACY_PATH } from "@/lib/compliance";
import { CampusLang } from "./campus-lang";
import { usePick } from "@/i18n/locale-context";
import {
  HAIR_COLORS,
  OPTION_LABELS,
  OPTIONS,
  OUTFIT_COLORS,
  SKIN_TONES,
  hairStylesFor,
  withGender,
  type Accessory,
  type Avatar,
  type Pet,
} from "./campus-avatar";
import { SHOP_ITEMS, useWallet } from "./campus-wallet";
import { CampusCamera } from "./campus-camera";
import { campusRuntime } from "./campus-runtime";
import { analyzePhoto } from "./campus-photo";
import type { Gender } from "./campus-avatar";

const COPY = {
  es: {
    eyebrow: "Lobby · KUN University AI, Florida",
    title: "Crea tu estudiante",
    nameLabel: "Tu nombre",
    namePlaceholder: "Así aparecerás en el campus",
    nameMissing: "Escribe tu nombre para que aparezca sobre tu personaje.",
    tabs: ["Persona", "Cara", "Pelo", "Ropa", "Mascota"],
    gender: "Personaje",
    pet: "Mascota",
    petHint: "Te acompaña por el campus. Si prefieres recorrerlo solo, elige Ninguna.",
    photo: "Parecido a ti",
    photoCamera: "Usar cámara",
    photoUpload: "Subir foto",
    photoRetake: "Usar otra foto",
    photoBusy: "Analizando tu foto…",
    photoDone: "Listo: tomamos tu tono de piel y el color de tu pelo.",
    photoHint: "Opcional: tu personaje toma el tono de piel y el color de pelo de tu foto. Se procesa solo en tu dispositivo.",
    photoError: "No pudimos leer esa imagen. Prueba con otra foto.",
    height: "Estatura",
    build: "Complexión",
    skin: "Tono de piel",
    eyes: "Ojos",
    brows: "Cejas",
    nose: "Nariz",
    mouth: "Boca",
    facialHair: "Vello facial",
    glasses: "Lentes",
    hairStyle: "Peinado",
    spinLeft: "Girar a la izquierda",
    spinRight: "Girar a la derecha",
    spinBack: "🔄 Ver espalda",
    spinHint: "o arrastra el personaje",
    privacyNote: "Tu nombre y tu personaje los verán otras personas del campus.",
    privacyLink: "Privacidad",
    hairColor: "Color de pelo",
    top: "Prenda",
    outfit: "Color de la ropa",
    accessory: "Accesorio",
    fromPhoto: "De tu foto",
    color: "Color",
    random: "Sorpréndeme",
    start: "Entrar al campus",
    legend: "WASD o flechas para caminar · Shift corre · Espacio salta",
  },
  en: {
    eyebrow: "Lobby · KUN University AI, Florida",
    title: "Create your student",
    nameLabel: "Your name",
    namePlaceholder: "This is how you'll appear on campus",
    nameMissing: "Type your name so it shows above your character.",
    tabs: ["Person", "Face", "Hair", "Outfit", "Pet"],
    gender: "Character",
    pet: "Pet",
    petHint: "Keeps you company on campus. Prefer to explore alone? Pick None.",
    photo: "Looks like you",
    photoCamera: "Use camera",
    photoUpload: "Upload photo",
    photoRetake: "Use another photo",
    photoBusy: "Analyzing your photo…",
    photoDone: "Done: we matched your skin tone and hair color.",
    photoHint: "Optional: your character takes the skin tone and hair color from your photo. Processed only on your device.",
    photoError: "We couldn't read that image. Try another photo.",
    height: "Height",
    build: "Build",
    skin: "Skin tone",
    eyes: "Eyes",
    brows: "Eyebrows",
    nose: "Nose",
    mouth: "Mouth",
    facialHair: "Facial hair",
    glasses: "Glasses",
    hairStyle: "Hairstyle",
    spinLeft: "Turn left",
    spinRight: "Turn right",
    spinBack: "🔄 See back",
    spinHint: "or drag the character",
    privacyNote: "Other people on campus will see your name and character.",
    privacyLink: "Privacy",
    hairColor: "Hair color",
    top: "Top",
    outfit: "Outfit color",
    accessory: "Accessory",
    fromPhoto: "From your photo",
    color: "Color",
    random: "Surprise me",
    start: "Enter the campus",
    legend: "WASD or arrows to walk · Shift runs · Space jumps",
  },
};

const FADE = "transition-[translate,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)]";
const PILL = "h-9 cursor-pointer rounded-full border-2 px-3 text-[13px] font-bold transition whitespace-nowrap";
const PILL_ON = "border-[#24123F] bg-[#24123F] text-[#FFF3E6]";
const PILL_OFF = "border-[#E2D4EC] bg-white text-[#24123F] hover:border-[#24123F]";

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-1.5 p-0 text-[13px] font-bold text-[#24123F]/80">{label}</legend>
      {children}
    </fieldset>
  );
}

function Pills<T extends string>({
  options,
  labels,
  value,
  onPick,
}: {
  options: T[];
  labels: Record<T, string>;
  value: T;
  onPick: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} onClick={() => onPick(o)} className={`${PILL} ${value === o ? PILL_ON : PILL_OFF}`}>
          {labels[o]}
        </button>
      ))}
    </div>
  );
}

function Swatches({
  colors,
  value,
  label,
  extraLabel,
  onPick,
}: {
  colors: string[];
  value: string;
  label: string;
  /** Si el valor no está en la paleta (vino de la foto), se muestra como un color extra. */
  extraLabel: string;
  onPick: (c: string) => void;
}) {
  const custom = !colors.includes(value);
  return (
    <div className="flex flex-wrap gap-1.5">
      {custom && (
        <button
          type="button"
          aria-pressed
          aria-label={extraLabel}
          title={extraLabel}
          className="relative h-8 w-8 rounded-full border-[3px] border-white"
          style={{ background: value, boxShadow: "0 0 0 3px #24123F" }}
        >
          <span aria-hidden className="absolute -right-1 -bottom-1 rounded-full bg-[#24123F] px-1 text-[8px] leading-4 text-white">
            📷
          </span>
        </button>
      )}
      {colors.map((c, i) => (
        <button
          key={c}
          type="button"
          aria-label={`${label} ${i + 1}`}
          aria-pressed={value === c}
          onClick={() => onPick(c)}
          className="h-8 w-8 cursor-pointer rounded-full border-[3px] border-white transition hover:scale-110"
          style={{ background: c, boxShadow: value === c ? "0 0 0 3px #24123F" : "0 0 0 2px #E2D4EC" }}
        />
      ))}
    </div>
  );
}

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-[13px] font-bold text-[#24123F]/80">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#E8735A]"
      />
    </label>
  );
}

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

function randomAvatar(a: Avatar): Avatar {
  const gender = pick(OPTIONS.gender);
  return {
    ...withGender(a, gender),
    skin: pick(SKIN_TONES),
    hairStyle: pick(hairStylesFor(gender)),
    hairColor: pick(HAIR_COLORS),
    eyes: pick(OPTIONS.eyes),
    brows: pick(OPTIONS.brows),
    nose: pick(OPTIONS.nose),
    mouth: pick(OPTIONS.mouth),
    facialHair: gender === "male" ? pick(OPTIONS.facialHair) : "none",
    glasses: Math.random() < 0.35 ? pick(OPTIONS.glasses) : "none",
    top: pick(OPTIONS.top),
    outfit: pick(OUTFIT_COLORS),
    accessory: pick(OPTIONS.accessory),
    pet: pick(OPTIONS.pet),
    height: 0.9 + Math.random() * 0.2,
    build: 0.85 + Math.random() * 0.3,
  };
}

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
  avatar: a,
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
  const L = usePick(OPTION_LABELS);
  // Lo comprado en la KUN Store aparece junto a las opciones gratis.
  const { owned } = useWallet();
  const ownedAccessories = SHOP_ITEMS.filter((i) => i.kind === "accessory" && owned.includes(i.id)).map((i) => i.value);
  const ownedPets = SHOP_ITEMS.filter((i) => i.kind === "pet" && owned.includes(i.id)).map((i) => i.value);
  const ownedOutfits = SHOP_ITEMS.filter((i) => i.kind === "outfit" && owned.includes(i.id)).map((i) => i.value);
  const [tab, setTab] = useState(0);
  const [nameError, setNameError] = useState(false);
  const [photo, setPhoto] = useState<{ status: "idle" | "busy" | "done" | "error"; preview?: string }>({ status: "idle" });
  const nameInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const shown = visible && !leaving;
  const fade = (delay: number): React.CSSProperties => ({
    translate: shown || reduceMotion ? "0 0" : "0 24px",
    opacity: shown ? 1 : 0,
    transitionDelay: shown && !reduceMotion ? `${delay}ms` : "0ms",
  });
  const set = (patch: Partial<Avatar>) => onChange({ ...a, ...patch });

  // Girar el personaje para verlo por todos lados (botones o arrastrando sobre él).
  const drag = useRef<{ x: number; spin: number } | null>(null);
  const spinTo = (v: number) => {
    campusRuntime.previewSpin = v;
  };
  useEffect(() => () => spinTo(0), []);

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setPhoto({ status: "busy" });
    try {
      const traits = await analyzePhoto(file);
      onChange({ ...a, skin: traits.skin, hairColor: traits.hair });
      setPhoto({ status: "done", preview: traits.preview });
    } catch {
      setPhoto({ status: "error" });
    }
  }

  return (
    <section
      aria-labelledby="campus-intro-title"
      className={`absolute inset-0 z-20 flex items-stretch justify-start px-6 py-5 max-md:items-end max-md:px-3 max-md:pt-3 max-md:pb-[calc(12px+env(safe-area-inset-bottom,0px))] ${
        shown ? "" : "pointer-events-none"
      }`}
      onPointerDown={(e) => {
        if (e.target !== e.currentTarget) return;
        drag.current = { x: e.clientX, spin: campusRuntime.previewSpin };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current) spinTo(drag.current.spin + (e.clientX - drag.current.x) * 0.012);
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      style={{
        cursor: "grab",
        touchAction: "pan-y",
        background: "linear-gradient(90deg, rgba(29,12,60,0.82) 0%, rgba(29,12,60,0.35) 42%, rgba(29,12,60,0) 68%)",
        opacity: visible && !leaving ? 1 : 0,
        transition: "opacity 700ms ease",
      }}
    >
      <CampusLang className="absolute top-[calc(12px+env(safe-area-inset-top,0px))] left-3 z-10" />
      <form
        noValidate
        className="flex h-full w-full max-w-115 flex-col gap-3 text-[#FFF3E6] md:pl-2 max-md:h-[max(62dvh,min(100%,470px))]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!a.name.trim()) {
            setNameError(true);
            nameInput.current?.focus();
            return;
          }
          onStart();
        }}
      >
        <h1
          id="campus-intro-title"
          className="m-0 shrink-0 font-(family-name:--font-gabarito) text-[clamp(32px,4.4vw,54px)] leading-[0.95] font-black tracking-[-0.02em] max-md:hidden"
        >
          <span style={fade(80)} className={`${FADE} mb-2 block text-[0.34em] font-bold tracking-normal text-[#FFC85C]`}>
            {t.eyebrow}
          </span>
          <SplitTitle text={t.title} visible={shown} reduceMotion={reduceMotion} />
        </h1>

        <div
          style={fade(360)}
          className={`${FADE} flex min-h-0 flex-1 flex-col overflow-hidden rounded-[26px] bg-[#FFF8F0]/96 text-[#24123F] shadow-[0_30px_60px_-20px_rgba(10,4,30,0.7)] backdrop-blur-md`}
        >
          {/* Nombre: siempre visible, es lo que aparece sobre el personaje */}
          <div className="shrink-0 px-5 pt-4 max-md:px-4 max-md:pt-3">
            <label className="flex flex-col gap-1 text-[14px] font-bold max-md:text-[13px]">
              {t.nameLabel}
              <input
                ref={nameInput}
                type="text"
                required
                maxLength={16}
                value={a.name}
                placeholder={t.namePlaceholder}
                autoComplete="given-name"
                aria-invalid={nameError && !a.name.trim()}
                onChange={(e) => {
                  set({ name: e.target.value });
                  if (e.target.value.trim()) setNameError(false);
                }}
                className={`h-11 rounded-[14px] border-2 bg-white px-3.5 text-[16px] max-md:h-10 font-normal text-[#24123F] focus:outline-none ${
                  nameError && !a.name.trim() ? "border-[#E8735A]" : "border-[#E2D4EC] focus:border-[#24123F]"
                }`}
              />
            </label>
            {nameError && !a.name.trim() && <p className="m-0 mt-1 text-[12px] font-semibold text-[#C0442C]">{t.nameMissing}</p>}
            <div className="mt-3 max-md:mt-2">
              <Group label={t.gender}>
                <div role="radiogroup" aria-label={t.gender} className="grid grid-cols-3 gap-1.5">
                  {OPTIONS.gender.map((g) => (
                    <button
                      key={g}
                      type="button"
                      role="radio"
                      aria-checked={a.gender === g}
                      onClick={() => a.gender !== g && onChange(withGender(a, g))}
                      className={`${PILL} h-10 max-md:h-9 ${a.gender === g ? PILL_ON : PILL_OFF}`}
                    >
                      {L.gender[g]}
                    </button>
                  ))}
                </div>
              </Group>
            </div>
          </div>

          {/* Pestañas al estilo del editor de Mii */}
          <div role="tablist" className="mx-5 mt-3 flex shrink-0 gap-1 rounded-full bg-[#24123F]/8 p-1 max-md:mx-4 max-md:mt-2">
            {t.tabs.map((label, i) => (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={tab === i}
                onClick={() => setTab(i)}
                className={`h-8 min-w-0 flex-1 cursor-pointer rounded-full px-1 text-[12.5px] font-bold transition ${
                  tab === i ? "bg-[#24123F] text-[#FFF3E6] shadow" : "text-[#24123F]/70 hover:text-[#24123F]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div role="tabpanel" className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto overscroll-contain px-5 py-4 max-md:min-h-24 max-md:gap-3 max-md:px-4 max-md:py-3">
            {tab === 0 && (
              <>

                <Group label={t.photo}>
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-[#E2D4EC] p-3">
                    {photo.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element -- miniatura local en data URL
                      <img src={photo.preview} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#24123F]/8 text-xl">
                        📷
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          disabled={photo.status === "busy"}
                          onClick={() => setCameraOpen(true)}
                          className="cursor-pointer rounded-full bg-[#24123F] px-3.5 py-1.5 text-[13px] font-bold text-[#FFF3E6] disabled:opacity-60"
                        >
                          📷 {photo.status === "busy" ? t.photoBusy : t.photoCamera}
                        </button>
                        <button
                          type="button"
                          disabled={photo.status === "busy"}
                          onClick={() => fileInput.current?.click()}
                          className="cursor-pointer rounded-full border-2 border-[#24123F]/20 px-3 py-1 text-[13px] font-bold text-[#24123F] disabled:opacity-60"
                        >
                          {t.photoUpload}
                        </button>
                      </div>
                      <p className="m-0 mt-1 text-[11.5px] leading-snug text-[#5C4A72]">
                        {photo.status === "done" ? t.photoDone : photo.status === "error" ? t.photoError : t.photoHint}
                      </p>
                    </div>
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        void onPhoto(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </Group>
                <div className="grid grid-cols-2 gap-4">
                  <Slider label={t.height} value={a.height} min={0.85} max={1.15} onChange={(height) => set({ height })} />
                  <Slider label={t.build} value={a.build} min={0.8} max={1.25} onChange={(build) => set({ build })} />
                </div>
              </>
            )}
            {tab === 1 && (
              <>
                <Group label={t.skin}>
                  <Swatches colors={SKIN_TONES} value={a.skin} label={t.color} extraLabel={t.fromPhoto} onPick={(skin) => set({ skin })} />
                </Group>
                <Group label={t.eyes}>
                  <Pills options={OPTIONS.eyes} labels={L.eyes} value={a.eyes} onPick={(eyes) => set({ eyes })} />
                </Group>
                <Group label={t.brows}>
                  <Pills options={OPTIONS.brows} labels={L.brows} value={a.brows} onPick={(brows) => set({ brows })} />
                </Group>
                <Group label={t.nose}>
                  <Pills options={OPTIONS.nose} labels={L.nose} value={a.nose} onPick={(nose) => set({ nose })} />
                </Group>
                <Group label={t.mouth}>
                  <Pills options={OPTIONS.mouth} labels={L.mouth} value={a.mouth} onPick={(mouth) => set({ mouth })} />
                </Group>
                <Group label={t.facialHair}>
                  <Pills options={OPTIONS.facialHair} labels={L.facialHair} value={a.facialHair} onPick={(facialHair) => set({ facialHair })} />
                </Group>
                <Group label={t.glasses}>
                  <Pills options={OPTIONS.glasses} labels={L.glasses} value={a.glasses} onPick={(glasses) => set({ glasses })} />
                </Group>
              </>
            )}
            {tab === 2 && (
              <>
                <Group label={t.hairStyle}>
                  <Pills options={hairStylesFor(a.gender)} labels={L.hairStyle} value={a.hairStyle} onPick={(hairStyle) => set({ hairStyle })} />
                </Group>
                <Group label={t.hairColor}>
                  <Swatches colors={HAIR_COLORS} value={a.hairColor} label={t.color} extraLabel={t.fromPhoto} onPick={(hairColor) => set({ hairColor })} />
                </Group>
              </>
            )}
            {tab === 3 && (
              <>
                <Group label={t.top}>
                  <Pills options={OPTIONS.top} labels={L.top} value={a.top} onPick={(top) => set({ top })} />
                </Group>
                <Group label={t.outfit}>
                  <Swatches colors={[...OUTFIT_COLORS, ...ownedOutfits]} value={a.outfit} label={t.color} extraLabel={t.fromPhoto} onPick={(outfit) => set({ outfit })} />
                </Group>
                <Group label={t.accessory}>
                  <Pills options={[...OPTIONS.accessory, ...(ownedAccessories as Accessory[])]} labels={L.accessory} value={a.accessory} onPick={(accessory) => set({ accessory })} />
                </Group>
              </>
            )}
            {tab === 4 && (
              <Group label={t.pet}>
                {/* Tarjetas grandes: la mascota se ve al instante junto a tu personaje */}
                <div role="radiogroup" aria-label={t.pet} className="grid grid-cols-2 gap-2">
                  {[...OPTIONS.pet, ...(ownedPets as Pet[])].map((pet) => {
                    const on = a.pet === pet;
                    const [icon, ...rest] = L.pet[pet].split(" ");
                    const label = pet === "none" ? L.pet[pet] : rest.join(" ");
                    return (
                      <button
                        key={pet}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => set({ pet })}
                        className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 px-3 py-4 text-[14px] font-bold transition hover:-translate-y-0.5 ${
                          on ? "border-[#24123F] bg-[#24123F] text-[#FFF3E6]" : "border-[#E2D4EC] bg-white text-[#24123F] hover:border-[#24123F]"
                        }`}
                      >
                        <span aria-hidden className="text-3xl leading-none">
                          {pet === "none" ? "🚶" : icon}
                        </span>
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="m-0 mt-2 text-[12px] text-[#5C4A72]">{t.petHint}</p>
              </Group>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-[#24123F]/10 px-5 pt-3 pb-4 max-md:px-4 max-md:pt-2.5 max-md:pb-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...randomAvatar(a), name: a.name })}
                className="h-13 shrink-0 max-md:h-12 cursor-pointer rounded-[16px] border-2 border-[#24123F]/15 bg-white px-4 text-[14px] font-bold text-[#24123F] transition hover:border-[#24123F]"
              >
                🎲 {t.random}
              </button>
              <button
                type="submit"
                className="group relative h-13 flex-1 cursor-pointer max-md:h-12 overflow-hidden rounded-[16px] font-(family-name:--font-gabarito) text-lg font-extrabold text-[#24123F] shadow-[0_14px_30px_-12px_rgba(255,140,80,0.9)] transition hover:-translate-y-0.5"
                style={{ background: "linear-gradient(180deg, #FFD47A, #FF9A5C)" }}
              >
                <span className="relative z-10">{t.start} →</span>
                <span
                  aria-hidden
                  className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/40 transition-[left] duration-700 group-hover:left-[120%]"
                />
              </button>
            </div>
            <p className="m-0 text-center text-[11.5px] text-[#5C4A72] max-md:hidden">{t.legend}</p>
            <p className="m-0 text-center text-[11px] text-[#5C4A72]">
              {t.privacyNote}{" "}
              <a href={PRIVACY_PATH} target="_blank" rel="noopener" className="font-bold text-[#24123F] underline">
                {t.privacyLink}
              </a>
            </p>
          </div>
        </div>
      </form>
      <div
        style={fade(500)}
        className={`${FADE} absolute right-[16%] bottom-8 flex items-center gap-1.5 rounded-full border border-white/25 bg-[#1D0C3C]/70 p-1.5 text-[#FFF3E6] backdrop-blur-md max-md:top-3 max-md:right-3 max-md:bottom-auto`}
      >
        <button type="button" onClick={() => spinTo(campusRuntime.previewSpin - Math.PI / 4)} aria-label={t.spinLeft} className="h-10 w-10 cursor-pointer rounded-full text-xl hover:bg-white/15">
          ↺
        </button>
        <button
          type="button"
          onClick={() => spinTo(Math.abs(Math.cos(campusRuntime.previewSpin) - 1) < 0.1 ? Math.PI : 0)}
          className="h-10 cursor-pointer rounded-full bg-white px-4 text-[13px] font-bold text-[#24123F]"
        >
          {t.spinBack}
        </button>
        <button type="button" onClick={() => spinTo(campusRuntime.previewSpin + Math.PI / 4)} aria-label={t.spinRight} className="h-10 w-10 cursor-pointer rounded-full text-xl hover:bg-white/15">
          ↻
        </button>
        <span className="pr-2 text-[11px] text-white/60 max-lg:hidden">{t.spinHint}</span>
      </div>
      <CampusCamera
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => {
          setCameraOpen(false);
          void onPhoto(file);
        }}
        onUploadInstead={() => {
          setCameraOpen(false);
          fileInput.current?.click();
        }}
      />
    </section>
  );
}

// ---------------------------------------------------------------- paso 1: elegir personaje

const STEP_COPY = {
  es: {
    eyebrow: "KUN University AI, Florida",
    title: "¿Con quién quieres recorrer el campus?",
    body: "Elige un personaje. En el siguiente paso le pones tu nombre, tu cara y tu estilo.",
    continue: "Continuar",
  },
  en: {
    eyebrow: "KUN University AI, Florida",
    title: "Who will explore the campus?",
    body: "Pick a character. Next you'll add your name, your face and your style.",
    continue: "Continue",
  },
};

export function CampusGenderStep({
  visible,
  selected,
  order,
  onSelect,
  onContinue,
}: {
  visible: boolean;
  selected: Gender;
  order: Gender[];
  onSelect: (g: Gender) => void;
  onContinue: () => void;
}) {
  const t = usePick(STEP_COPY);
  const L = usePick(OPTION_LABELS);
  return (
    <section
      aria-labelledby="campus-gender-title"
      className={`absolute inset-0 z-20 flex flex-col items-center justify-between px-4 pt-[calc(28px+env(safe-area-inset-top,0px))] pb-[calc(28px+env(safe-area-inset-bottom,0px))] text-center text-[#FFF3E6] transition-opacity duration-700 max-md:pb-[calc(20px+env(safe-area-inset-bottom,0px))] ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{ background: "linear-gradient(180deg, rgba(29,12,60,0.7) 0%, rgba(29,12,60,0) 32%, rgba(29,12,60,0) 70%, rgba(29,12,60,0.75) 100%)" }}
    >
      <CampusLang className="absolute top-[calc(12px+env(safe-area-inset-top,0px))] right-3" />
      <div className="max-w-180 max-md:pt-9">
        <div className="mb-2 text-xs font-bold tracking-[0.25em] text-[#FFC85C] uppercase">{t.eyebrow}</div>
        <h1 id="campus-gender-title" className="m-0 font-(family-name:--font-gabarito) text-[clamp(28px,4.2vw,52px)] leading-[1.02] font-black">
          {t.title}
        </h1>
        <p className="m-0 mt-3 text-[15px] text-[#F2E2F0] max-md:text-[13px]">{t.body}</p>
      </div>

      <div className="flex w-full max-w-200 flex-col items-center gap-4">
        <div role="radiogroup" aria-label={t.title} className="grid w-full grid-cols-3 gap-3 max-md:gap-2">
          {order.map((g) => {
            const on = selected === g;
            return (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onSelect(g)}
                className={`cursor-pointer rounded-2xl border-2 px-3 py-3.5 font-(family-name:--font-gabarito) text-xl font-extrabold backdrop-blur-md transition hover:-translate-y-0.5 max-md:py-2.5 max-md:text-base ${
                  on ? "border-[#FFC85C] bg-[#FFC85C] text-[#24123F]" : "border-white/30 bg-[#1D0C3C]/55 text-[#FFF3E6] hover:border-white/70"
                }`}
              >
                {L.gender[g]}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="h-14 w-full max-w-90 cursor-pointer rounded-[18px] font-(family-name:--font-gabarito) text-xl font-extrabold text-[#24123F] shadow-[0_14px_30px_-12px_rgba(255,140,80,0.9)] transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(180deg, #FFD47A, #FF9A5C)" }}
        >
          {t.continue} →
        </button>
      </div>
    </section>
  );
}