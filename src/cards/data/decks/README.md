# Decks (plan step 1.5)

| Deck | File | Family | Status |
|---|---|---|---|
| Village Constable (starter) | `starterDeck.ts` | Yard + Salon | done, tutorial-locked |
| House (Sir Charles) | `houseDeck.ts` | Foundry | done |
| Constable Tobias Mudd | `mudd.ts` | Yard | done |
| Old Nell Ashby | `nellAshby.ts` | Irregulars | done |
| "Dodgy" Reg Farrow | `regFarrow.ts` | Rookery | done |
| Miss Prudence Hollis | `prudenceHollis.ts` | Salon | done |
| Inspector Bucket | — | Yard + Irregulars | **not authored** |
| Ada Lovelace | — | Foundry | **not authored** |
| Irene Adler | — | Rookery + Irregulars | **not authored** |
| Charles Dickens | — | Salon | **not authored** |
| Sherlock Holmes | — | Irregulars + Yard | **not authored** |
| Professor Moriarty | — | Rookery + Foundry | **not authored** |
| Agatha Christie | — | Salon | **not authored** |
| Hercule Poirot | — | Yard + Salon | **not authored** |
| Dr Jekyll / Mr Hyde | — | Salon / Rookery | **not authored** |
| Mary Shelley | — | Foundry | **not authored** |

Every deck here is a real, legal 20-card / ≤60-point deck (`validateDeck`
passes), built from the family's 9 v1 cards at up to 2 copies plus one
plain deck-filler Character (needed because 9 unique cards × 2 copies caps
at 18, two short of 20 — see `houseDeck.ts`'s comment). Filler cards
(`lineFitter`, `beatPartner`, `streetSweeper`, `errandRunner`,
`churchFeteStall`) are deck-local, not part of the labeled 60
(`../README.md`).

The four Regulars' decks exist because `tools/sim.ts` needs at least one
real Regular-tier deck to measure design.md §12.2's starter-vs-Regular win
rate (previously reported as "not yet measurable" in `docs/balance.md`).
Seasoned and Legend decks are the natural next increment — their reward
cards (Bucket's Forefinger, The Analytical Engine, The Photograph, Next
Instalment) and unique Locations (`The Reichenbach Falls`, `The Overnight
Express`, already in `../locations.ts`) aren't wired into a deck yet.
`ss-card-author`'s "Deck mode" procedure covers building one.
