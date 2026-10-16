// Cliente del agente de Krucn (POST /api/krucn/chat en la API Nest).
// El sitio es export estático, así que el navegador llama a la API directamente.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100/api";

export type KrucnTurn = { role: "user" | "assistant"; content: string };

let statusPromise: Promise<boolean> | null = null;

/** ¿Está el agente encendido? Se consulta una vez por visita. */
export function krucnAgentAvailable() {
  statusPromise ??= fetch(`${API_URL}/krucn/status`)
    .then((r) => (r.ok ? r.json() : { enabled: false }))
    .then((d: { enabled?: boolean }) => Boolean(d.enabled))
    .catch(() => false);
  return statusPromise;
}

/** Envía la conversación y va entregando el texto de la respuesta con onText. */
export async function askKrucn(
  body: { messages: KrucnTurn[]; locale: "es" | "en"; playerName?: string; nearestPlace?: string },
  onText: (chunk: string) => void,
  signal: AbortSignal,
) {
  const res = await fetch(`${API_URL}/krucn/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`krucn ${res.status}`);

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let stop: string | undefined;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      const line = event.trim();
      if (!line.startsWith("data:")) continue;
      const data = JSON.parse(line.slice(5)) as { text?: string; error?: boolean; stop?: string };
      if (data.error) throw new Error("krucn stream error");
      if (data.text) onText(data.text);
      if (data.stop) stop = data.s