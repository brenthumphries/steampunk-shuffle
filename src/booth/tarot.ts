// The 22 Major Arcana the Fortune-teller's Booth deals (docs/plans/monthly/
// 00-monthly-content-plan.md §5.3). Every value is taken from that table. All
// 22 are in the data from November; a later arcana is dormant until the
// calendar passes its `unlocks` date (src/booth/booth.ts), so a month's art
// is the only thing a later month has to add.

import type { MonthDay } from "../events/eventClock.ts";
import type { Omen } from "./omens.ts";

export interface TarotArcana {
  /** Also the art id: `public/art/<id>.webp`. */
  id: string;
  name: string;
  /** 0 (The Fool) to 21 (The World). */
  number: number;
  artId: string;
  omen: Omen;
  /** Pixie's line when the card turns over. */
  line: string;
  /** The date this arcana joins the deck (the 1st of its month; the Fool and the Magician unlock when Pixie arrives, Nov 13). */
  unlocks: MonthDay;
}

export const TAROT: readonly TarotArcana[] = [
  {
    id: "tarot-the-fool",
    name: "The Fool",
    number: 0,
    artId: "tarot-the-fool",
    omen: { kind: "checksNow", amount: 10 },
    line: "A step off a cliff, and a little dog who thinks it's a fine idea. Go on, then.",
    unlocks: { month: 11, day: 13 },
  },
  {
    id: "tarot-the-magician",
    name: "The Magician",
    number: 1,
    artId: "tarot-the-magician",
    omen: { kind: "tinkerFree" },
    line: "Everything on the table, and you know what each one's for. The Tinker's Bench is on the house.",
    unlocks: { month: 11, day: 13 },
  },
  {
    id: "tarot-the-high-priestess",
    name: "The High Priestess",
    number: 2,
    artId: "tarot-the-high-priestess",
    omen: { kind: "openingHandPlusOne" },
    line: "She knows something you don't. Today, so do you: take an extra card.",
    unlocks: { month: 12, day: 1 },
  },
  {
    id: "tarot-the-empress",
    name: "The Empress",
    number: 3,
    artId: "tarot-the-empress",
    omen: { kind: "lostAndFoundExtra" },
    line: "A garden that grows whether you watch it or not. Two in the box.",
    unlocks: { month: 5, day: 1 },
  },
  {
    id: "tarot-the-emperor",
    name: "The Emperor",
    number: 4,
    artId: "tarot-the-emperor",
    omen: { kind: "checksPerWin", amount: 3 },
    line: "Order, method, and three Checks a win. Poirot would approve.",
    unlocks: { month: 1, day: 1 },
  },
  {
    id: "tarot-the-hierophant",
    name: "The Hierophant",
    number: 5,
    artId: "tarot-the-hierophant",
    omen: { kind: "firstWinBonus", amount: 15 },
    line: "The one who keeps the rules. Today he's keeping a purse for you.",
    unlocks: { month: 4, day: 1 },
  },
  {
    id: "tarot-the-lovers",
    name: "The Lovers",
    number: 6,
    artId: "tarot-the-lovers",
    omen: { kind: "lostAndFoundUpgrade" },
    line: "A choice of the heart. The box behind the bar has chosen well.",
    unlocks: { month: 2, day: 1 },
  },
  {
    id: "tarot-the-chariot",
    name: "The Chariot",
    number: 7,
    artId: "tarot-the-chariot",
    omen: { kind: "firstWinBonus", amount: 20 },
    line: "Two sphinxes pulling opposite ways, and still he gets there. Win once.",
    unlocks: { month: 8, day: 1 },
  },
  {
    id: "tarot-strength",
    name: "Strength",
    number: 8,
    artId: "tarot-strength",
    omen: { kind: "firstWinBonus", amount: 15 },
    line: "A lady and a lion, and the lion has decided to be polite. Win once and be paid for it.",
    unlocks: { month: 3, day: 1 },
  },
  {
    id: "tarot-the-hermit",
    name: "The Hermit",
    number: 9,
    artId: "tarot-the-hermit",
    omen: { kind: "pawnbrokerDiscount", percent: 25 },
    line: "One lantern, one path, and the pawnbroker's in a giving mood.",
    unlocks: { month: 12, day: 1 },
  },
  {
    id: "tarot-wheel-of-fortune",
    name: "Wheel of Fortune",
    number: 10,
    artId: "tarot-wheel-of-fortune",
    omen: { kind: "wildcard" },
    line: "Round it goes.",
    unlocks: { month: 8, day: 1 },
  },
  {
    id: "tarot-justice",
    name: "Justice",
    number: 11,
    artId: "tarot-justice",
    omen: { kind: "checksPerWin", amount: 3 },
    line: "The scales come out even. Every win pays a little extra.",
    unlocks: { month: 3, day: 1 },
  },
  {
    id: "tarot-the-hanged-man",
    name: "The Hanged Man",
    number: 12,
    artId: "tarot-the-hanged-man",
    omen: { kind: "openingHandPlusOne" },
    line: "Upside down and quite content. You'll see more from there: take an extra card.",
    unlocks: { month: 7, day: 1 },
  },
  {
    id: "tarot-death",
    name: "Death",
    number: 13,
    artId: "tarot-death",
    omen: { kind: "pawnbrokerDiscount", percent: 25 },
    line: "Not what you think. Something ends, so something else can start. Prices are down.",
    unlocks: { month: 9, day: 1 },
  },
  {
    id: "tarot-temperance",
    name: "Temperance",
    number: 14,
    artId: "tarot-temperance",
    omen: { kind: "tinkerFree" },
    line: "A little of this, a little of that. The Tinker won't charge.",
    unlocks: { month: 5, day: 1 },
  },
  {
    id: "tarot-the-devil",
    name: "The Devil",
    number: 15,
    artId: "tarot-the-devil",
    omen: { kind: "barBetInsurance" },
    line: "Chains you could slip any time. Bet freely: your first loss comes home.",
    unlocks: { month: 2, day: 1 },
  },
  {
    id: "tarot-the-tower",
    name: "The Tower",
    number: 16,
    artId: "tarot-the-tower",
    omen: { kind: "wildcard" },
    line: "Everything shaken loose. Let's see what falls out.",
    unlocks: { month: 4, day: 1 },
  },
  {
    id: "tarot-the-star",
    name: "The Star",
    number: 17,
    artId: "tarot-the-star",
    omen: { kind: "lostAndFoundExtra" },
    line: "After the storm, a little light. Two things in the box today.",
    unlocks: { month: 1, day: 1 },
  },
  {
    id: "tarot-the-moon",
    name: "The Moon",
    number: 18,
    artId: "tarot-the-moon",
    omen: { kind: "lostAndFoundUpgrade" },
    line: "Two towers, one road, and a dog and a wolf who can't agree. The box has something odd in it.",
    unlocks: { month: 7, day: 1 },
  },
  {
    id: "tarot-the-sun",
    name: "The Sun",
    number: 19,
    artId: "tarot-the-sun",
    omen: { kind: "checksNow", amount: 15 },
    line: "A child on a white horse and nothing at all to worry about. Here.",
    unlocks: { month: 6, day: 1 },
  },
  {
    id: "tarot-judgement",
    name: "Judgement",
    number: 20,
    artId: "tarot-judgement",
    omen: { kind: "checksNow", amount: 20 },
    line: "A trumpet, and everyone sits up. Your year's been counted, and it came out well.",
    unlocks: { month: 9, day: 1 },
  },
  {
    id: "tarot-the-world",
    name: "The World",
    number: 21,
    artId: "tarot-the-world",
    omen: { kind: "checksPerWin", amount: 5 },
    line: "The dance is finished and the wreath is yours. Every win pays well today.",
    unlocks: { month: 6, day: 1 },
  },
];

export const TAROT_BY_ID: ReadonlyMap<string, TarotArcana> = new Map(TAROT.map((a) => [a.id, a]));
