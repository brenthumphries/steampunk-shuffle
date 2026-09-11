// The Landlady (design.md §14.3): the last card in the collection, neutral,
// legendary. Earned by winning the Birthday Invitational.

import type { Card } from "../cardTypes.ts";

// Printed text says "every OTHER face-up Friend card gets +1": two gaps
// against the current engine (see ss-card-author's engine-vocabulary
// notes). (1) TargetFilter can't check for a keyword, so — following The
// Parsonage Snug's precedent (src/cards/data/locations.ts) — this applies
// to every face-up card on her side instead of just Friend cards. (2)
// continuousBuffMap has no self-exclusion for a card's own continuous
// ability (that exclusion exists only for one-shot targeted effects, via
// sourceInstanceId), so unlike a real Friend keyword this also buffs the
// Landlady herself by +1 — a small, one-card overstatement versus the
// printed "OTHER," not a systemic issue.
export const theLandlady: Card = {
  id: "the-landlady",
  rarity: "legendary",
  faces: [
    {
      name: "The Landlady",
      type: "character",
      family: "neutral",
      points: 4,
      keywords: { persist: true, elusive: true },
      abilities: [
        {
          trigger: "continuous",
          effects: [{ effect: "buff", target: { side: "self", filter: {} }, amount: 1 }],
        },
      ],
      flavor: "Her name is on the licence. Everyone else just drinks here.",
      artId: "the-landlady",
    },
  ],
};
