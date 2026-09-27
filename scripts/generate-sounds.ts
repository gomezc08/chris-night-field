/**
 * Synthesizes the scene's sound effects into public/sounds/*.wav.
 * Everything is generated here, so there's nothing to license.
 *
 *   npx tsx scripts/generate-sounds.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";

const RATE = 22050;
const OUT = "public/sounds";

// Deterministic noise so regenerating produces identical files.
let seed = 1;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 0xffffffff) * 2 - 1;
};

function wav(samples: Float32Array) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) =>
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2),
  );
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

function render(seconds: number, fn: (t: number, i: number) => number) {
  const out = new Float32Array(Math.round(seconds * RATE));
  for (let i = 0; i < out.length; i++) out[i] = fn(i / RATE, i);
  return out;
}

/** One-pole low-pass, for softening noise. */
function lowpass(input: Float32Array, cutoff: number) {
  const a = 1 - Math.exp((-2 * Math.PI * cutoff) / RATE);
  let y = 0;
  return input.map((x) => (y += a * (x - y)));
}

function normalize(input: Float32Array, peak: number) {
  const max = input.reduce((m, x) => Math.max(m, Math.abs(x)), 0) || 1;
  return input.map((x) => (x / max) * peak);
}

/** Crossfade the tail into the head so the file loops without a click. */
function loopable(input: Float32Array, fadeSeconds: number) {
  const fade = Math.round(fadeSeconds * RATE);
  const body = input.slice(0, input.length - fade);
  for (let i = 0; i < fade; i++) {
    const k = i / fade;
    body[i] = body[i] * k + input[input.length - fade + i] * (1 - k);
  }
  return body;
}

const TAU = Math.PI * 2;
const sounds: Record<string, Float32Array> = {};

// Floodlight switching on: a muffled, distant knock. No click, no hum.
sounds.thunk = normalize(
  lowpass(
    render(0.5, (t) => Math.sin(TAU * (48 + 30 * Math.exp(-t * 25)) * t) * Math.exp(-t * 11)),
    400,
  ),
  0.7,
);

// Soft ball-on-turf touch.
sounds.touch = normalize(
  (() => {
    const body = render(
      0.14,
      (t) => Math.sin(TAU * (70 + 60 * Math.exp(-t * 60)) * t) * Math.exp(-t * 40),
    );
    const grass = lowpass(
      render(0.14, (t) => noise() * Math.exp(-t * 60)),
      2500,
    );
    return body.map((x, i) => x + grass[i] * 0.35);
  })(),
  0.8,
);

// Ball into the net: a band of noise that swells and settles.
sounds.swish = normalize(
  (() => {
    const n = render(0.7, () => noise());
    const band = lowpass(n, 3500).map((x, i) => x - lowpass(n, 700)[i]);
    return band.map((x, i) => {
      const t = i / RATE;
      return x * Math.min(1, t / 0.04) * Math.exp(-t * 5);
    });
  })(),
  0.8,
);

// --- Late-night loop ------------------------------------------------------------
// Soft electric-piano chords over a warm pad, a few high notes, vinyl crackle, and
// faint crickets. Four chords, four seconds each, so it loops every 16 seconds.

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);
const CHORD_SECONDS = 4;
const CHORDS = [
  [53, 57, 60, 64], // Fmaj7
  [52, 55, 59, 62], // Em7
  [50, 53, 57, 60], // Dm7
  [48, 52, 55, 59], // Cmaj7
];
// Sparse melody on top: [chord index, beat offset in seconds, midi note].
const MELODY: [number, number, number][] = [
  [0, 1.0, 76],
  [0, 2.5, 72],
  [1, 1.5, 74],
  [2, 0.5, 77],
  [2, 2.0, 76],
  [3, 1.0, 72],
  [3, 3.0, 67],
];

