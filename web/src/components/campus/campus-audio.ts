// Paisaje sonoro sintetizado con WebAudio: no descarga archivos y solo arranca
// cuando la persona lo activa (los navegadores bloquean el audio automático).

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
/** Mar, música y murmullo: se apagan dentro de las salas (los efectos siguen). */
let ambience: GainNode | null = null;
let ambienceOn = true;
let enabled = false;

function ensureContext() {
  if (ctx) return ctx;
  const AudioCtor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  ctx = new AudioCtor();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  ambience = ctx.createGain();
  ambience.gain.value = ambienceOn ? 1 : 0;
  ambience.connect(master);
  startOcean(ctx, ambience);
  startMusic(ctx, ambience);
  murmur = startMurmur(ctx, ambience);
  return ctx;
}

let murmur: GainNode | null = null;

// Música suave de playa: acordes tipo bossa/tropical con pad cálido y un
// arpegio de guitarra (pluck) muy bajito. Todo sintetizado y en bucle.
function startMusic(audio: AudioContext, out: AudioNode) {
  const bus = audio.createGain();
  bus.gain.value = 0.16;
  const warm = audio.createBiquadFilter();
  warm.type = "lowpass";
  warm.frequency.value = 1800;
  bus.connect(warm).connect(out);

  // Cmaj7 · Am7 · Dm7 · G7 (frecuencias en Hz)
  const CHORDS = [
    [130.81, 164.81, 196.0, 246.94],
    [110.0, 130.81, 164.81, 196.0],
    [146.83, 174.61, 220.0, 261.63],
    [98.0, 123.47, 146.83, 174.61],
  ];
  const BAR = 3.2;
  let next = audio.currentTime + 0.3;
  let bar = 0;

  function pad(freq: number, at: number) {
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    o.detune.value = (Math.random() - 0.5) * 8;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.09, at + 0.9);
    g.gain.linearRampToValueAtTime(0, at + BAR + 0.6);
    o.connect(g).connect(bus);
    o.start(at);
    o.stop(at + BAR + 0.7);
  }
  function pluck(freq: number, at: number) {
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.11, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
    o.connect(g).connect(bus);
    o.start(at);
    o.stop(at + 1);
  }
  function schedule() {
    while (next < audio.currentTime + 1.5) {
      const chord = CHORDS[bar % CHORDS.length];
      chord.forEach((f) => pad(f, next));
      // Arpegio sincopado una octava arriba.
      [0, 0.6, 1.2, 1.8, 2.4].forEach((off, i) => {
        if (i === 3 && bar % 2) return;
        pluck(chord[(i + bar) % chord.length] * 2, next + off);
      });
      next += BAR;
      bar++;
    }
  }
  schedule();
  window.setInterval(schedule, 500);
}

// Murmullo de gente: ruido filtrado en la banda de la voz con un vaivén lento.
// Sube cuando hay otras personas cerca (setMurmur).
function startMurmur(audio: AudioContext, out: AudioNode) {
  const length = audio.sampleRate * 3;
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const noise = audio.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const band = audio.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 520;
  band.Q.value = 1.4;
  // Sílabas: el volumen sube y baja de forma irregular.
  const syll = audio.createGain();
  syll.gain.value = 0.5;
  [2.3, 3.7, 5.1].forEach((rate, i) => {
    const lfo = audio.createOscillator();
    lfo.frequency.value = rate;
    const depth = audio.createGain();
    depth.gain.value = 0.18 - i * 0.04;
    lfo.connect(depth).connect(syll.gain);
    lfo.start();
  });
  const level = audio.createGain();
  level.gain.value = 0;
  noise.connect(band).connect(syll).connect(level).connect(out);
  noise.start();
  return level;
}

/** Murmullo de ambiente según cuánta gente hay cerca (0 = nadie). */
export function setMurmur(people: number) {
  if (!ctx || !murmur) return;
  const target = Math.min(0.09, people * 0.025);
  murmur.gain.cancelScheduledValues(ctx.currentTime);
  murmur.gain.linearRampToValueAtTime(target, ctx.currentTime + 1.2);
}

