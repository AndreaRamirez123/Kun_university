// Presencia multijugador del campus con Firebase Realtime Database, usando su API
// REST + Server-Sent Events (sin instalar el SDK de Firebase). Cada visitante
// publica su posición, su avatar y sus emotes en /campus/players/{id}; todos
// escuchan esa lista en tiempo real. Reglas de validación: database.rules.json.
//
// Se activa con NEXT_PUBLIC_CAMPUS_DB_URL (p. ej. https://kun-campus-default-rtdb.firebaseio.com).
// Sin esa variable el campus funciona igual, solo que sin ver a otras personas.

export const PRESENCE_URL = (process.env.NEXT_PUBLIC_CAMPUS_DB_URL ?? "").replace(/\/+$/, "");
export const presenceEnabled = PRESENCE_URL.length > 0;

const PATH = "campus/players";
/** Sin noticias de alguien en este tiempo, se deja de mostrar (cerró o perdió conexión). */
const STALE_MS = 20_000;
/** Entradas abandonadas más viejas que esto se borran de la base. */
const PURGE_MS = 120_000;
const HEARTBEAT_MS = 6_000;
/** Máximo de envíos de posición por segundo mientras se camina. */
const SEND_EVERY_MS = 250;

export type RemotePlayer = {
  id: string;
  /** Nombre visible (máx. 16). */
  n: string;
  /** Avatar serializado (JSON). */
  a: string;
  x: number;
  z: number;
  /** Rumbo del personaje (radianes). */
  h: number;
  /** Altura sobre el suelo (saltos, sombrillas) y taburete donde está sentado (-1: de pie). */
  y?: number;
  s?: number;
  /** Última actualización (hora del servidor, ms). */
  t: number;
  /** Último emote (índice de EMOTES) y su hora del servidor. */
  e?: number;
  et?: number;
};

type Listener = () => void;

const state = {
  myId: "",
  players: new Map<string, RemotePlayer>(),
  /** Hora del servidor menos la local, para comparar marcas de tiempo. */
  offset: 0,
  listeners: new Set<Listener>(),
  source: null as EventSource | null,
  lastSent: 0,
  lastPos: { x: NaN, z: NaN, h: NaN, y: 0, s: -1 },
  heartbeat: 0,
  joined: false,
};

export const serverNow = () => Date.now() + state.offset;
export const myPresenceId = () => state.myId;

function url(path: string, query = "") {
  return `${PRESENCE_URL}/${path}.json${query}`;
}

let lastKey = "";
/** Avisa solo si cambió quién está, su perfil o su emote (no por cada paso). */
function notify(force = false) {
  const key = visiblePlayers()
    .map((p) => `${p.id}|${p.n}|${p.a.length}|${p.e ?? ""}|${p.et ?? ""}`)
    .join(",");
  if (!force && key === lastKey) return;
  lastKey = key;
  state.listeners.forEach((l) => l());
}

/** Revisa cada tanto si alguien quedó inactivo (eso no genera eventos en la base). */
export function refreshPresence() {
  notify();
}

/** Se llama cuando cambia quién está conectado (no en cada movimiento). */
export function subscribePresence(listener: Listener) {
  state.listeners.add(listener);
  return () => {
    state.listeners.delete(listener);
  };
}

/** Jugadores remotos visibles ahora (sin uno mismo ni los inactivos). */
export function visiblePlayers(): RemotePlayer[] {
  const now = serverNow();
  return [...state.players.values()].filter((p) => p.id !== state.myId && now - p.t < STALE_MS);
}

export function getPlayer(id: string) {
  return state.players.get(id);
}

function isPlayer(v: unknown): v is Omit<RemotePlayer, "id"> {
  const p = v as RemotePlayer;
  return !!p && typeof p === "object" && typeof p.x === "number" && typeof p.z === "number" && typeof p.t === "number";
}

/** Aplica un evento put/patch de la base (path relativo a /campus/players). */
function apply(kind: "put" | "patch", path: string, data: unknown) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) {
    if (kind === "put") state.players.clear();
    for (const [id, v] of Object.entries((data as Record<string, unknown>) ?? {})) {
      if (v === null) state.players.delete(id);
      else if (isPlayer(v)) state.players.set(id, { ...(state.players.get(id) ?? {}), ...v, id } as RemotePlayer);
    }
  } else {
    const [id, field] = parts;
    if (!field) {
      if (data === null) state.players.delete(id);
      else if (kind === "put" && isPlayer(data)) state.players.set(id, { ...data, id });
      else if (kind === "patch" && data && typeof data === "object") {
        const prev = state.players.get(id);
        if (prev) state.players.set(id, { ...prev, ...(data as Partial<RemotePlayer>) });
      }
    } else {
      const prev = state.players.get(id);
      if (prev) state.players.set(id, { ...prev, [field]: data } as RemotePlayer);
    }
  }
  notify();
}

