// The Village Constable — the tutorial-locked starter deck (design.md
// §8.3). Canonical definition lives in src/cards/data/ (plan step 1.5);
// re-exported here since it's the engine/AI/card test suites' canonical
// legal fixture (20 cards, 37 printed points).

import type { Card } from "../../../../src/cards/cardTypes.ts";
import {
  constableOnTheBeat,
  nightWatchman,
  sergeantPike,
  inspectorsWarrant,
  policeWhistle,
  charlotte,
} from "../../../../src/cards/data/families/yard.ts";
import {
  parlourGuest,
  amateurSleuth,
  bramwell,
  seance,
  afternoonTea,
} from "../../../../src/cards/data/families/salon.ts";
import { theParsonageSnug } from "../../../../src/cards/data/locations.ts";
import { hiawatha } from "../../../../src/cards/data/families/irregulars.ts";
import { emily } from "../../../../src/cards/data/families/rookery.ts";
import { starterDeck } from "../../../../src/cards/data/decks/starterDeck.ts";

export {
  constableOnTheBeat,
  nightWatchman,
  sergeantPike,
  inspectorsWarrant,
  policeWhistle,
  charlotte,
  parlourGuest,
  amateurSleuth,
  bramwell,
  seance,
  afternoonTea,
  theParsonageSnug,
  hiawatha,
  emily,
  starterDeck,
};

export const starterDeckCards: Card[] = [
  constableOnTheBeat,
  nightWatchman,
  sergeantPike,
  inspectorsWarrant,
  policeWhistle,
  charlotte,
  parlourGuest,
  amateurSleuth,
  bramwell,
  seance,
  afternoonTea,
  theParsonageSnug,
  hiawatha,
  emily,
];
