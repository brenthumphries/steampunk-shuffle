// A Ghost Story for Christmas (December 1-31, docs/plans/monthly/02-december.md
// §1-§7): Mr Pockett arrives on the 1st, the Ghost of Christmas Present on the
// 12th, and the Ghost of Christmas Yet to Come (tournament-only, so never in
// Tonight's Patrons) on the 18th. The Advent Cabinet opens on the 1st and stays
// claimable until Twelfth Night (Jan 6). Mr Pockett, his card and his lines
// are fan allusions (giftOnly).

import type { SeasonalEvent } from "../seasonalEvents.ts";
import type { AdventDoor } from "../advent.ts";

// Door N opens N-1 days after the 1st (src/events/advent.ts), so door 25 is
// Christmas Day. Checks total 210 across the 14 check doors.
const ADVENT_DOORS: AdventDoor[] = [
  { day: 1, reward: { checks: 10 } },
  { day: 2, reward: { cardId: "wassail-bowl" } },
  { day: 3, reward: { checks: 10 } },
  { day: 4, reward: { checks: 15 } },
  { day: 5, reward: { cardId: "yule-log" } },
  { day: 6, reward: { checks: 10 } },
  { day: 7, reward: { cardId: "a-whistle-on-the-shingle" } },
  { day: 8, reward: { checks: 15 } },
  { day: 9, reward: { checks: 20 } },
  { day: 10, reward: { cardId: "salt-at-the-threshold" } },
  { day: 11, reward: { checks: 10 } },
  { day: 12, reward: { cardId: "the-fireside-tale" } },
  { day: 13, reward: { checks: 15 } },
  { day: 14, reward: { token: "lostAndFoundUncommon" } },
  { day: 15, reward: { checks: 20 } },
  { day: 16, reward: { checks: 10 } },
  { day: 17, reward: { cardId: "stir-up-pudding" } },
  { day: 18, reward: { checks: 15 } },
  { day: 19, reward: { token: "tinkerFree" } },
  { day: 20, reward: { checks: 20 } },
  { day: 21, reward: { checks: 15 } },
  { day: 22, reward: { cardId: "almanack-capricorn" } },
  { day: 23, reward: { checks: 25 } },
  { day: 24, reward: { checks: 50 }, line: "Christmas Eve. Lamps down. Mr Dickens is about to begin." },
  { day: 25, reward: { foilOf: "bramwell" }, line: "Happy Christmas, Landlady. The cats got you something. It's a foil. They didn't wrap it." },
];

export const GHOST_STORY = {
  id: "ghost-story",
  name: "A Ghost Story for Christmas",
  window: { start: { month: 12, day: 1 }, end: { month: 12, day: 31 } },
  visitors: [
    { opponentId: "mr-pockett", arrives: { month: 12, day: 1 } },
    { opponentId: "ghost-of-christmas-present", arrives: { month: 12, day: 12 } },
    // Tournament-only (Opponent.tournamentOnly): listed so the Holmes line can react to him from Dec 18 and so the Fireside Circle can seat him.
    { opponentId: "ghost-of-christmas-yet-to-come", arrives: { month: 12, day: 18 } },
  ],
  tournaments: ["fireside-circle"],
  // Lost & Found and Pawnbroker rolls while live (the Fireside Tale is a rare, so the Pawnbroker can list it).
  cardPool: ["wassail-bowl", "yule-log", "a-whistle-on-the-shingle", "the-fireside-tale", "salt-at-the-threshold", "almanack-capricorn"],
  minWins: 3,
  arrivalGifts: [
    {
      id: "salt-on-the-step",
      cardIds: [{ id: "salt-at-the-threshold", qty: 1 }],
      from: { month: 12, day: 1 },
      line: "There's salt on the step and a packet of it on the bar, addressed to you. Pixie says it's sensible.",
    },
    {
      id: "almanack-seller",
      cardIds: [{ id: "almanack-capricorn", qty: 1 }],
      from: { month: 12, day: 22 },
      line: "Longest night of the year. The almanack-seller came in for the fire and left next month's page.",
      lateLine: "The almanack-seller came in for the fire on the longest night, and you'd gone. He left the new year's page on the bar for you.",
    },
  ],
  almanackIds: ["almanack-capricorn"],
  tarotIds: ["tarot-the-high-priestess", "tarot-the-hermit"],
  covenCardIds: ["salt-at-the-threshold"],
  banner: "It's December at the Bridge. There's a brass cabinet behind the bar with twenty-four little doors in it.",
  advent: {
    opensFrom: { month: 12, day: 1 },
    lastClaim: { month: 1, day: 6 },
    doors: ADVENT_DOORS,
  },
  dressing: {
    taproomArtId: "background-the-taproom-ghost-story",
    weather: "snow",
    lockedHint: "Spirits on the cellar stairs. Seasonal ones. Win a few hands first, and I'll introduce you.",
    sirCharlesLines: [
      "Prince Albert brought the tree over. I've added cogs. He'd have wanted cogs.",
      "Ghost stories on Christmas Eve. It's tradition. The ghosts insist.",
      { text: "Mr Pockett says the scratches on the door are 'a toy'. I've chosen to believe him.", giftOnly: true },
    ],
    lineOverrides: [
      { opponentId: "dickens", line: "I've read that story aloud a hundred times. He's never come to listen before.", whenArrived: "ghost-of-christmas-present" },
      { opponentId: "lovelace", line: "His escapements are better than Babbage's. Please don't tell Babbage.", whenArrived: "mr-pockett", giftOnly: true },
      { opponentId: "holmes", line: "The tall one in black hasn't said a word all evening. I find I like him.", from: { month: 12, day: 18 } },
    ],
  },
} satisfies SeasonalEvent;
