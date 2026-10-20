// Paisaje sonoro sintetizado con WebAudio: no descarga archivos y solo arranca
// cuando la persona lo activa (los navegadores bloquean el audio automático).

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
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
  startOcean(ctx, master);
  startMusic(ctx, master);
  murmur = startMurmur(ctx, master);
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

export function setCampusSound(on: boolean) {
  enabled = on;
  const audio = ensureContext();
  if (!audio || !master) return;
  if (on) void audio.resume();
  master.gain.cancelScheduledValues(audio.currentTime);
  master.gain.linearRampToValueAtTime(on ? 0.55 : 0, audio.currentTime + 0.6);
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
