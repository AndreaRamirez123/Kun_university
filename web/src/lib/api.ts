import type { Certification, School, Stats } from "./types";

const API_URL = process.env.API_URL ?? "http://localhost:4100/api";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    // Contenido institucional: se revalida cada pocos minutos, no en cada request.
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`KUN API ${path} respondió ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function getSchools(): Promise<School[]> {
  return apiFetch<School[]>("/schools");
}

export function getCertifications(): Promise<Certification[]> {
  return apiFetch<Certification[]>("/certifications");
}

export function getStats(): Promise<Stats> {
  return apiFetch<Stats>("/stats");
}
