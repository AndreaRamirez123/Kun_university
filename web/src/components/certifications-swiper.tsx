"use client";

import { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCards, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";
import { useLocale, usePick } from "@/i18n/locale-context";
import type { Certification } from "@/lib/types";

const COPY = {
  es: {
    badge: (hours: number) => `${hours}h · 100% online`,
    learnMore: "Ver más",
    prev: "Certificación anterior",
    next: "Siguiente certificación",
    goTo: (name: string) => `Ir a ${name}`,
  },
  en: {
    badge: (hours: number) => `${hours}h · 100% online`,
    learnMore: "Learn more",
    prev: "Previous certification",
    next: "Next certification",
    goTo: (name: string) => `Go to ${name}`,
  },
};

export function CertificationsSwiper({
  certifications,
  accents,
  fontDisplay,
  ink,
}: {
  certifications: Certification[];
  accents: string[];
  fontDisplay: string;
  ink: string;
}) {
  const swiperRef = useRef<SwiperType | null>(null);
  const total = certifications.length;
  const [active, setActive] = useState(0);
  const t = usePick(COPY);
  const { locale } = useLocale();

  return (
    <div className="mx-auto flex w-full max-w-85 flex-col items-center max-md:max-w-52">
      <Swiper
        modules={[EffectCards, Mousewheel, Autoplay]}
        effect="cards"
        cardsEffect={{ rotate: true, perSlideOffset: 6, perSlideRotate: 2 }}
        breakpoints={{
          768: {
            cardsEffect: { rotate: true, perSlideOffset: 10, perSlideRotate: 3 },
          },
        }}
        grabCursor
        initialSlide={0}
        speed={500}
        loop
        mousewheel={{ invert: false }}
        autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        onSwiper={(swiper: SwiperType) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper: SwiperType) => setActive(swiper.realIndex % total)}
        className="certifications-swiper w-full"
      >
        {[...certifications, ...certifications].map((cert, i) => {
          const accent = accents[i % accents.length];
          return (
            <SwiperSlide key={`${cert.slug}-${i}`}>
              <div
                className="flex h-[420px] max-md:h-[300px] flex-col overflow-hidden rounded-2xl border-4"
                style={{ borderColor: ink, background: accent }}
              >
                <div className="flex items-center justify-between px-5 pt-5 max-md:px-4 max-md:pt-4">
                  <span
                    className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold tracking-[0.05em] uppercase max-md:px-2.5 max-md:py-0.5 max-md:text-[9px]"
                    style={{ color: accent }}
                  >
                    {t.badge(cert.hours)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-end p-6 max-md:p-4">
                  <div
                    className="mb-3 text-2xl leading-tight font-bold text-white max-md:mb-1.5 max-md:text-lg"
                    style={{ fontFamily: fontDisplay }}
                  >
                    {cert.name}
                  </div>
                  <p className="mb-5 text-sm leading-[1.6] text-white/90 max-md:mb-3 max-md:text-xs">
                    {cert.description[locale]}
                  </p>
                  <a
                    href="#informacion"
                    className="block rounded-full bg-white py-3 text-center text-sm font-bold uppercase transition hover:-translate-y-0.5 max-md:py-2 max-md:text-xs"
                    style={{ color: accent }}
                  >
                    {t.learnMore}
                  </a>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="mt-6 flex items-center gap-5">
        <button
          type="button"
          aria-label={t.prev}
          onClick={() => swiperRef.current?.slidePrev()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition hover:-translate-y-0.5"
          style={{ borderColor: ink, color: ink }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex gap-2">
          {certifications.map((c, i) => (
            <button
              key={c.slug}
              type="button"
              aria-label={t.goTo(c.name)}
              onClick={() => swiperRef.current?.slideToLoop(i)}
              className="h-2.5 w-2.5 rounded-full transition"
              style={{ background: i === active ? ink : `${ink}33` }}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label={t.next}
          onClick={() => swiperRef.current?.slideNext()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition hover:-translate-y-0.5"
          style={{ borderColor: ink, color: ink }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
