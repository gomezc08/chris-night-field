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

// Floodlight relay: a sharp click on top of a low thump.
sounds.thunk = normalize(
  render(0.6, (t) => {
    const click = t < 0.012 ? noise() * (1 - t / 0.012) : 0;
    const thump = Math.sin(TAU * (55 + 40 * Math.exp(-t * 30)) * t) * Math.exp(-t * 9);
    return click * 0.6 + thump;
  }),
  0.9,
);

// Mains hum from the lamps. 2 s holds whole cycles of 120/240/360 Hz, so it loops cleanly.
sounds.hum = normalize(
  render(
    2,
    (t) => Math.sin(TAU * 120 * t) + 0.5 * Math.sin(TAU * 240 * t) + 0.2 * Math.sin(TAU * 360 * t),
  ),
  0.5,
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

// Empty stadium at night: distant low rumble plus a few crickets.
sounds.ambience = normalize(
  loopable(
    (() => {
      let brown = 0;
      const rumble = lowpass(
        render(9, () => (brown = Math.max(-1, Math.min(1, brown + noise() * 0.02)))),
        300,
      );
      const crickets = render(9, (t) => {
        const chirp = (t * 0.9) % 1.7 < 0.18 ? 1 : 0; // short chirp bursts
        const trill = Math.sin(TAU * 28 * t) > 0 ? 1 : 0;
        return Math.sin(TAU * 4200 * t) * chirp * trill * 0.12;
      });
      return rumble.map((x, i) => x + crickets[i]);
    })(),
    1,
  ),
  0.6,
);

mkdirSync(OUT, { recursive: true });
for (const [name, samples] of Object.entries(sounds)) {
  const file = `${OUT}/${name}.wav`;
  writeFileSync(file, wav(samples));
  console.log(`${file}  ${(samples.length / RATE).toFixed(2)}s`);
}
