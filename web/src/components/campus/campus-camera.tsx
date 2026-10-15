"use client";

import { useEffect, useRef, useState } from "react";
import { usePick } from "@/i18n/locale-context";

// Cámara del navegador para tomarse una selfie y adaptar el personaje.
// La imagen nunca sale del dispositivo: se captura en un canvas y se entrega
// como archivo local a analyzePhoto.

const COPY = {
  es: {
    title: "Tómate una foto",
    hint: "Centra tu cara dentro del óvalo, con buena luz.",
    capture: "Tomar foto",
    cancel: "Cancelar",
    starting: "Encendiendo la cámara…",
    denied: "No tenemos permiso para usar la cámara. Puedes habilitarla en el candado de la barra de direcciones o subir una foto.",
    unavailable: "Este navegador o dispositivo no tiene cámara disponible. Puedes subir una foto.",
    upload: "Subir una foto",
    privacy: "La foto se procesa solo en tu dispositivo: no se envía ni se guarda.",
  },
  en: {
    title: "Take a photo",
    hint: "Center your face inside the oval, in good light.",
    capture: "Take photo",
    cancel: "Cancel",
    starting: "Starting the camera…",
    denied: "We don't have permission to use the camera. You can allow it from the lock icon in the address bar, or upload a photo.",
    unavailable: "This browser or device has no camera available. You can upload a photo.",
    upload: "Upload a photo",
    privacy: "The photo is processed only on your device: it isn't sent or stored.",
  },
};

type Status = "starting" | "live" | "denied" | "unavailable";

export function CampusCamera({
  open,
  onClose,
  onCapture,
  onUploadInstead,
}: {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  onUploadInstead: () => void;
}) {
  const t = usePick(COPY);
  const video = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<Status>("starting");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!open) return;
    const v = video.current;
    let stream: MediaStream | null = null;
    let cancelled = false;
    const start = window.setTimeout(async () => {
      setStatus("starting");
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        if (v) {
          v.srcObject = stream;
          await v.play().catch(() => undefined);
        }
        setStatus("live");
      } catch (e) {
        const name = (e as DOMException)?.name;
        setStatus(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      // Apaga la cámara siempre al cerrar.
      stream?.getTracks().forEach((tr) => tr.stop());
      if (v) v.srcObject = null;
    };
  }, [open]);

  function capture() {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Igual que se ve en pantalla (espejo).
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 180);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(new File([blob], "selfie.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  }

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-[#140628]/75 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="campus-camera-title"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className="reveal-animate w-[min(520px,100%)] overflow-hidden rounded-[26px] bg-[#FFF8F0] text-[#24123F] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]"
      >
        <div className="px-5 pt-5 pb-3">
          <h2 id="campus-camera-title" className="m-0 font-(family-name:--font-gabarito) text-2xl font-black">
            {t.title}
          </h2>
          <p className="m-0 mt-1 text-[13px] text-[#5C4A72]">{t.hint}</p>
        </div>

        <div className="relative aspect-[4/3] w-full bg-[#1D1236]">
          <video ref={video} playsInline muted className="h-full w-full scale-x-[-1] object-cover" />
          {status === "live" && (
            // Óvalo guía: coincide con la zona donde analyzePhoto busca la cara.
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div
                className="absolute top-[47%] left-1/2 h-[58%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-4 border-dashed border-[#FFC85C]"
                style={{ boxShadow: "0 0 0 9999px rgba(20,6,40,0.45)" }}
              />
            </div>
          )}
          {status !== "live" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-[14px] text-[#FFF3E6]">
              <span aria-hidden className="text-4xl">
                📷
              </span>
              <p className="m-0 max-w-80">{status === "starting" ? t.starting : status === "denied" ? t.denied : t.unavailable}</p>
            </div>
          )}
          {flash && <div aria-hidden className="absolute inset-0 bg-white" />}
        </div>

        <div className="flex flex-col gap-2 px-5 pt-4 pb-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-12 cursor-pointer rounded-2xl border-2 border-[#24123F]/15 px-4 text-sm font-bold transition hover:border-[#24123F]"
            >
              {t.cancel}
            </button>
            {status === "live" ? (
              <button
                type="button"
                onClick={capture}
                className="h-12 flex-1 cursor-pointer rounded-2xl text-[15px] font-bold text-[#24123F] transition hover:-translate-y-0.5"
                style={{ background: "linear-gradient(180deg, #FFD47A, #FF9A5C)" }}
              >
                📸 {t.capture}
              </button>
            ) : (
              <button
                type="button"
                onClick={onUploadInstead}
                className="h-12 flex-1 cursor-pointer rounded-2xl bg-[#24123F] text-[15px] font-bold text-[#FFF3E6]"
              >
                {t.upload}
              </button>
            )}
          </div>
          <p className="m-0 text-center text-[11.5px] text-[#5C4A72]">{t.privacy}</p>
        </div>
      </div>
    </div>
  );
}
