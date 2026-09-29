// Hallowe'en visitor signature cards (seasonal-events-plan.md §3): one
// legendary per visitor, earned on the first win against them. These are
// event cards, so they live outside ALL_CARDS (design.md §8.1's labeled 60)
// — see eventCards.ts. All five monsters are built from public-domain
// sources and avoid the protected film looks (no flat-topped head, neck
// bolts, green skin, widow's peak or medallion; no Universal film names).

import type { Card } from "../cardTypes.ts";

// Wells, *The Invisible Man* (1897). Same shape as Sherlock Holmes: Elusive
// keeps him off Flip and opposing Return, and his own Return keyword brings
// him back to hand every round.
export const mrGriffin: Card = {
  id: "mr-griffin",
  rarity: "legendary",
  faces: [
    {
      name: "Mr Griffin",
      type: "character",
      family: "irregulars",
      points: 3,
      keywords: { elusive: true, return: true },
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "return", target: { side: "opponent", filter: { maxPoints: 2 } } }],
        },
      ],
      flavor: "He was in the room the whole time. That is rather the point.",
      artId: "mr-griffin",
    },
  ],
};

// British Museum Egyptomania and mummy folklore. Persist keeps him on the
// table; his end-of-round Flip is the same shape as Mr Hyde's, and lands
// after the round's score is locked, so it costs the opponent the card they
// meant to Persist or Return, not the round itself.
export const clockworkPharaoh: Card = {
  id: "clockwork-pharaoh",
  rarity: "legendary",
  faces: [
    {
      name: "The Clockwork Pharaoh",
      type: "character",
      family: "salon",
      points: 4,
      keywords: { persist: true },
      abilities: [
        {
          trigger: "endOfRound",
          effects: [{ effect: "flip", target: { side: "opponent", filter: { highestPoints: true } } }],
        },
      ],
      flavor: "The curse falls on whatever you meant to keep.",
      artId: "clockwork-pharaoh",
    },
  ],
};

// Stoker, *Dracula* (1897). Undying is the whole gimmick: a Flip only sends
// him home. He arrives already aiming one of his own at something small.
export const theCount: Card = {
  id: "the-count",
  rarity: "legendary",
  faces: [
    {
      name: "The Count",
      type: "character",
      family: "rookery",
      points: 4,
      keywords: { undying: true },
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 3 } } }] }],
      flavor: "He was invited in. That was the mistake, and the guest book proves it.",
      artId: "the-count",
    },
  ],
};

// Werewolf folklore. A mild 2 until the last round, then a 6 — and Elusive,
// so nobody gets to deal with him in between.
export const gentlemanOfTheHeath: Card = {
  id: "gentleman-of-the-heath",
  rarity: "legendary",
  faces: [
    {
      name: "The Gentleman of the Heath",
      type: "character",
      family: "yard",
      points: 2,
      keywords: { elusive: true, moonrise: 4 },
      flavor: "A quiet man, most nights. Nobody ever checks which nights.",
      artId: "gentleman-of-the-heath",
    },
  ],
};

// Shelley, *Frankenstein* (1818). Deliberately just a big body and Undying,
// with no other text: he keeps coming back.
export const theCreature: Card = {
  id: "the-creature",
  rarity: "legendary",
  faces: [
    {
      name: "The Creature",
      type: "character",
      family: "foundry",
      points: 6,
      keywords: { undying: true },
      flavor: "Made, not born. Not easily unmade, either.",
      artId: "the-creature",
    },
  ],
};

// London folklore (sightings from 1837 into the 1870s). Not a visitor: he
// appears only in The All Hallows' Wake, as its prize (src/tournaments/
// tournaments.ts). The same shape as Mr Griffin, aimed at the small end of
// the board.
export const springHeeledJack: Card = {
  id: "spring-heeled-jack",
  rarity: "legendary",
  faces: [
    {
      name: "Spring-Heeled Jack",
      type: "character",
      family: "rookery",
      points: 3,
      keywords: { elusive: true, return: true },
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 2 } } }] }],
      flavor: "Sighted from 1837 on. The boots were never found, and neither was he.",
      artId: "spring-heeled-jack",
    },
  ],
};

export const halloweenSignatureCards: Card[] = [mrGriffin, clockworkPharaoh, theCount, gentlemanOfTheHeath, theCreature, springHeeledJack];