function listen() {
  if (state.source) return;
  const source = new EventSource(url(PATH));
  state.source = source;
  const handle = (kind: "put" | "patch") => (ev: MessageEvent<string>) => {
    try {
      const { path, data } = JSON.parse(ev.data) as { path: string; data: unknown };
      apply(kind, path, data);
    } catch {
      /* evento malformado: se ignora */
    }
  };
  source.addEventListener("put", handle("put") as EventListener);
  source.addEventListener("patch", handle("patch") as EventListener);
}

async function write(method: "PUT" | "PATCH" | "DELETE", body?: object, keepalive = false) {
  const res = await fetch(url(`${PATH}/${state.myId}`, method === "DELETE" ? "" : "?print=silent"), {
    method,
    body: body ? JSON.stringify(body) : undefined,
    keepalive,
  });
  return res;
}

/** Entra al campus compartido con el nombre y el avatar del jugador. */
export async function joinPresence(name: string, avatarJson: string, pos: { x: number; z: number; h: number }) {
  if (!presenceEnabled || state.joined) return;
  state.joined = true;
  try {
    state.myId = sessionStorage.getItem("kun-presence-id") ?? "";
  } catch {
    /* sin almacenamiento: id nuevo */
  }
  if (!/^[a-z0-9]{12,24}$/.test(state.myId)) {
    state.myId = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => (b % 36).toString(36)).join("") + Date.now().toString(36).slice(-4);
    try {
      sessionStorage.setItem("kun-presence-id", state.myId);
    } catch {
      /* ignorado */
    }
  }
  const t0 = Date.now();
  try {
    // Sin print=silent para leer la hora del servidor y calcular el desfase de relojes.
    const res = await fetch(url(`${PATH}/${state.myId}`), {
      method: "PUT",
      body: JSON.stringify({ n: name.slice(0, 16), a: avatarJson.slice(0, 800), x: pos.x, z: pos.z, h: pos.h, t: { ".sv": "timestamp" } }),
    });
    const echo = (await res.json()) as { t?: number };
    if (typeof echo.t === "number") state.offset = echo.t - (t0 + Date.now()) / 2;
  } catch {
    /* sin conexión: se reintenta con el latido */
  }
  state.lastPos = { ...pos, y: 0, s: -1 };
  listen();
  state.heartbeat = window.setInterval(() => {
    void write("PATCH", { t: { ".sv": "timestamp" } }).catch(() => {});
    purgeStale();
  }, HEARTBEAT_MS);
  window.addEventListener("pagehide", leavePresence);
}

/** Publica la posición si cambió (como mucho 4 veces por segundo). */
export function sendPosition(x: number, z: number, h: number, y = 0, seat = -1) {
  if (!state.joined || !state.myId) return;
  const now = Date.now();
  if (now - state.lastSent < SEND_EVERY_MS) return;
  const last = state.lastPos;
  const moved =
    Math.hypot(x - last.x, z - last.z) > 0.05 || Math.abs(h - last.h) > 0.05 || Math.abs(y - last.y) > 0.1 || seat !== last.s;
  if (!moved) return;
  state.lastSent = now;
  state.lastPos = { x, z, h, y, s: seat };
  const r = (v: number) => Math.round(v * 100) / 100;
  void write("PATCH", { x: r(x), z: r(z), h: r(h), y: r(Math.max(0, y)), s: seat, t: { ".sv": "timestamp" } }).catch(() => {});
}

/** Muestra un emote (emoji o frase) sobre la cabeza del jugador para todos. */
export function sendEmote(index: number) {
  if (!state.joined || !state.myId) return;
  void write("PATCH", { e: index, et: { ".sv": "timestamp" }, t: { ".sv": "timestamp" } }).catch(() => {});
}

export function updateProfile(name: string, avatarJson: string) {
  if (!state.joined || !state.myId) return;
  void write("PATCH", { n: name.slice(0, 16), a: avatarJson.slice(0, 800) }).catch(() => {});
}

/** Borra de la base a quienes se fueron sin despedirse (cierre forzado, sin red…). */
function purgeStale() {
  const now = serverNow();
  for (const p of state.players.values()) {
    if (p.id !== state.myId && now - p.t > PURGE_MS) {
      void fetch(url(`${PATH}/${p.id}`), { method: "DELETE" }).catch(() => {});
    }
  }
}

export function leavePresence() {
  if (!state.joined) return;
  state.joined = false;
  window.clearInterval(state.heartbeat);
  window.removeEventListener("pagehide", leavePresence);
  state.source?.close();
  state.source = null;
  if (state.myId) void write("DELETE", undefined, true).catch(() => {});
  state.players.clear();
  notify(true);
}
