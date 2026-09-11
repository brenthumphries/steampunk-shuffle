// Every complete, legal deck authored so far (plan step 1.5). Seasoned and
// Legend opponent decks (design.md §9.2-§9.3) aren't built yet — see
// decks/README.md.

import { starterDeck } from "./starterDeck.ts";
import { houseDeck } from "./houseDeck.ts";
import { muddsDeck } from "./mudd.ts";
import { nellsDeck } from "./nellAshby.ts";
import { regsDeck } from "./regFarrow.ts";
import { hollisDeck } from "./prudenceHollis.ts";
import type { Deck } from "../../cardTypes.ts";

export * from "./starterDeck.ts";
export * from "./houseDeck.ts";
export * from "./mudd.ts";
export * from "./nellAshby.ts";
export * from "./regFarrow.ts";
export * from "./prudenceHollis.ts";

export const KNOWN_DECKS: { name: string; deck: Deck }[] = [
  { name: "Starter (Village Constable)", deck: starterDeck },
  { name: "House (Sir Charles)", deck: houseDeck },
  { name: "Constable Tobias Mudd", deck: muddsDeck },
  { name: "Old Nell Ashby", deck: nellsDeck },
  { name: '"Dodgy" Reg Farrow', deck: regsDeck },
  { name: "Miss Prudence Hollis", deck: hollisDeck },
];
