// Web-Audio-synthesized sound effects (plan step 3.4) — no licensed audio,
// every effect is generated on the fly from oscillators/noise. The
// AudioContext is created lazily, inside `ensureContext()`, and never at
// module load: jsdom (the unit-test environment, vitest.config's
// `environment: "jsdom"`) has no AudioContext implementation at all, so
// importing this module has to stay safe even though none of its
// sound-producing functions can be meaningfully unit-tested — same class of
// gap as tools/ingest-art.py (1.7) and the animation work (3.3), both
// verified by actually running/watching them in a real browser instead.
//
// iOS requires audio to be unlocked by a user gesture (this project's own
// "iOS web app conventions" section) — `unlockAudio()` is wired to the
// very first tap anywhere in the app (src/main.ts), synchronously inside
// that tap's event handler, which is what actually satisfies iOS Safari's
// gesture requirement; calling it again later is a harmless no-op.

import { loadAudioState, saveAudioState } from "./audioState.ts";

export type SoundEffect = "click" | "steam" | "flip" | "brassHit";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = loadAudioState().muted;
let ambience: HTMLAudioElement | null = null;

function ensureContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 1;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

/** Call once, synchronously, inside the app's very first tap handler (src/main.ts). Idempotent. */
export function unlockAudio(): void {
  const audioCtx = ensureContext();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  startAmbience();
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean): void {
  muted = next;
  saveAudioState({ muted });
  if (ctx && masterGain) masterGain.gain.setValueAtTime(muted ? 0 : 1, ctx.currentTime);
  if (muted) ambience?.pause();
  else ambience?.play().catch(() => {});
}

export function toggleMuted(): boolean {
  setMuted(!muted);
  return muted;
}

/**
 * Optional CC0 ambience track (plan step 3.4). No file has actually been
 * sourced yet — see CLAUDE.md — so this loops
 * `public/audio/ambience.mp3` if it's ever dropped in and silently does
 * nothing (the game plays fine without it) if the file 404s or the browser
 * blocks it. Started once from `unlockAudio()`; never fails loudly.
 */
function startAmbience(): void {
  if (ambience || muted) return;
  const audioEl = new Audio(`${import.meta.env.BASE_URL}audio/ambience.mp3`);
  audioEl.loop = true;
  audioEl.volume = 0.25;
  audioEl.play().catch(() => {
    // No ambience file in public/audio/ yet, or autoplay was blocked — fine, ambience is optional.
  });
  ambience = audioEl;
}

/** A short, high square-wave blip for UI taps (buttons, hand cards, targets). */
function playClick(): void {
  const audioCtx = ensureContext();
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(1200, t);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  osc.connect(gain).connect(masterGain!);
  osc.start(t);
  osc.stop(t + 0.06);
}

/** A short filtered-noise hiss for a card entering play (design.md's steampunk pressure-valve flavour). */
function playSteam(): void {
  const audioCtx = ensureContext();
  const t = audioCtx.currentTime;
  const durationSec = 0.22;
  const buffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * durationSec), audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(3200, t);
  filter.Q.value = 0.6;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);
  noise.connect(filter).connect(gain).connect(masterGain!);
  noise.start(t);
  noise.stop(t + durationSec);
}

/** A quick pitch-drop tick for a card flipping face-up/face-down — a coin-flip cue. */
function playFlip(): void {
  const audioCtx = ensureContext();
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(700, t);
  osc.frequency.exponentialRampToValueAtTime(220, t + 0.12);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.14, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
  osc.connect(gain).connect(masterGain!);
  osc.start(t);
  osc.stop(t + 0.14);
}

/** A brief brass-chord stab for round reveals, match-over, bracket advances, and card-reward unwraps. */
function playBrassHit(): void {
  const audioCtx = ensureContext();
  const t = audioCtx.currentTime;
  const durationSec = 0.45;
  for (const freq of [220, 277.18, 329.63]) {
    const osc = audioCtx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, t);
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + durationSec);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);
    osc.connect(filter).connect(gain).connect(masterGain!);
    osc.start(t);
    osc.stop(t + durationSec);
  }
}

const PLAYERS: Record<SoundEffect, () => void> = {
  click: playClick,
  steam: playSteam,
  flip: playFlip,
  brassHit: playBrassHit,
};

/** Plays a synthesized effect. A no-op while muted or before the first tap has unlocked audio (`ensureContext` still creates a suspended context, which just produces silence — no error). */
export function playSound(effect: SoundEffect): void {
  if (muted) return;
  try {
    PLAYERS[effect]();
  } catch {
    // Some environments (e.g. a browser that refuses AudioContext outside a user gesture) can throw here — sound is polish, never worth crashing a turn over.
  }
}
