// Resolves a tournament's `houseLocationId` (seasonal-events-plan.md §2 rule
// 4) to the Location card to seed into every match's shared slot. The engine
// has no card registry by design (createMatch takes the card itself), so this
// is where the id becomes a card. An id that isn't a real Location resolves
// to nothing, and the match simply starts with an empty slot.

import type { Card } from "../cards/cardTypes.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../pub/acquirableCards.ts";
import type { Tournament } from "./tournaments.ts";

export function resolveHouseLocation(tournament: Tournament): Card | undefined {
  if (!tournament.houseLocationId) return undefined;
  const card = ACQUIRABLE_CARDS_BY_ID.get(tournament.houseLocationId);
  return card?.faces[0].type === "location" ? card : undefined;
}