// Olas: ruido marrón filtrado con un LFO lento que sube y baja el volumen.
function startOcean(audio: AudioContext, out: AudioNode) {
  const length = audio.sampleRate * 4;
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  const noise = audio.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 520;

  const swell = audio.createGain();
  swell.gain.value = 0.28;
  const lfo = audio.createOscillator();
  lfo.frequency.value = 0.12;
  const lfoDepth = audio.createGain();
  lfoDepth.gain.value = 0.2;
  lfo.connect(lfoDepth).connect(swell.gain);

  noise.connect(filter).connect(swell).connect(out);
  noise.start();
  lfo.start();
}

/** Sonido de ambiente de la isla (mar, música, murmullo): off dentro de las escuelas. */
export function setAmbience(on: boolean) {
  ambienceOn = on;
  if (!ctx || !ambience) return;
  ambience.gain.cancelScheduledValues(ctx.currentTime);
  ambience.gain.setValueAtTime(ambience.gain.value, ctx.currentTime);
  ambience.gain.linearRampToValueAtTime(on ? 1 : 0, ctx.currentTime + 0.8);
}

/** Si la persona activó el sonido del campus. */
export const campusSoundOn = () => enabled;

export function setCampusSound(on: boolean) {
  enabled = on;
  const audio = on ? ensureContext() : ctx;
  if (!audio || !master) return;
  watchTab();
  if (on && !document.hidden) void audio.resume();
  master.gain.cancelScheduledValues(audio.currentTime);
  master.gain.setValueAtTime(master.gain.value, audio.currentTime);
  master.gain.linearRampToValueAtTime(on && !document.hidden ? 0.55 : 0, audio.currentTime + 0.6);
  // Apagado: el motor de audio se detiene del todo (nada suena fuera del campus).
  if (!on) window.setTimeout(() => !enabled && void audio.suspend(), 700);
}

// El sonido es solo del campus: si la pestaña queda en segundo plano (otra
// pestaña, otro modelo de página o la ventana minimizada) se silencia todo, y
// vuelve al regresar si estaba activado.
let watching = false;
function watchTab() {
  if (watching || typeof document === "undefined") return;
  watching = true;
  document.addEventListener("visibilitychange", () => {
    if (!ctx || !master) return;
    if (document.hidden) {
      window.speechSynthesis?.cancel();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(0, ctx.currentTime);
      void ctx.suspend();
    } else if (enabled) {
      void ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 0.6);
    }
  });
}

function tone(freq: number, start: number, duration: number, type: OscillatorType, peak: number) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** Campanita de dos notas al llegar a un lugar del campus. */
export function playChime() {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime;
  tone(784, t, 0.5, "sine", 0.18);
  tone(1175, t + 0.09, 0.7, "sine", 0.14);
}

/** Acorde ascendente cuando se completa el recorrido. */
export function playFanfare() {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.12, 0.9, "triangle", 0.12));
}

/** Rugido grave que sube de tono durante el despegue del cohete. */
export function playLaunch() {
  if (!enabled || !ctx || !master) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(55, t);
  osc.frequency.exponentialRampToValueAtTime(220, t + 5);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 400;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.16, t + 0.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 6);
  osc.connect(filter).connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + 6.1);
}

/** Golpe corto al empujar una pelota o una letra. */
export function playBump(strength: number) {
  if (!enabled || !ctx) return;
  tone(140 + strength * 60, ctx.currentTime, 0.18, "sine", Math.min(0.2, 0.05 + strength * 0.05));
}

/** "Boing" de trampolín al rebotar en una sombrilla: un tono que sube rápido. */
export function playBoing() {
  if (!enabled || !ctx || !master) return;
  const start = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, start);
  osc.frequency.exponentialRampToValueAtTime(620, start + 0.22);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.16, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + 0.4);
}

/** "Tlin" al recoger una moneda. */
export function playCoin() {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime;
  tone(1318, t, 0.12, "square", 0.05);
  tone(1976, t + 0.07, 0.25, "square", 0.05);
}

// ---------------------------------------------------------------- pasos

export type Ground = "grass" | "sand" | "path" | "wood";

let noiseBuffer: AudioBuffer | null = null;
function noise(audio: AudioContext) {
  if (noiseBuffer) return noiseBuffer;
  const len = Math.floor(audio.sampleRate * 0.25);
  noiseBuffer = audio.createBuffer(1, len, audio.sampleRate);
  const d = noiseBuffer.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuffer;
}

