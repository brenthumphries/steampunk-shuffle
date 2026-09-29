# Seasonal Events Plan: Hallowe'en at the Bridge

**Status:** draft for Brent's approval, 2026-09-26. Items marked ★ are product decisions for Brent.
**Scope:** a reusable seasonal-event layer (date windows that gate opponents, cards, tournaments and pub dressing), with Hallowe'en as the only authored event for now.
**Brent's answers (Sep 26):** give her the October update early, before the birthday · build the system now, write only the Hallowe'en content · limited cards stay owned and playable all year · 5 monsters and 2 new keywords.

---

## 1. Constraints this plan works around

- **The birthday comes first.** TestFlight delivery for Oct 30 takes priority over everything here. If any step below puts that at risk, cut Wave 2 down to fewer monsters. Don't slip the birthday build.
- **This event only matters if she has the game in October.** It has to be live on whatever build she is playing (the PWA or an early TestFlight build) by **Oct 1**, which is 5 days away. That's why the content arrives in waves (§3): Wave 1 needs no engine changes.
- **Everything is gated by date in data, not by shipping.** All content goes out in the build with start and end dates attached, and the game decides from the phone's local clock. Missing a date only makes that content arrive late. Nothing breaks.
- **★ The dedication screen.** It shows on first launch (design.md §14.1). If she first opens the game in early October, she sees the birthday dedication weeks early. Options: (a) let it show early; (b) gate it to show on the first launch on or after Oct 30 (recommended; a one-line check against `checkInvitationalTrigger`'s date logic).
- **No new spending.** Art comes from Gemini (Nano Banana) prompts that Brent pastes in. Code runs on Claude Code using the plan §2 model ladder.

## 2. The event layer (generic, reusable)

The new module `src/events/` holds a registry of `SeasonalEvent` records. It is pure data plus pure date predicates, following the same registry/persistence split as `src/pub/opponents.ts` and `src/tournaments/tournaments.ts`.

```ts
interface SeasonalEvent {
  id: string;                       // "halloween"
  name: string;                     // "Hallowe'en at the Bridge"
  window: { start: MonthDay; end: MonthDay };   // recurs every year, local time, end inclusive
  visitors: { opponentId: string; arrives: MonthDay }[];   // staggered arrivals inside the window
  tournaments: TournamentId[];      // opens only while the event is live (each may narrow its own sub-window)
  cardPool: string[];               // card ids added to Lost & Found / Pawnbroker rolls only while the event is live
  minWins: number;                  // visitors hide below this total (sir Charles hints instead)
  dressing: { taproomArtId?: string; sirCharlesLines: string[] };
}
```

Rules (these become design.md §17):
1. `activeEvents(date)` and `isEventLive(id, date)` are the only date checks. Everything else asks them.
2. **Visitor opponents** are a new tier, `"visitor"`. They use the `seasoned` AI dial and pay Seasoned Checks (15 per win), they are exempt from the Legends-in-town rotation, and they appear in Tonight's Patrons from their `arrives` date to the window's end, once the player has `minWins`. A first win pays their reward card as usual.
3. **Owned cards are permanent.** Event cards stay in the collection and are legal in any deck all year. Once the window closes they drop out of the Lost & Found, Pawnbroker and bet pools. A card lost in a Bar Bet still reappears at the Pawnbroker at any time of year (nothing is lost for good, per design.md §11).
4. **Event tournaments** get `isUnlocked(totalWins, invitationalTriggered, date)`, which adds the date to the current signature. They also get an optional `houseLocationId`, a Location placed in the shared slot at the start of every match in that tournament (a new `createMatch` option). If the window closes while a bracket is in progress, that bracket can still be finished; it just can't be entered again.
5. **Pub dressing:** while an event is live, the hub swaps in its taproom art and adds its lines to Sir Charles's pool.
6. **Dev clock:** a `?now=YYYY-MM-DD` query parameter overrides "today" in dev and preview builds, so Brent can check any date on his phone. It is stripped from, or ignored by, the build she plays.

## 3. Hallowe'en content

**Window: Oct 1 – Oct 31.** Visitors appear from **3 wins**; before that, Sir Charles says: *"Odd folk on the cellar stairs this month. Win a few hands first, and I'll introduce you."*

All five monsters come from public-domain sources and are designed to avoid the protected film looks: no flat-topped head, neck bolts or green skin; no widow's peak with a medallion; no names from the Universal films.

| Wave | Arrives | Visitor | Family | Source (public domain) | Signature card (legendary, reward on first win) | New engine? |
|---|---|---|---|---|---|---|
| 1 | **Oct 1** | **Mr Griffin, the Unseen** | Irregulars | Wells, *The Invisible Man* (1897) | *Mr Griffin*: 3 pts. Elusive. Return. On Play: return an opposing face-up card worth 2 or less to its owner's hand. | no |
| 1 | **Oct 1** | **The Clockwork Pharaoh** | Salon | British Museum Egyptomania; mummy folklore | *The Clockwork Pharaoh*: 4 pts. Persist. At end of round: Flip the opposing card with the most effective points. *(The curse falls on whatever you meant to keep.)* | no |
| 2 | **Oct 15** | **The Carpathian Count** | Rookery | Stoker, *Dracula* (1897) | *The Count*: 4 pts. **Undying**. On Play: Flip an opposing card worth 3 or less. | Undying |
| 2 | **Oct 15** | **The Hampstead Wolf** | Yard | werewolf folklore | *The Gentleman of the Heath*: 2 pts. Elusive. **Moonrise +4**. *(A mild 2 until the last round, then a 6.)* | Moonrise |
| 2 | **Oct 15** | **The Galvanic Creature** | Foundry | Shelley, *Frankenstein* (1818) | *The Creature*: 6 pts. **Undying**. No other text. *(He keeps coming back.)* | Undying |

Opponent lines (drafts; `ss-card-author` can polish them):
- Griffin: *"Don't mind me. Nobody ever does."*
- Pharaoh: *"Three thousand years in a glass case. Deal."*
- Count: *"Such a charming establishment. Do invite me in."*
- Wolf: *"Is it a full moon? I never check."*
- Creature: *"She made me. She did not make me welcome."* Also a pair of cross-lines: in the event, Mary Shelley's pickup line becomes *"Oh. You've met him."*

### 3.1 The two new keywords (design.md §5.14, §5.15)

- **Undying** — *(If this is face-down at the end of the round, it goes back to your hand instead of the discard.)* It is the answer to Flip: Return only works on face-up cards, and Undying only works on face-down ones. If a card has both, Return applies while it is face-up and Undying while it is face-down. Resolved in end-of-round cleanup, not as a trigger, so it fits §5.13's "no new trigger kinds."
- **Moonrise +N** — *(Worth N more in the final round.)* A continuous modifier read in `effectivePoints()` from `state.round`, written like Friend +N. The "final round" is round 3, or whichever round decides the match if the engine can end one early. Check this against §6.3.

The AI has to understand both: Moonrise cards are worth more held for the last round, and Undying cards are low-risk targets to commit into Flip-heavy boards. Treat this as evaluator nudges, following CLAUDE.md's "nudge, don't override" gotcha.

### 3.2 The Nightfall set (8 event cards, obtainable only during October)

Proposed. `ss-card-author` checks each against its family's points curve.

| Card | Family · type · rarity | Pts | Text |
|---|---|---|---|
| Turnip Lantern | neutral · gadget · C | 1 | On Play: Draw 1. *(Victorian Britain carved turnips, not pumpkins.)* |
| Grave Robber | Rookery · character · C | 2 | Undying. |
| Resurrection Man | Rookery · character · U | 3 | On Play: turn one of your face-down cards face-up. |
| Night Constable | Yard · character · C | 2 | Moonrise +2. |
| Lamplighter at Dusk | Irregulars · character · C | 1 | Elusive. Moonrise +2. |
| Spirit Photograph | Salon · scheme · U | 0 | Turn up to two of your face-down Friend cards face-up. |
| Galvanic Battery | Foundry · gadget · U | 2 | Undying. |
| The Witching Hour | neutral · location · R | 0 | At end of round, each player returns their lowest face-up card to hand. |

Wave 1 ships only the cards that need no new keywords (Turnip Lantern, Resurrection Man, Spirit Photograph, The Witching Hour). The rest ship with Wave 2. Each visitor's deck is 20 cards built from their family plus Nightfall cards. Their Bar Bet pools draw from the Nightfall set.

### 3.3 The Hallowe'en tournament: *The All Hallows' Wake*

| Field | Value |
|---|---|
| When | **Oct 22 – Oct 31** (★ alternative: all of October, with the field filled out by Seasoned opponents until Wave 2 arrives) |
| Unlock | event live and 3 or more wins |
| Field | the 5 visitors + **Spring-Heeled Jack** (legend dial; appears only in this tournament) + 1 random Seasoned |
| Entry rule | any legal deck |
| House Location | *The Witching Hour* is in the shared slot at the start of every match (a player can still replace it) |
| Entry | 13 Checks |
| Prize | *Spring-Heeled Jack* (legendary Rookery, 3 pts, Elusive, Return, On Play: Flip an opposing card worth 2 or less) + 150 Checks |
| Consolation | 13 Checks |

Spring-Heeled Jack is real London Victorian folklore (sightings from 1837 into the 1870s), and his spring-heeled boots are already steampunk.

### 3.4 Pub dressing

- A variant of the taproom background with carved turnip lanterns along the bar, candle smoke, a crescent moon through the fogged windows, and the cats in their usual places (no costumes).
- New Sir Charles lines, e.g. *"The cellar door's been busy. I've stopped asking who's knocking."*

## 4. Schedule and routing

| # | Step | Surface · model | Needs | Target |
|---|---|---|---|---|
| A | Event layer, dev clock, design.md §17, dedication gate ★ | Claude Code · **Sonnet** | — | **Sep 29** |
| G1 | Gemini art: Wave 1 (2 portraits, 2 signatures, taproom variant) | Brent · Gemini | — | Sep 27–29 |
| B | Wave 1 content: Griffin, Pharaoh, 4 Nightfall cards, decks, balance | Claude Code · **Haiku** (`ss-card-author`) | A | **Sep 30**, then ship (Build 1) |
| C | Engine: Undying and Moonrise, AI evaluator, reminder text | Claude Code · **Sonnet** | A | Oct 6 |
| G2 | Gemini art: Wave 2 (3 portraits, 3 signatures, Spring-Heeled Jack) | Brent · Gemini | — | by Oct 8 |
| D | Wave 2 content: Count, Wolf, Creature, 4 more Nightfall cards | Claude Code · **Haiku** | C | Oct 10 |
| E | The All Hallows' Wake tournament + house Location option | Claude Code · **Haiku** | A, D | Oct 12, then ship (Build 2) |
| F | `ss-art-prompts` sheet 7 for the 8 Nightfall cards | Claude Code · **Haiku** | B, D | after D |

Escalation follows plan §2: move up one tier only after a step fails its exit check twice. Builds 1 and 2 go out through `ss-ship`, which Brent runs. If she is on TestFlight rather than the PWA, each build also needs a TestFlight upload.

## 5. Exit checks

- With `?now=` set to Sep 30, Oct 1, Oct 15, Oct 22, Oct 31 and Nov 1, the right visitors, tournament and dressing appear or disappear. Covered by unit tests and one e2e test.
- Event cards owned before Nov 1 are still in the collection and still legal in the deck builder after Nov 1.
- `npm run curve -- seasoned seasoned 200`: the starter deck wins roughly 40–50% against each visitor, which is Seasoned-tier intent (§9.2).
- Undying and Moonrise have engine unit tests, a property test that runs to completion, and AI win rates that don't regress in `npm run sim`.
- `npm run typecheck && npm test` pass, and CI e2e is green on all four browsers.
