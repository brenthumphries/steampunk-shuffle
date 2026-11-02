// Mother Shipton (November visitor, Coven + Irregulars, docs/plans/monthly/
// 01-november.md §2): seasoned dial, the Scry deck. Coven Scry payoffs and
// hexes over a cheap Irregular body, with Hiawatha for the pub's own cat.

import type { Card, Deck } from "../../cardTypes.ts";
import { cabDriver, telegraphBoy, bakerStreetIrregular, hiawatha, anonymousTip } from "../families/irregulars.ts";
import { motherShipton, oldMooresAlmanack } from "../cunningFolk.ts";
import { hedgeWitch, cunningWoman, witchBottle } from "../families/coven.ts";

// Deck-local bodies (not in the labeled 60 or the event pool) replacing the
// deck's 1-point Irregulars, so the visitor's curve sits near the seasoned
// target (curve check, 2026-11-02: starter 73% before, 50% after Dale Carter 3pt to 4pt). No art yet; tracked
// in KNOWN_MISSING (tests/unit/content/artAssets.test.ts).
export const knaresboroughSeer: Card = {
  id: "knaresborough-seer",
  rarity: "uncommon",
  faces: [
    {
      name: "Knaresborough Seer",
      type: "character",
      family: "coven",
      points: 4,
      flavor: "Reads the river at the Dropping Well and says what the water is thinking.",
      artId: "knaresborough-seer",
    },
  ],
};

export const daleCarter: Card = {
  id: "dale-carter",
  rarity: "common",
  faces: [
    {
      name: "Dale Carter",
      type: "character",
      family: "irregulars",
      points: 4,
      flavor: "Has carried the post, the coffin and the cheese over the Dales. Never once the wrong way up.",
      artId: "dale-carter",
    },
  ],
};

export const shiptonsDeck: Deck = [
  { card: motherShipton, quantity: 1 },
  { card: hedgeWitch, quantity: 2 },
  { card: cunningWoman, quantity: 2 },
  { card: witchBottle, quantity: 2 },
  { card: knaresboroughSeer, quantity: 2 },
  { card: daleCarter, quantity: 2 },
  { card: cabDriver, quantity: 2 },
  { card: bakerStreetIrregular, quantity: 2 },
  { card: telegraphBoy, quantity: 2 },
  { card: hiawatha, quantity: 1 },
  { card: anonymousTip, quantity: 1 },
  { card: oldMooresAlmanack, quantity: 1 },
];
