// The real moon (design.md §5.17). New and full moon instants from Jean Meeus,
// Astronomical Algorithms (2nd ed.), chapter 49, with the main periodic
// corrections and the fourteen planetary arguments: good to a few minutes
// over this century. Pure and offline; the date is always a parameter (callers
// pass `today()` from src/events/eventClock.ts), never read from the clock here.

const SYNODIC_MONTH = 29.530588861;
const JD_UNIX_EPOCH = 2440587.5;
const MS_PER_DAY = 86_400_000;
const RAD = Math.PI / 180;

export const MOON_PHASE_NAMES = [
  "new",
  "waxing-crescent",
  "first-quarter",
  "waxing-gibbous",
  "full",
  "waning-gibbous",
  "last-quarter",
  "waning-crescent",
] as const;
export type MoonPhaseName = (typeof MOON_PHASE_NAMES)[number];

export interface MoonPhase {
  name: MoonPhaseName;
  /** Fraction of the lunation, 0 (new) to just under 1; 0.5 is full. */
  cycle: number;
  /** Lit fraction of the disc, 0 (new) to 1 (full). */
  illumination: number;
}

/** Meeus 49: the Julian Ephemeris Day of lunation `k` (integer: new moon; +0.5: full moon). */
export function moonEventJDE(k: number): number {
  const full = k % 1 !== 0;
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  let jde = 2451550.09766 + SYNODIC_MONTH * k + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3) * RAD;
  const Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4) * RAD;
  const F = (160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4) * RAD;
  const O = (124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3) * RAD;

  // [coefficient for new, coefficient for full, power of E, M, M', F, Omega multipliers]
  const terms: [number, number, number, number, number, number, number][] = [
    [-0.4072, -0.40614, 0, 0, 1, 0, 0],
    [0.17241, 0.17302, 1, 1, 0, 0, 0],
    [0.01608, 0.01614, 0, 0, 2, 0, 0],
    [0.01039, 0.01043, 0, 0, 0, 2, 0],
    [0.00739, 0.00734, 1, -1, 1, 0, 0],
    [-0.00514, -0.00515, 1, 1, 1, 0, 0],
    [0.00208, 0.00209, 2, 2, 0, 0, 0],
    [-0.00111, -0.00111, 0, 0, 1, -2, 0],
    [-0.00057, -0.00057, 0, 0, 1, 2, 0],
    [0.00056, 0.00056, 1, 1, 2, 0, 0],
    [-0.00042, -0.00042, 0, 0, 3, 0, 0],
    [0.00042, 0.00042, 1, 1, 0, 2, 0],
    [0.00038, 0.00038, 1, 1, 0, -2, 0],
    [-0.00024, -0.00024, 1, -1, 2, 0, 0],
    [-0.00017, -0.00017, 0, 0, 0, 0, 1],
    [-0.00007, -0.00007, 0, 2, 1, 0, 0],
    [0.00004, 0.00004, 0, 0, 2, -2, 0],
    [0.00004, 0.00004, 0, 3, 0, 0, 0],
    [0.00003, 0.00003, 0, 1, 1, -2, 0],
    [0.00003, 0.00003, 0, 0, 2, 2, 0],
    [-0.00003, -0.00003, 0, 1, 1, 2, 0],
    [0.00003, 0.00003, 0, -1, 1, 2, 0],
    [-0.00002, -0.00002, 0, -1, 1, -2, 0],
    [-0.00002, -0.00002, 0, 1, 3, 0, 0],
    [0.00002, 0.00002, 0, 0, 4, 0, 0],
  ];
  let corr = 0;
  for (const [cNew, cFull, ePow, m, mp, f, o] of terms) {
    corr += (full ? cFull : cNew) * E ** ePow * Math.sin(m * M + mp * Mp + f * F + o * O);
  }
  jde += corr;

  // Planetary arguments: [offset, rate per k, coefficient]; A1 also has a T^2 term.
  const planetary: [number, number, number][] = [
    [299.77, 0.107408, 0.000325],
    [251.88, 0.016321, 0.000165],
    [251.83, 26.651886, 0.000164],
    [349.42, 36.412478, 0.000126],
    [84.66, 18.206239, 0.00011],
    [141.74, 53.303771, 0.000062],
    [207.14, 2.453732, 0.00006],
    [154.84, 7.30686, 0.000056],
    [34.52, 27.261239, 0.000047],
    [207.19, 0.121824, 0.000042],
    [291.34, 1.844379, 0.00004],
    [161.72, 24.198154, 0.000037],
    [239.56, 25.513099, 0.000035],
    [331.55, 3.592518, 0.000023],
  ];
  planetary.forEach(([offset, rate, coef], i) => {
    const arg = offset + rate * k - (i === 0 ? 0.009173 * T2 : 0);
    jde += coef * Math.sin(arg * RAD);
  });
  return jde;
}

