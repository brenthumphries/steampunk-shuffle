// The tutorial's forced decks and beer-mat script (plan step 2.7, design.md
// §13.2 verbatim). "Forced draws are a deck-order override, not special
// cards" (design.md §16) — these are ordinary Deck values built from the
// same starter/House cards used elsewhere, just reordered (and, for the
// player, trimmed to only the cards the script ever draws — createMatch
// doesn't require a full 20-card deck, and every card the real starter deck
// contributes beyond these 12 would only ever sit unseen at the bottom of
// the deck anyway).
//
// Deck order here fixes exactly what `drawCards` (src/engine/matchEngine.ts)
// pulls: the opening 5-card hand is positions 0-4, Police Whistle's On Play
// draw pulls whatever's at the front of what's left, and each later round's
// "draw 3" pulls the next 3. Which *turn* plays which card doesn't depend on
// hand order (each scripted play names its card by id, not by position), so
// only draw order — not hand order — is load-bearing here.
//
// The house deck plays Boiler Hand twice (H2 in round 1, H3 in round 3, per
// the script below) — the only card this script needs two copies of. Two
// separate one-copy entries for the same card both get instanceId
// `B:boiler-hand#0` (src/engine/matchEngine.ts's `expandDeck` numbers copies
// per-entry, not per-deck) — a collision, but a harmless one: the first
// copy is played and swept into discard during round 1's cleanup long
// before the second is even drawn (round 3's start-of-round draw), so the
// two never coexist in the same hand/board for `playTurn`'s instanceId
// lookup to have to disambiguate.

import type { Card, Deck } from "../cards/cardTypes.ts";
import {
  constableOnTheBeat,
  nightWatchman,
  inspectorsWarrant,
  policeWhistle,
  charlotte,
} from "../cards/data/families/yard.ts";
import { parlourGuest, amateurSleuth, bramwell, seance } from "../cards/data/families/salon.ts";
import { theParsonageSnug } from "../cards/data/locations.ts";
import { hiawatha } from "../cards/data/families/irregulars.ts";
import { emily } from "../cards/data/families/rookery.ts";
import {
  apprenticeFitter,
  boilerHand,
  riveter,
  brassCog,
  steamHammer,
  foremanGudgeon,
  differenceEngine,
  sabotage,
} from "../cards/data/families/foundry.ts";
import { theConcertinaWorks } from "../cards/data/locations.ts";
import { lineFitter } from "../cards/data/decks/houseDeck.ts";
import type { PlayerId } from "../engine/matchEngine.ts";

function oneEach(cards: Card[]): Deck {
  return cards.map((card) => ({ card, quantity: 1 }));
}

/** The player's forced draws (design.md §13.2): opening hand, then Whistle draws Bramwell, then rounds 2/3's draws. */
export const TUTORIAL_PLAYER_DECK: Deck = oneEach([
  constableOnTheBeat,
  nightWatchman,
  parlourGuest,
  policeWhistle,
  inspectorsWarrant,
  bramwell,
  amateurSleuth,
  charlotte,
  seance,
  theParsonageSnug,
  hiawatha,
  emily,
]);

/** Sir Charles's forced draws: opening hand (3 played, 2 unused fillers), then rounds 2/3's draws. */
export const TUTORIAL_HOUSE_DECK: Deck = oneEach([
  apprenticeFitter,
  boilerHand,
  brassCog,
  lineFitter,
  theConcertinaWorks,
  foremanGudgeon,
  steamHammer,
  differenceEngine,
  riveter,
  sabotage,
  boilerHand,
]);

export const TUTORIAL_PLAYER: PlayerId = "A";
export const TUTORIAL_HOUSE: PlayerId = "B";

export interface ScriptedTurn {
  side: PlayerId;
  cardId: string;
  mat: string;
}

export const TUTORIAL_BEFORE_DEAL: string[] = [
  "Evening. I'm Wheatstone. This is the Bridge. You'll want a drink and a deck, and I've only got one of those licensed, so — deck. Sit anywhere. Not there. That's Charlotte's.",
  "Best of three rounds. Three cards each a round. Most points on the table takes the round. That's the whole of it, really. The rest is people being clever.",
];

/** All 18 turns of the match, in play order (design.md §13.2's tables). */
export const TUTORIAL_TURNS: ScriptedTurn[] = [
  // Round 1 (house leads)
  { side: "B", cardId: "apprentice-fitter", mat: "I go first. House leads, the first time. That's two points, there, on my side." },
  { side: "A", cardId: "constable-on-the-beat", mat: "Three. Three beats two. You're ahead. Enjoy it." },
  { side: "B", cardId: "boiler-hand", mat: "Five to three." },
  { side: "A", cardId: "night-watchman", mat: "Eight. Big cards are big. They are also, you'll notice, all you've got in that hand that's big." },
  { side: "B", cardId: "brass-cog", mat: "One point. But look — Persist. He stays on the table when the round ends. Most cards don't. Remember him." },
  { side: "A", cardId: "police-whistle", mat: "Nine to six. And the whistle fetched you a card. Small cards that do something. That's the Bridge's game." },
  // Round 2 (house leads — he lost round 1)
  { side: "B", cardId: "foreman-gudgeon", mat: "Six on my side already, with the cog. This is what Persist is for." },
  {
    side: "A",
    cardId: "inspectors-warrant",
    mat: "A Flip. Turn a card of mine face-down. It's worth nothing now and does nothing, and it'll be swept at the end of the round, Persist or no. The warrant says 'three or less' — the cog's a one. Nicked.",
  },
  { side: "B", cardId: "steam-hammer", mat: "Nine. Sorry." },
  { side: "A", cardId: "parlour-guest", mat: "Friend. She's worth more with company. No company yet. Two." },
  { side: "B", cardId: "difference-engine", mat: "Fifteen. I did say sorry." },
  { side: "A", cardId: "amateur-sleuth", mat: "Now they've got each other. Three and four — seven. Not fifteen. But you see how it works." },
  // Round 3 (player leads — lost round 2)
  { side: "A", cardId: "bramwell", mat: "You lead. Bramwell. He's louder with company. Two, for now." },
  { side: "B", cardId: "riveter", mat: "Three." },
  { side: "A", cardId: "charlotte", mat: "There's the company. Four and three — seven to three. She Persists, too, not that it'll matter if you finish this." },
  {
    side: "B",
    cardId: "sabotage",
    mat: "…Sorry. Habit. She's face-down — Sabotage only reaches three, and she was three. Bramwell's alone again. Two to three.",
  },
  { side: "A", cardId: "seance", mat: "Turn her back over. Everything she was, she is again. Seven to three." },
  { side: "B", cardId: "boiler-hand", mat: "Six. Seven beats six." },
];

export const TUTORIAL_ROUND_END_MATS: Partial<Record<number, string>> = {
  1: "Round's yours. First to two. Sit tight while I clear the table. Not the cog. The cog stays.",
  2: "One round each. Round two is where the house shows its hand. Round three is where you show yours.",
};

export const TUTORIAL_MATCH_END_MAT =
  "Table's yours. Two rounds to one. …That's the first one I've lost in a while, actually. Take the deck. It was always going to be yours.";

export const TUTORIAL_REWARD_CHECKS = 10;

// PT-31: Checks were never introduced in-fiction — the first mention was
// this deck reward's own cold "and 10 Checks," with no explanation until
// House Rules. One line here does it.
export const TUTORIAL_AFTER_MAT =
  "Checks. The pub's coin. The back room takes them. The others'll play you now. Mudd's the easy one. Don't tell him I said so.";
