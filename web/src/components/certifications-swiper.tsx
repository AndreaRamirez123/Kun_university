"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCards, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";
import type { Certification } from "@/lib/types";

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
  return (
    <div className="mx-auto w-full max-w-85 max-md:max-w-65">
      <Swiper
        modules={[EffectCards, Mousewheel, Autoplay]}
        effect="cards"
        cardsEffect={{ rotate: true, perSlideOffset: 10, perSlideRotate: 3 }}
        grabCursor
        initialSlide={0}
        speed={500}
        loop
        mousewheel={{ invert: false }}
        autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        className="certifications-swiper"
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
                    {cert.hours}h · 100% online
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
                    {cert.description}
                  </p>
                  <a
                    href="#informacion"
                    className="block rounded-full bg-white py-3 text-center text-sm font-bold uppercase transition hover:-translate-y-0.5 max-md:py-2 max-md:text-xs"
                    style={{ color: accent }}
                  >
                    Ver más
                  </a>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
