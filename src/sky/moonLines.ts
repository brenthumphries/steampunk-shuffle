import { isFullMoonNight, moonPhase, type MoonPhaseName } from "./moon.ts";

export const FULL_MOON_LINE = "Full moon tonight. The Hampstead gentleman sends his apologies.";

export const PHASE_TITLES: Record<MoonPhaseName, string> = {
  new: "New moon",
  "waxing-crescent": "Waxing crescent",
  "first-quarter": "First quarter",
  "waxing-gibbous": "Waxing gibbous",
  full: "Full moon",
  "waning-gibbous": "Waning gibbous",
  "last-quarter": "Last quarter",
  "waning-crescent": "Waning crescent",
};

/** Sir Charles on each phase (design.md §5.17). */
export const PHASE_LINES: Record<MoonPhaseName, string> = {
  new: "Not a scrap of it tonight. Pixie says that's the night for starting things quietly.",
  "waxing-crescent": "A fingernail over the chimney pots. Pixie says wishes planted now come up slowly.",
  "first-quarter": "Half a moon, and the better half to my mind. Pixie says make up your mind tonight.",
  "waxing-gibbous": "Pixie says that's a good one.",
  full: "Bright enough to read a hand by, if you must. Pixie says mind your temper.",
  "waning-gibbous": "Past its best, like the rest of us. Pixie says it's the night for giving things back.",
  "last-quarter": "Half a moon again, the other half. Pixie says tidy up before you start anything new.",
  "waning-crescent": "Barely a thread of it left. Pixie says rest, and don't lend money.",
};

/** The beer-mat text the hub moon shows for `date`: the phase, Sir Charles's line, and the full-moon apology on the nights around one. */
export function moonMatText(date: Date): string {
  const name = moonPhase(date).name;
  const base = `${PHASE_TITLES[name]}. ${PHASE_LINES[name]}`;
  return isFullMoonNight(date) ? `${base} ${FULL_MOON_LINE}` : base;
}
