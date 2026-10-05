"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Mousewheel } from "swiper/modules";
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
    <div className="mx-auto w-full max-w-85">
      <Swiper
        modules={[EffectCards, Mousewheel]}
        effect="cards"
        cardsEffect={{ rotate: true, perSlideOffset: 10, perSlideRotate: 3 }}
        grabCursor
        initialSlide={0}
        speed={500}
        mousewheel={{ invert: false }}
        className="certifications-swiper"
      >
        {certifications.map((cert, i) => {
          const accent = accents[i % accents.length];
          return (
            <SwiperSlide key={cert.slug}>
              <div
                className="flex h-[420px] flex-col overflow-hidden rounded-2xl border-4"
                style={{ borderColor: ink, background: accent }}
              >
                <div className="flex items-center justify-between px-5 pt-5">
                  <span
                    className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold tracking-[0.05em] uppercase"
                    style={{ color: accent }}
                  >
                    {cert.hours}h · 100% online
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-end p-6">
                  <div
                    className="mb-3 text-2xl leading-tight font-bold text-white"
                    style={{ fontFamily: fontDisplay }}
                  >
                    {cert.name}
                  </div>
                  <p className="mb-5 text-sm leading-[1.6] text-white/90">{cert.description}</p>
                  <a
                    href="#informacion"
                    className="block rounded-full bg-white py-3 text-center text-sm font-bold uppercase transition hover:-translate-y-0.5"
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
