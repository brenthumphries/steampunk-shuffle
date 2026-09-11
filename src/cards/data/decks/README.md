# Decks (plan step 1.5)

| Deck | File | Family | Status |
|---|---|---|---|
| Village Constable (starter) | `starterDeck.ts` | Yard + Salon | done, tutorial-locked |
| House (Sir Charles) | `houseDeck.ts` | Foundry | done |
| Constable Tobias Mudd | `mudd.ts` | Yard | done |
| Old Nell Ashby | `nellAshby.ts` | Irregulars | done |
| "Dodgy" Reg Farrow | `regFarrow.ts` | Rookery | done |
| Miss Prudence Hollis | `prudenceHollis.ts` | Salon | done |
| Inspector Bucket | `bucket.ts` | Yard + Irregulars | done |
| Ada Lovelace | `lovelace.ts` | Foundry | done |
| Irene Adler | `adler.ts` | Rookery + Irregulars | done |
| Charles Dickens | `dickens.ts` | Salon | done |
| Sherlock Holmes | `holmes.ts` | Irregulars + Yard | done |
| Professor Moriarty | `moriarty.ts` | Rookery + Foundry | done |
| Agatha Christie | `christie.ts` | Salon | done |
| Hercule Poirot | `poirot.ts` | Yard + Salon | done |
| Dr Jekyll / Mr Hyde | `jekyll.ts` | Salon / Rookery | done |
| Mary Shelley | `shelley.ts` | Foundry | done |

All 16 decks are real, legal 20-card / ≤60-point decks (`validateDeck`
passes — see `tests/unit/cards/dataSet.test.ts`), built from the relevant
family's/families' v1 cards at up to 2 copies, plus:

- **Plain deck-filler Characters** on the House deck and the four
  Regulars (`lineFitter`, `beatPartner`, `streetSweeper`, `errandRunner`,
  `churchFeteStall`) — needed because a single family's 9 unique cards ×2
  copies caps at 18, two short of 20. Deck-local, not part of the labeled
  60 (`../README.md`).
- **Seasoned reward cards** (`bucketsForefinger`, `theAnalyticalEngine`,
  `thePhotograph`, `nextInstalment`) and **Mary Shelley's two easter-egg
  extras** (`abbyNormal`, `eyeGor`) on their respective opponent's deck —
  design.md §8.1 only folds the *Regular*-tier reward cards into the
  family slices, so these are extras too, but they double as the
  opponent's actual reward card content from design.md §9.2/§9.3 rather
  than being generic filler.
- Each **Legend's own signature legendary card** (1 copy — the legality
  cap) and, where design.md names one, their unique **Location**
  (`theReichenbachFalls` for Moriarty, `theOvernightExpress` for
  Christie).

`Put the Candle Back` (Mary Shelley's deck, design.md §9.3/§15) is **not**
authored: its printed text needs a "whenever a card is played" trigger the
engine doesn't have (`../README.md`'s schema-gap list, #3/#6).

`tools/sim.ts` uses `REGULAR_DECK_NAMES`/`LEGEND_DECK_NAMES` (exported from
`index.ts`) to compute design.md §12.2's starter-vs-Regular and §9.3's
Legend-vs-starter win rates — see `docs/balance.md`.
