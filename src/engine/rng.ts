// Deterministic PRNG. Match state must survive structuredClone (matchEngine.ts
// clones state on every mutation), so randomness is a plain numeric seed
// threaded through pure step functions rather than a closure-based generator.

export interface RandomStep {
  value: number; // in [0, 1)
  seed: number;
}

/** One step of a splitmix32-style PRNG. Not cryptographic; fine for shuffles and sim runs. */
export function stepRandom(seed: number): RandomStep {
  let x = (seed + 0x9e3779b9) | 0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
  x = x ^ (x >>> 15);
  return { value: (x >>> 0) / 4294967296, seed: x };
}

export function shuffle<T>(items: readonly T[], seed: number): { result: T[]; seed: number } {
  const arr = items.slice();
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    const step = stepRandom(s);
    s = step.seed;
    const j = Math.floor(step.value * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return { result: arr, seed: s };
}