/** A mellow electric-piano note: fundamental plus a soft octave, gentle tremolo, long decay. */
function keys(out: Float32Array, start: number, freq: number, gain: number, decay = 1.6) {
  const from = Math.round(start * RATE);
  const len = Math.round(4.5 * RATE);
  for (let i = 0; i < len && from + i < out.length; i++) {
    const t = i / RATE;
    const env = Math.min(1, t / 0.008) * Math.exp(-t * decay);
    const tremolo = 1 + 0.08 * Math.sin(TAU * 4.5 * t);
    const tone = Math.sin(TAU * freq * t) + 0.22 * Math.sin(TAU * freq * 2 * t) * Math.exp(-t * 4);
    out[from + i] += tone * env * tremolo * gain;
  }
}

/** A slow, slightly detuned pad that swells in and out over one chord. */
function pad(out: Float32Array, start: number, freq: number, gain: number) {
  const from = Math.round(start * RATE);
  const len = Math.round((CHORD_SECONDS + 1.5) * RATE);
  for (let i = 0; i < len && from + i < out.length; i++) {
    const t = i / RATE;
    const env = Math.min(1, t / 1.2) * Math.min(1, Math.max(0, (CHORD_SECONDS + 1.5 - t) / 1.5));
    const tone = Math.sin(TAU * freq * t) + Math.sin(TAU * freq * 1.004 * t + 1);
    out[from + i] += tone * env * gain;
  }
}

/** Feedback echo, low-passed so repeats get darker. Gives the dry synth some room. */
function echo(input: Float32Array, seconds: number, feedback: number, mix: number) {
  const d = Math.round(seconds * RATE);
  const buf = new Float32Array(input.length);
  let lp = 0;
  for (let i = 0; i < input.length; i++) {
    const delayed = i >= d ? buf[i - d] : 0;
    lp += 0.35 * (delayed - lp);
    buf[i] = input[i] + lp * feedback;
  }
  return input.map((x, i) => x + (buf[i] - x) * mix);
}

const LOOP = CHORDS.length * CHORD_SECONDS;
const TAIL = 2; // rendered past the loop point, then crossfaded into the start

sounds.night = normalize(
  loopable(
    (() => {
      const music = new Float32Array(Math.round((LOOP + TAIL) * RATE));
      CHORDS.forEach((chord, c) => {
        const at = c * CHORD_SECONDS;
        // Slightly rolled chord, struck again softly halfway through.
        chord.forEach((n, k) => {
          keys(music, at + k * 0.045, midi(n), 0.16);
          keys(music, at + 2 + k * 0.03, midi(n), 0.07);
          pad(music, at, midi(n - 12), 0.035);
        });
        keys(music, at, midi(chord[0] - 12), 0.18, 1.1); // bass note
      });
      for (const [c, beat, n] of MELODY) keys(music, c * CHORD_SECONDS + beat, midi(n), 0.09, 2.2);

      const warm = lowpass(echo(music, 0.42, 0.45, 0.35), 2200);

      // Vinyl: very quiet hiss plus sparse soft pops.
      const vinyl = lowpass(
        render(LOOP + TAIL, () => noise() * 0.012 + (noise() > 0.9993 ? noise() * 0.25 : 0)),
        3000,
      );

      // Crickets: soft sine chirps far in the distance.
      const crickets = render(LOOP + TAIL, (t) => {
        const phase = (t * 0.7) % 2.3;
        if (phase > 0.24) return 0;
        const env = Math.sin((Math.PI * phase) / 0.24) * (0.5 + 0.5 * Math.sin(TAU * 22 * t));
        return Math.sin(TAU * 4400 * t) * env * 0.012;
      });

      return warm.map((x, i) => x + vinyl[i] + crickets[i]);
    })(),
    TAIL,
  ),
  0.7,
);

mkdirSync(OUT, { recursive: true });
for (const [name, samples] of Object.entries(sounds)) {
  const file = `${OUT}/${name}.wav`;
  writeFileSync(file, wav(samples));
  console.log(`${file}  ${(samples.length / RATE).toFixed(2)}s`);
}