/** ΔT (TD minus UT, seconds) for 2005-2050 (Meeus 10.2 / Espenak): 62.92 + 0.32217 t + 0.005589 t². */
function deltaTSeconds(year: number): number {
  const t = year - 2000;
  return 62.92 + 0.32217 * t + 0.005589 * t * t;
}

/** The instant (UT) of lunation `k`: an integer is a new moon, an integer plus a half a full moon. */
export function moonEventInstant(k: number): Date {
  const jde = moonEventJDE(k);
  const year = 2000 + (k / 12.3685);
  const jd = jde - deltaTSeconds(year) / 86400;
  return new Date(Math.round((jd - JD_UNIX_EPOCH) * MS_PER_DAY));
}

/** Lunation number (Meeus 49: k = 0 is the new moon of 2000-01-06) of the mean lunation containing `date`. */
function lunationNear(date: Date): number {
  return Math.floor(((date.getTime() / MS_PER_DAY + JD_UNIX_EPOCH) - 2451550.09766) / SYNODIC_MONTH);
}

interface MoonEvent {
  at: number;
  full: boolean;
}

function eventsAround(date: Date, spread: number): MoonEvent[] {
  const k0 = lunationNear(date);
  const events: MoonEvent[] = [];
  for (let k = k0 - spread; k <= k0 + spread; k++) {
    events.push({ at: moonEventInstant(k).getTime(), full: false });
    events.push({ at: moonEventInstant(k + 0.5).getTime(), full: true });
  }
  return events.sort((a, b) => a.at - b.at);
}

/** Where `date` falls in the lunation (0 new, 0.5 full), interpolating linearly between the true new and full instants. */
function cycleFraction(date: Date): number {
  const t = date.getTime();
  const events = eventsAround(date, 2);
  let i = 0;
  while (i + 1 < events.length && (events[i + 1] as MoonEvent).at <= t) i++;
  const prev = events[i] as MoonEvent;
  const next = events[i + 1] as MoonEvent;
  const half = (t - prev.at) / (next.at - prev.at) * 0.5;
  return prev.full ? 0.5 + half : half;
}

/** The named phase (eight states, each a 1/8 slice centred on its own moment) and the lit fraction, for an instant. */
export function moonPhase(date: Date): MoonPhase {
  const cycle = cycleFraction(date);
  const name = MOON_PHASE_NAMES[Math.floor(((cycle * 8 + 0.5) % 8 + 8) % 8)] as MoonPhaseName;
  return { name, cycle, illumination: (1 - Math.cos(2 * Math.PI * cycle)) / 2 };
}

/** A local calendar day as a whole number, so days compare without DST or time-of-day creeping in. */
function localDayNumber(d: Date): number {
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / MS_PER_DAY);
}

/**
 * True when `date`'s local calendar day is the day before, the day of or the
 * day after a full-moon instant, with that instant read in local time.
 */
export function isFullMoonNight(date: Date): boolean {
  const day = localDayNumber(date);
  for (const e of eventsAround(date, 1)) {
    if (e.full && Math.abs(localDayNumber(new Date(e.at)) - day) <= 1) return true;
  }
  return false;
}