/** Cómo suena cada suelo: filtro del ruido, duración y un "toc" grave opcional. */
const GROUND: Record<Ground, { type: BiquadFilterType; freq: number; q: number; dur: number; gain: number; thump: number }> = {
  // Pasto: crujido suave y corto, como el de Minecraft.
  grass: { type: "bandpass", freq: 2300, q: 0.9, dur: 0.09, gain: 0.07, thump: 0 },
  // Arena: más largo y apagado.
  sand: { type: "lowpass", freq: 1100, q: 0.6, dur: 0.14, gain: 0.07, thump: 0 },
  // Camino de ladrillo: un toque seco con algo de cuerpo.
  path: { type: "bandpass", freq: 900, q: 1.6, dur: 0.06, gain: 0.06, thump: 0.05 },
  // Madera (terraza de la cafetería): "toc" hueco.
  wood: { type: "bandpass", freq: 600, q: 3, dur: 0.07, gain: 0.04, thump: 0.08 },
};

/** Un paso del jugador; `run` suena un poco más fuerte. Muy bajito a propósito. */
export function playStep(ground: Ground, run = false) {
  if (!enabled || !ctx || !master) return;
  const g = GROUND[ground];
  const t = ctx.currentTime;
  const vary = 0.85 + Math.random() * 0.3;
  const loud = (run ? 1.35 : 1) * (0.8 + Math.random() * 0.4);

  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  src.playbackRate.value = vary;
  const filter = ctx.createBiquadFilter();
  filter.type = g.type;
  filter.frequency.value = g.freq * vary;
  filter.Q.value = g.q;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(g.gain * loud, t + 0.006);
  env.gain.exponentialRampToValueAtTime(0.0001, t + g.dur);
  src.connect(filter).connect(env).connect(master);
  src.start(t, Math.random() * 0.1, g.dur + 0.02);

  if (g.thump > 0) tone(ground === "wood" ? 190 * vary : 120 * vary, t, 0.08, "sine", g.thump * loud);
}

/**
 * Ruidito de Krucn: un "grrr-uap" de cocodrilo caricaturesco. Va en tonos medios
 * (200–900 Hz) para que se oiga también en parlantes de portátil y celular.
 */
export function playCroc() {
  if (!enabled || !ctx || !master) return;
  const t = ctx.currentTime;
  const out = ctx.createGain();
  out.gain.value = 1;
  out.connect(master);
  // "Grrr": cuadrada con vibrato rápido (ronroneo de cocodrilo) en tono medio.
  const growl = ctx.createOscillator();
  growl.type = "square";
  growl.frequency.setValueAtTime(210, t);
  growl.frequency.linearRampToValueAtTime(170, t + 0.3);
  const wobble = ctx.createOscillator();
  wobble.frequency.value = 32;
  const depth = ctx.createGain();
  depth.gain.value = 45;
  wobble.connect(depth).connect(growl.frequency);
  const body = ctx.createBiquadFilter();
  body.type = "bandpass";
  body.frequency.value = 650;
  body.Q.value = 1.2;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.32, t + 0.03);
  env.gain.setValueAtTime(0.3, t + 0.24);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
  growl.connect(body).connect(env).connect(out);
  growl.start(t);
  wobble.start(t);
  growl.stop(t + 0.36);
  wobble.stop(t + 0.36);
  // "¡Uap!": boca que se abre (filtro que sube) con un tono que sube y baja.
  const yap = ctx.createOscillator();
  yap.type = "sawtooth";
  yap.frequency.setValueAtTime(300, t + 0.36);
  yap.frequency.exponentialRampToValueAtTime(620, t + 0.46);
  yap.frequency.exponentialRampToValueAtTime(420, t + 0.6);
  const mouth = ctx.createBiquadFilter();
  mouth.type = "lowpass";
  mouth.Q.value = 8;
  mouth.frequency.setValueAtTime(500, t + 0.36);
  mouth.frequency.exponentialRampToValueAtTime(2200, t + 0.46);
  mouth.frequency.exponentialRampToValueAtTime(700, t + 0.62);
  const yEnv = ctx.createGain();
  yEnv.gain.setValueAtTime(0, t + 0.36);
  yEnv.gain.linearRampToValueAtTime(0.22, t + 0.39);
  yEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.64);
  yap.connect(mouth).connect(yEnv).connect(out);
  yap.start(t + 0.36);
  yap.stop(t + 0.66);
}
