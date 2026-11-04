// The Almanack (zodiac Headlines, docs/plans/monthly/00-monthly-content-plan.md
// §5.2): neutral rare Headlines in the Almanack frame. Headlines have no
// points, so the frame and the glyph are all there is to tell them apart.
// Event cards, so they sit outside ALL_CARDS (./eventCards.ts).

import { DECK_SIZE, type Card } from "../cardTypes.ts";

// Every card in play is drawn from a 20-card deck, so two whole boards fit
// in this count: a "each player's face-down cards" effect never needs more.
export const EVERY_BOARD_CARD = DECK_SIZE * 2;

// The Scorpio card is the Landlady's sign (overview §5.2).
export const almanackScorpio: Card = {
  id: "almanack-scorpio",
  rarity: "rare",
  faces: [
    {
      name: "Scorpio",
      type: "headline",
      family: "neutral",
      points: 0,
      frame: "almanack",
      glyph: "♏",
      abilities: [{ trigger: "onPlay", effects: [{ effect: "unflip", target: { side: "each", count: EVERY_BOARD_CARD } }] }],
      flavor: "Born under the Scorpion, like the Landlady. Sir Charles says this explains a great deal, and won't say what.",
      artId: "almanack-scorpio",
    },
  ],
};

// Brent's call (Nov 4): the printed text is what the card does, "draw 1; your
// highest face-up card gets +1". The engine has no per-player draw and no
// one-per-side target (src/cards/data/README.md, "Known engine-schema gaps"),
// so the original "each player" draft was dropped rather than approximated.
export const almanackSagittarius: Card = {
  id: "almanack-sagittarius",
  rarity: "rare",
  faces: [
    {
      name: "Sagittarius",
      type: "headline",
      family: "neutral",
      points: 0,
      frame: "almanack",
      glyph: "♐",
      abilities: [
        {
          trigger: "onPlay",
          effects: [
            { effect: "draw", amount: 1 },
            { effect: "buff", target: { side: "self", filter: { highestPoints: true } }, amount: 1 },
          ],
        },
      ],
      flavor: "An arrow loosed at the sky. It hasn't come down yet, and nobody minds.",
      artId: "almanack-sagittarius",
    },
  ],
};

// December (02-december.md §4, overview §5.2): "each face-up Persist card
// gets +1". Buffs every face-up Persist card on both boards (`each`).
export const almanackCapricorn: Card = {
  id: "almanack-capricorn",
  rarity: "rare",
  faces: [
    {
      name: "Capricorn",
      type: "headline",
      family: "neutral",
      points: 0,
      frame: "almanack",
      glyph: "\u2651",
      abilities: [{ trigger: "onPlay", effects: [{ effect: "buff", target: { side: "each", count: EVERY_BOARD_CARD, filter: { hasKeyword: "persist" } }, amount: 1 }] }],
      flavor: "A goat with a fish's tail. Climbs anything, and gets there in the end.",
      artId: "almanack-capricorn",
    },
  ],
};

export const almanackCards: Card[] = [almanackScorpio, almanackSagittarius, almanackCapricorn];
