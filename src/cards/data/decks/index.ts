// Every complete, legal deck authored so far (plan step 1.5): the starter
// deck, the House deck, all four Regulars (design.md §9.1), all four
// Seasoned (§9.2), and all six Legends (§9.3).

import { starterDeck } from "./starterDeck.ts";
import { houseDeck } from "./houseDeck.ts";
import { muddsDeck } from "./mudd.ts";
import { nellsDeck } from "./nellAshby.ts";
import { regsDeck } from "./regFarrow.ts";
import { hollisDeck } from "./prudenceHollis.ts";
import { bucketsDeck } from "./bucket.ts";
import { lovelacesDeck } from "./lovelace.ts";
import { adlersDeck } from "./adler.ts";
import { dickensDeck } from "./dickens.ts";
import { holmesDeck } from "./holmes.ts";
import { moriartysDeck } from "./moriarty.ts";
import { christiesDeck } from "./christie.ts";
import { poirotsDeck } from "./poirot.ts";
import { jekyllsDeck } from "./jekyll.ts";
import { shelleysDeck } from "./shelley.ts";
import type { Deck } from "../../cardTypes.ts";

export * from "./starterDeck.ts";
export * from "./houseDeck.ts";
export * from "./mudd.ts";
export * from "./nellAshby.ts";
export * from "./regFarrow.ts";
export * from "./prudenceHollis.ts";
export * from "./bucket.ts";
export * from "./lovelace.ts";
export * from "./adler.ts";
export * from "./dickens.ts";
export * from "./holmes.ts";
export * from "./moriarty.ts";
export * from "./christie.ts";
export * from "./poirot.ts";
export * from "./jekyll.ts";
export * from "./shelley.ts";

export const KNOWN_DECKS: { name: string; deck: Deck }[] = [
  { name: "Starter (Village Constable)", deck: starterDeck },
  { name: "House (Sir Charles)", deck: houseDeck },
  { name: "Constable Tobias Mudd", deck: muddsDeck },
  { name: "Old Nell Ashby", deck: nellsDeck },
  { name: '"Dodgy" Reg Farrow', deck: regsDeck },
  { name: "Miss Prudence Hollis", deck: hollisDeck },
  { name: "Inspector Bucket", deck: bucketsDeck },
  { name: "Ada Lovelace", deck: lovelacesDeck },
  { name: "Irene Adler", deck: adlersDeck },
  { name: "Charles Dickens", deck: dickensDeck },
  { name: "Sherlock Holmes", deck: holmesDeck },
  { name: "Professor Moriarty", deck: moriartysDeck },
  { name: "Agatha Christie", deck: christiesDeck },
  { name: "Hercule Poirot", deck: poirotsDeck },
  { name: "Dr Jekyll / Mr Hyde", deck: jekyllsDeck },
  { name: "Mary Shelley", deck: shelleysDeck },
];

/** Regular-tier decks (design.md §9.1), for the starter-vs-Regular check (§12.2). */
export const REGULAR_DECK_NAMES = ["Constable Tobias Mudd", "Old Nell Ashby", '"Dodgy" Reg Farrow', "Miss Prudence Hollis"];

/** Seasoned-tier decks (design.md §9.2). */
export const SEASONED_DECK_NAMES = ["Inspector Bucket", "Ada Lovelace", "Irene Adler", "Charles Dickens"];

/** Legend-tier decks (design.md §9.3). */
export const LEGEND_DECK_NAMES = [
  "Sherlock Holmes",
  "Professor Moriarty",
  "Agatha Christie",
  "Hercule Poirot",
  "Dr Jekyll / Mr Hyde",
  "Mary Shelley",
];
