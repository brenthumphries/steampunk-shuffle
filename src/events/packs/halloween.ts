// Hallowe'en at the Bridge (Oct 1 - Oct 31): the first seasonal event, moved
// here unchanged from seasonalEvents.ts when the content-pack layout landed
// (docs/plans/monthly/00-monthly-content-plan.md §4.1).

import type { SeasonalEvent } from "../seasonalEvents.ts";

// `satisfies`, not an annotation: the constant keeps its narrow literal type
// (cardPool is plain string ids) so the Hallowe'en tests read it unchanged.
export const HALLOWEEN = {
  id: "halloween",
  name: "Hallowe'en at the Bridge",
  window: { start: { month: 10, day: 1 }, end: { month: 10, day: 31 } },
  visitors: [
    { opponentId: "mr-griffin", arrives: { month: 10, day: 1 } },
    { opponentId: "clockwork-pharaoh", arrives: { month: 10, day: 1 } },
    { opponentId: "carpathian-count", arrives: { month: 10, day: 15 } },
    { opponentId: "hampstead-wolf", arrives: { month: 10, day: 15 } },
    { opponentId: "galvanic-creature", arrives: { month: 10, day: 15 } },
  ],
  tournaments: ["all-hallows-wake"],
  cardPool: [
    "turnip-lantern",
    "resurrection-man",
    "spirit-photograph",
    "the-witching-hour",
    "grave-robber",
    "night-constable",
    "lamplighter-at-dusk",
    "galvanic-battery",
  ],
  minWins: 3,
  dressing: {
    taproomArtId: "background-the-taproom-halloween",
    lockedHint: "Odd folk on the cellar stairs this month. Win a few hands first, and I'll introduce you.",
    sirCharlesLines: [
      "The cellar door's been busy. I've stopped asking who's knocking.",
      "Turnips, mind. Not pumpkins. I'll not have a foreign vegetable on my bar.",
      "If a chair moves on its own tonight, it's the draught. It is always the draught.",
    ],
    lineOverrides: [{ opponentId: "shelley", line: "Oh. You've met him.", whenArrived: "galvanic-creature" }],
  },
} satisfies SeasonalEvent;
