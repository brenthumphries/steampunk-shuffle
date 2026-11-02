// The Cunning Folk (November 1-30): England's cunning folk come up to read
// the Landlady's stars (docs/plans/monthly/01-november.md §1-§6). Visitors
// arrive on the 13th (Shipton, Dee) and the 20th (Mother Red Cap, who stays
// tournament-only); Pixie opens the Fortune-teller's Booth on the 13th and
// stays for good. Nothing here is giftOnly: none of it is a fan allusion.

import type { SeasonalEvent } from "../seasonalEvents.ts";

export const CUNNING_FOLK = {
  id: "cunning-folk",
  name: "The Cunning Folk",
  window: { start: { month: 11, day: 1 }, end: { month: 11, day: 30 } },
  visitors: [
    { opponentId: "mother-shipton", arrives: { month: 11, day: 13 } },
    { opponentId: "john-dee", arrives: { month: 11, day: 13 } },
    // Tournament-only (Opponent.tournamentOnly), so she never joins Tonight's
    // Patrons; listed here so the Mudd line can react to her from Nov 20.
    { opponentId: "mother-red-cap", arrives: { month: 11, day: 20 } },
  ],
  tournaments: ["almanack-stakes"],
  // Lost & Found and Pawnbroker rolls while live. The Penny for the Guy joins
  // from 2027 (Bonfire Night, overview §10.6). Sagittarius is listed here for
  // the whole window; its arrival gift is the Nov 22 one.
  cardPool: [
    "stir-up-pudding",
    "remember-remember",
    "old-moores-almanack",
    "the-petrifying-well",
    { id: "penny-for-the-guy", fromYear: 2027 },
    "hedge-witch",
    "cunning-woman",
    "witch-bottle",
    "almanack-sagittarius",
  ],
  minWins: 3,
  hosts: [{ id: "pamela-colman-smith", arrives: { month: 11, day: 13 } }],
  arrivalGifts: [
    {
      id: "left-on-the-step",
      cardIds: [
        { id: "almanack-scorpio", qty: 1 },
        { id: "hedge-witch", qty: 2 },
        { id: "witch-bottle", qty: 1 },
      ],
      from: { month: 11, day: 1 },
      line: "Someone left these on the step. The note says: 'For the Landlady, belated. Born under the Scorpion: we can tell.'",
    },
    {
      id: "cunning-woman",
      cardIds: [{ id: "cunning-woman", qty: 1 }],
      from: { month: 11, day: 13 },
      line: "Pixie says the cunning woman left this for you. She didn't see anyone come in. Neither did I.",
    },
    {
      id: "penny-for-the-guy",
      cardIds: [{ id: "penny-for-the-guy", qty: 1 }],
      from: { month: 11, day: 5 },
      fromYear: 2027,
      line: "Remember, remember. Three boys and a straw Guy came by for a penny. I gave them a sovereign by mistake. They've decided that makes you one of the gang.",
    },
    {
      id: "almanack-seller",
      cardIds: [{ id: "almanack-sagittarius", qty: 1 }],
      from: { month: 11, day: 22 },
      line: "The almanack-seller's been. He left next month's page early. He always does.",
    },
  ],
  almanackIds: ["almanack-scorpio", "almanack-sagittarius"],
  tarotIds: ["tarot-the-fool", "tarot-the-magician"],
  covenCardIds: ["hedge-witch", "cunning-woman", "witch-bottle"],
  banner: "The Cunning Folk are in. Pixie has hung a curtain in the snug and says she'll read for anyone.",
  dressing: {
    taproomArtId: "background-the-taproom-cunning-folk",
    lockedHint: "Wise women on the cellar stairs this month. Win a few hands first, and I'll introduce you. They already know your name.",
    sirCharlesLines: [
      "Mrs Shipton says it'll rain. It's November in London. I didn't need a prophetess.",
      "Remember, remember. I do. The cellar was open in 1605, and I've never got the smell out.",
      "Hiawatha has been on Mother Red Cap's lap all evening. I've decided not to know.",
    ],
    lineOverrides: [
      { opponentId: "lovelace", line: "Dr Dee's mathematics is excellent. His angels are another matter.", whenArrived: "john-dee" },
      { opponentId: "prudence-hollis", line: "Mrs Shipton has told me how my novel ends. I've had to start another.", whenArrived: "mother-shipton" },
      { opponentId: "mudd", line: "There's a lady with a cat who says she's from Camden. Camden's not my beat. I've checked.", whenArrived: "mother-red-cap" },
    ],
  },
} satisfies SeasonalEvent;
